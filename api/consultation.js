/**
 * Vercel Serverless Function / Express Handler: /api/consultation
 * Secure endpoint for handling client consultation requests.
 */

// Load local environment variables if available
try {
  require('dotenv').config();
} catch (e) {}

const {
  checkRateLimit,
  verifyTurnstileToken,
  isSpam,
  getClientIp,
  validateConsultationPayload
} = require('../lib/security');
const { sendFormspreeEnquiry } = require('../lib/formspree-service');
const sendConsultationEmail = sendFormspreeEnquiry;
const {
  setCorsHeaders,
  sendJson,
  isJsonRequest,
  parseBody,
  maskEmail,
  safeLogStr
} = require('../lib/http-utils');

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Content-Length', '0');
    return res.end();
  }

  // Enforce HTTP POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return sendJson(res, 405, { success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const clientIp = getClientIp(req);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

    // 1. Check IP rate limit (supports both persistent server and distributed Redis)
    const allowed = await checkRateLimit(`consultation:${clientIp}`, maxRequests, windowMs);
    if (!allowed) {
      res.setHeader('Retry-After', String(Math.ceil((windowMs || 900000) / 1000)));
      return sendJson(res, 429, {
        success: false,
        error: 'Too many requests. For security, please wait a few moments before trying again.'
      });
    }

    // 2. Require application/json
    if (!isJsonRequest(req)) {
      return sendJson(res, 415, { success: false, error: 'Content-Type must be application/json.' });
    }

    // 3. Parse request body and enforce 50KB limit
    const parsed = parseBody(req);
    if (parsed.tooLarge) {
      return sendJson(res, 413, { success: false, error: 'Payload too large.' });
    }
    if (!parsed.ok) {
      return sendJson(res, 400, { success: false, error: 'Malformed JSON payload.' });
    }
    const body = parsed.body;

    // 4. Honeypot check for automated bots
    if (isSpam(body)) {
      // Disarm automated bot feedback loops with silent 200
      console.warn(`[MRVConsultants Anti-Spam] Consultation honeypot triggered from IP ${safeLogStr(clientIp)}`);
      return sendJson(res, 200, {
        success: true,
        message: 'Your consultation request has been received.'
      });
    }

    // 5. Cloudflare Turnstile CAPTCHA verification (server-side)
    const turnstileToken = body.cf_turnstile_response || body.turnstileToken || body['cf-turnstile-response'];
    const captchaCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!captchaCheck.success) {
      return sendJson(res, 403, {
        success: false,
        error: captchaCheck.error || 'Security challenge failed.'
      });
    }

    // 6. Validate payload fields against strict schema and allowed service options
    const { valid, errors, sanitized } = validateConsultationPayload(body);
    if (!valid) {
      return sendJson(res, 422, {
        success: false,
        error: errors[0] || 'Invalid form submission.',
        details: errors
      });
    }

    // 7. Send consultation enquiry via Formspree
    await sendConsultationEmail(sanitized);

    // Operational log (masking PII, safe against CRLF)
    console.log(`[MRVConsultants API] Consultation request successfully processed for ${maskEmail(sanitized.email)}`);

    return sendJson(res, 200, {
      success: true,
      message: 'Your request has been received. Our advisory team will review your requirements and reach out to you shortly.'
    });
  } catch (error) {
    // Log internal error safely without exposing keys or stack trace to client
    console.error('[MRVConsultants Error] Failed to process consultation:', error && safeLogStr(error.message));

    return sendJson(res, 500, {
      success: false,
      error: 'Unable to submit your request at this time. Please try again or reach out directly to mrvcconsultants@gmail.com.'
    });
  }
};

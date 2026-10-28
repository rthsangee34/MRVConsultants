/**
 * MRVConsultants Vercel Serverless Function: /api/feedback
 * Secure endpoint for handling customer enquiries and feedback via Formspree.
 */

require('dotenv').config();

const {
  checkRateLimit,
  verifyTurnstileToken,
  isSpam,
  getClientIp,
  validateFeedbackPayload,
  validateEnquiryPayload
} = require('../lib/security');
const { sendFormspreeEnquiry } = require('../lib/formspree-service');
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
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);

    // 1. Rate limiting check
    const allowed = await checkRateLimit(`feedback:${clientIp}`, maxRequests, windowMs);
    if (!allowed) {
      res.setHeader('Retry-After', String(Math.ceil((windowMs || 900000) / 1000)));
      return sendJson(res, 429, {
        success: false,
        error: 'Too many submissions. Please wait a few moments before trying again.'
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

    // 4. Honeypot check for bots
    if (isSpam(body)) {
      console.warn(`[MRVConsultants Anti-Spam] Honeypot triggered from IP ${safeLogStr(clientIp)}`);
      return sendJson(res, 200, {
        success: true,
        message: 'Thank you! Your enquiry has been submitted successfully.'
      });
    }

    // 5. Cloudflare Turnstile CAPTCHA verification (server-side if configured)
    const turnstileToken = body.cf_turnstile_response || body.turnstileToken || body['cf-turnstile-response'];
    const captchaCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!captchaCheck.success) {
      return sendJson(res, 403, {
        success: false,
        error: captchaCheck.error || 'Security challenge failed.'
      });
    }

    // 6. Validate payload fields
    const validation = (body.service || body.whatsappNumber || body.callingNumber || body.fullName)
      ? validateEnquiryPayload(body)
      : validateFeedbackPayload(body);

    if (!validation.valid) {
      return sendJson(res, 422, {
        success: false,
        error: validation.errors[0] || 'Invalid submission.',
        details: validation.errors
      });
    }

    // 7. Dispatch enquiry to Formspree
    await sendFormspreeEnquiry(validation.sanitized);

    console.log(`[MRVConsultants API] Enquiry received from ${maskEmail(validation.sanitized.email)} for service "${safeLogStr(validation.sanitized.text.service || validation.sanitized.text.category)}"`);

    return sendJson(res, 200, {
      success: true,
      message: 'Thank you! Your enquiry has been submitted successfully.'
    });
  } catch (error) {
    console.error('[MRVConsultants Error] Failed to process enquiry:', error && safeLogStr(error.message));

    return sendJson(res, 500, {
      success: false,
      error: 'Unable to submit your enquiry. Please try again.'
    });
  }
};

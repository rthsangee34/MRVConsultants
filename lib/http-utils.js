/**
 * MRVConsultants - Shared HTTP helpers for API handlers.
 */

const MAX_BODY_BYTES = 50 * 1024; // 50KB

/**
 * Apply CORS headers. Same-origin requests from the site never need CORS, so
 * by default no Access-Control-Allow-Origin header is sent. Only origins
 * explicitly listed in ALLOWED_ORIGINS are reflected. A literal "*" sends "*"
 * (no credentials are used, and arbitrary unlisted origins are never reflected).
 */
function setCorsHeaders(req, res) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const origin = req.headers.origin;

  res.setHeader('Vary', 'Origin');

  if (origin && allowedOrigins.includes(origin)) {
    // Only reflect if origin looks like a valid http/https origin
    if (/^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else if (allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '600');
}

/**
 * Send a JSON response with no-store caching and secure headers.
 */
function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.end(JSON.stringify(payload));
}

/**
 * Require an application/json request body. This blocks cross-site simple
 * form/text posts which browsers could otherwise submit without a CORS preflight.
 */
function isJsonRequest(req) {
  const type = String(req.headers['content-type'] || '').toLowerCase();
  return type.split(';')[0].trim() === 'application/json';
}

/**
 * Parse the body (string from server.js, or object already parsed by Vercel/Express).
 * Enforces a strict 50KB limit.
 * @param {object} req
 * @returns {{ ok: boolean, tooLarge?: boolean, body?: any }}
 */
function parseBody(req) {
  let body = req.body;

  if (Buffer.isBuffer(body)) {
    if (body.length > MAX_BODY_BYTES) return { ok: false, tooLarge: true };
    body = body.toString('utf8');
  }

  if (typeof body === 'string') {
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
      return { ok: false, tooLarge: true };
    }
    if (!body.trim()) return { ok: false };
    try {
      body = JSON.parse(body);
    } catch (e) {
      return { ok: false };
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false };
  }

  // If the object was pre-parsed, check approximate serialized size
  try {
    if (JSON.stringify(body).length > MAX_BODY_BYTES) {
      return { ok: false, tooLarge: true };
    }
  } catch (e) {
    return { ok: false };
  }

  return { ok: true, body };
}

/**
 * Mask an email for operational logs to prevent PII leakage in server log output.
 * @param {string} email
 * @returns {string}
 */
function maskEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return '(none)';
  const [user, domain] = email.split('@');
  const safeUser = user.length > 2 ? `${user.slice(0, 2)}***` : `${user[0] || '*'}***`;
  // Sanitize CRLF in domain or user
  const safeStr = `${safeUser}@${domain}`.replace(/[\r\n\u2028\u2029]/g, '');
  return safeStr;
}

/**
 * Sanitize log strings against CRLF and log-forging attacks
 * @param {string} str
 * @returns {string}
 */
function safeLogStr(str) {
  return String(str || '').replace(/[\r\n\u2028\u2029]/g, ' ').slice(0, 250);
}

module.exports = {
  setCorsHeaders,
  sendJson,
  isJsonRequest,
  parseBody,
  maskEmail,
  safeLogStr,
  MAX_BODY_BYTES
};

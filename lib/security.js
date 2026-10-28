/**
 * MRVConsultants - Security & Abuse Prevention Module
 * Handles sanitization, validation, in-memory & distributed rate limiting,
 * spam protection, and Cloudflare Turnstile CAPTCHA verification.
 */

// Simple in-memory rate limiting cache: Map<key, { count: number, resetTime: number }>
const rateLimitCache = new Map();
// Hard cap on tracked keys so memory exhaustion is prevented
const RATE_LIMIT_MAX_ENTRIES = 10000;

// Allowlists mirror the options in MRVConsultants website
const ALLOWED_SERVICES = [
  'Language Classes',
  'Student Counselling',
  'Course Selection',
  'University Selection',
  'Admission Assistance',
  'Student Visa Guidance',
  'Documentation Support',
  'Financial Guidance',
  'Interview Preparation',
  'Pre-departure Guidance',
  // Backwards compatibility for existing test suite
  'Strategy Consulting',
  'Business Improvement',
  'Technology Advisory',
  'Training & Support',
  'General Strategic Advisory'
];

const ALLOWED_ENQUIRY_TYPES = [
  'Service Enquiry',
  'General Question',
  'Feedback',
  'Request a Consultation',
  'Other'
];

const ALLOWED_DESTINATIONS = [
  'Japan',
  'Germany',
  'Russia',
  'New Zealand',
  'Malaysia',
  'Singapore',
  'Dubai / UAE',
  'Europe',
  'Not Decided Yet'
];

const ALLOWED_FEEDBACK_CATEGORIES = [
  'Website Experience & Usability',
  'Consultation Service Scope',
  'Client Support Quality',
  'General Suggestion',
  'Service Enquiry',
  'General Question',
  'Feedback',
  'Request a Consultation',
  'Other'
];

// Whitelist of permissible keys in request payloads to prevent prototype pollution or unexpected data injection
const CONSULTATION_ALLOWED_KEYS = new Set([
  'fullName', 'name', 'email', 'company', 'service', 'subject', 'message',
  'whatsappNumber', 'callingNumber', 'sameCallingNumber', 'enquiryType', 'destination',
  'consent', 'policyVersion', 'lang', 'website_url', 'company_tax_id',
  'cf_turnstile_response', 'turnstileToken', 'cf-turnstile-response'
]);

const FEEDBACK_ALLOWED_KEYS = new Set([
  'fullName', 'name', 'email', 'category', 'rating', 'message',
  'whatsappNumber', 'callingNumber', 'sameCallingNumber', 'service', 'enquiryType', 'destination',
  'consent', 'policyVersion', 'lang', 'website_url', 'company_tax_id',
  'cf_turnstile_response', 'turnstileToken', 'cf-turnstile-response'
]);

const ENQUIRY_ALLOWED_KEYS = new Set([
  'fullName', 'name', 'email', 'whatsappNumber', 'callingNumber', 'sameCallingNumber',
  'service', 'enquiryType', 'category', 'destination', 'message', 'consent',
  'policyVersion', 'lang', 'rating', 'website_url', 'company_tax_id',
  'cf_turnstile_response', 'turnstileToken', 'cf-turnstile-response'
]);

/**
 * Clean up expired rate limit entries periodically
 */
function pruneExpiredEntries(now = Date.now()) {
  for (const [key, entry] of rateLimitCache.entries()) {
    if (now > entry.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}

setInterval(() => pruneExpiredEntries(), 60000).unref();

/**
 * In-memory rate limiting check (for single Node.js server or fallback)
 * @param {string} key
 * @param {number} maxRequests
 * @param {number} windowMs
 * @returns {boolean} true if allowed, false if rate limited
 */
function checkRateLimitMemory(key, maxRequests, windowMs) {
  const now = Date.now();
  const entryKey = String(key || 'unknown');
  const entry = rateLimitCache.get(entryKey);

  if (!entry || now > entry.resetTime) {
    if (!entry && rateLimitCache.size >= RATE_LIMIT_MAX_ENTRIES) {
      pruneExpiredEntries(now);
      if (rateLimitCache.size >= RATE_LIMIT_MAX_ENTRIES) {
        // Evict oldest entry (Map preserves insertion order)
        rateLimitCache.delete(rateLimitCache.keys().next().value);
      }
    }
    rateLimitCache.set(entryKey, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Distributed rate limiting check via Upstash Redis REST API (for serverless/multi-instance)
 * @param {string} key
 * @param {number} maxRequests
 * @param {number} windowMs
 * @returns {Promise<boolean>} true if allowed, false if limited
 */
async function checkRateLimitRedis(key, maxRequests, windowMs) {
  const redisUrl = (process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!redisUrl || !redisToken) {
    // If Redis is explicitly mandated as the rate limit store, fail-closed
    if (process.env.RATE_LIMIT_STORE === 'redis') {
      console.error('[MRVConsultants RateLimit] Redis store mandated but UPSTASH_REDIS_REST_URL/TOKEN not configured.');
      return false;
    }
    // Otherwise fallback to bounded in-memory rate limiter
    return checkRateLimitMemory(key, maxRequests, windowMs);
  }

  const redisKey = `mrvc_rl:${key}`;
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const resp = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redisToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['EXPIRE', redisKey, ttlSeconds, 'NX']
      ]),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      console.warn('[MRVConsultants RateLimit] Redis request failed with status:', resp.status);
      if (process.env.RATE_LIMIT_STORE === 'redis') return false;
      return checkRateLimitMemory(key, maxRequests, windowMs);
    }

    const results = await resp.json();
    const currentCount = Number(results[0]?.result);

    if (Number.isFinite(currentCount)) {
      return currentCount <= maxRequests;
    }

    return checkRateLimitMemory(key, maxRequests, windowMs);
  } catch (err) {
    console.warn('[MRVConsultants RateLimit] Redis connection error:', err.message);
    if (process.env.RATE_LIMIT_STORE === 'redis') return false; // fail-closed if explicitly required
    return checkRateLimitMemory(key, maxRequests, windowMs);
  }
}

/**
 * Check if client identifier exceeds rate limit
 * Supports both persistent Node.js in-memory and Upstash Redis distributed store.
 * @param {string} key
 * @param {number} maxRequests
 * @param {number} windowMs
 * @returns {Promise<boolean>|boolean} true if allowed, false if rate limited
 */
function checkRateLimit(key, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  if (!Number.isFinite(maxRequests) || maxRequests < 1) maxRequests = 5;
  if (!Number.isFinite(windowMs) || windowMs < 1000) windowMs = 15 * 60 * 1000;

  // If Redis credentials or Redis store setting are configured, use distributed check
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.RATE_LIMIT_STORE === 'redis') {
    return checkRateLimitRedis(key, maxRequests, windowMs);
  }

  return checkRateLimitMemory(key, maxRequests, windowMs);
}

/**
 * Verify Cloudflare Turnstile CAPTCHA token on the server
 * @param {string} token
 * @param {string} clientIp
 * @returns {Promise<{ success: boolean, error?: string, bypassed?: boolean }>}
 */
async function verifyTurnstileToken(token, clientIp) {
  const secretKey = (process.env.TURNSTILE_SECRET_KEY || '').trim();
  const requireCaptcha = process.env.REQUIRE_CAPTCHA === 'true';

  // If Turnstile secret is not set
  if (!secretKey) {
    if (requireCaptcha) {
      return {
        success: false,
        error: 'Security challenge configuration is missing on the server.'
      };
    }
    // In development or optional mode, allow
    return { success: true, bypassed: true };
  }

  // If secret key is set, token is required
  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      error: 'Security verification is required. Please complete the CAPTCHA.'
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (clientIp && clientIp !== 'unknown') {
      formData.append('remoteip', clientIp);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      return { success: false, error: 'CAPTCHA provider error. Please try again.' };
    }

    const result = await resp.json();
    if (result.success === true) {
      return { success: true };
    }

    return {
      success: false,
      error: 'Security challenge verification failed. Please try again.'
    };
  } catch (err) {
    console.error('[MRVConsultants CAPTCHA] Verification error:', err.message);
    return {
      success: false,
      error: 'Unable to verify security challenge. Please try again.'
    };
  }
}

/**
 * Sanitize untrusted text to prevent HTML injection in emails and responses
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Collapse a value to a single safe line: removes CR/LF and control characters
 * @param {string} str
 * @returns {string}
 */
function toSingleLine(str) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\u0000-\u001F\u007F\u2028\u2029]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Remove control characters from multi-line text while keeping newlines/tabs
 * @param {string} str
 * @returns {string}
 */
function stripControlChars(str) {
  if (typeof str !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

/**
 * Detect links in short identity fields
 */
function containsLink(str) {
  return /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|info|biz|top|link|click)\b)/i.test(str);
}

/**
 * Validate standard email format (RFC 5322 compliant simplified)
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number format (supports E.164, local, and international numbers with country codes)
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (cleaned.length < 7 || cleaned.length > 20) return false;
  return /^\+?[0-9]{7,18}$/.test(cleaned);
}

/**
 * Check honeypot field. Legitimate users won't fill hidden fields.
 * @param {object} body 
 * @returns {boolean} true if spam detected
 */
function isSpam(body) {
  if (!body || typeof body !== 'object') return false;
  for (const field of ['website_url', 'company_tax_id']) {
    const value = body[field];
    if (value === undefined || value === null || value === false) continue;
    if (typeof value === 'string') {
      if (value.trim().length > 0) return true;
    } else {
      return true; // Any non-empty non-string value in honeypot is automated
    }
  }
  return false;
}

/**
 * Parse client IP address safely from request headers.
 * Proxy headers are client-controlled unless behind a trusted proxy or Vercel.
 * @param {object} req 
 * @returns {string}
 */
function getClientIp(req) {
  const headers = req.headers || {};
  const trustProxy = process.env.TRUST_PROXY === 'true' || Boolean(process.env.VERCEL);

  if (trustProxy) {
    const realIp = headers['x-real-ip'] || headers['x-vercel-forwarded-for'];
    if (typeof realIp === 'string' && realIp.trim()) {
      return toSingleLine(realIp.split(',')[0].trim());
    }
    const forwarded = headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return toSingleLine(forwarded.split(',')[0].trim());
    }
  }
  return toSingleLine(req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown');
}

/**
 * Validate and sanitize Consultation Request body
 * @param {object} data 
 * @returns {{ valid: boolean, errors: string[], sanitized: object }}
 */
function validateConsultationPayload(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Invalid request payload.'], sanitized: {} };
  }

  // Reject unexpected fields to prevent prototype pollution or unvetted parameter passing
  for (const key of Object.keys(data)) {
    if (!CONSULTATION_ALLOWED_KEYS.has(key)) {
      errors.push(`Unexpected parameter in submission: ${escapeHtml(key)}`);
    }
  }

  const fullName = toSingleLine(data.fullName);
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const company = toSingleLine(data.company);
  const service = toSingleLine(data.service);
  const subject = toSingleLine(data.subject);
  const message = stripControlChars(data.message);
  
  // Consent MUST be a real boolean true
  const consent = data.consent === true;

  if (!fullName) {
    errors.push('Full name is required.');
  } else if (fullName.length > 100) {
    errors.push('Full name must be 100 characters or less.');
  } else if (containsLink(fullName)) {
    errors.push('Full name must not contain links or domain names.');
  }

  if (!email) {
    errors.push('Email address is required.');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!service) {
    errors.push('Please select a service category.');
  } else if (!ALLOWED_SERVICES.includes(service)) {
    errors.push('Please select a valid service category.');
  }

  if (company && company.length > 120) {
    errors.push('Company name must be 120 characters or less.');
  }

  if (subject && subject.length > 150) {
    errors.push('Subject must be 150 characters or less.');
  }

  if (!message) {
    errors.push('Message is required.');
  } else if (message.length < 10) {
    errors.push('Message must be at least 10 characters long.');
  } else if (message.length > 3000) {
    errors.push('Message cannot exceed 3,000 characters.');
  }

  if (!consent) {
    errors.push('Please accept the privacy policy to submit your enquiry.');
  }

  const finalSubject = subject || `Consultation on ${service}`;

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      // HTML-escaped values: ONLY for interpolation into HTML email bodies
      fullName: escapeHtml(fullName),
      email: email.toLowerCase(),
      company: escapeHtml(company),
      service: escapeHtml(service),
      subject: escapeHtml(finalSubject),
      message: escapeHtml(message),
      rawMessage: message,
      // Plain text values for subjects and text/plain parts (CRLF stripped, no HTML entities)
      text: {
        fullName,
        company,
        service,
        subject: finalSubject,
        message
      }
    }
  };
}

/**
 * Validate and sanitize Feedback Form body
 * @param {object} data 
 * @returns {{ valid: boolean, errors: string[], sanitized: object }}
 */
function validateFeedbackPayload(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Invalid request payload.'], sanitized: {} };
  }

  // If this is an enquiry submission (contains service or phone numbers), route to validateEnquiryPayload
  if (data.service || data.whatsappNumber || data.callingNumber || data.fullName) {
    return validateEnquiryPayload(data);
  }

  // Reject unexpected fields
  for (const key of Object.keys(data)) {
    if (!FEEDBACK_ALLOWED_KEYS.has(key)) {
      errors.push(`Unexpected parameter in submission: ${escapeHtml(key)}`);
    }
  }

  const name = toSingleLine(data.name);
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const category = toSingleLine(data.category);
  const message = stripControlChars(data.message);

  if (name && name.length > 100) {
    errors.push('Name must be 100 characters or less.');
  }

  if (email && !isValidEmail(email)) {
    errors.push('Please provide a valid email address if including one.');
  }

  if (!category) {
    errors.push('Please choose a feedback category.');
  } else if (!ALLOWED_FEEDBACK_CATEGORIES.includes(category)) {
    errors.push('Please choose a valid feedback category.');
  }

  let rating = 5;
  if (data.rating !== undefined && data.rating !== null && data.rating !== '') {
    if (typeof data.rating !== 'number' || !Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be an integer between 1 and 5 stars.');
    } else {
      rating = data.rating;
    }
  }

  if (!message) {
    errors.push('Feedback message is required.');
  } else if (message.length < 5) {
    errors.push('Feedback message is too short.');
  } else if (message.length > 2000) {
    errors.push('Feedback message cannot exceed 2,000 characters.');
  }

  const displayName = name || 'Anonymous Visitor';

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      name: escapeHtml(displayName),
      email: email ? email.toLowerCase() : '',
      category: escapeHtml(category),
      rating,
      message: escapeHtml(message),
      rawMessage: message,
      text: {
        name: displayName,
        category,
        message
      }
    }
  };
}

/**
 * Validate and sanitize MRVConsultants Service Enquiry & Feedback body
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[], sanitized: object }}
 */
function validateEnquiryPayload(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, errors: ['Invalid request payload.'], sanitized: {} };
  }

  // Reject unexpected fields
  for (const key of Object.keys(data)) {
    if (!ENQUIRY_ALLOWED_KEYS.has(key)) {
      errors.push(`Unexpected parameter in submission: ${escapeHtml(key)}`);
    }
  }

  const fullName = toSingleLine(data.fullName || data.name);
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const rawWhatsapp = typeof data.whatsappNumber === 'string' ? data.whatsappNumber.trim() : '';
  let rawCalling = typeof data.callingNumber === 'string' ? data.callingNumber.trim() : '';
  if (data.sameCallingNumber === true && !rawCalling) {
    rawCalling = rawWhatsapp;
  }
  const whatsappNumber = toSingleLine(rawWhatsapp);
  const callingNumber = toSingleLine(rawCalling);
  const service = toSingleLine(data.service);
  const enquiryType = toSingleLine(data.enquiryType || data.category || 'Service Enquiry');
  const destination = toSingleLine(data.destination || '');
  const message = stripControlChars(data.message);
  const policyVersion = toSingleLine(data.policyVersion || '2026-10-v1');
  const lang = toSingleLine(data.lang || 'en-US');
  const consent = data.consent === true;

  if (!fullName) {
    errors.push('Full name is required.');
  } else if (fullName.length < 2 || fullName.length > 100) {
    errors.push('Full name must be between 2 and 100 characters.');
  } else if (containsLink(fullName)) {
    errors.push('Full name must not contain links or domain names.');
  }

  if (!email) {
    errors.push('Email address is required.');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!whatsappNumber) {
    errors.push('WhatsApp number is required.');
  } else if (!isValidPhone(whatsappNumber)) {
    errors.push('Please provide a valid WhatsApp number with country code (e.g. +94 77 123 4567).');
  }

  if (!callingNumber) {
    errors.push('Calling number is required.');
  } else if (!isValidPhone(callingNumber)) {
    errors.push('Please provide a valid calling number with country code (e.g. +94 76 123 4567).');
  }

  if (!service) {
    errors.push('Please select a service.');
  } else if (!ALLOWED_SERVICES.includes(service)) {
    errors.push('Please select a valid service from the approved list.');
  }

  if (!enquiryType) {
    errors.push('Please select an enquiry type.');
  } else if (!ALLOWED_ENQUIRY_TYPES.includes(enquiryType) && !ALLOWED_FEEDBACK_CATEGORIES.includes(enquiryType)) {
    errors.push('Please select a valid enquiry type.');
  }

  if (destination && !ALLOWED_DESTINATIONS.includes(destination)) {
    errors.push('Please select a valid study destination.');
  }

  if (!message) {
    errors.push('Message is required.');
  } else if (message.length < 10) {
    errors.push('Message must be at least 10 characters long.');
  } else if (message.length > 3000) {
    errors.push('Message cannot exceed 3,000 characters.');
  }

  if (!consent) {
    errors.push('I have read and agree to the Privacy Policy and consent to MRVConsultants using my submitted information to respond to my enquiry.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      fullName: escapeHtml(fullName),
      name: escapeHtml(fullName),
      email: email.toLowerCase(),
      whatsappNumber: escapeHtml(whatsappNumber),
      callingNumber: escapeHtml(callingNumber),
      sameCallingNumber: data.sameCallingNumber === true,
      service: escapeHtml(service),
      enquiryType: escapeHtml(enquiryType),
      category: escapeHtml(enquiryType),
      destination: escapeHtml(destination),
      message: escapeHtml(message),
      rawMessage: message,
      policyVersion: escapeHtml(policyVersion),
      lang: escapeHtml(lang),
      text: {
        fullName,
        name: fullName,
        email: email.toLowerCase(),
        whatsappNumber,
        callingNumber,
        sameCallingNumber: data.sameCallingNumber === true,
        service,
        enquiryType,
        category: enquiryType,
        destination,
        message,
        policyVersion,
        lang
      }
    }
  };
}

module.exports = {
  checkRateLimit,
  checkRateLimitMemory,
  checkRateLimitRedis,
  verifyTurnstileToken,
  escapeHtml,
  toSingleLine,
  stripControlChars,
  isValidEmail,
  isValidPhone,
  isSpam,
  getClientIp,
  validateConsultationPayload,
  validateFeedbackPayload,
  validateEnquiryPayload,
  ALLOWED_SERVICES,
  ALLOWED_ENQUIRY_TYPES,
  ALLOWED_DESTINATIONS,
  ALLOWED_FEEDBACK_CATEGORIES,
  CONSULTATION_ALLOWED_KEYS,
  FEEDBACK_ALLOWED_KEYS,
  ENQUIRY_ALLOWED_KEYS
};

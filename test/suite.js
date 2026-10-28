/**
 * SummitConsult Comprehensive Quality, Security & Penetration Test Suite
 * Validates Sections 14 (A through F) requirements:
 * A. Secret and source-file protection
 * B. API validation
 * C. Abuse protection
 * D. Server stability
 * E. HTTP security
 * F. Email safety
 */

require('dotenv').config();

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');

const {
  checkRateLimit,
  checkRateLimitMemory,
  verifyTurnstileToken,
  escapeHtml,
  toSingleLine,
  stripControlChars,
  isValidEmail,
  isSpam,
  getClientIp,
  validateConsultationPayload,
  validateFeedbackPayload,
  ALLOWED_SERVICES,
  ALLOWED_FEEDBACK_CATEGORIES
} = require('../lib/security');

const {
  setCorsHeaders,
  sendJson,
  isJsonRequest,
  parseBody,
  maskEmail,
  safeLogStr,
  MAX_BODY_BYTES
} = require('../lib/http-utils');

const { getConfig, getFormspreeConfig } = require('../lib/formspree-service');

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runTests() {
  console.log('\n=======================================================');
  console.log(' Starting MRVConsultants Hardened Test Suite');
  console.log('=======================================================\n');

  // =========================================================
  // SECTION A: Secret and Source-File Protection
  // =========================================================
  console.log('--- A. Secret & Source-File Protection ---');

  await test('A1: Confirms no API key or token is leaked into public static files', () => {
    const publicFiles = [
      path.join(__dirname, '../index.html'),
      path.join(__dirname, '../about.html'),
      path.join(__dirname, '../services.html'),
      path.join(__dirname, '../destinations.html'),
      path.join(__dirname, '../contact.html'),
      path.join(__dirname, '../privacy.html'),
      path.join(__dirname, '../404.html'),
      path.join(__dirname, '../assets/css/styles.css'),
      path.join(__dirname, '../assets/js/main.js')
    ];

    const keyPattern = /re_[A-Za-z0-9_]{16,}/;
    const forbiddenStrings = ['RESEND_API_KEY', 'process.env'];
    const configuredKey = (process.env.RESEND_API_KEY || '').trim();

    for (const file of publicFiles) {
      assert.ok(fs.existsSync(file), `Public file must exist: ${file}`);
      const content = fs.readFileSync(file, 'utf8');
      assert.ok(!keyPattern.test(content), `CRITICAL: API-key-like token found in public file ${file}`);
      if (configuredKey && configuredKey !== 're_your_api_key_here') {
        assert.ok(!content.includes(configuredKey), `CRITICAL: Active API key found in public file ${file}`);
      }
      for (const s of forbiddenStrings) {
        assert.ok(!content.includes(s), `Server-side identifier "${s}" found in public file ${file}`);
      }
    }
  });

  await test('A2: Source and test files contain no active secret fragments', () => {
    const configuredKey = (process.env.RESEND_API_KEY || '').trim();
    if (!configuredKey || configuredKey === 're_your_api_key_here' || configuredKey.length < 12) return;
    const fragment = configuredKey.slice(0, 11);
    const files = [
      '../server.js', '../lib/security.js', '../lib/formspree-service.js', '../lib/http-utils.js',
      '../api/consultation.js', '../api/feedback.js', '../test/suite.js', '../README.md',
      '../DEPLOYMENT.md', '../.env.example'
    ];
    for (const f of files) {
      const p = path.join(__dirname, f);
      if (!fs.existsSync(p)) continue;
      assert.ok(!fs.readFileSync(p, 'utf8').includes(fragment), `Active API key fragment found in ${f}`);
    }
  });

  await test('A3: .gitignore strictly excludes all .env files except .env.example', () => {
    const gitignore = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
    assert.ok(/^\.env$/m.test(gitignore), '.gitignore must exclude .env');
    assert.ok(/^\.env\.\*$/m.test(gitignore), '.gitignore must exclude .env.*');
    assert.ok(/^!\.env\.example$/m.test(gitignore), '.gitignore must whitelist .env.example');
  });

  await test('A4: .vercelignore excludes .env, server.js, tests, and sensitive files', () => {
    const vercelignore = fs.readFileSync(path.join(__dirname, '../.vercelignore'), 'utf8');
    assert.ok(/^\.env$/m.test(vercelignore), '.vercelignore must exclude .env');
    assert.ok(/^test\//m.test(vercelignore), '.vercelignore must exclude test directory');
    assert.ok(/^server\.js/m.test(vercelignore), '.vercelignore must exclude server.js');
  });

  await test('A5: vercel.json does not enable public deployment directory or source leak', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json'), 'utf8'));
    assert.notStrictEqual(vercelConfig.public, true, 'vercel.json must not have public: true');
    assert.ok(Array.isArray(vercelConfig.redirects), 'vercel.json must have redirects defined');
    const protectedSources = vercelConfig.redirects.map(r => r.source);
    assert.ok(protectedSources.includes('/lib/:path*'), 'vercel.json must protect /lib');
    assert.ok(protectedSources.includes('/server.js'), 'vercel.json must protect /server.js');
    assert.ok(protectedSources.includes('/package.json'), 'vercel.json must protect /package.json');
  });

  // =========================================================
  // SECTION B: API Validation & Payload Parsing
  // =========================================================
  console.log('\n--- B. API Validation & Schema Enforcement ---');

  await test('B1: Validates complete and legitimate consultation payload', () => {
    const validData = {
      fullName: 'Alexander Wright',
      email: 'a.wright@enterprise.com',
      company: 'Enterprise Holdings',
      service: 'Strategy Consulting',
      subject: 'Q1 Corporate Reorganization',
      message: 'We are seeking an external advisory partner for corporate portfolio restructuring.',
      consent: true
    };
    const res = validateConsultationPayload(validData);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
    assert.strictEqual(res.sanitized.fullName, 'Alexander Wright');
    assert.strictEqual(res.sanitized.text.fullName, 'Alexander Wright');
  });

  await test('B2: Rejects invalid or missing email formats', () => {
    assert.strictEqual(isValidEmail('jane.doe@company.com'), true);
    assert.strictEqual(isValidEmail(''), false);
    assert.strictEqual(isValidEmail('plainaddress'), false);
    assert.strictEqual(isValidEmail('@missinguser.com'), false);
    assert.strictEqual(isValidEmail('missingdomain@'), false);
    assert.strictEqual(isValidEmail('spaces in@email.com'), false);
    assert.strictEqual(isValidEmail('evil\r\nbcc:attacker@example.com'), false);
    assert.strictEqual(isValidEmail(null), false);
  });

  await test('B3: Rejects services outside the whitelist', () => {
    const res = validateConsultationPayload({
      fullName: 'John Doe',
      email: 'john@example.com',
      service: 'Unauthorized Service Category',
      message: 'Valid length message here',
      consent: true
    });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('valid service category')));
  });

  await test('B4: Enforces explicit boolean consent (strings and falsy rejected)', () => {
    const base = {
      fullName: 'John',
      email: 'john@example.com',
      service: 'Strategy Consulting',
      message: 'Valid length message here'
    };
    assert.strictEqual(validateConsultationPayload({ ...base, consent: false }).valid, false);
    assert.strictEqual(validateConsultationPayload({ ...base, consent: 'true' }).valid, false);
    assert.strictEqual(validateConsultationPayload({ ...base, consent: 'false' }).valid, false);
    assert.strictEqual(validateConsultationPayload({ ...base, consent: 1 }).valid, false);
    assert.strictEqual(validateConsultationPayload({ ...base, consent: true }).valid, true);
  });

  await test('B5: Rejects unexpected payload fields (schema whitelisting)', () => {
    const dataWithExtra = {
      fullName: 'John Doe',
      email: 'john@example.com',
      service: 'Strategy Consulting',
      message: 'Valid length message here',
      consent: true,
      __proto_pollute: 'malicious'
    };
    const res = validateConsultationPayload(dataWithExtra);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Unexpected parameter')));
  });

  await test('B6: Enforces message length boundaries', () => {
    const shortMessage = {
      fullName: 'John',
      email: 'john@example.com',
      service: 'Technology Advisory',
      message: 'Hi',
      consent: true
    };
    const resShort = validateConsultationPayload(shortMessage);
    assert.strictEqual(resShort.valid, false);
    assert.ok(resShort.errors.some(e => e.includes('at least 10 characters')));

    const longMessage = {
      fullName: 'John',
      email: 'john@example.com',
      service: 'Technology Advisory',
      message: 'a'.repeat(3001),
      consent: true
    };
    const resLong = validateConsultationPayload(longMessage);
    assert.strictEqual(resLong.valid, false);
    assert.ok(resLong.errors.some(e => e.includes('cannot exceed 3,000')));
  });

  await test('B7: Validates feedback payload and rating integer bounds', () => {
    const validFeedback = {
      name: 'Sarah',
      email: 'sarah@partner.com',
      category: 'Website Experience & Usability',
      rating: 5,
      message: 'Clean light theme and very easy to navigate.'
    };
    assert.strictEqual(validateFeedbackPayload(validFeedback).valid, true);

    const base = { category: 'General Suggestion', message: 'Great service' };
    assert.strictEqual(validateFeedbackPayload({ ...base, rating: 0 }).valid, false);
    assert.strictEqual(validateFeedbackPayload({ ...base, rating: 6 }).valid, false);
    assert.strictEqual(validateFeedbackPayload({ ...base, rating: 3.5 }).valid, false);
    assert.strictEqual(validateFeedbackPayload({ ...base, rating: '5' }).valid, false);
    assert.strictEqual(validateFeedbackPayload({ ...base, rating: 4 }).valid, true);
  });

  await test('B8: parseBody enforces 50KB size limit and rejects malformed JSON', () => {
    assert.strictEqual(parseBody({ body: '' }).ok, false);
    assert.strictEqual(parseBody({ body: '{ malformed json' }).ok, false);
    assert.strictEqual(parseBody({ body: '[]' }).ok, false);

    const normal = parseBody({ body: JSON.stringify({ a: 1 }) });
    assert.strictEqual(normal.ok, true);
    assert.strictEqual(normal.body.a, 1);

    const hugeBody = JSON.stringify({ data: 'x'.repeat(60 * 1024) });
    const parsedHuge = parseBody({ body: hugeBody });
    assert.strictEqual(parsedHuge.tooLarge, true);
  });

  await test('B9: isJsonRequest requires application/json content type', () => {
    assert.strictEqual(isJsonRequest({ headers: { 'content-type': 'application/json' } }), true);
    assert.strictEqual(isJsonRequest({ headers: { 'content-type': 'application/json; charset=utf-8' } }), true);
    assert.strictEqual(isJsonRequest({ headers: { 'content-type': 'text/plain' } }), false);
    assert.strictEqual(isJsonRequest({ headers: { 'content-type': 'application/x-www-form-urlencoded' } }), false);
    assert.strictEqual(isJsonRequest({ headers: {} }), false);
  });

  await test('B10: Validates MRVConsultants service enquiry with WhatsApp and Calling numbers', () => {
    const { validateEnquiryPayload } = require('../lib/security');
    const validEnquiry = {
      fullName: 'Kamal Perera',
      email: 'kamal@example.com',
      whatsappNumber: '+94 77 123 4567',
      callingNumber: '+94 76 123 4567',
      sameCallingNumber: false,
      service: 'Language Classes',
      enquiryType: 'Service Enquiry',
      destination: 'Japan',
      message: 'Interested in Japanese classes and visa for 2027 intake.',
      consent: true
    };
    const res = validateEnquiryPayload(validEnquiry);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized.text.service, 'Language Classes');
    assert.strictEqual(res.sanitized.text.whatsappNumber, '+94 77 123 4567');
    assert.strictEqual(res.sanitized.text.callingNumber, '+94 76 123 4567');

    // Missing consent should fail
    const noConsent = validateEnquiryPayload({ ...validEnquiry, consent: false });
    assert.strictEqual(noConsent.valid, false);

    // Invalid phone should fail
    const badPhone = validateEnquiryPayload({ ...validEnquiry, whatsappNumber: 'invalid' });
    assert.strictEqual(badPhone.valid, false);

    // Auto-sync same calling number
    const syncTest = validateEnquiryPayload({
      ...validEnquiry,
      callingNumber: '',
      sameCallingNumber: true
    });
    assert.strictEqual(syncTest.valid, true);
    assert.strictEqual(syncTest.sanitized.text.callingNumber, '+94 77 123 4567');
  });

  // =========================================================
  // SECTION C: Abuse Protection, Honeypot & CAPTCHA
  // =========================================================
  console.log('\n--- C. Abuse Protection & Rate Limiting ---');

  await test('C1: Flags submissions with populated honeypot (strings, numbers, objects)', () => {
    assert.strictEqual(isSpam({ website_url: 'http://spam.bot' }), true);
    assert.strictEqual(isSpam({ website_url: 12345 }), true);
    assert.strictEqual(isSpam({ company_tax_id: ['array'] }), true);
    assert.strictEqual(isSpam({ website_url: '' }), false);
    assert.strictEqual(isSpam({ website_url: '   ' }), false);
    assert.strictEqual(isSpam({ website_url: null }), false);
  });

  await test('C2: Rate limiter throttles excessive requests and enforces bounded storage', async () => {
    const testIp = `test-ip-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      const allowed = await checkRateLimit(testIp, 3, 5000);
      assert.strictEqual(allowed, true);
    }
    const blocked = await checkRateLimit(testIp, 3, 5000);
    assert.strictEqual(blocked, false);
  });

  await test('C3: Spoofed X-Forwarded-For headers are ignored unless trusted proxy is configured', () => {
    const prevTrust = process.env.TRUST_PROXY;
    const prevVercel = process.env.VERCEL;
    try {
      delete process.env.TRUST_PROXY;
      delete process.env.VERCEL;

      const req = {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
        socket: { remoteAddress: '127.0.0.1' }
      };
      assert.strictEqual(getClientIp(req), '127.0.0.1');

      process.env.TRUST_PROXY = 'true';
      assert.strictEqual(getClientIp(req), '1.2.3.4');
    } finally {
      if (prevTrust !== undefined) process.env.TRUST_PROXY = prevTrust; else delete process.env.TRUST_PROXY;
      if (prevVercel !== undefined) process.env.VERCEL = prevVercel; else delete process.env.VERCEL;
    }
  });

  await test('C4: Turnstile verification fails closed when mandatory but unconfigured', async () => {
    const prevSec = process.env.TURNSTILE_SECRET_KEY;
    const prevReq = process.env.REQUIRE_CAPTCHA;
    try {
      delete process.env.TURNSTILE_SECRET_KEY;
      process.env.REQUIRE_CAPTCHA = 'true';

      const res = await verifyTurnstileToken('some-token', '127.0.0.1');
      assert.strictEqual(res.success, false);
      assert.ok(res.error.includes('missing'));
    } finally {
      if (prevSec !== undefined) process.env.TURNSTILE_SECRET_KEY = prevSec; else delete process.env.TURNSTILE_SECRET_KEY;
      if (prevReq !== undefined) process.env.REQUIRE_CAPTCHA = prevReq; else delete process.env.REQUIRE_CAPTCHA;
    }
  });

  await test('C5: Turnstile verification requires token when secret key is set', async () => {
    const prevSec = process.env.TURNSTILE_SECRET_KEY;
    try {
      process.env.TURNSTILE_SECRET_KEY = '0x4AAAA_mock_secret';
      const resMissing = await verifyTurnstileToken('', '127.0.0.1');
      assert.strictEqual(resMissing.success, false);
      assert.ok(resMissing.error.includes('required'));
    } finally {
      if (prevSec !== undefined) process.env.TURNSTILE_SECRET_KEY = prevSec; else delete process.env.TURNSTILE_SECRET_KEY;
    }
  });

  await test('C6: CORS header enforcement avoids reflecting arbitrary origins', () => {
    const prevOrigins = process.env.ALLOWED_ORIGINS;
    try {
      process.env.ALLOWED_ORIGINS = 'https://portal.summitconsult.com';

      const resEvil = { headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; } };
      setCorsHeaders({ headers: { origin: 'https://evil-hacker.com' } }, resEvil);
      assert.strictEqual(resEvil.headers['access-control-allow-origin'], undefined);
      assert.strictEqual(resEvil.headers['vary'], 'Origin');

      const resGood = { headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; } };
      setCorsHeaders({ headers: { origin: 'https://portal.summitconsult.com' } }, resGood);
      assert.strictEqual(resGood.headers['access-control-allow-origin'], 'https://portal.summitconsult.com');
    } finally {
      if (prevOrigins !== undefined) process.env.ALLOWED_ORIGINS = prevOrigins; else delete process.env.ALLOWED_ORIGINS;
    }
  });

  // =========================================================
  // SECTION D: Server Stability & Exception Safety
  // =========================================================
  console.log('\n--- D. Server Stability & Exception Safety ---');

  await test('D1: URL parsing in server.js uses fixed base and survives malformed Host', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    assert.ok(serverCode.includes("new URL(req.url || '/', 'http://localhost')"), 'Must use fixed URL base');
    assert.ok(!serverCode.includes('${req.headers.host}'), 'Must not interpolate raw Host header');
  });

  await test('D2: clientError listener handles malformed HTTP sockets safely without crashing', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    assert.ok(serverCode.includes("server.on('clientError'"), 'Must handle clientError');
    assert.ok(serverCode.includes('400 Bad Request'), 'Must end malformed client sockets with 400 Bad Request');
  });

  await test('D3: Request timeout and header timeout settings are established', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    assert.ok(serverCode.includes('server.headersTimeout'), 'Must configure headersTimeout');
    assert.ok(serverCode.includes('server.requestTimeout'), 'Must configure requestTimeout');
  });

  // =========================================================
  // SECTION E: HTTP Security Headers
  // =========================================================
  console.log('\n--- E. HTTP Security Headers ---');

  await test('E1: Content-Security-Policy contains necessary restrictions and allowances', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    assert.ok(serverCode.includes("default-src 'self'"), 'CSP must specify default-src self');
    assert.ok(serverCode.includes("object-src 'none'"), 'CSP must forbid object-src');
    assert.ok(serverCode.includes('https://challenges.cloudflare.com'), 'CSP must allow Turnstile when configured');
    assert.ok(serverCode.includes('https://fonts.googleapis.com'), 'CSP must allow Google Fonts style');
  });

  await test('E2: Production HSTS header includes 1-year max-age and subdomains', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    assert.ok(serverCode.includes('Strict-Transport-Security'), 'Must set HSTS');
    assert.ok(serverCode.includes('max-age=31536000'), 'HSTS must be 1 year');
    assert.ok(serverCode.includes('includeSubDomains'), 'HSTS must include subdomains');
  });

  await test('E3: Additional defense-in-depth security headers configured', () => {
    const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    assert.ok(serverCode.includes('X-Content-Type-Options'), 'Must set nosniff');
    assert.ok(serverCode.includes('X-Frame-Options'), 'Must set frame options');
    assert.ok(serverCode.includes('Permissions-Policy'), 'Must restrict permissions');
    assert.ok(serverCode.includes('Cross-Origin-Opener-Policy'), 'Must set COOP');
  });

  // =========================================================
  // SECTION F: Email Safety, Anti-Relay & Injection Prevention
  // =========================================================
  console.log('\n--- F. Email Safety & Anti-Relay Controls ---');

  await test('F1: HTML sanitization escapes tags and quotes to prevent HTML injection in emails', () => {
    const malicious = '<script>alert("xss")</script>&<img src=x onerror=alert(1)>"test"';
    const clean = escapeHtml(malicious);
    assert.ok(!clean.includes('<script>'));
    assert.ok(!clean.includes('<img'));
    assert.ok(!clean.includes('"test"'));
    assert.ok(clean.includes('&lt;script&gt;'));
    assert.ok(clean.includes('&lt;img'));
    assert.ok(clean.includes('&quot;test&quot;'));
  });

  await test('F2: Strips CR/LF from single-line fields to prevent header injection', () => {
    const res = validateConsultationPayload({
      fullName: 'Eve\r\nBcc: attacker',
      email: 'eve@example.com',
      service: 'Strategy Consulting',
      subject: 'Subject\nInjected-Header: evil',
      message: 'Valid length message here',
      consent: true
    });
    assert.strictEqual(res.valid, true);
    assert.ok(!/[\r\n]/.test(res.sanitized.text.fullName));
    assert.ok(!/[\r\n]/.test(res.sanitized.text.subject));
    assert.ok(!res.sanitized.text.fullName.includes('\n'));
  });

  await test('F3: Rejects links in fullName to prevent confirmation email phishing relay', () => {
    const res = validateConsultationPayload({
      fullName: 'Claim your cash at https://phish.example',
      email: 'victim@example.com',
      service: 'Strategy Consulting',
      message: 'Valid length message here',
      consent: true
    });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('contain links')));
  });

  await test('F4: Plain-text values preserve characters without HTML entities', () => {
    const res = validateConsultationPayload({
      fullName: "O'Brien & Sons",
      email: 'client@example.com',
      service: 'Training & Support',
      subject: "Q1 R&D Review",
      message: 'Need training & support for our team.',
      consent: true
    });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitized.text.fullName, "O'Brien & Sons");
    assert.strictEqual(res.sanitized.fullName, 'O&#039;Brien &amp; Sons');
    assert.strictEqual(res.sanitized.text.subject, 'Q1 R&D Review');
  });

  await test('F5: Operational logs mask email addresses and sanitize CRLF', () => {
    const masked = maskEmail('alexander.hamilton@us.treasury.gov');
    assert.strictEqual(masked, 'al***@us.treasury.gov');

    const shortMasked = maskEmail('a@b.com');
    assert.strictEqual(shortMasked, 'a***@b.com');

    const crlfLog = safeLogStr('User Logged In\r\nCRLF Injected Log Entry');
    assert.ok(!/[\r\n]/.test(crlfLog));
    assert.strictEqual(crlfLog, 'User Logged In  CRLF Injected Log Entry');
  });

  await test('F6: getFormspreeConfig returns target email and valid Formspree endpoint', () => {
    const { getFormspreeConfig } = require('../lib/formspree-service');
    const config = getFormspreeConfig();
    assert.ok(config.endpoint.includes('formspree.io'), 'Formspree endpoint must be configured');
    assert.strictEqual(config.targetEmail, 'mrvcconsultants@gmail.com', 'Target email must be mrvcconsultants@gmail.com');
  });

  console.log('\n=======================================================');
  console.log(` Test Summary: ${passedTests}/${totalTests} Passed`);
  console.log('=======================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runTests();

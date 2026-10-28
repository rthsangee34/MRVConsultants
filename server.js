/**
 * MRVConsultants Local Development & Production Server
 * Serves static frontend assets and routes serverless API endpoints.
 */

require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const consultationHandler = require('./api/consultation');
const feedbackHandler = require('./api/feedback');

const PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT_DIR = path.resolve(__dirname);
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const MAX_BODY_SIZE = 50 * 1024; // 50KB

// SECURITY: only these explicit HTML routes (plus validated files inside /assets) are ever served.
// Everything else in the project root (.env, server.js, lib/, test/, node_modules/,
// package.json, docs, dotfiles...) is unreachable over HTTP.
const PUBLIC_PAGES = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/about': 'about.html',
  '/about.html': 'about.html',
  '/services': 'services.html',
  '/services.html': 'services.html',
  '/destinations': 'destinations.html',
  '/destinations.html': 'destinations.html',
  '/gallery': 'gallery.html',
  '/gallery.html': 'gallery.html',
  '/contact': 'contact.html',
  '/contact.html': 'contact.html',
  '/privacy': 'privacy.html',
  '/privacy.html': 'privacy.html',
  '/404': '404.html',
  '/404.html': '404.html'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Strict Content Security Policy compatible with Google Fonts, Google Translate & optional Cloudflare Turnstile
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://translate.googleapis.com https://www.gstatic.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://formspree.io https://translate.googleapis.com https://translate-pa.googleapis.com https://translate.google.com https://challenges.cloudflare.com",
  "frame-src 'self' https://translate.google.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "frame-ancestors 'self'"
].join('; ');

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

/**
 * Safely map a URL pathname to an allowed public file on disk.
 * Returns the resolved path or null if not permitted.
 */
function resolvePublicFile(pathname) {
  if (Object.prototype.hasOwnProperty.call(PUBLIC_PAGES, pathname)) {
    return path.join(ROOT_DIR, PUBLIC_PAGES[pathname]);
  }

  if (!pathname.startsWith('/assets/')) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (e) {
    return null; // malformed percent-encoding
  }

  // Reject null bytes and path separators in segments
  if (decoded.includes('\0') || decoded.includes('\\')) return null;

  // Reject hidden files/dirs and any directory traversal segments
  const segments = decoded.split('/').filter(Boolean);
  if (segments.some(seg => seg.startsWith('.'))) return null;

  const filePath = path.resolve(ROOT_DIR, '.' + decoded);
  if (!filePath.startsWith(ASSETS_DIR + path.sep)) return null;
  return filePath;
}

function sendNotFound(req, res) {
  const notFoundPath = path.join(ROOT_DIR, '404.html');
  fs.readFile(notFoundPath, (err404, data404) => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    if (req.method === 'HEAD') return res.end();
    if (!err404) {
      res.end(data404);
    } else {
      res.end('<h1>404 Not Found</h1><p>The requested page could not be found.</p><p><a href="/">Return to Home</a></p>');
    }
  });
}

function sendJsonError(res, status, message) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ success: false, error: message }));
}

/**
 * Collect the request body safely (strict size limit, timeout, UTF-8 buffer decoding).
 */
function readJsonBody(req, res, callback) {
  if (req.method !== 'POST') return callback();

  const declared = parseInt(req.headers['content-length'] || '0', 10);
  if (declared > MAX_BODY_SIZE) {
    sendJsonError(res, 413, 'Payload too large.');
    req.resume();
    return;
  }

  const chunks = [];
  let bodySize = 0;
  let aborted = false;

  // 10-second timeout for streaming the body
  const bodyTimeout = setTimeout(() => {
    if (!aborted && !res.headersSent) {
      aborted = true;
      res.setHeader('Connection', 'close');
      sendJsonError(res, 408, 'Request body timeout.');
      req.destroy();
    }
  }, 10000);

  req.on('data', chunk => {
    if (aborted) return;
    bodySize += chunk.length;
    if (bodySize > MAX_BODY_SIZE) {
      clearTimeout(bodyTimeout);
      aborted = true;
      res.setHeader('Connection', 'close');
      sendJsonError(res, 413, 'Payload too large.');
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    clearTimeout(bodyTimeout);
    if (aborted) return;
    req.body = Buffer.concat(chunks).toString('utf8');
    callback();
  });

  req.on('error', () => {
    clearTimeout(bodyTimeout);
    aborted = true;
    sendJsonError(res, 400, 'Request stream error.');
  });
}

function runApiHandler(handler, req, res) {
  readJsonBody(req, res, () => {
    Promise.resolve()
      .then(() => handler(req, res))
      .catch(err => {
        console.error('[MRVConsultants Server] Unhandled API error:', err && err.message);
        sendJsonError(res, 500, 'Internal server error.');
      });
  });
}

const server = http.createServer((req, res) => {
  try {
    setSecurityHeaders(res);

    // Fixed base URL parsing to guarantee host-header injection / malformed host crashes are impossible
    let pathname;
    try {
      pathname = new URL(req.url || '/', 'http://localhost').pathname;
    } catch (e) {
      res.statusCode = 400;
      return res.end('Bad Request');
    }

    // API Routing
    if (pathname === '/api/consultation') {
      return runApiHandler(consultationHandler, req, res);
    }

    if (pathname === '/api/feedback') {
      return runApiHandler(feedbackHandler, req, res);
    }

    // Static files: GET / HEAD only
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET, HEAD');
      return res.end('Method Not Allowed');
    }

    const filePath = resolvePublicFile(pathname);
    if (!filePath) return sendNotFound(req, res);

    // Verify canonical path to prevent symlink traversal attacks
    fs.realpath(filePath, (realErr, realPath) => {
      if (realErr) return sendNotFound(req, res);

      // Permitted files must resolve strictly inside ROOT_DIR and assets inside ASSETS_DIR
      if (pathname.startsWith('/assets/')) {
        if (!realPath.startsWith(ASSETS_DIR + path.sep)) {
          return sendNotFound(req, res);
        }
      } else {
        if (!realPath.startsWith(ROOT_DIR + path.sep) && realPath !== ROOT_DIR) {
          return sendNotFound(req, res);
        }
      }

      fs.stat(realPath, (statErr, stats) => {
        if (statErr || !stats.isFile()) return sendNotFound(req, res);

        const ext = path.extname(realPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);

        if (process.env.NODE_ENV === 'production' && pathname.startsWith('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        } else {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }

        if (req.method === 'HEAD') return res.end();

        const stream = fs.createReadStream(realPath);
        stream.on('error', () => {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Internal Server Error');
          } else {
            res.destroy();
          }
        });
        stream.pipe(res);
      });
    });
  } catch (err) {
    console.error('[MRVConsultants Server] Request handling error:', err && err.message);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
});

// Malformed HTTP from a client must never take the server down
server.on('clientError', (err, socket) => {
  if (socket.writable) {
    socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
  } else {
    socket.destroy();
  }
});

// Mitigate slow-loris style connection exhaustion
server.headersTimeout = 15000;
server.requestTimeout = 30000;

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` MRVConsultants Platform running at http://localhost:${PORT}`);
  console.log(` Static Frontend: Active`);
  console.log(` Formspree API Endpoints: /api/consultation, /api/feedback`);
  console.log(` Target Enquiry Inbox: mrvcconsultants@gmail.com`);
  console.log(`=======================================================`);
});

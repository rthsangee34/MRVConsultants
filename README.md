# MRVConsultants — Overseas Education Consultancy Platform

A production-oriented website for **MRVConsultants** built with a premium light theme (royal blue, soft blue, and white), static multi-page frontend, multilingual support (English, Tamil, Sinhala), and a secure enquiry and feedback submission system powered by **Formspree**.

Destination inbox: **mrvcconsultants@gmail.com**

---

## 🌟 Architecture Overview

* **Frontend**: Pure semantic HTML5, Vanilla CSS3 with custom design tokens, and modular JavaScript (`assets/js/main.js`). Zero heavy client bundles. Lightning-fast load times, SEO optimized, and fully accessible.
* **Multi-Page Layout**:
  * `index.html`: Hero with official poster, vision & mission, featured services, popular study destinations, 5-stage guidance roadmap, and the Service Enquiry & Feedback Form.
  * `about.html`: Company overview, founder leadership, vision & mission, what we do, and 6 core strengths.
  * `services.html`: 10 comprehensive educational services (Language Classes featured first).
  * `destinations.html`: 8 major study destinations (Japan, Germany, Russia, New Zealand, Malaysia, Singapore, Dubai, Europe) with interactive details modal.
  * `gallery.html`: Filterable professional photo gallery with fullscreen lightbox modal.
  * `contact.html`: Direct executive contact cards (CEO, MD, Hotline) with click-to-call / WhatsApp, Vavuniya office details, and enquiry form.
  * `privacy.html`: Dedicated privacy policy explaining phone numbers, Formspree data transmission, and rights.
  * `404.html`: Custom branded 404 page.
* **Enquiry & Email System**: Powered by **Formspree** via a minimal, secure Vercel Serverless Function (`/api/feedback` and `/api/consultation`).
* **Security & Abuse Prevention**:
  * In-memory sliding-window IP rate limiting (optional distributed Redis support)
  * Honeypot anti-spam trap
  * Client contact numbers validation (WhatsApp and Calling phone format validation)
  * WhatsApp / Calling number auto-sync toggle
  * Safe HTML sanitization against Cross-Site Scripting (XSS)
  * Server-side secrets protection: No credentials bundled or exposed to the browser

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Your `.env` should contain:
```env
FORMSPREE_FORM_ID=
FORMSPREE_ENDPOINT=https://formspree.io/f/mrvcconsultants
FEEDBACK_TO_EMAIL=mrvcconsultants@gmail.com
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
PORT=3000
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Design System & Tokens

* **Primary Navy**: `#163B65`
* **Accent Blue**: `#2878F0`
* **Light Blue Accent**: `#EFF6FF`
* **Primary Background**: `#FFFFFF`
* **Secondary Background**: `#F8FAFC`
* **Typography**: Outfit & Inter (Google Fonts)

---

## 📦 Project Structure

```
├── .env                  # Server-side environment variables (gitignored)
├── .env.example          # Safe environment template
├── .gitignore            # Git exclusion rules
├── 404.html              # Custom 404 error page
├── index.html            # Main home page
├── about.html            # About Us page
├── services.html         # Our Services page
├── destinations.html     # Study Destinations page
├── gallery.html          # Professional Gallery with lightbox
├── contact.html          # Contact Us with direct phone cards
├── privacy.html          # Dedicated privacy policy page
├── api/
│   ├── consultation.js   # Serverless consultation endpoint (Formspree)
│   └── feedback.js       # Serverless enquiry & feedback endpoint (Formspree)
├── assets/
│   ├── css/
│   │   └── styles.css    # Design tokens, responsive grids, modals
│   ├── images/
│   │   ├── logo/         # Transparent MRVC emblem & circle variations
│   │   ├── professionals/# Official photographs
│   │   └── asets/        # Official study abroad posters
│   └── js/
│       └── main.js       # Form handling, phone sync, 3-language switch, lightbox
├── lib/
│   ├── formspree-service.js # Formspree dispatcher module
│   ├── http-utils.js     # Shared HTTP helpers
│   └── security.js       # Validation, rate limiting & anti-spam
├── package.json          # Node package definition & scripts
├── server.js             # Local static + API development server
├── test/
│   └── suite.js          # Automated validation & security test suite
├── vercel.json           # Vercel deployment configuration
├── DEPLOYMENT.md         # Production deployment & Formspree setup guide
└── README.md
```

---

## 🛡️ Security Guarantees

1. **Zero Secret Leaks**: Verified by test suite to contain no tokens or sensitive variables in client files.
2. **Honeypot Disarming**: Automated spam submissions are silently trapped without triggering external email notifications.
3. **Sliding Rate Limiter**: Client IPs are throttled to prevent spam flooding.
4. **Phone & Schema Validation**: Rigorous validation on WhatsApp and calling numbers before dispatching to Formspree.

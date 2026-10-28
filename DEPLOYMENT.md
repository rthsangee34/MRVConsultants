# Production Deployment & Formspree Configuration Guide

This guide details the exact steps to deploy the **MRVConsultants** platform to production, configure Formspree for enquiry and feedback delivery, and perform live end-to-end verification.

---

## 1. Environment Variables Reference

Configure these environment variables in your production hosting dashboard (e.g. Vercel Project Settings → Environment Variables):

| Variable Name | Required | Default / Test Value | Production Example | Description |
|---|---|---|---|---|
| `FORMSPREE_FORM_ID` | Optional* | *(empty)* | `xpzgvwoq` | Formspree Form ID from formspree.io |
| `FORMSPREE_ENDPOINT` | Optional* | `https://formspree.io/f/mrvcconsultants` | `https://formspree.io/f/your_form_id` | Full Formspree submission endpoint URL |
| `FEEDBACK_TO_EMAIL` | **Yes** | `mrvcconsultants@gmail.com` | `mrvcconsultants@gmail.com` | Destination inbox for all student enquiries |
| `ALLOWED_ORIGINS` | No | *(empty = same-origin only)* | `https://mrvcconsultants.com` | Whitelisted cross-origin domains (comma-separated) |
| `TRUST_PROXY` | No | `false` (auto on Vercel) | `true` behind reverse proxy | Trust `X-Forwarded-For` for IP rate limiting |
| `RATE_LIMIT_MAX_REQUESTS` | No | `10` | `10` | Max requests per IP window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | `900000` | Rate limit window in ms (15 minutes) |
| `UPSTASH_REDIS_REST_URL` | No | *(empty)* | `https://...upstash.io` | Upstash Redis REST URL for serverless rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | *(empty)* | `AX...` | Upstash Redis REST Token |
| `RATE_LIMIT_STORE` | No | `memory` | `redis` | Set to `redis` to fail-closed if Redis is required in production |
| `TURNSTILE_SECRET_KEY` | No | *(empty)* | `0x4AAAA...` | Cloudflare Turnstile Secret Key for server-side verification |
| `TURNSTILE_SITE_KEY` | No | *(empty)* | `0x4AAAA...` | Cloudflare Turnstile Site Key for frontend challenge widget |
| `REQUIRE_CAPTCHA` | No | `false` | `true` | Fail-closed in production if CAPTCHA verification is required |

*\*Either `FORMSPREE_FORM_ID` or `FORMSPREE_ENDPOINT` should be set in production to direct emails to your Formspree form.*

---

## 2. Setting Up Formspree for MRVConsultants

1. **Sign Up / Log In**: Open [https://formspree.io](https://formspree.io) and sign in.
2. **Create a New Form**:
   - Form Name: `MRVConsultants Enquiries`
   - Target Email: `mrvcconsultants@gmail.com`
3. **Copy Form ID or Endpoint**:
   - Formspree will generate an endpoint like: `https://formspree.io/f/xanywqpo`
   - Copy the form ID (`xanywqpo`) or the full URL.
4. **Update Production Environment Variables**:
   - Set `FORMSPREE_FORM_ID=xanywqpo` or `FORMSPREE_ENDPOINT=https://formspree.io/f/xanywqpo`
   - Set `FEEDBACK_TO_EMAIL=mrvcconsultants@gmail.com`
5. **No npm dependency needed**: Formspree uses lightweight native HTTP POST requests via Node's native `fetch` API.

---

## 3. Deploying to Vercel (Recommended Serverless Architecture)

Vercel serves static files from the repository root via its global CDN and routes `/api/feedback` and `/api/consultation` as serverless functions.

### Step 1: Initialize Git and Push to Private Repository
```bash
git init
git add .
git commit -m "feat: MRVConsultants production release with Formspree"
git remote add origin https://github.com/your-org/mrvconsultants.git
git push -u origin main
```
*Note: `.gitignore` and `.vercelignore` guarantee that `.env` and dev/test files will never be tracked or uploaded.*

### Step 2: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your repository.
4. Framework Preset: Leave as **Other**.
5. Add the Environment Variables:
   - `FORMSPREE_ENDPOINT` (or `FORMSPREE_FORM_ID`)
   - `FEEDBACK_TO_EMAIL`: `mrvcconsultants@gmail.com`
   - *(Optional)* `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`
   - *(Optional)* `TURNSTILE_SECRET_KEY` & `TURNSTILE_SITE_KEY`
6. Click **Deploy**.

---

## 4. Live Production Testing Checklist

Before opening the site to student traffic, verify:

- [ ] All pages load cleanly (`index.html`, `about.html`, `services.html`, `destinations.html`, `gallery.html`, `contact.html`, `privacy.html`).
- [ ] Language toggle works seamlessly between English, Tamil, and Sinhala.
- [ ] WhatsApp & Calling Number fields accept international country codes (e.g., `+94 77 123 4567`).
- [ ] "My calling number is the same as my WhatsApp number" checkbox copies the WhatsApp number automatically.
- [ ] Enquiry form submits and displays the success message: *"Thank you! Your enquiry has been submitted successfully."*
- [ ] Form submission arrives in `mrvcconsultants@gmail.com` inbox via Formspree with all client details.

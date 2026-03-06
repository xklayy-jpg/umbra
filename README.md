# Umbra — AI Digital Systems Studio (v2)

High-end, cinematic landing page for **Umbra — AI Digital Systems Studio**, built as a static site ready for Vercel. This version focuses on production‑grade security, performance, and maintainability while keeping the design minimal and premium.

## Files

- `index.html` — Main landing page markup, hero, sections, AI assistant, and analytics hook.
- `style.css` — Visual system, layout, responsive rules, and motion primitives.
- `main.js` — Spline integration, scroll/cursor interactions, form handling, and analytics wiring.
- `api/contact.js` — Vercel serverless function for secure contact form handling.
- `vercel.json` — Security headers (CSP, HSTS, XFO, XCTO, Referrer-Policy, Permissions-Policy).
- `.eslintrc.cjs` — ESLint configuration for modern browser JS + Prettier.
- `prettier.config.cjs` — Prettier configuration.
- `package.json` — Tooling scripts for linting/formatting and local static dev.

## New Features Added (v2)

- **Security hardening**
  - Strong **Content Security Policy** via `vercel.json` plus a meta fallback in `index.html`.
  - **X-Frame-Options: DENY** to prevent clickjacking.
  - **X-Content-Type-Options: nosniff** to prevent MIME sniffing.
  - **Referrer-Policy: strict-origin-when-cross-origin** to limit referrer leakage.
  - **Strict-Transport-Security** (HSTS) to enforce HTTPS with subdomains.
  - **Permissions-Policy** to explicitly disable sensitive APIs (geo, mic, camera).
  - Contact form hardened with sanitization, validation, honeypot, and rate limiting (client + server).

- **Performance optimizations**
  - Spline initialization deferred with `requestIdleCallback` / `setTimeout` so it doesn’t block first paint.
  - Spline render size reduced automatically on low-power devices.
  - Scroll- and intersection‑observer driven animations to avoid unnecessary work off‑screen.
  - All portfolio images use `loading="lazy"`.
  - No layout‑shifting scripts; smooth scrolling uses native APIs.

- **Advanced interactions**
  - Smooth anchor scrolling for nav and hero CTA.
  - Magnetic hover for all `.btn` elements (GPU‑friendly transforms only).
  - Cursor‑based parallax in the hero (moon, stars, and lens flare).
  - Enhanced scroll‑based moon rotation and light movement via Spline Runtime.

- **Analytics (privacy‑friendly)**
  - Plausible snippet included in `index.html` (set `data-domain` before production).
  - Custom events in `main.js`:
    - `start_project_click`
    - `scroll_depth` (25/50/75/90%)
    - `portfolio_interaction` (per item title)
    - `contact_submit_clicked`
    - `contact_submitted` (on successful POST)

- **AI lead qualification (minimal, non‑intrusive)**
  - Compact assistant below the contact section:
    - Asks about project goals, audience, and constraints.
    - Generates a concise, structured project summary on click.
    - Summary is written into a hidden field and submitted with the contact form.
  - Implemented as a deterministic client‑side helper, easy to swap for a live LLM API later.

- **Code quality**
  - ESLint + Prettier configs added for consistent formatting and linting.
  - Defensive error handling around Spline initialization, visibility changes, and form submission.
  - Clear separation between DOM wiring, analytics, Spline setup, and form logic.

## Security Decisions (Why)

- **CSP**: Locks down where scripts, styles, fonts, images, and network connections may come from.
  - Scripts are limited to:
    - `self` (your own `main.js`)
    - `https://unpkg.com` (Spline Runtime)
    - `https://plausible.io` (analytics)
  - Styles and fonts are restricted to `self` and Google Fonts CDNs.
  - Images are limited to your origin and `https://images.pexels.com` plus `data:` URLs.
  - `connect-src` allows only Plausible and Spline scene loading.
  - `object-src 'none'` disables old plugin content (Flash, etc).
  - `frame-ancestors 'none'` prevents other sites from embedding Umbra in iframes.

- **X-Frame-Options: DENY**: Additional guard against clickjacking even if CSP is misconfigured.

- **X-Content-Type-Options: nosniff**: Prevents the browser from guessing types, which can expose attacks if a JS file is served with the wrong MIME type.

- **Referrer-Policy: strict-origin-when-cross-origin**: Keeps full URLs internal to the site while still allowing origin‑level referrer externally.

- **Strict-Transport-Security**: Encourages browsers to use HTTPS only, protecting against downgrade and some MITM attacks once the site is visited securely.

- **Permissions-Policy**: Explicitly denies access to geolocation, microphone, and camera, reducing the risk of unexpected prompts or API usage by future code.

- **Form protections**:
  - Client side:
    - Inputs are sanitized (strip `<` / `>`) and length‑bounded.
    - Email is validated with a conservative regex.
    - Honeypot field catches basic bots.
    - Simple local rate limit to avoid accidental hammering.
  - Server side:
    - Same sanitization and validation as a second line of defense.
    - In‑memory per‑IP rate limiting to limit abuse across instances.
    - Generic success response for honeypot hits so bots can’t learn they were refused.

## Running Locally

### Install tooling

```bash
cd cryptovault-upgraded
npm install
```

### Start a simple dev server

```bash
npm run dev
```

This uses `npx serve .` to serve the static site. Open the printed URL (usually `http://localhost:3000` or `http://localhost:5000`).

### Lint and format

- Lint:

```bash
npm run lint
```

- Format:

```bash
npm run format
```

## Deploying to Vercel

1. **Create a new Vercel project**
   - Point it at the `cryptovault-upgraded` folder.
   - Framework preset: **Other** (static).

2. **Configure build settings**
   - Build command: `npm run build` (no-op, safe placeholder).
   - Output directory: `.` (the project root; contains `index.html`).

3. **Environment (optional)**
   - If you later integrate an email provider or AI API in `api/contact.js`, add corresponding environment variables (API keys, secrets) here and consume them server-side.

4. **Headers**
   - `vercel.json` is already included; Vercel will use it automatically to apply:
     - CSP
     - X-Frame-Options
     - X-Content-Type-Options
     - Referrer-Policy
     - Strict-Transport-Security
     - Permissions-Policy

5. **Analytics**
   - Update the `data-domain` attribute in the Plausible script tag inside `index.html` to your domain (e.g. `umbra.studio`).
   - Configure the same domain in your Plausible dashboard.

6. **Spline**
   - In `main.js`, replace `SPLINE_SCENE_URL` with your exported `.splinecode` URL:
     - In Spline: **Export → Code → Vanilla JS → copy URL**.
   - Ensure your moon mesh is named `Moon` and key light is named `KeyLight` so the runtime mapping works.

## Extending the System

- **Real AI for lead qualification**
  - Replace the deterministic assistant in `main.js` with a call to a serverless function that uses your preferred LLM (e.g. OpenAI, Anthropic).
  - Keep the same `aiSummaryField` contract so the contact pipeline doesn’t change.

- **Deeper analytics**
  - Tag additional interactions (e.g. hero scroll thresholds, specific sections coming into view) by adding more `trackEvent(...)` calls.
  - If you migrate to Vercel Analytics, you can remove Plausible and repoint the tracking shim.

- **Multi‑page or localized version**
  - Duplicate `index.html` into additional entry pages (e.g. `/case-studies`, `/lab`).
  - Share `style.css` and `main.js`, using route checks in JS to only initialize what each page needs.

- **Design system / components**
  - If you move into a React/Framer stack later, this layout can be translated 1:1 into components while keeping:
    - Spline integration via `@splinetool/react-spline`.
    - The same CSP and security posture through a framework‑level config.
    - The same analytics event names to preserve data continuity.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**R.A.R.E. Pathways LLC** ("Rescuing And Reviving Estates") is a static marketing website for a real estate investment company that purchases properties directly from homeowners.

## Stack

Plain HTML/CSS/JS — no build tools, no package manager, no framework. Serve directly from the filesystem or any static host.

**Hosting:** Netlify, connected to the GitHub repo (`JMACBigMan/RAREpathways`). Every push to `main` auto-deploys. Settings live in `netlify.toml` (no build; publishes the repo root and strips `CLAUDE.md`/`.github`). The old Hostinger FTP GitHub Action was removed. Domain DNS is managed at Hostinger — change only the A/CNAME web records, never the MX (email) records.

## Architecture

Single-page site (`index.html`) with companion `style.css` and `script.js`:

- **index.html** — Full page structure: fixed header nav, hero with lead-capture form, consent checkbox, informational sections, FAQ accordion, footer
- **style.css** — CSS custom properties for color scheme, Grid/Flexbox layouts, responsive breakpoints at 600px / 768px / 992px
- **Cache busting:** every page links `style.css?v=N` and `script.js?v=N`. Bump N on all pages whenever CSS/JS changes, or returning visitors may get stale styles.
- **script.js** — FAQ accordion (toggles `.active` class, animates `max-height`) and consent checkbox validation (blocks form submit if unchecked, shows inline error)
- **Images/** — `rare-pathways-logo.jpg` (compressed footer logo; built from `RarePathways Logo - clean.jpg`, the watermark-free source), `og-image.jpg` (1200×630 link-preview image), `BeforeAfter.png`
- **favicon.svg / favicon-32.png / apple-touch-icon.png** — navy + yellow "R" tab icons, linked from every page head
- **sitemap.xml / robots.txt** — list public pages; confirmation pages are excluded and `noindex`. Add new public pages to `sitemap.xml`
- **confirmation.html** — Post-form-submission thank-you page

External dependencies (CDN only):
- Google Fonts: Montserrat, Open Sans
- Unsplash URLs for background/stock photos in CSS/HTML

## Color Scheme

| Role | Value |
|------|-------|
| Nav / primary | `#1a337c` (navy) |
| Accent / tagline | `#fdd835` (yellow) |
| CTA buttons | `#28a745` (green) |
| Body text | `#333333` |

## Service Areas

Metro Atlanta and Macon (GA); Charlotte and Fayetteville (NC). These appear in the homepage "Areas We Serve" section (`#areas`), the page `<title>`/meta descriptions, the `LocalBusiness` JSON-LD `areaServed` in `index.html`, and the builders page hero + FAQ. Keep all of them in sync when areas change. Use `LocalBusiness`, not `RealEstateAgent` — the company is not a licensed agent/broker.

## Lead Capture Form

The hero form submits to Formspree (`https://formspree.io/f/meaqnkve`). Fields: `property_address`, `first_name`, `last_name`, `phone` (all required), `email` and `reason_for_selling` dropdown (both optional), plus `consent`, a `_subject` line, and a `_gotcha` spam honeypot.

`script.js` submits the form via `fetch` (JSON `Accept` header) and redirects to `confirmation.html` on success — Formspree's free plan doesn't honor `_next` redirects. On failure it shows `#form-submit-error`. Without `fetch`, the form falls back to a normal POST.

A consent checkbox is required before submission (validated in `script.js` before the Formspree handler runs). It links to `terms.html` and `privacy.html`.

**Builders page** (`builders.html`) has a second form posting to Formspree `https://formspree.io/f/mnpdojnb` (fields: name, `company`, `phone`, `email`, `build_areas`, `lot_types` checkbox chips, `lots_per_year`, `notes`). Each form sets its success page via `data-redirect` (builders → `builders-confirmation.html`); the submit handler sends JSON and joins repeated checkbox values with commas.

The Property Address field has Google Places (New) autocomplete. The API key is `GOOGLE_MAPS_API_KEY` in `script.js`; it is referrer-restricted in Google Cloud Console.

## Contact Details

| Channel | Value |
|---------|-------|
| Email | `info@rarepathwayshomes.com` |
| Phone | `(678) 693-9453` |

## CSS Architecture Notes

- All layout styles live in `style.css` — avoid inline styles in `index.html`
- Footer layout uses `.footer-top-grid`, `.footer-heading`, `.footer-logo-img`, `.footer-muted-text`, `.footer-privacy-row`, `.footer-bottom-row`, `.footer-divider` classes
- Final CTA section uses `.final-cta-section`, `.final-cta-title`, `.final-cta-body`, `.cta-button-lg` classes
- Scroll reveal animations use `.reveal` and `.reveal-stagger` — driven by an `IntersectionObserver` in `script.js`
- `background-attachment: fixed` is disabled at 600px to prevent iOS Safari rendering issues
- Card hover effects (lift + shadow) are on `.process-card`, `.sit-card`, and `.mission-card`
- Input focus state uses a navy border + soft glow (`box-shadow: 0 0 0 3px rgba(26,51,124,0.12)`)

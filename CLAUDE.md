# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**R.A.R.E. Pathways LLC** ("Rescuing And Reviving Estates") is a static marketing website for a real estate investment company that purchases properties directly from homeowners.

## Stack

Plain HTML/CSS/JS — no build tools, no package manager, no framework. Serve directly from the filesystem or any static host.

## Architecture

Single-page site (`index.html`) with companion `style.css` and `script.js`:

- **index.html** — Full page structure: fixed header nav, hero with lead-capture form, consent checkbox, informational sections, FAQ accordion, footer
- **style.css** — CSS custom properties for color scheme, Grid/Flexbox layouts, responsive breakpoints at 600px / 768px / 992px
- **script.js** — FAQ accordion (toggles `.active` class, animates `max-height`) and consent checkbox validation (blocks form submit if unchecked, shows inline error)
- **Images/** — Local assets: company logo (`RarePathways Logo.png`), before/after photo (`BeforeAfter.png`)
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

## Lead Capture Form

The hero form submits to Salesforce Web-to-Lead (`orgId=00DHu000001A43v`). Fields: Property Address, First Name, Last Name, Phone (all required), Email (optional).

A consent checkbox is required before submission. The checkbox links to Terms of Use and Privacy Policy — URLs are set via `href="YOUR_TERMS_URL"` and `href="YOUR_PRIVACY_URL"` in `index.html` and need to be updated before going live.

The `retURL` hidden field currently points to `http://127.0.0.1:3000/confirmation.html` and must be updated to the live domain before deployment.

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

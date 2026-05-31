# PHASE — Website

A cinematic, fully responsive site for the **PHASE** brand — Pilates &amp; somatic
movement studio in Jbeil, Lebanon, and the **PHASE Method™** certification by
Elise El Khoury, PT.

**Tagline:** Breath. Move. Heal.

## Stack

Pure static site — no build step required.

- `index.html` — the single-page experience
- `refund.html` / `complaints.html` — policy pages (content from the brand PDFs)
- `css/style.css` — all styling &amp; the theme (sage / cream / emerald-forest)
- `js/main.js` — interactions &amp; motion (no framework)
- GSAP + ScrollTrigger loaded from CDN as a **progressive enhancement** — the site
  is fully usable (content visible, links work, reveals via IntersectionObserver)
  even if the CDN is blocked.
- `assets/img/logo.png` — the brand mark (also used as favicon / social image)

## Preview locally

Any static server works. From this folder:

```bash
# Python
python -m http.server 5173
# then open http://localhost:5173

# or Node
npx serve .
```

> Open via a server (http://localhost…), not by double-clicking the file —
> Google Fonts, the map embed and the CDN scripts behave best over http(s).

## Deploy to Vercel

This folder deploys as-is (it's a static site — no framework preset needed).

```bash
npm i -g vercel   # once
vercel            # preview deploy
vercel --prod     # production
```

Or drag-and-drop the folder in the Vercel dashboard. `vercel.json` already sets
clean URLs, caching for assets, and basic security headers.

## Adding real photos (recommended next step)

The hero, the **About Elise** portrait, and the **Studio** gallery currently use
elegant branded placeholders (the quilted-diamond texture). To swap in real
photography:

1. Drop images into `assets/img/` (e.g. `elise.jpg`, `studio-1.jpg`, …).
2. **About portrait** — in `index.html`, find `.about__portrait` and replace the
   `.ph-slot` block with:
   `<img src="assets/img/elise.jpg" alt="Elise El Khoury teaching at PHASE" />`
3. **Gallery** — in each `.tile`, replace the `<span>…</span>` with
   `<img src="assets/img/studio-1.jpg" alt="…" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`
4. **Hero background** (optional) — add a real photo behind `.hero` by setting a
   `background-image` on `.hero` (keep the dark vignette for text contrast).

Recommended sizes: gallery ~800×800, portrait ~900×1100, hero ~2000px wide,
all compressed (WebP/JPEG, &lt; 300 KB each).

## Things to keep current

- **Pricing &amp; schedule** are intentionally "DM for details" so nothing goes
  stale. Exact class times live in the WhatsApp/Instagram CTAs.
- **WhatsApp** number: `+961 78 999 387` (used in `wa.me` links).
- **Map**: the Contact section embeds a Google Map for "Jbeil, Lebanon". To pin the
  exact studio, replace the `iframe` `src` with an embed from Google Maps for the
  precise location.

---

© PHASE Method™ · Elise El Khoury, PT

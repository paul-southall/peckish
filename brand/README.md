# Peckish brand assets

The locked brand assets for Peckish. Source: **Brand Book v2 (Citrus / Sprout)**, kept under `_planning/Peckish Brand Book v2.html` as the canonical reference. If anything in this folder ever drifts from the brand book, the brand book wins.

## Folder layout

```
brand/
├── logos/         Wordmark and icon SVGs in colour, mono-light, mono-dark
├── lockups/       Horizontal icon + wordmark lockups (same three variants)
├── og-cards/      Three Open Graph cards (1200 × 630): type-led, mark-led, scene-led
├── favicons/      Multi-size favicon and app-icon set, including .ico and maskable
└── launch-card/   The "brand-in-a-page" asset for the launch post (1080 × 1350)
```

## A note on font dependency

The wordmark and tagline text in the SVGs is set in **Fraunces** (a Google Font), referenced by `font-family` rather than outlined to paths. Practical implications:

**Will render correctly in:** browsers with internet access, HTML pages that load Fraunces (the eventual landing page), any context that has Fraunces installed locally.

**Will NOT render correctly in:** GitHub README inline `<img>` embeds, Figma SVG imports, `Preview.app`, image viewers without font loading.

For places that don't load fonts, use the **PNG export** rather than the SVG directly. The launch card (`launch-card/peckish-launch-card-1080x1350.png`) and OG card B (`og-cards/og-B-markled.png`) are pre-rendered for exactly this case.

The icon-only SVGs (`logos/icon-*.svg`) and the favicons are **fully portable** — no font dependency.

## Logos

| File | Use for |
|------|---------|
| `logos/icon-color.svg` | Square icon contexts, app icon, social avatar |
| `logos/icon-mono-light.svg` | Single-colour icon on light backgrounds |
| `logos/icon-mono-dark.svg` | Single-colour icon on dark backgrounds |
| `logos/logo-color.svg` | Full wordmark, default brand mark |
| `logos/logo-mono-light.svg` | Wordmark on light backgrounds, single-colour |
| `logos/logo-mono-dark.svg` | Wordmark on dark backgrounds, single-colour |

## Lockups

For narrow contexts where the wordmark-with-icon-inside-the-*i* doesn't fit. Icon and wordmark side-by-side.

| File | Use for |
|------|---------|
| `lockups/lockup-horizontal-color.svg` | Email signatures, header bars, narrow banners |
| `lockups/lockup-horizontal-mono-light.svg` | Same on light backgrounds, single-colour |
| `lockups/lockup-horizontal-mono-dark.svg` | Same on dark backgrounds, single-colour |

## OG cards

All three are 1200 × 630, the standard Open Graph and Twitter Card aspect ratio. All carry the same primary tagline: *"Stop staring at the fridge."*

| File | Composition | Use when |
|------|-------------|----------|
| `og-cards/og-A-typeled.svg` | Wordmark dominant on Chalk, tagline as kicker | Safe default, most contexts |
| `og-cards/og-B-markled.svg` | Big mark on Lemon ground, wordmark + tagline on right | Launch moments, highest visual energy in a feed |
| `og-cards/og-C-sceneled.svg` | Split — *"What's for dinner?"* left, Peckish answers right | Posts that benefit from a captured-moment feel |

`og-cards/og-B-markled.png` is pre-rendered for the GitHub repo social-preview card (which requires raster).

## Favicons

| File | Embed at |
|------|----------|
| `favicons/favicon.ico` | `/favicon.ico` (root) |
| `favicons/favicon.svg` | `/favicon.svg` (root, modern browsers prefer this) |
| `favicons/apple-touch-icon-180.png` | `/apple-touch-icon.png` (root, iOS add-to-home) |
| `favicons/android-chrome-192.png` | Referenced in `site.webmanifest` |
| `favicons/android-chrome-512.png` | Referenced in `site.webmanifest` |
| `favicons/maskable-512.png` | Referenced in `site.webmanifest` with `"purpose": "maskable"` |
| `favicons/og-favicon-600.png` | Square preview asset for socials that crop to square |

### HTML head snippet

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

### `site.webmanifest` icons block

```json
{
  "icons": [
    { "src": "/android-chrome-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/maskable-512.png",       "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## Launch card

`launch-card/peckish-launch-card.html` is the source HTML — single-page brand summary at 1080 × 1350, designed to be screenshotted and posted on LinkedIn as a launch artefact. The accompanying PNG is `launch-card/peckish-launch-card-1080x1350.png`.

If the brand evolves, re-render the PNG by opening the HTML in Chrome, sizing the window to 1080 × 1350, and screenshotting the `.stage` element.

## Colour reference

| Token | HEX | Role |
|-------|-----|------|
| Lime | `#3DB14B` | Primary green. Sprout, links, success states |
| Tangerine | `#FF6A1A` | Heat. Seed, CTAs, warm half of any composition |
| Lemon | `#FFD12B` | Accent. Highlights, OG ground (variant B), never body text |
| Chalk | `#FFFEF6` | Default ground, the page itself |
| Paper | `#FAF6E2` | Secondary ground, cards, recipe blocks |
| Ink | `#11160A` | All body text, mono mark variant, dark mode ground |

Full WCAG-AA contrast matrix is in the brand book.

Peckish · Favicon & app icon set
================================
Source: Brand Book v2 (Citrus / Sprout)

favicon.svg                Modern browsers prefer this — vector, transparent.
favicon.ico                Multi-size .ico (16/32/48). Drop in /public root.
favicon-16.png             16×16 transparent.
favicon-32.png             32×32 transparent.
favicon-96.png             96×96 transparent (used by some Android browsers).

apple-touch-icon-180.png   180×180, chalk ground (iOS rounds the corners on add-to-home).

android-chrome-192.png     192×192, chalk ground. Standard Android.
android-chrome-512.png     512×512, chalk ground. PWA install icon.
maskable-512.png           512×512, chalk ground, icon padded to 60% safe zone (Android adaptive).

og-favicon-600.png         600×600, chalk ground. Square preview asset for socials that crop to square.

HTML head snippet
-----------------
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png">
  <link rel="manifest" href="/site.webmanifest">

site.webmanifest entry
----------------------
  "icons": [
    { "src": "/android-chrome-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/maskable-512.png",       "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]

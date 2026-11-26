# Moubon V13.5.1 — Licence and Asset Audit

## Self-hosted fonts

- Noto Sans Bengali regular and bold WOFF2 subsets.
- Noto Serif Bengali bold WOFF2 subset.
- Licence: SIL Open Font License 1.1.
- Licence notice supplied at `public/assets/fonts/OFL-Noto.txt`.
- Fonts are self-hosted; no Google Fonts or other font CDN is requested at runtime.

## JavaScript and browser tooling

- Website runtime: project-authored vanilla JavaScript and CSS; no runtime npm dependency.
- Playwright `1.56.1`, Lighthouse `13.6.0` and pngjs `7.0.0` are development/QA dependencies only.
- No Lenis or other smooth-scroll vendor library is shipped. Native scrolling is retained because keyboard, touch, screen-reader and anchor behaviour could not be fully browser-proven in this environment.
- No third-party icon pack or external runtime icon service is used. Brand marks and decorative SVG paths are local project artwork.

## Artwork and photography

- Hero painterly images, boat cut-out, water texture, bank panels and foreground reeds were supplied with the project archive. The six current River Story MP4 clips were supplied by the owner for integration; confirm the relevant generation/service terms and rights for public/commercial use before launch. Poster frames are derived from those clips.
- Confirm that the site owner holds the rights required for public and commercial use before launch.
- Product photography has not been supplied; the shop remains unpublished until real photos and product facts are added.

## Audio

- `public/assets/tiger-growl-demo.wav` is a supplied demo/sample sound.
- Its commercial-use licence is **NOT CONFIRMED**. Replace it with an owned/licensed file or obtain written licence confirmation before commercial use.
- No ambient audio file is shipped or requested by a visible control in V13.

## QA tooling

- Playwright, Lighthouse and pngjs are pinned development dependencies. Their licences and transitive notices are provided by the package metadata installed through `npm install`.
- No third-party vendor JavaScript is copied into `public/vendor/`.

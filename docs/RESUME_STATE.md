# Moubon V13.5.1 — Completion State

## Current source

`Moubon_Cinematic_V13.5.1.zip` is based on the user's latest V13.4.0 source project and integrates the six newly uploaded story videos.

## Completed

- Mapped the six clips to the intended story sequence: footprints, tiger, honey discovery, smoke preparation, honey harvest, golden gift.
- Re-encoded all six clips as five-second 1280×720, 24 fps H.264 MP4 files without audio.
- Extracted one WebP poster frame from each clip.
- Replaced the old public still-image/cinemagraph scene media with the new MP4/poster system.
- Implemented active-scene-only video loading; previous video pauses and unloads when the scene changes or the chapter leaves view.
- Added poster fallback for reduced-motion, explicit Save-Data, screenshot-lab and autoplay-blocked states. Low-power hardware still plays only the active clip.
- Removed the old artificial scene overlay effects.
- Narrowed the water channel to 28% desktop, 32% tablet and 40% mobile before mud shoulders.
- Reduced boat size and retained the winding route, one-boat model, alternating desktop/tablet story lanes and mobile upper shelf.
- Updated Windows QA instructions, video verification, screenshot assertions, changelog and progress documentation.

## V13.5.1 playback compatibility fix

- Normal browsing now plays the focused MP4 even on devices with four or fewer CPU cores or 4 GB or less memory; only one clip is loaded at once.
- Explicit reduced-motion and Save-Data preferences still use poster frames.
- The local development server sends `.mp4` files as `video/mp4`.

## Build-environment verification

The source syntax check passed, automated regression tests passed (72/72), production build passed, all six MP4/poster assets passed verification, and river bank/boat assets passed verification. Exact results are recorded in `QA_REPORT.md`. Exact results and build size are in `QA_REPORT.md`. Video and bank asset checks are recorded there as well.

## Owner-side publication tasks

1. Run `npm install`.
2. Run `npx playwright install chromium`.
3. Run `npm run river:shots` and inspect `qa-screenshots/river/river-contact-sheet.html`.
4. Run `npm run lighthouse` if Lighthouse scores are needed.
5. Fill the real HTTPS domain, WhatsApp number, published product data/photos/prices and claim evidence in `config.js`.
6. Replace or confirm the commercial-use licence for `tiger-growl-demo.wav`.

## Measurement limits

The ZIP is a completed implementation package, but local Windows screenshot appearance, Lighthouse scores, LCP/CLS/FPS, Android/4G performance and Safari/Firefox/Edge rendering are not marked measured unless those runs are completed. The prelaunch gate intentionally remains blocked by owner-supplied fields.

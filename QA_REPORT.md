# Moubon V13.5.7 — QA Report

## V13.5.7 verification

| Check | Result | Details |
|---|---|---|
| `npm run check` | **PASS** | JavaScript syntax checks, including the new story-audio and V13.5.7 regression test. |
| `npm test` | **PASS** | 82 tests passed; 0 failed, 0 skipped. |
| `npm run build` | **PASS** | 70 files generated; `dist/` size 12.71 MB. |
| `npm run river:verify-videos` | **PASS** | All six MP4s and six WebP poster fallbacks verified within size budgets. |
| `npm run river:verify-assets` | **PASS** | Boat feathering, three cut-outs, six responsive bank composites and seamless water verified. |
| Browser screenshot review | **NOT MEASURED** | The Playwright package/browser runner was unavailable in this environment; run the screenshot suite on Windows before publishing. |

### V13.5.7 change-specific checks

- The fixed `JOURNEY` meter is now a bottom-centre horizontal pill, so it no longer sits over the alternating right-side story card.
- Desktop story cards are wider and their captions use a stronger, soft dark contrast layer.
- Story 1's phase label `ভোরের সতর্কতা` is suppressed while the existing scene title and copy remain.
- Story 2 no longer renders the visible tiger-sound button. Its existing growl audio is attempted automatically when the `tiger` scene becomes active and is paused/reset when leaving that scene.
- If the browser blocks audible autoplay, playback waits for the next tap/click or keyboard interaction while Story 2 remains active. This is a browser policy limitation, not something a website can override.
- The English `MOUBON` header wordmark is reduced to 88% of the Bengali wordmark size on desktop and 86% on mobile; both remain inline.

### Browser QA still required on the owner's machine

After `npm install` and `npx playwright install chromium`, run `npm run river:shots` and inspect the desktop, tablet and mobile contact sheets. Confirm tiger audio behaviour in Chrome and on a phone, since audible autoplay policies vary by browser and prior user interaction.

---

# Moubon V13.5.1 — QA Report

## Commands run in the build environment

| Command | Result | Details |
|---|---|---|
| `npm run check` | **PASS** | All JavaScript and QA script syntax checks completed. |
| `npm test` | **PASS** | 72 tests passed; 0 failed, 0 skipped. |
| `npm run build` | **PASS** | 66 files generated; `dist/` size 13,143,006 bytes (12.53 MiB). |
| `npm run river:verify-videos` | **PASS** | All six MP4s and six WebP posters exist, have valid file signatures and meet size budgets. |
| `npm run river:verify-assets` | **PASS** | Three cut-out assets, boat feathering, six responsive bank composites and seamless water verified. |
| `npm run prelaunch` | **FAIL — owner configuration only** | 11 checks passed; 4 publication blockers remain (real SITE_URL, WhatsApp number, one published product, claim evidence/approval). See `PRELAUNCH_REPORT.md`. |

## Story video measurements

All six optimized website videos were inspected with `ffprobe`.

| Scene | Codec | Dimensions | Frame rate | Duration | MP4 bytes |
|---|---|---:|---:|---:|---:|
| 01 — Footprints | H.264 | 1280×720 | 24 fps | 5.000 s | 1,522,841 |
| 02 — Tiger | H.264 | 1280×720 | 24 fps | 5.000 s | 1,311,390 |
| 03 — Discovery | H.264 | 1280×720 | 24 fps | 5.000 s | 1,495,997 |
| 04 — Smoke | H.264 | 1280×720 | 24 fps | 5.000 s | 1,474,188 |
| 05 — Harvest | H.264 | 1280×720 | 24 fps | 5.000 s | 1,404,646 |
| 06 — Golden Gift | H.264 | 1280×720 | 24 fps | 5.000 s | 1,179,667 |

- Total MP4 bytes: **8,388,729** (about 8.00 MiB).
- Total poster bytes: **835,562** (about 0.80 MiB).
- Each MP4 is below the 1.8 MB budget; each poster is below the 180 KB budget.
- MP4s are muted/no-audio in the website; only the active story video is assigned a `src`. The previous active video is paused and unloaded.
- Reduced-motion, explicit Save-Data and screenshot-lab modes use poster frames extracted from the same videos. Low-power hardware plays only the active clip.

## River geometry and asset checks

- Source-geometry water width before mud shoulders: 28% desktop, 32% tablet and 40% mobile. Unit tests verify the SVG dimensions at 1440px, 768px and 390px viewport widths.
- Boat width is reduced at desktop, tablet and mobile breakpoints to fit the narrower channel.
- Desktop/tablet story positions alternate left/right. Mobile uses a top story shelf with the boat lower in the viewport.
- Responsive bank composites: desktop 512×5535, tablet 256×7700 and mobile 160×7400; all six composite files passed their alpha-edge and byte-budget checks.
- Water texture opposite-edge maximum RGB delta: 18 vertical and 13 horizontal; mean edge deltas remain within 2.5.
- Public static story cut-outs and the old generated four-second motion WebPs were removed from the website assets. Original supplied paintings remain archived in `docs/source-art/` and are not used as the River Story display.

## MEASURED / NOT MEASURED

| Item | Status | Evidence / limitation |
|---|---|---|
| JavaScript syntax | **MEASURED — PASS** | `npm run check`. |
| Automated regression tests | **MEASURED — PASS** | 72/72 tests. |
| Production build | **MEASURED — PASS** | 66 files, 12.53 MiB `dist/`. |
| Six video codecs, dimensions, frame rate and duration | **MEASURED — PASS** | `ffprobe` on all six optimized MP4s. |
| Video/poster file signatures and size budgets | **MEASURED — PASS** | `npm run river:verify-videos`. |
| River-bank alpha edges and water texture seams | **MEASURED — PASS** | `npm run river:verify-assets`. |
| Source-geometry creek widths | **MEASURED — PASS** | SVG geometry tests at desktop/tablet/mobile widths. |
| Browser screenshot appearance | **NOT MEASURED** | System Chromium and Python Playwright were available, but browser navigation to the local dev server was blocked by the environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). No visual PASS is claimed. |
| Normal MP4 autoplay/playback in Chrome | **NOT MEASURED** | Runtime source logic, MP4 assets and correct `video/mp4` development-server response are tested; browser navigation was blocked by the environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). |
| Full-site Playwright screenshots | **NOT MEASURED** | Requires local `npm install` and `npx playwright install chromium`. |
| River Story 45-screenshot matrix | **NOT MEASURED** | Run `npm run river:shots` on Windows and inspect the contact sheet. |
| Lighthouse Performance / Accessibility / Best Practices / SEO scores | **NOT MEASURED** | No Lighthouse run completed. |
| LCP, CLS, FPS, Android/4G performance | **NOT MEASURED** | Requires browser/device measurement. |
| Safari, Firefox and Edge visual rendering | **NOT MEASURED** | No cross-browser session completed. |
| Fresh dependency vulnerability audit | **NOT MEASURED** | `npm install` did not complete in this environment; run `npm audit` after installing locally. |
| Production publication readiness | **BLOCKED BY OWNER INPUTS** | Four prelaunch failures remain; do not publish until the verified values are supplied. |

## Owner-side next checks

On Windows, from the extracted project folder:

```powershell
npm install
npx playwright install chromium
npm run dev
```

Open `http://localhost:5173/` and review the River Story on desktop and mobile. Then run:

```powershell
npm run river:shots
npm run lighthouse
npm run qa
npm audit
```

The final ZIP excludes `dist/`, `node_modules/` and any local browser cache. Rebuild with `npm run build` after installation. Do not use `npm audit fix --force` without reviewing the proposed breaking changes.

# Moubon Upgrade Progress — V13 baseline through V13.3.1 River Story

> The Phase 1–4 entries below record the original V13 baseline. The V13.3 section at the end supersedes the river implementation details; hero, jar, shop, SEO and deployment work remain unchanged.

## V13 baseline — Phase 1: Real Sundarbans river and environment (historical)

- **Asset inspection findings:** desktop hero is 1672×941 (16:9) and mobile hero is 941×1672 (0.563 portrait); neither contains text or a logo, and both are full-bleed compositions rather than edge-faded panels. `bank-a.webp` and `bank-b.webp` are 1024×1536 (2:3); their river-facing edge samples are close to, but not exactly, `#0a371f` (about RGB 11,56,32 and 8,58,29), so the placement keeps a soft gap and adds CSS top/bottom feathering. `water-texture.webp` is 1254×1254 and has olive/honey colour variation with non-identical tile edges; it is used only as two offset low-opacity overlays, never as the water base. `foreground-reeds.webp` is 2124×740 (2.87:1); its top edge is already dark-green-faded and its bottom edge is full-bleed, matching the requested strip treatment. The hero files had doubled extension naming; all image names are now normalized and the doubled-extension test is active. No text or logo was found in the inspected art.
- **Done:** inspected the supplied hero, bank, water and foreground artwork (dimensions, aspect ratios, edge fades and palette); normalized doubled extensions; generated painterly desktop/mobile AVIF and WebP hero sources; optimized the bank, water, reeds, forest-atmosphere and social-preview images; generated 800px scene variants and a lazy-loaded 800px boat source; rebuilt the river with a dark green-teal channel, irregular wet-mud banks, foam, tree reflections, offset water texture, warm sky tint and thin glints; added alternating/mirrored bank panels, three parallax depths, lazy-loaded environment images, foreground reeds, mist, light shafts, fireflies, birds and soft ripples; moved captions outside the organically feathered painting and set the requested minimum type sizes; connected the hero tagline to `config.js` and watchlisted “নির্মল ও খাঁটি”.
- **In progress:** the implementation has not been visually inspected in a real browser because Playwright/Chromium could not be installed in this sandbox.
- **Remaining:** run `npm run shots` on Windows and tune only if screenshots show real issues at 390, 768, 1312, 1440 and 1920 CSS px. Review the Bengali copy inventory.

## Phase 2 — Scroll feel, jar and seams

- **Done:** kept native reversible scrolling, fixed-header anchor offsets, Skip Story and the progress indicator; retained the reversible 0–100% honey fill and existing scroll-velocity-linked drip timing; tuned the jar/forest palette and added shared chapter-transition colours and lower-page content-visibility hints.
- **In progress:** visual jar and chapter-boundary review is waiting for local screenshots.
- **Remaining:** none in code. No Lenis/inertia layer was shipped because touch, keyboard, screen-reader, anchor, progress and reversibility behaviour could not be fully proven in a browser here.

## Phase 3 — Shop, SEO, accessibility and performance

- **Done:** removed fake product/business values; set `demoMode:false` and an empty product list; unpublished products do not render; added painterly empty-image slots, availability and size variants, Bengali/English number formatting, Bangladeshi mobile validation, item/quantity/total WhatsApp handoff, the no-number setup state, optional Messenger, and data-gated trust/FAQ/delivery/payment/footer fields; added owner template/checklist; updated canonical/share metadata and build-generated JSON-LD/sitemap/robots; generated a 1200×630 social image; added 404/noscript fallbacks, Vercel headers, deployment instructions, focus loops, 44px targets, responsive WebKit mask/SVH fallbacks and low-power/reduced-motion paths.
- **In progress:** owner-supplied domain, WhatsApp number, product data/photos, policies and claim evidence are not available.
- **Remaining:** owner configuration and evidence review; local contrast, Lighthouse and cross-browser checks.

## Phase 4 — QA tooling, prelaunch gate and package

- **Done:** added Playwright screenshot/overflow/console/boat-count/rotation/empty-area tooling; mobile/desktop Lighthouse runner; prelaunch gate; `npm run qa` orchestrator; Windows instructions; licence audit; Bengali text inventory; and owner documents. Moved the master upgrade specification to `docs/MASTER_UPGRADE_SPEC.md`.
- **Measured code QA:** `npm run check` PASS; `npm test` PASS (34/34, including all 21 retained regression tests); `npm run build` PASS (60 files, 3.58 MiB). `npm run dev` returned the V13 page successfully.
- **Blocked:** `npm install --package-lock-only` could not reach `registry.npmjs.org` (`EAI_AGAIN`). Therefore Playwright/Lighthouse screenshots and reports were not run; no `node_modules/` or incomplete lockfile is included.
- **Prelaunch:** 11 checks PASS; 4 owner blockers FAIL (placeholder SITE_URL, empty WhatsApp number, no published real product, unverified visible tagline claim). Details are in `PRELAUNCH_REPORT.md`.
- **Remaining:** run `npm install`, `npx playwright install chromium`, `npm run shots`, `npm run lighthouse` and `npm run qa` on Windows after filling verified owner data.

## Asset and performance measurements

- Hero desktop/mobile WebP: 232,856 / 233,258 bytes (each under 250 KB).
- Bank A/B: 187,164 / 145,846 bytes (each under 200 KB).
- Water texture: 87,670 bytes; forest atmosphere: 147,130 bytes (both under 150 KB).
- Open Graph image: 1200×630, 213,958 bytes (208.9 KiB).
- Conservative initial static-resource size estimate: 817,741 bytes (0.780 MiB), counting HTML, CSS, imported JS, all local fonts, hero AVIF, forest backgrounds, grain and favicon. This is a file-size sum, not a measured browser waterfall.

## MEASURED / NOT MEASURED

- **MEASURED:** supplied/optimized image dimensions and file sizes; source syntax; 34 automated tests; static build size; local development server; prelaunch structural asset/SEO checks.
- **NOT MEASURED:** screenshot appearance, empty-area detector output, Lighthouse scores, browser LCP/CLS, FPS, text contrast, real Android/4G behaviour, Safari/iOS/Firefox/Edge appearance and commercial rights for supplied artwork/audio.


## V13.1 River chapter

- DONE: alpha-baked scene/bank/reed assets, seamless water texture, source-art archive and deterministic bake/verification scripts.
- DONE: sticky-stage/camera-following architecture, centreline SVG river, viewport-edge parallax, single boat, six scene vignettes, reduced-motion sequence and fixed-progress lab.
- DONE: river screenshot automation and unit tests for contrast, route geometry, cut-out references and old-layer removal.
- IN PROGRESS: run local Playwright screenshot matrix and visually review the contact sheet on Windows.
- NOT MEASURED: actual browser appearance, Android performance, LCP/CLS/FPS and cross-browser rendering.


## V13.2 River composition correction

- **Reviewed:** owner's 19-second screen recording at 1366×768. It showed an almost invisible water channel, an indistinct boat, repeated oversized bank panels, reeds covering the lower story area and paintings that were too easy to miss.
- **Done:** reduced the forest frame to one panel per side; put the panel container behind the river; widened and brightened the channel; raised the water-to-forest contrast; reduced the reeds to a shallow lower frame; placed reeds behind the boat and scene art; increased boat size and warm edge separation; moved the camera anchor lower; enlarged the scene-art lane.
- **Preserved:** hero, intro, jar, shop, SEO, config, deployment, all original six paintings, existing Bengali story copy, audio control, route centreline, reversible scroll, reduced-motion path and single-boat structure.
- **Automated QA:** `npm run check` PASS; `npm test` PASS (41/41); `npm run build` PASS (61 files, dist 4.19 MB); `npm run river:verify-assets` PASS (16 cut-out assets plus boat and water-seam checks).
- **In progress:** owner should run `npm run river:shots` on Windows and inspect `qa-screenshots/river/river-contact-sheet.html`.
- **NOT MEASURED:** actual browser screenshots, visual quality after CSS compositing, horizontal overflow at target viewports, console errors in a real browser, Android performance, FPS, LCP/CLS and cross-browser rendering.


## V13.3 Hybrid River Story redesign

- **Video audit used:** the owner's latest desktop recording showed an invisible river channel, disconnected/repeated bank panels, boat contact issues, competing story paintings, distracting centreline dots, weak progress UI and a hard chapter boundary.
- **Done:** made SVG paint-server fills local to the inline artwork; removed stylesheet gradient/pattern fill overrides; kept the water channel light-mid and wide; interleaved two transparent bank artworks per side with half-panel offsets; removed the old composite bank strip; hid the dotted centreline; reduced inactive stop markers and ambient clutter.
- **Done:** one active painting at a time, captions below artwork, more balanced side lanes, calmer boat contact shadow/reflection/wake, shallow reeds, mobile horizontal progress pill and a river-to-bridge fade.
- **Preserved:** original six paintings, Bengali story copy, tiger-roar control, route centreline, ±24° boat rotation, native reversible scrolling, reduced-motion story, hero, jar, shop, SEO, config and deployment files.
- **Automated:** added tests for inline SVG paint servers, one-scene visibility at 101 progress samples, two-layer bank backgrounds, progress rail fill and chapter transition; screenshot lab now checks visible scene count, local water fill and two bank layers.
- **MEASURED:** `npm run check` PASS; `npm test` PASS (45/45); `npm run river:verify-assets` PASS (15 cut-outs plus boat/water checks); `npm run build` PASS (60 files, 3.98 MB).
- **NOT MEASURED:** actual Chrome screenshot appearance, horizontal overflow in a browser, console errors, flat-area detector, Android/4G performance, FPS, LCP/CLS and cross-browser rendering. The sandbox browser blocked local navigation, so local Windows screenshots remain required.
- **NOT MEASURED:** `npm install` timed out in this environment, so Playwright/Chromium screenshots were not run.
- **Remaining:** on Windows run `npm install`, `npx playwright install chromium`, `npm run river:shots`; inspect `qa-screenshots/river/river-contact-sheet.html` and `RIVER_SHOTS_REPORT.md`.


## V13.3.1 — Windows screenshot-lab initialization hotfix

- Fixed a temporal-dead-zone runtime error: `pending` is now initialized before `setupRiverStory()` can synchronously invoke the render scheduler in fixed-progress lab mode.
- Added a regression test that verifies this initialization order.
- Corrected the screenshot QA report so the flat-area detector reports **NOT RUN**, not PASS, when zero screenshots were captured.
- The user's Windows run reported `Cannot access 'pending' before initialization`; the previous 0/45 capture is treated as a failed browser QA run.
- Browser screenshot suite remains **NOT MEASURED** in this environment; rerun `npm run river:shots` with local Playwright/Chromium.


## V13.3.2 — Owner screenshot audit corrections

- **Owner-run evidence reviewed:** the supplied 45-image screenshot ZIP covers 360×740, 390×844, 768×1024, 1440×900 and 1920×1080 at nine fixed scroll positions. The owner's terminal output confirms 45/45 captures, zero browser/page errors, zero horizontal overflow, and 46/46 unit tests on V13.3.1.
- **Visual defects confirmed in those screenshots:** the water was pale and road-like; long dashed glints resembled lane markings; wet-mud shoulders created thick dark dividers; the same bank art repeated in stacked CSS tiles; the boat contact shadow was too heavy; caption shading looked too rectangular; and mobile scene paintings were not visible above the moving river layer.
- **Done in source:** replaced the pale water with a deep green-teal gradient; generated responsive desktop/mobile bank-world composites (desktop 320×7620 px; mobile 320×3840 px; each under 200 KB) to remove CSS tile repetition; reduced bank widths/shadows; replaced vertical glint tracks with short cross-channel reflections; softened the caption radial shade and boat contact shadow; explicitly raised the story layer above the moving water/fade layers while keeping the boat above story art; upgraded the Lighthouse dev tool to 13.6.0 based on the supplied npm audit remediation range.
- **QA tooling updated:** screenshot report now checks one non-repeating bank image per side, active painting visibility and story-layer ordering above the river/fade. Asset verification checks the long bank composites. Regression tests cover the new water palette, scene layer, bank assets, and glint geometry.
- **MEASURED in this environment:** `npm run check` PASS; `npm test` PASS (50/50); `npm run build` PASS (64 files, `dist/` 4.60 MB); `npm run river:verify-assets` PASS (15 cut-outs, boat feather, seamless water and four bank composites); `npm run prelaunch` reports 11 PASS / 4 expected owner blockers. Desktop bank strips: 320×7620 px (197,568 / 198,874 bytes); mobile strips: 320×3840 px (126,120 / 125,804 bytes).
- **MEASURED by owner on V13.3.1:** `npm run river:shots` 45/45; `npm run check` PASS; `npm test` 46/46; `npm run build` PASS (60 files, 3.98 MB). These are pre-patch results, not V13.3.2 verification.
- **NOT MEASURED yet for V13.3.2:** local Chrome screenshot matrix, visual result after fixes, Lighthouse scores, npm audit result after Lighthouse upgrade, Android/4G performance, FPS, LCP/CLS and Safari/Firefox/Edge rendering.
- **Remaining:** owner to extract V13.3.2, run `npm install`, `npx playwright install chromium`, `npm run river:shots`, `npm run check`, `npm test`, `npm run build`, and `npm audit`; upload the new `RIVER_SHOTS_REPORT.md`, selected screenshots and npm audit output. Do not publish until owner domain, WhatsApp, product data and claim evidence are supplied.


## V13.3.3 — River environment initialization hotfix

- **Owner-run V13.3.2 evidence:** `npm install` reported 0 vulnerabilities; `npm run check` PASS; `npm test` 50/50 PASS; `npm run build` PASS (64 files, 4.60 MB); `npm run river:verify-assets` PASS. The owner's `npm run river:shots` run captured 0/45 and failed on `worldWidth is not defined` before `#riverWorld svg` appeared.
- **Root cause:** `renderRiverEnvironment()` was declared outside `setupRiverStory()` but read the controller-local `worldWidth` variable. This free identifier caused the River Story setup to throw before the SVG was measured/rendered.
- **Done:** passed the initial measured viewport width into `renderRiverEnvironment()`; introduced `getBankWorldAsset(side, viewportWidth)` for deterministic responsive bank paths; reused it in resize measurement; added tests for mobile/tablet/desktop breakpoints and to ensure the environment renderer does not reference the controller-local `worldWidth`.
- **MEASURED in this environment:** `npm run check` PASS; `npm test` PASS (51/51); `npm run build` PASS (64 files, 4.60 MB); `npm run river:verify-assets` PASS.
- **Owner-reported:** fresh `npm install` found 0 vulnerabilities on V13.3.2. V13.3.3 changes no dependencies; no new install was completed in this sandbox.
- **NOT MEASURED:** V13.3.3 browser screenshot suite / actual Chrome appearance; Lighthouse; LCP/CLS/FPS; Android/4G and Safari/Firefox/Edge. A sandbox `npm install` attempt timed out, so Playwright/Chromium screenshots could not be rerun here.
- **Remaining:** extract V13.3.3, run `npm install`, `npx playwright install chromium`, then `npm run river:shots`. Confirm all 45 captures and no browser errors before treating River Story as visually verified.


## V13.3.4 — opening-frame visual review

- **DONE:** Reviewed owner screenshot `1920x1080/p-0.00.png`. The flat-area detector finding is an intentional title-safe negative-space region; it should not be filled with decorative noise.
- **DONE:** Narrowly scoped the detector exception to desktop p=0.00 upper central title-safe tiles only. All mobile and non-opening frames remain subject to the detector.
- **DONE:** Added tapered channel entry/exit geometry and reduced the wet-mud shoulder thickness.
- **DONE:** Rebuilt long bank composites from alternating bank-a/b artwork with crossfaded segment joins.
- **NOT MEASURED:** Browser screenshot QA for V13.3.4, actual motion at scroll speed, Lighthouse, Android/4G performance, FPS, LCP/CLS and cross-browser rendering.
- **OWNER ACTION:** Run `npm install`, `npx playwright install chromium`, then `npm run river:shots` on Windows and share `qa-screenshots/river/RIVER_SHOTS_REPORT.md` plus the contact sheet.


## V13.3.5 — opening-frame negative-space correction

- **Owner evidence reviewed:** V13.3.4 owner run reported `npm install` 0 vulnerabilities, `npm run check` PASS, `npm test` 57/57 PASS, `npm run build` PASS (64 files, 4.70 MB), asset verification PASS and screenshot capture 45/45. Browser/geometry assertions passed, but the flat-area detector still flagged `1920x1080/p-0.00.png` at sample grid 8,24 after the upper title-safe tiles were excluded.
- **Visual inspection:** the uploaded opening screenshot shows a real dark-green gap between the narrow river inlet and the narrow forest strips. The flagged lower-left tile is outside the title area. The opening-title negative space itself remains intentional and should stay quiet.
- **Done in source:** widened the river inlet taper to a 28% minimum over a 16% ramp; expanded desktop bank artwork to 46vw/860px; added separate aspect-matched desktop/tablet/mobile bank assets with different left/right crop sequences; increased soft forest-depth gradients only along the outer sides; retained the central title-safe area.
- **Assets:** desktop 512×5535, tablet 256×7700, mobile 160×7400. Per-asset budgets are 260 KB, 210 KB and 150 KB respectively; edge alpha remains transparent.
- **Added:** responsive asset selection tests, taper regression test, six-file asset verification and V13.3.5 visual composition tests.
- **NOT MEASURED:** V13.3.5 browser screenshot appearance, Lighthouse, LCP/CLS/FPS, Android/4G and Safari/Firefox/Edge. Owner must run `npm run river:shots` and inspect the contact sheet.

- **Build-environment limitation:** `npm install` timed out in this sandbox, and managed Chromium blocked local HTTP navigation, so V13.3.5's Playwright screenshot matrix was not run here. This does not replace the required owner-side Windows screenshot run.


## V13.3.6 — deterministic River screenshot-lab hotfix

- **Done:** the fixed-progress screenshot lab now calls the renderer synchronously and returns explicit requested/rendered/ARIA values.
- **Done:** screenshot QA now reports the exact viewport, requested progress and actual progress when synchronization fails; the previous opaque 4-second wait is removed.
- **Preserved:** all V13.3.5 visual assets, responsive bank compositions, river geometry, original six scene illustrations, Bengali story copy and production scrolling behaviour.
- **MEASURED:** syntax check, unit/regression tests, production build and asset verification are run for this package.
- **NOT MEASURED:** Playwright browser screenshots, screenshot appearance, Lighthouse, LCP/CLS/FPS, Android/4G and cross-browser behaviour. The sandbox cannot complete dependency installation/browser navigation.
- **Remaining:** owner reruns `npm install`, `npx playwright install chromium`, `npm run river:shots`, then uploads `qa-screenshots/river/RIVER_SHOTS_REPORT.md` and the contact sheet.


### V13.3.6 source verification results

- `npm run check`: PASS.
- `npm test`: PASS — 63/63 tests, 0 failures.
- `npm run build`: PASS — 66 files, 5.14 MB `dist/`.
- `npm run river:verify-assets`: PASS — 15 cut-outs, boat feather, seamless water and six responsive bank composites.
- `npm run prelaunch`: 11 PASS / 4 FAIL, all four are owner blockers (placeholder domain, empty WhatsApp number, no published product, and unverified tagline claims).
- `npm run river:shots`: NOT MEASURED in this build environment; must be rerun by the owner on Windows with Chromium.


## V13.4.0 — Hybrid Cinematic River Story redesign

- **Done:** used the latest V13.3.6 source as the base; preserved the approved six paintings, all Bengali story copy and site section order.
- **Done:** narrowed the creek to 38% desktop / 36% tablet / 45% mobile before mud shoulders; changed the entry/exit taper to a wider 48% minimum over a 22% ramp.
- **Done:** desktop paintings occupy left/right bank lanes outside the creek safe zone. Tablet/mobile use a top story shelf with a separate lower boat lane.
- **Done:** generated six transparent 4,000ms animated WebP loops (384×256); each uses 40 source frames with duplicate-frame coalescing, preserving a 4-second loop. Total motion assets: 3.85 MiB; each is loaded only for its active scene.
- **Done:** added scene-specific CSS atmosphere for leaves, pollen, reeds, bees, smoke, honey drops/threads and light sweeps. Previous scene motion is unloaded back to its still painting.
- **Done:** low-power/reduced-motion and screenshot-lab modes use static images; added motion builder/verifier and layout assertions.
- **MEASURED:** `npm run check` PASS; `npm test` PASS (69/69); `npm run build` PASS (72 files, 9.01 MB `dist/`); `npm run river:verify-motion` PASS; `python scripts/verify-cutouts.py` PASS (15 cut-outs, boat alpha, water and six responsive bank composites).
- **NOT MEASURED:** Playwright screenshots for V13.4.0, contact-sheet appearance, Lighthouse, Android/4G, FPS, LCP/CLS, Safari/Firefox/Edge. Must be run on the owner's Windows machine.
- **Important motion scope:** the loops add camera movement and subject-adjacent atmosphere; they do not create full articulated movement for the painted people or tiger. That requires a separate image-to-video generation step.
- **Owner blockers:** real SITE_URL, verified WhatsApp number, at least one real published product with real photo/price, and evidence-backed tagline claims remain required before publication.


## V13.4.0 — Owner handoff additions

- Added `docs/SCENE_VIDEO_PROMPTS.md` with six scene-specific image-to-video prompts and shared constraints to preserve the approved paintings.
- Clarified the motion boundary: current WebP loops are four-second camera push/drift cinemagraphs with light scene-adjacent CSS effects; they do not animate the painted characters' articulated limbs or faces.
- Created a separate six-scene animated WebP preview for owner review; it is not loaded by the website and is not part of the production ZIP.
- **NOT MEASURED:** owner-side V13.4.0 Windows screenshots/contact-sheet review, Lighthouse, LCP/CLS/FPS, Android/4G, cross-browser rendering, and a fresh V13.4.0 npm audit.


## V13.5.1 — ensure supplied story films play on modest hardware

- **FIXED:** normal River Story playback no longer suppresses the active MP4 solely because the device reports four or fewer CPU cores or 4 GB or less memory. Only one focused clip is loaded at a time, so the six videos are not downloaded or decoded together.
- **FIXED:** the local development server now serves `.mp4` files as `video/mp4` instead of the generic binary MIME type.
- **PRESERVED:** explicit reduced-motion, browser Save-Data, screenshot-lab and autoplay-blocked poster fallbacks.
- **PRESERVED:** the six supplied MP4s, poster frames, alternating left/right story layout, Bengali copy, river path, boat movement and all other site sections.
- **ADDED:** regression tests for normal playback on low-power hardware, correct local MP4 MIME type and poster fallback for explicit motion/data-saving preferences.
- **MEASURED:** `npm run check` PASS; `npm test` PASS (72/72); `npm run build` PASS (66 files, 12.53 MiB); `npm run river:verify-videos` PASS; `npm run river:verify-assets` PASS.
- **NOT MEASURED:** physical Windows/mobile autoplay behaviour and real-device performance; run the River Story browser QA after extracting this package.

## V13.5.0 — owner-supplied cinematic video integration

- **DONE:** located the latest V13.4.0 source package and integrated all six newly uploaded Google Flow clips in the intended story order: footprints, tiger, discovery, smoke, harvest and golden gift.
- **DONE:** measured the six source clips at 1280×720, 24 fps and 5 seconds. Re-encoded them as optimized H.264 MP4 files without audio; extracted matching WebP poster frames.
- **DONE:** changed scene rendering from static/animated images to real MP4 video elements. Only the active scene receives a video source; inactive clips are paused and unloaded. Reduced-motion, low-power, autoplay-fallback and screenshot-lab states use poster frames from the same clips.
- **DONE:** removed the old public story stills and four-second generated motion WebPs, plus the obsolete WebP motion generator/verifier. The original supplied art remains archived under `docs/source-art/` and is not used as the River Story display.
- **DONE:** removed artificial CSS scene overlays for bees, smoke, honey drops and shimmer so the generated video motion is not covered by scripted effects.
- **DONE:** reduced water width before mud shoulders to 28% desktop, 32% tablet and 40% mobile; reduced boat size; kept the winding centerline and single boat; desktop/tablet stories alternate left/right and mobile uses an upper story shelf.
- **DONE:** updated screenshot assertions, video asset verification, QA orchestration, Windows instructions and owner-facing documentation.
- **MEASURED:** `npm run check` PASS; `npm test` PASS (70/70); `npm run build` PASS; `npm run river:verify-videos` PASS; `npm run river:verify-assets` PASS. Exact build file count/size is recorded in `QA_REPORT.md`.
- **NOT MEASURED:** real Windows/Chromium River Story screenshot appearance, Lighthouse scores, LCP/CLS/FPS, Android/4G and cross-browser visual rendering unless separately reported by the owner. The screenshot lab uses posters and does not itself prove normal MP4 playback on a physical device.
- **OWNER REMAINING:** run `npm install`, `npx playwright install chromium`, `npm run river:shots`, inspect the contact sheet, fill real publication configuration, and confirm the demo tiger-growl sound licence before commercial launch.

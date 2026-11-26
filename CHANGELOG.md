# Changelog

## V13.5.7 — River story readability and automatic tiger audio
- Moved the journey progress indicator to a compact bottom-centre horizontal pill so it no longer covers right-side story cards.
- Increased desktop story-card width and improved caption contrast over the forest background.
- Hid the Story 1 phase label “ভোরের সতর্কতা”.
- Removed the Story 2 tiger-sound button; the existing tiger sound now attempts to play automatically when Story 2 becomes active and stops when leaving that scene.
- Added a browser autoplay-policy fallback: if audible autoplay is blocked, playback begins on the next visitor tap/click or keyboard interaction while Story 2 remains active.
- Reduced the English MOUBON header wordmark slightly while keeping it inline with the Bengali wordmark.

# Changelog

## V13.5.6 — forest-glass footer and bilingual header wordmark

- Replaced the footer's cream paper-style panel with a forest-green glass treatment, subtle gold borders and softer lighting to match the site's Sundarbans palette.
- Increased footer navigation, collection copy, labels and legal text sizes for clearer reading on desktop and mobile.
- Set the English MOUBON wordmark to the same CSS font size as the Bengali wordmark while keeping the bee emblem and text on one horizontal line.
- Added responsive footer spacing and narrow-screen header sizing for phones.
- No product, checkout, River Story content, assets or ordering logic intentionally changed.

## V13.5.1 — River Story video playback compatibility fix

- Fixed the playback gate so modest hardware (four or fewer CPU cores or 4 GB or less memory) still plays the currently focused story MP4. The site continues to load only one clip at a time.
- Added the correct `video/mp4` response MIME type to the local development server so browser playback is correctly identified during local testing.
- Kept poster-only behaviour for explicit reduced-motion, browser Save-Data, screenshot-lab and autoplay-blocked states.
- Preserved all six supplied videos, their matching posters, story order, alternating left/right layout, Bengali captions, river animation and the rest of the website.
- Added regression coverage for low-power playback and explicit poster-fallback modes.

## V13.5.0 — six owner-supplied cinematic films and narrower Sundarbans creek

- Integrated the six newly uploaded five-second MP4 story clips in the intended sequence: tiger footprints, tiger in the mangroves, honeycomb discovery, smoke preparation, honey harvest and golden gift.
- Re-encoded the supplied clips as 1280×720, 24 fps, H.264 MP4 files without audio; extracted matching WebP poster frames from the same videos.
- Replaced the old public static scene images and generated four-second WebP cinemagraphs with the six real video clips.
- Added active-scene-only playback: one video source loads at a time; previous clips pause and unload when the scene changes or the River Story leaves the viewport.
- Added poster fallback for reduced-motion, low-power, screenshot-lab and autoplay-blocked states.
- Removed artificial CSS bee, smoke, honey-drop and shimmer overlays so the generated video motion remains natural and unobstructed.
- Narrowed the creek to 28% desktop, 32% tablet and 40% mobile width before mud shoulders; reduced the boat to fit the new channel.
- Kept the existing Bengali story copy, winding route, one-boat model, hero, intro, jar, shop, SEO and deployment configuration.
- Desktop/tablet story films alternate left/right; mobile uses a compact upper story shelf.
- Added MP4/poster asset verification and updated River Story screenshot assertions, QA commands, Windows instructions and documentation.
- No new Bengali copy was added. Existing visible claims and owner-supplied shop fields remain unchanged.

## V13.3.5 — opening-frame composition and responsive mangrove banks

- Reviewed the owner's 1920×1080 opening screenshot. The near-flat finding at sample grid 8,24 is a real empty side region below the title-safe area, not an intentional title background.
- Expanded desktop mangrove banks to reach toward the river and strengthened the low-opacity forest-depth atmosphere while preserving the quiet central title-safe zone.
- Rebuilt bank-world art as six aspect-matched variants: desktop 512×5535, tablet 256×7700 and mobile 160×7400; left and right banks now use distinct crop sequences and opposite starting artwork rather than mirrored copies of the same strip.
- Widened the distant inlet taper from 12% to 28% of the channel width and softened the taper over a longer 16% run to reduce the funnel/road impression.
- Added responsive bank-asset selection and updated alpha-edge, dimensions and per-breakpoint byte-budget verification.
- Added regression tests for the wider inlet, six responsive bank assets, and forest widths at desktop/tablet/mobile breakpoints.
- Browser screenshot appearance remains **NOT MEASURED** until the owner runs the V13.3.5 Windows screenshot suite.

## V13.3.4 — River entry and visual QA refinement

- Confirmed the 1920×1080 p=0.00 flat-area finding is the intentional dark-green title-safe area above the river, not an unplanned blank region.
- Updated the flat-area detector to exclude only the upper 26% central title-safe tiles at the opening desktop frame; all mobile tiles and every other scroll position remain checked. The report explicitly counts excluded tiles.
- Added a tapered river entry/exit so the channel no longer begins as a full-width rectangular pool at the visible edge.
- Reduced the wet-mud/outer-bank shoulder thickness for a more natural creek edge.
- Rebuilt the long desktop/mobile bank composites from alternating bank-a and bank-b artwork with vertical crossfades, reducing repeated horizontal panel seams.
- Added regression coverage for the taper geometry and the narrowly scoped title-safe detector exception.
- Browser screenshot rendering remains owner-measured; no browser visual PASS is claimed by this package alone.

## V13.3.3 — River initialization hotfix

- Fixed the `worldWidth is not defined` browser error during River Story setup. `renderRiverEnvironment()` now receives the initial measured viewport width explicitly instead of reading a controller-local variable outside its scope.
- Added a shared `getBankWorldAsset(side, viewportWidth)` resolver for initial and resize-time desktop/mobile bank selection.
- Added regression coverage for 360px, 680px, 681px and desktop widths, invalid bank sides, and the environment renderer's scope boundary.
- Preserved responsive bank selection after viewport resize.
- No Bengali copy or visual artwork changed in this hotfix.

## V13.3.2 — River Story visual audit corrections

- Darkened the river to a deep green-teal channel and reduced the broad pale sheen.
- Replaced road-like vertical dashed glints with short, irregular cross-channel reflections.
- Reduced the wet-mud shoulder width and dark bank-shadow opacity.
- Replaced repeated CSS bank tiles with responsive desktop/mobile bank-world composite pairs (desktop 320×7620 px; mobile 320×3840 px; all under 200 KB).
- Raised the story artwork above the moving river/fade layers so all six paintings can display on mobile; kept the boat above the artwork.
- Softened the caption's local radial shade and reduced the boat's contact-shadow size and opacity.
- Updated screenshot QA to check active painting visibility, layer order, and one non-repeating bank image per side.
- Updated the Lighthouse development tool to 13.6.0, the patched version indicated by the supplied audit report.
- No new Bengali copy added.

# Moubon V13.3 — Changelog

## V13.0.0 — cinematic environment and publication readiness (22 November 2026)

### Phase 1 — Sundarbans river and environment

- Normalized all six doubled-extension environment/hero image names; added painterly desktop/mobile AVIF and optimized WebP hero sources with breakpoint preloads.
- Rebuilt the river as a dark olive-green/teal tidal channel with irregular polygon banks, wet mud, foam edges, tree reflections, warm journey tint, thin glints and two offset water-texture patterns.
- Added alternating/mirrored bank panels, three parallax speeds, lazy image loading, foreground reeds, mist/light shafts, low-power-gated fireflies and slow bird silhouettes.
- Moved every scene caption outside its masked painting. Replaced the rectangular overlay treatment with one organic radial feather and WebKit/Safari mask fallback. Minimum scene text remains 14px / 12px / 10px / 12px.
- Connected the hero tagline to `config.js`; the existing “নির্মল ও খাঁটি” wording remains the default but is explicitly watchlisted for owner verification.
- Generated 800px scene variants, an 800px boat source, optimized the supplied environment images and regenerated the 1200×630 Open Graph image from the painterly hero.

### Phase 2 — scroll, jar and chapter seams

- Retained native browser scrolling, reversible progress and the existing jar fill/drip timing. No inertia-scroll library was shipped because complete touch, keyboard, screen-reader, anchor and reversibility behaviour could not be browser-proven here.
- Added shared forest/river/honey transition palette tokens and lower-page content-visibility hints.
- Reduced-motion mode keeps all six scene captions readable and fixes the boat in the viewport while the river chapter is visible.

### Phase 3 — shop, SEO, accessibility and performance

- Removed starter sample product/business data; `demoMode` is false and `products` is empty. Unpublished products never render.
- Added painterly empty-image slots, unavailable states, size variants, optional Bengali/English number formatting, Bangladeshi mobile validation and a WhatsApp message containing items, quantities, total and customer details.
- Added a friendly order-not-configured state, optional Messenger handoff, and data-gated trust, FAQ, delivery, payment and footer-business content.
- Added owner checklist/template, 404 page, readable noscript story, Vercel headers, Vercel/Netlify deployment instructions, focus loops, 44px touch targets, responsive mask fallbacks and low-power/reduced-motion gating.
- `SITE_URL`, WhatsApp number, products, prices, product photos, policies and claims remain empty/unverified until supplied by the owner.

### Phase 4 — QA tooling and package

- Added pinned Playwright, Lighthouse and pngjs development dependencies; screenshot runner at 390×844, 768×1024, 1440×900 and 1920×1080; overflow, console, one-boat, ±24° rotation and empty-area assertions.
- Added mobile/desktop Lighthouse runner, prelaunch gate and `npm run qa` orchestrator.
- Added `QA_HOW_TO.md`, `PRELAUNCH_REPORT.md`, `OWNER_CHECKLIST.md`, `docs/BENGALI_TEXT_REVIEW.md`, `docs/LICENSES.md` and `docs/PROGRESS.md`; moved the master specification to `docs/MASTER_UPGRADE_SPEC.md`.
- The final ZIP excludes `dist/` and `node_modules/`.

### NEW COPY — owner approval required

The following Bengali strings were introduced in V13 UI or fallback states. Please proofread them before publication:

1. “অর্ডার ব্যবস্থা এখনো চালু হয়নি। ব্যবসার WhatsApp নম্বর যোগ হলে অর্ডার পাঠানো যাবে।”
2. “বাংলাদেশি মোবাইল নম্বর 01XXXXXXXXX আকারে লিখুন।”
3. “পণ্যটি এই মুহূর্তে পাওয়া যাচ্ছে না।”
4. “পণ্যের ছবি যোগ করা হয়নি।”
5. “পণ্যের যাচাইকৃত বিবরণ যোগ করা হয়নি।”
6. “মোট পণ্যমূল্য: {total}” (WhatsApp order-message total line)
7. “ব্যবসা”, “ঠিকানা”, “ফোন”, “ইমেইল”, “ফেরত নীতি” and “ডেলিভারি নীতি” (configurable footer labels)
8. “নদীপথের ছয়টি গল্প”
9. “চলমান গল্প দেখতে JavaScript চালু করুন। এখানে ছয়টি গল্পের মূল লেখা দেওয়া হলো।”
10. “পৃষ্ঠা পাওয়া যায়নি | মৌবন” (404 page title)
11. “এই পাতাটি খুঁজে পাওয়া যায়নি।”
12. “নদীপথের গল্পে ফিরে চলুন।”
13. “মৌবনের শুরুতে ফিরুন”

Existing six scene titles, scene descriptions and phase labels were retained without rewriting. The full Bengali string inventory is in `docs/BENGALI_TEXT_REVIEW.md`.

### V13 measurement notes

- Optimized asset dimensions and file sizes: **MEASURED**.
- V12.1 baseline: `npm run check` PASS, `npm test` 21/21 PASS, `npm run build` PASS.
- V13 screenshot run, Lighthouse, LCP, CLS, FPS, real-device Android/4G and cross-browser appearance: **NOT MEASURED** in this sandbox; run the Windows instructions in `QA_HOW_TO.md`.

---

# Moubon V12.1 — Changelog

## V12.1 — maintenance release (21 November 2026)

V12.1 is a focused correction release on top of V12.0.0. It does not begin Round 2 or implement any of the remaining workstreams.

### Boat direction and rotation

- Corrected the route tangent sign to `-Math.atan2(dx, deltaY)` so the boat leans with the river bend rather than away from it.
- Clamped route lean to `-24deg` through `+24deg` and applied a 0.22 low-pass smoothing factor.
- Connected `RIVER_ROUTE.boatBaseRotation` (`-30deg`) to the boat through the inherited `--boat-base-rotation` CSS custom property; the CSS no longer hardcodes the base angle.

### River typography

- Enforced minimum river text sizes at mobile, tablet and desktop breakpoints: description 14px, phase 12px, label 10px and scene sound button 12px.
- Increased text contrast and strengthened the soft radial readability gradient without adding a border or caption card.

### Dead CSS cleanup

- Grep/source-reference audit removed 40 unused class selectors: `.ambient-action`, `.ambient-bees`, `.ambient-canopy`, `.ambient-footprints`, `.ambient-harvest`, `.ambient-honey`, `.ambient-wildlife`, `.b2`, `.collector-hand`, `.comb-swarm`, `.d2`, `.d3`, `.footprint-shine`, `.forest-bird`, `.forest-depth`, `.forest-traveler`, `.gold-flow`, `.harvest-drop`, `.hero-link`, `.honey-spark`, `.in-view`, `.mouyal-look`, `.product-size`, `.roar-ring`, `.s2`, `.search-lantern`, `.shore-light`, `.smoke`, `.smoke-layer`, `.smoke-two`, `.story-world-v7`, `.swarm`, `.swarm2`, `.swarm3`, `.tiger-breath`, `.tiger-mouth`, `.tiger-roar`, `.track-scan`, `.world-sunlight` and `.world-vignette`. This includes all six selectors named in the request.
- Removed 38 unused keyframe definitions from the retired sprite-era effects.
- Preserved live classes generated from scene configuration or JavaScript templates, including `.left`, `.right`, `.product-variant`, `.bee-*` and `.smoke-*`.

### Regression coverage restored

- Kept all 16 existing V12 tests and restored five distinct regression tests: checkout fields/WhatsApp handoff; robots/sitemap/manifest/favicon and social-preview assets; versionless footer/no external tracking; low-power adaptation; and reversible honey-jar progress/finale.
- Added behavioural assertions to the existing boat-orientation test for sign, clamp and smoothing.
- Final suite: 21/21 passing.

### V12.1 validation

- `npm run check`: PASS.
- `npm test`: 21/21 PASS.
- `npm run build`: PASS; 48 files, 3.14 MB `dist/`.
- CSS parser audit: 0 parse errors; 0 unused keyframes remain.
- Browser screenshots at 390, 768 and 1440 CSS pixels: NOT MEASURED; headless Chromium timed out before navigation completed. Responsive typography was checked against the applicable CSS breakpoint rules, but no visual screenshot verification is claimed.

V12 is based on the supplied V11 project. This delivery is intentionally limited to Phase 0, Phase 1 and workstreams A, B, D, D2 and K. The approved site structure, Bengali story titles/copy, hero, jar, poetry and shop remain in place.

## Phase 0 — Inventory and baseline

- Extracted the supplied `Moubon_Cinematic_V11` archive and inventoried the project tree, source modules, scripts, tests, configuration and handover docs.
- Confirmed the starting version was `11.0.0`; output is `12.0.0`.
- Baseline before edits: `npm run check` PASS, `npm test` 20/20 PASS, `npm run build` PASS (72 files, 8.56 MB in `dist/`).

## Phase 1 — Audit

- Verified V11 already had one stylesheet link and zero `!important` declarations; the five separate CSS files mentioned in the supplied audit were not present in this archive.
- Verified `main.js` already cached layout geometry outside the scroll loop, but `river.js` still iterated all six scenes every active frame.
- Verified the old 12-frame sprite/canvas pipeline remained active through `scene-performance.js`, with scene config pointing to `v7-*` fallback art and `v9-*-action` sheets.
- Verified the six new still paintings and transparent boat were present in the archive but not connected to the river story. They were stored with doubled suffixes (`scene-1.webp.webp` … `scene-6.webp.webp`, `boat.webp.webp`).
- Verified the river world still used forest-photo backgrounds, a flat route treatment and oval scene masks; the scene caption structure still used the older number/label card layout.
- V11 did not contain the original five separately linked stylesheets or a live `getBoundingClientRect()` call in the scroll renderer; those findings were not repeated as defects.

## A. Architecture and code quality

- Expanded the single design-token file with the forest-edge palette, spacing scale, radii, shadows, three motion durations, three easing curves and z-index map.
- Kept one CSS entry (`src/moubon.css`) and its declared cascade layers; added the V12 river presentation in the existing utilities layer without adding another stylesheet.
- Replaced the sprite-specific scene config with one normalized still-art config: IDs, Bengali phase/title/copy lines, English labels, sides, normalized route positions, image dimensions/paths, camera paths, colour grades and ambient effects.
- Added `src/story/scene-renderer.js` as the still-scene renderer and visibility controller. Removed `src/scene-performance.js` and its canvas/sprite frame pipeline.
- Replaced the fixed 5200px route coordinate dependency with a normalized river centerline. SVG path Y values, scene positions and boat positions are derived from the measured responsive river-world height.
- Preserved vanilla JS and the existing isolated hero, river, jar, shop and audio modules. Added JSDoc to the new public scene/route functions.

## B. Scroll engine and motion

- Kept native browser scrolling and smooth anchor navigation; no heavy scroll dependency was added. Scroll progress remains reversible when moving up or down.
- Kept layout reads in `measureLayout()` and resize/observer callbacks; the river renderer performs no `getBoundingClientRect()` reads.
- Changed scene updates from all six articles to only the nearest scene and its transition neighbour. IntersectionObserver toggles scene visibility so ambient effects pause outside the viewport.
- Added a restrained 18% speed modulation around the six scene markers; the mapping is monotonic and reversible.
- Kept three shared motion durations and three easing curves. Added staggered line-by-line text reveals and pointer-only magnetic movement for selected buttons on fine-pointer desktop devices.
- `scroll-padding-top` and section scroll margins preserve fixed-header anchor offsets; reduced-motion disables decorative animation.

## D. River Story

- Replaced all six 12-frame sprite sheets with the supplied still illustrations (`scene-1.webp` … `scene-6.webp`).
- Replaced the old boat art with the supplied transparent `boat.webp`, applied the requested -30° base rotation in CSS, then layered route-direction rotation in JavaScript.
- Preserved exactly one `#boat` and exactly one “চলো যাই মধুর খোঁজে” chapter heading.
- Rebuilt the winding river as layered SVG strokes for bank shadow, earth/moss banks, water, reflections, foam and current shimmer.
- Kept the tiger-roar control user-initiated and the optional ambient sound toggle OFF by default.

## D2. Story vignette redesign

- Removed the old ellipse-only mask and dark UI caption-card composition. New vignettes use a multi-gradient organic mask, the artwork's baked-in green edge fade, a soft local mist plane and a borderless radial text-darkening layer.
- Set the river-world base to the artwork's deep green edge colour family (`#0a371f`) with subtle gradients/mist and low-opacity grain; removed the busy photographic forest background from the river chapter.
- Integrated phase label, title, short copy and a faint outline numeral into each painted vignette. No caption box, left border or numbered circle remains.
- Limited desktop vignette width to 34% with a clear river-centre gap. On mobile, vignettes become near-full-width and alternate above/below the river stop rather than being squeezed beside it.
- Added per-scene colour grades, scroll-linked camera push/pan, bees, smoke wisps, honey drips, water glints and leaf sway as restrained CSS effects.
- Added a contact shadow, wake rings, waterline mist, soft reflection and bobbing to the single boat. Stop markers glow as the boat approaches.
- The scene art remains still; this is 2.5D camera motion and ambient compositing, not real character animation or separated 3D depth.

## K. Quality assurance

- Replaced V11 tests with V12 tests for the still-art scene config, route normalization, single boat/title, asset existence, responsive CSS, reduced motion, accessibility hooks, metadata, and absence of the old sprite pipeline.
- Browser screenshot coverage and command results are recorded in `QA_REPORT.md`; screenshots are included under `qa/screenshots/` if the browser runner completed successfully.

## New Bengali copy — owner review

The existing six Bengali titles and story descriptions were retained. The following six small phase labels are new copy for review:

1. “ভোরের সতর্কতা”
2. “বনের নীরবতা”
3. “মৌচাকের দেখা”
4. “প্রস্তুতির ক্ষণ”
5. “সোনালি সংগ্রহ”
6. “সোনালি উপহার”

No other Bengali story paragraph was rewritten. Clear original Bengali typos corrected: none.

## Intentionally out of scope this round

Workstreams C, E, F, G, H, I and J were not redesigned. Existing hero, honey-jar, typography, shop, SEO, accessibility and performance-budget features were retained except for compatibility fixes required by the new river scene renderer.

## V13.1 — River story redesign

- Replaced the page-scrolling collage with a pinned sticky stage and a camera-following boat; the route remains reversible and eases at the six configured story stops.
- Rebuilt the SVG river around the centreline with a brighter teal-green channel, seamless texture as the primary fill, wet mud banks, mangrove-root strokes, tree reflections, foam and sparse warm glints.
- Baked transparent alpha into all six scene paintings, both bank panels and the foreground reeds; added deterministic source and verification scripts.
- Added a repeating transparent bank-strip composite, viewport-edge far/near parallax, one foreground-reed layer and a reduced ambient set.
- Enlarged and clarified the single boat with a contact shadow, short V-wake, reflection and warm rim light.
- Moved scene captions outside the paintings and removed rectangular scene grades, mist planes and CSS-mask feathering.
- Added fixed-progress `?lab=1` mode and `npm run river:shots` for five viewports and nine progress positions.
- Preserved all existing Bengali story copy and the six original paintings; no new visible Bengali copy was added.


## V13.2.0 — River story composition refinement

- Reviewed the owner's screen recording and corrected the specific visual failures: the river was visually lost, duplicated bank strips crowded the frame, foreground reeds hid the boat, and the story paintings did not read clearly.
- Removed the duplicated near/far bank-panel stack; now one transparent panel frames each side, behind the SVG river.
- Widened the water channel to 48% of desktop width and 58% of mobile width, with a lighter teal-sage centre and stronger contrast against the forest.
- Reordered the visual layers so bank panels sit behind the river, foreground reeds sit behind the story art and boat, and the boat is the clearest foreground object.
- Reduced the foreground reeds to a shallow lower frame; increased boat size and warm rim/shadow separation.
- Enlarged and repositioned the six existing paintings for clearer scene reading; kept their original art and all Bengali story copy unchanged.
- Moved the camera anchor lower to give the title and scene paintings more breathing room while keeping the boat on the river centreline.
- Updated automated tests for the new contrast thresholds, two-bank composition, layer order, and boat/scene prominence.
- No new Bengali copy was introduced.
- Browser screenshot appearance, actual viewport overflow, mobile rendering and performance remain **NOT MEASURED** until `npm run river:shots` is run locally.


## V13.3.0 — Hybrid cinematic/painterly River Story redesign

- Fixed the SVG paint cascade: water, mud, reflections and texture now retain their local inline-SVG gradient/pattern fills; removed stylesheet paint-server overrides that could make the river disappear.
- Kept the river wide and clearly lighter than the forest, with a brighter sage centre, darker teal edges, wet-mud shoulders, thin foam and restrained warm glints.
- Replaced the single repeated composite bank strip with two interleaved transparent forest artworks per side, offset by half a panel so top/bottom fades overlap instead of forming horizontal seams.
- Changed the story choreography to show one focused painting at a time; the active stop fades in/out without a second neighbouring panel competing for attention.
- Refined the boat's contact shadow, reflection, V-wake and warm rim light; reduced the lower reeds and moved ambient effects behind the story art.
- Reworked the journey rail for desktop and mobile, including a visible progress fill, and blended the river chapter into the bridge section.
- Preserved the hero, intro, jar, shop, SEO, configuration, deployment files, all six original paintings, Bengali copy and tiger-roar control.
- Added source-level tests for local SVG paint servers, one-scene visibility, interleaved bank layers and responsive progress UI.
- **NEW COPY:** none. Existing Bengali copy is unchanged.
- **NOT MEASURED:** actual browser screenshots, Lighthouse, LCP/CLS/FPS, Android/4G performance and cross-browser appearance until the Windows screenshot lab is run.


## V13.3.1 — River screenshot lab runtime hotfix

- Fixed the initialization-order bug reported by the owner on Windows: `pending` is now declared before `setupRiverStory()` can synchronously request an animation frame in `?lab=1` mode.
- Added a regression test to prevent the render-scheduler temporal-dead-zone error from returning.
- Updated `river:shots` reporting so zero screenshots produce a **NOT RUN** flat-area result rather than a misleading PASS.
- No Bengali copy, artwork, hero, jar, shop, SEO, configuration or deployment settings were changed.
- Browser screenshot appearance remains **NOT MEASURED** until the updated screenshot suite passes on Windows.


## V13.3.6 — deterministic screenshot-lab hotfix

- Fixed the V13.3.5 screenshot runner's fragile fixed-progress synchronization. The lab setter now applies the requested value and renders synchronously after page initialization, then returns the requested progress, last rendered progress and accessible progress-bar value.
- Replaced the generic 4-second `waitForFunction` timeout with an immediate expected-vs-actual diagnostic. Scene artwork still waits for its real image load before capture.
- No River artwork, Bengali story copy, route geometry or live scrolling behaviour was intentionally changed. This is a QA harness determinism fix, not a claim that the browser suite has passed.
- Browser screenshot matrix and visual appearance remain **NOT MEASURED** until the owner reruns `npm run river:shots` on Windows.


## V13.4.0 — Hybrid Cinematic River Story

- Reduced the central creek width to 38% desktop, 36% tablet and 45% mobile (before the narrow mud shoulders); widened and softened the opening taper to avoid a funnel-like inlet.
- Moved desktop story paintings into left/right bank lanes with an explicit central river safe zone. Tablet and mobile use a separate upper story shelf; the boat remains in the lower river lane.
- Generated six transparent, looping four-second animated WebP assets from the six approved paintings. Each loop uses restrained camera push/drift; only the active scene loads its motion asset. The previous scene returns to its static image.
- Added scene-specific four-second atmosphere: leaf/pollen drift, reed sway and canopy light, bees, smoke, honey drops/threads and warm jar highlights.
- Added low-power, reduced-motion and screenshot-lab fallbacks. The lab intentionally uses static art for deterministic screenshots.
- Added reproducible motion-asset builder/verifier, channel-width and story-lane browser assertions, and 6 new regression tests.
- Preserved all six paintings, Bengali copy, section order, hero, honey jar, shop, SEO, single boat, native scroll and route geometry. **NEW COPY: none.**
- **Important limitation:** these are cinemagraph-style camera/atmosphere loops, not full AI image-to-video character animation. The original flattened paintings do not contain separate body/limb layers.
- **NOT MEASURED:** owner-side Windows screenshots, Lighthouse, real Android/4G performance, LCP/CLS/FPS and cross-browser visual appearance.


## V13.4.0 — Hybrid Cinematic River Story

- Reduced the central creek and reserved separate bank-side story lanes on desktop, with an upper story shelf on tablet/mobile.
- Added six four-second transparent animated WebP camera loops from the approved paintings; only the active scene loads its motion asset.
- Added scene-specific atmosphere for leaves, pollen, reeds, bees, smoke, honey drops/threads and warm highlights.
- Preserved still-image fallbacks for low-power, reduced-motion and deterministic screenshot-lab modes.
- Added motion generation/verification scripts and `docs/SCENE_VIDEO_PROMPTS.md` for a future full image-to-video upgrade.
- **Motion scope:** these are cinemagraph-style camera loops, not full character animation. Full articulated movement requires separately generated and reviewed video clips.

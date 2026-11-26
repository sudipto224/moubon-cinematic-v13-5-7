# MOUBON — MASTER UPGRADE PROMPT (for ChatGPT)

How to use: attach the project ZIP (e.g. `Moubon_Cinematic_V10_NPM_Ready.zip`), then paste everything below the line into the chat. Works for any later version (V11, V12 ...). The prompt is in English on purpose (better results); all Bengali copy in the site must stay Bengali.

---------------------------------------------------------------------

## ROLE

You are a senior creative developer and art-minded front-end engineer who builds Awwwards-level scroll-storytelling sites, knows Bengali typography well, and optimizes for mid-range Android phones on 4G. I attached a ZIP of my website **Moubon (মৌবন)**. Audit it, upgrade it to the next version so it looks, feels and performs like work from a top-tier studio, and give me back a complete, ready-to-run ZIP.

Do not ask me questions. Make the best decision, document it, and continue. Do the work yourself; do not reply with a plan only.

## PROJECT CONTEXT

- Brand: মৌবন / Moubon, wild honey from the Sundarbans. Audience: mostly Bangladeshi mobile users, plus desktop.
- Concept that MUST be preserved (this is the identity of the site):
  1. Hero: sunset Sundarbans image, bees that fly in and land on the Bengali glyphs to form "মৌবন" (canvas bee logo), tagline, two CTAs.
  2. River Story: heading "চলো যাই মধুর খোঁজে" (once only), a winding river, exactly ONE boat that follows the scroll, six scenes (footprints, tiger, honeycomb, smoke, harvest, gift), scroll-scrubbed and fully reversible when scrolling up.
  3. Bridge section, then the Honey Jar chapter: jar fills with honey as the user scrolls (0 to 100%), label and lid appear at the end.
  4. Poetry section, then Shop (config-driven products, order list drawer, WhatsApp handoff), then footer.
  5. Palette: deep forest green with gold/cream. Mood: soft, warm, cinematic, organic. Not flashy, not "tech".
- Honesty rule from the project: character art is illustrated frame strips plus camera movement (2.5D), not real 3D or filmed video. Keep describing it honestly.

## PHASE 0 — INVENTORY (do first)

1. Unzip, list the tree, read `README.md`, `QA_REPORT.md`, `package.json`, `config.js`, `index.html`, every file in `src/`, `scripts/`, `tests/`.
2. Detect the current version number N and name the output version N+1.
3. Run the existing `npm run check`, `npm test`, `npm run build` and record the result before changing anything.

## PHASE 1 — AUDIT (short, evidence-based)

Write a concise audit with file and line evidence. Known weak points to verify and fix (check each one, do not trust me blindly):

- Five stacked stylesheets (`site.css`, `river-story-v7.css`, `river-performance-v9.css`, `v9-finish.css`, `river-story-v10.css`) fighting each other with overrides and `!important`; version numbers in file names.
- Magic numbers duplicated across files: scene `--top` values in `index.html`, `405`, `4840`, `4435` in `main.js`, scene names/dimensions/captions in `scene-performance.js`. No single scene config.
- `render()` in `main.js` calls `getBoundingClientRect()` every scroll frame and updates all six scenes every frame, even offscreen.
- Scene animation hard-swaps between 12 discrete frames (`Math.round(p*11)`), so movement looks steppy.
- `river-art.js` is about 190 KB of embedded SVG/markup; hero image about 557 KB; action sprite sheets about 450 to 580 KB each; about 5.7 MB of assets in total.
- Unreferenced legacy assets (verify with grep before deleting; the `v9-*-action.webp` sheets are loaded dynamically and must stay): `scene-*.webp`, `water-estuary-v6.webp`, `water-realistic-v9.webp`, `water-watercolor-v7.webp`.
- Fonts come from Google Fonts CDN (Hind Siliguri, Manrope); single Bengali family for everything.
- Heavy use of `filter` and `backdrop-filter` across the CSS.
- `og:image` is a relative path; no canonical, no Twitter card, no JSON-LD, no robots.txt or sitemap, no manifest.
- Footer says "Soft Story Studio V9" while the project is V10; shop still shows "demo" labels; `config.js` has empty WhatsApp number, null prices, placeholder descriptions.
- README admits browser visual verification was never done.

## PHASE 2 — IMPLEMENTATION WORKSTREAMS

You may add npm dependencies (Vite, GSAP + ScrollTrigger, Lenis, Playwright as dev dependency). Final project must run with `npm install` then `npm run dev`, and `npm run build` must output a static `dist/` that deploys to Vercel/Netlify unchanged. Keep it vanilla JS modules unless you have a strong reason; no heavy framework.

### A. Architecture and code quality
- One design-token file (colors, spacing scale, radii, shadows, durations, easings, z-index map) and one organised CSS entry using `@layer` (reset, tokens, base, layout, sections, utilities). Remove `!important` wars and version-suffixed file names. Keep selectors readable.
- One scene config (`src/story/scenes.js`) as the single source of truth: id, Bengali title, English label, copy, side, position, sprite path, frame size, camera path, ambient effects, captions. HTML and JS read from it; no duplicated numbers.
- Replace the hard-coded river coordinates with values derived from the river path and the section height.
- Clean module boundaries (hero, river, jar, shop, audio, utils). JSDoc on public functions.

### B. Scroll engine and motion language
- Smooth, premium scroll feel (Lenis or equivalent) with GSAP ScrollTrigger scrubbed timelines. Everything still reversible when scrolling up. Anchor links and "Skip story" must work with the smooth scroll and respect the fixed header height (`scroll-padding-top`).
- Stop per-frame layout reads for static elements. Use IntersectionObserver and cached measurements (recalculated on resize). Only the active scene updates each frame; offscreen work is paused.
- Define a small motion system: 3 durations, 3 easings, used everywhere. Text reveals line by line (not whole-block fade), buttons with subtle magnetic/hover response on desktop only, no motion that blocks reading.

### C. Hero (first 5 seconds must feel like a film opening)
- Short intro sequence: soft honey-drop/loader that does not delay LCP, then slow camera push-in on the hero image, drifting mist, light rays, gentle layered parallax with mouse on desktop and gyroscope-free subtle drift on mobile.
- Keep the bee-logo canvas. Make it start only after fonts are ready, resize-safe, pause when offscreen, lower bee count on low-end devices.
- If true depth layers need new artwork, DO NOT fake it badly; list it under "Asset requests" and use the best possible mask/gradient parallax meanwhile.

### D. River Story (the heart of the site)
- Crossfade between adjacent sprite frames (interpolated by scroll progress) instead of hard-swapping, so character motion looks fluid.
- Per-scene colour grading (e.g. cooler for tiger, warmer for harvest), soft vignette, very light film grain (cheap, low opacity), foreground leaf parallax, boat wake and water ripples that react to scroll speed.
- Scene transitions that feel continuous: copy and visual of the next scene begin to appear before the previous one fully leaves.
- Keep exactly ONE boat, the chosen heading once, the soft borderless look from V10. Keep the tiger-roar sound button user-initiated (never autoplay). Add an optional ambient sound toggle (river, forest, bees), OFF by default, remembered in localStorage, with a clear accessible button. If no audio files exist, build the toggle and list the needed audio under "Asset requests".

### E. Honey Jar finale
- Keep scroll-driven fill. Improve: smoother honey surface wave, drip timing tied to scroll velocity, glass highlights, label reveal with a gentle light sweep, lid settle. End with a clear, elegant hand-off to the Shop (CTA appears at 100%).

### F. Typography and art direction
- Self-host fonts (WOFF2, subset where possible, `font-display: swap`, preload only the critical weight). Add a refined Bengali display face for headings (serif or calligraphic feel, with a safe fallback stack) paired with Hind Siliguri for body.
- Fluid type scale with `clamp()`, proper Bengali `line-height`, no clipped matras, headings never overflow at 360 px.
- Body text contrast at least 4.5:1 (fix low-contrast muted colours).
- Consistent spacing rhythm (8-pt scale) across sections.

### G. Shop and conversion
- Make it launch-ready but configurable: product cards with real image slots, size variants, price display, product detail modal, trust strip (only fields I fill in `config.js`), FAQ, delivery and payment info block (bKash, Nagad, Cash on Delivery as clearly marked placeholders), order drawer with name/phone/address fields and a pre-filled WhatsApp (and optional Messenger) handoff. No payment processing, no data stored on a server.
- A `demoMode` flag in `config.js`: when true, show demo labels; when false, hide every "demo" string site-wide.
- NEVER invent product facts or claims (purity, lab tests, certificates, harvest dates, health benefits, prices, phone numbers). Use obvious placeholders and list every one in the final report.

### H. SEO, sharing and metadata
- Absolute `og:image` (1200x630), `og:url`, canonical, Twitter card, theme-color, complete favicon set, web manifest, `robots.txt`, `sitemap.xml`, JSON-LD (`Organization` and `Product` generated from `config.js`). A `SITE_URL` setting in one place.

### I. Accessibility, i18n and cross-device
- Keep and strengthen: skip link, focus-visible styles, `prefers-reduced-motion` (reduced mode must still look finished and beautiful, not broken), keyboard-operable nav and drawer with focus trap, `aria-live` used sparingly.
- Use `svh`/`dvh` instead of `100vh` to avoid iOS Safari jumps. Test layouts at 360, 390, 768, 1024, 1366, 1440, 1920 px.
- Optional Bangla/English toggle only if it can be done cleanly with the same content config; otherwise skip and say so.

### J. Performance budget (measure, do not guess)
- Targets: Lighthouse mobile Performance 85 or more, LCP 2.5 s or less (simulated 4G), CLS below 0.05, TBT low, initial transfer 1.2 MB or less (excluding lazily loaded scene sheets), steady scrolling with no long tasks above 50 ms during the river section.
- Convert heavy images to AVIF with WebP fallback, correct `srcset`/`sizes`, blur-up placeholders, `loading="lazy"` below the fold, `content-visibility: auto` where safe, preload only the hero.
- Re-encode sprite sheets smaller without visible quality loss. Delete verified-unused assets.
- Cut expensive effects: limit `backdrop-filter`, avoid stacking many `filter: drop-shadow`, use `transform`/`opacity` only for scroll-driven animation, `will-change` only on the active scene.
- Adaptive quality: detect `navigator.hardwareConcurrency`, `deviceMemory`, `connection.saveData` and reduce bees, particles and grain on weak devices.

### K. Quality assurance
- Update and extend `tests/` (config integrity, scene config, no duplicate "চলো যাই মধুর খোঁজে", exactly one `#boat`, all referenced assets exist, no `!important` in new CSS, SEO tags present).
- Use Playwright (headless Chromium) to take screenshots of: hero at t=0 and t=4 s, each of the six scenes, jar at 0/50/100%, shop, mobile menu, order drawer, at 1440x900 and 390x844. Run Lighthouse if possible.
- If the sandbox cannot run a browser, say so plainly. NEVER claim visual verification, Lighthouse scores or fps that you did not actually measure.

## HARD RULES

1. Preserve the concept, structure, order of sections and the Bengali copy. Fix only clear typos and list each one. New Bengali copy must be natural, simple, warm; mark all new copy so I can review it.
2. Do not add external runtime API calls, trackers, or CDN dependencies for critical assets.
3. Do not break `npm run dev`, `npm run build`, `npm test`. Keep Windows and VS Code instructions in the README.
4. Do not leave TODOs inside working features. If something needs my assets or facts, implement the slot and list it under "Asset requests".
5. Be honest about limits (2.5D illustration vs real animation, unverified claims, unmeasured metrics).
6. Prefer fewer, better effects over many mediocre ones. If an effect hurts performance on a mid-range phone, remove it.

## PHASE 3 — DELIVERABLES

Return:
1. The complete project as a downloadable ZIP named `Moubon_Cinematic_V{N+1}` (include `node_modules` exclusion and a `.gitignore`). Provide the real download link, not code pasted in chat.
2. `CHANGELOG.md`: what changed per workstream A to K, with before/after numbers where measured.
3. `QA_REPORT.md`: commands run and results, screenshots list, Lighthouse/size numbers marked clearly as MEASURED or NOT MEASURED, known issues.
4. `ASSET_REQUESTS.md`: exact list of what I should supply to lift the site further (real product photos, depth-separated hero layers, ambient/river/bee audio, real harvest photos or short videos, packaging shots, real contact details), each with recommended size/format.
5. A final chat message of at most 15 lines: what improved most, what still needs my input, how to run it.

Start now with Phase 0.

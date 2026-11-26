# Moubon Cinematic V13.5.7

A self-contained, vanilla-JavaScript storytelling website for **মৌবন / Moubon**, wild honey from the Sundarbans, Bangladesh.

V13.5.7 improves River Story readability by moving the journey meter away from the alternating story captions, hiding the first story phase label, and triggering the tiger growl when Story 2 becomes active. The sound stops when the story moves away. Browsers may block audible autoplay until the visitor interacts with the page; if blocked, the sound starts on the next tap/click or keyboard interaction while Story 2 remains active. The desktop story cards are wider with stronger caption contrast, and the English MOUBON wordmark is slightly smaller while staying beside the Bengali name. The V13.5.6 forest-glass footer and earlier River Story, shop, hero, jar, SEO and responsive work remain included.

## Run on Windows / VS Code

1. Extract `Moubon_Cinematic_V13.5.7.zip` to a normal folder.
2. Open that folder in VS Code.
3. Install Node.js 18 or newer.
4. Choose **Terminal → New Terminal**.
5. Run:

   ```cmd
   npm install
   npm run dev
   ```

6. Open `http://localhost:5173/` in Chrome.
7. Stop the server with `Ctrl + C`.

The website runtime uses vanilla JavaScript and local assets. There are no runtime npm dependencies, external trackers or critical CDN requests.

## What changed in the River Story

- Six owner-supplied MP4 films replace the old static story images and generated four-second cinemagraph loops.
- Story order: 01 footprints, 02 tiger, 03 honey discovery, 04 smoke preparation, 05 honey harvest, 06 golden gift.
- Each clip is 5 seconds, 1280×720, 24 fps, H.264 MP4, without audio.
- Each MP4 is loaded only while its scene is active. The previous clip is paused and unloaded before the next one starts. Videos use `muted`, `playsinline`, `loop` and `preload="none"`.
- Poster frames are extracted from the same six videos. They are used for reduced-motion, explicit Save-Data, screenshot-lab and autoplay-fallback states; modest hardware still plays only the currently active clip. The old public story stills are no longer used.
- River water width before mud shoulders: 28% desktop, 32% tablet and 40% mobile. The boat has been scaled to sit comfortably inside the narrower channel.
- Desktop and tablet stories alternate left/right. Mobile uses a compact upper story shelf, leaving the lower river and boat lane visible.
- The journey progress meter sits at the bottom centre so it does not cover either story card.
- Story 1 omits its phase label; Story 2 attempts the tiger growl automatically when it becomes active, subject to browser autoplay rules.
- Artificial scene-specific CSS bee/smoke/honey overlays were removed; the supplied clips provide the story motion.

## Build and test

```cmd
npm run check
npm test
npm run build
npm run river:verify-videos
npm run river:verify-assets
```

The production site is written to `dist/`. The delivery ZIP includes the current `dist/` build and excludes `node_modules/`. Run `npm install` before using the development and screenshot commands.

## Browser QA and screenshots

Install Chromium for Playwright once:

```cmd
npx playwright install chromium
```

Then run:

```cmd
npm run river:shots
npm run shots
npm run lighthouse
npm run qa
```

- `npm run river:shots` captures 45 River Story screenshots at 360×740, 390×844, 768×1024, 1440×900 and 1920×1080.
- `qa-screenshots/river/river-contact-sheet.html` shows the River Story screenshot matrix.
- The River Story lab uses poster frames, not active MP4 playback, so screenshots are deterministic. Normal browsing plays only the active scene clip.
- `npm run qa` runs syntax checks, tests, build, video and bank asset checks, full-site screenshots, River Story screenshots and the prelaunch gate.
- `npm run prelaunch` is expected to report owner blockers until real business/deployment information is supplied.

## Before publishing

Open `config.js` and fill only verified information:

- `SITE_URL`: the final HTTPS domain.
- `heroTagline`: approved brand tagline; “নির্মল ও খাঁটি” remains in `claimWatchlist` and requires evidence before `claimsVerified:true`.
- `whatsappNumber`: official business number with country code, digits only.
- `products`: actual product names, factual descriptions, variants, prices and local photos; set `published:true` only after approval.
- `business`: official business name, address, phone, email and approved return/delivery policy text.
- `delivery`, `payments`, `trustItems`, `socialLinks`, `messengerPageUrl` and `faq`: only confirmed information.

The current config contains three jar-size product entries and configured prices; verify all prices and product details before publishing. Business details, certificates, purity claims, harvest dates, health benefits and delivery promises must be confirmed before they are presented as verified. See `OWNER_CHECKLIST.md` and `config.owner-template.md`.

## Deploy to Vercel

1. Push the project folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Use Framework preset **Other**, build command `npm run build`, output directory `dist`, and install command `npm install`.
4. Set the real `SITE_URL` in `config.js` before deployment.
5. Deploy, attach the real custom domain, set the final HTTPS `SITE_URL`, and redeploy.
6. Review the deployed 404 page, mobile layout, WhatsApp handoff and `PRELAUNCH_REPORT.md`.

## Netlify alternative

1. Push the project to GitHub and choose **Add new site → Import an existing project** in Netlify.
2. Set build command `npm run build` and publish directory `dist`.
3. Attach the custom domain, set the real `SITE_URL` in `config.js`, and redeploy.

## Project map

- `config.js` — single site URL and empty owner/shop configuration.
- `src/design-tokens.css` — forest, mud and dark teal water palette.
- `src/moubon.css` — responsive site and River Story styling.
- `src/main.js` — page orchestration and native scroll rendering.
- `src/story/scenes.js` — six video paths, poster paths, captions, sides and scroll stops.
- `src/story/scene-renderer.js` — active-only MP4 loading, poster fallback and scene captions.
- `docs/STORY_VIDEO_ASSETS.md` — clip mapping, measured properties and playback behaviour.
- `src/river.js` / `src/river-art.js` — river artwork, bank/environment layers, boat route and scroll geometry.
- `public/assets/story-video/` — optimized H.264 MP4 story clips.
- `public/assets/story-posters/` — poster frames extracted from the same MP4 clips.
- `src/jar.js` — reversible scroll-scrubbed honey-jar finale.
- `src/shop.js` — config-driven products, order drawer, validation and WhatsApp/Messenger handoff.
- `scripts/verify-story-videos.mjs` — MP4/poster presence, signature and file-budget checks.

## Scroll and motion decision

Native browser scrolling is retained. A Lenis/inertia layer is not shipped because complete touch, keyboard, screen-reader, anchor, progress, reversibility and reduced-motion behaviour could not be fully proven. Reduced-motion and explicit Save-Data modes use the six poster frames and preserve the readable story sequence. Low-power devices still play one active story clip at a time.

## Licensing and owner assets

- Self-hosted Noto Bengali fonts use the SIL Open Font License 1.1; see `public/assets/fonts/OFL-Noto.txt` and `docs/LICENSES.md`.
- The supplied tiger growl is a demo/sample asset. Replace it or confirm its licence before commercial use.
- Confirm usage rights for the six generated/supplied video clips, artwork and product photos before commercial launch.

## QA measurement status

V13.5.1 source checks, automated tests, production build, video file signatures/budgets and river-bank asset verification are recorded in `QA_REPORT.md`. Browser screenshot appearance, Lighthouse scores, LCP, CLS, FPS, real-device Android/4G behaviour and Safari/Firefox/Edge visual rendering are only marked MEASURED if the relevant local run has actually completed. The prelaunch gate remains blocked by owner-supplied domain, WhatsApp, product and claim-evidence fields.

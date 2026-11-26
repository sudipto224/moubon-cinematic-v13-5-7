# Moubon V13.5.1 — QA on Windows (Simple Steps)

## 1. Install the tools

1. Extract the final ZIP to a normal folder.
2. Open the folder in VS Code.
3. Install Node.js 18 or newer.
4. Open **Terminal → New Terminal**.
5. Run:

```powershell
npm install
npx playwright install chromium
```

## 2. Open the website

```powershell
npm run dev
```

Open `http://localhost:5173/` in Chrome. Keep the terminal open. Stop the server with `Ctrl + C`.

## 3. Run the complete QA sequence

```powershell
npm run qa
```

This runs syntax checks, all tests, a production build, video/poster checks, bank-asset checks, full-site screenshots, the 45-image River Story screenshot matrix, and the prelaunch gate.

The River Story screenshots are saved under `qa-screenshots/river/`. Open:

- `qa-screenshots/river/river-contact-sheet.html`
- `qa-screenshots/river/RIVER_SHOTS_REPORT.md`

The screenshot lab uses the poster frame from each MP4 and does not load video sources. This makes the screenshots repeatable. Normal website browsing plays only the active story video.

## 4. Run River Story checks separately

```powershell
npm run river:verify-videos
npm run river:verify-assets
npm run river:shots
```

The video verifier checks all six MP4 files, poster WebP files, file signatures and size budgets. The screenshot suite checks five viewports (360×740, 390×844, 768×1024, 1440×900 and 1920×1080) at nine progress positions, plus the 1920×1080 desktop view. It checks the narrower channel, story placement, poster visibility, one boat, boat rotation, browser errors, horizontal overflow and near-flat viewport tiles.

The flat-area detector samples a 64×64 grid. A 16×16 sample tile represents 25% of the viewport. It flags a tile when at least 98% of its samples are within RGB distance 14 of the tile mean. It is a warning aid, not a visual-quality score.

## 5. Run Lighthouse separately

```powershell
npm run lighthouse
```

The command saves mobile and desktop HTML reports under `qa-reports/`. Review Performance, Accessibility, Best Practices and SEO.

## 6. Understand prelaunch FAIL

The starter `config.js` intentionally has an empty WhatsApp number, no published products, a placeholder domain and an unverified tagline claim. `npm run prelaunch` will report these owner tasks as FAIL until real information and evidence are supplied. Do not add invented details just to make the report green.

## 7. Final commands

```powershell
npm install
npm run dev
npm run qa
```

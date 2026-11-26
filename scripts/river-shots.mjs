import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { isIntentionalTitleSafeArea } from './river-qa-helpers.mjs';

let playwright, pngjs;
try {
  playwright = await import('playwright');
  pngjs = await import('pngjs');
} catch {
  console.error('River screenshot dependencies are missing. Run npm install, then npx playwright install chromium.');
  process.exit(1);
}

const { chromium } = playwright;
const { PNG } = pngjs.default || pngjs;
const root = process.cwd();
const output = resolve(root, 'qa-screenshots/river');
const port = Number(process.env.MOUBON_RIVER_QA_PORT || 5178);
const baseUrl = `http://127.0.0.1:${port}`;
const viewports = [
  { name: '360x740', width: 360, height: 740 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 }
];
const progressStops = [0, .08, .20, .33, .45, .58, .70, .83, .95];
const errors = [];
const flatFindings = [];
let ignoredTitleTiles = 0;
const screenshots = [];

const qaConfig = `
export const SITE_URL = 'https://moubon-qa.invalid';
export const MOUBON_CONFIG = Object.freeze({
  brand: 'মৌবন', siteDescription: 'QA-only fixture. Not production data.',
  heroTagline: 'সুন্দরবনের অরণ্য থেকে\\nমধুর গল্প', claimsVerified: true, claimWatchlist: [],
  demoMode: false, whatsappNumber: '8801700000000', messengerPageUrl: '',
  currency: '৳', useBengaliDigits: true,
  business: { name: '', address: '', phone: '', email: '', returnPolicy: '', deliveryPolicy: '' },
  delivery: { description: '', areas: '', charge: '' },
  payments: { bkash: '', nagad: '', cashOnDelivery: false },
  trustItems: [], socialLinks: [], faq: [],
  products: [{ id: 'qa-preview-item', name: 'QA Preview Item', description: 'Test-only item; not a real product.', price: 100, image: '/assets/product-gold.svg', size: 'QA sample', available: true, published: true, variants: [] }]
});
if (typeof window !== 'undefined') window.MOUBON_CONFIG = MOUBON_CONFIG;
`;

async function waitForServer(child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Dev server exited early (${child.exitCode}).`);
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error(`Dev server did not become ready at ${baseUrl}.`);
}

function detectFlatQuarter(buffer, context = {}) {
  const image = PNG.sync.read(buffer);
  const grid = 64;
  const samples = Array.from({ length: grid }, () => Array(grid));
  for (let gy = 0; gy < grid; gy += 1) {
    for (let gx = 0; gx < grid; gx += 1) {
      const x = Math.min(image.width - 1, Math.floor((gx + .5) * image.width / grid));
      const y = Math.min(image.height - 1, Math.floor((gy + .5) * image.height / grid));
      const offset = (y * image.width + x) * 4;
      samples[gy][gx] = [image.data[offset], image.data[offset + 1], image.data[offset + 2]];
    }
  }
  // A 16×16 sample tile is 25% of the viewport. Flag >=98% of its samples
  // within RGB Euclidean distance 14 of the tile mean (a near-flat quarter-screen).
  const tile = 16;
  let ignoredTitleTiles = 0;
  for (let ty = 0; ty <= grid - tile; ty += 8) {
    for (let tx = 0; tx <= grid - tile; tx += 8) {
      if (isIntentionalTitleSafeArea({ progress: context.progress, imageWidth: image.width, imageHeight: image.height, tileX: tx, tileY: ty, tileSamples: tile, grid })) {
        ignoredTitleTiles += 1;
        continue;
      }
      const pixels = [];
      for (let y = ty; y < ty + tile; y += 1) {
        for (let x = tx; x < tx + tile; x += 1) pixels.push(samples[y][x]);
      }
      const mean = [0, 1, 2].map(channel => pixels.reduce((sum, pixel) => sum + pixel[channel], 0) / pixels.length);
      const close = pixels.filter(pixel => Math.hypot(pixel[0] - mean[0], pixel[1] - mean[1], pixel[2] - mean[2]) <= 14).length;
      if (close / pixels.length >= .98) {
        return { finding: `near-flat 25% tile at sample grid ${tx},${ty}: ${Math.round(close / pixels.length * 100)}% within RGB tolerance 14`, ignoredTitleTiles };
      }
    }
  }
  return { finding: null, ignoredTitleTiles };
}

async function inspectPage(page, viewportName, progress) {
  const result = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    viewport: window.innerWidth,
    boats: document.querySelectorAll('#boat').length,
    boatRotation: Number(document.querySelector('#boat')?.style.transform.match(/rotate\(([-+0-9.]+)deg\)/)?.[1] || 0),
    world: Boolean(document.querySelector('#riverWorld svg')),
    scenes: document.querySelectorAll('.story-vignette').length,
    storyVideos: document.querySelectorAll('.scene-film[data-video-src]').length,
    storyPosters: document.querySelectorAll('.scene-film[data-poster-src]').length,
    loadedVideoSources: document.querySelectorAll('.scene-film[src]').length,
    visibleScenes: [...document.querySelectorAll('.story-vignette')].filter(scene => Number.parseFloat(getComputedStyle(scene).opacity) > .015).length,
    waterFill: document.querySelector('.river-channel-water')?.getAttribute('fill') || '',
    bankStrips: [...document.querySelectorAll('.river-bank-strip')].map(strip => {
      const style = getComputedStyle(strip);
      return { layers: style.backgroundImage.split(',').length, repeat: style.backgroundRepeat };
    }),
    sceneLayer: Number.parseInt(getComputedStyle(document.querySelector('#storyScenes')).zIndex, 10) || 0,
    worldLayer: Number.parseInt(getComputedStyle(document.querySelector('#riverWorld')).zIndex, 10) || 0,
    stageFadeLayer: Number.parseInt(getComputedStyle(document.querySelector('#riverStage'), '::after').zIndex, 10) || 0,
    activeScene: (() => {
      const scene = [...document.querySelectorAll('.story-vignette')].find(item => Number.parseFloat(getComputedStyle(item).opacity) > .015);
      if (!scene) return null;
      const rect = scene.getBoundingClientRect();
      return { id: scene.dataset.sceneId, side: scene.classList.contains('left') ? 'left' : 'right', left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    })(),
    boatRect: (() => { const rect = document.querySelector('#boat')?.getBoundingClientRect(); return rect ? { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right } : null; })(),
    waterHalfWidth: Number(document.querySelector('#riverWorld svg')?.dataset.waterHalfWidth || 0),
    visibleSceneVideo: (() => {
      const scene = [...document.querySelectorAll('.story-vignette')].find(item => Number.parseFloat(getComputedStyle(item).opacity) > .015);
      if (!scene) return true;
      const video = scene.querySelector('.scene-film');
      if (!video || !video.poster) return false;
      const style = getComputedStyle(video);
      const rect = video.getBoundingClientRect();
      return style.display !== 'none' && style.visibility === 'visible'
        && Number.parseFloat(style.opacity) > .95 && rect.width > 0 && rect.height > 0;
    })(),
    lab: document.documentElement.classList.contains('river-lab-mode')
  }));
  if (result.width > result.viewport + 1 || result.bodyWidth > result.viewport + 1) {
    errors.push(`${viewportName} p=${progress.toFixed(2)}: horizontal overflow document=${result.width}px body=${result.bodyWidth}px viewport=${result.viewport}px`);
  }
  if (result.boats !== 1) errors.push(`${viewportName} p=${progress.toFixed(2)}: expected exactly one boat, found ${result.boats}`);
  if (Math.abs(result.boatRotation) > 24.01) errors.push(`${viewportName} p=${progress.toFixed(2)}: boat route rotation ${result.boatRotation}° exceeds ±24°`);
  if (!result.world || result.scenes !== 6 || result.storyVideos !== 6 || result.storyPosters !== 6 || !result.lab) errors.push(`${viewportName} p=${progress.toFixed(2)}: lab/stage/scenes assertion failed (${JSON.stringify(result)})`);
  if (result.visibleScenes > 1) errors.push(`${viewportName} p=${progress.toFixed(2)}: expected one focused scene, found ${result.visibleScenes}`);
  if (result.waterFill !== 'url(#river-water-base)') errors.push(`${viewportName} p=${progress.toFixed(2)}: river water paint server is missing (${result.waterFill})`);
  if (result.bankStrips.length !== 2 || result.bankStrips.some(item => item.layers !== 1 || item.repeat !== 'no-repeat')) {
    errors.push(`${viewportName} p=${progress.toFixed(2)}: expected one continuous non-repeating bank composite per side (${JSON.stringify(result.bankStrips)})`);
  }
  if (result.visibleScenes === 1 && !result.visibleSceneVideo) errors.push(`${viewportName} p=${progress.toFixed(2)}: active story video poster/frame is not visibly rendered`);
  if (result.loadedVideoSources !== 0) errors.push(`${viewportName} p=${progress.toFixed(2)}: screenshot lab unexpectedly loaded ${result.loadedVideoSources} MP4 sources instead of using posters`);
  if (result.sceneLayer <= Math.max(result.worldLayer, result.stageFadeLayer)) errors.push(`${viewportName} p=${progress.toFixed(2)}: story layer ${result.sceneLayer} is not above river/fade layers ${result.worldLayer}/${result.stageFadeLayer}`);
  const channelRatio = (result.waterHalfWidth * 2) / 1200;
  const channelLimit = result.viewport > 900 ? .31 : result.viewport > 680 ? .35 : .43;
  if (!result.waterHalfWidth || channelRatio > channelLimit) errors.push(`${viewportName} p=${progress.toFixed(2)}: river channel width ${(channelRatio * 100).toFixed(1)}% exceeds ${channelLimit * 100}%`);
  if (result.activeScene) {
    if (result.viewport > 900 && ((result.activeScene.side === 'left' && result.activeScene.right > result.viewport * .26) || (result.activeScene.side === 'right' && result.activeScene.left < result.viewport * .74))) {
      errors.push(`${viewportName} p=${progress.toFixed(2)}: ${result.activeScene.side} story vignette enters the central river safe zone`);
    }
    if (result.viewport <= 900 && (result.activeScene.bottom > ({"360x740":740,"390x844":844,"768x1024":1024}[viewportName] || 800) * .48 || result.activeScene.bottom + 24 > (result.boatRect?.top ?? Infinity))) {
      errors.push(`${viewportName} p=${progress.toFixed(2)}: mobile/tablet story shelf overlaps the boat/river lane (${JSON.stringify(result.activeScene)})`);
    }
  }
}

const server = spawn(process.execPath, ['scripts/dev-server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: 'ignore'
});
let browser;
try {
  await mkdir(output, { recursive: true });
  await waitForServer(server);
  browser = await chromium.launch({ headless: true });
  for (const viewport of viewports) {
    const folder = join(output, viewport.name);
    await mkdir(folder, { recursive: true });
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('console', message => {
      if (message.type() === 'error') errors.push(`${viewport.name}: console ${message.text()}`);
    });
    page.on('pageerror', error => errors.push(`${viewport.name}: pageerror ${error.message}`));
    await page.route('**/config.js', route => route.fulfill({
      status: 200,
      contentType: 'text/javascript; charset=utf-8',
      body: qaConfig
    }));
    await page.goto(`${baseUrl}/?lab=1&p=0&w=${viewport.width}&h=${viewport.height}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#riverWorld svg', { timeout: 10000 });
    await page.waitForFunction(() => {
      const boat = document.querySelector('.boat-art');
      const reeds = document.querySelector('.river-reeds-foreground img');
      const banks = [...document.querySelectorAll('.river-bank-strip')];
      return boat?.complete && boat.naturalWidth > 0 && reeds?.complete && reeds.naturalWidth > 0
        && banks.length === 2 && banks.every(bank => getComputedStyle(bank).backgroundImage.split(',').length === 1
          && getComputedStyle(bank).backgroundRepeat === 'no-repeat');
    }, { timeout: 12000 });
    await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
    await page.addStyleTag({ content: `
      html.river-lab-mode *, html.river-lab-mode *::before, html.river-lab-mode *::after {
        animation-play-state: paused !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html.river-lab-mode .story-vignette.is-active .scene-phase,
      html.river-lab-mode .story-vignette.is-active .scene-label,
      html.river-lab-mode .story-vignette.is-active .scene-title,
      html.river-lab-mode .story-vignette.is-active .scene-description,
      html.river-lab-mode .story-vignette.is-active .scene-copy-line {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
      }
    ` });

    for (const progress of progressStops) {
      const applied = await page.evaluate(value => {
        if (typeof window.__MOUBON_RIVER_LAB_SET_PROGRESS !== 'function') {
          return { error: 'River lab setter is unavailable.' };
        }
        return window.__MOUBON_RIVER_LAB_SET_PROGRESS(value);
      }, progress);
      if (applied?.error) throw new Error(`${viewport.name} p=${progress.toFixed(2)}: ${applied.error}`);
      const expected = Math.round(progress * 100);
      if (!applied || Math.abs(Number(applied.ariaValue) - expected) > 1
        || Math.abs(Number(applied.rendered) - progress) > 0.001) {
        throw new Error(`${viewport.name} p=${progress.toFixed(2)}: lab progress mismatch; expected aria=${expected}, received aria=${applied?.ariaValue ?? 'missing'}, rendered=${applied?.rendered ?? 'missing'}`);
      }
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.waitForFunction(() => [...document.querySelectorAll('.story-vignette.is-visible .scene-film')].every(video => video.poster && video.getBoundingClientRect().width > 0), { timeout: 12000 });
      await inspectPage(page, viewport.name, progress);
      const filename = `p-${progress.toFixed(2)}.png`;
      const path = join(folder, filename);
      const buffer = await page.screenshot({ path, animations: 'disabled' });
      screenshots.push(`${viewport.name}/${filename}`);
      const detection = detectFlatQuarter(buffer, { progress });
      ignoredTitleTiles += detection.ignoredTitleTiles;
      if (detection.finding) flatFindings.push(`${viewport.name}/${filename}: ${detection.finding}`);
    }
    await context.close();
  }
} catch (error) {
  errors.push(error.message.includes('Executable doesn\'t exist') || error.message.includes('browserType.launch')
    ? `${error.message} Run: npx playwright install chromium`
    : error.stack || error.message);
} finally {
  await browser?.close().catch(() => {});
  server.kill('SIGTERM');
}

const contactItems = screenshots.map(path => {
  const [viewport, file] = path.split('/');
  const progress = file.replace('p-', '').replace('.png', '');
  return `<figure><a href="${path}"><img loading="lazy" src="${path}" alt="${viewport} at progress ${progress}"></a><figcaption>${viewport} · p=${progress}</figcaption></figure>`;
}).join('\n');
const contactSheet = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Moubon V13.4.0 River Contact Sheet</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;padding:24px;background:#0a371f;color:#f4e6c5;font:14px/1.5 system-ui,sans-serif}
h1{font-size:24px}p{color:#d4ddc9}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
figure{margin:0;padding:8px;border:1px solid rgba(238,210,150,.18);border-radius:10px;background:#082b1b}
img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:contain;background:#061c14}
figcaption{padding:6px 2px 2px;color:#f3d99f;font-size:12px}
</style>
<h1>Moubon V13.5.1 — River Contact Sheet</h1>
<p>Five viewports · nine fixed progress positions · screenshot appearance is measured only by reviewing these images.</p>
<div class="grid">${contactItems}</div></html>`;
await writeFile(join(output, 'river-contact-sheet.html'), contactSheet, 'utf8');

const report = [
  '# Moubon V13.5.1 River Screenshot QA',
  '',
  `- Generated: ${new Date().toISOString()}`,
  `- Screenshots: ${screenshots.length} / 45 expected`,
  '- Viewports: 360×740, 390×844, 768×1024, 1440×900, 1920×1080',
  '- Fixed progress positions: 0.00, 0.08, 0.20, 0.33, 0.45, 0.58, 0.70, 0.83, 0.95',
  '- Lab mode: `?lab=1&p=0.31&w=1440&h=900`; the lab setter applies progress synchronously and returns an aria/rendered-state diagnostic; the lab uses poster frames extracted from the six supplied 5-second MP4s and verifies that no MP4 source is loaded during deterministic captures.',
  '- Composition assertions: one visible story video/poster at a time, story media above river/fade layers, local SVG water paint server, one non-repeating continuous bank composite per side, one boat and route rotation within ±24°; narrower channel-width limits; alternating desktop/tablet story lanes and a mobile upper shelf.',
  '- Flat-area detector: 64×64 screenshot sample grid; checks 16×16 tiles (25% of viewport); flags if at least 98% of samples are within RGB Euclidean distance 14 of the tile mean.',
  '- Documented exception: at progress 0.00 only, desktop tiles wholly inside the upper 26% central title-safe area (12%–88% viewport width) are excluded because the opening title intentionally uses quiet negative space; mobile and all other positions remain fully checked.',
  '',
  '## Screenshots',
  ...screenshots.map(path => `- qa-screenshots/river/${path}`),
  '',
  '## Flat-area detector',
  ...(screenshots.length === 0
    ? ['- NOT RUN — no screenshots were captured; a PASS cannot be claimed.']
    : flatFindings.length
      ? [...flatFindings.map(finding => `- FAIL — ${finding}`), `- INFO — ${ignoredTitleTiles} intentional title-safe tiles excluded from scoring.`]
      : [`- PASS — no qualifying near-flat quarter-screen regions outside the documented title-safe area.`, `- INFO — ${ignoredTitleTiles} intentional title-safe tiles excluded from scoring.`]),
  '',
  '## Browser and geometry assertions',
  ...(errors.length ? errors.map(error => `- FAIL — ${error}`) : ['- PASS — no console/page errors, horizontal overflow, missing stage/scenes, competing scenes, water fill, visible scene image, story stacking, continuous bank layer, boat count or boat rotation failures.']),
  '',
  `**Result: ${errors.length || flatFindings.length || screenshots.length !== 45 ? 'FAIL' : 'PASS'}**`
];
await writeFile(join(output, 'RIVER_SHOTS_REPORT.md'), report.join('\n') + '\n', 'utf8');
console.log(report.join('\n'));
if (errors.length || flatFindings.length || screenshots.length !== 45) process.exitCode = 1;

import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
let playwright, pngjs;
try {
  playwright = await import('playwright');
  pngjs = await import('pngjs');
} catch {
  console.error('QA dependencies are missing. Run npm install, then npx playwright install chromium.');
  process.exit(1);
}
const { chromium } = playwright;
const { PNG } = pngjs.default || pngjs;
const root = process.cwd();
const output = resolve(root, 'qa-screenshots');
const port = Number(process.env.MOUBON_QA_PORT || 5177);
const baseUrl = `http://127.0.0.1:${port}`;
const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 }
];
const errors = [];
const flatAreaFindings = [];
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

async function saveShot(page, folder, name, checkEmpty=false) {
  const path = join(folder, `${name}.png`);
  const buffer = await page.screenshot({ path });
  screenshots.push(path.replace(root + '/', ''));
  if (checkEmpty) {
    const finding = detectFlatQuarter(buffer);
    if (finding) flatAreaFindings.push(`${folder.split(sep).at(-1)}/${name}: ${finding}`);
  }
}

function detectFlatQuarter(buffer) {
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
  // A 16×16 sample tile represents 25% of the viewport. Flag if >=98% of its samples
  // sit within RGB Euclidean distance 14 of that tile's mean (almost-flat region).
  const tile = 16;
  for (let ty = 0; ty <= grid - tile; ty += 8) {
    for (let tx = 0; tx <= grid - tile; tx += 8) {
      const pixels = [];
      for (let y = ty; y < ty + tile; y += 1) for (let x = tx; x < tx + tile; x += 1) pixels.push(samples[y][x]);
      const mean = [0,1,2].map(channel => pixels.reduce((sum, pixel) => sum + pixel[channel], 0) / pixels.length);
      const close = pixels.filter(pixel => Math.hypot(pixel[0]-mean[0], pixel[1]-mean[1], pixel[2]-mean[2]) <= 14).length;
      if (close / pixels.length >= .98) return `near-uniform ${tile}×${tile} sample tile at grid ${tx},${ty} (${Math.round(close/pixels.length*100)}% within tolerance)`;
    }
  }
  return null;
}

async function checkOverflow(page, viewport) {
  const result = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    boats: document.querySelectorAll('#boat').length
  }));
  if (result.width > result.viewport + 1) errors.push(`${viewport}: horizontal overflow ${result.width}px > ${result.viewport}px`);
  if (result.boats !== 1) errors.push(`${viewport}: expected exactly one boat, found ${result.boats}`);
}

async function scrollBoatAt(page, progress) {
  await page.evaluate(value => {
    const world = document.querySelector('#riverWorld');
    const rect = world.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const height = world.offsetHeight;
    const start = .105, end = .94, anchor = window.innerHeight * .52;
    const routeY = (start + value * (end - start)) * height;
    window.scrollTo(0, Math.max(0, top + routeY - anchor));
  }, progress);
  await page.waitForTimeout(120);
}

async function assertBoatRotation(page, viewportName) {
  for (const progress of [.05, .25, .5, .75, .95]) {
    await scrollBoatAt(page, progress);
    const transform = await page.locator('#boat').evaluate(element => element.style.transform);
    const match = transform.match(/rotate\(([-\d.]+)deg\)/);
    if (!match) { errors.push(`${viewportName}: boat rotation missing at progress ${progress}`); continue; }
    const angle = Number(match[1]);
    if (!Number.isFinite(angle) || Math.abs(angle) > 24.01) errors.push(`${viewportName}: boat rotation ${angle}° outside ±24° at progress ${progress}`);
  }
}

async function captureViewport(browser, viewport) {
  const folder = join(output, viewport.name);
  await mkdir(folder, { recursive: true });
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', message => { if (message.type() === 'error') errors.push(`${viewport.name}: console ${message.text()}`); });
  page.on('pageerror', error => errors.push(`${viewport.name}: pageerror ${error.message}`));
  await page.route('**/config.js', route => route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: qaConfig }));
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(160);
  await saveShot(page, folder, 'hero-0s');
  await page.waitForTimeout(4000);
  await saveShot(page, folder, 'hero-4s');

  await page.locator('#journey').scrollIntoViewIfNeeded();
  await page.waitForTimeout(160);
  await saveShot(page, folder, 'intro');

  await scrollBoatAt(page, .015);
  await page.waitForTimeout(220);
  await saveShot(page, folder, 'river-start-title-boat', true);

  const scenes = page.locator('.story-vignette');
  for (let index = 0; index < 6; index += 1) {
    const scene = scenes.nth(index);
    await scene.evaluate(element => {
      const rect = element.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2);
    });
    await page.waitForTimeout(220);
    await saveShot(page, folder, `scene-${index + 1}-center`, true);
  }

  await assertBoatRotation(page, viewport.name);
  for (const [name, progress] of [['boat-bend-1', .24], ['boat-bend-2', .52], ['boat-bend-3', .81]]) {
    await scrollBoatAt(page, progress);
    await saveShot(page, folder, name, true);
  }

  await page.locator('.story-bridge').scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  await saveShot(page, folder, 'bridge');

  const jar = page.locator('#jar');
  for (const [name, progress] of [['jar-0', 0], ['jar-50', .5], ['jar-100', 1]]) {
    await jar.evaluate((element, value) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      window.scrollTo(0, top + travel * value);
    }, progress);
    await page.waitForTimeout(180);
    await saveShot(page, folder, name);
  }

  await page.locator('.poetry').scrollIntoViewIfNeeded();
  await page.waitForTimeout(160);
  await saveShot(page, folder, 'poetry');
  await page.locator('#shop').scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  await saveShot(page, folder, 'shop');

  await page.locator('#products .product-detail-btn').first().click();
  await page.locator('#productDialog[open]').waitFor({ state: 'visible', timeout: 3000 });
  await page.waitForTimeout(120);
  await saveShot(page, folder, 'product-dialog');
  await page.locator('.dialog-close').click();
  await page.locator('#products .order-btn').first().click();
  await page.locator('#cartOpen').click();
  await page.locator('#cartDrawer:not([hidden])').waitFor({ state: 'visible', timeout: 3000 });
  await page.waitForTimeout(120);
  await saveShot(page, folder, 'order-drawer');
  await page.locator('#cartClose').click();

  if (viewport.width <= 680) {
    await page.locator('#menuToggle').click();
    await page.locator('#mobileNav:not([hidden])').waitFor({ state: 'visible', timeout: 3000 });
    await saveShot(page, folder, 'mobile-menu');
    await page.keyboard.press('Escape');
  }

  await checkOverflow(page, viewport.name);
  await context.close();
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
  for (const viewport of viewports) await captureViewport(browser, viewport);
} catch (error) {
  errors.push(error.message.includes('Executable doesn\'t exist') || error.message.includes('browserType.launch')
    ? `${error.message} Run: npx playwright install chromium`
    : error.stack || error.message);
} finally {
  await browser?.close().catch(() => {});
  server.kill('SIGTERM');
}

const report = [
  '# Moubon V13 Screenshot QA',
  '',
  `- Generated: ${new Date().toISOString()}`,
  `- Screenshots: ${screenshots.length}`,
  '- Viewports: 390×844, 768×1024, 1440×900, 1920×1080',
  '- Flat-area detector: 64×64 sampled screenshot grid; checks 16×16 tiles (25% of viewport); flags if at least 98% of samples are within RGB distance 14 of the tile mean.',
  '',
  '## Screenshots',
  ...screenshots.map(path => `- ${path}`),
  '',
  '## Empty-area findings',
  ...(flatAreaFindings.length ? flatAreaFindings.map(finding => `- FAIL — ${finding}`) : ['- PASS — no qualifying near-uniform quarter-viewport region detected in river/story screenshots.']),
  '',
  '## Browser errors and assertions',
  ...(errors.length ? errors.map(error => `- FAIL — ${error}`) : ['- PASS — no console/page errors, overflow, boat-count or rotation assertion failures.']),
  '',
  `**Result: ${errors.length || flatAreaFindings.length ? 'FAIL' : screenshots.length ? 'PASS' : 'NOT RUN'}**`
];
await writeFile(join(output, 'QA_CONSOLE_REPORT.md'), report.join('\n') + '\n', 'utf8');
console.log(report.join('\n'));
if (errors.length || flatAreaFindings.length || !screenshots.length) process.exitCode = 1;

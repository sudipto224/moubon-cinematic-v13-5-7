import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import fs from 'node:fs';

const root = 'C:\\Users\\HI\\Desktop\\Moubon_Cinematic_V13.5.1';
const out = join(root, 'qa-screenshots');
const chromeExe = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: 'desktop-1366x768', width: 1366, height: 768 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];

async function capture(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(`${vp.name}: console ${m.text()}`); });
  page.on('pageerror', e => errors.push(`${vp.name}: pageerror ${e.message}`));
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(3500);
  const folder = join(out, vp.name);
  await mkdir(folder, { recursive: true });
  await page.screenshot({ path: join(folder, 'hero.png'), fullPage: false });
  const state = await page.evaluate(() => {
    const errors = [];
    const s = document.querySelector('.bee-title-stage');
    const base = document.querySelector('.bee-title-base');
    const oval = document.querySelector('.bee-title-oval');
    const flourish = document.querySelector('.bee-title-flourish');
    const shine = document.querySelector('.bee-title-shine');
    const canvas = document.querySelector('#beeLogoCanvas');
    const cRect = canvas ? canvas.getBoundingClientRect() : null;
    const cs = canvas ? getComputedStyle(canvas) : {};
    const ovalCS = oval ? getComputedStyle(oval) : {};
    const flourishCS = flourish ? getComputedStyle(flourish) : {};
    const baseCS = base ? getComputedStyle(base) : {};
    const shineCS = shine ? getComputedStyle(shine) : {};
    return {
      classes: s ? s.className : null,
      baseOpacity: baseCS.opacity, baseFontSize: baseCS.fontSize,
      ovalOpacity: ovalCS.opacity, ovalBorder: ovalCS.border, ovalFilter: ovalCS.filter,
      ovalWidth: ovalCS.width, ovalHeight: ovalCS.height, ovalDisplay: ovalCS.display,
      flourishOpacity: flourishCS.opacity, flourishHeight: flourishCS.height, flourishFilter: flourishCS.filter,
      shineOpacity: shineCS.opacity,
      canvasWidth: cRect ? cRect.width : null, canvasHeight: cRect ? cRect.height : null,
      canvasCSSW: cs.width, canvasCSSH: cs.height, dpr: window.devicePixelRatio,
      errors,
    };
  });
  fs.writeFileSync(join(folder, 'state.json'), JSON.stringify(state, null, 2));
  console.log(vp.name, JSON.stringify(state));
  await context.close();
}

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromeExe, headless: true });
  for (const vp of viewports) {
    try { await capture(browser, vp); } catch (e) { console.log(vp.name, 'FAILED', e.message); }
  }
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });

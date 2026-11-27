import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { STORY_SCENES, RIVER_ROUTE } from '../src/story/scenes.js';
import { RIVER_CENTERLINE, sampleRiverX, buildRiverPath, buildRiverBand, buildRiverEdgePath } from '../src/river-art.js';
import { getBoatRouteRotation, smoothBoatRotation } from '../src/river.js';
import { getHoneyJarProgress } from '../src/jar.js';
import { getDeviceProfile } from '../src/utils/device.js';
import { MOUBON_CONFIG, SITE_URL } from '../config.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const html = await read('index.html');
const css = await read('src/moubon.css');
const tokens = await read('src/design-tokens.css');
const main = await read('src/main.js');
const river = await read('src/river.js');
const renderer = await read('src/story/scene-renderer.js');
const shop = await read('src/shop.js');


test('project version is V13.5.7 and package scripts are complete', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.version, '13.5.7');
  assert.equal(pkg.devDependencies.lighthouse, '13.6.0');
  assert.equal(pkg.devDependencies.playwright, '1.56.1');
  assert.equal(pkg.devDependencies.pngjs, '7.0.0');
  for (const script of ['dev', 'build', 'check', 'test', 'preview', 'shots', 'lighthouse', 'prelaunch', 'qa', 'river:shots', 'river:verify-assets', 'river:verify-videos']) assert.ok(pkg.scripts[script]);
  assert.match(pkg.scripts.check, /scene-renderer\.js/);
  assert.doesNotMatch(pkg.scripts.check, /scene-performance\.js/);
  assert.equal(pkg.dependencies['puppeteer-core'], '^25.18.1');
});

test('one boat and one chosen river heading remain in the document', () => {
  assert.equal((html.match(/id="boat"/g) || []).length, 1);
  assert.equal((html.match(/চলো যাই মধুর খোঁজে/g) || []).length, 1);
  assert.match(html, /id="riverStopMarkers"/);
  assert.match(html, /data-src="\/assets\/boat\.webp"/);
  assert.match(html, /data-src="\/assets\/boat\.webp"/);
  assert.equal(RIVER_ROUTE.boatImage, '/assets/boat.webp');
});

test('six scene captions and video/poster paths are centrally configured', () => {
  assert.equal(STORY_SCENES.length, 6);
  assert.equal(new Set(STORY_SCENES.map(scene => scene.id)).size, 6);
  assert.ok(STORY_SCENES.every(scene => scene.title && scene.phase && scene.copyLines.length === 2));
  assert.ok(STORY_SCENES.every(scene => scene.video.endsWith('.mp4')));
  assert.ok(STORY_SCENES.every(scene => scene.poster.endsWith('.webp')));
  assert.ok(STORY_SCENES.every(scene => scene.duration === 5));
  assert.ok(STORY_SCENES.every(scene => scene.imageSize.width === 1280 && scene.imageSize.height === 720));
  assert.ok(STORY_SCENES.every(scene => Number.isFinite(scene.at) && ['left','right'].includes(scene.side)));
  assert.match(renderer, /STORY_SCENES\.map/);
  assert.match(renderer, /scene\.copyLines/);
  assert.match(renderer, /\.985 \+ \.015 \* eased/);
});

test('all six story videos and poster fallbacks plus the transparent boat asset exist', async () => {
  for (const scene of STORY_SCENES) {
    const videoPath = new URL(`../public${scene.video}`, import.meta.url);
    const posterPath = new URL(`../public${scene.poster}`, import.meta.url);
    await access(videoPath);
    await access(posterPath);
    assert.ok((await stat(videoPath)).size > 500_000);
    assert.ok((await stat(posterPath)).size > 30_000);
  }
  await access(new URL('../public/assets/boat.webp', import.meta.url));
  await access(new URL('../public/assets/boat-800.webp', import.meta.url));
  assert.ok((await stat(new URL('../public/assets/boat.webp', import.meta.url))).size > 50_000);
});

test('river centerline is normalized and route geometry derives from world height', () => {
  assert.equal(RIVER_CENTERLINE.length, 401);
  assert.ok(RIVER_CENTERLINE.every(value => value > 0 && value < 1));
  assert.ok(sampleRiverX(0) > 0.4 && sampleRiverX(0) < 0.6);
  assert.ok(sampleRiverX(1) > 0.4 && sampleRiverX(1) < 0.6);
  const path = buildRiverPath(4600, RIVER_ROUTE.startProgress, RIVER_ROUTE.endProgress);
  assert.match(path, /^M /);
  assert.match(path, /L /);
  assert.ok(path.includes('4600')); // the route reaches the end of the pinned world
  const band = buildRiverBand(4600, RIVER_ROUTE.startProgress, RIVER_ROUTE.endProgress, 80, 8, .5);
  const edge = buildRiverEdgePath(4600, RIVER_ROUTE.startProgress, RIVER_ROUTE.endProgress, 80, 1, 8, .5);
  assert.match(band, /^M /); assert.match(band, / Z$/); assert.match(edge, /^M /);
  assert.equal(RIVER_ROUTE.startProgress, 0);
  assert.equal(RIVER_ROUTE.endProgress, 1);
  assert.ok(STORY_SCENES.every(scene => scene.at > 0 && scene.at < 1));
});

test('old 12-frame canvas pipeline and legacy sprite assets are gone', async () => {
  assert.equal(existsSync(new URL('../src/scene-performance.js', import.meta.url)), false);
  assert.doesNotMatch(renderer, /canvas|getImageData|drawImage|frameFloat|Math\.round\(p\s*\*\s*11\)/);
  assert.doesNotMatch(river, /scene-performance|v9-.*action|v7-/);
  for (const legacy of [
    'public/assets/boat-complete-v5.webp', 'public/assets/boat-complete-v5.avif',
    'public/assets/v7-footprints.webp', 'public/assets/v7-tiger.webp',
    'public/assets/v9-footprints-action.webp', 'public/assets/v9-tiger-action.webp',
    'public/assets/river-art.svg', 'public/assets/water-sundarban-v10.webp'
  ]) assert.equal(existsSync(new URL(`../${legacy}`, import.meta.url)), false, `${legacy} should be removed`);
});

test('river rendering updates nearby scenes and skips offscreen work', () => {
  const renderBody = river.match(/function renderRiver\([\s\S]*?\n  \}/)?.[0] || '';
  assert.ok(renderBody);
  assert.doesNotMatch(renderBody, /getBoundingClientRect/);
  assert.match(renderBody, /sceneOpacityForProgress/);
  assert.doesNotMatch(renderBody, /neighborIndex|isPair/);
  assert.match(renderBody, /nearestSceneIndex/);
  assert.match(renderBody, /setSceneVideoMode|loadScenePoster/);
  assert.match(river, /chapterObserver/);
  assert.match(renderer, /data-video-src/);
  assert.match(main, /function measureLayout\(\)/);
  const render = main.match(/function render\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(render, /getBoundingClientRect/);
});

test('native scroll remains reversible and header-aware; motion system is shared', () => {
  assert.match(css, /scroll-behavior\s*:\s*smooth/);
  assert.match(css, /scroll-padding-top\s*:\s*var\(--header-height\)/);
  assert.match(css, /scroll-margin-top\s*:\s*var\(--header-height\)/);
  assert.match(main, /requestAnimationFrame\(render\)/);
  assert.match(river, /easeAtStoryStops/);
  assert.match(css, /--wake-opacity/);
  for (const token of ['--motion-fast', '--motion-base', '--motion-slow', '--ease-standard', '--ease-emphasized', '--ease-soft']) assert.ok(tokens.includes(token));
  assert.match(main, /magneticTargets/);
});

test('river vignette styling dissolves into a full-bleed green world', () => {
  assert.match(css, /--forest-edge:\s*#0a371f/i);
  assert.match(css, /background-color:\s*var\(--forest-edge\)/);
  assert.doesNotMatch(css, /\.scene-art\s*\{[^}]*mask-image/);
  assert.match(css, /\.scene-copy\s*\{[\s\S]*position:\s*relative/);
  assert.match(renderer, /<figure class="scene-art/);
  assert.match(renderer, /<div class="scene-copy">/);
  assert.doesNotMatch(renderer, /scene-grade|scene-mist-plane/);
  assert.match(css, /\.story-vignette\.left\s*\{\s*left:\s*4vw/);
  assert.match(css, /\.story-vignette\.right\s*\{\s*right:\s*4vw/);
  assert.doesNotMatch(css, /scene-mist-plane|scene-grade/);
});

test('scene camera and ambient effects are reversible and reduced-motion aware', () => {
  assert.match(renderer, /setSceneProgress/);
  assert.match(renderer, /scene-scale/);
  for (const effect of ['river-mist', 'river-light-shaft', 'river-firefly', 'river-bird']) assert.ok(css.includes(effect));
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(river, /setReducedMotion/);
  assert.match(river, /boat\.style\.transform/);
});

test('boat orientation and integration effects are implemented once', () => {
  assert.match(html, /class="boat-art" data-src="\/assets\/boat\.webp"/);
  assert.match(river, /function loadBoatImage/);
  assert.match(css, /\.boat-art[\s\S]*transform:\s*rotate\(var\(--boat-base-rotation, -30deg\)\)/);
  assert.equal(RIVER_ROUTE.boatBaseRotation, -30);
  assert.match(river, /--boat-base-rotation/);
  assert.match(river, /-Math\.atan2\(dx, Math\.max\(1, deltaY\)\)/);
  assert.match(river, /-24, 24/);
  assert.match(river, /smoothBoatRotation/);
  assert.ok(getBoatRouteRotation(0.4, 0.5, 1000, 1000) < 0, 'down-right tangent must lean clockwise-negative');
  assert.ok(getBoatRouteRotation(0.6, 0.5, 1000, 1000) > 0, 'down-left tangent must lean clockwise-positive');
  assert.equal(getBoatRouteRotation(0, 1, 1000, 1), -24, 'positive extreme clamps to -24 degrees');
  assert.equal(getBoatRouteRotation(1, 0, 1000, 1), 24, 'negative extreme clamps to +24 degrees');
  assert.equal(smoothBoatRotation(0, -20), -4.4);
  assert.match(css, /boat-contact-shadow/);
  assert.match(css, /boat-wake/);
  assert.match(css, /boat-reflection/);
  assert.match(css, /boat-waterline-mist/);
  assert.match(css, /boat-painterly-bob/);
});

test('scene phase labels are new copy while approved titles and copy remain present', () => {
  const expected = ['ভোরের সতর্কতা', 'বনের নীরবতা', 'মৌচাকের দেখা', 'প্রস্তুতির ক্ষণ', 'সোনালি সংগ্রহ', 'সোনালি উপহার'];
  assert.deepEqual(STORY_SCENES.map(scene => scene.phase), expected);
  assert.deepEqual(STORY_SCENES.map(scene => scene.title), ['সতর্ক পা', 'বনের নীরব প্রহরী', 'মৌচাকের সন্ধান', 'ধোঁয়ার আড়ালে', 'মধু সংগ্রহ', 'প্রকৃতির সোনালি দান']);
});

test('single stylesheet, cascade layers, expanded tokens and no important wars', () => {
  assert.equal((html.match(/rel="stylesheet"/g) || []).length, 1);
  assert.match(html, /src\/moubon\.css/);
  assert.match(css, /@layer reset, tokens, base, layout, sections, utilities/);
  assert.doesNotMatch(css, /!important/);
  for (const deadSelector of ['.ambient-footprints', '.tiger-breath', '.roar-ring', '.track-scan', '.ambient-canopy', '.story-world-v7', '.forest-bird', '.tiger-roar', '.product-size']) assert.doesNotMatch(css, new RegExp(deadSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const token of ['--forest-edge', '--space-1', '--space-9', '--radius-lg', '--shadow-deep', '--z-modal']) assert.ok(tokens.includes(token));
  for (const file of ['site.css', 'river-story-v7.css', 'river-performance-v9.css', 'v9-finish.css', 'river-story-v10.css']) assert.equal(existsSync(new URL(`../src/${file}`, import.meta.url)), false);
});

test('shop configuration and automatic tiger-scene audio remain intact', async () => {
  assert.equal(MOUBON_CONFIG.demoMode, false);
  assert.equal(MOUBON_CONFIG.whatsappNumber, '');
  assert.equal(MOUBON_CONFIG.products.length, 3);
  assert.ok(MOUBON_CONFIG.products.every(product => product.published === true && product.available === true));
  assert.ok(MOUBON_CONFIG.products.every(product => Number.isFinite(product.price) && product.price > 0));
  assert.match(shop, /settings\.demoMode === true/);
  assert.match(shop, /product\?\.published === true/);
  assert.doesNotMatch(html, /ambientSoundToggle/);
  const audio = await read('src/story-audio.js');
  assert.doesNotMatch(audio, /ambient-river\.mp3/);
  assert.match(audio, /tiger\.play\(\)/);
  assert.match(audio, /onSceneChange/);
  assert.match(audio, /pointerdown/);
  assert.doesNotMatch(renderer, /id=\"tigerSound\"/);
});

test('SEO, accessibility hooks and responsive layouts are retained', () => {
  for (const item of ['rel="canonical"', 'property="og:url"', 'property="og:image"', 'name="twitter:card"', 'application/ld+json', '__SITE_URL__', '__MOUBON_JSONLD__']) assert.ok(html.includes(item));
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(html, /class="skip"/);
  assert.match(html, /aria-controls="mobileNav"/);
  assert.match(html, /aria-modal="true"/);
  for (const width of ['680px', '390px']) assert.ok(css.includes(width));
  assert.match(css, /\.scene-phase[^}]*font-size:\s*12px/);
  assert.match(css, /\.scene-label[^}]*font:\s*700 10px/);
  assert.match(css, /\.scene-description[^}]*font-size:\s*clamp\(14px/);
  assert.match(css, /\.scene-sound[^}]*font-size:\s*12px/);
  assert.match(css, /\.scene-description \{ font-size: 14px/);
  assert.match(css, /\.scene-label \{ font-size: 10px/);
  assert.match(css, /\.scene-sound \{ margin-top: 5px; font-size: 12px/);
  assert.equal(SITE_URL, 'https://moubon-honey.vercel.app');
});

test('checkout fields and local order confirmation are wired', () => {
  for (const field of ['customerName', 'customerPhone', 'customerAddress']) {
    assert.match(html, new RegExp(`name="${field}"`));
  }
  assert.match(html, /id="checkoutForm"/);
  assert.match(shop, /checkout\.addEventListener\('submit'/);
  assert.match(shop, /formData\.get\('customerName'\)/);
  assert.match(shop, /formData\.get\('customerPhone'\)/);
  assert.match(shop, /formData\.get\('customerAddress'\)/);
  assert.match(shop, /window\.localStorage\.setItem\('moubon-orders-v1'/);
  assert.match(shop, /অর্ডার কনফার্ম হয়েছে/);
  assert.ok(shop.includes('^01[3-9]\\d{8}$'));
  assert.match(html, /মোট পণ্যমূল্য/);
  assert.match(shop, /orderSetupNotice/);
});

test('robots, sitemap, manifest, favicon set and social preview assets exist', async () => {
  for (const file of [
    'public/robots.txt', 'public/sitemap.xml', 'public/site.webmanifest',
    'public/assets/favicon.svg', 'public/assets/favicon.ico',
    'public/assets/favicon-16.png', 'public/assets/favicon-32.png',
    'public/assets/apple-touch-icon.png', 'public/assets/pwa-192.png',
    'public/assets/pwa-512.png', 'public/assets/og-image.jpg'
  ]) await access(new URL(`../${file}`, import.meta.url));
});

test('footer has no version-specific studio label and no external tracking scripts', () => {
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] || '';
  assert.ok(footer, 'footer markup should exist');
  assert.doesNotMatch(footer, /Soft Story Studio\s+V\d+/i);
  const source = [html, main, shop, river].join('\n');
  assert.doesNotMatch(source, /googletagmanager|google-analytics|gtag\s*\(|segment\.com|hotjar|clarity\.ms|connect\.facebook\.net/i);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
});

test('low-power device adaptation responds to cores, memory and saveData', async () => {
  assert.equal(getDeviceProfile({ hardwareConcurrency: 2, deviceMemory: 8, connection: { saveData: false } }).lowPower, true);
  assert.equal(getDeviceProfile({ hardwareConcurrency: 8, deviceMemory: 2, connection: { saveData: false } }).lowPower, true);
  assert.equal(getDeviceProfile({ hardwareConcurrency: 8, deviceMemory: 8, connection: { saveData: true } }).lowPower, true);
  assert.equal(getDeviceProfile({ hardwareConcurrency: 8, deviceMemory: 8, connection: { saveData: false } }).lowPower, false);
  const device = await read('src/utils/device.js');
  const logo = await read('src/bee-logo.js');
  assert.match(device, /hardwareConcurrency/);
  assert.match(device, /deviceMemory/);
  assert.match(device, /saveData/);
  assert.match(logo, /getDeviceProfile/);
  assert.match(river, /const specks = lowPower \? '' : Array\.from/);
  assert.match(css, /low-power \.river-firefly/);
  assert.match(css, /low-power \.river-reeds-foreground img/);
});

test('honey jar scroll progress reverses and the finale reveals label, lid and shop CTA', async () => {
  const jar = await read('src/jar.js');
  assert.deepEqual(
    [1000, 2000, 3000, 2000, 1000].map(scrollY => getHoneyJarProgress(scrollY, 1000, 3000, 1000)),
    [0, 0.5, 1, 0.5, 0]
  );
  assert.match(main, /setupHoneyJar\(jar\)/);
  assert.match(jar, /function renderHoneyJar/);
  assert.match(jar, /getHoneyJarProgress/);
  assert.match(jar, /jar-label-ready/);
  assert.match(jar, /progress>=\.72/);
  assert.match(jar, /parts\.lid\.setAttribute\('opacity',finished\.toFixed\(3\)\)/);
  assert.match(jar, /parts\.cta\.hidden=progress<\.995/);
});

test('all non-optional local asset references in markup and scripts resolve', async () => {
  const sources = [html, css, main, river, renderer, await read('config.js'), await read('src/story/scenes.js'), await read('src/story-audio.js'), await read('src/shop.js')].join('\n');
  const refs = new Set([...sources.matchAll(/\/assets\/([A-Za-z0-9._/-]+\.(?:avif|webp|svg|png|jpg|ico|woff2|wav|mp3))/g)].map(match => match[1]));
  for (const asset of refs) {
    if (asset === 'ambient-river.mp3') continue;
    await access(new URL(`../public/assets/${asset}`, import.meta.url));
  }
});

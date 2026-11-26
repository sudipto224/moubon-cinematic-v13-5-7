import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { MOUBON_CONFIG } from '../config.js';
import { STORY_SCENES } from '../src/story/scenes.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const html = await read('index.html');
const css = await read('src/moubon.css');
const river = await read('src/river.js');
const renderer = await read('src/story/scene-renderer.js');
const shop = await read('src/shop.js');
const main = await read('src/main.js');
const tokens = await read('src/design-tokens.css');

const assets = new URL('../public/assets/', import.meta.url);

test('V13 image names are normalized and no doubled extensions remain', async () => {
  const files = await readdir(assets);
  assert.equal(files.filter(name => /\.(webp|png|jpe?g)\.\1$/i.test(name)).length, 0);
  for (const name of ['hero-painterly.webp','hero-painterly.avif','hero-painterly-mobile.webp','hero-painterly-mobile.avif',
    'water-seamless.webp','bank-a-cut.webp','bank-b-cut.webp','bank-left-world.webp','bank-right-world.webp','bank-left-world-tablet.webp','bank-right-world-tablet.webp','bank-left-world-mobile.webp','bank-right-world-mobile.webp','foreground-reeds-cut.webp']) {
    await access(new URL(name, assets));
  }
  for (const scene of STORY_SCENES) {
    await access(new URL(`../public${scene.video}`, import.meta.url));
    await access(new URL(`../public${scene.poster}`, import.meta.url));
  }
  for (const retired of ['water-texture.webp','bank-a.webp','bank-b.webp','foreground-reeds.webp','scene-1.webp']) {
    assert.equal(existsSync(new URL(retired, assets)), false, `${retired} should live only in docs/source-art`);
  }
});

test('painterly hero uses breakpoint-specific AVIF and WebP sources with preload', () => {
  assert.match(html, /hero-painterly\.avif/);
  assert.match(html, /hero-painterly\.webp/);
  assert.match(html, /hero-painterly-mobile\.avif/);
  assert.match(html, /hero-painterly-mobile\.webp/);
  assert.match(html, /fetchpriority="high"/);
  assert.match(html, /id="heroTagline"/);
  assert.match(css, /hero-push-in/);
});

test('hero tagline is configurable and claim phrases are explicitly watched', async () => {
  assert.equal(MOUBON_CONFIG.heroTagline, 'সুন্দরবনের অরণ্য থেকে\nনির্মল ও খাঁটি মধুর গল্প');
  assert.equal(MOUBON_CONFIG.claimsVerified, false);
  assert.ok(MOUBON_CONFIG.claimWatchlist.includes('নির্মল ও খাঁটি'));
  const main = await read('src/main.js');
  assert.match(main, /MOUBON_CONFIG\.heroTagline/);
});

test('river water is a broad reflective tidal channel with a clear value hierarchy', () => {
  for (const token of ['--water-deep: #19392d', '--water-mid: #2e5648', '--water-center: #3d6b5d', '--water-edge: #214638', '--water-glint', '--water-foam']) assert.ok(tokens.includes(token));
  for (const layer of ['river-bank-earth','river-wet-mud','river-water-base','river-tree-reflections','river-water-texture','river-sky-reflection','river-foam','river-sun-glint','river-roots']) assert.ok(river.includes(layer));
  assert.match(river, /riverWaterPattern/);
  assert.match(river, /patternTransform/);
  assert.match(river, /data-src="\/assets\/water-seamless\.webp"/);
  assert.ok(css.includes('.river-water-texture { stroke: none; opacity: .52;'));
});

test('Sundarbans bank strips mirror, lazy-load and keep the channel uncluttered', () => {
  assert.match(river, /river-bank-strip/);
  assert.match(river, /for \(const side of \['left', 'right'\]\)/);
  assert.doesNotMatch(river, /for \(const depth of \['far', 'near'\]\)/);
  assert.match(river, /bank-\$\{side\}-world\$\{variant\}\.webp/);
  assert.match(river, /getBankWorldAsset\(side, measuredWidth\)/);
  assert.match(river, /rootMargin: '800px 0px'/);
  assert.match(css, /\.river-bank-strip\.left\s*\{\s*left:\s*-1\.5vw/);
  assert.match(css, /\.river-bank-strip\.right\s*\{[^}]*right:\s*-1\.5vw/);
  assert.match(css, /scaleX\(-1\)/);
  assert.match(css, /background-repeat: no-repeat/);
  assert.match(css, /background-size: 100% 100%/);
  assert.doesNotMatch(css, /left:\s*calc\(var\(--bank-x\)/);
  assert.match(river, /scrollDistance \* \.78/);
  assert.match(river, /stageHeight \* \.22 \* 1\.3/);
  assert.ok(css.includes('.river-environment {\n    z-index: 2;'));
  assert.ok(css.includes('.river-reeds-foreground {\n    z-index: 4;'));
  assert.match(river, /river-reeds-foreground/);
  assert.match(river, /river-firefly/);
  assert.match(river, /river-bird/);
});

test('scene videos use owner-supplied MP4s with captions outside the film frames', () => {
  assert.match(renderer, /<figure class="scene-art/);
  assert.match(renderer, /<div class="scene-copy">/);
  assert.match(renderer, /data-video-src=/);
  assert.match(renderer, /scene\.video/);
  assert.doesNotMatch(css, /\.scene-art\s*\{[^}]*mask-image/);
  assert.doesNotMatch(css, /scene-grade|scene-mist-plane/);
  assert.match(css, /\.scene-description\s*\{\s*font-size:\s*14px/);
  assert.match(css, /\.scene-phase\s*\{\s*font-size:\s*12px/);
  assert.match(css, /\.scene-label\s*\{\s*font-size:\s*10px/);
  assert.match(css, /\.scene-sound\s*\{\s*min-height:\s*44px;[^}]*font-size:\s*12px/);
  assert.doesNotMatch(renderer, /scene-grade|scene-mist-plane/);
});

test('low-power and reduced-motion paths keep the story dressed without heavy motion', () => {
  assert.match(css, /\.low-power \.river-firefly/);
  assert.match(css, /\.low-power \.river-reeds-foreground img/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.river-chapter\.motion-reduced \.story-vignette/);
  assert.match(river, /chapter\.classList\.toggle\('motion-reduced'/);
  assert.match(river, /moments\.forEach\(moment => loadScenePoster/);
});

test('shop presents the priced editable catalogue and keeps optional business blocks hidden', () => {
  assert.equal(MOUBON_CONFIG.demoMode, false);
  assert.equal(MOUBON_CONFIG.products.length, 3);
  assert.ok(MOUBON_CONFIG.products.every(product => product.published === true && product.available === true));
  assert.ok(MOUBON_CONFIG.products.every(product => Number.isFinite(product.price) && product.price > 0));
  assert.equal(MOUBON_CONFIG.whatsappNumber, '');
  assert.deepEqual(MOUBON_CONFIG.trustItems, []);
  assert.deepEqual(MOUBON_CONFIG.faq, []);
  assert.match(shop, /product\?\.published === true/);
  assert.match(shop, /whatsappReady/);
  assert.match(shop, /01\[3-9\]/);
  assert.match(html, /মোট পণ্যমূল্য/);
  assert.match(shop, /settings\.useBengaliDigits === false/);
  assert.match(shop, /shopFaqSection/);
  assert.match(shop, /footerBusiness/);
  assert.match(shop, /productAvailable/);
  assert.match(html, /id="orderSetupNotice"/);
  assert.match(html, /id="shopOrderSetupNotice"/);
});


test('cinematic poetry section has accessible title, bee canvas and scroll reveal', () => {
  assert.match(html, /id="poetry"/);
  assert.match(html, /id="poetryTitle"/);
  assert.match(html, /id="poetryBeeCanvas"/);
  assert.match(main, /poetryRevealObserver/);
  assert.match(main, /beeScale: 0\.62/);
  assert.match(css, /\.poetry-cinematic/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('storefront products have configured prices and cart can be restored locally', () => {
  assert.equal(MOUBON_CONFIG.products.length, 3);
  assert.ok(MOUBON_CONFIG.products.every(product => Number.isFinite(product.price) && product.price > 0));
  assert.match(shop, /CART_STORAGE_KEY/);
  assert.match(shop, /restoreCart\(\)/);
  assert.match(shop, /কার্টে যোগ/);
  assert.match(html, /id="cartOpen"/);
  assert.match(html, /id="cartDrawer"/);
});

test('focus handling covers drawer, product dialog and mobile menu', async () => {
  assert.match(shop, /focusableWithin\(drawer\)/);
  assert.match(shop, /focusableWithin\(dialog\)/);
  assert.match(shop, /dialogLastFocus\.focus\(\)/);
  const main = await read('src/main.js');
  assert.match(main, /event\.key === 'Escape'.*closeMenu\(true\)/s);
  assert.match(main, /event\.key === 'Tab'/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
});

test('SEO deployment and no-script fallbacks are included', async () => {
  const vercel = JSON.parse(await read('vercel.json'));
  assert.ok(vercel.headers.some(item => item.source === '/assets/(.*)'));
  assert.ok(vercel.headers.some(item => item.source === '/(.*)'));
  assert.match(html, /<noscript>/);
  assert.match(html, /noscript-story/);
  assert.ok(existsSync(new URL('../404.html', import.meta.url)));
  assert.match(await read('scripts/build.mjs'), /404\.html/);
});

test('image size budgets are met and the social image has the required file size', async () => {
  const limits = [
    ['hero-painterly.webp', 250_000], ['hero-painterly-mobile.webp', 250_000],
    ['bank-a-cut.webp', 200_000], ['bank-b-cut.webp', 200_000],
    ['water-seamless.webp', 150_000],
    ['foreground-reeds-cut.webp', 160_000], ['forest-atmosphere.webp', 150_000],
    ['og-image.jpg', 250_000]
  ];
  for (const [name, limit] of limits) {
    const info = await stat(new URL(name, assets));
    assert.ok(info.size < limit, `${name} is ${info.size} bytes; limit ${limit}`);
  }
  const scenes = await read('src/story/scenes.js');
  assert.match(scenes, /scene-01-footprints\.mp4/);
  for (const scene of STORY_SCENES) {
    assert.ok((await stat(new URL(`../public${scene.video}`, import.meta.url))).size <= 1_800_000);
    assert.ok((await stat(new URL(`../public${scene.poster}`, import.meta.url))).size <= 180_000);
  }
});

test('QA tooling and owner-facing documentation are present', async () => {
  for (const path of ['scripts/shots.mjs','scripts/river-shots.mjs','scripts/bake-cutouts.py','scripts/verify-cutouts.py','scripts/lighthouse.mjs','scripts/prelaunch-check.mjs','scripts/qa.mjs','QA_HOW_TO.md','OWNER_CHECKLIST.md','config.owner-template.md','docs/LICENSES.md','docs/PROGRESS.md','docs/BENGALI_TEXT_REVIEW.md','docs/RESUME_STATE.md','docs/RIVER_NOTES.md']) {
    await access(new URL(`../${path}`, import.meta.url));
  }
  const shots = await read('scripts/shots.mjs');
  assert.match(shots, /390x844/);
  assert.match(shots, /768x1024/);
  assert.match(shots, /1440x900/);
  assert.match(shots, /1920x1080/);
  assert.match(shots, /document\.documentElement\.scrollWidth/);
  assert.match(shots, /Math\.abs\(angle\) > 24/);
  assert.match(shots, /PNG\.sync\.read/);
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.scripts['river:shots'], 'node scripts/river-shots.mjs');
  assert.equal(pkg.devDependencies.playwright, '1.56.1');
  assert.equal(pkg.devDependencies.lighthouse, '13.6.0');
});

test('prelaunch gate covers all owner-supplied and deployment checks', async () => {
  const script = await read('scripts/prelaunch-check.mjs');
  for (const item of ['SITE_URL','whatsappNumber','published','doubleExtension','canonical','robots','sitemap','claimWatchlist','prefers-reduced-motion','noscript','og-image.jpg']) assert.ok(script.includes(item));
});

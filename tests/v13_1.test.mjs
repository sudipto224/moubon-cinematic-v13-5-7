import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { RIVER_CENTERLINE, buildRiverBand, sampleRiverX, contrastRatio } from '../src/river-art.js';
import { RIVER_ROUTE, STORY_SCENES } from '../src/story/scenes.js';
import { createRiverArtwork, easeAtStoryStops, getBankWorldAsset, getBoatRouteRotation, nearestSceneIndex, sceneOpacityForProgress } from '../src/river.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const assets = new URL('../public/assets/', import.meta.url);

test('dark teal water stays distinct from the forest and the boat rim', async () => {
  const tokens = await read('src/design-tokens.css');
  const css = await read('src/moubon.css');
  assert.ok(contrastRatio('#19392d', '#0a371f') >= 1.0);
  assert.ok(contrastRatio('#3d6b5d', '#0a371f') >= 1.8);
  assert.ok(contrastRatio('#f6d28a', '#3d6b5d') >= 4.0);
  assert.match(tokens, /--boat-rim:\s*#f6d28a/i);
  assert.match(tokens, /--boat-shadow:\s*rgba\(2,\s*17,\s*10,\s*\.58\)/);
  assert.match(css, /var\(--boat-rim\)/);
  assert.match(css, /var\(--boat-shadow\)/);
});

test('pinned stage and camera geometry stay within the route rotation bounds', async () => {
  const css = await read('src/moubon.css');
  const html = await read('index.html');
  const river = await read('src/river.js');
  assert.match(css, /\.river-scroll-track\s*\{[^}]*height:\s*860svh/);
  assert.match(css, /\.river-stage\s*\{[^}]*position:\s*sticky/);
  assert.match(river, /translate3d\(0,\$\{\(-easedProgress \* scrollDistance\)/);
  assert.match(river, /endY = anchorY \+ scrollDistance \+ edgeMargin/);
  assert.match(river, /routeStart = -edgeMargin \/ scrollDistance/);
  assert.match(html, /id="riverScrollTrack"/);
  assert.match(html, /id="riverStage"/);
  assert.equal(RIVER_CENTERLINE.length, 401);
  const distance = 7600;
  for (let index = 0; index < 20; index += 1) {
    const p = .02 + index * .05;
    const before = sampleRiverX(Math.max(0, p - RIVER_ROUTE.boatRotationSample));
    const after = sampleRiverX(Math.min(1, p + RIVER_ROUTE.boatRotationSample));
    const angle = getBoatRouteRotation(before, after, 1440, RIVER_ROUTE.boatRotationSample * 2 * distance);
    assert.ok(angle >= -24 && angle <= 24, `rotation ${angle} at progress ${p}`);
  }
});

test('six configured scene stops are ordered, alternate lanes and ease to exact plateaus', () => {
  assert.equal(STORY_SCENES.length, 6);
  assert.equal(STORY_SCENES[1].audio, true, 'the tiger scene is configured for automatic growl playback');
  assert.deepEqual(STORY_SCENES.map(scene => scene.at), [.20, .33, .45, .58, .70, .83]);
  assert.deepEqual(STORY_SCENES.map(scene => scene.side), ['left','right','left','right','left','right']);
  let previous = -1;
  for (let step = 0; step <= 100; step += 1) {
    const eased = easeAtStoryStops(step / 100);
    assert.ok(eased >= previous, `easing must be monotonic at ${step / 100}`);
    previous = eased;
  }
  for (const scene of STORY_SCENES) assert.ok(Math.abs(easeAtStoryStops(scene.at) - scene.at) < 1e-9);
});

test('only one boat is authored; old floating panels and rectangular scene masks are absent', async () => {
  const html = await read('index.html');
  const css = await read('src/moubon.css');
  const renderer = await read('src/story/scene-renderer.js');
  assert.equal((html.match(/id="boat"/g) || []).length, 1);
  assert.equal((html.match(/class="boat-art"/g) || []).length, 1);
  assert.doesNotMatch(css, /left:\s*calc\(var\(--bank-x\)/);
  assert.doesNotMatch(css, /scene-mist-plane|scene-grade|river-bank-panel/);
  assert.doesNotMatch(css, /\.scene-art\s*\{[^}]*mask-image/);
  assert.match(renderer, /scene\.video/);
  assert.match(css, /\.river-bank-strip\.left\s*\{[^}]*left:\s*-1\.5vw/);
  assert.match(css, /\.river-bank-strip\.right\s*\{[^}]*right:\s*-1\.5vw/);
});

test('all referenced story videos and poster fallbacks exist, fit their budgets and preserve source art below 3 MB', async () => {
  for (const scene of STORY_SCENES) {
    const video = new URL(scene.video.replace('/assets/', ''), assets);
    const poster = new URL(scene.poster.replace('/assets/', ''), assets);
    await access(video);
    await access(poster);
    assert.ok((await stat(video)).size <= 1_800_000);
    assert.ok((await stat(poster)).size <= 180_000);
  }
  for (const file of ['bank-a-cut.webp','bank-b-cut.webp','bank-left-world.webp','bank-right-world.webp','bank-left-world-tablet.webp','bank-right-world-tablet.webp','bank-left-world-mobile.webp','bank-right-world-mobile.webp','foreground-reeds-cut.webp','water-seamless.webp']) {
    await access(new URL(file, assets));
  }
  const sourceFiles = ['scene-1.webp','scene-2.webp','scene-3.webp','scene-4.webp','scene-5.webp','scene-6.webp',
    'scene-1-800.webp','scene-2-800.webp','scene-3-800.webp','scene-4-800.webp','scene-5-800.webp','scene-6-800.webp',
    'bank-a.webp','bank-b.webp','foreground-reeds.webp','water-texture.webp','boat-original.webp','boat-800-original.webp'];
  let sourceTotal = 0;
  for (const file of sourceFiles) sourceTotal += (await stat(new URL(`../docs/source-art/${file}`, import.meta.url))).size;
  assert.ok(sourceTotal < 3_000_000, `source art is ${sourceTotal} bytes`);
  assert.equal(existsSync(new URL('../public/assets/scene-1.webp', import.meta.url)), false);
});

test('reduced-motion sequence and fixed-progress lab are available without external dependencies', async () => {
  const css = await read('src/moubon.css');
  const main = await read('src/main.js');
  const river = await read('src/river.js');
  const shots = await read('scripts/river-shots.mjs');
  assert.match(css, /\.river-chapter\.motion-reduced \.story-scenes\s*\{[^}]*display:\s*grid/);
  assert.match(css, /\.river-chapter\.motion-reduced \.story-vignette[^}]*opacity:\s*1/);
  assert.match(main, /__MOUBON_RIVER_LAB_SET_PROGRESS/);
  assert.match(river, /setLabProgress/);
  for (const viewport of ['360x740','390x844','768x1024','1440x900','1920x1080']) assert.ok(shots.includes(viewport));
  for (const progress of ['.08','.20','.33','.45','.58','.70','.83','.95']) assert.ok(shots.includes(progress));
  assert.match(shots, /near-flat 25% tile/);
  assert.match(shots, /horizontal overflow/);
  assert.match(shots, /querySelectorAll\('#boat'\)/);
});


test('V13.3 river composition keeps the channel open and the boat and story art in front', async () => {
  const css = await read('src/moubon.css');
  const river = await read('src/river.js');
  const scenes = await read('src/story/scenes.js');
  assert.match(river, /for \(const side of \['left', 'right'\]\)/);
  assert.doesNotMatch(river, /for \(const depth of \['far', 'near'\]\)/);
  assert.match(river, /RIVER_ROUTE\.desktopWaterHalfWidth/);
  assert.match(river, /RIVER_ROUTE\.mobileWaterHalfWidth/);
  assert.match(scenes, /viewportAnchor: 0\.64/);
  assert.match(scenes, /mobileViewportAnchor: 0\.76/);
  assert.match(scenes, /sceneFadeSpan: 0\.12/);
  assert.match(river, /smoothstep\(\.015, \.09, progress\)/);
  assert.ok(css.includes('.river-environment {\n    z-index: 2;'));
  assert.ok(css.includes('.river-world { z-index: 3; }'));
  assert.ok(css.includes('.river-reeds-foreground {\n    z-index: 4;'));
  assert.ok(css.includes('.story-scenes { z-index: 24; }'));
  assert.ok(css.includes('.boat {\n    z-index: 26;'));
  assert.ok(css.includes('.river-chapter.motion-reduced .river-bank-strip.right { transform: scaleX(-1); }'));
  assert.match(css, /drop-shadow\(0 0 1px var\(--boat-rim\)\)/);
  assert.match(css, /object-position:\s*center 18%/);
});

test('V13.3 SVG paint servers remain local to the inline artwork so the river cannot disappear', async () => {
  const css = await read('src/moubon.css');
  const svg = createRiverArtwork(7200, 1440, 900, 6300, 576);
  assert.match(svg, /class="river-water river-water-base river-channel-water"[^>]*fill="url\(#river-water-base\)"/);
  assert.match(svg, /class="river-bank-earth"[^>]*fill="url\(#river-bank-earth\)"/);
  assert.match(svg, /class="river-wet-mud"[^>]*fill="url\(#river-wet-mud\)"/);
  assert.match(svg, /class="river-water-texture"[^>]*fill="url\(#riverWaterPattern\)"/);
  assert.doesNotMatch(svg, /class="river-current"/);
  assert.doesNotMatch(css, /\.river-(?:water|bank-earth|wet-mud|tree-reflections|water-texture|sky-reflection)[^{]*\{[^}]*fill:\s*url\(#/s);
  assert.doesNotMatch(css, /\.river-path-art path\s*\{\s*fill:\s*none/);
});

test('V13.3 scene choreography shows one focused painting at a time', () => {
  assert.equal(STORY_SCENES.length, 6);
  for (let step = 0; step <= 100; step += 1) {
    const progress = step / 100;
    const active = nearestSceneIndex(progress);
    const visible = STORY_SCENES.map((_, index) => sceneOpacityForProgress(progress, index)).filter(opacity => opacity > .015);
    assert.ok(visible.length <= 1, `more than one scene visible at p=${progress}`);
    assert.equal(sceneOpacityForProgress(progress, active), visible[0] ?? 0);
  }
  for (const scene of STORY_SCENES) {
    const index = STORY_SCENES.indexOf(scene);
    assert.equal(sceneOpacityForProgress(scene.at, index), 1);
  }
});

test('V13.3.2 uses continuous transparent bank composites and keeps a responsive progress rail', async () => {
  const css = await read('src/moubon.css');
  const river = await read('src/river.js');
  assert.match(river, /bank-\$\{side\}-world\$\{variant\}\.webp/);
  assert.match(river, /getBankWorldAsset\(side, measuredWidth\)/);
  assert.match(river, /backgroundImage = `url\("\$\{strip\.dataset\.bg\}"\)`/);
  assert.doesNotMatch(river, /bank-offset|\$\{front\}|\$\{underlay\}/);
  assert.match(river, /--chapter-fade/);
  assert.match(css, /background-repeat: no-repeat/);
  assert.match(css, /background-size: 100% 100%/);
  assert.match(css, /\.scene-track > div\s*\{[^}]*height:\s*100%/s);
  assert.match(css, /\.scene-progress\s*\{[^}]*flex-direction:\s*row/);
  assert.match(css, /\.river-stage::after\s*\{[^}]*opacity:\s*var\(--chapter-fade/s);
  assert.match(css, /\.story-bridge\s*\{[^}]*linear-gradient\(180deg/s);
});


test('V13.3 river band has a continuous monotonic cross-section through bends', () => {
  const path = buildRiverBand(6605, .037, .995, 288, 30, 2.4, 1200, -.042, 1.042);
  const points = [...path.matchAll(/[ML]\s+([-\d.]+)\s+([-\d.]+)/g)].map(match => [Number(match[1]), Number(match[2])]);
  const half = points.length / 2;
  const left = points.slice(0, half);
  const right = points.slice(half).reverse();
  assert.equal(left.length, right.length);
  for (let index = 0; index < left.length; index += 1) {
    assert.ok(left[index][0] < right[index][0], `bank edges cross at sample ${index}`);
    assert.equal(left[index][1], right[index][1], `bank sample y diverges at ${index}`);
    if (index > 0) assert.ok(left[index][1] > left[index - 1][1], `river y is not monotonic at ${index}`);
  }
});


test('V13.3 initializes the render scheduler before river setup can request a frame', async () => {
  const main = await read('src/main.js');
  const pendingDeclaration = main.indexOf('let pending = false;');
  const riverSetup = main.indexOf('const riverStory = setupRiverStory({');
  assert.ok(pendingDeclaration >= 0, 'render scheduler state must be declared');
  assert.ok(riverSetup >= 0, 'river controller must be initialized');
  assert.ok(pendingDeclaration < riverSetup, 'pending must be initialized before setupRiverStory can call onRenderNeeded');
  assert.match(main, /function scheduleRender\(\)\s*\{\s*if \(!pending\)\s*\{ pending = true; requestAnimationFrame\(render\); \}\s*\}/);
});


test('V13.3.2 keeps mobile story paintings above the river paint and chapter fade', async () => {
  const css = await read('src/moubon.css');
  assert.match(css, /\.story-scenes \{ z-index: 24; \}/);
  assert.match(css, /\.river-stage::after\s*\{[^}]*z-index:\s*15/s);
  assert.match(css, /\.scene-art\s*\{[^}]*z-index:\s*1/s);
  assert.match(css, /\.scene-painting\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.boat\s*\{\s*z-index:\s*26;/);
  assert.match(css, /\.river-title\s*\{\s*z-index:\s*28;/);
});

test('V13.3.2 uses responsive desktop/mobile bank composite pairs instead of tiled repeated panels', async () => {
  const river = await read('src/river.js');
  const css = await read('src/moubon.css');
  for (const [name, budget] of [['bank-left-world.webp',260_000],['bank-right-world.webp',260_000],['bank-left-world-tablet.webp',210_000],['bank-right-world-tablet.webp',210_000],['bank-left-world-mobile.webp',150_000],['bank-right-world-mobile.webp',150_000]]) {
    const file = new URL(`../public/assets/${name}`, import.meta.url);
    await access(file);
    assert.ok((await stat(file)).size <= budget, `${name} should stay within ${budget} bytes`);
  }
  assert.match(river, /backgroundImage = `url\("\$\{strip\.dataset\.bg\}"\)`/);
  assert.doesNotMatch(river, /backgroundImage = `url\("\$\{front\}"\), url\("\$\{underlay\}"\)`/);
  assert.match(css, /background-repeat: no-repeat/);
  assert.match(css, /background-size: 100% 100%/);
});

test('V13.3.2 screenshot lab reveals the full staged Bengali caption text', async () => {
  const shots = await read('scripts/river-shots.mjs');
  assert.match(shots, /html\.river-lab-mode \.story-vignette\.is-active \.scene-title/);
  assert.match(shots, /animation: none !important;/);
  assert.match(shots, /opacity: 1 !important;/);
});

test('V13.3.2 replaces road-like vertical glints with short cross-channel reflections', async () => {
  const river = await read('src/river.js');
  const css = await read('src/moubon.css');
  assert.match(river, /Short cross-channel glints read as reflected sky/);
  assert.match(river, /glints\.push\(`M /);
  assert.doesNotMatch(river, /glintLeft|glintRight/);
  assert.match(css, /\.river-sun-glint \{[^}]*stroke-dasharray: none/);
  assert.match(css, /\.boat-contact-shadow \{[^}]*background: rgba\(2, 14, 9, \.28\)/s);
});


test('V13.3.3 chooses initial river bank assets from an explicit viewport width', async () => {
  const river = await read('src/river.js');
  assert.equal(getBankWorldAsset('left', 360), '/assets/bank-left-world-mobile.webp');
  assert.equal(getBankWorldAsset('right', 680), '/assets/bank-right-world-mobile.webp');
  assert.equal(getBankWorldAsset('left', 681), '/assets/bank-left-world-tablet.webp');
  assert.equal(getBankWorldAsset('right', 900), '/assets/bank-right-world-tablet.webp');
  assert.equal(getBankWorldAsset('left', 901), '/assets/bank-left-world.webp');
  assert.equal(getBankWorldAsset('right', 1440), '/assets/bank-right-world.webp');
  assert.throws(() => getBankWorldAsset('center', 1440), /Unknown river bank side/);
  assert.match(river, /renderRiverEnvironment\(environmentHolder, initialWorldWidth\)/);
  const environmentRenderer = river.match(/function renderRiverEnvironment\([\s\S]*?(?=\nfunction renderRiverAmbient)/)?.[0] || '';
  assert.ok(environmentRenderer, 'river environment renderer should exist');
  assert.doesNotMatch(environmentRenderer, /\bworldWidth\b/, 'environment renderer must not read the controller-local worldWidth');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { STORY_SCENES, RIVER_ROUTE } from '../src/story/scenes.js';
import { createRiverArtwork, getBankWorldAsset, shouldPlayStoryVideo } from '../src/river.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const publicFile = path => new URL(`../public${path}`, import.meta.url);

test('V13.5.1 maps the six uploaded films to the six story stops in the intended order', () => {
  assert.equal(STORY_SCENES.length, 6);
  assert.deepEqual(STORY_SCENES.map(scene => scene.id), ['footprints','tiger','honeycomb','smoke','harvest','gift']);
  assert.deepEqual(STORY_SCENES.map(scene => scene.side), ['left','right','left','right','left','right']);
  assert.deepEqual(STORY_SCENES.map(scene => scene.duration), [5,5,5,5,5,5]);
  STORY_SCENES.forEach((scene, index) => {
    assert.equal(scene.video, `/assets/story-video/scene-0${index + 1}-${['footprints','tiger','discovery','smoke','harvest','golden-gift'][index]}.mp4`);
    assert.ok(scene.poster.startsWith('/assets/story-posters/'));
    assert.ok(scene.copy && scene.title && scene.alt);
    assert.equal(scene.imageSize.width, 1280);
    assert.equal(scene.imageSize.height, 720);
  });
});

test('all six MP4 files and their poster frames exist within the optimized asset budgets', async () => {
  let totalVideoBytes = 0;
  let totalPosterBytes = 0;
  for (const scene of STORY_SCENES) {
    const videoPath = publicFile(scene.video);
    const posterPath = publicFile(scene.poster);
    const [videoInfo, posterInfo, video, poster] = await Promise.all([
      stat(videoPath), stat(posterPath), readFile(videoPath), readFile(posterPath)
    ]);
    assert.ok(videoInfo.size > 500_000 && videoInfo.size <= 1_800_000, `${scene.video}: ${videoInfo.size}`);
    assert.ok(posterInfo.size > 30_000 && posterInfo.size <= 180_000, `${scene.poster}: ${posterInfo.size}`);
    assert.equal(video.toString('ascii', 4, 8), 'ftyp', `${scene.video} must be MP4`);
    assert.equal(poster.toString('ascii', 0, 4), 'RIFF');
    assert.equal(poster.toString('ascii', 8, 12), 'WEBP');
    totalVideoBytes += videoInfo.size;
    totalPosterBytes += posterInfo.size;
  }
  assert.ok(totalVideoBytes < 9_000_000, `all six videos total ${totalVideoBytes} bytes`);
  assert.ok(totalPosterBytes < 1_000_000, `all six posters total ${totalPosterBytes} bytes`);
});

test('only the active story film receives an MP4 source and inactive films return to their poster', async () => {
  const renderer = await read('src/story/scene-renderer.js');
  const river = await read('src/river.js');
  assert.match(renderer, /<video class="scene-painting scene-film"/);
  for (const attribute of ['muted','loop','playsinline','preload="none"','data-video-src','data-poster-src']) assert.ok(renderer.includes(attribute));
  assert.match(renderer, /video\.src = video\.dataset\.videoSrc/);
  assert.match(renderer, /video\.removeAttribute\('src'\)/);
  assert.match(renderer, /video\.pause\(\)/);
  assert.match(renderer, /document\.addEventListener\('visibilitychange'/);
  assert.match(river, /setSceneVideoMode\(moments\[index\], \{ motion \}\)/);
  assert.match(river, /loadScenePoster\(moments\[lastActiveIndex\]\)/);
  assert.match(river, /shouldPlayStoryVideo\(\{ reduced, saveData, labMode: labProgress !== null \}\)/);
  assert.match(river, /setActiveScene\(-1, \{ motion: false \}\)/);
  assert.doesNotMatch(renderer, /sceneEffects|scene-effects/);
});

test('normal story films still play on low-power hardware, while explicit motion/data-saving modes use posters', () => {
  assert.equal(shouldPlayStoryVideo({ reduced: false, saveData: false, labMode: false, lowPower: true }), true);
  assert.equal(shouldPlayStoryVideo({ reduced: true, saveData: false, labMode: false }), false);
  assert.equal(shouldPlayStoryVideo({ reduced: false, saveData: true, labMode: false }), false);
  assert.equal(shouldPlayStoryVideo({ reduced: false, saveData: false, labMode: true }), false);
});

test('river channel is narrower at desktop, tablet and mobile breakpoints', () => {
  assert.equal(RIVER_ROUTE.desktopWaterHalfWidth, .14);
  assert.equal(RIVER_ROUTE.tabletWaterHalfWidth, .16);
  assert.equal(RIVER_ROUTE.mobileWaterHalfWidth, .20);
  const desktop = createRiverArtwork(7200, 1440, 900, 6300);
  const tablet = createRiverArtwork(8200, 768, 1024, 7176);
  const mobile = createRiverArtwork(6000, 390, 844, 5156);
  const ratio = svg => Number(svg.match(/data-water-half-width="([0-9.]+)"/)[1]) * 2 / 1200;
  assert.ok(Math.abs(ratio(desktop) - .2408) < .001);
  assert.ok(Math.abs(ratio(tablet) - .2752) < .001);
  assert.ok(Math.abs(ratio(mobile) - .344) < .001);
  assert.equal(getBankWorldAsset('left', 390), '/assets/bank-left-world-mobile.webp');
  assert.equal(getBankWorldAsset('right', 1440), '/assets/bank-right-world.webp');
});

test('cinematic film frames stay 16:9, captions remain outside, and tablet/mobile story lanes avoid the boat', async () => {
  const css = await read('src/moubon.css');
  const renderer = await read('src/story/scene-renderer.js');
  assert.match(css, /\.scene-art\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.scene-film\.scene-painting\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(css, /width:\s*clamp\(220px,\s*21vw,\s*380px\)/);
  assert.match(css, /@media \(min-width:\s*681px\) and \(max-width:\s*900px\)/);
  assert.match(css, /top:\s*12\.5%/);
  assert.match(css, /@media \(max-width:\s*680px\)/);
  assert.match(css, /top:\s*10\.5%/);
  assert.match(css, /\.scene-description\s*\{[^}]*font-size:\s*14px/s);
  assert.match(css, /\.scene-phase\s*\{[^}]*font-size:\s*12px/s);
  assert.match(renderer, /<div class="scene-copy">/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /river-chapter\.motion-reduced \.scene-film\.scene-painting/);
});

test('river screenshot QA checks poster visibility, video lazy-loading, narrow channel and alternating story lanes', async () => {
  const shots = await read('scripts/river-shots.mjs');
  assert.match(shots, /visibleSceneVideo/);
  assert.match(shots, /loadedVideoSources/);
  assert.match(shots, /sceneVideos !== 6|storyVideos !== 6/);
  assert.match(shots, /channelLimit = result\.viewport > 900 \? \.31 : result\.viewport > 680 \? \.35 : \.43/);
  assert.match(shots, /video\.poster/);
  assert.match(shots, /active story video poster\/frame/);
});

test('local development server serves story MP4s with the correct video MIME type', async () => {
  const server = await read('scripts/dev-server.mjs');
  assert.match(server, /['"]\.mp4['"]\s*:\s*['"]video\/mp4['"]/);
});

test('video verification and QA commands are wired into the package', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.version, '13.5.7');
  assert.equal(pkg.scripts['river:verify-videos'], 'node scripts/verify-story-videos.mjs');
  assert.ok(pkg.scripts.qa);
  const qa = await read('scripts/qa.mjs');
  assert.match(qa, /river:verify-videos/);
  assert.match(qa, /river:shots/);
  const verifier = await read('scripts/verify-story-videos.mjs');
  const prelaunch = await read('scripts/prelaunch-check.mjs');
  assert.match(verifier, /MAX_VIDEO_BYTES/);
  assert.match(verifier, /ftyp/);
  assert.match(prelaunch, /mp4/);
  assert.match(prelaunch, /story-video\/scene-01-footprints\.mp4/);
});

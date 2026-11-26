import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STORY_SCENES } from '../src/story/scenes.js';
import { setupStoryAudio } from '../src/story-audio.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [css, main, river, renderer, audio] = await Promise.all([
  read('src/moubon.css'),
  read('src/main.js'),
  read('src/river.js'),
  read('src/story/scene-renderer.js'),
  read('src/story-audio.js')
]);

test('V13.5.7 moves the journey meter away from alternating story captions', () => {
  assert.match(css, /V13\.5\.7[\s\S]*?\.scene-progress\s*\{[^}]*bottom:[^}]*left:\s*50%[^}]*flex-direction:\s*row/s);
  assert.match(css, /\.scene-progress \.scene-track\s*\{[^}]*width:\s*76px[^}]*height:\s*3px/s);
  assert.match(river, /sceneTrackFill\.style\.transform = `scaleX\(/);
});

test('V13.5.7 hides Story 1 phase copy and removes the Story 2 sound button', () => {
  assert.equal(STORY_SCENES[0].showPhase, false);
  assert.equal(STORY_SCENES[1].audio, true);
  assert.match(renderer, /scene\.showPhase === false \? ''/);
  assert.doesNotMatch(renderer, /id="tigerSound"/);
  assert.doesNotMatch(renderer, /নমুনা গর্জন শুনুন/);
});

test('V13.5.7 attempts tiger audio on scene entry and stops it on scene exit', () => {
  assert.match(main, /onSceneChange:storyAudio\.onSceneChange/);
  assert.match(river, /onSceneChange\(index >= 0 \? STORY_SCENES\[index\]\.id : null\)/);
  assert.match(audio, /if \(sceneId === 'tiger'\)/);
  assert.match(audio, /void tryPlayTiger\(\)/);
  assert.match(audio, /tiger\.pause\(\)/);
  assert.match(audio, /pointerdown/);
  assert.match(audio, /waitingForGesture/);
});

test('V13.5.7 reduces the English header wordmark without moving it below Bengali', () => {
  assert.match(css, /V13\.5\.7[\s\S]*?\.header \.logo-en-wrap small\s*\{[^}]*font-size:\s*\.88em/s);
});


test('V13.5.7 audio controller starts on tiger scene entry and pauses on exit', async () => {
  const previousAudio = globalThis.Audio;
  const previousDocument = globalThis.document;
  const instances = [];
  class FakeAudio {
    constructor(src) { this.src = src; this.paused = true; this.currentTime = 0; this.playCalls = 0; this.pauseCalls = 0; instances.push(this); }
    async play() { this.playCalls += 1; this.paused = false; }
    pause() { this.pauseCalls += 1; this.paused = true; }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() {}
  }
  const listeners = new Map();
  globalThis.Audio = FakeAudio;
  globalThis.document = {
    hidden: false,
    addEventListener(type, callback) { listeners.set(type, callback); },
    removeEventListener(type) { listeners.delete(type); }
  };
  try {
    const controller = setupStoryAudio();
    controller.onSceneChange('tiger');
    await Promise.resolve();
    assert.equal(instances[0].playCalls, 1);
    assert.equal(instances[0].paused, false);
    controller.onSceneChange('honeycomb');
    assert.equal(instances[0].paused, true);
    assert.ok(instances[0].pauseCalls >= 1);
    controller.destroy();
    assert.equal(listeners.size, 0);
  } finally {
    if (previousAudio === undefined) delete globalThis.Audio;
    else globalThis.Audio = previousAudio;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

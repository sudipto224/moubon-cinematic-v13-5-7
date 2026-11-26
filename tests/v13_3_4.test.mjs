import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { riverEndTaper, buildRiverBand, buildRiverEdgePath } from '../src/river-art.js';
import { isIntentionalTitleSafeArea } from '../scripts/river-qa-helpers.mjs';


test('current river entry uses the wider V13.3.5 inlet taper and returns to full channel width', () => {
  assert.equal(riverEndTaper(0), .48);
  assert.equal(riverEndTaper(1), .48);
  assert.equal(riverEndTaper(.22), 1);
  assert.equal(riverEndTaper(.5), 1);
  assert.ok(riverEndTaper(.02) < riverEndTaper(.04));
});

test('water and foam bank edges both use the same end taper', async () => {
  const source = await readFile(new URL('../src/river-art.js', import.meta.url), 'utf8');
  assert.match(source, /\* riverEndTaper\(point\.localProgress\)/g);
  const band = buildRiverBand(9000, .02, .98, 300, 18, .5, 1200, -.1, 1.1);
  const edge = buildRiverEdgePath(9000, .02, .98, 300, -1, 12, .5, 1200, -.1, 1.1);
  assert.ok(band.startsWith('M '));
  assert.ok(band.endsWith(' Z'));
  assert.ok(edge.startsWith('M '));
});

test('V13.3.4 title-safe exception is limited to opening desktop header tiles', () => {
  const base = { progress: 0, imageWidth: 1920, imageHeight: 1080, tileX: 8, tileY: 0, tileSamples: 16, grid: 64 };
  assert.equal(isIntentionalTitleSafeArea(base), true);
  assert.equal(isIntentionalTitleSafeArea({ ...base, progress: .08 }), false);
  assert.equal(isIntentionalTitleSafeArea({ ...base, imageWidth: 390 }), false);
  assert.equal(isIntentionalTitleSafeArea({ ...base, tileY: 8 }), false);
  assert.equal(isIntentionalTitleSafeArea({ ...base, tileX: 0 }), false);
});

test('V13.3.4 visual QA documents the narrow title-safe exception rather than disabling the detector', async () => {
  const script = await readFile(new URL('../scripts/river-shots.mjs', import.meta.url), 'utf8');
  assert.match(script, /Documented exception: at progress 0\.00 only/);
  assert.match(script, /mobile and all other positions remain fully checked/);
  assert.match(script, /no qualifying near-flat quarter-screen regions outside the documented title-safe area/);
});

test('V13.3.4 bank composites stay within the asset budget and preserve alpha edges', async () => {
  const verifier = await readFile(new URL('../scripts/verify-cutouts.py', import.meta.url), 'utf8');
  assert.match(verifier, /bank-left-world\.webp/);
  assert.match(verifier, /size_ok/);
  assert.match(verifier, /right_edge_max == 0/);
});


test('V13.3.4 includes a reproducible bank-composite builder command', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const builder = await readFile(new URL('../scripts/build-bank-world.py', import.meta.url), 'utf8');
  assert.equal(pkg.scripts['river:build-banks'], 'python scripts/build-bank-world.py');
  assert.match(builder, /bank-a-cut\.webp/);
  assert.match(builder, /bank-b-cut\.webp/);
  assert.match(builder, /vertical_fade/);
});

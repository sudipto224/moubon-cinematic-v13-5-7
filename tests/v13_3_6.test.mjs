import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('V13.3.6 fixed-progress lab applies progress synchronously and returns diagnostics', async () => {
  const main = await read('src/main.js');
  assert.match(main, /window\.__MOUBON_RIVER_LAB_SET_PROGRESS = value => \{/);
  assert.match(main, /riverStory\.setLabProgress\(requested\);\s*render\(\);/);
  assert.match(main, /rendered: riverStory\.lastProgress/);
  assert.match(main, /ariaValue: Number\(\$\('#sceneProgress'\)\?\.getAttribute\('aria-valuenow'\)/);
});

test('V13.3.6 screenshot runner reports expected and actual lab progress instead of a generic timeout', async () => {
  const shots = await read('scripts/river-shots.mjs');
  assert.match(shots, /lab progress mismatch; expected aria=/);
  assert.match(shots, /applied\?\.rendered/);
  assert.doesNotMatch(shots, /waitForFunction\(value => \{\s*const current = Number\(document\.querySelector\('#sceneProgress'/);
});

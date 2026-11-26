import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { riverEndTaper } from '../src/river-art.js';
import { getBankWorldAsset } from '../src/river.js';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const assets = new URL('../public/assets/', import.meta.url);

test('V13.3.5 river inlet is wider and tapers gradually rather than forming a narrow funnel', () => {
  assert.equal(riverEndTaper(0), .48);
  assert.equal(riverEndTaper(1), .48);
  assert.equal(riverEndTaper(.22), 1);
  assert.ok(riverEndTaper(.03) > .48);
  assert.ok(riverEndTaper(.03) < riverEndTaper(.10));
});

test('V13.3.5 selects aspect-matched bank composites for desktop, tablet and mobile', () => {
  assert.equal(getBankWorldAsset('left', 360), '/assets/bank-left-world-mobile.webp');
  assert.equal(getBankWorldAsset('right', 680), '/assets/bank-right-world-mobile.webp');
  assert.equal(getBankWorldAsset('left', 681), '/assets/bank-left-world-tablet.webp');
  assert.equal(getBankWorldAsset('right', 900), '/assets/bank-right-world-tablet.webp');
  assert.equal(getBankWorldAsset('left', 901), '/assets/bank-left-world.webp');
  assert.equal(getBankWorldAsset('right', 1920), '/assets/bank-right-world.webp');
});

test('V13.3.5 responsive bank composites exist and fit their per-breakpoint budgets', async () => {
  const budgets = {
    'bank-left-world.webp': 260_000, 'bank-right-world.webp': 260_000,
    'bank-left-world-tablet.webp': 210_000, 'bank-right-world-tablet.webp': 210_000,
    'bank-left-world-mobile.webp': 150_000, 'bank-right-world-mobile.webp': 150_000
  };
  for (const [name, budget] of Object.entries(budgets)) {
    const info = await stat(new URL(name, assets));
    assert.ok(info.size <= budget, `${name} exceeds ${budget} bytes`);
  }
});

test('V13.3.5 expands forest composition without filling the central title-safe area', async () => {
  const css = await read('src/moubon.css');
  const river = await read('src/river.js');
  assert.match(css, /width:\s*min\(46vw, 860px\)/);
  assert.match(css, /width:\s*min\(36vw, 320px\)/);
  assert.match(css, /width:\s*min\(42vw, 160px\)/);
  assert.match(river, /width <= 900 \? '-tablet'/);
  assert.match(css, /radial-gradient\(ellipse 52% 58% at 0% 38%/);
});

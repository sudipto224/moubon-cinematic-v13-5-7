import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/moubon.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('V13.5.6 replaces the cream footer panel with a forest-glass treatment', () => {
  assert.match(css, /\.footer-heritage \.footer-paper\s*\{[^}]*linear-gradient\(145deg, rgba\(14, 59, 40/);
  assert.match(css, /\.footer-heritage \.footer-collection > p\s*\{[^}]*font-size: 16px/);
  assert.match(css, /\.footer-heritage \.footer-nav a\s*\{[^}]*font-size: 16px/);
});

test('V13.5.6 base wordmark stays inline before the V13.5.7 English-size refinement', () => {
  assert.match(html, /class="logo-bn"/);
  assert.match(html, /class="logo-en-wrap"/);
  assert.match(css, /\.header \.logo-bn\s*\{[^}]*font-size: 1em/);
  assert.match(css, /\.header \.logo-en-wrap small\s*\{[^}]*font: 800 1em\/1/);
  assert.match(css, /V13\.5\.7[\s\S]*?\.header \.logo-en-wrap small\s*\{[^}]*font-size: \.88em/);
});

test('V13.5.6 includes narrow-screen footer and header layout rules', () => {
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*?\.footer-heritage \.footer-main\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 360px\)[\s\S]*?\.header \.logo-en-wrap small/);
});

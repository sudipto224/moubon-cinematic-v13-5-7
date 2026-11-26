import { access, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { MOUBON_CONFIG, SITE_URL } from '../config.js';

const root = process.cwd();
const dist = resolve(root, 'dist');
const passed = [];
const failed = [];
const note = [];

function check(condition, success, problem) {
  (condition ? passed : failed).push(condition ? success : problem);
}

async function walk(directory) {
  const found = [];
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch { return found; }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await walk(path));
    else found.push(path);
  }
  return found;
}

function visibleText(markup) {
  return markup
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  const frameMarkers = new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = buffer.readUInt16BE(offset);
    if (frameMarkers.has(marker)) return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    if (length < 2) return null;
    offset += length;
  }
  return null;
}

let indexHtml = '';
let notFoundHtml = '';
let css = '';
let buildExists = true;
try {
  indexHtml = await readFile(join(dist, 'index.html'), 'utf8');
  notFoundHtml = await readFile(join(dist, '404.html'), 'utf8');
  css = await readFile(join(dist, 'src', 'moubon.css'), 'utf8');
} catch {
  buildExists = false;
}
check(buildExists, 'Production build files exist (index.html, 404.html and stylesheet).', 'Production build is missing. Run npm run build before this check.');

const siteIsReal = /^https:\/\/(?!your-domain\.example(?:\/|$))[^\s/]+(?:\/[^\s]*)?$/i.test(String(SITE_URL)) && !String(SITE_URL).includes('your-domain.example');
check(siteIsReal, `SITE_URL is configured: ${SITE_URL}`, `SITE_URL is still a placeholder or is not a valid HTTPS URL: ${SITE_URL}`);
const whatsappIsReady = /^\d{10,15}$/.test(String(MOUBON_CONFIG.whatsappNumber || ''));
check(whatsappIsReady, 'WhatsApp number is digits-only and 10–15 digits.', 'whatsappNumber is empty or invalid; enter the verified business number using digits only.');

const published = Array.isArray(MOUBON_CONFIG.products) ? MOUBON_CONFIG.products.filter(product => product?.published === true) : [];
check(published.length > 0, `${published.length} published product(s) configured.`, 'No published product is configured. Add at least one verified product before launch.');
for (const product of published) {
  const label = product.name || product.id || 'Unnamed product';
  check(Number.isFinite(Number(product.price)) && Number(product.price) > 0, `${label}: price is configured.`, `${label}: add a verified price greater than zero.`);
  const localImage = typeof product.image === 'string' && product.image.startsWith('/assets/') && !product.image.includes('..');
  let imageExists = false;
  if (localImage) {
    const extension = product.image.toLowerCase().split('.').pop();
    const realPhotoType = ['webp','avif','jpg','jpeg','png'].includes(extension);
    try { await access(join(dist, product.image.replace(/^\//, ''))); imageExists = realPhotoType; } catch {}
  }
  check(imageExists, `${label}: local product photo exists.`, `${label}: add a real local product photo under public/assets and set its /assets/... path.`);
}

const allDistFiles = await walk(dist);
const publicAssets = await walk(join(root, 'public', 'assets'));
const doubleExtension = [...publicAssets, ...allDistFiles].filter(path => /\.(webp|png|jpe?g)\.\1$/i.test(path));
check(doubleExtension.length === 0, 'No doubled image extensions found.', `Doubled image extensions found: ${doubleExtension.map(path => relative(root, path)).join(', ')}`);

if (MOUBON_CONFIG.demoMode === false && indexHtml) {
  const text = visibleText(indexHtml + '\n' + notFoundHtml);
  const placeholders = ['demo', 'এখানে নিজের', 'TODO', 'lorem', 'your-domain.example'];
  const visiblePlaceholders = placeholders.filter(term => text.toLowerCase().includes(term.toLowerCase()));
  check(visiblePlaceholders.length === 0, 'No demo or placeholder copy is visible while demoMode is false.', `Visible placeholder/demo strings remain: ${visiblePlaceholders.join(', ')}`);
} else if (MOUBON_CONFIG.demoMode === false) {
  check(false, '', 'Could not inspect visible text because the production HTML is missing.');
} else {
  note.push('demoMode is true; visible demo copy is permitted by configuration.');
}

// Verify every explicit local /assets reference in built text output.
const textFiles = allDistFiles.filter(path => /\.(?:html|css|js|mjs|json|xml|txt|webmanifest)$/i.test(path));
const assetRefs = new Set();
for (const path of textFiles) {
  const source = await readFile(path, 'utf8').catch(() => '');
  for (const match of source.matchAll(/\/assets\/([A-Za-z0-9._/-]+\.(?:avif|webp|mp4|svg|png|jpe?g|ico|woff2|wav|mp3))/gi)) assetRefs.add(match[1]);
}
const missingAssets = [];
for (const asset of assetRefs) {
  try { await access(join(dist, 'assets', asset)); }
  catch { missingAssets.push(`/assets/${asset}`); }
}
check(missingAssets.length === 0, `${assetRefs.size} explicit local asset reference(s) resolve.`, `Missing referenced asset(s): ${missingAssets.join(', ')}`);

const expectedEnvironment = ['hero-painterly.avif','hero-painterly.webp','hero-painterly-mobile.avif','hero-painterly-mobile.webp','water-seamless.webp','bank-a-cut.webp','bank-b-cut.webp','foreground-reeds-cut.webp',
  'story-video/scene-01-footprints.mp4','story-video/scene-02-tiger.mp4','story-video/scene-03-discovery.mp4','story-video/scene-04-smoke.mp4','story-video/scene-05-harvest.mp4','story-video/scene-06-golden-gift.mp4',
  'story-posters/scene-01-footprints.webp','story-posters/scene-02-tiger.webp','story-posters/scene-03-discovery.webp','story-posters/scene-04-smoke.webp','story-posters/scene-05-harvest.webp','story-posters/scene-06-golden-gift.webp'];
const missingEnvironment = [];
for (const asset of expectedEnvironment) {
  try { await access(join(dist, 'assets', asset)); } catch { missingEnvironment.push(asset); }
}
check(missingEnvironment.length === 0, 'Hero, water, bank and foreground artwork is present in the build.', `Missing required environment artwork: ${missingEnvironment.join(', ')}`);

const canonical = indexHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || '';
const ogUrl = indexHtml.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1] || '';
const ogImage = indexHtml.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1] || '';
const twitterImage = indexHtml.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i)?.[1] || '';
const expectedHome = `${String(SITE_URL).replace(/\/$/, '')}/`;
const expectedImage = `${String(SITE_URL).replace(/\/$/, '')}/assets/og-image.jpg`;
const seoUrlsMatch = Boolean(canonical === expectedHome && ogUrl === expectedHome && ogImage === expectedImage && twitterImage === expectedImage);
check(seoUrlsMatch, 'Canonical, Open Graph and Twitter URLs match SITE_URL.', 'Canonical, og:url, og:image or twitter:image does not match SITE_URL.');

let sitemap = '', robots = '', structuredDataText = '';
try { sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8'); } catch {}
try { robots = await readFile(join(dist, 'robots.txt'), 'utf8'); } catch {}
const jsonLd = indexHtml.match(/<script[^>]*id="siteStructuredData"[^>]*>([\s\S]*?)<\/script>/i)?.[1] || '';
let structuredDataValid = false;
try {
  const parsed = JSON.parse(jsonLd);
  structuredDataText = JSON.stringify(parsed);
  const graph = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [];
  structuredDataValid = graph.some(item => item['@type'] === 'Organization' && item.url === expectedHome)
    && graph.filter(item => item['@type'] === 'Product').length === published.filter(product => product.name && product.description && product.image).length;
} catch {}
check(Boolean(sitemap.includes(`<loc>${expectedHome}</loc>`) && robots.includes(`Sitemap: ${String(SITE_URL).replace(/\/$/, '')}/sitemap.xml`) && structuredDataValid), 'Sitemap, robots and Organization/Product JSON-LD agree with SITE_URL and published products.', 'Sitemap, robots or JSON-LD is missing, invalid or inconsistent with SITE_URL/product configuration.');

let ogBytes = 0;
let ogSize = null;
try {
  const image = await readFile(join(dist, 'assets', 'og-image.jpg'));
  ogBytes = image.length;
  ogSize = jpegDimensions(image);
} catch {}
check(Boolean(ogSize && ogSize.width === 1200 && ogSize.height === 630 && ogBytes < 250 * 1024), `og-image.jpg is ${ogSize?.width || '?'}×${ogSize?.height || '?'} and ${(ogBytes / 1024).toFixed(1)} KB.`, `og-image.jpg must be 1200×630 and under 250 KB (found ${ogSize?.width || '?'}×${ogSize?.height || '?'}, ${(ogBytes / 1024).toFixed(1)} KB).`);

const textForClaims = visibleText(indexHtml + "\n" + notFoundHtml);
const claimWatchlist = Array.isArray(MOUBON_CONFIG.claimWatchlist) ? MOUBON_CONFIG.claimWatchlist : [];
const visibleClaims = claimWatchlist.filter(claim => claim && textForClaims.includes(claim));
const claimsOkay = MOUBON_CONFIG.claimsVerified === true || visibleClaims.length === 0;
check(claimsOkay, 'No unverified claim-watchlist phrase is visible, or claimsVerified is true.', `Unverified claim phrase(s) are visible: ${visibleClaims.join(', ')}. Verify them or revise heroTagline and set claimsVerified only after evidence review.`);

check(/prefers-reduced-motion\s*:\s*reduce/.test(css), 'Reduced-motion styling is present.', 'Reduced-motion CSS is missing.');
check(/<noscript>[\s\S]*?<\/noscript>/i.test(indexHtml) && /noscript-story/.test(indexHtml), 'A readable no-script story fallback is present.', 'Readable noscript story content is missing.');
check(/<title>/.test(notFoundHtml) && /not-found-page/.test(notFoundHtml), 'A styled 404 page is present.', 'Styled 404 page is missing.');

const lines = [
  '# Moubon V13 — Prelaunch Report',
  '',
  `- Checked: ${new Date().toISOString()}`,
  `- SITE_URL: ${SITE_URL}`,
  `- demoMode: ${MOUBON_CONFIG.demoMode}`,
  `- Published products: ${published.length}`,
  '',
  '## Checks',
  ...passed.map(message => `- PASS — ${message}`),
  ...failed.map(message => `- FAIL — ${message}`),
  ...note.map(message => `- NOTE — ${message}`),
  '',
  `**Result: ${failed.length ? 'FAIL' : 'PASS'} (${passed.length} passed, ${failed.length} failed).**`,
  '',
  'This report checks configuration and built files. It does not certify product claims, legal rights, visual quality, Lighthouse scores or real-device performance.'
];
await writeFile(join(root, 'PRELAUNCH_REPORT.md'), lines.join('\n') + '\n', 'utf8');
console.log(lines.join('\n'));
if (failed.length) process.exitCode = 1;

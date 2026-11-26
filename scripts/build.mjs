import { rm, mkdir, cp, copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { SITE_URL, MOUBON_CONFIG } from '../config.js';

const out = 'dist';
const siteUrl = String(SITE_URL).replace(/\/$/, '');
await rm(out, { recursive:true, force:true });
await mkdir(out, { recursive:true });
await copyFile('index.html', join(out,'index.html'));
await copyFile('404.html', join(out,'404.html'));
await copyFile('config.js', join(out,'config.js'));
await cp('src', join(out,'src'), { recursive:true });
await cp('public/assets', join(out,'assets'), { recursive:true });

// Copy public root resources (manifest, favicons if placed there, etc.).
for (const entry of await readdir('public', { withFileTypes:true })) {
  if (entry.isFile()) await copyFile(join('public',entry.name),join(out,entry.name));
}

const organization = {
  '@type':'Organization',
  name:MOUBON_CONFIG.brand || 'মৌবন',
  url:`${siteUrl}/`,
  logo:`${siteUrl}/assets/favicon.svg`,
  description:MOUBON_CONFIG.siteDescription || ''
};
if (Array.isArray(MOUBON_CONFIG.socialLinks) && MOUBON_CONFIG.socialLinks.length) {
  organization.sameAs = MOUBON_CONFIG.socialLinks.filter(url => /^https:\/\//i.test(url));
}
const products = (Array.isArray(MOUBON_CONFIG.products) ? MOUBON_CONFIG.products : [])
  .filter(product => product.published === true && product.name && product.description && product.image)
  .map(product => {
    const schema = {
      '@type':'Product',
      name:product.name,
      description:product.description,
      image:product.image.startsWith('http') ? product.image : `${siteUrl}${product.image.startsWith('/')?'':'/'}${product.image}`,
      brand:{'@type':'Brand',name:MOUBON_CONFIG.brand || 'মৌবন'}
    };
    const price = Number(product.price);
    if (Number.isFinite(price) && price > 0) schema.offers = {'@type':'Offer',price,priceCurrency:'BDT'};
    return schema;
  });
const structuredData = {'@context':'https://schema.org','@graph':[organization,...products]};
let html = await readFile(join(out,'index.html'),'utf8');
html = html.replaceAll('__SITE_URL__',siteUrl).replace('__MOUBON_JSONLD__',JSON.stringify(structuredData));
await writeFile(join(out,'index.html'),html,'utf8');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>\n`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
await writeFile(join(out,'sitemap.xml'),sitemap,'utf8');
await writeFile(join(out,'robots.txt'),robots,'utf8');

let fileCount=0,totalBytes=0;
async function measure(dir) {
  for (const item of await readdir(dir,{withFileTypes:true})) {
    const path=join(dir,item.name);
    if (item.isDirectory()) await measure(path);
    else { const {size}=await import('node:fs/promises').then(fs=>fs.stat(path)); fileCount++; totalBytes+=size; }
  }
}
await measure(out);
console.log(`Built ./${out} — static site ready for Netlify/Vercel.`);
console.log(`Files: ${fileCount} · Dist size: ${(totalBytes/1024/1024).toFixed(2)} MB · SITE_URL: ${siteUrl}`);
if (siteUrl.includes('your-domain.example')) console.warn('Set SITE_URL in config.js to your real domain before publishing.');

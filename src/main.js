import { setupBeeLogo } from './bee-logo.js';
import { setupShop } from './shop.js';
import { setupStoryAudio } from './story-audio.js';
import {setupRiverStory} from './river.js';
import { MOUBON_CONFIG, SITE_URL } from '../config.js';
import {getDeviceProfile} from './utils/device.js';
import {setupHoneyJar} from './jar.js';

const $ = (selector, scope=document) => scope.querySelector(selector);
const clamp = (value, low=0, high=1) => Math.min(high, Math.max(low, value));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const deviceProfile = getDeviceProfile();
document.documentElement.classList.toggle('low-power',deviceProfile.lowPower);
const riverWorld = $('#riverWorld');
const riverTrack = $('#riverScrollTrack');
const riverStage = $('#riverStage');
const riverChapter = $('#river');
const jar = $('#jar');
const riverLabParams = new URLSearchParams(window.location.search);
const riverLabMode = riverLabParams.get('lab') === '1';
if (riverLabMode) {
  document.documentElement.classList.add('river-lab-mode');
  document.documentElement.dataset.riverLabWidth = riverLabParams.get('w') || '';
  document.documentElement.dataset.riverLabHeight = riverLabParams.get('h') || '';
}
const globalProgress = $('#progress');
const readingStatus = $('#readingStatus');
const storyAudio = setupStoryAudio();

// setupRiverStory may synchronously request a render (the fixed-progress lab
// does this during initialization), so the rAF scheduler state must exist first.
let pending = false;

const riverStory = setupRiverStory({
  chapter:riverChapter,
  track:riverTrack,
  stage:riverStage,
  world:riverWorld,
  artHolder:$('#riverArtHolder'),
  environmentHolder:$('#riverEnvironment'),
  ambientHolder:$('#riverAmbient'),
  boat:$('#boat'),
  sceneContainer:$('#storyScenes'),
  markersContainer:$('#riverStopMarkers'),
  sceneProgress:$('#sceneProgress'),
  sceneNumber:$('#sceneNumber'),
  sceneTrackFill:$('#sceneTrackFill'),
  onSceneChange:storyAudio.onSceneChange,
  reducedMotion,
  onRenderNeeded:() => scheduleRender()
});
const renderRiver = riverStory.render;
if (riverLabMode) riverStory.setLabProgress(Number(riverLabParams.get('p') || 0));
const renderHoneyJar = setupHoneyJar(jar);

// Cache layout geometry outside the scroll loop; only resize/content changes read layout.
const layout = { riverTop:0, riverHeight:0, jarTop:0, jarHeight:0, pageHeight:0, viewportHeight:window.innerHeight };
let lastRenderedScrollY=window.scrollY;
function measureLayout() {
  const scrollY = window.scrollY;
  const riverRect = riverTrack.getBoundingClientRect();
  const jarRect = jar.getBoundingClientRect();
  layout.riverTop = riverRect.top + scrollY;
  layout.riverHeight = riverTrack.offsetHeight;
  riverStory.measure(layout.riverHeight, riverStage.clientWidth || window.innerWidth, riverStage.clientHeight || window.innerHeight);
  layout.jarTop = jarRect.top + scrollY;
  layout.jarHeight = jar.offsetHeight;
  layout.pageHeight = document.documentElement.scrollHeight;
  layout.viewportHeight = window.innerHeight;
  scheduleRender();
}


function render() {
  pending = false;
  const viewportH = layout.viewportHeight || window.innerHeight;
  const scrollY = window.scrollY;
  const scrollSpeed = clamp(Math.abs(scrollY-lastRenderedScrollY)/42);
  lastRenderedScrollY = scrollY;
  const pageTravel = Math.max(1, layout.pageHeight - viewportH);
  globalProgress.style.width = `${(scrollY/pageTravel*100).toFixed(2)}%`;
  const atRiver = renderRiver(viewportH, scrollY, scrollSpeed, layout.riverTop, layout.riverHeight);
  const atJar = renderHoneyJar(viewportH, scrollY, layout.jarTop, layout.jarHeight, scrollSpeed);
  readingStatus.textContent = atJar ? '05 / THE HONEY JAR' : atRiver ? '02–04 / THE RIVER JOURNEY' : 'SUNDARBANS / SCROLL STORY';
  readingStatus.classList.toggle('visible', (atRiver||atJar) && viewportH>680);
}
function scheduleRender() {
  if (!pending) { pending = true; requestAnimationFrame(render); }
}

// The screenshot lab must be deterministic: apply the requested progress and
// render it synchronously instead of relying on a queued animation frame. The
// returned state makes a failed application immediately diagnosable.
if (riverLabMode) {
  window.__MOUBON_RIVER_LAB_SET_PROGRESS = value => {
    const requested = clamp(Number(value) || 0);
    riverStory.setLabProgress(requested);
    render();
    return {
      requested,
      rendered: riverStory.lastProgress,
      ariaValue: Number($('#sceneProgress')?.getAttribute('aria-valuenow') ?? -1)
    };
  };
}

// Measure once on startup and when layout dimensions change, never on each scroll frame.
measureLayout();
window.addEventListener('resize', measureLayout, {passive:true});
window.addEventListener('orientationchange', measureLayout, {passive:true});
window.addEventListener('scroll', scheduleRender, {passive:true});
window.addEventListener('load', measureLayout, {once:true});
document.fonts?.ready?.then(measureLayout);
if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(() => measureLayout());
  layoutObserver.observe(riverTrack);
  layoutObserver.observe(riverStage);
  layoutObserver.observe(jar);
  layoutObserver.observe(document.body);
}
reducedMotion.addEventListener?.('change', () => {
  riverStory.setReducedMotion(reducedMotion.matches);
  measureLayout();
  scheduleRender();
});

// Mobile navigation: Escape closes it and focus returns to the trigger.
const toggle = $('#menuToggle');
const mobileNav = $('#mobileNav');
function closeMenu(restoreFocus=false) {
  mobileNav.hidden = true;
  toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','মেনু খুলুন');
  toggle.textContent = '☰';
  if (restoreFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = mobileNav.hidden;
  mobileNav.hidden = !open;
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'মেনু বন্ধ করুন':'মেনু খুলুন');
  toggle.textContent = open ? '✕' : '☰';
  if (open) mobileNav.querySelector('a')?.focus();
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(true)));
document.addEventListener('keydown', event => {
  if (mobileNav.hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
  if (event.key === 'Tab') {
    const focusable = [...mobileNav.querySelectorAll('a[href]')].filter(link => link.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
document.addEventListener('click',event => { if (!mobileNav.hidden && !mobileNav.contains(event.target) && !toggle.contains(event.target)) closeMenu(); });

// Apply the configured canonical/share URLs in dev; production build writes them statically.
function applySiteMetadata() {
  const base = String(SITE_URL).replace(/\/$/,'');
  const canonical = $('link[rel="canonical"]');
  if (canonical) canonical.href = `${base}/`;
  for (const meta of document.querySelectorAll('[data-site-url]')) {
    meta.content = meta.content.replaceAll('__SITE_URL__',base);
  }
  const schema = $('#siteStructuredData');
  if (schema?.textContent.includes('__MOUBON_JSONLD__')) {
    const organization = {'@type':'Organization',name:MOUBON_CONFIG.brand||'মৌবন',url:`${base}/`,logo:`${base}/assets/favicon.svg`,description:MOUBON_CONFIG.siteDescription||''};
    if (Array.isArray(MOUBON_CONFIG.socialLinks) && MOUBON_CONFIG.socialLinks.length) organization.sameAs=MOUBON_CONFIG.socialLinks.filter(url=>/^https:\/\//i.test(url));
    schema.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[organization]});
  }
}
applySiteMetadata();
const heroTagline = $('#heroTagline');
if (heroTagline && typeof MOUBON_CONFIG.heroTagline === 'string') heroTagline.textContent = MOUBON_CONFIG.heroTagline;
setupBeeLogo({canvas:$('#beeLogoCanvas'),title:$('#heroTitle'),stage:$('#beeStage'),reducedMotion});
const poetrySection = $('#poetry');
if (poetrySection) {
  setupBeeLogo({
    canvas: $('#poetryBeeCanvas'),
    title: $('#poetryTitle'),
    stage: poetrySection,
    reducedMotion,
    beeScale: 0.62,
    beeCount: { desktop: 6, tablet: 5, mobile: 4 }
  });
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    poetrySection.classList.add('is-visible');
  } else {
    const poetryRevealObserver = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        poetrySection.classList.add('is-visible');
        poetryRevealObserver.disconnect();
      }
    }, { threshold: 0.22 });
    poetryRevealObserver.observe(poetrySection);
  }
}
// Cinematic reveal sequence: golden light -> title reveal -> metallic shine -> bees orbiting.
// The hero-honey-reveal drop plays first (~640ms), then the golden glow fades in,
// followed by the metallic title reveal, then the bees begin their elegant orbit.
const beeStage = $('#beeStage');
if (beeStage && !reducedMotion.matches) {
  setTimeout(() => {
    beeStage.classList.add('bees-glow');
  }, 300);
  setTimeout(() => {
    beeStage.classList.add('bees-revealed');
  }, 900);
}
// Gentle mouse parallax on desktop; mobile uses a slow CSS drift and never requests gyroscope access.
const hero = $('#home');
if (hero && 'IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(entries => {
    for (const entry of entries) hero.classList.toggle('is-in-view', entry.isIntersecting);
  }, { rootMargin: '80px 0px' });
  heroObserver.observe(hero);
} else hero?.classList.add('is-in-view');
const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
if (hero && finePointer.matches && !reducedMotion.matches && !deviceProfile.lowPower) {
  let heroFrame=0, pointerX=0, pointerY=0;
  hero.addEventListener('pointermove',event=>{
    const rect=hero.getBoundingClientRect();
    pointerX=((event.clientX-rect.left)/rect.width-.5)*-10;
    pointerY=((event.clientY-rect.top)/rect.height-.5)*-7;
    if (!heroFrame) heroFrame=requestAnimationFrame(()=>{
      hero.style.setProperty('--hero-parallax-x',`${pointerX.toFixed(2)}px`);
      hero.style.setProperty('--hero-parallax-y',`${pointerY.toFixed(2)}px`);
      heroFrame=0;
    });
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{
    hero.style.setProperty('--hero-parallax-x','0px');
    hero.style.setProperty('--hero-parallax-y','0px');
  },{passive:true});
}

// Small pointer-only magnetic response; no touch listeners or scroll-frame layout reads.
if (finePointer.matches && !reducedMotion.matches && !deviceProfile.lowPower) {
  const magneticTargets = document.querySelectorAll('.header-order, .hero-primary, .hero-secondary, .cart-open, .cart-send');
  magneticTargets.forEach(target => {
    target.addEventListener('pointermove', event => {
      const rect = target.getBoundingClientRect();
      const x = clamp((event.clientX - (rect.left + rect.width / 2)) * .055, -3, 3);
      const y = clamp((event.clientY - (rect.top + rect.height / 2)) * .055, -3, 3);
      target.style.setProperty('--magnet-x', `${x.toFixed(2)}px`);
      target.style.setProperty('--magnet-y', `${y.toFixed(2)}px`);
    }, { passive: true });
    target.addEventListener('pointerleave', () => {
      target.style.setProperty('--magnet-x', '0px');
      target.style.setProperty('--magnet-y', '0px');
    }, { passive: true });
  });
}

setupShop(MOUBON_CONFIG);
$('#year').textContent = String(new Date().getFullYear());
scheduleRender();

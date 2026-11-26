/** Pinned, camera-following Sundarbans river chapter (V13.3). */
import { buildRiverBand, buildRiverEdgePath, sampleRiverX } from './river-art.js';
import { RIVER_ROUTE, STORY_SCENES } from './story/scenes.js';
import { loadScenePoster, renderStoryScenes, setSceneProgress, setSceneVideoMode } from './story/scene-renderer.js';
import { getDeviceProfile } from './utils/device.js';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (a, b, value) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const { lowPower, saveData } = getDeviceProfile();

/** Calculate the opposite-sign route tangent and limit the boat's lean. */
export function getBoatRouteRotation(beforeX, afterX, viewportWidth, deltaY) {
  const dx = (afterX - beforeX) * viewportWidth;
  return clamp(-Math.atan2(dx, Math.max(1, deltaY)) * (180 / Math.PI), -24, 24);
}

/** Low-pass the tangent so the boat eases naturally through river bends. */
export function smoothBoatRotation(current, target, factor = 0.22) {
  return current + (target - current) * clamp(factor);
}

/** Keep the main story films available on modest hardware; only explicit motion/data-saving preferences use posters. */
export function shouldPlayStoryVideo({ reduced = false, saveData = false, labMode = false } = {}) {
  return !reduced && !saveData && !labMode;
}

/** Monotonic, reversible easing with a slow-down plateau at each configured story stop. */
export function easeAtStoryStops(progress) {
  const p = clamp(progress);
  const stops = [0, ...STORY_SCENES.map(scene => scene.at), 1];
  for (let index = 0; index < stops.length - 1; index += 1) {
    const start = stops[index];
    const end = stops[index + 1];
    if (p <= end || index === stops.length - 2) {
      const local = clamp((p - start) / Math.max(0.0001, end - start));
      const eased = local * local * (3 - 2 * local);
      return start + (end - start) * eased;
    }
  }
  return 1;
}

export function createRiverArtwork(worldHeight, viewportWidth, stageHeight, scrollDistance, anchorOverride = null) {
  const viewWidth = 1200;
  const scale = viewWidth / Math.max(320, viewportWidth);
  const mobile = viewportWidth <= 680;
  const anchorY = anchorOverride ?? stageHeight * (mobile ? RIVER_ROUTE.mobileViewportAnchor : RIVER_ROUTE.viewportAnchor);
  // Extend the painted channel beyond the first/last camera stop. Route progress
  // remains exactly aligned with the boat at y=anchorY + p*scrollDistance.
  const edgeMargin = Math.min(stageHeight * .32, anchorY * .8, (worldHeight - anchorY - scrollDistance) * .9);
  const startY = anchorY - edgeMargin;
  const endY = anchorY + scrollDistance + edgeMargin;
  const start = startY / worldHeight;
  const end = endY / worldHeight;
  const routeStart = -edgeMargin / scrollDistance;
  const routeEnd = 1 + edgeMargin / scrollDistance;

  // Keep the channel slightly narrower while preserving a soft tidal-mud shoulder.
  const waterHalfWidth = (mobile ? viewportWidth * RIVER_ROUTE.mobileWaterHalfWidth : viewportWidth <= 900 ? viewportWidth * RIVER_ROUTE.tabletWaterHalfWidth : viewportWidth * RIVER_ROUTE.desktopWaterHalfWidth) * scale * 0.86;
  const mudHalfWidth = waterHalfWidth + viewportWidth * (mobile ? .0035 : .003) * scale;
  const outerHalfWidth = waterHalfWidth + viewportWidth * (mobile ? .010 : .009) * scale;
  const waterVariation = viewportWidth * .014 * scale;
  const mudVariation = viewportWidth * .018 * scale;
  const outerVariation = viewportWidth * .024 * scale;

  const outerBank = buildRiverBand(worldHeight, start, end, outerHalfWidth, outerVariation, .35, viewWidth, routeStart, routeEnd);
  const innerMud = buildRiverBand(worldHeight, start, end, mudHalfWidth, mudVariation, 1.65, viewWidth, routeStart, routeEnd);
  const water = buildRiverBand(worldHeight, start, end, waterHalfWidth, waterVariation, 2.75, viewWidth, routeStart, routeEnd);
  const foamLeft = buildRiverEdgePath(worldHeight, start, end, waterHalfWidth * .99, -1, waterVariation * .72, .8, viewWidth, routeStart, routeEnd);
  const foamRight = buildRiverEdgePath(worldHeight, start, end, waterHalfWidth * .99, 1, waterVariation * .72, 2.2, viewWidth, routeStart, routeEnd);
  // Short cross-channel glints read as reflected sky, not painted lane markings.
  const glints = [];
  for (let index = 0; index < 32; index += 1) {
    const progress = .018 + (index / 31) * .964;
    const centerX = sampleRiverX(progress) * viewWidth;
    const offset = Math.sin(index * 2.417 + .7) * waterHalfWidth * .66;
    const length = 10 + ((index * 17) % 31);
    const center = clamp(centerX + offset,
      centerX - waterHalfWidth * .78 + length / 2,
      centerX + waterHalfWidth * .78 - length / 2);
    const y = anchorY + progress * scrollDistance + Math.sin(index * 3.11) * 8;
    const bend = Math.sin(index * 1.83) * 2.2;
    glints.push(`M ${(center - length / 2).toFixed(1)} ${y.toFixed(1)} Q ${center.toFixed(1)} ${(y + bend).toFixed(1)} ${(center + length / 2).toFixed(1)} ${(y + Math.cos(index * 1.37) * 1.4).toFixed(1)}`);
  }

  // Sparse, uneven pneumatophore roots on both wet banks; all geometry follows the route.
  const roots = [];
  for (let index = 0; index < 88; index += 1) {
    const progress = .018 + (index / 87) * .964;
    const centerX = sampleRiverX(progress) * viewWidth;
    const y = anchorY + progress * scrollDistance;
    const wave = Math.sin(progress * Math.PI * 8.4 + index * .31);
    const half = waterHalfWidth + viewportWidth * (.045 + .008 * wave) * scale;
    const side = index % 2 ? 1 : -1;
    const length = viewportWidth * (.012 + ((index * 7) % 9) * .0015) * scale;
    const x1 = centerX + side * half;
    const x2 = centerX + side * (half + length);
    const y2 = y + Math.sin(index * 1.7) * length * .34;
    roots.push(`M ${x1.toFixed(1)} ${y.toFixed(1)} Q ${(x1 + x2) / 2} ${(y - length * .18).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }

  return `<svg class="river-path-art" viewBox="0 0 ${viewWidth} ${worldHeight}" data-water-half-width="${waterHalfWidth.toFixed(2)}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="river-bank-earth" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#26382b"/><stop offset=".5" stop-color="#414a38"/><stop offset="1" stop-color="#26382b"/>
      </linearGradient>
      <linearGradient id="river-wet-mud" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#4a4b3a"/><stop offset=".5" stop-color="#6e6249"/><stop offset="1" stop-color="#4a4b3a"/>
      </linearGradient>
      <linearGradient id="river-water-base" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#2b3a32"/>
        <stop offset=".10" stop-color="#3c4d42"/>
        <stop offset=".28" stop-color="#536456"/>
        <stop offset=".50" stop-color="#687568"/>
        <stop offset=".72" stop-color="#536456"/>
        <stop offset=".90" stop-color="#3c4d42"/>
        <stop offset="1" stop-color="#2b3a32"/>
      </linearGradient>
      <linearGradient id="river-water-sheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#17271f" stop-opacity=".26"/>
        <stop offset=".18" stop-color="#b2b6a0" stop-opacity=".045"/>
        <stop offset=".50" stop-color="#d1c8a6" stop-opacity=".095"/>
        <stop offset=".82" stop-color="#b2b6a0" stop-opacity=".045"/>
        <stop offset="1" stop-color="#17271f" stop-opacity=".26"/>
      </linearGradient>
      <linearGradient id="river-sky-tint" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a88b62" stop-opacity=".12"/>
        <stop offset=".38" stop-color="#b7b9a1" stop-opacity=".055"/>
        <stop offset=".72" stop-color="#b2a783" stop-opacity=".065"/>
        <stop offset="1" stop-color="#907b57" stop-opacity=".13"/>
      </linearGradient>
      <pattern id="riverWaterPattern" width="560" height="560" patternUnits="userSpaceOnUse">
        <image data-src="/assets/water-seamless.webp" width="560" height="560" preserveAspectRatio="xMidYMid slice"/>
      </pattern>
      <pattern id="riverTreeReflections" width="420" height="560" patternUnits="userSpaceOnUse">
        <path d="M42 -18 C55 64 34 128 48 214 S60 390 44 578 M188 -22 C174 58 198 136 184 228 S176 394 198 578 M346 -20 C360 64 336 136 352 224 S368 402 342 578" fill="none" stroke="#294332" stroke-width="11" stroke-linecap="round" opacity=".22"/>
        <path d="M112 -16 C124 70 108 142 120 232 S128 396 116 578 M274 -18 C262 70 286 146 272 236 S266 400 284 578" fill="none" stroke="#3c5641" stroke-width="4" stroke-linecap="round" opacity=".14"/>
      </pattern>
    </defs>
    <path class="river-bank-shadow" d="${outerBank}"/>
    <path class="river-bank-earth" d="${outerBank}" fill="url(#river-bank-earth)"/>
    <path class="river-wet-mud" d="${innerMud}" fill="url(#river-wet-mud)"/>
    <path class="river-water river-water-base river-channel-water" d="${water}" fill="url(#river-water-base)" fill-rule="nonzero"/>
    <path class="river-tree-reflections" d="${water}" fill="url(#riverTreeReflections)"/>
    <path class="river-water-texture" d="${water}" fill="url(#riverWaterPattern)"/>
    <path class="river-water-sheen" d="${water}" fill="url(#river-water-sheen)"/>
    <path class="river-sky-reflection" d="${water}" fill="url(#river-sky-tint)"/>
    <path class="river-roots" d="${roots.join(' ')}"/>
    <path class="river-foam" d="${foamLeft}"/><path class="river-foam" d="${foamRight}"/>
    <path class="river-sun-glint" d="${glints.join(' ')}"/>
  </svg>`;
}

export function getBankWorldAsset(side, viewportWidth) {
  if (side !== 'left' && side !== 'right') throw new TypeError(`Unknown river bank side: ${side}`);
  const width = Number(viewportWidth);
  const variant = width <= 680 ? '-mobile' : width <= 900 ? '-tablet' : '';
  return `/assets/bank-${side}-world${variant}.webp`;
}

function renderRiverEnvironment(container, viewportWidth) {
  // One carefully scaled bank strip per side. The former duplicated near/far
  // panels stacked the same painting four times and swallowed the channel.
  // Pass the measured width explicitly: this helper lives outside the river
  // controller and must not read a private controller binding.
  const strips = [];
  for (const side of ['left', 'right']) {
    const strip = document.createElement('div');
    strip.className = `river-bank-strip ${side}`;
    strip.dataset.bg = getBankWorldAsset(side, viewportWidth);
    strip.setAttribute('aria-hidden', 'true');
    container.append(strip);
    strips.push(strip);
  }
  return strips;
}

function renderRiverAmbient(container) {
  const specks = lowPower ? '' : Array.from({ length: 6 }, (_, index) => {
    const positions = [[7, 22], [14, 61], [22, 38], [78, 27], [88, 55], [94, 76]];
    const [x, y] = positions[index];
    return `<i class="river-firefly" style="--speck-x:${x}%;--speck-y:${y}%;--speck-delay:${-index * 1.1}s"></i>`;
  }).join('');
  const birds = lowPower ? '' : `
    <svg class="river-bird bird-one" viewBox="0 0 72 24" aria-hidden="true"><path d="M3 15 Q15 2 27 13 Q39 1 51 12 Q60 18 69 13" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>`;
  container.innerHTML = `
    <span class="river-mist" aria-hidden="true"></span>
    <span class="river-light-shaft shaft-one" aria-hidden="true"></span>
    <span class="river-light-shaft shaft-two" aria-hidden="true"></span>
    <div class="river-specks" aria-hidden="true">${specks}</div>
    ${birds}`;
}

function renderStopMarkers(container, worldHeight, anchorY, scrollDistance) {
  container.innerHTML = STORY_SCENES.map((scene, index) => {
    const y = anchorY + scene.at * scrollDistance;
    return `<span class="river-stop-marker" data-stop-index="${index}" style="left:${(sampleRiverX(scene.at) * 100).toFixed(3)}%;top:${y.toFixed(1)}px" aria-hidden="true"><i></i></span>`;
  }).join('');
}

export function nearestSceneIndex(progress) {
  let nearest = 0;
  let distance = Infinity;
  STORY_SCENES.forEach((scene, index) => {
    const nextDistance = Math.abs(progress - scene.at);
    if (nextDistance < distance) { nearest = index; distance = nextDistance; }
  });
  return nearest;
}

/** One story painting is visible at a time; the active stop gets a soft arrival/exit fade. */
export function sceneOpacityForProgress(progress, sceneIndex) {
  const activeIndex = nearestSceneIndex(clamp(progress));
  if (sceneIndex !== activeIndex) return 0;
  const distance = Math.abs(clamp(progress) - STORY_SCENES[activeIndex].at);
  return clamp(1 - distance / RIVER_ROUTE.sceneFadeSpan);
}

/** Create the river controller; main.js owns the single scroll/rAF loop. */
export function setupRiverStory({
  chapter, track, stage, world, artHolder, environmentHolder, ambientHolder,
  boat, sceneContainer, markersContainer, sceneProgress, sceneNumber, sceneTrackFill,
  reducedMotion, onSceneChange = () => {}, onRenderNeeded = () => {}
}) {
  const moments = renderStoryScenes(sceneContainer);
  const initialWorldWidth = stage.clientWidth || window.innerWidth || 1200;
  const strips = renderRiverEnvironment(environmentHolder, initialWorldWidth);
  renderRiverAmbient(ambientHolder);

  let worldHeight = 0;
  let worldWidth = initialWorldWidth;
  let stageHeight = stage.clientHeight || window.innerHeight || 800;
  let scrollDistance = 0;
  let anchorY = stageHeight * RIVER_ROUTE.viewportAnchor;
  let markers = [];
  let lastActiveIndex = -1;
  let lastMotionMode = null;
  let lastProgress = 0;
  let smoothedRotation = null;
  let reduced = Boolean(reducedMotion?.matches);
  let labProgress = null;
  let waterTextureLoaded = false;
  let boatLoaded = false;
  let reedsLoaded = false;
  let bankTexturesLoaded = false;
  let bankObserver = null;
  let chapterObserver = null;
  let chapterInRange = true;
  let chapterVisible = true;

  boat.style.setProperty('--boat-base-rotation', `${RIVER_ROUTE.boatBaseRotation}deg`);

  function loadBoatImage() {
    if (boatLoaded) return;
    const image = boat.querySelector('.boat-art[data-src]');
    if (image) {
      image.srcset = image.dataset.srcset || '';
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
      image.removeAttribute('data-srcset');
    }
    boatLoaded = true;
  }

  function loadReedsImage() {
    if (reedsLoaded) return;
    const image = stage.querySelector('.river-reeds-foreground img[data-src]');
    if (image) {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    }
    reedsLoaded = true;
  }

  function loadWaterTexture() {
    if (waterTextureLoaded) return;
    const image = artHolder.querySelector('#riverWaterPattern image[data-src]');
    if (image) {
      image.setAttribute('href', image.dataset.src);
      image.removeAttribute('data-src');
    }
    waterTextureLoaded = true;
  }

  function loadBankTextures() {
    if (bankTexturesLoaded) return;
    strips.forEach(strip => {
      strip.style.backgroundImage = `url("${strip.dataset.bg}")`;
      strip.classList.add('is-loaded');
    });
    bankTexturesLoaded = true;
    bankObserver?.disconnect();
  }

  if ('IntersectionObserver' in window) {
    chapterObserver = new IntersectionObserver(entries => {
      chapterInRange = entries.some(entry => entry.isIntersecting);
      if (chapterInRange) onRenderNeeded();
    }, { rootMargin: '100px 0px' });
    chapterObserver.observe(track);
    bankObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadBankTextures();
    }, { rootMargin: '800px 0px' });
    bankObserver.observe(stage);
  } else loadBankTextures();

  function measure(nextTrackHeight = track.offsetHeight, nextWidth = stage.clientWidth || window.innerWidth, nextStageHeight = stage.clientHeight || window.innerHeight) {
    const measuredTrackHeight = Math.max(1, Math.round(nextTrackHeight));
    const measuredWidth = Math.max(320, Math.round(nextWidth));
    const measuredStageHeight = Math.max(1, Math.round(nextStageHeight));
    const staticMode = reduced && labProgress === null;
    const labMode = labProgress !== null;
    const nextScrollDistance = staticMode ? 300 : labMode ? measuredStageHeight * 7.6 : Math.max(1, measuredTrackHeight - measuredStageHeight);
    const nextWorldHeight = staticMode ? 760 : nextScrollDistance + measuredStageHeight;
    if (Math.abs(nextWorldHeight - worldHeight) < 2 && Math.abs(measuredWidth - worldWidth) < 2 && Math.abs(measuredStageHeight - stageHeight) < 2 && artHolder.querySelector('svg')) return;

    worldWidth = measuredWidth;
    stageHeight = measuredStageHeight;
    scrollDistance = nextScrollDistance;
    worldHeight = nextWorldHeight;
    anchorY = staticMode ? 300 : stageHeight * (worldWidth <= 680 ? RIVER_ROUTE.mobileViewportAnchor : RIVER_ROUTE.viewportAnchor);

    world.style.height = `${worldHeight}px`;
    boat.style.left = '50%';
    boat.style.top = `${anchorY}px`;
    environmentHolder.style.height = `${worldHeight}px`;
    strips.forEach(strip => {
      const side = strip.classList.contains('left') ? 'left' : 'right';
      strip.dataset.bg = getBankWorldAsset(side, measuredWidth);
      if (bankTexturesLoaded) strip.style.backgroundImage = `url("${strip.dataset.bg}")`;
      strip.style.height = `${worldHeight}px`;
    });
    artHolder.innerHTML = createRiverArtwork(worldHeight, worldWidth, stageHeight, scrollDistance, anchorY);
    renderStopMarkers(markersContainer, worldHeight, anchorY, scrollDistance);
    markers = [...markersContainer.querySelectorAll('.river-stop-marker')];
    waterTextureLoaded = false;
  }

  function setActiveScene(index, { motion = false } = {}) {
    if (index === lastActiveIndex && motion === lastMotionMode) return;
    if (index !== lastActiveIndex) onSceneChange(index >= 0 ? STORY_SCENES[index].id : null);
    if (index !== lastActiveIndex && lastActiveIndex >= 0) {
      moments[lastActiveIndex]?.classList.remove('is-active');
      // Pause and unload the previous film before loading the next one.
      loadScenePoster(moments[lastActiveIndex]);
    }
    if (index >= 0) {
      moments[index]?.classList.add('is-active');
      setSceneVideoMode(moments[index], { motion });
      sceneContainer.dataset.activeScene = STORY_SCENES[index].id;
    } else {
      delete sceneContainer.dataset.activeScene;
    }
    markers.forEach((marker, markerIndex) => marker.classList.toggle('is-lit', index >= 0 && markerIndex === index));
    lastActiveIndex = index;
    lastMotionMode = motion;
  }

  function renderRiver(viewportHeight, scrollY, scrollSpeed = 0, riverTop = 0, riverTrackHeight = track.offsetHeight) {
    const trackHeight = Math.max(1, riverTrackHeight);
    const topInViewport = riverTop - scrollY;
    const bottomInViewport = topInViewport + trackHeight;
    chapterVisible = topInViewport < viewportHeight && bottomInViewport > 0;
    sceneProgress.classList.toggle('visible', chapterVisible && !reduced && viewportHeight > 560);
    if ((!chapterInRange || !chapterVisible) && labProgress === null) {
      setActiveScene(-1, { motion: false });
      sceneProgress.classList.remove('visible');
      world.style.willChange = 'auto';
      boat.style.willChange = 'auto';
      return false;
    }

    loadBankTextures();
    loadWaterTexture();
    loadBoatImage();
    loadReedsImage();

    if (reduced && labProgress === null) {
      setActiveScene(-1, { motion: false });
      moments.forEach(moment => {
        loadScenePoster(moment);
        moment.classList.add('is-visible');
        moment.style.setProperty('--scene-opacity', '1');
      });
      boat.classList.add('motion-still');
      boat.style.transform = 'translate3d(-50%,-50%,0)';
      boat.style.opacity = '1';
      world.style.transform = 'none';
      strips.forEach(strip => { strip.style.transform = 'none'; strip.style.willChange = 'auto'; });
      world.style.willChange = 'auto';
      return chapterVisible;
    }

    const maxTravel = Math.max(1, trackHeight - viewportHeight);
    const rawProgress = labProgress === null ? clamp((scrollY - riverTop) / maxTravel) : labProgress;
    const progress = clamp(rawProgress);
    const easedProgress = reduced ? progress : easeAtStoryStops(progress);
    stage.style.setProperty('--chapter-fade', clamp((progress - .86) / .14).toFixed(3));
    const x = sampleRiverX(easedProgress);
    const sample = RIVER_ROUTE.boatRotationSample;
    const before = sampleRiverX(clamp(easedProgress - sample));
    const after = sampleRiverX(clamp(easedProgress + sample));
    const targetRotation = getBoatRouteRotation(before, after, worldWidth, sample * 2 * scrollDistance);
    smoothedRotation = smoothedRotation === null ? targetRotation : smoothBoatRotation(smoothedRotation, targetRotation);

    world.style.willChange = reduced ? 'auto' : 'transform';
    world.style.transform = reduced ? 'none' : `translate3d(0,${(-easedProgress * scrollDistance).toFixed(1)}px,0)`;
    strips.forEach(strip => {
      strip.style.setProperty('--strip-y', `${(-easedProgress * scrollDistance * .78).toFixed(1)}px`);
    });

    boat.classList.remove('motion-still');
    boat.style.willChange = reduced ? 'auto' : 'transform';
    boat.style.transform = `translate3d(-50%,-50%,0) translate3d(${((x - .5) * worldWidth).toFixed(1)}px,0,0) rotate(${(reduced ? 0 : smoothedRotation).toFixed(2)}deg)`;

    const speed = clamp(scrollSpeed);
    boat.style.setProperty('--paddle-amplitude', `${(0.65 + speed * 0.85).toFixed(2)}deg`);
    world.style.setProperty('--river-progress', progress.toFixed(4));
    world.style.setProperty('--scroll-speed', speed.toFixed(3));
    world.style.setProperty('--wake-opacity', (reduced ? 0 : .48 + speed * .25).toFixed(2));
    world.style.setProperty('--current-opacity', (reduced ? .12 : .18 + speed * .12).toFixed(2));

    const texture = artHolder.querySelector('#riverWaterPattern');
    if (texture && !lowPower && !reduced) {
      const textureX = (progress * 110 + speed * 7).toFixed(1);
      const textureY = (progress * 230 + speed * 11).toFixed(1);
      texture.setAttribute('patternTransform', `translate(${textureX} ${textureY})`);
    }

    const activeIndex = nearestSceneIndex(progress);
    const focusedIndex = sceneOpacityForProgress(progress, activeIndex) > .015 ? activeIndex : -1;
    const allowVideo = shouldPlayStoryVideo({ reduced, saveData, labMode: labProgress !== null });
    setActiveScene(focusedIndex, { motion: allowVideo });

    const activePercent = Math.round(progress * 100);
    sceneProgress.setAttribute('aria-valuenow', String(activePercent));
    sceneNumber.textContent = STORY_SCENES[activeIndex].number;
    sceneTrackFill.style.transform = `scaleX(${(activePercent / 100).toFixed(3)})`;

    for (let index = 0; index < moments.length; index += 1) {
      const scene = STORY_SCENES[index];
      const opacity = sceneOpacityForProgress(progress, index);
      if (opacity > .015) {
        moments[index].classList.add('is-visible');
        const cameraProgress = clamp((progress - (scene.at - RIVER_ROUTE.sceneFadeSpan / 2)) / RIVER_ROUTE.sceneFadeSpan);
        setSceneProgress(moments[index], scene, cameraProgress, opacity, reduced);
      } else {
        moments[index].style.setProperty('--scene-opacity', '0');
      }
    }

    const title = stage.querySelector('.river-title');
    if (title) title.style.opacity = String(1 - smoothstep(.015, .09, progress));
    const end = stage.querySelector('.river-end');
    if (end) end.style.opacity = String(smoothstep(.88, .985, progress));
    const reeds = stage.querySelector('.river-reeds-foreground');
    if (reeds) reeds.style.transform = `translate3d(-50%,${(-progress * stageHeight * .22 * 1.3).toFixed(1)}px,0)`;
    lastProgress = progress;
    return true;
  }

  function setReducedMotion(enabled) {
    reduced = Boolean(enabled) && labProgress === null;
    chapter.classList.toggle('motion-reduced', reduced);
    if (reduced) {
      loadBankTextures();
      loadWaterTexture();
      setActiveScene(-1, { motion: false });
      moments.forEach(moment => loadScenePoster(moment));
      loadBoatImage();
      loadReedsImage();
      boat.classList.add('motion-still');
      const title = stage.querySelector('.river-title');
      if (title) title.style.opacity = '1';
    } else {
      boat.classList.remove('motion-still');
    }
    onRenderNeeded();
  }

  function setLabProgress(value) {
    labProgress = clamp(Number(value) || 0);
    reduced = false;
    chapter.classList.remove('motion-reduced');
    chapter.classList.add('river-lab-mode');
    loadBankTextures();
    loadWaterTexture();
    onRenderNeeded();
  }

  if (reduced) setReducedMotion(true);
  return {
    render: renderRiver,
    measure,
    setReducedMotion,
    setLabProgress,
    disconnect: () => { bankObserver?.disconnect(); chapterObserver?.disconnect(); },
    get lastProgress() { return lastProgress; }
  };
}

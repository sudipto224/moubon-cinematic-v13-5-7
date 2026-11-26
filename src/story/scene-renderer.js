/**
 * Render the six owner-supplied cinematic story videos.
 * Only the focused scene receives a video source; other scenes retain a poster frame.
 */
import { STORY_SCENES } from './scenes.js';

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

let activeVideo = null;

function stopVideoElement(video) {
  if (!video) return;
  video.pause();
  if (video.hasAttribute('src')) {
    video.removeAttribute('src');
    video.load();
  }
  video.dataset.loadedMode = 'poster';
  video.classList.remove('video-play-blocked');
  if (activeVideo === video) activeVideo = null;
}

export function loadScenePoster(moment) {
  const video = moment?.querySelector('.scene-film');
  if (!video) return;
  stopVideoElement(video);
  if (video.dataset.posterSrc && video.dataset.posterLoaded !== 'true') {
    video.poster = video.dataset.posterSrc;
    video.dataset.posterLoaded = 'true';
  }
}

/** Load and play one active scene video; lab, low-power and reduced-motion use its poster. */
export function setSceneVideoMode(moment, { motion = false } = {}) {
  const video = moment?.querySelector('.scene-film');
  if (!video) return;

  if (video.dataset.posterSrc && video.dataset.posterLoaded !== 'true') {
    video.poster = video.dataset.posterSrc;
    video.dataset.posterLoaded = 'true';
  }

  const labMode = typeof document !== 'undefined'
    && document.documentElement.classList.contains('river-lab-mode');
  const shouldPlay = motion && !labMode;
  if (!shouldPlay) {
    stopVideoElement(video);
    return;
  }

  if (activeVideo && activeVideo !== video) stopVideoElement(activeVideo);
  if (video.dataset.loadedMode !== 'video') {
    video.src = video.dataset.videoSrc;
    video.dataset.loadedMode = 'video';
    video.load();
  }
  activeVideo = video;
  if (typeof document !== 'undefined' && document.hidden) {
    video.pause();
    return;
  }
  if (video.paused) {
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(() => video.classList.add('video-play-blocked'));
    }
  }
}

/** Build scene cards; video is 16:9 and its caption remains outside the film frame. */
export function renderStoryScenes(container) {
  container.innerHTML = STORY_SCENES.map(scene => `
    <article class="story-vignette ${scene.side}" data-scene-id="${escapeHTML(scene.id)}" data-scene-motion="${escapeHTML(scene.motion)}" aria-label="গল্প ${scene.number}: ${escapeHTML(scene.title)}">
      <figure class="scene-art">
        <video class="scene-painting scene-film" data-video-src="${escapeHTML(scene.video)}" data-poster-src="${escapeHTML(scene.poster)}" muted loop playsinline preload="none" disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback" role="img" aria-label="${escapeHTML(scene.alt)}" width="1280" height="720"></video>
        <span class="scene-art-edge" aria-hidden="true"></span>
      </figure>
      <div class="scene-copy">
        ${scene.showPhase === false ? '' : `<span class="scene-phase">${escapeHTML(scene.phase)}</span>`}
        <span class="scene-number" aria-hidden="true">${scene.number}</span>
        <div class="scene-copy-content">
          <span class="scene-label">${escapeHTML(scene.label)}</span>
          <h2 class="scene-title">${escapeHTML(scene.title)}</h2>
          <p class="scene-description">${scene.copyLines.map(line => `<span class="scene-copy-line">${escapeHTML(line)}</span>`).join('')}</p>
        </div>
      </div>
    </article>`).join('');
  return [...container.querySelectorAll('.story-vignette')];
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!activeVideo || activeVideo.dataset.loadedMode !== 'video') return;
    if (document.hidden) {
      activeVideo.pause();
    } else {
      const playRequest = activeVideo.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(() => activeVideo?.classList.add('video-play-blocked'));
      }
    }
  });
  window.addEventListener('pagehide', () => activeVideo?.pause(), { passive: true });
}

/** Scroll-driven fade/arrival; the video itself carries the real character and environment motion. */
export function setSceneProgress(moment, scene, progress, opacity, reducedMotion = false) {
  const p = Math.max(0, Math.min(1, progress));
  const eased = p * p * (3 - 2 * p);
  const scale = .985 + .015 * eased;
  moment.style.setProperty('--scene-opacity', reducedMotion ? '1' : opacity.toFixed(3));
  moment.style.setProperty('--scene-scale', reducedMotion ? '1' : scale.toFixed(4));
  moment.style.setProperty('--scene-shift', reducedMotion ? '0px' : `${((1 - opacity) * 9).toFixed(1)}px`);
  moment.dataset.sceneProgress = p.toFixed(3);
}

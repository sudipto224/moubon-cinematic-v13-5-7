/** Play the tiger ambience automatically when story scene 02 becomes active.
 * Browsers may block audible autoplay until the visitor has interacted with the page;
 * if blocked, the sound starts on the next tap/click or keyboard interaction while scene 02 is active.
 */
export function setupStoryAudio() {
  if (typeof Audio === 'undefined') return { onSceneChange: () => {}, destroy: () => {} };

  const tiger = new Audio('/assets/tiger-growl-demo.wav');
  tiger.preload = 'auto';
  tiger.volume = 0.72;

  let activeScene = null;
  let waitingForGesture = false;
  let destroyed = false;

  async function tryPlayTiger() {
    if (destroyed || activeScene !== 'tiger' || !tiger.paused) return;
    try {
      tiger.currentTime = 0;
      await tiger.play();
      waitingForGesture = false;
    } catch {
      waitingForGesture = true;
    }
  }

  function resumeAfterGesture() {
    if (waitingForGesture && activeScene === 'tiger') void tryPlayTiger();
  }

  function onVisibilityChange() {
    if (document.hidden) {
      if (!tiger.paused) tiger.pause();
      if (activeScene === 'tiger') waitingForGesture = true;
    } else if (activeScene === 'tiger' && waitingForGesture) {
      void tryPlayTiger();
    }
  }

  document.addEventListener('pointerdown', resumeAfterGesture, { capture: true, passive: true });
  document.addEventListener('keydown', resumeAfterGesture, { capture: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  function onSceneChange(sceneId) {
    if (sceneId === activeScene) return;
    activeScene = sceneId;

    if (sceneId === 'tiger') {
      tiger.pause();
      tiger.currentTime = 0;
      waitingForGesture = true;
      void tryPlayTiger();
      return;
    }

    waitingForGesture = false;
    tiger.pause();
    tiger.currentTime = 0;
  }

  function destroy() {
    destroyed = true;
    activeScene = null;
    waitingForGesture = false;
    tiger.pause();
    tiger.removeAttribute('src');
    tiger.load();
    document.removeEventListener('pointerdown', resumeAfterGesture, true);
    document.removeEventListener('keydown', resumeAfterGesture, true);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  return { onSceneChange, destroy };
}

# V13.5.1 — Hybrid Cinematic River Story

## Composition and channel width

The River Story keeps the existing native-scroll journey, normalized centreline and single camera-anchored boat. The creek has been reduced again so it reads as a narrow tidal channel rather than a wide road or ribbon.

| Viewport | Water channel width before mud shoulders |
|---|---:|
| Desktop (>900px) | 28% |
| Tablet (681–900px) | 32% |
| Mobile (≤680px) | 40% |

The water uses a deep green-teal base, dark bank-side falloff, a softly brighter centre, the seamless water texture, blurred mangrove reflections, short cross-channel sun glints and irregular wet-mud edges. The boat has been reduced to remain proportionate to the narrower channel.

## Story placement

- Desktop: scenes alternate left/right beside the creek. Captions sit below the 16:9 video frame.
- Tablet: scenes keep alternating left/right in a compact upper bank lane; the boat remains in the lower route lane.
- Mobile: scenes use a compact upper story shelf because there is not enough horizontal room for side-by-side story and river lanes. The boat remains below the story shelf.
- The six original Bengali titles, phases and descriptions remain unchanged.

## Five-second MP4 story films

The six supplied clips replace the former static story displays and generated four-second cinemagraph loops. They are 1280×720, 24 fps, H.264 MP4, five seconds each, without audio.

Only the active scene receives a video source. The video is muted, inline, looped and lazy-loaded. When the visitor leaves a scene or the chapter, its video is paused and unloaded. Posters extracted from the same clips are used for reduced-motion, explicit Save-Data, autoplay-fallback and screenshot-lab states. Modest hardware still plays only the active clip. The artificial CSS overlays for bees, smoke, honey drops and glints are no longer layered over the clips.

## Responsive and accessibility behaviour

- Video frame ratio is 16:9.
- Video elements have accessible labels based on the existing Bengali story descriptions.
- Captions remain outside the film frame.
- Reduced-motion and explicit Save-Data paths show poster frames instead of playing video. Low-power hardware still plays one active clip at a time.
- Native scrolling, keyboard behaviour, focus handling, the progress rail and the single-boat route remain intact.

## QA

- `npm run river:verify-videos` checks the six MP4 files and six poster frames.
- `npm run river:verify-assets` checks bank composites, water texture, boat alpha and cut-out edges.
- `npm run river:shots` checks five viewports, nine progress stops, one active story, video poster visibility, no lab MP4 loading, channel-width limits, story safe zones, boat count/rotation, browser errors, overflow and near-flat areas.

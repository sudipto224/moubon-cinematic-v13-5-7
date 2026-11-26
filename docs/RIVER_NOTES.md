# River Chapter Architecture — V13.5.1

1. The chapter uses a long native-scroll track and a sticky stage; reversible progress moves the river world beneath one camera-anchored boat.
2. `src/river-art.js` supplies the normalized centreline and continuous water/mud geometry. `src/story/scenes.js` owns six video paths, poster paths, captions, alternating sides and scroll stops.
3. Water channel width before mud shoulders is 28% desktop, 32% tablet and 40% mobile. The SVG gradient and seamless water texture create a dark green-teal tidal surface with short cross-channel glints and mangrove reflections.
4. The water SVG uses local gradients/patterns defined inside the inline SVG. Stylesheets adjust opacity and stroke only; they do not replace the local paint-server fills.
5. The two banks use one non-repeating transparent world strip per side, with aspect-matched desktop/tablet/mobile variants. The river-facing, top and bottom edges are alpha-feathered.
6. The single boat follows the normalized route tangent with the negated sign, smoothing and ±24° clamp. Its width is reduced to fit the narrower water channel.
7. Six owner-supplied 5-second MP4s are the story media. Only the active scene receives a video source; the previous video is paused and unloaded. Each video uses `muted`, `loop`, `playsinline` and `preload=none`.
8. Poster frames are extracted from the same videos. Reduced-motion, explicit Save-Data, autoplay-fallback and screenshot-lab states use posters instead of MP4 playback. Modest hardware still plays one active MP4 at a time.
9. Desktop and tablet scenes alternate left/right. Mobile uses an upper story shelf. Captions stay below the video frame.
10. The old CSS overlays for bees, smoke, honey drops and shimmer are not used; the generated clips provide the scene motion.
11. `npm run river:verify-videos` checks the video/poster files. `npm run river:verify-assets` checks cut-outs, boat feathering, seamless water and responsive bank composites. `npm run river:shots` checks five viewport sizes and nine fixed progress stops.

# River Story — Owner Visual Review

## V13.3.4 opening screenshot review

The first V13.3.4 screenshot review correctly identified that the centered dark-green area behind the opening Bengali title should remain quiet. However, the later detector report flagged a different tile at sample grid 8,24. The owner then uploaded the exact `1920x1080/p-0.00.png` image, which resolved the ambiguity: grid 8,24 is below the title-safe area and is a genuine empty side region between the river inlet and the narrow forest strips. It must not be excluded as title-safe.

## Findings from the uploaded image

1. The inlet was too narrow and flared quickly, creating a funnel/road impression.
2. The viewport-edge forest panels did not reach the creek; large dark-green gaps remained on both sides.
3. The river-facing mud edge looked too geometric and the banks did not visually connect to the forest.
4. The central upper title-safe negative space itself is intentional and should remain uncluttered.

## V13.3.5 source corrections

- Widened the inlet taper minimum from 12% to 28% and extended the taper ramp to 16%.
- Expanded desktop bank artwork to 46vw (maximum 860px), with a dedicated tablet width and a mobile width.
- Built six aspect-matched bank composites: desktop 512×5535, tablet 256×7700 and mobile 160×7400; left/right variants use distinct crops and alternate starting artwork rather than reusing the same mirrored strip.
- Increased subtle side forest-depth gradients while leaving the central title-safe zone quiet.
- Added regression coverage for the responsive bank selection, image budgets and inlet taper.

## Verification status

V13.3.5 source checks, unit tests, production build and bank-asset verification passed in the build environment. Its 45-image Windows browser screenshot suite has **NOT MEASURED** yet. Run `npm run river:shots` locally and inspect `qa-screenshots/river/river-contact-sheet.html`; do not treat the source changes as visual approval until the new screenshots are reviewed.


## V13.5.1 — narrow creek and real video story integration

- Replaced the old static scene display and generated four-second WebP cinemagraphs with the six supplied five-second MP4 clips.
- The six clips are mapped in story order: footprints, tiger, discovery, smoke, harvest and golden gift. Poster frames are derived from the same videos.
- Reduced source-geometry water width to 28% desktop, 32% tablet and 40% mobile before mud shoulders; the boat is scaled down to fit.
- Desktop and tablet story videos alternate left/right. Mobile uses a compact upper story shelf. Captions remain outside the 16:9 film frame.
- Active-only loading and poster fallback are implemented; no additional CSS subject-motion overlays are layered over the videos.
- Source tests, production build, video file checks and river-bank asset checks pass.
- **NOT MEASURED:** browser screenshot appearance and normal MP4 playback in Chrome. Run `npm run river:shots` on Windows and inspect `qa-screenshots/river/river-contact-sheet.html` before treating the composition as visually approved.

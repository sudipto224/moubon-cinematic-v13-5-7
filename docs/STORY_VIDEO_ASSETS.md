# Moubon V13.5.1 — Six Integrated Story Films

The six owner-supplied Google Flow MP4 clips are now the primary River Story media. The previous static scene images and generated four-second animated-WebP loops are no longer used by the website.

## Scene order and files

| Scene | Story beat | Video file | Poster fallback |
|---|---|---|---|
| 01 | Tiger footprints | `scene-01-footprints.mp4` | `scene-01-footprints.webp` |
| 02 | Tiger in the mangroves | `scene-02-tiger.mp4` | `scene-02-tiger.webp` |
| 03 | Honeycomb discovery | `scene-03-discovery.mp4` | `scene-03-discovery.webp` |
| 04 | Smoke preparation | `scene-04-smoke.mp4` | `scene-04-smoke.webp` |
| 05 | Honey harvest | `scene-05-harvest.mp4` | `scene-05-harvest.webp` |
| 06 | Golden gift | `scene-06-golden-gift.mp4` | `scene-06-golden-gift.webp` |

## Clip properties measured from the supplied files

- Duration: 5 seconds each.
- Frame size: 1280×720 (16:9).
- Frame rate: 24 fps.
- Codec: H.264 / MP4.
- Audio: removed from the website copies; playback is muted.
- Optimized package copies are stored under `public/assets/story-video/`.
- Poster frames are extracted from the same MP4s at 0.35 seconds and stored under `public/assets/story-posters/`.

## Playback behaviour

- Only the focused scene receives an MP4 `src`.
- Video elements use `muted`, `loop`, `playsinline` and `preload="none"`.
- When the visitor moves to the next scene, the previous video is paused and its source is removed before the next clip is loaded.
- When the River Story leaves the viewport, the active video is paused and unloaded.
- Reduced-motion, explicit Save-Data and screenshot-lab modes use the matching poster frame instead of playing video. Low-power hardware still plays only the currently focused clip; decorative effects remain reduced.
- If autoplay is blocked, the poster remains visible.
- No additional scripted bee, smoke, honey-drop or light effects are layered over the generated films.

## Compression and verification

The six source clips were re-encoded to H.264, 1280×720, 24 fps, 5 seconds, no audio, with fast-start metadata. The compressed website copies total about 8.4 MB; individual files remain below 1.8 MB. Poster WebPs remain below 180 KB each.

Run:

```powershell
npm run river:verify-videos
npm run river:shots
```

The verifier checks MP4/WebP signatures, presence and size budgets. The screenshot lab checks that poster frames are displayed and that no MP4 source is loaded in lab mode.

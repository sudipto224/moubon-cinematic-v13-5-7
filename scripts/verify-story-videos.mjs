import { access, readFile, stat } from 'node:fs/promises';
import { STORY_SCENES } from '../src/story/scenes.js';

const root = new URL('../public/', import.meta.url);
const MAX_VIDEO_BYTES = 1_800_000;
const MAX_POSTER_BYTES = 180_000;

for (const scene of STORY_SCENES) {
  const videoPath = new URL(scene.video.replace(/^\//, ''), root);
  const posterPath = new URL(scene.poster.replace(/^\//, ''), root);
  await access(videoPath);
  await access(posterPath);
  const [videoInfo, posterInfo, videoBytes, posterBytes] = await Promise.all([
    stat(videoPath), stat(posterPath), readFile(videoPath), readFile(posterPath)
  ]);
  const isMp4 = videoBytes.length > 12 && videoBytes.toString('ascii', 4, 8) === 'ftyp';
  const isWebp = posterBytes.toString('ascii', 0, 4) === 'RIFF'
    && posterBytes.toString('ascii', 8, 12) === 'WEBP';
  if (!isMp4) throw new Error(`FAIL ${scene.video}: MP4 ftyp signature missing`);
  if (!isWebp) throw new Error(`FAIL ${scene.poster}: WebP signature missing`);
  if (videoInfo.size > MAX_VIDEO_BYTES) throw new Error(`FAIL ${scene.video}: ${videoInfo.size} bytes exceeds ${MAX_VIDEO_BYTES}`);
  if (posterInfo.size > MAX_POSTER_BYTES) throw new Error(`FAIL ${scene.poster}: ${posterInfo.size} bytes exceeds ${MAX_POSTER_BYTES}`);
  console.log(`PASS Scene ${scene.number}: ${videoInfo.size.toLocaleString()} byte MP4 + ${posterInfo.size.toLocaleString()} byte poster`);
}
console.log('PASS: all six 5-second story video files and poster fallbacks are present and within package budgets.');

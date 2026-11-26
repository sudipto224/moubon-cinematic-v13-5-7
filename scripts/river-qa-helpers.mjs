/** QA-only visual exclusions for intentional composition, never for arbitrary blank areas. */
export function isIntentionalTitleSafeArea({ progress, imageWidth, imageHeight, tileX, tileY, tileSamples = 16, grid = 64 }) {
  // At the opening frame, the centered Bengali title deliberately sits in a quiet
  // forest-green canopy gap. Only desktop top-row tiles fully inside that safe
  // zone are exempt; all other positions and all mobile tiles remain inspected.
  if (Math.abs(Number(progress)) > 0.0001 || imageWidth < 1024 || tileY !== 0) return false;
  const left = tileX * imageWidth / grid;
  const right = (tileX + tileSamples) * imageWidth / grid;
  const bottom = tileSamples * imageHeight / grid;
  return left >= imageWidth * 0.12
    && right <= imageWidth * 0.88
    && bottom <= imageHeight * 0.26;
}

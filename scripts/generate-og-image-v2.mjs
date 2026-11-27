import fs from 'node:fs';
import { PNG } from 'pngjs';

const WIDTH = 1200;
const HEIGHT = 627;

// Brand colors
const DEEP_FOREST = [6, 28, 20];        // #061c14
const FOREST = [10, 55, 31];            // #0a371f
const FOREST_LIGHT = [18, 78, 44];      // #124e2c
const DARK_FOREST = [3, 15, 8];         // #030f08
const HONEY_GOLD = [232, 182, 72];      // #e8b648
const LIGHT_HONEY = [249, 223, 153];    // #f9df99
const HONEY_GOLD_DARK = [201, 153, 42]; // darker honey
const CREAM_WHITE = [255, 250, 240];    // off-white

const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const idx = (y * WIDTH + x) * 4;
  const alpha = a / 255;
  if (alpha >= 1) {
    pixels[idx] = r; pixels[idx + 1] = g; pixels[idx + 2] = b; pixels[idx + 3] = 255;
  } else if (alpha > 0) {
    const er = pixels[idx], eg = pixels[idx + 1], eb = pixels[idx + 2];
    pixels[idx] = Math.round(er * (1 - alpha) + r * alpha);
    pixels[idx + 1] = Math.round(eg * (1 - alpha) + g * alpha);
    pixels[idx + 2] = Math.round(eb * (1 - alpha) + b * alpha);
    pixels[idx + 3] = 255;
  }
}

// 1. Background: vertical forest gradient (deep at bottom, lighter at top)
for (let y = 0; y < HEIGHT; y++) {
  const t = y / HEIGHT;
  // Deep forest at bottom, transitioning to slightly lighter at top
  const r = Math.round(DEEP_FOREST[0] + (FOREST_LIGHT[0] - DEEP_FOREST[0]) * (1 - t) * 0.6);
  const g = Math.round(DEEP_FOREST[1] + (FOREST_LIGHT[1] - DEEP_FOREST[1]) * (1 - t) * 0.6);
  const b = Math.round(DEEP_FOREST[2] + (FOREST_LIGHT[2] - DEEP_FOREST[2]) * (1 - t) * 0.6);
  for (let x = 0; x < WIDTH; x++) {
    setPixel(x, y, r, g, b, 255);
  }
}

// 2. Subtle atmospheric glow at top center
for (let y = 0; y < HEIGHT * 0.5; y++) {
  const t = 1 - y / (HEIGHT * 0.5);
  const alpha = Math.round(15 * t * t);
  for (let x = WIDTH * 0.3; x < WIDTH * 0.7; x++) {
    const dx = x - WIDTH * 0.5;
    const dist = Math.abs(dx) / (WIDTH * 0.2);
    if (dist < 1) {
      const a = Math.round(alpha * (1 - dist));
      setPixel(x, y, FOREST_LIGHT[0], FOREST_LIGHT[1], FOREST_LIGHT[2], a);
    }
  }
}

// Helper: draw filled circle with alpha blending
function drawCircle(cx, cy, radius, color, alpha = 255) {
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    const dy2 = dy * dy;
    const dxMax = Math.floor(Math.sqrt(Math.max(0, r2 - dy2)));
    for (let dx = -dxMax; dx <= dxMax; dx++) {
      setPixel(Math.round(cx + dx), Math.round(cy + dy), color[0], color[1], color[2], alpha);
    }
  }
}

// Helper: draw radial gradient circle
function drawGlowCircle(cx, cy, radius, color, maxAlpha = 255) {
  for (let dy = -radius; dy <= radius; dy++) {
    const dy2 = dy * dy;
    const dxMax = Math.floor(Math.sqrt(Math.max(0, radius * radius - dy2)));
    for (let dx = -dxMax; dx <= dxMax; dx++) {
      const dist = Math.sqrt(dx * dx + dy2) / radius;
      const a = Math.round(maxAlpha * (1 - dist));
      if (a > 0) setPixel(Math.round(cx + dx), Math.round(cy + dy), color[0], color[1], color[2], a);
    }
  }
}

// 3. Large honey-gold sun/circle with glow on right side
const sunX = 940, sunY = 300, sunR = 150;
drawGlowCircle(sunX, sunY, sunR + 40, HONEY_GOLD, 60);   // outer glow
drawGlowCircle(sunX, sunY, sunR + 20, HONEY_GOLD, 120);  // mid glow
drawCircle(sunX, sunY, sunR, HONEY_GOLD, 255);           // main circle
// Inner lighter highlight
drawCircle(sunX - 20, sunY - 30, sunR * 0.5, LIGHT_HONEY, 180);
drawCircle(sunX + 10, sunY - 20, sunR * 0.35, LIGHT_HONEY, 140);

// 4. Smaller overlapping honey circle
drawCircle(1020, 240, 70, HONEY_GOLD, 255);
drawCircle(1020, 230, 35, LIGHT_HONEY, 160);

// 5. Honey drops falling from large circle
function drawDrop(cx, cy, radius, color, alpha = 255) {
  // Circle part
  drawCircle(cx, cy, radius, color, alpha);
  // Teardrop tail
  const tailH = radius * 1.3;
  for (let dy = 0; dy <= tailH; dy++) {
    const t = dy / tailH;
    const w = radius * (1 - t) * 0.6;
    const dxMax = Math.floor(w);
    const y = Math.round(cy + radius + dy);
    for (let dx = -dxMax; dx <= dxMax; dx++) {
      setPixel(Math.round(cx + dx), y, color[0], color[1], color[2], alpha);
    }
  }
}

drawDrop(sunX, sunY + sunR + 10, 50, HONEY_GOLD, 255);
drawDrop(sunX, sunY + sunR + 5, 25, LIGHT_HONEY, 200);
drawDrop(sunX - 40, sunY + 30, 22, HONEY_GOLD, 220);
drawDrop(sunX + 35, sunY + 50, 18, HONEY_GOLD, 200);

// 6. Honeycomb pattern (subtle overlay)
for (let gy = 60; gy < HEIGHT - 60; gy += 52) {
  const offsetX = Math.floor((gy / 52) % 2) * 35;
  for (let gx = 40 + offsetX; gx < WIDTH - 40; gx += 70) {
    // Skip if overlapping honey circles
    const d1 = Math.hypot(gx - sunX, gy - sunY);
    const d2 = Math.hypot(gx - 1020, gy - 240);
    if (d1 < 180 || d2 < 90) continue;
    // Draw small hexagon as circle
    drawCircle(gx, gy, 8, [255, 255, 255], 12);
  }
}

// 7. Forest silhouettes at bottom
const forestBottom = HEIGHT - 90;
function drawTree(cx, cy, width, height, color) {
  for (let dy = 0; dy <= height; dy++) {
    const t = dy / height;
    const w = width * (1 - t) * 0.85;
    const dxMax = Math.floor(w);
    const y = Math.round(cy - dy);
    for (let dx = -dxMax; dx <= dxMax; dx++) {
      const nx = Math.round(cx + dx);
      if (nx >= 0 && nx < WIDTH && y >= 0 && y < HEIGHT) {
        setPixel(nx, y, color[0], color[1], color[2], 255);
      }
    }
  }
  // Trunk
  const trunkW = Math.floor(width * 0.12);
  for (let dy = 0; dy <= height * 0.25; dy++) {
    for (let dx = -trunkW; dx <= trunkW; dx++) {
      const nx = Math.round(cx + dx);
      const ny = Math.round(cy - height + dy);
      if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
        setPixel(nx, ny, DARK_FOREST[0], DARK_FOREST[1], DARK_FOREST[2], 255);
      }
    }
  }
}

drawTree(100, forestBottom, 200, 160, DARK_FOREST);
drawTree(350, forestBottom, 260, 190, DARK_FOREST);
drawTree(620, forestBottom, 220, 170, DARK_FOREST);
drawTree(880, forestBottom, 240, 180, DARK_FOREST);
// Smaller trees between
drawTree(260, forestBottom + 15, 140, 120, DARK_FOREST);
drawTree(500, forestBottom + 10, 160, 130, DARK_FOREST);
drawTree(760, forestBottom + 20, 150, 125, DARK_FOREST);

// 8. Ground / river bank line
for (let x = 0; x < WIDTH; x++) {
  const h = Math.floor(60 + 20 * Math.sin(x * 0.01) + 10 * Math.sin(x * 0.03));
  for (let y = HEIGHT - h; y < HEIGHT; y++) {
    setPixel(x, y, DARK_FOREST[0], DARK_FOREST[1], DARK_FOREST[2], 255);
  }
}

// 9. Boat silhouette (traditional wooden boat)
function drawBoat(cx, cy, scale) {
  const s = scale || 1;
  // Hull - curved bottom
  for (let dy = 0; dy <= 60 * s; dy++) {
    const t = dy / (60 * s);
    const halfW = 90 * s * Math.sin(t * Math.PI);
    const dxMax = Math.floor(halfW);
    const y = Math.round(cy - dy);
    for (let dx = -dxMax; dx <= dxMax; dx++) {
      setPixel(Math.round(cx + dx), y, HONEY_GOLD_DARK[0], HONEY_GOLD_DARK[1], HONEY_GOLD_DARK[2], 255);
    }
  }
  // Boat deck line
  for (let dx = -70 * s; dx <= 70 * s; dx++) {
    setPixel(Math.round(cx + dx), Math.round(cy - 20 * s), HONEY_GOLD[0], HONEY_GOLD[1], HONEY_GOLD[2], 255);
  }
  // Mast
  for (let dy = 0; dy <= 100 * s; dy++) {
    setPixel(Math.round(cx), Math.round(cy - 120 * s + dy), HONEY_GOLD_DARK[0], HONEY_GOLD_DARK[1], HONEY_GOLD_DARK[2], 255);
  }
  // Sail (triangular)
  for (let dy = 0; dy <= 80 * s; dy++) {
    const t = dy / (80 * s);
    const w = 60 * s * (1 - t);
    const dxMax = Math.floor(w);
    const y = Math.round(cy - 120 * s + dy);
    for (let dx = 0; dx <= dxMax; dx++) {
      setPixel(Math.round(cx + dx), y, LIGHT_HONEY[0], LIGHT_HONEY[1], LIGHT_HONEY[2], 180);
    }
  }
}

drawBoat(WIDTH * 0.5, HEIGHT - 130, 1);

// 10. Brand text "MOUBON" in honey-gold (left-center)
// Simple pixel font - 5x7 grid per character, scaled up
const fontScale = 6;
const charWidth = 5 * fontScale;
const charHeight = 7 * fontScale;
const charSpacing = 2 * fontScale;

// 5x7 pixel font for MOUBON (1 = filled, 0 = empty)
const font5x7 = {
  M: [
    [1,0,0,0,1],
    [1,1,0,0,1],
    [1,0,1,0,1],
    [1,0,0,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ],
  O: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  U: [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  B: [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0]
  ],
  O2: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  N: [
    [1,0,0,0,1],
    [1,1,0,0,1],
    [1,0,1,0,1],
    [1,0,0,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ]
};

function drawText(text, startX, startY, color, scale) {
  let x = startX;
  for (const ch of text) {
    const glyph = font5x7[ch];
    if (glyph) {
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          if (glyph[row][col]) {
            for (let dy = 0; dy < scale; dy++) {
              for (let dx = 0; dx < scale; dx++) {
                setPixel(x + col * scale + dx, startY + row * scale + dy, color[0], color[1], color[2], 255);
              }
            }
          }
        }
      }
    }
    x += charWidth + charSpacing;
  }
  return x;
}

const textStartX = 90;
const textStartY = 200;
drawText('MOUBON', textStartX, textStartY, HONEY_GOLD, fontScale);

// Glow behind text
for (let dy = -fontScale * 2; dy < charHeight + fontScale * 2; dy++) {
  for (let dx = -fontScale * 2; dx < charWidth * 6 + charSpacing * 5 + fontScale * 2; dx++) {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < fontScale * 3) {
      const a = Math.round(40 * (1 - dist / (fontScale * 3)));
      if (a > 0) setPixel(textStartX + dx, textStartY + dy, HONEY_GOLD[0], HONEY_GOLD[1], HONEY_GOLD[2], a);
    }
  }
}

// Tagline text "SUNDARBANS" smaller
const smallFontScale = 3;
function drawSmallText(text, startX, startY, color, scale) {
  let x = startX;
  for (const ch of text) {
    const glyph = font5x7[ch];
    if (glyph) {
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          if (glyph[row][col]) {
            for (let dy = 0; dy < scale; dy++) {
              for (let dx = 0; dx < scale; dx++) {
                setPixel(x + col * scale + dx, startY + row * scale + dy, color[0], color[1], color[2], 255);
              }
            }
          }
        }
      }
    }
    x += charWidth * (scale / fontScale) + charSpacing * (scale / fontScale);
  }
  return x;
}

drawSmallText('SUNDARBANS', textStartX, textStartY + charHeight + 20, LIGHT_HONEY, smallFontScale);

// 11. Bee dots scattered around
function drawBee(cx, cy, size, color) {
  drawCircle(cx, cy, size, color, 220);
  drawCircle(cx + size * 0.6, cy - size * 0.4, size * 0.5, color, 180);
}

drawBee(150, 420, 10, HONEY_GOLD);
drawBee(280, 380, 8, HONEY_GOLD);
drawBee(1100, 400, 12, HONEY_GOLD);
drawBee(1050, 450, 9, HONEY_GOLD);
drawBee(900, 480, 7, HONEY_GOLD);

// 12. Subtle light rays from sun
for (let angle = 0; angle < Math.PI * 2; angle += 0.4) {
  const startR = sunR + 5;
  const endR = sunR + 35;
  const x1 = sunX + Math.cos(angle) * startR;
  const y1 = sunY + Math.sin(angle) * startR;
  const x2 = sunX + Math.cos(angle) * endR;
  const y2 = sunY + Math.sin(angle) * endR;
  for (let t = 0; t <= 1; t += 0.1) {
    const x = Math.round(x1 + (x2 - x1) * t);
    const y = Math.round(y1 + (y2 - y1) * t);
    const a = Math.round(30 * (1 - t));
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      setPixel(x, y, LIGHT_HONEY[0], LIGHT_HONEY[1], LIGHT_HONEY[2], a);
    }
  }
}

// Convert to RGB for PNG
const rgbPixels = new Uint8ClampedArray(WIDTH * HEIGHT * 3);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  rgbPixels[i * 3] = pixels[i * 4];
  rgbPixels[i * 3 + 1] = pixels[i * 4 + 1];
  rgbPixels[i * 3 + 2] = pixels[i * 4 + 2];
}

// Build PNG using pngjs
const png = new PNG({ width: WIDTH, height: HEIGHT, colorType: 2, bitDepth: 8 });
png.data = rgbPixels;

const buf = PNG.sync.write(png, { colorType: 2, bitDepth: 8 });
fs.writeFileSync('public/assets/og-image-v2.png', buf);

console.log(`Created OG image v2: public/assets/og-image-v2.png (${buf.length} bytes, ${WIDTH}x${HEIGHT})`);

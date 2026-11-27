import { createDeflate, deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const WIDTH = 1200;
const HEIGHT = 627;

// Brand colors
const DEEP_FOREST = [6, 28, 20];       // #061c14
const FOREST = [10, 55, 31];           // #0a371f
const DARK_FOREST = [4, 18, 10];       // #04120a
const HONEY_GOLD = [232, 182, 72];     // #e8b648
const LIGHT_HONEY = [249, 223, 153];   // #f9df99
const HONEY_GOLD_DARK = [201, 153, 42]; // darker honey for depth

// Create pixel buffer (RGBA, premultiplied not needed)
const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);

// Initialize with deep forest green
for (let i = 0; i < pixels.length; i += 4) {
  pixels[i] = DEEP_FOREST[0];
  pixels[i + 1] = DEEP_FOREST[1];
  pixels[i + 2] = DEEP_FOREST[2];
  pixels[i + 3] = 255;
}

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const idx = (y * WIDTH + x) * 4;
  // Alpha blend with existing
  const alpha = a / 255;
  const existingR = pixels[idx];
  const existingG = pixels[idx + 1];
  const existingB = pixels[idx + 2];
  pixels[idx] = Math.round(existingR * (1 - alpha) + r * alpha);
  pixels[idx + 1] = Math.round(existingG * (1 - alpha) + g * alpha);
  pixels[idx + 2] = Math.round(existingB * (1 - alpha) + b * alpha);
}

function drawCircle(cx, cy, radius, color, alpha = 255) {
  const r2 = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(x, y, color[0], color[1], color[2], alpha);
      }
    }
  }
}

function drawFilledCircle(cx, cy, radius, color, alpha = 255) {
  drawCircle(cx, cy, radius, color, alpha);
}

function drawTriangle(x1, y1, x2, y2, x3, y3, color, alpha = 255) {
  // Bounding box
  const minX = Math.max(0, Math.floor(Math.min(x1, x2, x3)));
  const maxX = Math.min(WIDTH - 1, Math.ceil(Math.max(x1, x2, x3)));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2, y3)));
  const maxY = Math.min(HEIGHT - 1, Math.ceil(Math.max(y1, y2, y3)));

  // Edge functions
  const edge = (ax, ay, bx, by, cx, cy) => (cx - ax) * (by - ay) - (cy - ay) * (bx - ax);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const e0 = edge(x1, y1, x2, y2, x, y);
      const e1 = edge(x2, y2, x3, y3, x, y);
      const e2 = edge(x3, y3, x1, y1, x, y);
      if (e0 >= 0 && e1 >= 0 && e2 >= 0) {
        setPixel(x, y, color[0], color[1], color[2], alpha);
      }
    }
  }
}

function drawDrop(cx, cy, radius, color, alpha = 255) {
  // Circle part
  drawCircle(cx, cy, radius, color, alpha);
  // Triangle part pointing down
  const triHeight = radius * 1.4;
  drawTriangle(
    cx - radius * 0.7, cy,
    cx + radius * 0.7, cy,
    cx, cy + triHeight,
    color, alpha
  );
}

// 1. Background: already deep forest
// 2. Subtle atmosphere gradient at top (lighter forest)
for (let y = 0; y < HEIGHT * 0.4; y++) {
  const t = y / (HEIGHT * 0.4);
  const alpha = Math.round(30 * (1 - t));
  for (let x = 0; x < WIDTH; x++) {
    setPixel(x, y, FOREST[0], FOREST[1], FOREST[2], alpha);
  }
}

// 3. Forest silhouettes at bottom
const forestBottom = HEIGHT - 80;
// Large dark forest triangles
drawTriangle(0, forestBottom, 300, forestBottom, 150, HEIGHT, DARK_FOREST, 255);
drawTriangle(250, forestBottom, 550, forestBottom, 400, HEIGHT, DARK_FOREST, 255);
drawTriangle(500, forestBottom, 800, forestBottom, 650, HEIGHT, DARK_FOREST, 255);
drawTriangle(750, forestBottom, 1050, forestBottom, 900, HEIGHT, DARK_FOREST, 255);
drawTriangle(1000, forestBottom, 1200, forestBottom, 1100, HEIGHT, DARK_FOREST, 255);

// Medium forest triangles (slightly lighter)
drawTriangle(50, forestBottom - 15, 350, forestBottom - 15, 200, HEIGHT, FOREST, 200);
drawTriangle(400, forestBottom - 20, 700, forestBottom - 20, 550, HEIGHT, FOREST, 200);
drawTriangle(750, forestBottom - 10, 1150, forestBottom - 10, 950, HEIGHT, FOREST, 200);

// 4. Large honey-gold circle (sun/honey) at center-right
drawCircle(920, 310, 170, HONEY_GOLD, 255);
// Inner lighter circle for glow
drawCircle(920, 300, 110, LIGHT_HONEY, 200);

// 5. Smaller overlapping honey circle
drawCircle(1000, 260, 85, HONEY_GOLD, 255);
drawCircle(1000, 255, 50, LIGHT_HONEY, 180);

// 6. Honey drop below large circle
drawDrop(920, 490, 55, HONEY_GOLD, 255);
drawDrop(920, 480, 30, LIGHT_HONEY, 200);

// 7. Small honey drop accent
drawDrop(820, 380, 25, HONEY_GOLD, 220);

// 8. Subtle honeycomb pattern (very light, sparse)
for (let gy = 100; gy < HEIGHT - 100; gy += 70) {
  for (let gx = 100; gx < WIDTH; gx += 120) {
    const offsetX = (gy / 70) % 2 === 0 ? 0 : 60;
    const hx = gx + offsetX;
    if (hx > WIDTH - 40 || hx < 40) continue;
    // Skip if overlapping honey circles
    const d1 = Math.hypot(hx - 920, gy - 310);
    const d2 = Math.hypot(hx - 1000, gy - 260);
    if (d1 < 200 || d2 < 120) continue;
    // Draw small hexagon (simplified as small circle)
    drawCircle(hx, gy, 12, [255, 255, 255], 15);
  }
}

// Convert RGBA to RGB (drop alpha since we've already blended)
const rgbPixels = new Uint8ClampedArray(WIDTH * HEIGHT * 3);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  rgbPixels[i * 3] = pixels[i * 4];
  rgbPixels[i * 3 + 1] = pixels[i * 4 + 1];
  rgbPixels[i * 3 + 2] = pixels[i * 4 + 2];
}

// Build scanlines with filter type 0 (none)
const scanlineSize = 1 + WIDTH * 3;
const scanlines = new Uint8ClampedArray(HEIGHT * scanlineSize);
for (let y = 0; y < HEIGHT; y++) {
  const offset = y * scanlineSize;
  scanlines[offset] = 0; // filter type: none
  scanlines.set(rgbPixels.subarray(y * WIDTH * 3, (y + 1) * WIDTH * 3), offset + 1);
}

// Compress with zlib
const compressed = deflateSync(scanlines, { level: 9 });

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}
function crc32(buf, start, end) {
  let crc = 0xFFFFFFFF;
  for (let i = start; i < end; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function writeChunk(type, data) {
  const len = data.length;
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcInput, 0, crcInput.length);

  const chunks = [];
  // Length (4 bytes big-endian)
  chunks.push(Buffer.from([(len >>> 24) & 0xFF, (len >>> 16) & 0xFF, (len >>> 8) & 0xFF, len & 0xFF]));
  // Type
  chunks.push(typeBuf);
  // Data
  chunks.push(data);
  // CRC (4 bytes big-endian)
  chunks.push(Buffer.from([(crc >>> 24) & 0xFF, (crc >>> 16) & 0xFF, (crc >>> 8) & 0xFF, crc & 0xFF]));
  return Buffer.concat(chunks);
}

// Build PNG
const pngChunks = [];

// Signature
pngChunks.push(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // color type: RGB
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace
pngChunks.push(writeChunk('IHDR', ihdr));

// IDAT
pngChunks.push(writeChunk('IDAT', compressed));

// IEND
pngChunks.push(writeChunk('IEND', Buffer.alloc(0)));

const pngBuffer = Buffer.concat(pngChunks);
writeFileSync('public/assets/og-image.png', pngBuffer);

console.log(`Created OG image: public/assets/og-image.png (${pngBuffer.length} bytes, ${WIDTH}x${HEIGHT})`);

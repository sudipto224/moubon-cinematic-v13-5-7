#!/usr/bin/env python3
"""Build aspect-matched, non-repeating desktop/tablet/mobile mangrove banks."""
from pathlib import Path
import math
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
SOURCES = [Image.open(ASSETS / "bank-a-cut.webp").convert("RGBA"), Image.open(ASSETS / "bank-b-cut.webp").convert("RGBA")]

def smoothstep(edge0, edge1, value):
    t = np.clip((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

def build_composite(output_name, width, height, count, overlap, crop_offsets, source_start, byte_budget):
    segment_height = math.ceil((height + (count - 1) * overlap) / count)
    stride = segment_height - overlap
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for index in range(count):
        source = SOURCES[(index + source_start) % 2]
        crop_width = round(source.height * width / segment_height)
        max_crop_x = max(0, source.width - crop_width)
        crop_x = max(0, min(max_crop_x, crop_offsets[index % len(crop_offsets)]))
        segment = source.crop((crop_x, 0, crop_x + crop_width, source.height)).resize(
            (width, segment_height), Image.Resampling.LANCZOS
        )
        pixels = np.asarray(segment).copy()
        y = np.arange(segment_height, dtype=np.float32)
        x = np.arange(width, dtype=np.float32)
        vertical_fade = np.minimum(
            smoothstep(0, overlap, y),
            1 - smoothstep(segment_height - overlap, segment_height - 1, y)
        )
        # Preserve dense forest on the outer edge; dissolve the river-facing edge
        # gradually so the roots can meet the water without a hard vertical seam.
        horizontal_fade = smoothstep(0, width * .025, x) * (1 - smoothstep(width * .62, width - 1, x))
        alpha = pixels[:, :, 3].astype(np.float32) / 255.0
        alpha *= vertical_fade[:, None] * horizontal_fade[None, :]
        pixels[:, :, 3] = np.uint8(np.clip(alpha * 255, 0, 255))
        layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        layer.alpha_composite(Image.fromarray(pixels, "RGBA"), (0, index * stride))
        canvas = Image.alpha_composite(canvas, layer)
    alpha = np.asarray(canvas.getchannel("A")).copy()
    alpha[0, :] = 0
    alpha[-1, :] = 0
    alpha[:, 0] = 0
    alpha[:, -1] = 0
    canvas.putalpha(Image.fromarray(alpha, "L"))
    output = ASSETS / output_name
    chosen = None
    for quality in (64, 60, 56, 52, 48, 46, 44, 42, 40, 38, 36, 34, 32):
        canvas.save(output, "WEBP", quality=quality, method=4, alpha_quality=65)
        size = output.stat().st_size
        if size <= byte_budget:
            chosen = (quality, size)
            break
    if chosen is None:
        raise RuntimeError(f"{output_name} exceeds {byte_budget:,} bytes: {output.stat().st_size:,}")
    print(f"{output_name}: {width}x{height}, {chosen[1]:,} bytes, quality={chosen[0]}")

def main():
    # Aspect ratios approximate the stage's width/long-world-height at each breakpoint.
    # Distinct crop sequences and opposite starting artwork prevent mirrored repetition.
    variants = [
        ("desktop", 512, 5535, 5, 180, [20, 160, 320, 80, 250], [250, 40, 180, 350, 100], 260_000),
        ("tablet", 256, 7700, 7, 150, [60, 300, 100, 450, 180, 520, 240], [400, 80, 520, 180, 620, 260, 40], 210_000),
        ("mobile", 160, 7400, 8, 140, [100, 500, 240, 650, 40, 430, 180, 560], [600, 160, 700, 300, 40, 520, 220, 460], 150_000),
    ]
    for variant, width, height, count, overlap, left_offsets, right_offsets, budget in variants:
        build_composite(f"bank-left-world{('-' + variant) if variant != 'desktop' else ''}.webp",
                        width, height, count, overlap, left_offsets, 0, budget)
        build_composite(f"bank-right-world{('-' + variant) if variant != 'desktop' else ''}.webp",
                        width, height, count, overlap, right_offsets, 1, budget)

if __name__ == "__main__":
    main()

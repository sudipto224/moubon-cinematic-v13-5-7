#!/usr/bin/env python3
"""Bake the V13.1 river cut-outs and deterministic seamless water texture."""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
SOURCE = ROOT / "docs" / "source-art"
BG = np.array([10.0, 55.0, 31.0], dtype=np.float32)
SEED = 1301

def smoothstep(edge0, edge1, value):
    t = np.clip((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

def low_frequency_noise(width, height, seed=SEED, amplitude=0.012):
    rng = np.random.default_rng(seed)
    grid = rng.normal(0.0, 1.0, (18, 24)).astype(np.float32)
    grid_image = Image.fromarray(np.uint8(np.clip((grid + 3.0) / 6.0 * 255, 0, 255)), "L")
    field = np.asarray(grid_image.resize((width, height), Image.Resampling.BICUBIC), dtype=np.float32) / 255.0
    field = (field - 0.5) * 2.0
    return field * amplitude

def unmatte(rgb, alpha):
    safe = np.maximum(alpha[..., None], 0.08)
    foreground = (rgb - (1.0 - alpha[..., None]) * BG) / safe
    return np.clip(foreground, 0, 255)

def save_budget(image, path, limit, initial_quality=82):
    for quality in range(initial_quality, 54, -2):
        image.save(path, "WEBP", quality=quality, method=4)
        if path.stat().st_size <= limit:
            return quality, path.stat().st_size
    raise RuntimeError(f"{path.name} exceeds {limit} bytes at quality 56 ({path.stat().st_size})")

def make_scene(source_path, index):
    image = Image.open(source_path).convert("RGB")
    rgb = np.asarray(image, dtype=np.float32)
    h, w = rgb.shape[:2]
    dist = np.sqrt(np.sum((rgb - BG) ** 2, axis=2))
    alpha_color = smoothstep(3.0, 34.0, dist)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    x = xx / max(1, w - 1)
    y = yy / max(1, h - 1)
    edge_distance = np.minimum.reduce([x, 1.0 - x, y, 1.0 - y])
    warp = low_frequency_noise(w, h, SEED + index, 0.014)
    feather = smoothstep(0.06, 0.20, edge_distance + warp)
    # Exact transparent guard band along all four outer borders.
    feather[:math.ceil(h * .06), :] = 0
    feather[-math.ceil(h * .06):, :] = 0
    feather[:, :math.ceil(w * .06)] = 0
    feather[:, -math.ceil(w * .06):] = 0

    foreground = unmatte(rgb, alpha_color)
    alpha = np.clip(alpha_color * feather, 0, 1)
    foreground[alpha_color < .06] = BG
    rgba = np.dstack([foreground.astype(np.uint8), np.uint8(np.round(alpha * 255))])
    full = Image.fromarray(rgba, "RGBA")

    desktop = full.resize((1200, 800), Image.Resampling.LANCZOS)
    mobile = full.resize((800, 533), Image.Resampling.LANCZOS)
    qd, sd = save_budget(desktop, ASSETS / f"scene-{index}-cut.webp", 220_000, 82)
    qm, sm = save_budget(mobile, ASSETS / f"scene-{index}-cut-800.webp", 130_000, 82)
    print(f"scene-{index}: desktop {desktop.size} q{qd} {sd:,} B; mobile {mobile.size} q{qm} {sm:,} B")

def make_bank(source_path, output_path, index):
    image = Image.open(source_path).convert("RGB")
    rgb = np.asarray(image, dtype=np.float32)
    h, w = rgb.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    x = xx / max(1, w - 1)
    y = yy / max(1, h - 1)
    dist = np.sqrt(np.sum((rgb - BG) ** 2, axis=2))
    chroma = smoothstep(5.0, 38.0, dist)
    # Only key out the green river-facing fade on the right side.
    right_weight = smoothstep(.58, .92, x)
    river_alpha = (1.0 - right_weight) + right_weight * chroma
    left_fade = smoothstep(0.0, .085, x)
    right_fade = 1.0 - smoothstep(.78, 1.0, x)
    vertical_fade = smoothstep(0.0, .075, y) * (1.0 - smoothstep(.925, 1.0, y))
    alpha = np.clip(river_alpha * left_fade * right_fade * vertical_fade, 0, 1)
    alpha[:, 0] = 0
    alpha[:, -1] = 0
    alpha[0, :] = 0
    alpha[-1, :] = 0
    foreground = rgb
    rgba = np.dstack([foreground.astype(np.uint8), np.uint8(np.round(alpha * 255))])
    result = Image.fromarray(rgba, "RGBA")
    q, size = save_budget(result, output_path, 200_000, 84)
    print(f"{output_path.name}: {result.size} q{q} {size:,} B")

def make_reeds(source_path, output_path):
    image = Image.open(source_path).convert("RGB")
    rgb = np.asarray(image, dtype=np.float32)
    h, w = rgb.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    x = xx / max(1, w - 1)
    y = yy / max(1, h - 1)
    dist = np.sqrt(np.sum((rgb - BG) ** 2, axis=2))
    chroma = smoothstep(4.0, 34.0, dist)
    top_key_weight = 1.0 - smoothstep(.16, .48, y)
    background_alpha = (1.0 - top_key_weight) + top_key_weight * chroma
    side_fade = smoothstep(0.0, .12, x) * (1.0 - smoothstep(.88, 1.0, x))
    top_fade = smoothstep(0.0, .22, y)
    alpha = np.clip(background_alpha * side_fade * top_fade, 0, 1)
    alpha[:, 0] = 0
    alpha[:, -1] = 0
    alpha[0, :] = 0
    # Bottom intentionally remains full-bleed, except transparent source-free corners from side fade.
    rgba = np.dstack([rgb.astype(np.uint8), np.uint8(np.round(alpha * 255))])
    result = Image.fromarray(rgba, "RGBA").resize((1600, round(h * 1600 / w)), Image.Resampling.LANCZOS)
    q, size = save_budget(result, output_path, 160_000, 82)
    print(f"{output_path.name}: {result.size} q{q} {size:,} B")

def blend_periodic_edges(array, feather=160):
    out = array.astype(np.float32).copy()
    h, w = out.shape[:2]
    feather = min(feather, w // 3, h // 3)
    # Cross-fade opposite vertical edges to a shared seam.
    for i in range(feather):
        t = smoothstep(0.0, 1.0, i / max(1, feather - 1))
        left = out[:, i, :].copy()
        right = out[:, w - 1 - i, :].copy()
        shared = (left + right) * .5
        out[:, i, :] = shared * (1 - t) + left * t
        out[:, w - 1 - i, :] = shared * (1 - t) + right * t
    # Cross-fade opposite horizontal edges to a shared seam.
    for i in range(feather):
        t = smoothstep(0.0, 1.0, i / max(1, feather - 1))
        top = out[i, :, :].copy()
        bottom = out[h - 1 - i, :, :].copy()
        shared = (top + bottom) * .5
        out[i, :, :] = shared * (1 - t) + top * t
        out[h - 1 - i, :, :] = shared * (1 - t) + bottom * t
    return np.uint8(np.clip(out, 0, 255))

def make_water(source_path, output_path):
    image = Image.open(source_path).convert("RGB").resize((1024, 1024), Image.Resampling.LANCZOS)
    pixels = blend_periodic_edges(np.asarray(image, dtype=np.uint8), 180)
    result = Image.fromarray(pixels, "RGB")
    q, size = save_budget(result, output_path, 150_000, 84)
    print(f"{output_path.name}: {result.size} q{q} {size:,} B")


def feather_boat(source_path, output_path):
    image = Image.open(source_path).convert("RGBA")
    rgba = np.asarray(image, dtype=np.uint8).copy()
    rgb = rgba[:, :, :3].astype(np.int16)
    alpha = rgba[:, :, 3]
    known = alpha >= 220
    # Decontaminate semitransparent cut-out pixels from the nearest opaque boat pixel.
    # This removes the red matte fringe already present in the supplied transparent PNG/WebP.
    def shifted(array, dy, dx, fill):
        out = np.full_like(array, fill)
        height, width = array.shape[:2]
        src_y0, src_y1 = max(0, -dy), min(height, height - dy)
        src_x0, src_x1 = max(0, -dx), min(width, width - dx)
        dst_y0, dst_y1 = max(0, dy), min(height, height + dy)
        dst_x0, dst_x1 = max(0, dx), min(width, width + dx)
        out[dst_y0:dst_y1, dst_x0:dst_x1] = array[src_y0:src_y1, src_x0:src_x1]
        return out
    neighbors = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]
    for _ in range(5):
        next_known = known.copy()
        next_rgb = rgb.copy()
        for dy, dx in neighbors:
            neighbor_known = shifted(known, dy, dx, False)
            neighbor_rgb = shifted(rgb, dy, dx, 0)
            take = (~next_known) & neighbor_known
            next_rgb[take] = neighbor_rgb[take]
            next_known[take] = True
        rgb, known = next_rgb, next_known
    feathered_alpha = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(radius=.55))
    output = Image.fromarray(np.dstack([np.uint8(np.clip(rgb, 0, 255)), np.asarray(feathered_alpha)]), "RGBA")
    output.save(output_path, "WEBP", quality=90, method=4)
    print(f"{output_path.name}: matte-edge decontamination + 1px alpha feather, {output_path.stat().st_size:,} B")

def main():
    import sys
    SOURCE.mkdir(parents=True, exist_ok=True)
    tasks = set(sys.argv[1:])
    if not tasks or "--scenes" in tasks:
        for index in range(1, 7):
            source = SOURCE / f"scene-{index}.webp" if (SOURCE / f"scene-{index}.webp").exists() else ASSETS / f"scene-{index}.webp"
            make_scene(source, index)
    if not tasks or "--banks" in tasks:
        make_bank(SOURCE / "bank-a.webp" if (SOURCE / "bank-a.webp").exists() else ASSETS / "bank-a.webp", ASSETS / "bank-a-cut.webp", 1)
        make_bank(SOURCE / "bank-b.webp" if (SOURCE / "bank-b.webp").exists() else ASSETS / "bank-b.webp", ASSETS / "bank-b-cut.webp", 2)
    if not tasks or "--reeds-water" in tasks:
        make_reeds(SOURCE / "foreground-reeds.webp" if (SOURCE / "foreground-reeds.webp").exists() else ASSETS / "foreground-reeds.webp", ASSETS / "foreground-reeds-cut.webp")
        make_water(SOURCE / "water-texture.webp" if (SOURCE / "water-texture.webp").exists() else ASSETS / "water-texture.webp", ASSETS / "water-seamless.webp")
    if not tasks or "--boat" in tasks:
        feather_boat(SOURCE / "boat-original.webp" if (SOURCE / "boat-original.webp").exists() else ASSETS / "boat.webp", ASSETS / "boat.webp")
        feather_boat(SOURCE / "boat-800-original.webp" if (SOURCE / "boat-800-original.webp").exists() else ASSETS / "boat-800.webp", ASSETS / "boat-800.webp")

if __name__ == "__main__":
    main()

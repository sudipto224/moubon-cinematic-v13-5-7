#!/usr/bin/env python3
"""Verify baked transparent river assets have clean zero-alpha borders."""
from pathlib import Path
import sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
files = sorted(ASSETS.glob("*-cut*.webp"))
if not files:
    raise SystemExit("FAIL: no *-cut*.webp assets found")

failures = []
print("Moubon V13.5 river bank/boat asset verification")
for path in files:
    image = Image.open(path).convert("RGBA")
    alpha = np.asarray(image.getchannel("A"), dtype=np.uint8)
    stats = {
        "top_max": int(alpha[0, :].max()),
        "bottom_max": int(alpha[-1, :].max()),
        "left_max": int(alpha[:, 0].max()),
        "right_max": int(alpha[:, -1].max()),
        "corner_max": max(int(alpha[0,0]), int(alpha[0,-1]), int(alpha[-1,0]), int(alpha[-1,-1])),
    }
    intended_bottom = path.name == "foreground-reeds-cut.webp"
    checks = [stats["top_max"] == 0, stats["left_max"] == 0, stats["right_max"] == 0]
    if not intended_bottom:
        checks.append(stats["bottom_max"] == 0)
    status = "PASS" if all(checks) else "FAIL"
    print(f"{status} {path.name} {image.size}: " + ", ".join(f"{key}={value}" for key, value in stats.items()))
    if status == "FAIL":
        failures.append(path.name)

if failures:
    print("FAILED assets: " + ", ".join(failures))
    raise SystemExit(1)

for boat_name in ("boat.webp", "boat-800.webp"):
    boat_path = ASSETS / boat_name
    if not boat_path.exists():
        failures.append(f"{boat_name} (missing)")
        continue
    boat_alpha = np.asarray(Image.open(boat_path).convert("RGBA").getchannel("A"), dtype=np.uint8)
    partial_pixels = int(((boat_alpha > 0) & (boat_alpha < 255)).sum())
    print(f"PASS {boat_name}: alpha feather present on {partial_pixels:,} edge pixels")
    if partial_pixels < 100:
        failures.append(f"{boat_name} (missing 1px alpha feather)")


# Responsive bank composites use aspect-matched desktop/tablet/mobile variants.
bank_specs = {
    "bank-left-world.webp": (512, 5535, 260_000),
    "bank-right-world.webp": (512, 5535, 260_000),
    "bank-left-world-tablet.webp": (256, 7700, 210_000),
    "bank-right-world-tablet.webp": (256, 7700, 210_000),
    "bank-left-world-mobile.webp": (160, 7400, 150_000),
    "bank-right-world-mobile.webp": (160, 7400, 150_000),
}
for bank_name, (minimum_width, minimum_height, byte_budget) in bank_specs.items():
    bank_path = ASSETS / bank_name
    if not bank_path.exists():
        failures.append(f"{bank_name} (missing)")
        print(f"FAIL {bank_name}: missing")
        continue
    bank = Image.open(bank_path).convert("RGBA")
    alpha = np.asarray(bank.getchannel("A"))
    right_edge_max = int(alpha[:, -1].max())
    left_edge_max = int(alpha[:, 0].max())
    top_max = int(alpha[0, :].max())
    bottom_max = int(alpha[-1, :].max())
    size_ok = bank.width >= minimum_width and bank.height >= minimum_height and bank_path.stat().st_size <= byte_budget
    edge_ok = right_edge_max == 0 and left_edge_max == 0 and top_max == 0 and bottom_max == 0
    status = "PASS" if size_ok and edge_ok else "FAIL"
    print(f"{status} {bank_name} {bank.size}: {bank_path.stat().st_size:,} bytes; alpha edges L/R/T/B={left_edge_max}/{right_edge_max}/{top_max}/{bottom_max}")
    if status == "FAIL":
        failures.append(bank_name)

water_path = ASSETS / "water-seamless.webp"
if not water_path.exists():
    failures.append("water-seamless.webp (missing)")
else:
    water = np.asarray(Image.open(water_path).convert("RGB"), dtype=np.int16)
    vertical_seam = int(np.abs(water[:, 0, :] - water[:, -1, :]).max())
    horizontal_seam = int(np.abs(water[0, :, :] - water[-1, :, :]).max())
    seam_status = "PASS" if max(vertical_seam, horizontal_seam) <= 20 and float(np.abs(water[:, 0, :] - water[:, -1, :]).mean()) <= 2.5 and float(np.abs(water[0, :, :] - water[-1, :, :]).mean()) <= 2.5 else "FAIL"
    print(f"{seam_status} water-seamless.webp: opposite-edge max RGB delta vertical={vertical_seam}, horizontal={horizontal_seam}; mean deltas <=2.5")
    if seam_status == "FAIL":
        failures.append("water-seamless.webp (opposite-edge seam)")
if failures:
    print("FAILED assets: " + ", ".join(failures))
    raise SystemExit(1)
print(f"PASS: {len(files)} cut-out assets plus 6 responsive continuous bank composites verified; foreground-reeds bottom edge is the documented full-bleed exception.")

"""
Maya's Moments FL -- New Photo Processor
=========================================
Run this script whenever new photos are added to any gallery category folder.

It will:
  1. Resize any oversized photos to max 2000px on the longest side
  2. Rename files -- replaces spaces with hyphens
  3. Bake the MM watermark into the bottom-right corner
  4. Save as web-optimized JPEG

HOW TO USE:
  In the Claude Code terminal, run:
    ! python3 tools/process-new-photos.py

  Or to process a specific category only:
    ! python3 tools/process-new-photos.py birthday-parties

The script is safe to re-run -- it tracks which files have already been
processed by checking for a small marker in the file metadata (EXIF comment).
If a photo is already watermarked it will be skipped.
"""

import os, sys, subprocess
from PIL import Image, ImageOps

# ── Config ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY_DIR  = os.path.join(PROJECT_ROOT, "images", "gallery")
WM_PATH      = os.path.join(PROJECT_ROOT, "images", "logo-watermark.png")

MAX_PX       = 2000    # longest side after resize
JPEG_QUALITY = 88      # 1-95, higher = better quality / larger file
WM_OPACITY   = 0.45    # 0.0 transparent -- 1.0 fully opaque
WM_SIZE_PCT  = 0.22    # watermark width as fraction of photo width
WM_PAD_PCT   = 0.025   # padding from edge as fraction of photo width
PROCESSED_TAG = "MayasMomentsFL-processed"  # marker in EXIF comment

# ── Helpers ───────────────────────────────────────────────────────────────────
def is_processed(path):
    """Check EXIF comment for our marker so we don't double-watermark."""
    try:
        img  = Image.open(path)
        exif = img.info.get("comment", b"")
        if isinstance(exif, bytes):
            return PROCESSED_TAG.encode() in exif
        return PROCESSED_TAG in exif
    except Exception:
        return False

def resize(path):
    """Resize to MAX_PX on longest side. No-op if already smaller."""
    img = Image.open(path)
    w, h = img.size
    if max(w, h) <= MAX_PX:
        return
    if w >= h:
        new_w, new_h = MAX_PX, int(h * MAX_PX / w)
    else:
        new_w, new_h = int(w * MAX_PX / h), MAX_PX
    img = img.resize((new_w, new_h), Image.LANCZOS)
    img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True)

def watermark(photo_path):
    """Composite the MM logo watermark onto the photo."""
    photo = Image.open(photo_path).convert("RGBA")
    pw, ph = photo.size

    wm    = Image.open(WM_PATH).convert("RGBA")
    wm_w  = max(60, int(pw * WM_SIZE_PCT))
    wm_h  = int(wm.height * wm_w / wm.width)
    wm    = wm.resize((wm_w, wm_h), Image.LANCZOS)

    r, g, b, a = wm.split()
    a = a.point(lambda x: int(x * WM_OPACITY))
    wm.putalpha(a)

    pad_x = int(pw * WM_PAD_PCT)
    pad_y = int(ph * WM_PAD_PCT)
    pos   = (pw - wm_w - pad_x, ph - wm_h - pad_y)

    photo.paste(wm, pos, wm)
    # Save with marker in EXIF comment
    photo.convert("RGB").save(
        photo_path, "JPEG",
        quality=JPEG_QUALITY,
        optimize=True,
        comment=PROCESSED_TAG
    )

def sanitize_filename(path):
    """Replace spaces with hyphens in filename. Returns new path."""
    folder   = os.path.dirname(path)
    basename = os.path.basename(path)
    clean    = basename.replace(" ", "-")
    new_path = os.path.join(folder, clean)
    if new_path != path:
        os.rename(path, new_path)
    return new_path

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    # Optional: filter to one category via command-line arg
    filter_cat = sys.argv[1] if len(sys.argv) > 1 else None

    if not os.path.exists(WM_PATH):
        print("ERROR: logo-watermark.png not found at", WM_PATH)
        print("Re-run the initial setup or ask Claude to regenerate it.")
        sys.exit(1)

    processed = skipped = errors = 0

    for cat in sorted(os.listdir(GALLERY_DIR)):
        cat_path = os.path.join(GALLERY_DIR, cat)
        if not os.path.isdir(cat_path):
            continue
        if filter_cat and cat != filter_cat:
            continue

        for fname in sorted(os.listdir(cat_path)):
            if not fname.lower().endswith((".jpg", ".jpeg")):
                continue
            if fname.startswith("."):
                continue

            path = os.path.join(cat_path, fname)

            if is_processed(path):
                print(f"  SKIP (already done): {cat}/{fname}")
                skipped += 1
                continue

            try:
                path  = sanitize_filename(path)
                fname = os.path.basename(path)
                resize(path)
                watermark(path)
                size_kb = os.path.getsize(path) / 1024
                print(f"  OK  {cat}/{fname}  ({size_kb:.0f} KB)")
                processed += 1
            except Exception as e:
                print(f"  ERR {cat}/{fname}: {e}")
                errors += 1

    print(f"\nProcessed: {processed}  |  Skipped (already done): {skipped}  |  Errors: {errors}")

if __name__ == "__main__":
    main()

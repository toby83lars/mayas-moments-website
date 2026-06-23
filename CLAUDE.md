# CLAUDE.md -- Maya's Moments FL Website

## Project Overview

Static HTML/CSS/JS photography portfolio and booking site for Maya Larson's business.
- **Business name:** Maya's Moments FL | **Tagline:** "Capturing Your Moments"
- **Domain:** mayasmomentsfl.com (GitHub Pages, CNAME file in repo)
- **GitHub remote:** https://github.com/toby83lars/mayas-moments-website.git
- **No frameworks, no CMS, no build step.** Open files directly in a browser.

---

## File Structure

```
index.html          -- Home: hero, promo banner, gallery preview, CTAs
about.html          -- Bio + portrait photo
gallery.html        -- Masonry grid, 16-category filter tabs, lightbox
contact.html        -- Formspree inquiry form + contact info

css/styles.css      -- Single stylesheet, all pages
js/main.js          -- Loaded on every page (nav, photo protection, active link)
js/gallery.js       -- Loaded on gallery.html only (filter, lightbox, Pinterest)

images/
  logo.jpg                   -- Real MM logo (source of truth for brand mark)
  logo-watermark.png         -- PNG used by process-new-photos.py
  favicon.svg
  gallery/[category]/        -- One folder per gallery category; drop JPGs here
    *.jpg                    -- Real photos (already watermarked)
    *.svg                    -- Placeholder images (not yet replaced)

tools/
  process-new-photos.py      -- Resize, rename, watermark new photos (Pillow)

robots.txt
sitemap.xml
CNAME
```

---

## Brand

### Colors -- ALL PLACEHOLDERS
All hex values in the `:root` block of `css/styles.css` are placeholders. Maya has not finalized brand colors yet. When she does, do a single find-and-replace pass on the `:root` block only -- nothing else needs to change.

| Variable | Current placeholder | Role |
|---|---|---|
| `--blue` | `#A8C5D6` | Primary brand color |
| `--blue-pale` | `#D6E9F2` | Section backgrounds |
| `--blue-mid` | `#7AAFC8` | Hover states |
| `--tan` | `#C4975A` | Accent / warm gold |
| `--tan-pale` | `#F0E8DC` | Section backgrounds |
| `--cream` | `#FAF7F2` | Page background |
| `--charcoal` | `#3D3530` | Body text |

### Typography
- **Headings:** Playfair Display (Google Fonts, loaded in each HTML `<head>`)
- **Body / UI:** Lato (Google Fonts)

### Tone
Bright, light, relaxed. Not dark or moody.

---

## Gallery

### 16 Categories (order matches filter tabs and contact form dropdown)
Weddings, Family Sessions, Maternity, Newborn/Fresh 48, Engagement Sessions, Couple Sessions, Birthday Parties, Baby Showers/Gender Reveals, Senior Portraits, Courthouse Weddings/Elopements, Engagement Proposals, Bachelorette Parties, Anniversary Sessions, Headshots/Branding, Pet Photography, Other

### Adding Photos
1. Drop watermarked JPGs into `images/gallery/[category]/`
2. Run `! python3 tools/process-new-photos.py` (or `! python3 tools/process-new-photos.py [category]` for one category)
   - Requires: `pip3 install Pillow`
   - Script resizes to max 2000px, renames spaces to hyphens, bakes watermark, marks EXIF so it won't double-process
3. Copy the `.gallery-item` HTML pattern in `gallery.html` for each new photo

### Photo Protection
- Right-click on images is disabled (`main.js`)
- Drag-to-save is disabled (`main.js`)
- Watermarks are baked into the image files themselves (real protection)

---

## Social Handles
- **Instagram:** @mayas_moments_fl
- **TikTok:** @mayasmomentsfl
- **Facebook:** facebook.com/profile.php?id=61576767068245 -- this is a personal-profile URL; needs to be updated once Maya converts to a Business Page

---

## SEO / Meta
Every page has: Open Graph tags, Twitter Card tags, Schema.org structured data (JSON-LD), canonical URL. `sitemap.xml` and `robots.txt` are in the repo root.

---

## What Still Needs to Be Done Before Launch

1. **Push to GitHub** -- blocked on auth. Options:
   - `brew install gh` -> `gh auth login` -> `git push -u origin main`
   - Generate a GitHub Personal Access Token (repo scope) and use as password on `git push`
2. **Hero photo** -- add to `images/hero/hero.jpg`, uncomment `background-image` in `.hero` CSS, add class `has-photo` to the hero section in `index.html`
3. **About photo of Maya** -- add to `images/about/maya.jpg`, update `src` in `about.html`
4. **Formspree ID** -- create free account at formspree.io, replace `YOUR_FORM_ID_HERE` in `contact.html`
5. **Remaining gallery photos** -- most categories still have SVG placeholders
6. **Brand colors** -- Maya needs to confirm hex codes; one-pass edit on `:root` in `css/styles.css`
7. **Facebook URL** -- update after Business Page conversion
8. **DNS** -- point mayasmomentsfl.com to GitHub Pages after deploy

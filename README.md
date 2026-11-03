# bnvac — personal site

Static HTML and CSS, hosted on [Neocities](https://neocities.org). There is
no build step: what is in `site/` is exactly what gets uploaded.

## Layout

```
site/                  everything that goes on Neocities
  index.html           front page (v1, live)
  v2/                  cyberpunk copies of the main pages (generated, see below)
  assets/
    css/main.css       site styles (template + our overrides at the end)
    js/                theme toggle, lightbox, carousel
    v2/                v2 only: v2.css, city.js, logo.js, signs.js
    fonts/             Barlow Condensed (OFL); drop Cyber Horizon here
  images/              cards, field photos, logos, certificates
  education/ experience/ publications/ software/ awards/ certifications/ contact/
  intraweb/ backoffice/ hearth/ smart-shelf/ alphafold/   project pages
    */demo/            saved, clickable demos of the real apps
tools/build_v2.py      regenerates site/v2/ from the v1 pages
```

## Upload to Neocities

One-time setup (needs Ruby):

```bash
gem install neocities
```

```bash
neocities login
```

Every upload, from the repo root:

```bash
neocities push site
```

`push` only sends files that changed. It does not delete files you removed
locally; delete those with `neocities delete <path>` or in the dashboard.

## v1 or v2

v1 is the live front page. v2 sits at `/v2/` so you can see it on the real
site without changing anything. To make v2 the front page:

```bash
cp site/index.html site/v1.html && cp site/v2/index.html site/index.html
```

To go back:

```bash
cp site/v1.html site/index.html
```

## v2 is generated from v1

v1 is the source of truth. After editing any v1 page, rebuild the v2 copies:

```bash
python3 tools/build_v2.py
```

It writes `site/v2/` from the v1 pages: same content, with the cyberpunk
stylesheet (`site/assets/v2/v2.css`), the city background (`city.js`), the
pixel logo on the front page (`logo.js`) and the neon-sign colours
(`signs.js`). Links between pages stay inside `/v2/`. Project pages keep
their own designs. Don't hand-edit `site/v2/`; it is overwritten.

## Fonts

v2 headings use **Cyber Horizon** (PutraCetol / Shanaf Studio, personal use
only). It is not in the repo. Copy it from the zip:

```bash
cp CyberHorizon-ARAvL.ttf site/assets/fonts/CyberHorizon.ttf
```

Until it is there, v2 uses Barlow Condensed 800 italic, which is
self-hosted under the SIL Open Font License
(`site/assets/fonts/OFL-BarlowCondensed.txt`). Don't list the font in
`.gitignore` to keep it out of git: the Neocities CLI skips anything listed
there, so it would not upload either. Leave it uncommitted.

## v2 wallpaper

v2 draws its own city. To use a photo instead, put it at
`site/assets/v2/wallpaper.jpg`; if that file exists it is shown in place of
the drawn city, with the rain, parallax and dimming kept. Delete the file (or
the `data-wallpaper` attribute on `#city` in `site/v2/index.html`) to go back.

The placeholder used while designing is a game screenshot and is not
committed. Swap in an image you have the rights to before v2 goes public.
A wide image, 2560px or more, looks sharpest.

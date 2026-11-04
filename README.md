# bnvac — personal site

Static HTML and CSS, hosted on [Neocities](https://neocities.org). There is
no build step: what is in `site/` is exactly what gets uploaded.

## Layout

```
site/                  everything that goes on Neocities
  index.html           front page
  assets/
    css/main.css       site styles (template + our overrides at the end)
    js/                theme toggle, lightbox, carousel
  images/              cards, field photos, logos, certificates
  education/ experience/ publications/ software/ awards/ certifications/ contact/
  intraweb/ backoffice/ hearth/ smart-shelf/ alphafold/   project pages
    */demo/            saved, clickable demos of the real apps
  baselayer/demo/      the baselayer config builder, runs in the browser
  wallet/              the leather-wallet portfolio (generated, see below)
wallet/                source for site/wallet/ (not uploaded)
```

## Rebuilding the wallet

`site/wallet/` is generated. Edit `wallet/template.html`, then:

```bash
python3 wallet/build.py
```

```bash
python3 wallet/export.py
```

`build.py` inlines the photo and fonts into `wallet/index.html`. `export.py`
copies it into `site/wallet/` with only the images it uses, and points its demo
windows at the site's own demo pages. After changing the résumé, regenerate
the PDF with `node wallet/pdf.js` (needs Playwright) before exporting.

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

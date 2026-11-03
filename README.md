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

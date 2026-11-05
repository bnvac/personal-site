# bnvac.com

My personal site. Plain static files hosted on [Neocities](https://neocities.org).

```
deploy.sh     rebuilds the front page and mirrors site/ to Neocities
site/         exactly what is live at bnvac.com, nothing else
wallet/       source for the front page (the wallet); not uploaded
```

## Deploy

One-time setup (needs Ruby):

```bash
gem install neocities
```

```bash
neocities login
```

Then, every time:

```bash
./deploy.sh
```

This rebuilds the wallet into `site/index.html` and pushes `site/` to the root
of the Neocities site with `--prune`: anything on Neocities that is not in
`site/` is deleted, so the live site always matches this folder. To see what
would change first:

```bash
./deploy.sh --dry-run
```

## Editing

- **Front page:** edit `wallet/template.html`. `deploy.sh` rebuilds it. After
  changing the résumé, regenerate the PDF with `node wallet/pdf.js` (needs
  Playwright).
- **Everything else:** edit the HTML in `site/` directly. Shared styles are in
  `site/assets/css/main.css`.

## What is in site/

```
index.html        the wallet (generated, don't edit)
wallet/           images and résumé PDF the wallet uses (generated)
about/            bio
education/ experience/ publications/ software/ awards/ certifications/ contact/
intraweb/ backoffice/ hearth/ smart-shelf/ alphafold/   project pages
*/demo/           saved, working copies of the apps
baselayer/demo/   the baselayer config builder
assets/ images/   styles, scripts, fonts, photos
```

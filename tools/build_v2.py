#!/usr/bin/env python3
"""Build site/v2/ from the v1 pages.

v1 stays the source of truth: edit site/*.html as usual, then run

    python3 tools/build_v2.py

to regenerate the cyberpunk copies under site/v2/. Each v2 page is the v1
page with the v2 stylesheet, the city background and v2-internal links.
The project pages (intraweb, backoffice, ...) have their own designs and
are linked as they are.
"""
import pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent / "site"
OUT = ROOT / "v2"
# pages that get a v2 copy; their links are kept inside /v2/
SECTIONS = ["about", "education", "experience", "publications", "publication",
            "software", "awards", "certifications", "contact", "sitemap"]
PAGES = ["index.html", "404.html"] + [str(p.relative_to(ROOT)) for s in SECTIONS
                                      for p in (ROOT / s).rglob("index.html")]

HEAD = """<link rel="stylesheet" href="/assets/v2/v2.css">
<script>document.documentElement.setAttribute("data-theme","dark")</script>"""

HERO = """<header class="city-hero" aria-label="bnvac">
  <div>
    <h1 class="city-hero__name"><canvas id="logo" data-word="BNVAC" aria-hidden="true"></canvas><span class="sr-only">bnvac</span></h1>
    <p class="city-hero__say">I build sensing systems and research infrastructure. When the tool I need doesn&rsquo;t exist, I write it.</p>
  </div>
  <a class="city-hero__cue" href="#main">Scroll</a>
</header>

"""

def relink(html):
    def fix(m):
        attr, url = m.group(1), m.group(2)
        if url == "/":
            return f'{attr}"/v2/"'
        first = url.lstrip("/").split("/")[0].split("#")[0]
        if first in SECTIONS or first == "index.html":
            return f'{attr}"/v2{url}"'
        return m.group(0)
    return re.sub(r'(href=)"(/[^"]*)"', fix, html)

def build(rel):
    html = (ROOT / rel).read_text(encoding="utf-8")
    home = rel == "index.html"
    html = relink(html)
    html = html.replace('<link rel="stylesheet" href="/assets/css/main.css">',
                        '<link rel="stylesheet" href="/assets/css/main.css">\n' + HEAD, 1)
    dim = "0" if home else "0.72"
    html = html.replace("<body>", f'<body class="v2 {"v2-home" if home else "v2-inner"}">\n'
                        f'<canvas id="city" data-wallpaper="/assets/v2/wallpaper.jpg" data-dim="{dim}" aria-hidden="true"></canvas>', 1)
    if home:
        i = html.index('<div id="main"')
        html = html[:i] + HERO + html[i:]
    scripts = '<script src="/assets/v2/city.js"></script>' + ('\n    <script src="/assets/v2/logo.js"></script>' if home else "")
    html = html.replace("</body>", "    " + scripts + "\n    <script src=\"/assets/v2/signs.js\"></script>\n  </body>", 1)
    title = re.search(r"<title>(.*?)</title>", html)
    if title and "v2" not in title.group(1):
        html = html.replace(title.group(0), f"<title>{title.group(1)} — v2</title>", 1)
    dest = OUT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
    return dest

if __name__ == "__main__":
    if OUT.exists():
        shutil.rmtree(OUT)
    for rel in PAGES:
        print("v2", build(rel).relative_to(ROOT))

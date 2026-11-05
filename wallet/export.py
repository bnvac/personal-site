# Publish the built wallet as the site's front page.
#
#   site/index.html   the wallet, with a head for search and link previews
#   site/wallet/      the images and résumé it uses; /wallet/ itself redirects to /
#
# Demo windows are pointed at the site's own demo pages, so nothing is stored twice.
import os, re, shutil, sys

S = os.path.dirname(os.path.abspath(__file__))
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(S, '..', 'site')
D = os.path.join(SITE, 'wallet')
DEMO = {'alphafold': '/alphafold/', 'backoffice': '/backoffice/demo/', 'baselayer': '/baselayer/demo/',
        'hearth': '/hearth/', 'intraweb': '/intraweb/demo/', 'smart-shelf': '/smart-shelf/'}

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>bnvac</title>
<meta name="description" content="Benjamin Vaccaro: embedded systems, RF and software. Millis High School, 2027.">
<meta property="og:site_name" content="bnvac">
<meta property="og:title" content="bnvac">
<meta property="og:description" content="Embedded systems, RF and software. Projects, experience and résumé.">
<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon-180x180.png">
<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">
<link rel="icon" type="image/png" href="/images/favicon-32x32.png" sizes="32x32">
<link rel="manifest" href="/images/manifest.json">
'''
t = open(os.path.join(S, 'index.html')).read()
t = t.replace('<meta charset="utf-8">\n<title>bnvac Wallet</title>\n', '', 1)
t = re.sub(r'<meta name="claude:[^>]*>\n?', '', t)
t, k = re.subn(r'demos/([a-z-]+)/index\.html', lambda m: DEMO[m.group(1)], t)
assert 'demos/' not in t
used = sorted(set(re.findall(r'img/[A-Za-z0-9._-]+', t)))
t = re.sub(r'(["\'(])img/', r'\1/wallet/img/', t)
t = t.replace('href="resume.pdf"', 'href="/wallet/resume.pdf"')
t = HEAD + t + '\n</html>\n'

if os.path.isdir(D): shutil.rmtree(D)
os.makedirs(os.path.join(D, 'img'))
for u in used: shutil.copy(os.path.join(S, u), os.path.join(D, u))
shutil.copy(os.path.join(S, 'resume.pdf'), D)
open(os.path.join(D, 'index.html'), 'w').write(
    '<!doctype html><meta charset="utf-8"><title>bnvac</title><link rel="canonical" href="/">'
    '<meta http-equiv="refresh" content="0; url=/"><a href="/">The wallet is the front page now.</a>\n')
open(os.path.join(SITE, 'index.html'), 'w').write(t)
print(k, 'demo links,', len(used), 'images')

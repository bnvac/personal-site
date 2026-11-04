# Copy the built wallet into the personal site as /wallet/, pointing demos at the site's own pages.
import os,re,shutil,sys
S=os.path.dirname(os.path.abspath(__file__))
D=sys.argv[1] if len(sys.argv)>1 else os.path.join(S,'..','site','wallet')
demo={'alphafold':'/alphafold/','backoffice':'/backoffice/demo/','baselayer':'/baselayer/demo/',
      'hearth':'/hearth/','intraweb':'/intraweb/demo/','smart-shelf':'/smart-shelf/'}
t=open(os.path.join(S,'index.html')).read()
t,k=re.subn(r'demos/([a-z-]+)/index\.html',lambda m:demo[m.group(1)],t)
assert 'demos/' not in t
used=set(re.findall(r'img/[A-Za-z0-9._-]+',t))
if os.path.isdir(D): shutil.rmtree(D)
os.makedirs(os.path.join(D,'img'))
for u in sorted(used): shutil.copy(os.path.join(S,u),os.path.join(D,u))
shutil.copy(os.path.join(S,'resume.pdf'),D)
open(os.path.join(D,'index.html'),'w').write(t)
print(k,'demo links,',len(used),'images')

import base64,re,json,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))  # paths below are relative to this folder
d='dl/'
def b64(p,mime): return 'data:'+mime+';base64,'+base64.b64encode(open(p,'rb').read()).decode()
s=open('template.html').read()
s=s.replace('src="PHOTO"','src="data:image/jpeg;base64,'+open('photo.b64').read()+'"')
s=s.replace('url(CMU_500)','url('+b64(d+'cmu-500-roman.woff2','font/woff2')+')').replace('url(CMU_500I)','url('+b64(d+'cmu-500-italic.woff2','font/woff2')+')').replace('url(CMU_700)','url('+b64(d+'cmu-700-roman.woff2','font/woff2')+')')
def path(name): return re.search(r'<path d="([^"]+)"',open(d+name+'.svg').read()).group(1)
tiles=''.join('<i><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="%s" d="%s"/></svg></i>'%(c,path(n)) for n,c in [('github','#fff'),('notion','#fff'),('figma','#F24E1E'),('spotify','#1DB954'),('canva','#00C4CC'),('jetbrains','#fff')])
s=s.replace('ICON_TILES',tiles)
s=s.replace('NIXOS_LOGO','<svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="nx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7EBAE4"/><stop offset="1" stop-color="#5277C3"/></linearGradient></defs><path fill="url(#nx)" d="%s"/></svg>'%path('nixos'))
photos=['img/photo-%s.jpg'%f for f in ['flight-cage','sar-backprojection','wearable-rig','blueprint-first','hackathon-cohort','lab-bench','bwsi-build-room','spot','lecture-hall']]
s=s.replace('PHOTO_THUMBS',''.join('<img src="%s" alt="">'%p for p in photos[:6]))
s=s.replace('PHOTO_LIST',json.dumps(photos))
s=s.replace('LOGO_MAP',open('logos.json').read())
open('index.html','w').write(s)
# standalone résumé page for the PDF
css=s[s.index('<style>')+7:s.index('</style>')]
cv=s[s.index('<template id="resume">')+22:s.index('</template>',s.index('<template id="resume">'))]
cv=re.sub(r'<a class="dl".*?</a>','',cv)
fonts=''.join(m for m in re.findall(r'@font-face\{[^}]+\}',css))
rule=css[css.index('.sheet{'):css.index('.sheet.photos{')]+css[css.index('.sheet.cv{'):css.index('@media (max-width:520px){.sheet.cv')]
open('resume.html','w').write('<!doctype html><meta charset="utf-8"><style>'+fonts+':root{--tex:"CMU Serif",serif}@page{size:Letter;margin:0}body{margin:0}.cv a{color:inherit;text-decoration:none}'+rule+'.sheet.cv{box-shadow:none;animation:none;max-height:none;overflow:visible;width:auto;font-size:9.5pt;line-height:1.2;padding:.36in .45in .3in}.cv header h3{font-size:22pt}.cv h4{margin-top:6px}</style><div class="sheet cv">'+cv+'</div>')
print(len(s)//1024,'KB')

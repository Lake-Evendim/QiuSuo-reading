"""Create isolated color previews from the latest site, without changing production."""
from pathlib import Path
import hashlib,json,re,sys
LAB=Path(__file__).resolve().parent
ROOT=LAB.parent
WEB=ROOT/'prototype' if (ROOT/'prototype').exists() else ROOT
web_base='../prototype/' if WEB!=ROOT else '../'
lab_base='../comfort-lab/' if WEB!=ROOT else 'comfort-lab/'
html=(WEB/'index.html').read_text(encoding='utf-8-sig')
html=html.replace('<head>','<head>\n  <base href="'+web_base+'">\n  <script src="'+lab_base+'comfort.js?v=1"></script>',1)
html=html.replace('</head>','  <link rel="stylesheet" href="'+lab_base+'comfort.css?v=1">\n</head>',1)
bar='''<section class="comfort-preview-bar" aria-label="阅读底色预览"><div class="comfort-preview-options"><strong>阅读底色预览</strong><select id="comfort-theme-site" data-comfort-picker aria-label="切换阅读底色"></select></div><nav class="comfort-preview-links" aria-label="预览页面"><a href="#channels" data-comfort-route="channels">公众号页</a><a href="#article/autoresearch/body" data-comfort-route="reader">正文页</a><a href="'''+web_base+'''#channels">返回正式阅读台</a></nav></section>'''
html=html.replace('  <main id="main"',bar+'\n  <main id="main"',1)
for name in ['app','experience']:
    html=re.sub(r'src="'+name+r'\.js(?:\?[^\"]*)?"','src="'+lab_base+'preview-'+name+'.js?v=1"',html)
    source=(WEB/(name+'.js')).read_text(encoding='utf-8-sig').replace('jianwei-','jianwei-comfort-preview-')
    (LAB/('preview-'+name+'.js')).write_text('// Generated from the current site; preview preferences are isolated.\n'+source,encoding='utf-8')
(LAB/'index.html').write_text(html,encoding='utf-8')
hashes={str(p.relative_to(WEB)):hashlib.sha256(p.read_bytes()).hexdigest() for p in WEB.rglob('*') if p.is_file()}
(LAB/'production-hashes.json').write_text(json.dumps(hashes,indent=2),encoding='utf-8')
print('Comfort preview generated. Production files were only read.')

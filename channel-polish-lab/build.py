"""Preview small adjustments to the adopted directory; never write production."""
from pathlib import Path
import hashlib, json, re

LAB = Path(__file__).resolve().parent
ROOT = LAB.parent
WEB = ROOT/'prototype' if (ROOT/'prototype').exists() else ROOT
web_base = '../prototype/' if WEB != ROOT else '../'
lab_base = '../channel-polish-lab/' if WEB != ROOT else 'channel-polish-lab/'
html = (WEB/'index.html').read_text(encoding='utf-8-sig')
html = html.replace('<head>', '<head>\n  <base href="'+web_base+'">\n  <script src="'+lab_base+'preview.js?v=1"></script>', 1)
html = html.replace('</head>', '  <link rel="stylesheet" href="'+lab_base+'polish.css?v=1">\n</head>', 1)
for name in ['app','experience']:
    html = re.sub(r'src="'+name+r'\.js(?:\?[^\"]*)?"', 'src="'+lab_base+'preview-'+name+'.js?v=1"', html)
    source = (WEB/(name+'.js')).read_text(encoding='utf-8-sig').replace('jianwei-', 'jianwei-channel-polish-preview-')
    (LAB/('preview-'+name+'.js')).write_text(source, encoding='utf-8')

source = (WEB/'channels.js').read_text(encoding='utf-8-sig')
source = source.replace('  const articles =', '''  const displayName = name => esc(name).replace(/([A-Za-z][A-Za-z0-9-]*)/g, word => '<span class="channel-latin'+(word.length>9?' channel-latin-long':'')+'">'+word+'</span>');
  const articles =''', 1)
source = source.replace('${esc(name)}</h3>${arrow}', '${displayName(name)}</h3>${arrow}')
old_header = "  window.READING_DESIGN.renderDirectoryHeader = () => '<header class=\"channel-heading\"><h1>关注的公众号</h1><p>工程实践与行业研究，沿着来源深入阅读。</p></header>';"
new_header = '''  window.READING_DESIGN.renderDirectoryHeader = () => '<header class="channel-heading"><h1>关注的公众号</h1><div class="polish-heading-side"><p>工程实践与行业研究，沿着来源深入阅读。</p><div class="polish-comparison" role="group" aria-label="公众号微调预览"><span>布局预览</span><button type="button" data-polish-mode="polish" aria-pressed="true">微调版</button><button type="button" data-polish-mode="original" aria-pressed="false">原作</button><a href="'''+web_base+'''#channels">正式页面 ↗</a></div></div></header>';'''
assert old_header in source, 'Production header changed; update the preview deliberately.'
source = source.replace(old_header, new_header, 1)
(LAB/'preview-channels.js').write_text(source, encoding='utf-8')
html = re.sub(r'src="channels\.js(?:\?[^\"]*)?"', 'src="'+lab_base+'preview-channels.js?v=1"', html)
(LAB/'index.html').write_text(html, encoding='utf-8')
baseline = LAB/'production-hashes.json'
if not baseline.exists():
    baseline.write_text(json.dumps({str(p.relative_to(WEB)):hashlib.sha256(p.read_bytes()).hexdigest() for p in WEB.rglob('*') if p.is_file()}, indent=2), encoding='utf-8')
print('Original-based polish preview generated. Production was only read.')

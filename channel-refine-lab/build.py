"""Build a reversible directory preview; production files are only read."""
from pathlib import Path
import hashlib, json, re

LAB = Path(__file__).resolve().parent
ROOT = LAB.parent
WEB = ROOT/'prototype' if (ROOT/'prototype').exists() else ROOT
web_base = '../prototype/' if WEB != ROOT else '../'
lab_base = '../channel-refine-lab/' if WEB != ROOT else 'channel-refine-lab/'
html = (WEB/'index.html').read_text(encoding='utf-8-sig')
html = html.replace('<head>', '<head>\n  <base href="'+web_base+'">\n  <script src="'+lab_base+'preview.js?v=1"></script>', 1)
html = html.replace('</head>', '<link rel="stylesheet" href="'+lab_base+'refine.css?v=1">\n</head>', 1)
bar = '''<section class="refine-preview-bar" aria-label="公众号布局预览"><strong>公众号布局预览</strong><div class="refine-version-switch" role="group" aria-label="比较布局"><button data-refine-version="refined" aria-pressed="true">优化版</button><button data-refine-version="original" aria-pressed="false">当前版</button></div><a href="'''+web_base+'''#channels">正式公众号页 ↗</a></section>'''
html = html.replace('  <main id="main"', bar+'\n  <main id="main"', 1)
for name in ['app', 'experience']:
    html = re.sub(r'src="'+name+r'\.js(?:\?[^\"]*)?"', 'src="'+lab_base+'preview-'+name+'.js?v=1"', html)
    source = (WEB/(name+'.js')).read_text(encoding='utf-8-sig').replace('jianwei-', 'jianwei-channel-refine-preview-')
    (LAB/('preview-'+name+'.js')).write_text(source, encoding='utf-8')
source = (WEB/'channels.js').read_text(encoding='utf-8-sig')
source = source.replace("  const articles =", "  const displayName = name => esc(name).replace(/([A-Za-z][A-Za-z0-9-]*)/g, word => '<span class=\"channel-latin'+(word.length>10?' channel-latin-long':'')+'\">'+word+'</span>');\n  const choice = '<svg class=\"channel-choice\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m5 12 4 4 10-10\"/></svg>';\n  const articles =", 1)
source = source.replace('${esc(name)}</h3>${arrow}', '${displayName(name)}</h3>${arrow}${choice}')
source = source.replace('<span>${reads.length} 篇</span></header>', '<div class="channel-shelf-context"><span>${reads.length} 篇</span><button type="button" class="channel-return-sources" data-return-sources>返回来源 <span aria-hidden="true">↑</span></button></div></header>')
source = source.replace("    const button = event.target.closest('[data-channel-source]');", """    const back = event.target.closest('[data-return-sources]');
    if (back) {
      const group = back.closest('[data-channel-group]');
      const source = group.querySelector('.channel-source-link.is-selected');
      const bar = document.querySelector('.journal-masthead');
      window.scrollTo({top: window.scrollY + source.getBoundingClientRect().top - bar.getBoundingClientRect().bottom - 20, behavior:'auto'});
      source.focus({preventScroll:true});
      return;
    }
    const button = event.target.closest('[data-channel-source]');""", 1)
(LAB/'preview-channels.js').write_text(source, encoding='utf-8')
html = re.sub(r'src="channels\.js(?:\?[^\"]*)?"', 'src="'+lab_base+'preview-channels.js?v=1"', html)
(LAB/'index.html').write_text(html, encoding='utf-8')
hashes = {str(p.relative_to(WEB)): hashlib.sha256(p.read_bytes()).hexdigest() for p in WEB.rglob('*') if p.is_file()}
(LAB/'production-hashes.json').write_text(json.dumps(hashes, indent=2), encoding='utf-8')
print('Directory preview generated; production files were only read.')

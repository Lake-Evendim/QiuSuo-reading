"""Build a body-only Song preview; production is read, never written."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
import hashlib, json, re, sys

sys.stdout.reconfigure(encoding='utf-8')
LAB = Path(__file__).resolve().parent
ROOT = LAB.parent
WEB = ROOT/'prototype' if (ROOT/'prototype').exists() else ROOT
web_base = '../prototype/' if WEB != ROOT else '../'
lab_base = '../body-serif-lab/' if WEB != ROOT else 'body-serif-lab/'
font_dir = LAB/'assets/fonts'
font_dir.mkdir(parents=True, exist_ok=True)
data = json.loads((WEB/'data.js').read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'))
text = ''.join(str(b.get('text','')) + str(b.get('caption','')) for a in data['articles'] for b in a['blocks'])
text += ''.join(chr(c) for c in range(32,127)) + '霞鹜致宋原宋体正文预览'
characters = {ord(c) for c in text}
font = TTFont(LAB/'sources/LXGWZhiSongCL.ttf')
supported = set(font.getBestCmap())
missing = characters - supported
chinese_missing = {cp for cp in missing if 0x3400 <= cp <= 0x9fff or 0x20000 <= cp <= 0x323af}
assert not chinese_missing, '正文缺字：' + ''.join(chr(c) for c in sorted(chinese_missing))
font.recalcTimestamp = False
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
sub = subset.Subsetter(options=options)
sub.populate(unicodes=characters & supported)
sub.subset(font)
family = 'Jianwei Body Song Preview'
for record in font['name'].names:
    if record.nameID in {1,3,4,6,16}:
        record.string = (family.replace(' ','') if record.nameID == 6 else family).encode(record.getEncoding(),errors='replace')
font.flavor = 'woff2'
target = font_dir/'body-song.woff2'
font.save(target)
(font_dir/'coverage.json').write_text(json.dumps({'chineseMissing':[], 'otherMissing':[f'U+{c:04X}' for c in sorted(missing)], 'bodyCharacters':len(characters), 'bytes':target.stat().st_size},indent=2),encoding='utf-8')
html = (WEB/'index.html').read_text(encoding='utf-8-sig')
html = html.replace('<head>', '<head>\n  <base href="'+web_base+'">\n  <script src="'+lab_base+'preview.js?v=1"></script>\n  <link rel="preload" href="'+lab_base+'assets/fonts/body-song.woff2?v=1" as="font" type="font/woff2" crossorigin>', 1)
html = html.replace('</head>', '  <link rel="stylesheet" href="'+lab_base+'body-serif.css?v=1">\n</head>',1)
html = re.sub(r'<span class="reader-brand"[\s\S]*?</span>(?=\s*<span id="current-reading-title")', '<label class="body-font-picker"><span class="visually-hidden">正文宋体预览</span><select id="body-font-preview" aria-label="正文宋体预览"><option value="zhisong">霞鹜致宋 · 18</option><option value="original">原宋体 · 18</option></select></label>', html, count=1)
html = html.replace('返回简报', '返回阅读台')
html = html.replace('<button id="reset-reading"', '<p class="font-license-link"><a href="'+lab_base+'font-info.html" target="_blank" rel="noopener noreferrer">预览字体与授权说明 ↗</a></p>\n      <button id="reset-reading"',1)
for name in ['app','experience']:
    html = re.sub(r'src="'+name+r'\.js(?:\?[^\"]*)?"', 'src="'+lab_base+'preview-'+name+'.js?v=1"',html)
    source = (WEB/(name+'.js')).read_text(encoding='utf-8-sig').replace('jianwei-', 'jianwei-body-serif-preview-')
    if name == 'app':
        source = source.replace(",.type-preview-picker", ",.body-font-picker")
    (LAB/('preview-'+name+'.js')).write_text(source,encoding='utf-8')
(LAB/'index.html').write_text(html,encoding='utf-8')
baseline = LAB/'production-hashes.json'
if not baseline.exists():
    baseline.write_text(json.dumps({str(p.relative_to(WEB)):hashlib.sha256(p.read_bytes()).hexdigest() for p in WEB.rglob('*') if p.is_file()},indent=2),encoding='utf-8')
print('Font preview built:', target.stat().st_size, 'bytes;', len(characters), 'characters; Chinese missing: 0')

"""Build outline layout/font rounds and an isolated preview from the current reader."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
LAB=Path(__file__).resolve().parent
ROOT=LAB.parent
WEB=ROOT/'prototype' if (ROOT/'prototype').exists() else ROOT
FONT_DIR=LAB/'assets/fonts'
FONT_DIR.mkdir(parents=True,exist_ok=True)
data=json.loads((WEB/'data.js').read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'))
text=''.join(p.read_text(encoding='utf-8-sig') for p in LAB.glob('*') if p.suffix in {'.js','.css','.html'})
text+=''.join(a['title']+a['account']+''.join(b['text'] for b in a['blocks'] if b['type']=='heading') for a in data['articles'])
text+='目录排版方案目录字体预览预览批次六套目录方案沿用紧凑排版比较六种字形与清晰度本轮字体上轮排版宋体参照同一篇原文六种字体与章节秩序样例文章当前章节展开全部小节只展开当前章参考目录宽度正文预览返回比较返回阅读台切换目录方案章小节阅读进度'+''.join(chr(cp) for cp in range(32,127))
characters={ord(c) for c in text}
specs=[
 ('Sans',Path('C:/Windows/Fonts/NotoSansSC-VF.ttf'),None,None),
 ('Serif',Path('C:/Windows/Fonts/NotoSerifSC-VF.ttf'),None,None),
 ('Hei',ROOT/'font-sources/ChironHeiHK[wght].ttf','ChironHei-OFL.txt',500),
 ('Round',ROOT/'font-sources/ChironGoRoundTC[wght].ttf','ChironGoRound-OFL.txt',500),
 ('Condensed',ROOT/'font-sources/GlowCompressed.otf','GlowSans-OFL.txt',800),
 ('Mono',ROOT/'font-sources/SarasaMonoSC.ttf','SarasaMono-OFL.txt',400),
 ('XiaoWei',ROOT/'font-sources/ZCOOLXiaoWei.ttf','ZCOOLXiaoWei-OFL.txt',400),
 ('Smiley',ROOT/'font-sources/SmileySans.ttf','SmileySans-OFL.txt',400),
 ('QingKe',ROOT/'font-sources/ZCOOLQingKeHuangYou.ttf','ZCOOLQingKeHuangYou-OFL.txt',400),
 ('Wide',ROOT/'font-sources/GlowWide.otf','GlowSans-OFL.txt',800),
 ('Plex',ROOT/'font-sources/IBMPlexSansSC-Medium.ttf','IBMPlexSansSC-OFL.txt',500),
 ('Sung',ROOT/'font-sources/ChironSungHK[wght].ttf','ChironSung-OFL.txt',500),
]
faces=[];licenses=[];coverage={}
for name,source,license_file,weight in specs:
    font=TTFont(source);supported=set(font.getBestCmap())
    missing=characters-supported
    chinese_missing={cp for cp in missing if 0x2e80<=cp<=0x9fff}
    if chinese_missing:raise ValueError(f'{name} 缺字：'+''.join(chr(cp) for cp in sorted(chinese_missing)))
    variable=name in {'Hei','Round','Sung'}
    limits={a.axisTag:((400,500,600) if variable else weight) if a.axisTag=='wght' else a.defaultValue for a in font['fvar'].axes} if weight and 'fvar' in font else None
    font.recalcTimestamp=False
    options=subset.Options();options.flavor='woff2';options.layout_features=['*']
    sub=subset.Subsetter(options=options);sub.populate(unicodes=characters&supported);sub.subset(font)
    if limits:font=instantiateVariableFont(font,limits,inplace=True)
    family='Jianwei Outline '+name
    for record in font['name'].names:
        if record.nameID in {1,3,4,6,16}:
            record.string=(family.replace(' ','') if record.nameID==6 else family).encode(record.getEncoding(),errors='replace')
    if 'CFF ' in font:
        cff=font['CFF '].cff;cff.fontNames=[family.replace(' ','')]
        cff.topDictIndex[0].FamilyName=family;cff.topDictIndex[0].FullName=family
    font.flavor='woff2';target=FONT_DIR/(name.lower()+'.woff2');font.save(target)
    faces.append(f'@font-face{{font-family:"Outline {name}";src:url("assets/fonts/{name.lower()}.woff2?v=6") format("woff2");font-weight:{"400 600" if variable else weight if weight else "100 900"};font-display:swap}}')
    licenses.append(source.name+'\n'+((ROOT/'font-sources'/license_file).read_text(encoding='utf-8') if license_file else '\n'.join(n.toUnicode() for n in font['name'].names if n.nameID in {0,13,14} and n.platformID==3)))
    coverage[name]={'bytes':target.stat().st_size,'chineseMissing':[],'otherMissing':[f'U+{cp:04X}' for cp in sorted(missing)]}
    print(name,target.stat().st_size,'bytes')
(LAB/'fonts.css').write_text('\n'.join(faces)+'\n',encoding='utf-8')
(FONT_DIR/'LICENSE.txt').write_text('\n\n'.join(licenses),encoding='utf-8')
(FONT_DIR/'coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')
web_base='../prototype/' if WEB!=ROOT else '../'
lab_base='../outline-lab/' if WEB!=ROOT else 'outline-lab/'
html=(WEB/'index.html').read_text(encoding='utf-8-sig')
html=html.replace('<head>','<head>\n  <base href="'+web_base+'">',1)
html=html.replace('</head>',f'  <link rel="stylesheet" href="{lab_base}fonts.css?v=6">\n  <link rel="stylesheet" href="{lab_base}outline-lab.css?v=6">\n  <script src="{lab_base}variants.js?v=6" defer></script>\n  <script src="{lab_base}preview.js?v=6" defer></script>\n</head>',1)
def preview_body(match):
    attrs=match.group(1)
    old_class=re.search(r'class="([^"]*)"',attrs)
    classes=old_class.group(1) if old_class else ''
    attrs=re.sub(r'\s*class="[^"]*"','',attrs)
    return f'<body{attrs} class="outline-reader {classes}" data-outline-index="{lab_base}">'
html=re.sub(r'<body\b([^>]*)>',preview_body,html,count=1)
assert 'class="outline-reader' in html
html=re.sub(r'<span class="reader-brand"[\s\S]*?</span>(?=\s*<span id="current-reading-title")', '<label class="type-preview-picker outline-preview-picker"><span class="visually-hidden">目录排版方案</span><select id="outline-variant" aria-label="切换目录方案"></select></label>',html,count=1)
html=html.replace('<span class="reader-back-label">返回简报</span>','<span class="reader-back-label">返回比较</span>',1).replace('aria-label="返回简报"','aria-label="返回比较"',1)
html=re.sub(r'src="app\.js(?:\?[^\"]*)?"',f'src="{lab_base}preview-app.js?v=6"',html)
html=re.sub(r'src="experience\.js(?:\?[^\"]*)?"',f'src="{lab_base}preview-experience.js?v=6"',html)
assert 'preview-app.js' in html
(LAB/'reading.html').write_text(html,encoding='utf-8')
app=(WEB/'app.js').read_text(encoding='utf-8-sig')
for key in ['outline','reading','saved']:app=app.replace('jianwei-'+key,'jianwei-outline-preview-'+key)
app=app.replace(',.type-preview-picker','')
app=app.replace("controls=[document.querySelector('#toc-toggle'),...panel.querySelectorAll('button')]", "controls=[document.querySelector('#toc-toggle'),document.querySelector('#outline-variant'),...panel.querySelectorAll('button')]")
(LAB/'preview-app.js').write_text('// Generated from the current reader; preview preferences are isolated.\n'+app,encoding='utf-8')
experience=(WEB/'experience.js').read_text(encoding='utf-8-sig')
for key in ['motion','progress']:experience=experience.replace('jianwei-'+key,'jianwei-outline-preview-'+key)
(LAB/'preview-experience.js').write_text('// Generated from the current reading experience.\n'+experience,encoding='utf-8')
overview=f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>求索 · 目录字体预览</title><link rel="stylesheet" href="fonts.css?v=6"><link rel="stylesheet" href="outline-lab.css?v=6"><script src="{web_base}data.js?v=20261109" defer></script><script src="variants.js?v=6" defer></script><script src="overview.js?v=6" defer></script></head>
<body class="outline-comparison"><main class="lab-shell"><div class="comparison-top"><a href="{web_base}#home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>返回阅读台</a><span>参考目录宽度 256px</span></div><header class="comparison-title"><h1>目录字体预览</h1><p>六种字形，统一层级与紧凑间距。点击正文预览，查看实际阅读效果。</p></header><div class="comparison-rounds" role="group" aria-label="预览批次"><button data-round="refined" aria-pressed="true">新字体 M–R</button><button data-round="fonts" aria-pressed="false">之前字体</button><button data-round="layout" aria-pressed="false">早期排版</button><a id="serif-reference" href="reading.html?revision=6&amp;outline=a&amp;round=fonts#article/autoresearch/body">宋体参照</a></div><div class="comparison-controls"><label><span>样例文章</span><select id="sample-picker" aria-label="切换样例文章"></select></label><label><span>当前章节</span><select id="chapter-picker" aria-label="切换当前章节"></select></label><button id="expand-all" aria-pressed="false">展开全部小节</button></div><div class="sample-context"><p id="sample-title"></p><p id="sample-meta"></p></div><section id="outline-options" aria-label="六套目录方案"></section><p class="comparison-note">目录可独立滚动、切换章节。点击「正文预览」，比较目录与正文的关系。</p></main></body></html>'''
(LAB/'index.html').write_text(overview,encoding='utf-8')
print('六套目录与正文预览已生成，正式页面和阅读偏好不变。')

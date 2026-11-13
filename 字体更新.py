"""新增文章或界面文字后，运行本脚本重建本地字体子集。依赖 fontTools[woff]。"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import json

ROOT = Path(__file__).resolve().parent
WEB = ROOT / 'prototype' if (ROOT / 'prototype').exists() else ROOT
FONT_DIR = WEB / 'assets' / 'fonts'
FONT_DIR.mkdir(parents=True, exist_ok=True)
text = ''.join(p.read_text(encoding='utf-8-sig') for p in WEB.glob('*') if p.suffix in {'.html','.js','.css'})
for folder in ('design-lab', 'color-lab', 'type-lab'):
    lab = WEB.parent / folder
    if lab.exists():
        text += ''.join(p.read_text(encoding='utf-8-sig') for p in lab.glob('*') if p.suffix in {'.html','.js','.css'})
text += ''.join(chr(n) for n in range(32,127)) + '已收藏暂未加载切换正文开头配图宋体黑体减小增大返回今天昨天星期一二三四五六日年月篇'
licenses = []
for name, filename in [('sans','NotoSansSC-VF.ttf'), ('serif','NotoSerifSC-VF.ttf')]:
    source = Path('C:/Windows/Fonts') / filename
    if not source.exists():
        source = ROOT / 'font-sources' / filename
    if not source.exists(): raise FileNotFoundError(f'未找到 {filename}，请安装对应的 Noto SC 字体或放入 font-sources。')
    font = TTFont(source)
    licenses.append(filename+'\n'+'\n'.join(n.toUnicode() for n in font['name'].names if n.nameID in {0,13,14} and n.platformID==3))
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(text=text)
    sub.subset(font)
    font.flavor = 'woff2'
    target = FONT_DIR / f'reading-{name}.woff2'
    font.save(target)
    print(f'{target.name}: {target.stat().st_size:,} bytes')
(FONT_DIR/'LICENSE.txt').write_text('\n\n'.join(licenses),encoding='utf-8')

# Separate Chinese and Latin faces give publisher names their own identity.
data = json.loads((WEB/'data.js').read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'))
publisher_text = ''.join(account for group in data['groups'] for account in group['accounts'])
publisher_licenses = []
for name,filename,license_name,weight,allowed in [
    ('chinese','SmileySans.ttf','SmileySans-OFL.txt',400,lambda cp: 0x2e80<=cp<=0x9fff or 0xf900<=cp<=0xfaff),
    ('latin','Syne.ttf','Syne-OFL.txt',700,lambda cp: cp<=0x024f),
]:
    font_source = ROOT/'font-sources'/filename
    font = TTFont(font_source)
    characters = {ord(c) for c in publisher_text if allowed(ord(c))}
    cmap = font.getBestCmap()
    missing = characters - set(cmap)
    if missing: raise ValueError(f'{filename}缺少来源名称字符：{[chr(cp) for cp in missing]}')
    if 'fvar' in font:
        limits={a.axisTag:weight if a.axisTag=='wght' else a.defaultValue for a in font['fvar'].axes}
        font=instantiateVariableFont(font,limits,inplace=True)
    font.recalcTimestamp=False
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=characters)
    sub.subset(font)
    family='Jianwei Publisher '+name.title()
    for record in font['name'].names:
        if record.nameID in {1,3,4,6,16}:
            record.string=(family.replace(' ','') if record.nameID==6 else family).encode(record.getEncoding(),errors='replace')
    font.flavor = 'woff2'
    target = FONT_DIR/f'publisher-{name}.woff2'
    font.save(target)
    publisher_licenses.append(filename+'\n'+(ROOT/'font-sources'/license_name).read_text(encoding='utf-8'))
    print(f'{target.name}: {target.stat().st_size:,} bytes')
(FONT_DIR/'publisher-LICENSE.txt').write_text('\n\n'.join(publisher_licenses),encoding='utf-8')

import runpy
runpy.run_path(str(ROOT/'目录字体更新.py'),run_name='__main__')

lab_builder=ROOT/'type-lab'/'build.py'
if lab_builder.exists():
    import runpy
    runpy.run_path(str(lab_builder),run_name='__main__')

"""只构建新旧简报对照的字体，不修改正式字体。"""
from pathlib import Path
import json
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'assets'
ASSETS.mkdir(exist_ok=True)
text = ''.join(p.read_text(encoding='utf-8-sig') for p in ROOT.iterdir()
               if p.is_file() and p.suffix in {'.html', '.css', '.js', '.json'})
text += ''.join(chr(cp) for cp in range(32, 127))
characters = {ord(c) for c in text if not c.isspace()}
licenses, coverage = [], {}
for face, filename in [('sans', 'NotoSansSC-VF.ttf'), ('serif', 'NotoSerifSC-VF.ttf')]:
    source = Path('C:/Windows/Fonts') / filename
    if not source.exists():
        source = ROOT.parent / 'font-sources' / filename
    font = TTFont(source)
    cmap = font.getBestCmap()
    missing = [chr(cp) for cp in sorted(characters - set(cmap)) if cp >= 0x2e80]
    if missing:
        raise ValueError(f'{filename}中文缺字: {missing}')
    licenses.append(str(source) + '\n' + '\n'.join(dict.fromkeys(
        n.toUnicode() for n in font['name'].names
        if n.nameID in {0, 13, 14} and n.platformID == 3)))
    font.recalcTimestamp = False
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    sub = subset.Subsetter(options=options)
    sub.populate(text=text)
    sub.subset(font)
    font.flavor = 'woff2'
    target = ASSETS / f'preview-{face}.woff2'
    font.save(target)
    coverage[face] = {'source': str(source), 'chineseMissing': missing, 'bytes': target.stat().st_size}
(ASSETS / 'font-LICENSE.txt').write_text('\n\n'.join(licenses), encoding='utf-8')
(ASSETS / 'font-coverage.json').write_text(json.dumps(coverage, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(coverage, ensure_ascii=False))

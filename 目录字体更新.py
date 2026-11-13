"""Build the adopted N outline face from Noto Sans SC, with real 400–600 weights."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import json, sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(__file__).resolve().parent
WEB=ROOT/'prototype' if (ROOT/'prototype').exists() else ROOT
FONT_DIR=WEB/'assets/fonts'
data=json.loads((WEB/'data.js').read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'))
text='文章目录文章开头按原文顺序阅读章小节阅读进度…'+''.join(chr(cp) for cp in range(32,127))
text+=''.join(b['text'] for a in data['articles'] for b in a['blocks'] if b['type']=='heading')
source=ROOT/'font-sources/NotoSansSC-VF.ttf'
if not source.exists(): source=Path('C:/Windows/Fonts/NotoSansSC-VF.ttf')
font=TTFont(source)
license_text='\n'.join(dict.fromkeys(n.toUnicode() for n in font['name'].names if n.nameID in {0,13,14} and n.platformID==3))
characters={ord(c) for c in text}
supported=set(font.getBestCmap())
missing=characters-supported
if missing: raise ValueError('目录字体缺字：'+''.join(chr(cp) for cp in sorted(missing)))
font.recalcTimestamp=False
options=subset.Options();options.flavor='woff2';options.layout_features=['*']
sub=subset.Subsetter(options=options);sub.populate(unicodes=characters);sub.subset(font)
limits={a.axisTag:(400,500,600) if a.axisTag=='wght' else a.defaultValue for a in font['fvar'].axes}
font=instantiateVariableFont(font,limits,inplace=True)
family='Jianwei Reader Outline Sans'
for record in font['name'].names:
    if record.nameID in {1,3,4,6,16}:
        record.string=(family.replace(' ','') if record.nameID==6 else family).encode(record.getEncoding(),errors='replace')
font.flavor='woff2'
target=FONT_DIR/'outline-sans.woff2';font.save(target)
(FONT_DIR/'outline-sans-LICENSE.txt').write_text(source.name+'\n'+license_text,encoding='utf-8')
(FONT_DIR/'outline-sans-coverage.json').write_text(json.dumps({'font':'Noto Sans SC','variant':'N 清晰索引','weights':[400,500,600],'characters':len(characters),'missing':[],'bytes':target.stat().st_size},ensure_ascii=False,indent=2),encoding='utf-8')
print(f'正式目录 N 思源黑体：{target.stat().st_size:,} bytes，{len(characters)} 字符无缺字。')

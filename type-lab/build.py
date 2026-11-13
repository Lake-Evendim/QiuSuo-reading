"""Rebuild local font specimens and the reading preview from the current edition."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
import json,re

LAB=Path(__file__).resolve().parent
ROOT=LAB.parent
WEB=ROOT/'prototype' if (ROOT/'prototype').exists() else ROOT
FONT_DIR=LAB/'assets/fonts'
FONT_DIR.mkdir(parents=True,exist_ok=True)
data=json.loads((WEB/'data.js').read_text(encoding='utf-8-sig').split('=',1)[1].strip().rstrip(';'))
publisher_text=''.join(account for group in data['groups'] for account in group['accounts'])
chinese={ord(c) for c in publisher_text if 0x2e80<=ord(c)<=0x9fff or 0xf900<=ord(c)<=0xfaff}
latin=set(range(32,127))
specs=[
 ('XiaoWei','ZCOOLXiaoWei.ttf','ZCOOLXiaoWei-OFL.txt',400,chinese),
 ('HuangYou','ZCOOLQingKeHuangYou.ttf','ZCOOLQingKeHuangYou-OFL.txt',400,chinese),
 ('Cinzel','Cinzel.ttf','Cinzel-OFL.txt',500,latin),
 ('Bodoni','BodoniModa.ttf','BodoniModa-OFL.txt',700,latin),
 ('Baskerville','LibreBaskerville.ttf','LibreBaskerville-OFL.txt',700,latin),
 ('Space','SpaceGrotesk-SemiBold.ttf','SpaceGrotesk-OFL.txt',600,latin),
 ('Smiley','SmileySans.ttf','SmileySans-OFL.txt',400,chinese),
 ('Round','ChironGoRound.ttf','ChironGoRound-OFL.txt',600,chinese),
 ('Compressed','GlowCompressed.otf','GlowSans-OFL.txt',800,chinese),
 ('Wide','GlowWide.otf','GlowSans-OFL.txt',700,chinese),
 ('Pixel','FusionPixel12.ttf','FusionPixel12-OFL.txt',400,chinese),
 ('Mono','SarasaMonoSC.ttf','SarasaMono-OFL.txt',400,chinese),
 ('Hei','ChironHei.ttf','ChironHei-OFL.txt',900,chinese),
 ('Syne','Syne.ttf','Syne-OFL.txt',700,latin),
 ('Outfit','Outfit.ttf','Outfit-OFL.txt',600,latin),
 ('Bebas','BebasNeue.ttf','BebasNeue-OFL.txt',400,latin),
 ('Unbounded','Unbounded.ttf','Unbounded-OFL.txt',600,latin),
 ('Pixelify','PixelifySans.ttf','PixelifySans-OFL.txt',400,latin),
 ('PlexMono','IBMPlexMono.ttf','IBMPlexMono-OFL.txt',500,latin),
 ('Italiana','Italiana.ttf','Italiana-OFL.txt',400,latin),
 ('Archivo','ArchivoBlack.ttf','ArchivoBlack-OFL.txt',400,latin),
]
faces=[];licenses=[]
for name,file,license_file,weight,characters in specs:
    font=TTFont(ROOT/'font-sources'/file)
    missing=characters-set(font.getBestCmap())
    if missing:raise ValueError(f'{name}缺字：{[chr(cp) for cp in sorted(missing)]}')
    if 'fvar' in font:
        limits={a.axisTag:weight if a.axisTag=='wght' else a.defaultValue for a in font['fvar'].axes}
        font=instantiateVariableFont(font,limits,inplace=True)
    font.recalcTimestamp=False
    options=subset.Options();options.flavor='woff2';options.layout_features=['*']
    sub=subset.Subsetter(options=options);sub.populate(unicodes=characters);sub.subset(font)
    family='Jianwei Lab '+name
    for record in font['name'].names:
        if record.nameID in {1,3,4,6,16}:record.string=(family.replace(' ','') if record.nameID==6 else family).encode(record.getEncoding(),errors='replace')
    if 'CFF ' in font:
        cff=font['CFF '].cff
        cff.fontNames=[family.replace(' ','')]
        cff.topDictIndex[0].FamilyName=family
        cff.topDictIndex[0].FullName=family
    font.flavor='woff2';target=FONT_DIR/(name.lower()+'.woff2');font.save(target)
    unicode='U+2E80-9FFF,U+F900-FAFF' if characters is chinese else 'U+0000-024F'
    faces.append(f'@font-face{{font-family:"Lab {name}";src:url("assets/fonts/{name.lower()}.woff2") format("woff2");font-weight:{weight};font-display:swap;unicode-range:{unicode}}}')
    licenses.append(file+'\n'+(ROOT/'font-sources'/license_file).read_text(encoding='utf-8'))
    print(name,target.stat().st_size,'bytes')
variants=[
 ('g','"Lab Syne","Lab Smiley",var(--sans)',400,22,'.01em',38),
 ('h','"Lab Outfit","Lab Round",var(--sans)',400,20,'.03em',35),
 ('i','"Lab Bebas","Lab Compressed",var(--sans)',400,24,'.045em',44),
 ('j','"Lab Unbounded","Lab Wide",var(--sans)',400,19,'.015em',32),
 ('k','"Lab Pixelify","Lab Pixel",var(--sans)',400,24,'0',36),
 ('l','"Lab PlexMono","Lab Mono",monospace',400,19,'.06em',32),
 ('m','"Lab Italiana","Reading Serif",serif',300,22,'.085em',36),
 ('n','"Lab Archivo","Lab Hei",var(--sans)',400,20,'.02em',34),
 ('a','"Lab Cinzel","Lab XiaoWei",var(--sans)',400,20,'.03em',36),
 ('c','"Lab Bodoni","Lab HuangYou",var(--sans)',400,21,'.035em',36),
 ('e','"Lab Baskerville","Reading Serif",serif',800,19,'.06em',34),
 ('f','"Lab Space","Reading Sans",sans-serif',750,18,'.02em',32),
]
for id,family,weight,size,tracking,display in variants:
    faces.append(f'html[data-font-variant={id}],.type-option[data-font-variant={id}]{{--type-family:{family};--type-weight:{weight};--type-size:{size}px;--type-tracking:{tracking};--type-display-size:{display}px}}')
(LAB/'fonts.css').write_text('\n'.join(faces)+'\n',encoding='utf-8')
(FONT_DIR/'LICENSE.txt').write_text('\n\n'.join(licenses),encoding='utf-8')
(FONT_DIR/'pixel-component-licenses.txt').write_text((ROOT/'font-sources/FusionPixel12-component-licenses.txt').read_text(encoding='utf-8'),encoding='utf-8')

web_base='../prototype/' if WEB!=ROOT else '../'
lab_base='../type-lab/' if WEB!=ROOT else 'type-lab/'
html=(WEB/'index.html').read_text(encoding='utf-8-sig')
html=html.replace('<head>','<head>\n  <base href="'+web_base+'">',1)
html=html.replace('</head>',f'  <link rel="stylesheet" href="{lab_base}fonts.css?v=5">\n  <link rel="stylesheet" href="{lab_base}type-lab.css?v=6">\n  <script src="{lab_base}variants.js?v=5" defer></script>\n  <script src="{lab_base}preview.js?v=5" defer></script>\n</head>',1)
html=html.replace('<body>',f'<body class="type-reader" data-type-index="{lab_base}">',1)
html=html.replace('<span class="reader-back-label">返回简报</span>','<span class="reader-back-label preview-back-label">返回比较</span>',1)
html=html.replace('aria-label="返回简报"','aria-label="返回比较"',1)
html=re.sub(r'<span class="reader-brand"[\s\S]*?</span>(?=\s*<span id="current-reading-title")',
 '<label class="type-preview-picker"><span class="visually-hidden">来源字体方案</span><select id="font-variant" aria-label="切换来源字体方案"></select><small id="font-size-info"></small></label>',html,count=1)
(LAB/'reading.html').write_text(html,encoding='utf-8')
if WEB==ROOT:
    overview=LAB/'index.html'
    overview.write_text(overview.read_text(encoding='utf-8-sig').replace('../prototype/','../'),encoding='utf-8')

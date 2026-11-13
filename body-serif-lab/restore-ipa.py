"""Restore the preview to an unmodified original IPA font supplied by the user."""
from pathlib import Path
from fontTools.ttLib import TTFont
import shutil,sys

lab=Path(__file__).resolve().parent
source=Path(sys.argv[1]).resolve()
font=TTFont(source)
names=' '.join(n.toUnicode() for n in font['name'].names if n.nameID in {1,4,6})
assert 'IPA' in names, 'Please provide an original IPAex Mincho or IPAmj Mincho TTF.'
target=lab/'assets/fonts/ipa-original.ttf'
target.parent.mkdir(parents=True,exist_ok=True)
shutil.copy2(source,target)
css=lab/'body-serif.css'
text=css.read_text(encoding='utf-8')
text=text.replace('url("assets/fonts/body-song.woff2?v=1") format("woff2")','url("assets/fonts/ipa-original.ttf?v=1") format("truetype")')
css.write_text(text,encoding='utf-8')
print('Original font copied without modification. Reload the preview with Ctrl+F5.')

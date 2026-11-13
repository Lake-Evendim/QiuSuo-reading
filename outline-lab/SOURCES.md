# 新一轮字体 M–R

M使用IBM官方npm包@ibm/plex-sans-sc 1.1.0内完整Medium WOFF，由fontTools解压为TTF源，再制作独立目录子集；使用实际500字重，不模拟400或600。O使用Google Fonts官方仓库昭源宋体Chiron Sung HK的可变字体，目录保留400–600范围并实际使用600/500。两者原件与OFL均保存在font-sources，子集家族重命名为Jianwei Outline Plex/Sung，完整授权随assets/fonts/LICENSE.txt交付。

- IBM官方包：https://registry.npmjs.org/@ibm/plex-sans-sc/-/plex-sans-sc-1.1.0.tgz
- 昭源宋体：https://github.com/google/fonts/tree/main/ofl/chironsunghk

N、P、Q、R使用已有授权原件NotoSansSC-VF.ttf、ZCOOLXiaoWei.ttf、SarasaMonoSC.ttf、ChironGoRoundTC[wght].ttf；所有字重均为字体真实字重。build.py按全部14篇原文章节、标题及预览文字构建woff2，检查中文缺字，报告位于assets/fonts/coverage.json。正文与来源G字体保持。

# 目录候选字体

本轮G–L沿用已经保留的授权原件：G为Noto Sans SC可变600/500，H/I为Chiron Hei与Chiron GoRound可变600/500，J为SmileySans.ttf原件400，K为ZCOOLQingKeHuangYou.ttf原件400，L为GlowWide.otf原件800。所有目录级别使用同一字体；字体无法提供的字重不模拟加粗。对应OFL与重命名后的子集授权保存在assets/fonts/LICENSE.txt。

Smiley、庆科和Glow宽体的原件与授权均在font-sources，保留SmileySans-OFL.txt、ZCOOLQingKeHuangYou-OFL.txt、GlowSans-OFL.txt。G和H/I沿用下述官方字体来源。中文与拉丁字形均来自同一候选；正式正文来源字体保持原样。

A使用本机已安装的Noto Serif SC可变字体，主章600、小节及章号500，目录计数、开头入口和进度统一宋体500。预览界面辅助文字仍使用Noto Sans SC；字体授权记录随子集保存。

B/C使用Google Fonts官方仓库的可变字体原件，字重保留400–600。原项目的Chiron静态文件分别为900和600，未用于模拟较轻字重。

- https://github.com/google/fonts/tree/main/ofl/chironheihk
- https://github.com/google/fonts/tree/main/ofl/chirongoroundtc

原件为font-sources/ChironHeiHK[wght].ttf及ChironGoRoundTC[wght].ttf，OFL沿用对应项目授权原文。

D/E/F沿用项目已经保存的GlowCompressed.otf、SarasaMonoSC.ttf、ZCOOLXiaoWei.ttf及各自OFL。Glow为实际800字重，更纱和小薇为400。

build.py按照四篇真实标题与预览文字生成本地woff2，校验中文字形覆盖，并重新命名字体家族。LICENSE.txt及coverage.json位于assets/fonts。换字体只在目录候选中发生；正文与已选G来源字标沿用正式版本。

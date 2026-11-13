# 非手写字体：第二轮八个新方向

用户要求“不要书写感，多搞不同方向”。最新比较页默认展示G–N八套新搭配；上一轮A/C/E/F四套非手写方案保留单独对照。B草书题签和D长卷墨迹已撤出比较页与正文选择器。用户已采用G「斜切未来」，正式来源字体使用得意黑／Syne，与预览中的字号和字距一致；G卡片标记“已采用”。

| 新方案 | 中文／英文 | 正文来源名 | 方向 |
|---|---|---|---|
| G 斜切未来 | 得意黑／Syne | 22px | 切角、几何倾斜 |
| H 圆体装置 | 昭源圆体／Outfit | 20px | 圆角、柔和几何 |
| I 极窄铭牌 | 未来荧黑Compressed／Bebas Neue | 24px | 原生窄字形、工业标牌 |
| J 宽体构筑 | 未来荧黑Wide／Unbounded | 19px | 原生宽字形、建筑结构 |
| K 像素栅格 | Fusion Pixel 12／Pixelify Sans | 24px | 正交像素、数字趣味 |
| L 等宽机芯 | 更纱等宽黑体／IBM Plex Mono | 19px | 等宽、精密工程 |
| M 纤细印刷 | 思源宋体300／Italiana | 22px | 细笔、高对比印刷 |
| N 方形重黑 | 昭源黑体极粗／Archivo Black | 20px | 方形、实体重量 |

桌面1120px以上四列两排，较窄桌面三列或两列，手机单列。标题和原文段落在卡片里收紧，强调字形对照；正文仅来源名改变。像素来源名在手机也保留24px，维持12px整数倍。比较页和正文中的来源名都使用通用汉字短组及拉丁串保全，避免把ModelScope断开或留下孤立汉字；不改变账号文字。

新增字体与授权来自官方来源：[得意黑](https://github.com/atelier-anchor/smiley-sans/releases/tag/v2.0.1)、[未来荧黑](https://github.com/welai/glow-sans/releases/tag/v0.93)、[Fusion Pixel](https://github.com/TakWolf/fusion-pixel-font/releases/tag/2026.10.25)、[更纱黑体](https://github.com/be5invis/Sarasa-Gothic/releases/tag/v1.0.43)、[Google Fonts](https://github.com/google/fonts/tree/main/ofl)中的chirongoroundtc、chironheihk、syne、outfit、bebasneue、unbounded、pixelifysans、ibmplexmono、italiana、archivoblack。均保存OFL；GlowSans使用字体的OFL.txt，不能误用构建工具MIT LICENSE。像素字体的各组件授权另存pixel-component-licenses.txt。

构建器检查所有17来源名称的字形覆盖，将可变拉丁字体实例化为所选字重，重命名预览子集内部名称及CFF名称，避免保留字体名限制。原件保存在font-sources，全部通过字形覆盖检查。

本轮截图：D:\Codex\2026-10-28\xian-z\outputs\非手写字体八方案。备份：work\before-nonhand-fonts。下方为第一轮历史记录，其中B/D已撤出当前候选。

# 第一轮来源字体六方案（历史记录）

打开 http://127.0.0.1:8807/type-lab/ 。本轮按用户要求提供多套来源名称字体预览，当前正式阅读台仍采用原来的马善政／Cormorant搭配。选定后再修改正式 `prototype/source-type.css`。

| 方案 | 中文／英文 | 正文来源名 | 设计方向 |
|---|---|---|---|
| A 刀刻宋意 | 站酷小薇／Cinzel | 20px | 削切收笔，古典刊物题名 |
| B 草书题签 | 刘建毛草／Cormorant Garamond | 24px | 奔放连笔，书家题签 |
| C 海报字标 | 站酷庆科黄油／Bodoni Moda | 21px | 厚实收紧，艺术海报 |
| D 长卷墨迹 | 龙藏体／Caveat | 25px | 疏朗手写，长卷落款 |
| E 藏书刊名 | 思源宋体800／Libre Baskerville | 19px | 粗宋铅字，出版气质 |
| F 当代字标 | 思源黑体750／Space Grotesk | 18px | 几何黑体，现代品牌 |

比较页放大展示笔形。真实阅读页只修改来源名，标题和正文继续沿用原阅读设置；手机来源名减1px。样本选择同时更新来源、日期、标题和原文段落，四篇样本均取自归档。英文和中文分别使用字形范围选择字体，保留账号原文。

点“正文预览”进入当前正文布局，顶部选择器可切换六套方案；“返回比较”保留当前文章样本。方案选择写入链接 `type=a..f`，没有覆盖正式字体设置。仍复用正式阅读器的目录、排版和收藏逻辑。

维护 `variants.js` 中的名称与说明；字号、字距和字体映射维护在 `build.py`，然后运行项目根目录 `字体更新.py`。构建器检查17个来源名称的字形覆盖，生成本地WOFF2子集与 `reading.html`，支持正式prototype目录与平铺交付快照。正文结构更新后必须重建预览。

字体原件及各自OFL授权存于项目 `font-sources/`。新增字体来自 [Google Fonts官方字体仓库](https://github.com/google/fonts/tree/main/ofl)：zcoolxiaowei、liujianmaocao、zcoolqingkehuangyou、longcang、cinzel、bodonimoda、caveat、librebaskerville。Cormorant Garamond与Space Grotesk复用已有原件；思源宋／黑复用正式本地阅读字体。预览子集内部名称改为 Jianwei Lab，授权合并保存在 `assets/fonts/LICENSE.txt`。

已实屏检查六套桌面比较、机器之心与ModelScope混排、正文方案切换和返回比较、左侧目录展开及最小化、390px与320px布局。320px返回入口为带可访问名称的箭头按钮。原文、来源日期、17来源与35张配图继续保留。

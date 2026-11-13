# 当前刊五篇简报重写对照

2026-11-13用户已正式采用五篇新稿。正式版本及修订记录位于prototype/data.js与editions/20261108-09/revisions/20261113-briefs；此页面继续对照冻结的旧稿和已采用新稿。下方关于“尚未替换”的说明属于预览建立时的记录。

入口：http://127.0.0.1:8807/brief-rewrite-lab/

本预览按2026-11-12版《简报写作规范》，重写当前刊20261108-09首页五篇精选。只比较文字，不改变正式文章、标题、原文、图片、刊期、排序或阅读与收藏状态。尚未替换正式简报。

原版取自构建时正式prototype/data.js，存入comparison-data.json；rewrites.json保存新稿、编辑说明和原文blocks的零起始索引。两栏相同18px思源黑体、相同行高与版宽，正文按正式首页的“前两项合为一段、其余合为下一段”显示。桌面并排，640px以下上下排列。页面无本地存储写入，只在当前预览URL保留文章位置。

editorial-review.md记录逐篇证据与编辑复核；validation.json仅表示本预览验收，不是当前刊发布验收。production-hashes.json用于确认正式prototype与历史editions未改变。

预览字体独立从NotoSansSC-VF.ttf及NotoSerifSC-VF.ttf构建，来源与授权在assets/font-LICENSE.txt；正式字库不重建。font-build.py仅维护本预览字体与字形覆盖。

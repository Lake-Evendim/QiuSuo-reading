# 阅读底色预览（2026-11-10，尚未采用）

四套方案：A 暖灰纸面、B 暖纸、C 浅鼠尾草、D 夜间石墨；另有原白底对照。配色应用于公众号页与正文页，沿用正式布局、字体、行宽、原文和真实配图。

公众号入口：http://127.0.0.1:8807/comfort-lab/?theme=warmgray#channels
正文入口：http://127.0.0.1:8807/comfort-lab/?theme=warmgray#article/autoresearch/body

主题选择写入当前URL。生成的app/experience使用jianwei-comfort-preview-前缀隔离排版、阅读进度和收藏；不会写正式阅读键。共享正式edition/channels/typesetting/publisher-strata、数据、字体与原图。

维护comfort.js与comfort.css；build.py从正式页面生成预览，生产文件只读。production-hashes.json保存生成时正式prototype文件SHA256。更新正式项目后如需重新生成，先检查维护说明，不重建其他实验。

验收：桌面四套公众号配色、来源选择与7篇滚动列表，正文暖灰/暖纸/夜间与手机320px主题切换。正文800px、20px与目录N保持；切换主题前后阅读位置相同。控制台未发现error/warn。正式prototype哈希一致，数据未改。截图位于当前会话outputs/阅读底色四套预览-20261110。

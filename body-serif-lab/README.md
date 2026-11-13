# 霞鹜致宋预览未采用（2026-11-10）

用户确认继续使用正常宋体Noto Serif SC，正文默认18px。此预览仅留作历史，不能默认采用。下方“尚未采用”说明由本次明确不采用的反馈更新。

# 正文18号宋体预览

正文默认字号18已采用，恢复默认排版同样返回18。正式字体仍为Noto Serif SC；霞鹜致宋尚未采用，只在此独立预览生效。

预览入口：http://127.0.0.1:8807/body-serif-lab/?font=zhisong#article/swift-decision/body

顶部下拉菜单可切换霞鹜致宋与原宋体，均沿用当前字号，默认18。现有14篇全文可通过原导航继续访问。标题、章节标题、目录N字体、公众号署名G、白底、800/900px正文宽度及48px工具栏保持。

新字体使用LXGW ZhiSong Classic v1.002，以早期印刷字形为参考，与当前Noto Serif SC区分。仅覆盖.prose的宋体正文；黑体选项、代码、表格、图注和小节标题保持原字体。子集内名为Jianwei Body Song Preview，1714个正文及基础字符，全部中文字符覆盖，文件291080字节。原始TTF、IPA Font License 1.0全文、构建脚本及恢复原始IPA字型的方法随预览保存；排版面板提供字体与授权说明入口。具体见font-info.html。

维护build.py、preview.js、body-serif.css。build.py只读正式文件，使用独立jianwei-body-serif-preview-存储，不改变正式收藏和阅读进度。production-hashes.json是18px默认修改后的正式基线，仅首次写入，不得在重建时覆盖。

验收：初始18px，切换原宋体仍18px；增大为19后恢复默认回到18，选择菜单同步字号。1280px桌面正文800px、中心640px、工具栏48px，标题与目录字体不变；390/320px正文18px，内容与菜单无横向溢出。新字体加载完成，控制台无error/warn。正式页面原存储的20px可通过恢复默认变为18px，当前浏览器已应用18。正式修改仅app.js、styles.css、index/legacy引用与字号占位；其他184个正式文件及数据保持。共享前端实验入口的app/style缓存引用同步，不重建旧实验。

截图和验收记录：当前会话outputs/正文18号宋体预览-20261110。
恢复副本：work/before-body-size-18-20261110-181806.zip。

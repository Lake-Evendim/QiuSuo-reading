(() => {
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function renderHome({articles,rows,footer}) {
    let content=rows(articles);
    const figure=articles[0]?.blocks.find(b=>b.type==='figure'&&b.src.includes('6ce4484dd62a28fd'));
    if(figure){
      const media=`<figure class="feature-media"><a href="${esc(figure.src)}" data-zoom aria-label="放大实时视频评测任务图"><img src="${esc(figure.src)}" alt="StreamEval 实时视频评测的五类任务" width="${Number(figure.width)||1200}" height="${Number(figure.height)||600}" loading="lazy"></a><figcaption><span>实时视频评测的五类任务</span><span>机器之心原文配图　点击放大</span></figcaption></figure>`;
      content=content.replace('</div></article>',`${media}</div></article>`);
    }
    return `<div class="journal-edition"><header class="edition-heading"><h1>技术与视野</h1><div class="edition-context"><span>${articles.length} 篇阅读样例</span><span>尚未更新为当日简报</span></div></header>${content}${footer()}</div>`;
  }
  window.READING_JOURNAL={renderHome};
  window.READING_DESIGN={renderHome};
})();

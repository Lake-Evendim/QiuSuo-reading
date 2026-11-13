(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data = window.READING_DATA;
  const style = 'd';
  document.body.dataset.fusion = style;
  for (const a of data.articles) {
    if (a.featureImage?.startsWith('assets/')) a.featureImage = '../prototype/' + a.featureImage;
    for (const b of a.blocks) if (b.src?.startsWith('assets/')) b.src = '../prototype/' + b.src;
  }
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
  const book = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v15M3 4.5c4-1 6-.5 9 1.5 3-2 5-2.5 9-1.5V19c-4-1-6-.5-9 1.5-3-2-5-2.5-9-1.5z"/></svg>';
  const articlesFor = name => data.articles.filter(a => a.account === name).sort((a,b) => b.date.localeCompare(a.date));
  const reading = (a, showSource) => `<button type="button" class="fusion-reading" data-read="${esc(a.id)}" aria-label="阅读全文：${esc(a.title)}"><span class="fusion-reading-meta">${showSource ? `<span>${esc(a.account)}</span>` : book}<time datetime="${esc(a.date)}">${esc(a.date.slice(5).replace('-',' / '))}</time><span>${esc(a.readTime)}</span></span><span class="fusion-reading-title">${esc(a.title)}</span></button>`;
  window.READING_DESIGN.renderDirectoryHeader = () => `<nav class="fusion-labbar" aria-label="保留的 D 方案"><span class="fusion-lab-label">保留方案</span><div class="fusion-options"><a href="?style=d#channels" aria-current="page"><b>D</b><span>目录色签</span></a></div><a class="fusion-previous" href="../channels-dg/?style=1#channels">查看 D × G 新融合</a></nav><p class="fusion-explanation">来源名称色签与开放目录，已收录来源使用实色。</p><header class="fusion-heading"><h1>关注的公众号</h1><p>工程实践与行业研究，沿着来源深入阅读。</p></header>`;
  window.READING_DESIGN.renderSourceGroup = ({group,index,profiles,accountHref}) => {
    const reads = group.accounts.flatMap(articlesFor);
    const heading = `<header class="fusion-category"><div class="fusion-category-plaque"><h2 id="group-${index}">${esc(group.name)}</h2><span>${group.accounts.length} 个来源</span></div><p>${index === 1 ? '前沿研究、开源进展与产业变化' : '业务落地、系统架构与模型工程'}</p></header>`;
    const entries = group.accounts.map(name => {
      const articles = articlesFor(name), latest = articles[0];
      return `<article class="fusion-source ${latest ? 'has-reading' : ''}"><a class="fusion-source-link" href="${accountHref(name)}"><div class="fusion-source-name"><h3>${esc(name)}</h3>${arrow}</div><div class="fusion-source-detail"><p>${esc(profiles[name]?.description)}</p>${latest ? `<span class="fusion-archive">${book}${articles.length} 篇收录</span>` : ''}</div></a></article>`;
    }).join('');
    const shelf = reads.length ? `<aside class="fusion-shelf" aria-label="${esc(group.name)}已收录文章"><div class="fusion-shelf-label">从这里读起<span>${reads.length} 篇收录文章</span></div><div class="fusion-shelf-items">${reads.map(a => reading(a,true)).join('')}</div></aside>` : '';
    return `<section class="source-group fusion-group ${index === 1 ? 'fusion-research' : 'fusion-engineering'} ${group.accounts.length > 4 && group.accounts.length % 3 === 1 ? 'fusion-tail-pairs' : ''}" data-source-group="${esc(group.name)}" aria-labelledby="group-${index}">${heading}<div class="fusion-source-list">${entries}</div>${shelf}</section>`;
  };
})();

(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data = window.READING_DATA;
  const variants = {
    1: {name:'索引对页 · 已采用', description:'左侧色签查找来源，右侧展开收录文章；同一横幅连接两种阅读路径。'},
    2: {name:'横向读带', description:'先浏览完整来源目录，再沿横向阅读带进入文章；目录与内容各有节奏。'},
    3: {name:'来源同行', description:'色签与文章直接对应，已收录来源展开为横向书页，其他来源保持轻巧目录。'}
  };
  const requested = new URLSearchParams(location.search).get('style');
  const style = variants[requested] ? requested : '1';
  document.body.dataset.dg = style;
  for (const a of data.articles) {
    if (a.featureImage?.startsWith('assets/')) a.featureImage = '../prototype/' + a.featureImage;
    for (const b of a.blocks) if (b.src?.startsWith('assets/')) b.src = '../prototype/' + b.src;
  }
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
  const articlesFor = name => data.articles.filter(a => a.account === name).sort((a,b) => b.date.localeCompare(a.date));
  const imageFor = a => a.featureImage ? {src:a.featureImage} : a.blocks.find(b => b.type === 'figure' && b.src && !b.presentation && !/\.gif(?:\?|$)/i.test(b.src) && (!b.width || !b.height || b.width / b.height < 4));
  const meta = (a, source) => `<div class="dg-meta">${source ? `<span>${esc(a.account)}</span>` : ''}<time datetime="${esc(a.date)}">${esc(a.date.slice(5).replace('-',' / '))}</time><span>${esc(a.readTime)}</span></div>`;
  const reading = (a, showSource = true) => {
    const image = imageFor(a);
    return `<article class="dg-reading ${image ? 'with-image' : ''}"><div class="dg-reading-copy">${meta(a,showSource)}<h4>${esc(a.title)}</h4><p class="dg-deck">${esc(a.deck || a.takeaway || '')}</p></div>${image ? `<figure class="dg-image"><img src="${esc(image.src)}" alt="" width="240" height="160" loading="lazy"></figure>` : ''}<div class="dg-reading-actions"><button type="button" data-read="${esc(a.id)}" aria-label="阅读全文：${esc(a.title)}">阅读全文${arrow}</button></div></article>`;
  };
  window.READING_DESIGN.renderDirectoryHeader = () => `<nav class="dg-labbar" aria-label="D 与 G 融合方案"><span class="dg-lab-label">D × G</span><div class="dg-options">${Object.entries(variants).map(([key,v])=>`<a href="?style=${key}#channels" ${key === style ? 'aria-current="page"' : ''}><b>${key}</b><span>${v.name}</span></a>`).join('')}</div><div class="dg-references"><a href="../channels-fusion/?style=d#channels">原 D</a><a href="../channels-studio/?style=g#channels">原 G</a></div></nav><p class="dg-explanation">${variants[style].description}</p><header class="dg-heading"><h1>关注的公众号</h1><p>工程实践与行业研究，沿着来源深入阅读。</p></header>`;
  window.READING_DESIGN.renderSourceGroup = ({group,index,profiles,accountHref}) => {
    const reads = group.accounts.flatMap(articlesFor);
    const heading = `<header class="dg-category"><h2 id="group-${index}">${esc(group.name)}</h2><p>${index === 1 ? '前沿研究、开源进展与产业变化' : '业务落地、系统架构与模型工程'}</p><span>${group.accounts.length} 个来源</span></header>`;
    const displayNames = style === '3' ? [...group.accounts].sort((a,b) => Number(!!articlesFor(b).length) - Number(!!articlesFor(a).length)) : group.accounts;
    const sources = displayNames.map(name => {
      const articles = articlesFor(name);
      const identity = `<a class="dg-source-link" href="${accountHref(name)}"><div class="dg-source-name"><h3>${esc(name)}</h3>${arrow}</div><div class="dg-source-detail"><p>${esc(profiles[name]?.description)}</p>${articles.length ? `<span class="dg-archive">${articles.length} 篇收录</span>` : ''}</div></a>`;
      return `<article class="dg-source ${articles.length ? 'has-reading' : ''}">${identity}${style === '3' && articles.length ? `<div class="dg-inline-reading">${articles.map(a => reading(a,false)).join('')}</div>` : ''}</article>`;
    }).join('');
    const shelf = style !== '3' && reads.length ? `<aside class="dg-shelf" aria-label="${esc(group.name)}收录文章"><header class="dg-shelf-heading"><h3>收录文章</h3><span>${reads.length} 篇</span></header><div class="dg-shelf-items">${reads.map(a => reading(a)).join('')}</div></aside>` : '';
    const tailPairs = style === '3' && displayNames.filter(name => !articlesFor(name).length).length % 3 === 2;
    return `<section class="source-group dg-group ${index === 1 ? 'dg-research' : ''} ${tailPairs ? 'dg-tail-pairs' : ''} dg-catalog-tail-${group.accounts.length % 4}" data-source-group="${esc(group.name)}" aria-labelledby="group-${index}">${heading}<div class="dg-group-content"><div class="dg-source-list">${sources}</div>${shelf}</div></section>`;
  };
})();

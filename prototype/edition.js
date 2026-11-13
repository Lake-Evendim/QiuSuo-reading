(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pageMark = '<svg class="page-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 5h14v22H5zM19 11h8v16h-8M9 11h6M9 16h6M9 21h6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M17 3h6v8h-6z" fill="currentColor"/></svg>';
  function renderTakeaway(a, part = 'full') {
    // Emphasis changes presentation only; concatenation preserves the takeaway.
    const end = a.takeaway.search(/[。！？]/u);
    const match = end < 0 ? null : a.takeaway.slice(end).match(/^[。！？][”’」』]?/u);
    const boundary = match ? end + match[0].length : a.takeaway.length;
    const lead = a.takeaway.slice(0,boundary), rest = a.takeaway.slice(boundary);
    if (part === 'detail') return rest ? `<p>${esc(rest)}</p>` : '';
    return `<p class="brief-lede"><strong class="reason-key">${esc(lead)}</strong>${part==='full'&&rest?`<span class="reason-detail">${esc(rest)}</span>`:''}</p>`;
  }
  function renderBrief(a, includeTakeaway = true) {
    const details = `<p>${a.points.slice(0,2).map(esc).join('')}</p>${a.points.length>2?`<p>${a.points.slice(2).map(esc).join('')}</p>`:''}`;
    return `<div class="brief-text">${renderTakeaway(a,includeTakeaway?'full':'detail')}${details}</div>`;
  }
  function digestFigure(a) {
    return a.featureImage ? a.blocks.find(b => b.type === 'figure' && b.src === a.featureImage && b.presentation !== 'publisher-decoration') : null;
  }
  function renderArticle({a,index,sameAccount,featured,title,actions,accountHref,date}) {
    const sourceGroup = window.READING_DATA?.groups?.find(group => group.accounts.includes(a.account))?.name || '';
    const figure = featured && digestFigure(a);
    const caption = a.featureCaption || (figure?.caption || '原文配图');
    const media = figure ? `<figure class="feature-media edition-media"><a href="${esc(figure.src)}" data-zoom aria-label="放大：${esc(caption)}"><img src="${esc(figure.src)}" width="${figure.width}" height="${figure.height}" alt="${esc(caption)}"></a><figcaption><span class="media-description">${esc(caption)}</span><span>点击放大</span></figcaption></figure>` : '';
    const external = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></svg>';
    const hasFulltext = actions.includes('class="read-button"');
    const controls = actions
      .replace('class="article-actions"',`class="article-actions action-strip${hasFulltext?'':' action-strip-two'}" role="group" aria-label="${esc(a.title)}的阅读操作"`)
      .replace('save-button compact','save-button edition-save')
      .replace('class="visually-hidden"','class="save-label"')
      .replace('>微信原文</a>',`>${external}<span>微信原文</span></a>`);
    const headingTakeaway = media ? `<div class="brief-text heading-takeaway">${renderTakeaway(a,'lead')}</div>` : '';
    return `<article class="brief-article ${index === 0 ? 'lead' : ''} ${media ? 'featured-story' : ''}" id="brief-${a.id}" aria-labelledby="title-${a.id}"><aside class="source-margin" data-source-group="${esc(sourceGroup)}">${sameAccount ? '' : `<a class="account-name" href="${accountHref(a.account)}">${esc(a.account)}</a>`}<time datetime="${a.date}T${a.time}:00+08:00">${date(a)}</time></aside><div class="article-content"><div class="article-heading">${title}${headingTakeaway}</div>${renderBrief(a,!media)}${media}${controls}</div></article>`;
  }
  function renderHome({articles,rows}) {
    if (!articles.length) return '<section class="edition-empty"><h1>开始你的第一期阅读</h1><p>更新简报后，文章会出现在这里。</p></section>';
    const issueDate = articles.reduce((latest,a) => a.date > latest ? a.date : latest,'');
    const issue = window.READING_DATA.currentEdition;
    const issueLabel = issue ? `${issue.from} — ${issue.to}` : issueDate;
    const issueCount = issue ? `${articles.length} 篇精选 · 新增 ${issue.articleIds.length} 篇` : `${articles.length} 篇阅读样例`;
    const sourceMap = new Map();
    articles.forEach(a => {
      if (!sourceMap.has(a.account)) sourceMap.set(a.account,{account:a.account,articles:[]});
      sourceMap.get(a.account).articles.push(a);
    });
    const sourceGroups = [...sourceMap.values()];
    sourceGroups.forEach(group => {
      const leadIndex = group.articles.findIndex(a => digestFigure(a));
      if (leadIndex > 0) group.articles = [group.articles[leadIndex], ...group.articles.filter((_,index) => index !== leadIndex)];
    });
    const leadGroupIndex = sourceGroups.findIndex(group => digestFigure(group.articles[0]));
    const orderedGroups = leadGroupIndex > 0 ? [sourceGroups[leadGroupIndex], ...sourceGroups.filter((_,index) => index !== leadGroupIndex)] : sourceGroups;
    let startIndex = 0;
    const content = orderedGroups.map(group => {
      const groupArticles = rows(group.articles,false,{featured:true,groupSources:true,startIndex});
      startIndex += group.articles.length;
      return `<section class="digest-source-group" aria-label="${esc(group.account)}">${groupArticles}</section>`;
    }).join('').replace(/<article class="brief-article/g,'<article class="brief-article digest-story');
    return `<div class="edition"><section class="digest" aria-labelledby="digest-title"><header class="digest-heading"><div class="issue-title">${pageMark}<div><h1 id="digest-title">本期简报</h1><p>${esc(issueCount)}<span aria-hidden="true"> / </span><time datetime="${issueDate}">${esc(issueLabel)}</time></p></div></div></header><div class="digest-stories">${content}</div></section></div>`;
  }
  function renderDirectoryHeader({sourceNames,count}) {
    const articleCount = sourceNames.reduce((total,name) => total + count(name),0);
    return `<header class="directory-heading"><h1>关注的公众号</h1><p class="library-scope">${sourceNames.length} 个关注来源，${articleCount} 篇已收录文章</p></header>`;
  }
  function renderSourceGroup({group,index,profiles,count,accountHref,description}) {
    const ready = group.accounts.filter(name => count(name)>0), pending = group.accounts.filter(name => !count(name));
    const entries = (names,available) => `<div class="source-list ${available?'source-list-ready':''}">${names.map(name => `<a class="source-entry ${available?'source-ready':'source-pending'}" href="${accountHref(name)}"><h3>${esc(name)}</h3><p>${esc(profiles[name]?.description)}</p>${available?`<span class="source-entry-status has-archive">阅读 ${count(name)} 篇</span>`:'<span class="visually-hidden">阅读库尚未收录</span>'}</a>`).join('')}</div>`;
    return `<section class="source-group" data-source-group="${esc(group.name)}" aria-labelledby="group-${index}"><header class="source-group-heading"><h2 id="group-${index}">${esc(group.name)}</h2><p>${esc(description)}</p><span>${group.accounts.length} 个来源</span></header>${ready.length?`<div class="source-shelf"><h3 class="source-shelf-label">已收录 <span>${ready.length} 个来源</span></h3>${entries(ready,true)}</div>`:''}${pending.length?`<div class="source-shelf pending-shelf"><h3 class="source-shelf-label">待收录 <span>${pending.length} 个来源</span></h3>${entries(pending,false)}</div>`:''}</section>`;
  }
  function renderSavedEmpty({bookmark}) {
    return `<section class="edition-empty saved-empty" aria-labelledby="saved-title"><h1 id="saved-title" class="saved-empty-heading"><span class="empty-mark" aria-hidden="true">${bookmark}</span><span>稍后读</span></h1><p>把想细读的文章留在这里。<br>点击简报旁的书签，<span class="saved-empty-tail">随时回来继续阅读。</span></p></section>`;
  }
  window.READING_JOURNAL = {renderHome};
  window.READING_DESIGN = {renderHome,renderArticle,renderDirectoryHeader,renderSourceGroup,renderSavedEmpty,showFooter:false,showTopics:false,showSourceControls:false};
})();

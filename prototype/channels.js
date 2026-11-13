/* Adopted directory: DG 1, with source selection and an independently scrolling shelf. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const articles = window.READING_DATA.articles;
  const selection = new Map();
  const contexts = new Map();
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
  const articlesFor = name => articles.filter(a => a.account === name).sort((a,b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
  const imageFor = a => a.featureImage ? a.blocks.find(b => b.type === 'figure' && b.src === a.featureImage && b.presentation !== 'publisher-decoration') : null;
  const reading = a => {
    const image = imageFor(a);
    const fulltext = ['full','text-full'].includes(a.bodyStatus);
    const title = fulltext ? `<button type="button" class="channel-title-button" data-read="${esc(a.id)}" aria-label="阅读全文：${esc(a.title)}">${esc(a.title)}</button>` : esc(a.title);
    return `<article class="channel-reading ${image ? 'with-image' : ''}"><div class="channel-reading-copy"><div class="channel-meta"><span>${esc(a.account)}</span><time datetime="${esc(a.date)}">${esc(a.date.slice(5).replace('-',' / '))}</time><span>${esc(a.readTime)}</span></div><h4>${title}</h4></div>${image ? `<figure class="channel-image"><img src="${esc(image.src)}" alt="" width="240" height="160" loading="lazy"></figure>` : ''}</article>`;
  };
  const shelfContent = (name,index,{profiles,accountHref}) => {
    const reads = articlesFor(name);
    const content = reads.length ? reads.map(reading).join('') : `<div class="channel-shelf-empty"><h4>本号尚未收录文章</h4><p>${esc(profiles[name]?.description)}</p><a href="${accountHref(name)}">查看公众号资料${arrow}</a></div>`;
    return `<header class="channel-shelf-heading" aria-live="polite" aria-atomic="true"><div><p>收录文章</p><h3>${esc(name)}</h3></div><span>${reads.length} 篇</span></header><div id="channel-shelf-items-${index}" class="channel-shelf-items" role="region" aria-label="${esc(name)}的收录文章" tabindex="0">${content}</div>`;
  };
  window.READING_DESIGN.renderDirectoryHeader = () => '<header class="channel-heading"><h1>关注的公众号</h1><p>工程实践与行业研究，沿着来源深入阅读。</p></header>';
  window.READING_DESIGN.renderSourceGroup = ({group,index,profiles,accountHref}) => {
    contexts.set(index,{profiles,accountHref});
    let selected = selection.get(index);
    if (!group.accounts.includes(selected)) selected = group.accounts.find(name => articlesFor(name).length) || group.accounts[0];
    selection.set(index,selected);
    const heading = `<header class="channel-category"><h2 id="group-${index}">${esc(group.name)}</h2><p>${index === 1 ? '前沿研究、开源进展与产业变化' : '业务落地、系统架构与模型工程'}</p><span>${group.accounts.length} 个来源</span></header>`;
    const sources = group.accounts.map(name => {
      const count = articlesFor(name).length;
      return `<article class="channel-source ${count ? 'has-reading' : ''}"><button type="button" class="channel-source-link ${name === selected ? 'is-selected' : ''}" data-channel-source="${esc(name)}" aria-pressed="${name === selected}" aria-controls="channel-shelf-items-${index}"><div class="channel-source-name"><h3>${esc(name)}</h3>${arrow}</div><div class="channel-source-detail"><p>${esc(profiles[name]?.description)}</p>${count ? `<span class="channel-archive">${count} 篇收录</span>` : ''}</div></button></article>`;
    }).join('');
    const shelf = `<aside class="channel-shelf" aria-label="${esc(group.name)}收录文章">${shelfContent(selected,index,{profiles,accountHref})}</aside>`;
    return `<section class="source-group channel-group ${index === 1 ? 'channel-research' : ''}" data-channel-group="${index}" data-source-group="${esc(group.name)}" aria-labelledby="group-${index}">${heading}<div class="channel-group-content"><div class="channel-source-list">${sources}</div>${shelf}</div></section>`;
  };
  const revealShelf = shelf => {
    if (matchMedia('(max-width:820px)').matches) {
      const bar = document.querySelector('.journal-masthead');
      window.scrollTo({top:window.scrollY + shelf.getBoundingClientRect().top - bar.getBoundingClientRect().bottom - 16,behavior:'auto'});
    }
  };
  document.addEventListener('click',event => {
    const button = event.target.closest('[data-channel-source]');
    if (!button) return;
    const group = button.closest('[data-channel-group]');
    if (!group) return;
    const index = Number(group.dataset.channelGroup);
    const name = button.dataset.channelSource;
    if (selection.get(index) === name) {revealShelf(group.querySelector('.channel-shelf'));return;}
    selection.set(index,name);
    group.querySelectorAll('[data-channel-source]').forEach(source => {
      const active = source.dataset.channelSource === name;
      source.classList.toggle('is-selected',active);
      source.setAttribute('aria-pressed',String(active));
    });
    const shelf = group.querySelector('.channel-shelf');
    shelf.innerHTML = shelfContent(name,index,contexts.get(index));
    revealShelf(shelf);
  });
})();

(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data=window.READING_DATA;
  const style='g';
  document.body.dataset.studio=style;
  for(const a of data.articles){
    if(a.featureImage?.startsWith('assets/'))a.featureImage='../prototype/'+a.featureImage;
    for(const b of a.blocks)if(b.src?.startsWith('assets/'))b.src='../prototype/'+b.src;
  }
  const book='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v15M3 4.5c4-1 6-.5 9 1.5 3-2 5-2.5 9-1.5V19c-4-1-6-.5-9 1.5-3-2-5-2.5-9-1.5z"/></svg>';
  const articlesFor=name=>data.articles.filter(a=>a.account===name).sort((a,b)=>b.date.localeCompare(a.date));
  const imageFor=a=>{
    if(a.featureImage)return{src:a.featureImage,caption:a.featureCaption||'原文配图'};
    const figure=a.blocks.find(b=>b.type==='figure'&&b.src&&!b.presentation&&!/\.gif(?:\?|$)/i.test(b.src)&&(!b.width||!b.height||b.width/b.height<4));
    return figure?{src:figure.src,caption:figure.caption||'原文配图'}:null;
  };
  const meta=(a,showSource=true)=>`<span class="studio-reading-meta">${showSource?`<span>${esc(a.account)}</span>`:''}<time datetime="${esc(a.date)}">${esc(a.date.slice(5).replace('-',' / '))}</time><span>${esc(a.readTime)}</span></span>`;
  const reading=a=>{
    const img=imageFor(a);
    return `<button type="button" class="studio-reading ${img?'with-image':''}" data-read="${esc(a.id)}" aria-label="阅读全文：${esc(a.title)}">${style==='g'&&img?`<img src="${esc(img.src)}" alt="" width="96" height="86" loading="lazy">`:''}<span class="studio-reading-copy">${meta(a,style==='g')}<span class="studio-reading-title">${esc(a.title)}</span><span class="studio-reading-cue">阅读全文</span></span></button>`;
  };
  window.READING_DESIGN.renderDirectoryHeader=()=>`<nav class="studio-labbar" aria-label="保留的 G 方案"><span class="studio-lab-label">保留方案</span><div class="studio-options"><a href="?style=g#channels" aria-current="page"><b>G</b><span>刊页编排</span></a></div><a class="studio-previous" href="../channels-dg/?style=1#channels">查看 D × G 新融合</a></nav><p class="studio-explanation">来源目录与收录文章各有阅读区域，用分类横幅串联。</p><header class="studio-heading"><h1>关注的公众号</h1><p>工程实践与行业研究，沿着来源深入阅读。</p></header>`;
  window.READING_DESIGN.renderSourceGroup=cfg=>{
    const {group,index,profiles,accountHref}=cfg;
    const reads=group.accounts.flatMap(articlesFor);
    const heading=`<header class="studio-group-heading"><h2 id="group-${index}">${esc(group.name)}</h2><p>${index===1?'前沿研究、开源进展与产业变化':'业务落地、系统架构与模型工程'}</p><span>${group.accounts.length} 个来源</span></header>`;
    const entries=group.accounts.map(name=>{
      const articles=articlesFor(name),count=articles.length?`<span class="studio-archive">${book}${articles.length} 篇收录</span>`:'';
      return `<article class="studio-source ${articles.length?'has-reading':''}"><a class="studio-source-link" href="${accountHref(name)}"><div class="studio-source-identity"><h3>${esc(name)}</h3></div><div class="studio-source-description"><p>${esc(profiles[name]?.description)}</p>${count}</div></a></article>`;
    }).join('');
    const tail=`<aside class="studio-reading-shelf" aria-label="${esc(group.name)}已收录文章"><h3>收录文章</h3>${reads.map(reading).join('')}</aside>`;
    return `<section class="source-group studio-group ${index===1?'studio-research':'studio-engineering'}" data-source-group="${esc(group.name)}" aria-labelledby="group-${index}">${heading}<div class="studio-group-content"><div class="studio-source-list">${entries}</div>${tail}</div></section>`;
  };
})();

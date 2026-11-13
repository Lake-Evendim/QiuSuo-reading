(() => {
  const schemes = {
    folio: {code:'A',name:'留白书房',description:'单一阅读纵轴，留白与字体承担层级'},
    journal: {code:'B',name:'视野期刊',description:'大刊头、错列编排与横跨网格的图文'},
    studio: {code:'C',name:'理性工作台',description:'连续内容面，便于每日浏览与查找'}
  };
  let scheme = new URL(location.href).searchParams.get('scheme');
  if (!schemes[scheme]) scheme = 'journal';
  if(scheme==='journal'){location.replace(new URL('../prototype/'+location.hash,location.href));return;}
  let homeFilter='全部',homeContext=null,pendingHome=false;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const articleRoot = new URL('../prototype/', location.href);
  window.READING_DATA.articles.forEach(a=>a.blocks.forEach(b=>{if(b.type==='figure')b.src=new URL(b.src,articleRoot).href;}));
  document.documentElement.dataset.scheme=scheme;

  function dateLabel(){return '<time datetime="2026-10-27">2026 年 10 月 27 日</time><span>四篇真实阅读样例</span>';}
  function renderHome(context){
    homeContext=context;
    const {articles,rows,footer}=context;
    if(scheme==='folio')return `<div class="folio-edition"><header class="edition-heading"><h1>精选简报</h1><div class="edition-context">${dateLabel()}</div><p>从模型进展，到工程实践。</p></header>${rows(articles)}${footer()}</div>`;
    if(scheme==='journal'){
      let content=rows(articles);
      const figure=articles[0].blocks.find(b=>b.type==='figure'&&b.src.includes('6ce4484dd62a28fd'));
      if(figure)content=content.replace('<div class="article-actions">',`<figure class="feature-media"><img src="${esc(figure.src)}" alt="StreamEval 实时视频评测的五类任务" width="${Number(figure.width)||1200}" height="${Number(figure.height)||600}"><figcaption>实时视频评测的五类任务　机器之心原文配图</figcaption></figure><div class="article-actions">`);
      return `<div class="journal-edition"><header class="edition-heading"><h1>技术与视野</h1><div class="edition-context">${dateLabel()}<p>模型、工具与系统，<br>在原文里寻找值得留存的思路。</p></div></header>${content}${footer()}</div>`;
    }
    const groups=window.READING_DATA.groups;
    const matches=(a,group)=>group==='全部'||groups.find(g=>g.name===group)?.accounts.includes(a.account);
    const list=articles.filter(a=>matches(a,homeFilter));
    return `<div class="studio-edition"><header class="edition-heading"><div><h1>阅读工作台</h1><p>模型研究与工程实践的阅读记录</p></div><div class="edition-context">${dateLabel()}</div></header><div class="work-filters" role="group" aria-label="按方向筛选简报">${['全部',...groups.map(g=>g.name)].map(g=>`<button data-work-filter="${esc(g)}" aria-pressed="${g===homeFilter}">${esc(g)} <span>${articles.filter(a=>matches(a,g)).length}</span></button>`).join('')}</div><div class="studio-feed">${list.length?rows(list):'<section class="studio-empty"><h2>本方向尚未收录阅读样例</h2><p>可以先查看全部简报，或从公众号目录选择来源。</p><button class="text-button" data-work-filter="全部">查看全部简报</button><a href="#channels">浏览公众号</a></section>'}</div>${footer()}</div>`;
  }
  window.READING_DESIGN={renderHome};

  function changeScheme(next){
    if(!schemes[next])return;
    if(next==='journal'){location.assign(new URL('../prototype/'+location.hash,location.href));return;}
    scheme=next;document.documentElement.dataset.scheme=scheme;
    const url=new URL(location.href);url.searchParams.set('scheme',scheme);history.replaceState(null,'',url);
    document.querySelectorAll('button[data-scheme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scheme===scheme)));
    document.querySelector('#scheme-caption').textContent=schemes[scheme].description;
    document.querySelector('#show-lab').textContent=schemes[scheme].code+' · '+schemes[scheme].name;
    document.querySelector('#reader-scheme').value=scheme;
    if((!location.hash||location.hash==='#home')&&homeContext){if(document.querySelector('#reader-dialog').open)pendingHome=true;else{document.querySelector('#main').innerHTML=renderHome(homeContext);window.scrollTo(0,0);pendingHome=false;}}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const options=Object.entries(schemes).map(([key,s])=>`<option value="${key}">${s.code} · ${s.name}</option>`).join('');
    document.querySelector('#settings-panel').insertAdjacentHTML('beforeend',`<label class="scheme-setting">预览方案<select id="reader-scheme" aria-label="切换全文设计方案">${options}</select></label>`);
    changeScheme(scheme);
    document.querySelector('#reader-scheme').addEventListener('change',e=>changeScheme(e.target.value));
    document.querySelector('#reader-dialog').addEventListener('close',()=>{if(pendingHome){pendingHome=false;if((!location.hash||location.hash==='#home')&&homeContext){const position=window.scrollY;document.querySelector('#main').innerHTML=renderHome(homeContext);window.scrollTo(0,position);document.querySelector('#main').focus({preventScroll:true});}}});
    document.querySelector('#collapse-lab').addEventListener('click',()=>{document.body.classList.add('lab-collapsed');document.querySelector('#show-lab').focus({preventScroll:true});});
    document.querySelector('#show-lab').addEventListener('click',()=>{document.body.classList.remove('lab-collapsed');document.querySelector('[data-scheme="'+scheme+'"]').focus({preventScroll:true});});
    document.addEventListener('click',e=>{
      const target=e.target.closest('button[data-scheme]');if(target){changeScheme(target.dataset.scheme);return;}
      const filter=e.target.closest('[data-work-filter]');if(filter&&homeContext){homeFilter=filter.dataset.workFilter;document.querySelector('#main').innerHTML=renderHome(homeContext);document.querySelector('[data-work-filter="'+homeFilter+'"]').focus({preventScroll:true});}
    });
  });
})();

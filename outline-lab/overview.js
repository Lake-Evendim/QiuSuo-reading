(()=>{
  const {escape,decorate}=window.OUTLINE_LAB,variants=window.OUTLINE_VARIANTS,articles=window.READING_DATA.articles;
  const params=new URL(location.href).searchParams;
  let sample=articles.some(a=>a.id===params.get('sample'))?params.get('sample'):'autoresearch';
  let round=window.OUTLINE_ROUNDS[params.get('round')]?params.get('round'):'refined';
  let current=Number(params.get('section')),allExpanded=false;
  const picker=document.querySelector('#sample-picker'),chapter=document.querySelector('#chapter-picker'),grid=document.querySelector('#outline-options');
  picker.innerHTML=articles.map(a=>`<option value="${escape(a.id)}">${escape(a.account)} · ${escape(a.title)}</option>`).join('');
  function updateUrl(){const url=new URL(location.href);url.searchParams.set('sample',sample);url.searchParams.set('section',String(current));url.searchParams.set('round',round);history.replaceState(null,'',url);}
  function render(){
    document.documentElement.dataset.comparisonRound=round;
    const article=articles.find(a=>a.id===sample),tree=window.OUTLINE_LAB.groups(article);
    if(!tree.headings.some(h=>h.index===current))current=tree.groups.find(h=>h.children.length)?.index??tree.headings[0]?.index??-1;
    picker.value=sample;
    chapter.innerHTML=tree.headings.map(h=>`<option value="${h.index}">${escape(h.text)}</option>`).join('');chapter.value=String(current);
    document.querySelector('#sample-title').textContent=article.title;
    document.querySelector('#sample-meta').textContent=article.account+'　'+article.date;
    const sub=tree.headings.length-tree.groups.length;
    const nav=tree.groups.map(g=>{
      const active=g.index===current||g.children.some(c=>c.index===current),open=allExpanded||active;
      const button=h=>`<button class="${h.child?'subchapter ':''}${h.index===current?'current':''}" data-jump="section-${h.index}" data-number="${escape(h.number)}" data-label="${escape(h.label)}"${h.index===current?' aria-current="location"':''}>${escape(h.text)}</button>`;
      return `<li class="outline-chapter${active?' contains-current':''}"><div class="outline-chapter-heading">${button(g)}${g.children.length?`<button class="outline-disclosure" data-group-toggle aria-expanded="${open}" aria-label="${open?'收起':'展开'}小节：${escape(g.text)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg></button>`:''}</div>${g.children.length?`<ol class="outline-subchapters"${open?'':' hidden'}>${g.children.map(c=>button({...c,child:true})).map(b=>'<li>'+b+'</li>').join('')}</ol>`:''}</li>`;
    }).join('');
    document.querySelector('.comparison-title h1').textContent=round==='layout'?'目录排版方案':'目录字体预览';
    document.querySelector('.comparison-title p').textContent=round==='refined'?'六种字形，统一层级与紧凑间距。点击正文预览，查看实际阅读效果。':round==='fonts'?'沿用紧凑排版，比较六种字形与清晰度。':'同一篇原文，六种字体与章节秩序。';
    document.querySelectorAll('[data-round]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.round===round)));
    const reference=document.querySelector('#serif-reference');reference.hidden=round==='layout';reference.textContent=round==='refined'?'对照已采用 N 字体':'宋体参照';reference.href=`reading.html?revision=6&round=${round}&outline=${round==='refined'?'n':'a'}&section=${current}#article/${escape(sample)}/body`;
    document.title=round==='layout'?'求索 · 目录排版方案':'求索 · 目录字体预览';
    grid.innerHTML=variants.filter(v=>window.OUTLINE_ROUNDS[round].ids.includes(v.id)).map(v=>`<article class="outline-option${v.round==='fonts'?' outline-compact-font':''}${v.round==='refined'?' outline-refined-font':''}" data-outline-variant="${v.id}"><header><h2><span>${v.id.toUpperCase()}</span>${v.name}</h2><p>${v.detail}</p></header><div class="outline-specimen toc-panel"><div class="outline-heading"><h3>文章目录</h3><p>${tree.groups.length}章${sub?'，'+sub+'小节':''}</p></div><nav aria-label="${v.name}章节预览"><ol class="outline-chapters">${nav}</ol></nav></div><footer><p>${v.description}</p><a href="reading.html?revision=6&round=${round}&outline=${v.id}&section=${current}#article/${escape(sample)}/body">正文预览<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></a></footer></article>`).join('');
    decorate(grid);updateUrl();
    requestAnimationFrame(()=>grid.querySelectorAll('nav').forEach(n=>{const active=n.querySelector('.contains-current');if(active)n.scrollTop+=active.getBoundingClientRect().top-n.getBoundingClientRect().top-12;}));
  }
  picker.addEventListener('change',()=>{sample=picker.value;current=-1;render();});
  chapter.addEventListener('change',()=>{current=Number(chapter.value);render();});
  document.querySelector('.comparison-rounds').addEventListener('click',e=>{const button=e.target.closest('[data-round]');if(button){round=button.dataset.round;render();}});
  document.querySelector('#expand-all').addEventListener('click',e=>{allExpanded=!allExpanded;e.currentTarget.textContent=allExpanded?'只展开当前章':'展开全部小节';e.currentTarget.setAttribute('aria-pressed',String(allExpanded));render();});
  grid.addEventListener('click',e=>{
    const toggle=e.target.closest('[data-group-toggle]');
    if(toggle){const group=toggle.closest('.outline-chapter').querySelector('.outline-subchapters'),open=group.hidden;group.hidden=!open;toggle.setAttribute('aria-expanded',String(open));return;}
    const jump=e.target.closest('[data-jump]');if(jump){current=Number(jump.dataset.jump.replace('section-',''));render();}
  });
  render();
})();

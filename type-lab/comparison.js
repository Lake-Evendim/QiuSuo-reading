(()=>{
  const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const publisher=v=>(v.match(/\p{Script=Han}{1,2}|[A-Za-z0-9]+|./gu)||[]).map(t=>`<span>${escape(t)}</span>`).join('');
  const articles=window.READING_DATA.articles.filter(a=>['full','text-full'].includes(a.bodyStatus));
  const select=document.querySelector('#sample-select');
  select.innerHTML=articles.map(a=>`<option value="${a.id}">${escape(a.account)}</option>`).join('');
  const initial=new URL(location.href).searchParams.get('sample');if(articles.some(a=>a.id===initial))select.value=initial;
  let round=new URL(location.href).searchParams.get('round')==='previous'?'previous':'new';
  const roundButtons=[...document.querySelectorAll('[data-round]')];
  function render(){
    const article=articles.find(a=>a.id===select.value)||articles[0];
    const paragraphs=article.blocks.filter(b=>b.type==='paragraph');
    const sample=paragraphs.find(b=>!/^(编辑|作者|来源|©)/.test(b.text))?.text||'';
    const date=article.date.slice(5).replace('-',' 月 ')+' 日 '+article.time;
    document.querySelector('#type-options').innerHTML=window.TYPE_VARIANTS.filter(v=>v.round===round).map(v=>`<article class="type-option" data-font-variant="${v.id}" aria-labelledby="option-${v.id}">
      <header class="type-option-heading"><h2 id="option-${v.id}"><span>${v.label}</span>${v.name}${v.adopted?'<small>已采用</small>':''}</h2><p>${v.chinese} / ${v.latin}</p></header>
      <div class="type-specimen"><div class="sample-publisher${/[A-Za-z]/.test(article.account)?' mixed-publisher':''}">${publisher(article.account)}</div><time>${date}</time><h3>${escape(article.title)}</h3><p class="sample-paragraph">${escape(sample)}</p></div>
      <div class="type-option-footer"><p>${v.description}</p><a href="reading.html?type=${v.id}#article/${article.id}/body" aria-label="正文预览：${v.name}">正文预览<span aria-hidden="true">↗</span></a><small>正文来源名 ${v.size}px</small></div>
    </article>`).join('');
    roundButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.round===round)));
    const url=new URL(location.href);url.searchParams.set('sample',article.id);url.searchParams.set('round',round);history.replaceState(null,'',url);
  }
  select.addEventListener('change',render);render();
  roundButtons.forEach(b=>b.addEventListener('click',()=>{round=b.dataset.round;render();}));
})();

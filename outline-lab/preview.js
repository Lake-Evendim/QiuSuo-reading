(()=>{
  const variants=window.OUTLINE_VARIANTS,params=new URL(location.href).searchParams;
  const picker=document.querySelector('#outline-variant'),reader=document.querySelector('#reader-dialog'),nav=document.querySelector('#reader-toc');
  let selected=variants.some(v=>v.id===params.get('outline'))?params.get('outline'):(params.get('round')==='layout'?'a':params.get('round')==='fonts'?'g':'m');
  const round=window.OUTLINE_ROUNDS[params.get('round')]?params.get('round'):variants.find(v=>v.id===selected).round;
  function revealCurrent(){const active=nav.querySelector('.contains-current')||nav.querySelector('[aria-current]');if(active&&!document.querySelector('#toc-panel').hidden)nav.scrollTop+=active.getBoundingClientRect().top-nav.getBoundingClientRect().top-12;}
  picker.innerHTML=variants.filter(v=>v.round===round||(round==='fonts'&&v.id==='a')||(round==='refined'&&v.id==='h')).map(v=>`<option value="${v.id}">${v.id.toUpperCase()} ${round==='fonts'&&v.id==='a'?'宋体参照':v.name}${v.adopted?'（当前）':''}</option>`).join('');
  function apply(id){
    selected=id;document.documentElement.dataset.outlineVariant=id;document.documentElement.dataset.outlineRound=round;picker.value=id;
    const url=new URL(location.href);url.searchParams.set('outline',id);url.searchParams.set('round',round);history.replaceState(null,'',url);
    requestAnimationFrame(()=>document.fonts.ready.then(revealCurrent));
  }
  picker.addEventListener('change',()=>apply(picker.value));apply(selected);
  const observer=new MutationObserver(()=>window.OUTLINE_LAB.decorate(nav));observer.observe(nav,{childList:true});
  function prepare(){
    window.OUTLINE_LAB.decorate(nav);
    const section=Number(params.get('section'));
    if(params.has('section')&&Number.isInteger(section))nav.querySelector(`[data-jump="section-${section}"]`)?.click();
    if(document.querySelector('#toc-panel').hidden)document.querySelector('#toc-toggle').click();
    picker.focus({preventScroll:true});
    requestAnimationFrame(revealCurrent);
  }
  document.addEventListener('reading:typeset',revealCurrent);
  document.addEventListener('reading:reader',prepare);
  if(reader.open)prepare();
  document.querySelector('#close-reader').addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    const sample=location.hash.match(/#article\/([^/]+)/)?.[1]||'autoresearch';
    const url=new URL(document.body.dataset.outlineIndex,document.baseURI);url.searchParams.set('sample',sample);url.searchParams.set('round',round);location.href=url;
  },true);
})();

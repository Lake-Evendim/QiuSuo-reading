// Generated from the current site; preview preferences are isolated.
(() => {
  const main=document.querySelector('#main'),reader=document.querySelector('#reader-dialog');
  const search=document.querySelector('#search-dialog'),query=document.querySelector('#library-query');
  const image=document.querySelector('#image-dialog'),stage=document.querySelector('#image-stage'),full=document.querySelector('#image-full');
  const {articles,groups}=window.READING_DATA,profiles=window.READING_SOURCES||{};
  const names=groups.flatMap(g=>g.accounts),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const easing='cubic-bezier(.22,.61,.36,1)';let reduceMotion=false;
  try{reduceMotion=localStorage.getItem('jianwei-comfort-preview-motion')==='reduce';}catch{}
  const animate=(el,frames,duration)=>{if(!motion.matches&&!reduceMotion&&el) {el.getAnimations().forEach(a=>a.cancel());el.animate(frames,{duration,easing});}};
  function applyMotion(){document.documentElement.classList.toggle('reduce-motion',reduceMotion);const button=document.querySelector('#motion-toggle');button.setAttribute('aria-pressed',String(reduceMotion));button.textContent=reduceMotion?'已减少动效':'减少动效';if(reduceMotion)document.getAnimations().forEach(a=>a.cancel());}
  applyMotion();document.querySelector('#motion-toggle').addEventListener('click',()=>{reduceMotion=!reduceMotion;applyMotion();try{localStorage.setItem('jianwei-comfort-preview-motion',reduceMotion?'reduce':'standard');}catch{}});
  motion.addEventListener('change',e=>{if(e.matches)document.getAnimations().forEach(a=>a.cancel());});
  let pageSeen=false,currentId=null,resumePending=false,progressTimer=0,positions={};
  try{const value=JSON.parse(localStorage.getItem('jianwei-comfort-preview-progress')||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))positions=value;}catch{}

  document.addEventListener('reading:route',e=>{
    const nav=document.querySelector('.journal-nav');if(nav)nav.dataset.section=e.detail.page==='account'?'channels':e.detail.page==='article'?'home':e.detail.page;
    if(pageSeen)animate(main,[{opacity:.65,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],240);
    pageSeen=true;
  });
  document.addEventListener('reading:sources',e=>{if(e.detail.animate)animate(main.querySelector('#source-results'),[{opacity:.6},{opacity:1}],180);});
  document.addEventListener('reading:saved',e=>{
    document.querySelectorAll('[data-save]').forEach(b=>{if(b.dataset.save===e.detail.id)animate(b.querySelector('svg'),[{transform:'scale(.82)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],160);});
  });

  function searchResults(){
    const term=query.value.trim().toLowerCase();
    const foundArticles=articles.filter(a=>!term||[a.title,a.account,a.topic,a.takeaway,...a.points].join(' ').toLowerCase().includes(term));
    const foundSources=names.filter(n=>term&&[n,profiles[n]?.description,...(profiles[n]?.focus||[]),...(profiles[n]?.aliases||[])].join(' ').toLowerCase().includes(term));
    document.querySelector('#search-status').textContent=term?`找到 ${foundArticles.length} 篇文章、${foundSources.length} 个公众号`:'已归档文章';
    document.querySelector('#library-results').innerHTML=(foundArticles.length?'<h3>文章</h3>'+foundArticles.map(a=>`<a class="search-result" href="#article/${esc(a.id)}/body"><strong>${esc(a.title)}</strong><span>${esc(a.account)}　${esc(a.date)}${window.READING_DESIGN?.showTopics===false?'':'　'+esc(a.topic)}</span></a>`).join(''):'')+(foundSources.length?'<h3>公众号</h3>'+foundSources.map(n=>`<a class="search-result" href="#account/${encodeURIComponent(n)}"><strong>${esc(n)}</strong><span>${esc(profiles[n]?.description||'')}</span></a>`).join(''):'')+(!foundArticles.length&&!foundSources.length?'<p class="search-empty">没有找到匹配内容。试试“评测”“Agent”或公众号名称。</p>':'');
  }
  function openSearch(){
    if(reader.open||document.querySelector('#update-dialog').open||image.open)return;
    query.value='';searchResults();search.showModal();query.focus();
    document.body.classList.add('search-active');animate(search,[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],200);
  }
  document.querySelector('#search-open').addEventListener('click',openSearch);
  document.querySelector('#search-close').addEventListener('click',()=>search.close());
  search.addEventListener('close',()=>document.body.classList.remove('search-active'));
  query.addEventListener('input',searchResults);
  query.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){const first=search.querySelector('.search-result');if(first){e.preventDefault();first.focus();}}else if(e.key==='Enter'){const first=search.querySelector('.search-result');if(first){e.preventDefault();first.click();}}});
  search.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();search.close();return;}
    if(e.target.closest('.search-result')&&['ArrowUp','ArrowDown'].includes(e.key)){
      e.preventDefault();const list=[...search.querySelectorAll('.search-result')],index=list.indexOf(e.target.closest('.search-result'));
      if(e.key==='ArrowUp'&&index===0)query.focus();else list[Math.max(0,Math.min(list.length-1,index+(e.key==='ArrowDown'?1:-1)))].focus();
    }
  });
  search.addEventListener('click',e=>{if(e.target===search){const r=search.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)search.close();}});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(search.open)search.close();else openSearch();}});
  const shortcut=navigator.platform.includes('Mac')?'⌘ K':'Ctrl K';
  document.querySelector('#search-open').title=`搜索文章与公众号（${shortcut}）`;
  const overflow=document.querySelector('#masthead-overflow');
  let returnToOverflow=null;
  function syncOverflow(){
    const active=document.querySelector('#focus-toggle').getAttribute('aria-pressed')==='true';
    const focus=overflow.querySelector('[data-masthead-action="focus"]');
    focus.setAttribute('aria-pressed',String(active));focus.textContent=active?'退出专注阅读':'专注阅读';
  }
  overflow.addEventListener('toggle',()=>{if(overflow.open)syncOverflow();});
  overflow.addEventListener('click',e=>{
    const action=e.target.closest('[data-masthead-action]');if(!action)return;
    overflow.open=false;
    returnToOverflow=action.dataset.mastheadAction;
    const target={search:'#search-open',focus:'#focus-toggle',update:'#update-help'}[action.dataset.mastheadAction];
    document.querySelector(target).click();syncOverflow();
    if(action.dataset.mastheadAction==='focus')overflow.querySelector('summary').focus({preventScroll:true});
  });
  document.addEventListener('click',e=>{if(overflow.open&&!overflow.contains(e.target))overflow.open=false;});
  overflow.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();overflow.open=false;overflow.querySelector('summary').focus({preventScroll:true});}});
  document.addEventListener('reading:route',()=>{overflow.open=false;});
  for(const [id,action] of [['search-dialog','search'],['update-dialog','update']]){
    document.querySelector('#'+id).addEventListener('close',()=>{
      if(returnToOverflow!==action)return;
      returnToOverflow=null;
      if(!reader.open&&overflow.offsetParent!==null)overflow.querySelector('summary').focus({preventScroll:true});
    });
  }

  function fitImage(){stage.classList.remove('zoomed');full.style.width='';stage.scrollTop=0;stage.scrollLeft=0;const button=document.querySelector('#image-fit');button.textContent='原始尺寸';button.setAttribute('aria-pressed','false');}
  function showImage(anchor){
    const img=anchor.querySelector('img');if(!img||img.hidden)return;
    const description=img.alt&&img.alt!=='图片'?img.alt:'原文配图';
    const caption=anchor.closest('figure')?.querySelector('figcaption');
    fitImage();full.src=anchor.href;full.alt=description;document.querySelector('#image-caption').textContent=caption?.querySelector('.media-description')?.textContent||caption?.textContent||description;
    document.querySelector('#image-original').href=anchor.href;image.showModal();document.body.classList.add('image-active');animate(image,[{opacity:0,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],240);
  }
  document.querySelector('#image-close').addEventListener('click',()=>image.close());
  image.addEventListener('close',()=>document.body.classList.remove('image-active'));
  document.querySelector('#image-fit').addEventListener('click',()=>{
    if(stage.classList.contains('zoomed'))fitImage();else{stage.classList.add('zoomed');full.style.width=full.naturalWidth+'px';const button=document.querySelector('#image-fit');button.textContent='适应窗口';button.setAttribute('aria-pressed','true');stage.focus({preventScroll:true});}
  });
  image.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();image.close();}});
  image.addEventListener('click',e=>{if(e.target===stage)image.close();});

  function recordPosition(){
    if(!currentId||resumePending)return;
    const max=reader.scrollHeight-reader.clientHeight;
    if(max>0)positions[currentId]=Math.max(0,Math.min(1,reader.scrollTop/max));
  }
  function savePosition(){
    clearTimeout(progressTimer);
    try{localStorage.setItem('jianwei-comfort-preview-progress',JSON.stringify(positions));}catch{}
  }
  reader.addEventListener('scroll',()=>{if(currentId&&!resumePending){recordPosition();clearTimeout(progressTimer);progressTimer=setTimeout(savePosition,350);}}, {passive:true});
  reader.addEventListener('close',()=>{savePosition();currentId=null;if(image.open)image.close();});
  window.addEventListener('pagehide',savePosition);
  document.addEventListener('reading:reader-before',()=>{recordPosition();savePosition();currentId=null;resumePending=false;});
  function leaveResume(){if(resumePending){resumePending=false;const note=reader.querySelector('.resume-note');if(note)note.hidden=true;}}
  reader.addEventListener('wheel',leaveResume,{passive:true});reader.addEventListener('touchmove',leaveResume,{passive:true});
  reader.addEventListener('pointerdown',e=>{if(e.target===reader)leaveResume();});
  reader.addEventListener('keydown',e=>{
    if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(e.key===' '&&e.target.closest('button,a'))return;
    if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(e.key))leaveResume();
  });
  document.addEventListener('reading:reader',e=>{
    currentId=e.detail.id;const ratio=Number(positions[currentId]);
    const paper=reader.querySelector('.reader-paper');
    if(Number.isFinite(ratio)&&ratio>.03&&ratio<.98){
      resumePending=true;
      const note=document.createElement('div');note.className='resume-note';note.innerHTML=`<span>上次读到 ${Math.round(ratio*100)}%</span><button data-resume>继续上次阅读</button><button data-restart>从头阅读</button>`;
      paper.querySelector('header').append(note);
      note.querySelector('[data-resume]').addEventListener('click',()=>{resumePending=false;note.hidden=true;reader.scrollTo({top:ratio*(reader.scrollHeight-reader.clientHeight),behavior:motion.matches||reduceMotion?'auto':'smooth'});reader.focus({preventScroll:true});});
      note.querySelector('[data-restart]').addEventListener('click',()=>{resumePending=false;note.hidden=true;positions[currentId]=0;savePosition();});
    }
    animate(paper,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],320);
  });
  document.addEventListener('reading:panel',e=>{if(e.detail.open&&!e.detail.persistent)animate(document.querySelector('#'+e.detail.id),[{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],180);});

  document.addEventListener('click',async e=>{
    const code=e.target.closest('[data-copy-code]');if(code){const text=code.closest('.code-block').querySelector('code').textContent;try{await navigator.clipboard.writeText(text);code.textContent='已复制';setTimeout(()=>{if(code.isConnected)code.textContent='复制代码';},1800);}catch{code.textContent='请选中代码复制';}return;}
  });
  document.addEventListener('click',e=>{
    const result=e.target.closest('#library-results a');if(result){returnToOverflow=null;search.close();return;}
    const anchor=e.target.closest('.prose figure a,.feature-media a[data-zoom]');
    if(anchor&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&e.button===0){e.preventDefault();e.stopPropagation();showImage(anchor);}
  },true);
})();

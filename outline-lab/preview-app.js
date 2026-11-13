// Generated from the current reader; preview preferences are isolated.
(() => {
  const {groups, articles} = window.READING_DATA;
  const projectDoc = new URL('项目说明.md', document.currentScript?.src || document.URL).href;
  const profiles=window.READING_SOURCES||{};
  const sourceNames=groups.flatMap(g=>g.accounts);
  const groupDescriptions={'工程实践':'从真实业务与系统实践中，寻找可用的工程经验。','行业研究':'跟进前沿研究、开源进展与行业变化。'};
  const directory={query:'',filter:'全部',scroll:0};
  let renderedPage='',readerAccount=null;
  const main=document.querySelector('#main'), reader=document.querySelector('#reader-dialog');
  const persistentToc=reader.classList.contains('reader-with-outline');
  const outlineMode=()=>reader.clientWidth >= (wideBody?1360:1240)?'wide':'narrow';
  let currentOutlineMode;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titleWords=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh-CN',{granularity:'word'}):null;
  const titleHTML=title=>{
    if(window.READING_JOURNAL){
      const chinese=part=>{
        if(!titleWords)return escape(part);
        const output=[];let run='';
        // ICU may return an unfamiliar short Chinese word as individual characters.
        const flush=()=>{if(run){output.push(/^[\p{Script=Han}]{2,3}$/u.test(run)?`<span class="title-token">${escape(run)}</span>`:escape(run));run='';}};
        for(const {segment,isWordLike} of titleWords.segment(part)){
          if(isWordLike&&/^[\p{Script=Han}]$/u.test(segment)){run+=segment;continue;}
          flush();output.push(isWordLike&&segment.length>1?`<span class="title-token">${escape(segment)}</span>`:escape(segment));
        }
        flush();return output.join('');
      };
      return String(title).split(/([0-9]+(?:个|项|种|款|代|倍|年|月|天|小时)(?:[A-Za-z]+)?|[A-Za-z0-9]+(?:[._+/#-][A-Za-z0-9]+)*)/g).map((part,i)=>i%2?`<span class="title-token">${escape(part)}</span>`:chinese(part)).join('');
    }
    const parts=title.match(/^([A-Za-z][^：]{0,13})(：.*)$/);let html=parts?`<span class="title-unit">${escape(parts[1])}</span>${escape(parts[2])}`:escape(title);for(const phrase of ["开了个新榜","实时视频模型","38个AI"])html=html.replaceAll(phrase,`<span class="title-unit">${phrase}</span>`);return html;
  };
  const bookmark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg>';
  const book='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v15M12 5C9 3 5 3 3 4v14c3-1 6-1 9 2 3-3 6-3 9-2V4c-2-1-6-1-9 1z"/></svg>';
  let saved=new Set(), fontSize=20, sansBody=false, wideBody=false, currentArticle=null, openingButton=null, scrollBeforeReading=0, deepReader=false, focusMode=false, hideDecor=true, titleBeforeReading='';
  try{const ids=JSON.parse(localStorage.getItem('jianwei-outline-preview-saved')||'[]');if(Array.isArray(ids))saved=new Set(ids.filter(id=>articles.some(a=>a.id===id)));}catch{}
  try{const pref=JSON.parse(localStorage.getItem('jianwei-outline-preview-reading')||'{}');if(Number.isFinite(pref.size))fontSize=Math.max(17,Math.min(24,pref.size));sansBody=pref.sans===true;wideBody=pref.wide===true;hideDecor=pref.hideDecor!==false;}catch{}
  currentOutlineMode=outlineMode();
  const count=name=>articles.filter(a=>a.account===name).length;
  const accountHref=name=>'#account/'+encodeURIComponent(name);
  const date=a=>a.date.slice(5).replace('-',' 月 ')+' 日';
  const saveButton=(a,compact=false)=>`<button class="save-button ${compact?'compact':''} ${saved.has(a.id)?'saved':''}" data-save="${a.id}" aria-pressed="${saved.has(a.id)}" aria-label="${saved.has(a.id)?'取消稍后读：':'加入稍后读：'}${escape(a.title)}" title="${saved.has(a.id)?'取消稍后读':'加入稍后读'}">${bookmark}<span class="${compact?'visually-hidden':''}">${saved.has(a.id)?'已收藏':'稍后读'}</span></button>`;
  const rows=(list,sameAccount=false,options={})=>list.map((a,index)=>{
    const title=`<h2 id="title-${a.id}">${titleHTML(a.title)}</h2>`;
    const actions=`<div class="article-actions">${['full','text-full'].includes(a.bodyStatus)?`<button class="read-button" data-read="${a.id}" aria-label="阅读全文：${escape(a.title)}">${book}<span>阅读全文</span></button>`:''}<a class="source-link" href="${escape(a.source)}" target="_blank" rel="noopener noreferrer">微信原文</a>${saveButton(a,true)}</div>`;
    const details=window.READING_JOURNAL?`<p>${a.points.slice(0,2).map(escape).join('')}</p>${a.points.length>2?`<p>${a.points.slice(2).map(escape).join('')}</p>`:''}`:`<p>${a.points.map(escape).join('')}</p>`;
    const brief=`<div class="brief-text"><p class="brief-lede">${escape(a.takeaway)}</p>${details}</div>`;
    if(window.READING_DESIGN?.renderArticle)return window.READING_DESIGN.renderArticle({a,index:index+(options.startIndex||0),sameAccount:sameAccount||(options.groupSources===true&&index>0),featured:options.featured===true,title,actions,brief,accountHref,date});
    return `<article class="brief-article ${index===0?'lead':''}" id="brief-${a.id}" aria-labelledby="title-${a.id}"><aside class="source-margin">${sameAccount?'':`<a class="account-name" href="${accountHref(a.account)}">${escape(a.account)}</a>`}<time datetime="${a.date}T${a.time}:00+08:00">${date(a)}<span>${a.time}</span></time><span class="topic">${escape(a.topic)}</span></aside><div class="article-content">${window.READING_JOURNAL?`<div class="article-heading">${title}${actions}</div>${brief}`:title+brief+actions}</div></article>`;
  }).join('');
  const footer=()=>window.READING_DESIGN?.showFooter===false?'':'<footer class="quiet-footer"><span>简报由 AI 整理，原文保留作者表述。</span><a href="'+escape(projectDoc)+'" target="_blank" rel="noopener noreferrer">项目说明</a></footer>';
  const pageHeader=(title,description,extra='')=>`<header class="page-header"><div><h1>${escape(title)}</h1><p>${escape(description)}</p></div>${extra}</header>`;
  function updateSavedCount(){document.querySelector('#saved-count').textContent=saved.size||'';}
  function home(){const ids=window.READING_DATA.currentEdition?.featuredIds;const homeArticles=ids?ids.map(id=>articles.find(a=>a.id===id)).filter(Boolean):articles;main.innerHTML=window.READING_DESIGN?.renderHome?window.READING_DESIGN.renderHome({articles:homeArticles,rows,footer}):pageHeader('精选阅读','本期阅读样例','<div class="edition">2026 年 10 月 27 日<small>星期二</small></div>')+rows(articles)+footer();}
  function channels(){
    const showControls=window.READING_DESIGN?.showSourceControls!==false;
    if(!showControls){directory.query='';directory.filter='全部';}
    const heading=window.READING_DESIGN?.renderDirectoryHeader?window.READING_DESIGN.renderDirectoryHeader({sourceNames,count}):`<header class="directory-heading"><h1>关注的公众号</h1><p>从工程、研究到行业，找到值得深入阅读的来源。</p><p class="library-scope">关注 ${sourceNames.length} 个公众号，${sourceNames.filter(n=>count(n)).length} 个已收录阅读样例</p></header>`;
    main.innerHTML=`<div class="source-directory">${heading}${showControls?`<div class="source-controls"><div class="source-filters" role="group" aria-label="按阅读方向筛选">${['全部',...groups.map(g=>g.name),'已收录'].map(f=>`<button data-source-filter="${escape(f)}" aria-pressed="${directory.filter===f}">${escape(f)}</button>`).join('')}</div><label class="source-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input id="source-query" type="search" aria-label="搜索公众号名称或阅读方向" placeholder="名称或阅读方向" value="${escape(directory.query)}"></label></div><p id="source-result-count" class="source-result-count" role="status"></p>`:''}<div id="source-results"></div><p class="directory-note">阅读方向由求索整理；收录状态仅表示本阅读库的内容。</p></div>`+footer();
    main.querySelector('#source-query')?.addEventListener('input',e=>{directory.query=e.target.value;directory.scroll=0;renderSources();});
    renderSources();
  }
  function renderSources(animate=false){
    const query=directory.query.trim().toLowerCase();
    const visible=groups.map(g=>({...g,accounts:g.accounts.filter(name=>{
      const p=profiles[name]||{};
      return (directory.filter==='全部'||directory.filter===g.name||directory.filter==='已收录'&&count(name)>0)&&[name,p.description,...(p.focus||[]),...(p.aliases||[])].join(' ').toLowerCase().includes(query);
    })})).filter(g=>g.accounts.length);
    const total=visible.reduce((n,g)=>n+g.accounts.length,0);
    main.querySelectorAll('[data-source-filter]').forEach(b=>b.setAttribute('aria-pressed',String(directory.filter===b.dataset.sourceFilter)));
    const resultCount=main.querySelector('#source-result-count');
    if(resultCount)resultCount.textContent=query||directory.filter!=='全部'?`找到 ${total} 个公众号`:'';
    main.querySelector('#source-results').innerHTML=total?visible.map(g=>{if(window.READING_DESIGN?.renderSourceGroup)return window.READING_DESIGN.renderSourceGroup({group:g,index:groups.findIndex(x=>x.name===g.name),profiles,count,accountHref,description:groupDescriptions[g.name]});return `<section class="source-group" data-source-group="${escape(g.name)}" aria-labelledby="group-${groups.findIndex(x=>x.name===g.name)}"><header class="source-group-heading"><h2 id="group-${groups.findIndex(x=>x.name===g.name)}">${escape(g.name)}</h2><p>${escape(groupDescriptions[g.name])}</p><span>${g.accounts.length} 个来源</span></header><div class="source-list">${g.accounts.map(name=>{
      const p=profiles[name]||{},n=count(name);
      return `<a class="source-entry" href="${accountHref(name)}"><h3>${escape(name)}</h3><p>${escape(p.description)}</p><span class="source-entry-status ${n?'has-archive':''}">${n?`已收录 ${n} 篇`:'尚未收录'}</span></a>`;
    }).join('')}</div></section>`;}).join(''):`<div class="source-no-results"><h2>没有找到匹配的公众号</h2><p>试试“Agent”“评测”或公众号名称，也可以清除当前筛选。</p><button class="text-button" data-clear-sources>清除筛选</button></div>`;
    document.dispatchEvent(new CustomEvent('reading:sources',{detail:{animate}}));
  }
  function account(name){
    const group=groups.find(g=>g.accounts.includes(name)),p=profiles[name]||{},list=articles.filter(a=>a.account===name).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
    if(!group){main.innerHTML=pageHeader('未找到公众号','从公众号目录选择一个来源。')+'<div class="empty-state"><a href="#channels">浏览全部公众号</a></div>'+footer();return;}
    const range=list.length?(list.at(-1).date===list[0].date?list[0].date:`${list.at(-1).date} 至 ${list[0].date}`):'';
    main.innerHTML=`<div class="account-view"><nav class="source-breadcrumb" aria-label="来源导航"><a href="#channels"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>全部来源</a><span aria-hidden="true">/</span><button data-related="${escape(group.name)}">${escape(group.name)}</button></nav><header class="account-heading"><div><h1>${escape(name)}</h1><p class="account-description">${escape(p.description)}</p><ul class="account-focus" aria-label="阅读方向">${(p.focus||[]).map(t=>`<li>${escape(t)}</li>`).join('')}</ul></div><div class="account-archive">${list.length?`<span>已收录 ${list.length} 篇阅读样例</span><span>${range}</span>`:'<span>阅读库尚未收录</span>'}</div></header>${list.length?`<div class="account-briefs">${rows(list,true)}</div><div class="account-bottom"><button class="text-button" data-related="${escape(group.name)}">浏览同方向来源</button><button class="text-button" data-request-account="${escape(name)}">补采本号</button></div>`:`<section class="source-empty"><h2>还没有收录本号文章</h2><p>阅读库尚未收录「${escape(name)}」的文章。补采后，简报与已核验的全文会展示在这里。</p><div class="source-empty-actions"><button class="outlined-button" data-request-account="${escape(name)}">补采本号</button><button class="text-button" data-related="${escape(group.name)}">浏览同方向来源</button></div></section>`}</div>`+footer();
  }
  function bookmarks(){
    const list=articles.filter(a=>saved.has(a.id));
    if(!list.length&&window.READING_DESIGN?.renderSavedEmpty){main.innerHTML=window.READING_DESIGN.renderSavedEmpty({bookmark});return;}
    main.innerHTML=pageHeader('稍后读','留一点时间，读进原文。')+(list.length?rows(list):'<div class="empty-state"><h2>留住想细读的文章</h2><p>点击简报旁的书签，之后随时回来阅读。</p><a href="#home">浏览今日简报</a></div>')+footer();
  }
  function blockHTML(b,index,isSubchapter=false){
    if(b.type==='heading'){const tag=isSubchapter?'h3':'h2';return `<${tag} id="section-${index}" tabindex="-1">${escape(b.text)}</${tag}>`;}
    if(b.type==='list'){const tag=b.ordered?'ol':'ul';return `<${tag}>${b.items.map(t=>`<li>${escape(t)}</li>`).join('')}</${tag}>`;}
    if(b.type==='code')return `<div class="code-block"><div class="code-label"><span>代码</span>${window.READING_JOURNAL?'<button class="code-copy" data-copy-code>复制代码</button>':''}</div><pre><code>${escape(b.text)}</code></pre></div>`;
    if(b.type==='figure'){
      const figure=`<figure${window.READING_JOURNAL&&b.presentation?` class="${escape(b.presentation)}"`:''}><a href="${escape(b.src)}" target="_blank" rel="noopener noreferrer" aria-label="${window.READING_JOURNAL?'放大原文配图':'在新标签页查看原文配图'}"><img src="${escape(b.src)}" alt="${escape(b.alt||'原文配图')}" ${b.width?`width="${Number(b.width)}"`:''} ${b.height?`height="${Number(b.height)}"`:''} loading="lazy" decoding="async"></a>${b.caption?`<figcaption>${escape(b.caption)}</figcaption>`:''}</figure>`;
      return window.READING_JOURNAL&&b.presentation==='intro-animation'?`<details class="opening-media"><summary>原文开篇动画</summary>${figure}</details>`:figure;
    }
    if(b.type==='table')return `<div class="table-scroll" role="region" aria-label="原文表格" tabindex="0"><table>${b.rows.map((r,i)=>`<tr>${r.map(c=>`<${i===0?'th':'td'}>${escape(c)}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</table></div>`;
    return `<p>${escape(b.text)}</p>`;
  }
  function outlineIsDrawer(){return persistentToc&&outlineMode()==='narrow'&&!document.querySelector('#toc-panel').hidden;}
  function setOutlineGroup(disclosure,open){
    if(!disclosure)return;
    document.getElementById(disclosure.dataset.outlineGroup).hidden=!open;
    disclosure.setAttribute('aria-expanded',String(open));
    disclosure.setAttribute('aria-label',(open?'收起小节：':'展开小节：')+disclosure.closest('.outline-chapter').querySelector('[data-jump]').textContent);
  }
  function focusOutline(){
    const nav=document.querySelector('#reader-toc');
    (nav.querySelector('[aria-current]')||nav.querySelector('button')||document.querySelector('#toc-toggle')).focus({preventScroll:true});
  }
  function setOutline(open,remember=true){
    const panel=document.querySelector('#toc-panel'),toggle=document.querySelector('#toc-toggle'),scrim=reader.querySelector('.outline-scrim');
    const focused=document.activeElement,wasDrawer=reader.classList.contains('outline-drawer')&&!panel.hidden;
    currentOutlineMode=outlineMode();const drawer=currentOutlineMode==='narrow';
    panel.hidden=!open;toggle.hidden=open;toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'收起文章目录':'展开文章目录');toggle.title=open?'收起文章目录':'展开文章目录';
    reader.classList.toggle('toc-minimized',!open);reader.classList.toggle('outline-docked',!drawer);reader.classList.toggle('outline-drawer',drawer);
    scrim.hidden=!open||!drawer;
    for(const node of reader.querySelectorAll('#reader-content,#close-reader,.reading-tools,#settings-panel'))node.inert=open&&drawer;
    if(open){const active=panel.querySelector('[aria-current]');setOutlineGroup(active?.closest('.outline-chapter')?.querySelector('[data-outline-group]'),true);active?.classList.remove('current');}

    if(reader.open&&open&&((drawer&&(remember||!wasDrawer))||focused===toggle))focusOutline();
    if(reader.open&&!open&&(panel.contains(focused)||focused===scrim||wasDrawer))toggle.focus({preventScroll:true});
    document.dispatchEvent(new CustomEvent('reading:panel',{detail:{id:'toc-panel',open,persistent:true}}));scheduleProgress();
  }
  function syncOutlineMode(){
    if(!persistentToc)return;
    if(currentOutlineMode!==outlineMode())setOutline(!document.querySelector('#toc-panel').hidden,false);
  }
  function numberOutlineHeadings(headings){
    const candidates=new Map(headings.map(h=>[h.index,h.text.match(/^(?:\|\s*)?(\d+(?:\.\d+)*)\s+(.+)$/)]));
    // A number in a title is not a chapter index. Confirm the article's numbering sequence.
    const sequence=[];let previous=null;
    for(const h of headings){
      const match=candidates.get(h.index);if(!match||match[1].includes('.'))continue;
      const value=Number(match[1]);
      if(previous===null?(value===0||value===1):(value>previous&&value<=previous+2)){
        sequence.push(h.index);previous=value;
      }
    }
    const numbered=new Set(sequence.length>=2?sequence:[]);let parent=null;
    return headings.map(h=>{
      const match=candidates.get(h.index),main=numbered.has(h.index);
      const child=!main&&!!match&&match[1].includes('.')&&parent!==null&&Number(match[1].split('.')[0])===parent;
      if(main)parent=Number(match[1]);else if(!child)parent=null;
      const indexed=main||child;
      return {...h,child,number:indexed?match[1]:'',label:indexed?match[2]:h.text};
    });
  }
  function outlineHTML(headings){
    const chapters=[];let current=null;
    for(const heading of headings){
      const child=heading.child;
      if(child&&current)current.children.push(heading);
      else{current={...heading,children:[],child};chapters.push(current);}
    }
    const button=(h,child=false)=>{
      return `<button class="${child?'subchapter ':''}${h.number?'':'is-unindexed'}" data-jump="section-${h.index}" aria-label="${escape(h.text)}" data-outline-decorated="true"><span class="toc-number">${escape(h.number)}</span>${h.number?' ':''}<span class="toc-label">${escape(h.label)}</span></button>`;
    };
    return '<button class="outline-start" data-jump="reader-title">文章开头</button><ol class="outline-chapters">'+chapters.map(h=>`<li class="outline-chapter"><div class="outline-chapter-heading">${button(h,h.child)}${h.children.length?`<button class="outline-disclosure" data-outline-group="outline-group-${h.index}" aria-controls="outline-group-${h.index}" aria-expanded="false" aria-label="展开小节：${escape(h.text)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg></button>`:''}</div>${h.children.length?`<ol id="outline-group-${h.index}" class="outline-subchapters" hidden>${h.children.map(c=>`<li>${button(c,true)}</li>`).join('')}</ol>`:''}</li>`).join('')+'</ol>';
  }
  function setPanel(id,open,remember=true){
    if(persistentToc&&id==='toc-panel'){setOutline(open,remember);return;}
    document.querySelector('#'+id).hidden=!open;
    const toggle=document.querySelector(id==='toc-panel'?'#toc-toggle':'#settings-toggle');toggle.setAttribute('aria-expanded',String(open));
    document.dispatchEvent(new CustomEvent('reading:panel',{detail:{id,open}}));
  }
  function closePanels(){if(!persistentToc)setPanel('toc-panel',false);setPanel('settings-panel',false);}
  function togglePanel(id){const willOpen=document.querySelector('#'+id).hidden;closePanels();if(persistentToc&&id==='settings-panel'&&willOpen&&outlineMode()==='narrow')setPanel('toc-panel',false);setPanel(id,willOpen);}
  function applyReadingPreferences(){
    reader.style.setProperty('--body-size',fontSize+'px');reader.querySelector('.prose')?.classList.toggle('sans',sansBody);reader.querySelector('.reader-paper')?.classList.toggle('wide',wideBody);
    reader.classList.toggle('hide-decor',hideDecor);reader.classList.toggle('reader-wide',wideBody);syncOutlineMode();
    const decorationToggle=document.querySelector('#decoration-toggle');
    if(decorationToggle){decorationToggle.setAttribute('aria-pressed',String(hideDecor));decorationToggle.textContent=hideDecor?'已收起':'显示全部';}
    document.querySelector('#font-size-label').value=String(fontSize);
    reader.querySelector('[data-size="-1"]').disabled=fontSize===17;reader.querySelector('[data-size="1"]').disabled=fontSize===24;
    reader.querySelectorAll('[data-font]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.font==='sans')===sansBody)));
    reader.querySelectorAll('[data-width]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.width==='wide')===wideBody)));
    try{localStorage.setItem('jianwei-outline-preview-reading',JSON.stringify({size:fontSize,sans:sansBody,wide:wideBody,hideDecor}));}catch{}
    document.dispatchEvent(new CustomEvent('reading:preferences'));
  }
  let progressFrame=0;
  function updateReadingProgress(){
    progressFrame=0;if(!reader.open)return;
    const max=reader.scrollHeight-reader.clientHeight,percent=max>0?(max-reader.scrollTop<=1?100:Math.min(100,Math.max(0,reader.scrollTop/max*100))):100;
    document.querySelector('#reading-progress-fill').style.width=percent+'%';
    if(persistentToc)reader.querySelectorAll('.outline-chapter').forEach(li=>li.classList.remove('contains-current'));
    const toolbarBottom=reader.querySelector('.reading-toolbar').getBoundingClientRect().bottom;
    const title=reader.querySelector('#reader-title');reader.classList.toggle('reader-scrolled',!!title&&title.getBoundingClientRect().bottom<toolbarBottom);
    const viewport=reader.getBoundingClientRect(),readingTop=Math.max(viewport.top,toolbarBottom);
    // Follow the reading focus in the upper third, before the prior section leaves view.
    const readingLine=readingTop+Math.max(0,Math.min(viewport.bottom,window.innerHeight)-readingTop)/3;
    const headings=reader.querySelectorAll('.prose h2,.prose h3');
    let section=persistentToc?title:null;
    headings.forEach(h=>{if(h.getBoundingClientRect().top<=readingLine)section=h;});
    if(percent===100&&headings.length)section=headings[headings.length-1];
    document.querySelectorAll('#reader-toc [data-jump]').forEach(b=>{
      const active=b.dataset.jump===section?.id,wasActive=b.classList.contains('current');b.classList.toggle('current',active);
      if(active){const chapter=b.closest('.outline-chapter');chapter?.classList.add('contains-current');b.setAttribute('aria-current','location');
        if(persistentToc&&!wasActive)setOutlineGroup(chapter?.querySelector('[data-outline-group]'),true);
        if(persistentToc&&!wasActive&&b.getClientRects().length){const nav=document.querySelector('#reader-toc'),box=nav.getBoundingClientRect(),item=b.getBoundingClientRect();if(item.top<box.top)nav.scrollTop+=item.top-box.top;else if(item.bottom>box.bottom)nav.scrollTop+=item.bottom-box.bottom;}}
      else b.removeAttribute('aria-current');
    });
  }
  function scheduleProgress(){if(!progressFrame)progressFrame=requestAnimationFrame(updateReadingProgress);}
  function openReader(id,button=null,deep=false){
    const a=articles.find(a=>a.id===id);if(!a||!['full','text-full'].includes(a.bodyStatus))return;
    document.dispatchEvent(new CustomEvent('reading:reader-before'));
    if(!reader.open){openingButton=button;scrollBeforeReading=window.scrollY;deepReader=deep;titleBeforeReading=document.title;readerAccount=location.hash.startsWith('#account/')?a.account:null;}
    currentArticle=a;document.title=a.title+' — 求索';closePanels();reader.classList.remove('reader-scrolled');
    const headings=numberOutlineHeadings(a.blocks.map((b,i)=>({...b,index:i})).filter(b=>b.type==='heading'));
    const headingByIndex=new Map(headings.map(h=>[h.index,h]));
    const chapterButtons=headings.map(b=>`<button class="${b.child?'subchapter':''}" data-jump="section-${b.index}">${escape(b.text)}</button>`).join('');
    document.querySelector('#reader-toc').innerHTML=persistentToc?outlineHTML(headings):chapterButtons||'<button data-jump="reader-title">文章开头</button>';
    document.querySelector('#reader-toc').scrollTop=0;
    if(persistentToc){const sub=headings.filter(b=>b.child).length;document.querySelector('#outline-summary').textContent=headings.length?`${headings.length-sub}章${sub?`，${sub}小节`:''}`:'按原文顺序阅读';}
    if(persistentToc)setOutline(true,false);
    document.querySelector('#reader-save').innerHTML=saveButton(a,true);document.querySelector('#current-reading-title').textContent=a.title;
    const readingList=(readerAccount?articles.filter(x=>x.account===readerAccount):articles).slice().sort((x,y)=>(y.date+y.time).localeCompare(x.date+x.time));
    const next=readingList.slice(readingList.indexOf(a)+1).find(x=>['full','text-full'].includes(x.bodyStatus));
    const continuation=next?`<div class="next-reading"><span>${readerAccount?'本号下一篇':'继续阅读'}${!readerAccount?` · ${escape(next.account)}`:''}</span><button data-next="${next.id}">${escape(next.title)}</button></div>`:readerAccount?`<div class="source-reading-end"><p>本号已收录的全文已读至最后一篇</p><div><button class="text-button" data-return-brief>返回本号简报</button><a href="#channels">浏览其他来源</a></div></div>`:'';
    const publisherName=persistentToc?(a.account.match(/\p{Script=Han}{1,2}|[A-Za-z0-9]+|./gu)||[]).map(part=>`<span class="publisher-part">${escape(part)}</span>`).join(''):escape(a.account);
    document.querySelector('#reader-content').innerHTML=`<article class="reader-paper"><header><div class="reader-meta"><span class="account-name">${publisherName}</span><time datetime="${a.date}T${a.time}:00+08:00">${date(a)} ${a.time}</time></div><h1 id="reader-title" tabindex="-1">${titleHTML(a.title)}</h1></header><div class="prose">${a.blocks.map((b,index)=>blockHTML(b,index,headingByIndex.get(index)?.child)).join('')}</div>${a.bodyStatus==='text-full'?`<p class="archive-note">${escape(a.bodyNote)}</p>`:''}${continuation}</article>`;
    reader.querySelectorAll('img').forEach(img=>{img.addEventListener('load',scheduleProgress,{once:true});img.addEventListener('error',()=>{img.hidden=true;const note=document.createElement('span');note.className='image-fallback';note.textContent='这张配图暂未加载，点击查看原图';img.parentElement.append(note);scheduleProgress();},{once:true});});
    applyReadingPreferences();document.body.style.overflow='hidden';if(!reader.open)reader.showModal();syncOutlineMode();reader.scrollTop=0;scheduleProgress();if(outlineIsDrawer())focusOutline();
    document.dispatchEvent(new CustomEvent('reading:reader',{detail:{id:a.id}}));
  }
  reader.addEventListener('toggle',scheduleProgress,true);
  reader.addEventListener('scroll',scheduleProgress,{passive:true});window.addEventListener('resize',scheduleProgress);
  document.addEventListener('reading:typeset',scheduleProgress);
  // Font loading, figure expansion and layout settings can change the scroll range.
  if(typeof ResizeObserver==='function')new ResizeObserver(scheduleProgress).observe(document.querySelector('#reader-content'));
  let navigating=false;
  reader.addEventListener('close',()=>{
    closePanels();if(persistentToc){for(const node of reader.querySelectorAll('[inert]'))node.inert=false;}document.body.style.overflow='';currentArticle=null;if(navigating){navigating=false;openingButton=null;return;}
    document.title=titleBeforeReading;if(deepReader){deepReader=false;history.replaceState(null,'','#home');route();}else{if(location.hash==='#saved')bookmarks();window.scrollTo(0,scrollBeforeReading);if(openingButton?.isConnected)openingButton.focus({preventScroll:true});}openingButton=null;
  });
  document.querySelector('#close-reader').addEventListener('click',()=>reader.close());
  document.querySelector('#toc-toggle').addEventListener('click',()=>togglePanel('toc-panel'));document.querySelector('#settings-toggle').addEventListener('click',()=>togglePanel('settings-panel'));
  if(persistentToc)window.addEventListener('resize',()=>{if(reader.open)syncOutlineMode();});
  reader.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',()=>{fontSize=Math.max(17,Math.min(24,fontSize+Number(b.dataset.size)));applyReadingPreferences();scheduleProgress();}));
  reader.querySelectorAll('[data-font]').forEach(b=>b.addEventListener('click',()=>{sansBody=b.dataset.font==='sans';applyReadingPreferences();scheduleProgress();}));
  reader.querySelectorAll('[data-width]').forEach(b=>b.addEventListener('click',()=>{wideBody=b.dataset.width==='wide';applyReadingPreferences();scheduleProgress();}));
  document.querySelector('#decoration-toggle')?.addEventListener('click',()=>{hideDecor=!hideDecor;applyReadingPreferences();scheduleProgress();});
  document.querySelector('#reset-reading').addEventListener('click',()=>{fontSize=20;sansBody=false;wideBody=false;hideDecor=true;applyReadingPreferences();scheduleProgress();});
  reader.addEventListener('click',e=>{if(!e.target.closest('.reader-panel,.reading-tools'))closePanels();});
  function setFocus(active){focusMode=active;document.body.classList.toggle('site-focus',active);const button=document.querySelector('#focus-toggle');button.setAttribute('aria-pressed',String(active));button.querySelector('span').textContent=active?'退出专注':'专注阅读';button.setAttribute('title',active?'退出专注阅读':'专注阅读');button.setAttribute('aria-label',active?'退出专注阅读':'专注阅读');}
  document.querySelector('#focus-toggle').addEventListener('click',()=>setFocus(!focusMode));
  let toastTimer;function toast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2000);}
  function toggleSave(id){
    const a=articles.find(a=>a.id===id);if(!a)return;saved.has(id)?saved.delete(id):saved.add(id);
    try{localStorage.setItem('jianwei-outline-preview-saved',JSON.stringify([...saved]));}catch{toast('当前浏览器无法保存收藏');}
    document.querySelectorAll('[data-save]').forEach(b=>{if(b.dataset.save!==id)return;b.classList.toggle('saved',saved.has(id));b.setAttribute('aria-pressed',String(saved.has(id)));b.setAttribute('aria-label',(saved.has(id)?'取消稍后读：':'加入稍后读：')+a.title);b.title=saved.has(id)?'取消稍后读':'加入稍后读';b.querySelector('span').textContent=saved.has(id)?'已收藏':'稍后读';});
    updateSavedCount();if(location.hash==='#saved'&&!reader.open)bookmarks();toast(saved.has(id)?'已加入稍后读':'已取消稍后读');
    document.dispatchEvent(new CustomEvent('reading:saved',{detail:{id}}));
  }
  function route(){
    if(renderedPage==='channels')directory.scroll=window.scrollY;
    if(reader.open){navigating=true;deepReader=false;reader.close();}
    let parts;try{parts=decodeURIComponent(location.hash.slice(1)).split('/');}catch{parts=['home'];}
    const page=parts[0]||'home';if(page==='channels')setFocus(false);
    document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===(page==='account'?'channels':page==='article'?'home':page);a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(page==='channels')channels();else if(page==='account')account(parts[1]);else if(page==='saved')bookmarks();else home();
    renderedPage=page;document.title=(page==='account'?parts[1]:page==='saved'?'稍后读':page==='channels'?'关注的公众号':'精选阅读')+' — 求索';window.scrollTo(0,page==='channels'?directory.scroll:0);
    document.dispatchEvent(new CustomEvent('reading:route',{detail:{page}}));
    if(page==='article'){if(parts[2]==='body')openReader(parts[1],null,true);else document.querySelector('#brief-'+CSS.escape(parts[1]||''))?.scrollIntoView();}
  }
  document.addEventListener('click',event=>{
    const filter=event.target.closest('[data-source-filter]');if(filter){directory.filter=filter.dataset.sourceFilter;directory.scroll=0;renderSources(true);return;}
    const clear=event.target.closest('[data-clear-sources]');if(clear){directory.query='';directory.filter='全部';main.querySelector('#source-query').value='';renderSources(true);main.querySelector('#source-query').focus();return;}
    const related=event.target.closest('[data-related]');if(related){directory.query='';directory.filter=related.dataset.related;directory.scroll=0;history.pushState(null,'','#channels');route();main.focus({preventScroll:true});return;}
    const request=event.target.closest('[data-request-account]');if(request){showUpdate(request.dataset.requestAccount);return;}
    if(event.target.closest('[data-return-brief]')){reader.close();return;}
    const read=event.target.closest('[data-read]');if(read){openReader(read.dataset.read,read);return;}
    const next=event.target.closest('[data-next]');if(next){openReader(next.dataset.next);reader.querySelector('#reader-title').focus({preventScroll:true});return;}
    const save=event.target.closest('[data-save]');if(save){toggleSave(save.dataset.save);return;}
    const minimize=event.target.closest('[data-minimize-outline]');if(minimize){setPanel('toc-panel',false);return;}
    const disclosure=event.target.closest('[data-outline-group]');if(disclosure){setOutlineGroup(disclosure,document.getElementById(disclosure.dataset.outlineGroup).hidden);return;}
    const jump=event.target.closest('[data-jump]');if(jump){const heading=reader.querySelector('#'+CSS.escape(jump.dataset.jump));closePanels();if(persistentToc&&outlineMode()==='narrow')setPanel('toc-panel',false);heading?.scrollIntoView({behavior:'auto',block:'start'});heading?.focus({preventScroll:true});scheduleProgress();return;}
    const panel=event.target.closest('[data-close-panel]');if(panel){setPanel(panel.dataset.closePanel,false);return;}
    const link=event.target.closest('a[href^="#"]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.button!==0)return;
    if(link.getAttribute('href')==='#main'){event.preventDefault();main.focus();return;}
    event.preventDefault();history.pushState(null,'',link.getAttribute('href'));route();main.focus({preventScroll:true});
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Tab'&&reader.open&&outlineIsDrawer()){
      const panel=document.querySelector('#toc-panel'),controls=[document.querySelector('#toc-toggle'),document.querySelector('#outline-variant'),...panel.querySelectorAll('button')].filter(b=>b.getClientRects().length);
      const index=controls.indexOf(document.activeElement);
      if(e.shiftKey&&index<=0){e.preventDefault();controls.at(-1).focus({preventScroll:true});}
      else if(!e.shiftKey&&(index<0||index===controls.length-1)){e.preventDefault();controls[0].focus({preventScroll:true});}
      return;
    }
    if(e.key!=='Escape')return;
    if(reader.open&&!document.querySelector('#settings-panel').hidden){e.preventDefault();closePanels();}
    else if(reader.open&&!document.querySelector('#toc-panel').hidden){e.preventDefault();setPanel('toc-panel',false);}
    else if(reader.open){e.preventDefault();reader.close();}else if(focusMode)setFocus(false);
  });
  const update=document.querySelector('#update-dialog');let updatePrompt='更新今日简报';
  function showUpdate(name=''){updatePrompt=name?'补采 '+name:'更新今日简报';document.querySelector('#update-title').textContent=name?'补采 '+name:'更新今日简报';document.querySelector('#update-description').textContent=name?'复制下方口令，发送到项目会话。助手会查找并核验本号文章，完成后更新阅读库。':'在项目会话中发送下方口令。完成采集与整理后，这里会展示新的内容。';document.querySelector('#update-prompt').textContent=updatePrompt;update.showModal();}
  document.querySelector('#update-help').addEventListener('click',()=>showUpdate());document.querySelector('#close-dialog').addEventListener('click',()=>update.close());
  update.addEventListener('click',e=>{if(e.target!==update)return;const r=update.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)update.close();});
  document.querySelector('#copy-prompt').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(updatePrompt);toast('已复制口令，请发送到项目会话');}catch{toast('请在会话中输入：'+updatePrompt);}});
  updateSavedCount();route();window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
})();



(() => {
  const palettes=window.JIANWEI_PALETTES;
  const current={id:'current',name:'现有白灰蓝',description:'当前采用的配色，作为比较基准。',colors:{page:'#ffffff',chrome:'#f6f7f9',ink:'#222830',muted:'#626b76',accent:'#365a85',line:'#dfe3e8'}};
  const proposals=[...palettes,current],root=document.documentElement;
  const property={page:'--page',chrome:'--chrome',panel:'--bg',raised:'--raised',ink:'--ink',muted:'--muted',accent:'--accent',line:'--line',soft:'--accent-soft',strong:'--edge-strong',hover:'--accent-hover',application:'--application-ink',veil:'--veil'};
  let selected='indigo';
  function apply(id){
    const palette=proposals.find(p=>p.id===id)||palettes[0];selected=palette.id;
    for(const name of Object.values(property))root.style.removeProperty(name);
    if(selected==='current')delete root.dataset.palette;
    else {root.dataset.palette=selected;for(const [key,value] of Object.entries(palette.colors))root.style.setProperty(property[key],value);}
    const url=new URL(location.href);url.searchParams.set('palette',selected);history.replaceState(null,'',url);
    document.querySelector('meta[name="theme-color"]').content=palette.colors.page;
    document.querySelectorAll('[data-palette-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.paletteChoice===selected)));
    document.querySelectorAll('[data-palette-open]').forEach(button=>button.title=`配色预览：${palette.name}`);
    const status=document.querySelector('#palette-status');if(status)status.textContent=`当前预览：${palette.name}`;
  }
  // Image URLs are resolved against the real archive; no article file is copied or recolored.
  const articleRoot=new URL('../prototype/',location.href);
  window.READING_DATA.articles.forEach(article=>article.blocks.forEach(block=>{if(block.type==='figure')block.src=new URL(block.src,articleRoot).href;}));
  apply(new URL(location.href).searchParams.get('palette'));
  document.addEventListener('DOMContentLoaded',()=>{
    const dialog=document.querySelector('#palette-dialog');
    document.querySelector('#palette-choices').innerHTML=proposals.map(p=>`<button class="palette-choice" data-palette-choice="${p.id}" aria-pressed="${p.id===selected}"><span class="palette-samples" aria-hidden="true"><i style="background:${p.colors.page};border-color:${p.colors.line}"></i><i style="background:${p.colors.chrome}"></i><i style="background:${p.colors.accent}"></i></span><span><strong>${p.name}</strong><small>${p.description}</small></span><span class="palette-check" aria-hidden="true">✓</span></button>`).join('');
    let opener=null;
    function close(){dialog.close();}
    document.querySelectorAll('[data-palette-open]').forEach(button=>button.addEventListener('click',()=>{
      opener=button;const overflow=document.querySelector('#masthead-overflow');
      if(overflow.open){overflow.open=false;opener=overflow.querySelector('summary');}
      document.querySelectorAll('[data-palette-open]').forEach(b=>b.setAttribute('aria-expanded','true'));
      dialog.showModal();dialog.querySelector('[aria-pressed="true"]').focus();
    }));
    document.querySelector('#palette-close').addEventListener('click',close);
    dialog.addEventListener('click',event=>{
      const button=event.target.closest('[data-palette-choice]');if(button){apply(button.dataset.paletteChoice);close();}
      else if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();}
    });
    dialog.addEventListener('close',()=>{document.querySelectorAll('[data-palette-open]').forEach(b=>b.setAttribute('aria-expanded','false'));if(opener?.isConnected)opener.focus({preventScroll:true});});
    // Keep the topmost dialog's Escape from also closing the article beneath it.
    document.addEventListener('keydown',event=>{
      if(!dialog.open)return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
      else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    apply(selected);
  });
})();

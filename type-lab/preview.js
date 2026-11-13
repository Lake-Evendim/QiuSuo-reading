(()=>{
  const proposals=window.TYPE_VARIANTS,params=new URL(location.href).searchParams;
  function apply(id){
    const option=proposals.find(v=>v.id===id)||proposals[0];
    document.documentElement.dataset.fontVariant=option.id;
    const picker=document.querySelector('#font-variant');if(picker)picker.value=option.id;
    const info=document.querySelector('#font-size-info');if(info)info.textContent=option.chinese+' / '+option.latin+' · 来源名 '+option.size+'px';
    const url=new URL(location.href);url.searchParams.set('type',option.id);history.replaceState(null,'',url);
  }
  apply(params.get('type'));
  document.addEventListener('DOMContentLoaded',()=>{
    function groupPublisher(){
      const source=document.querySelector('.reader-meta .account-name');
      if(!source||source.dataset.grouped)return;
      const text=source.textContent,tokens=text.match(/\p{Script=Han}{1,2}|[A-Za-z0-9]+|./gu)||[];
      source.replaceChildren(...tokens.map(token=>{const span=document.createElement('span');span.textContent=token;return span;}));
      source.dataset.grouped='true';
    }
    groupPublisher();
    new MutationObserver(groupPublisher).observe(document.querySelector('#reader-content'),{childList:true});
    const picker=document.querySelector('#font-variant');
    picker.innerHTML=proposals.map(v=>`<option value="${v.id}">${v.label} ${v.name}</option>`).join('');
    picker.addEventListener('change',()=>apply(picker.value));apply(params.get('type'));
    document.querySelector('#close-reader').addEventListener('click',event=>{
      event.preventDefault();event.stopImmediatePropagation();
      const url=new URL(document.body.dataset.typeIndex,document.baseURI);const article=location.hash.match(/#article\/([^/]+)/)?.[1];if(article)url.searchParams.set('sample',article);url.searchParams.set('round',proposals.find(v=>v.id===picker.value)?.round||'new');location.href=url;
    },true);
  });
})();

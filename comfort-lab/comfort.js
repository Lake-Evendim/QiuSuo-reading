(() => {
  const themes = {
    warmgray: {name:'A 暖灰纸面',base:'#f2f1eb',sunk:'#e8e8df',raised:'#f7f6f0',ink:'#33352f',muted:'#63665d',line:'#d4d6ca',green:'#596449',greenSolid:'#596449',greenTint:'#e6e9dc',brown:'#796454',brownSolid:'#796454',brownTint:'#ebe4dc',onSolid:'#f8f7f1',button:'#33352f',onButton:'#f2f1eb'},
    paper: {name:'B 暖纸',base:'#f2ece0',sunk:'#e8dfcf',raised:'#f8f2e7',ink:'#3c3730',muted:'#6b6257',line:'#d9cfbd',green:'#59634a',greenSolid:'#59634a',greenTint:'#e5e6d6',brown:'#79614e',brownSolid:'#79614e',brownTint:'#e9dfd2',onSolid:'#f8f2e7',button:'#3c3730',onButton:'#f2ece0'},
    sage: {name:'C 浅鼠尾草',base:'#eaf0e7',sunk:'#dfe7db',raised:'#f2f6ef',ink:'#30382e',muted:'#5c6857',line:'#cbd5c6',green:'#506548',greenSolid:'#506548',greenTint:'#dce6d5',brown:'#766353',brownSolid:'#766353',brownTint:'#e6e2d8',onSolid:'#f2f6ef',button:'#30382e',onButton:'#eaf0e7'},
    night: {name:'D 夜间石墨',base:'#242622',sunk:'#1f211d',raised:'#30332c',ink:'#d9dcd4',muted:'#abb2a3',line:'#44493e',green:'#b6c29f',greenSolid:'#3c4736',greenTint:'#2d3528',brown:'#cfb4a4',brownSolid:'#4a4038',brownTint:'#332e28',onSolid:'#e1e7d6',button:'#b6c29f',onButton:'#242622'},
    white: {name:'对照 · 原白底',base:'#ffffff',sunk:'#f3f3f0',raised:'#ffffff',ink:'#292a28',muted:'#686a65',line:'#ddded8',green:'#626b50',greenSolid:'#626b50',greenTint:'#eff1e9',brown:'#7b655d',brownSolid:'#7b655d',brownTint:'#f3efeb',onSolid:'#ffffff',button:'#292a28',onButton:'#ffffff'}
  };
  const root=document.documentElement,params=new URL(location.href).searchParams;
  let selected=themes[params.get('theme')]?params.get('theme'):'warmgray';
  function apply(theme,updateUrl=false){
    selected=theme;root.dataset.comfort=theme;
    for(const [key,value] of Object.entries(themes[theme]))if(key!=='name')root.style.setProperty('--comfort-'+key,value);
    root.style.colorScheme=theme==='night'?'dark':'light';
    document.querySelector('meta[name=theme-color]')?.setAttribute('content',themes[theme].base);
    if(document.body){
      for(const cls of [...document.body.classList])if(cls.startsWith('comfort-tone-'))document.body.classList.remove(cls);
      document.body.classList.add('comfort-tone-'+theme);
    }
    document.querySelectorAll('[data-comfort-picker]').forEach(p=>p.value=theme);
    if(updateUrl){const url=new URL(location.href);url.searchParams.set('theme',theme);history.replaceState(null,'',url);}
  }
  apply(selected);
  window.addEventListener('DOMContentLoaded',()=>{
    const options=Object.entries(themes).map(([id,t])=>`<option value="${id}">${t.name}</option>`).join('');
    document.querySelector('.reading-tools').insertAdjacentHTML('afterbegin',`<label class="comfort-reader-picker"><span class="visually-hidden">切换阅读底色</span><select id="comfort-theme-reader" data-comfort-picker aria-label="切换阅读底色">${options}</select></label>`);
    const site=document.querySelector('#comfort-theme-site');site.innerHTML=options;
    document.querySelectorAll('[data-comfort-picker]').forEach(p=>p.addEventListener('change',()=>apply(p.value,true)));
    apply(selected,true);
    const updateRoute=()=>document.querySelectorAll('[data-comfort-route]').forEach(a=>{
      const article=location.hash.startsWith('#article/');
      a.setAttribute('aria-current',a.dataset.comfortRoute===(article?'reader':'channels')?'page':'false');
    });
    document.addEventListener('reading:route',updateRoute);updateRoute();
  });
})();

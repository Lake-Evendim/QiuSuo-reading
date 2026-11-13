(() => {
  const palettes=window.JIANWEI_PALETTES;
  const container=document.querySelector('#proposals');
  container.innerHTML=palettes.map(p=>`<article class="proposal" style="--card-page:${p.colors.page};--card-accent:${p.colors.accent}"><a class="screen-link" href="reading.html?palette=${p.id}#home" aria-label="预览${p.name}"><img src="previews/palette-${p.id}-home.png" alt="${p.name}精选首页的实际截图" width="1280" height="800"></a><div class="proposal-heading"><h2>${p.name}</h2><span class="recommendation">${p.recommendation}</span></div><p>${p.description}</p><ul class="palette-strip" aria-label="${p.name}配色"><li><i style="background:${p.colors.page}"></i>底色 ${p.colors.page.toUpperCase()}</li><li><i style="background:${p.colors.ink}"></i>墨色 ${p.colors.ink.toUpperCase()}</li><li><i style="background:${p.colors.accent}"></i>强调 ${p.colors.accent.toUpperCase()}</li></ul><div class="proposal-links"><a class="primary-link" href="reading.html?palette=${p.id}#home">完整预览</a><a href="reading.html?palette=${p.id}#article/streameval/body">阅读全文</a><a href="reading.html?palette=${p.id}#channels">公众号目录</a></div></article>`).join('');
  const scenes={home:{hash:'home',name:'精选首页'},reader:{hash:'article/streameval/body',name:'原文阅读'}};
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
    const scene=button.dataset.scene;
    document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelectorAll('.screen-link').forEach((link,index)=>{const p=palettes[index];link.href=`reading.html?palette=${p.id}#${scenes[scene].hash}`;const img=link.querySelector('img');img.src=`previews/palette-${p.id}-${scene}.png`;img.alt=`${p.name}${scenes[scene].name}的实际截图`;});
  }));
})();

(() => {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let articles = [], current = 0;
  const nav = document.querySelector('#article-nav');
  const previous = document.querySelector('#previous'), next = document.querySelector('#next');
  function brief(version) {
    const end = version.takeaway.search(/[。！？]/u);
    const boundary = end < 0 ? version.takeaway.length : end + 1;
    const reason = `<strong>${escape(version.takeaway.slice(0,boundary))}</strong>${escape(version.takeaway.slice(boundary))}`;
    return `<div class="brief"><p class="reason">${reason}</p><p>${version.points.slice(0,2).map(escape).join('')}</p>${version.points.length>2?`<p>${version.points.slice(2).map(escape).join('')}</p>`:''}</div>`;
  }
  function render() {
    const a = articles[current];
    if (!a) return;
    nav.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-current', index === current ? 'true' : 'false'));
    document.querySelector('#comparison').innerHTML = `<p class="article-meta">${escape(a.account)} · ${escape(a.date)}</p><h2 id="article-title">${escape(a.title)}</h2><div class="comparison-columns"><article aria-label="原版简报"><header class="version-header"><h3>原版</h3><span>${a.oldCharacters} 字</span></header>${brief(a.old)}</article><article aria-label="重写版简报"><header class="version-header"><h3>重写版</h3><span>${a.newCharacters} 字</span></header>${brief(a.new)}</article></div><details class="change-note"><summary>改写说明</summary><p>${escape(a.change)}</p></details>`;
    document.querySelector('#position').textContent = `${current + 1} / ${articles.length}`;
    previous.disabled = current === 0; next.disabled = current === articles.length - 1;
    document.title = `${a.label} · 简报新旧对照`;
  }
  function select(index) {
    if (index < 0 || index >= articles.length) return;
    current = index;
    history.replaceState(null, '', `#${articles[current].id}`);
    render();
  }
  previous.addEventListener('click', () => select(current - 1));
  next.addEventListener('click', () => select(current + 1));
  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-index]');
    if (button) select(Number(button.dataset.index));
  });
  window.addEventListener('hashchange', () => {
    const index = articles.findIndex(a => a.id === location.hash.slice(1));
    if (index >= 0) { current = index; render(); }
  });
  fetch('comparison-data.json').then(response => {
    if (!response.ok) throw new Error('无法加载对照稿');
    return response.json();
  }).then(data => {
    articles = data.articles;
    nav.innerHTML = articles.map((a, i) => `<button type="button" data-index="${i}" aria-current="false"><span>${String(i+1).padStart(2,'0')}</span>${escape(a.label)}</button>`).join('');
    const initial = articles.findIndex(a => a.id === location.hash.slice(1));
    current = initial >= 0 ? initial : 0;
    render();
  }).catch(error => {
    const message = document.querySelector('#load-error');
    message.hidden = false;
    message.textContent = `${error.message}，请刷新重试。`;
    previous.disabled = next.disabled = true;
  });
})();

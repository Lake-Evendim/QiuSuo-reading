(() => {
  const root = document.documentElement;
  let mode = new URL(location.href).searchParams.get('mode') === 'original' ? 'original' : 'polish';
  root.dataset.channelPolish = mode;
  if (!location.hash) history.replaceState(null, '', location.pathname + location.search + '#channels');
  const syncControls = () => document.querySelectorAll('[data-polish-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.polishMode === mode)));
  document.addEventListener('DOMContentLoaded', () => {
    syncControls();
    // The site redraws the directory on routing; observe only its child structure.
    new MutationObserver(syncControls).observe(document.querySelector('#main'), {childList:true,subtree:true});
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-polish-mode]');
    if (!button) return;
    mode = button.dataset.polishMode;
    root.dataset.channelPolish = mode;
    syncControls();
    const url = new URL(location.href);
    url.searchParams.set('mode', mode);
    history.replaceState(null, '', url);
  });
})();

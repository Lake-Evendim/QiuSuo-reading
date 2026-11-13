(() => {
  const root = document.documentElement;
  let version = new URL(location.href).searchParams.get('version') === 'original' ? 'original' : 'refined';
  root.dataset.channelRefine = version;
  if (!location.hash) history.replaceState(null, '', location.pathname + location.search + '#channels');
  function apply(next) {
    version = next;
    root.dataset.channelRefine = version;
    document.querySelectorAll('[data-refine-version]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.refineVersion === version)));
    const url = new URL(location.href);
    url.searchParams.set('version', version);
    history.replaceState(null, '', url);
  }
  document.addEventListener('DOMContentLoaded', () => {
    apply(version);
    document.querySelectorAll('[data-refine-version]').forEach(button => button.addEventListener('click', () => apply(button.dataset.refineVersion)));
  });
})();

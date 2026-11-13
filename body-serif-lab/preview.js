(() => {
  const root = document.documentElement;
  let font = new URL(location.href).searchParams.get('font') === 'original' ? 'original' : 'zhisong';
  root.dataset.bodySerif = font;
  if (!location.hash) history.replaceState(null, '', location.pathname + location.search + '#article/swift-decision/body');
  document.addEventListener('DOMContentLoaded', () => {
    const picker = document.querySelector('#body-font-preview');
    picker.value = font;
    const syncSize = () => {
      const size = document.querySelector('#font-size-label').value;
      picker.options[0].textContent = '霞鹜致宋 · ' + size;
      picker.options[1].textContent = '原宋体 · ' + size;
    };
    syncSize();
    document.addEventListener('reading:preferences', syncSize);
    picker.addEventListener('change', () => {
      font = picker.value;
      root.dataset.bodySerif = font;
      const url = new URL(location.href);
      url.searchParams.set('font',font);
      history.replaceState(null,'',url);
      document.querySelector('[data-font=serif]').click();
      document.dispatchEvent(new CustomEvent('reading:typeset'));
    });
    document.fonts.ready.then(() => document.dispatchEvent(new CustomEvent('reading:typeset')));
  });
})();

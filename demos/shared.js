// Language and theme switch shared by the demos.
// A page sets window.I18N = {en: {...}, pt: {...}} before loading this file,
// marks static text with data-i18n="key" and reacts to changes with Demo.onChange(fn).
(() => {
  const q = new URLSearchParams(location.search);
  const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const pick = (v, ok) => ok.includes(v) ? v : null;
  // the URL always wins over the saved choice, so a shared ?lang=pt link opens in Portuguese
  const state = {
    lang: pick(q.get('lang'), ['en', 'pt']) || pick(get('demo-lang'), ['en', 'pt']) || 'en',
    theme: pick(q.get('theme'), ['dark', 'light']) || pick(get('demo-theme'), ['dark', 'light'])
      || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  };
  const listeners = [];
  const dict = () => (window.I18N || {})[state.lang] || {};
  const base = {}; // English text as written in the HTML, restored when switching back
  let baseTitle = null;

  const bar = document.createElement('div');
  bar.className = 'switch';
  bar.innerHTML = `
    <div class="seg-ctl" role="group" aria-label="Language">
      <button data-lang="en">EN</button><button data-lang="pt">PT</button>
    </div>
    <button class="theme-btn" data-theme-btn><iconify-icon></iconify-icon></button>`;

  function apply(notify) {
    const root = document.documentElement;
    root.lang = state.lang === 'pt' ? 'pt-BR' : 'en';
    root.dataset.theme = state.theme;
    const d = dict();
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (!(k in base)) base[k] = el.innerHTML;
      el.innerHTML = d[k] ?? base[k];
    });
    baseTitle ??= document.title;
    document.title = d._title ?? baseTitle;
    bar.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === state.lang));
    const tb = bar.querySelector('[data-theme-btn]');
    tb.querySelector('iconify-icon').setAttribute('icon', state.theme === 'dark' ? 'ph:sun' : 'ph:moon');
    tb.setAttribute('aria-label', state.theme === 'dark' ? 'Light theme' : 'Dark theme');
    if (notify) listeners.forEach(f => f(state));
  }

  bar.addEventListener('click', e => {
    const l = e.target.closest('[data-lang]'), t = e.target.closest('[data-theme-btn]');
    if (l && l.dataset.lang !== state.lang) { state.lang = l.dataset.lang; set('demo-lang', state.lang); apply(true); }
    if (t) { state.theme = state.theme === 'dark' ? 'light' : 'dark'; set('demo-theme', state.theme); apply(false); }
  });

  window.Demo = {
    state,
    t: k => dict()[k] ?? (window.I18N || {}).en?.[k] ?? k,
    // pick the current language from {en, pt}, falling back to English
    pick: v => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[state.lang] ?? v.en) : v,
    onChange: f => listeners.push(f),
  };
  document.body.prepend(bar);
  apply(false);
})();

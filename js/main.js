/* Điều khiển trang: hộp quà mở đầu, thẻ quà từng người, lật lời chúc, nhạc và hiệu ứng */
(function () {
  'use strict';

  const C = window.CONTENT;
  const { flower, wreath, giftBox, icon } = window.ART;
  const FX = window.FX;
  const Music = window.Music;

  const root = document.documentElement;
  const body = document.body;
  const app = document.getElementById('app');
  const ROOT = body.dataset.root || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const people = C.people;
  const ORD = ['nhất', 'hai', 'ba', 'tư', 'năm'];

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const find = (slug) => people.find((p) => p.slug === slug);
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 150) : ms));
  const hashSlug = () => {
    try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return ''; }
  };

  // Mở thẳng quà của một người: link riêng (…/me/), #me hoặc ?to=me
  const target = find(body.dataset.person) || find(hashSlug()) || find(new URLSearchParams(location.search).get('to'));

  /* ---------- Dựng giao diện ---------- */

  function portrait(p, cls) {
    return `
      <div class="portrait ${cls}"${p.photo ? ` data-photo="${esc(p.photo)}"` : ''}>
        <div class="portrait__photo">
          <div class="portrait__fallback">${flower(p.theme)}</div>
          ${p.photo ? `<img alt="${esc(p.name)}" decoding="async">` : ''}
        </div>
        ${wreath(p.theme)}
      </div>`;
  }

  function renderIntro() {
    const t = target ? target.intro : C.intro;
    return `
      <section class="intro theme-${target ? target.theme : 'rose'}" id="intro">
        <p class="intro__eyebrow">20 · 10 · ${esc(C.year)}</p>
        <h1 class="intro__title script">${esc(t.title)}</h1>
        <button class="gift" id="gift" type="button" aria-label="Mở hộp quà">${giftBox()}</button>
        <p class="intro__hint" aria-hidden="true">${esc(t.hint)}</p>
      </section>`;
  }

  function renderCard(p, i) {
    return `
      <article class="card theme-${p.theme} reveal" style="--d:${(i * 0.12).toFixed(2)}s" data-open="${esc(p.slug)}">
        ${portrait(p, 'card__portrait')}
        <h3 class="card__name script">${esc(p.name)}</h3>
        <p class="card__tagline">${esc(p.tagline)}</p>
        <button class="btn card__btn" type="button" data-open="${esc(p.slug)}" aria-label="Mở quà của ${esc(p.name)}">${icon('gift')}<span>Mở quà</span></button>
      </article>`;
  }

  function renderHome() {
    const H = C.hero, G = C.gifts, F = C.finale;
    return `
      <main class="home" id="home">
        <header class="hero">
          <p class="hero__date reveal" aria-label="20 tháng 10"><span>20</span>${flower('rose', 'hero__flower')}<span>10</span></p>
          <h1 class="hero__title reveal" style="--d:.12s">
            <span class="script">${esc(H.title)}</span>
            <span class="hero__sub">${esc(H.subtitle)}</span>
          </h1>
          <p class="hero__lead reveal" style="--d:.24s">${esc(H.lead)}</p>
          <p class="hero__names reveal" style="--d:.34s">${people.map((p) => `<span class="theme-${p.theme}">${esc(p.name)}</span>`).join('<i aria-hidden="true">·</i>')}</p>
          <button class="btn hero__cta reveal" style="--d:.46s" type="button" data-scroll="#gifts"><span>Mở quà</span>${icon('down')}</button>
        </header>

        <section class="gifts" id="gifts" aria-labelledby="gifts-title">
          <h2 class="section-title script reveal" id="gifts-title">${esc(G.title)}</h2>
          <p class="section-sub reveal" style="--d:.1s">${esc(G.subtitle)}</p>
          <div class="cards">${people.map(renderCard).join('')}</div>
        </section>

        <section class="finale" aria-labelledby="finale-title">
          <div class="finale__card reveal">
            <div class="finale__flowers">${people.map((p) => `<span class="theme-${p.theme}">${flower(p.theme)}</span>`).join('')}</div>
            <h2 class="finale__title script" id="finale-title">${esc(F.title)}</h2>
            <p class="finale__text">${esc(F.text)}</p>
            <button class="btn" type="button" data-hearts>${icon('heart')}<span>${esc(F.button)}</span></button>
          </div>
        </section>

        <footer class="footer">${esc(C.footer)}</footer>
      </main>`;
  }

  function renderWish(p, w, k) {
    return `
      <li class="wish" style="--i:${k}">
        <div class="wish__inner">
          <button class="wish__face wish__front" type="button" aria-label="Mở lời chúc thứ ${ORD[k] || k + 1}">
            ${flower(p.theme, 'wish__deco')}
            <span class="wish__num" aria-hidden="true">${k + 1}</span>
            <span class="wish__tap" aria-hidden="true">${icon('gift')}Chạm để mở</span>
          </button>
          <div class="wish__face wish__back" tabindex="-1">
            <h3 class="wish__title script">${esc(w.title)}</h3>
            <p class="wish__text">${esc(w.text)}</p>
          </div>
        </div>
      </li>`;
  }

  function renderSheet(p) {
    return `
      <div class="sheet__scrim" data-close></div>
      <article class="sheet__card">
        <button class="sheet__close" type="button" data-close aria-label="Đóng">${icon('close')}</button>
        <header class="sheet__head">
          ${portrait(p, 'sheet__portrait')}
          <h2 class="sheet__name script" id="sheet-title">${esc(p.name)}</h2>
          <p class="sheet__heading">${esc(p.heading)}</p>
          <p class="sheet__progress">
            <span class="sheet__hearts" aria-hidden="true">${p.wishes.map(() => icon('heart')).join('')}</span>
            <span class="sheet__count" aria-live="polite"></span>
          </p>
        </header>
        <ol class="wishes">${p.wishes.map((w, k) => renderWish(p, w, k)).join('')}</ol>
        <footer class="sheet__end" hidden>
          ${p.outro ? `<p class="sheet__outro script">${esc(p.outro)}</p>` : ''}
          <div class="sheet__actions">
            <button class="btn" type="button" data-hearts>${icon('heart')}<span>Thả tim</span><span class="btn__count" hidden></span></button>
          </div>
        </footer>
      </article>`;
  }

  function renderMusicButton() {
    if (!Music.enabled) return '';
    return `
      <button class="music" id="music" type="button" aria-label="Nhạc nền" aria-pressed="false" hidden>
        <span class="music__icon">${icon('note')}</span>
        <span class="music__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </button>`;
  }

  app.innerHTML =
    renderIntro() +
    renderHome() +
    '<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" hidden></div>' +
    renderMusicButton();

  const intro = document.getElementById('intro');
  const home = document.getElementById('home');
  const sheet = document.getElementById('sheet');
  const giftBtn = document.getElementById('gift');

  root.classList.add('is-locked');
  body.classList.add('is-intro');
  home.inert = true;

  /* ---------- Ảnh: tự thử .jpg/.jpeg/.png/.webp; không có thì giữ bông hoa ---------- */

  const photoCache = {};
  function candidates(path) {
    if (/^(https?:|data:|\/)/.test(path)) return [path];
    const base = path.replace(/\.[a-z0-9]{2,5}$/i, '');
    return [...new Set([path, base + '.jpg', base + '.jpeg', base + '.png', base + '.webp', base + '.JPG'])].map((x) => ROOT + x);
  }
  function resolvePhoto(path) {
    if (!photoCache[path]) {
      photoCache[path] = new Promise((resolve) => {
        const list = candidates(path);
        let i = 0;
        const tryNext = () => {
          if (i >= list.length) return resolve(null);
          const src = list[i++];
          const probe = new Image();
          probe.onload = () => resolve(src);
          probe.onerror = tryNext;
          probe.src = src;
        };
        tryNext();
      });
    }
    return photoCache[path];
  }
  function loadPhotos(scope) {
    scope.querySelectorAll('.portrait[data-photo]').forEach((el) => {
      resolvePhoto(el.dataset.photo).then((src) => {
        const img = src && el.querySelector('img');
        if (!img) return;
        const show = () => el.classList.add('has-photo');
        img.addEventListener('load', show, { once: true });
        img.src = src;
        if (img.complete && img.naturalWidth) show();
      });
    });
  }
  loadPhotos(home);

  /* ---------- Mở hộp quà ---------- */

  giftBtn.addEventListener('click', openIntro);

  async function openIntro() {
    if (body.classList.contains('is-opening')) return;
    body.classList.add('is-opening');
    Music.start(); // phải gọi ngay trong lúc chạm để trình duyệt cho phát tiếng
    giftBtn.classList.add('is-open');
    await wait(320);
    const r = giftBtn.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height * 0.4, { count: 46, power: 1.2, up: true, colors: themeColors(intro) });
    await wait(1250);
    intro.classList.add('is-leaving');
    body.classList.remove('is-intro');
    home.inert = false;
    root.classList.remove('is-locked');
    startReveal();
    showMusicButton();
    if (target) openSheet(target.slug);
    await wait(900);
    intro.remove();
  }

  function startReveal() {
    const els = [...home.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => io.observe(el));
  }

  function showMusicButton() {
    const b = document.getElementById('music');
    if (!b) return;
    b.hidden = false;
    b.addEventListener('click', () => Music.toggle());
    Music.onchange = (on) => {
      b.classList.toggle('is-playing', on);
      b.setAttribute('aria-pressed', String(on));
    };
    Music.onchange(Music.playing);
  }

  /* ---------- Thẻ quà của từng người ---------- */

  let current = null, pushed = false, lastFocus = null;

  function openSheet(slug) {
    const p = find(slug);
    if (!p) return;
    const switching = !!current;
    if (!switching) lastFocus = document.activeElement;
    current = p;
    sheet.className = `sheet theme-${p.theme}${switching ? ' is-open' : ''}`;
    sheet.innerHTML = renderSheet(p);
    sheet.hidden = false;
    sheet.scrollTop = 0;
    loadPhotos(sheet);
    root.classList.add('is-locked');
    home.inert = true;
    if (!switching) {
      void sheet.offsetWidth; // để hiệu ứng hiện dần chạy từ đầu
      sheet.classList.add('is-open');
    }
    sheet.querySelector('.sheet__close').focus({ preventScroll: true });
    updateProgress(false);
  }

  function closeSheet() {
    if (!current) return;
    current = null;
    pushed = false;
    sheet.classList.remove('is-open');
    home.inert = false;
    root.classList.remove('is-locked');
    setTimeout(() => {
      if (!current) {
        sheet.hidden = true;
        sheet.innerHTML = '';
      }
    }, reduceMotion ? 0 : 380);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  // Mở bằng #slug để nút Back của điện thoại đóng được thẻ
  function goTo(slug) {
    pushed = true;
    location.hash = slug;
  }

  function requestClose() {
    if (!current) return;
    if (pushed) {
      history.back();
    } else {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      closeSheet();
    }
  }

  window.addEventListener('hashchange', () => {
    const p = find(hashSlug());
    if (p) {
      if (!current || current.slug !== p.slug) openSheet(p.slug);
    } else {
      closeSheet();
    }
  });

  function openWish(li) {
    if (!li || li.classList.contains('is-open')) return;
    li.classList.add('is-open');
    const back = li.querySelector('.wish__back');
    setTimeout(() => back.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
    const r = li.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 24, colors: themeColors(sheet) });
    updateProgress(true);
  }

  function updateProgress(celebrate) {
    if (!current) return;
    const items = [...sheet.querySelectorAll('.wish')];
    const opened = items.filter((li) => li.classList.contains('is-open')).length;
    sheet.querySelectorAll('.sheet__hearts .icon').forEach((h, i) => h.classList.toggle('is-on', i < opened));
    const nextLi = items.find((li) => !li.classList.contains('is-open'));
    items.forEach((li) => li.classList.toggle('is-next', li === nextLi));
    sheet.querySelector('.sheet__count').textContent =
      opened === 0 ? 'Chạm vào từng thẻ để mở'
        : opened < items.length ? `Đã mở ${opened}/${items.length} lời chúc`
          : 'Mở hết rồi nè!';
    if (celebrate && opened === items.length) finish();
  }

  async function finish() {
    const p = current;
    await wait(700);
    if (current !== p) return;
    const end = sheet.querySelector('.sheet__end');
    end.hidden = false;
    FX.confetti({ colors: themeColors(sheet) });
    end.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  /* ---------- Thả tim ---------- */

  function sendHearts(btn) {
    const r = btn.getBoundingClientRect();
    FX.hearts(r.left + r.width / 2, r.top + 4, { colors: themeColors(btn) });
    btn.classList.remove('is-pop');
    void btn.offsetWidth; // chạy lại hiệu ứng nảy
    btn.classList.add('is-pop');
    const count = btn.querySelector('.btn__count');
    if (count) {
      count.textContent = String(Number(count.textContent || 0) + 1);
      count.hidden = false;
    }
  }

  function themeColors(el) {
    const cs = getComputedStyle(el.closest('[class*="theme-"]') || root);
    const v = (name) => cs.getPropertyValue(name).trim();
    return [v('--accent'), v('--accent-2'), v('--accent-soft'), v('--accent-2'), '#ffd166', '#ffffff'].filter(Boolean);
  }

  /* ---------- Sự kiện ---------- */

  document.addEventListener('click', (e) => {
    const t = e.target.closest('.wish__front, [data-open], [data-close], [data-hearts], [data-scroll]');
    if (!t) return;
    if (t.classList.contains('wish__front')) openWish(t.closest('.wish'));
    else if (t.dataset.open) goTo(t.dataset.open);
    else if (t.hasAttribute('data-close')) requestClose();
    else if (t.hasAttribute('data-hearts')) sendHearts(t);
    else if (t.dataset.scroll) {
      const dest = document.querySelector(t.dataset.scroll);
      if (dest) dest.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current) requestClose();
  });
})();

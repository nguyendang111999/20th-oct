/* Hiệu ứng: cánh hoa rơi phía sau (canvas #petals) và pháo cánh hoa / tim phía trên (canvas #fx) */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PETAL_COLORS = ['#f8bbd0', '#f6a5c0', '#fcd3df', '#ffc6d3', '#fbe0e8', '#f49ab6'];
  const FX_COLORS = ['#f06292', '#f8bbd0', '#ffd166', '#ff8fab', '#ffffff', '#e64980'];

  function layer(id) {
    let c = document.getElementById(id);
    if (!c) {
      c = document.createElement('canvas');
      c.id = id;
      c.setAttribute('aria-hidden', 'true');
      document.body.prepend(c);
    }
    return { c, ctx: c.getContext('2d'), w: 0, h: 0 };
  }
  const bg = layer('petals');
  const fg = layer('fx');

  function size(L) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    L.w = window.innerWidth;
    L.h = window.innerHeight;
    L.c.width = Math.round(L.w * dpr);
    L.c.height = Math.round(L.h * dpr);
    L.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Cánh hoa anh đào: đầu có khía nhỏ
  function petalShape(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s * 1.05, s * 0.25, -s * 0.85, -s * 0.95, -s * 0.18, -s * 0.92);
    ctx.quadraticCurveTo(0, -s * 0.62, s * 0.18, -s * 0.92);
    ctx.bezierCurveTo(s * 0.85, -s * 0.95, s * 1.05, s * 0.25, 0, s);
    ctx.closePath();
  }

  function heartShape(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.9);
    ctx.bezierCurveTo(-s * 1.5, -s * 0.05, -s * 0.75, -s * 1.15, 0, -s * 0.4);
    ctx.bezierCurveTo(s * 0.75, -s * 1.15, s * 1.5, -s * 0.05, 0, s * 0.9);
    ctx.closePath();
  }

  function drawShape(ctx, p) {
    const s = p.s;
    if (p.shape === 'heart') { heartShape(ctx, s); ctx.fill(); }
    else if (p.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, TAU); ctx.fill(); }
    else if (p.shape === 'rect') { ctx.fillRect(-s * 0.35, -s * 0.7, s * 0.7, s * 1.4); }
    else { petalShape(ctx, s); ctx.fill(); }
  }

  /* ---------- Cánh hoa rơi nền ---------- */
  const ambient = [];

  function newPetal(anywhere) {
    return {
      x: rand(-20, bg.w + 20),
      y: anywhere ? rand(-bg.h * 0.1, bg.h) : rand(-80, -20),
      s: rand(5.5, 11),
      vy: rand(0.35, 0.95),
      vx: rand(-0.12, 0.28),
      sway: rand(0.35, 1),
      ph: rand(0, TAU),
      dph: rand(0.008, 0.02),
      rot: rand(0, TAU),
      vr: rand(-0.018, 0.018),
      flip: rand(0, TAU),
      vf: rand(0.012, 0.035),
      color: pick(PETAL_COLORS),
      a: rand(0.55, 0.9),
    };
  }

  function fillAmbient() {
    const want = reduce ? 0 : Math.round(Math.min(34, Math.max(14, (bg.w * bg.h) / 30000)));
    while (ambient.length < want) ambient.push(newPetal(true));
    ambient.length = want;
  }

  /* ---------- Hạt hiệu ứng ---------- */
  const parts = [];

  // Bung cánh hoa / tim từ một điểm
  function burst(x, y, o = {}) {
    if (reduce) return;
    const n = o.count || 28;
    const colors = o.colors || FX_COLORS;
    const shapes = o.shapes || ['petal', 'petal', 'heart', 'dot'];
    for (let i = 0; i < n; i++) {
      const ang = o.up ? rand(-Math.PI * 0.92, -Math.PI * 0.08) : rand(0, TAU);
      const sp = rand(2.2, 7.5) * (o.power || 1);
      parts.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 0.13, drag: 0.968,
        s: rand(4.5, 10), rot: rand(0, TAU), vr: rand(-0.2, 0.2), flip: rand(0, TAU), vf: rand(0.05, 0.16),
        life: 1, decay: rand(0.008, 0.015), shape: pick(shapes), color: pick(colors),
      });
    }
    wake();
  }

  // Tim bay lên (nút "Thả tim")
  function hearts(x, y, o = {}) {
    if (reduce) return;
    const n = o.count || 7;
    const colors = o.colors || FX_COLORS;
    for (let i = 0; i < n; i++) {
      parts.push({
        x: x + rand(-16, 16), y: y + rand(-6, 6), vx: rand(-0.7, 0.7), vy: rand(-3.2, -1.6), g: -0.01, drag: 0.992,
        s: rand(7, 14), rot: rand(-0.25, 0.25), vr: rand(-0.008, 0.008), flip: 0, vf: 0,
        sway: rand(0.4, 1.2), ph: rand(0, TAU),
        life: 1, decay: rand(0.008, 0.013), shape: 'heart', color: pick(colors),
      });
    }
    wake();
  }

  // Mưa hoa giấy từ trên xuống
  function confetti(o = {}) {
    if (reduce) return;
    const n = o.count || 70;
    const colors = o.colors || FX_COLORS;
    for (let i = 0; i < n; i++) {
      parts.push({
        x: rand(0, fg.w), y: rand(-fg.h * 0.25, -10), vx: rand(-1.2, 1.2), vy: rand(1.5, 4), g: 0.05, drag: 0.99,
        s: rand(5, 9), rot: rand(0, TAU), vr: rand(-0.15, 0.15), flip: rand(0, TAU), vf: rand(0.08, 0.2),
        life: 1, decay: rand(0.004, 0.007), shape: pick(['rect', 'petal', 'heart']), color: pick(colors),
      });
    }
    wake();
  }

  /* ---------- Vòng lặp vẽ ---------- */
  let raf = 0, last = 0, fgHadParts = false;

  function wake() {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    raf = 0;
    const dt = Math.min(3, Math.max(0.2, (now - last) / 16.667));
    last = now;

    if (ambient.length) {
      const ctx = bg.ctx;
      ctx.clearRect(0, 0, bg.w, bg.h);
      for (const p of ambient) {
        p.ph += p.dph * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        p.x += (p.vx + Math.sin(p.ph) * p.sway * 0.6) * dt;
        p.y += p.vy * dt;
        if (p.y > bg.h + 24 || p.x < -40 || p.x > bg.w + 40) Object.assign(p, newPetal(false));
        const fl = Math.cos(p.flip);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, fl);
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.abs(fl));
        ctx.fillStyle = p.color;
        petalShape(ctx, p.s);
        ctx.fill();
        ctx.restore();
      }
    }

    if (parts.length || fgHadParts) {
      const ctx = fg.ctx;
      ctx.clearRect(0, 0, fg.w, fg.h);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const k = Math.pow(p.drag, dt);
        p.vx *= k;
        p.vy = p.vy * k + p.g * dt;
        if (p.sway) {
          p.ph += 0.05 * dt;
          p.x += Math.sin(p.ph) * p.sway * 0.5 * dt;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0 || p.y > fg.h + 40 || (p.vy < 0 && p.y < -60)) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.vf) ctx.scale(1, Math.cos(p.flip));
        ctx.globalAlpha = Math.min(1, p.life * 1.6);
        ctx.fillStyle = p.color;
        drawShape(ctx, p);
        ctx.restore();
      }
      fgHadParts = parts.length > 0;
    }

    if (ambient.length || parts.length || fgHadParts) raf = requestAnimationFrame(tick);
  }

  let resizeRaf = 0;
  function onResize() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      size(bg);
      size(fg);
      fillAmbient();
      wake();
    });
  }

  size(bg);
  size(fg);
  fillAmbient();
  wake();
  window.addEventListener('resize', onResize);

  window.FX = { burst, hearts, confetti };
})();

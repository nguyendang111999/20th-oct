/* Hình vẽ SVG dùng chung: hoa, vòng hoa, hộp quà, biểu tượng */
(function () {
  'use strict';

  const r1 = (n) => Math.round(n * 10) / 10;

  // Một cánh hoa: gốc ở (0,0), ngọn ở (0,-len). round = ngọn tròn, ngược lại ngọn nhọn
  function petal(len, w, round) {
    return round
      ? `M0 0C${r1(w)} ${r1(-len * 0.2)} ${r1(w * 1.25)} ${r1(-len)} 0 ${r1(-len)}C${r1(-w * 1.25)} ${r1(-len)} ${r1(-w)} ${r1(-len * 0.2)} 0 0Z`
      : `M0 0C${r1(w)} ${r1(-len * 0.25)} ${r1(w * 0.9)} ${r1(-len * 0.75)} 0 ${r1(-len)}C${r1(-w * 0.9)} ${r1(-len * 0.75)} ${r1(-w)} ${r1(-len * 0.25)} 0 0Z`;
  }

  // Mỗi người một loại hoa, theo màu chủ đạo
  const FLOWERS = {
    rose: {
      layers: [
        { n: 5, len: 47, w: 24, round: true, cls: 'fl-a', rot: 0 },
        { n: 5, len: 35, w: 19, round: true, cls: 'fl-b', rot: 36 },
        { n: 4, len: 22, w: 13, round: true, cls: 'fl-c', rot: 12 },
      ],
      center: '<circle class="fl-c" r="9"/><path class="fl-line" d="M-3.5 1a3.5 3.5 0 1 1 7 0a5.5 5.5 0 0 1-11 0"/>',
    },
    lilac: {
      layers: [
        { n: 10, len: 47, w: 11, round: false, cls: 'fl-a', rot: 0 },
        { n: 10, len: 36, w: 9, round: false, cls: 'fl-b', rot: 18 },
      ],
      center: '<circle class="fl-gold" r="11"/><circle class="fl-gold-2" r="5.5"/>',
    },
    sea: {
      layers: [
        { n: 5, len: 46, w: 21, round: true, cls: 'fl-a', rot: 0, shift: 9 },
        { n: 5, len: 24, w: 10, round: true, cls: 'fl-b', rot: 0, shift: 5 },
      ],
      center: '<circle class="fl-gold" r="6.5"/>',
    },
  };

  function flowerGroup(kind) {
    const f = FLOWERS[kind] || FLOWERS.rose;
    let g = '';
    for (const L of f.layers) {
      const d = petal(L.len, L.w, L.round);
      const shift = L.shift ? ` translate(${L.shift} 0)` : '';
      for (let i = 0; i < L.n; i++) {
        g += `<path class="${L.cls}" d="${d}" transform="rotate(${r1(L.rot + (360 / L.n) * i)})${shift}"/>`;
      }
    }
    return g + f.center;
  }

  function flower(kind, cls) {
    return `<svg class="flower flower--${kind}${cls ? ' ' + cls : ''}" viewBox="-52 -52 104 104" aria-hidden="true" focusable="false">${flowerGroup(kind)}</svg>`;
  }

  // Vòng lá ôm quanh ảnh: hai cành mọc từ dưới lên, có vài bông hoa nhỏ
  function wreath(kind) {
    const cx = 100, cy = 100, R = 91;
    const leaf = 'M0 0C4.2-3.6 4.6-10 0-15C-4.6-10-4.2-3.6 0 0Z';
    const at = (deg) => [cx + R * Math.cos((deg * Math.PI) / 180), cy + R * Math.sin((deg * Math.PI) / 180)];
    let stems = '', leaves = '', blooms = '';

    for (const dir of [1, -1]) {
      const a0 = 90 + dir * 14, a1 = 90 + dir * 160;
      const [x0, y0] = at(a0), [x1, y1] = at(a1);
      stems += `<path class="wr-stem" d="M${r1(x0)} ${r1(y0)}A${R} ${R} 0 0 ${dir > 0 ? 1 : 0} ${r1(x1)} ${r1(y1)}"/>`;

      const steps = 12;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const deg = a0 + (a1 - a0) * t;
        const [x, y] = at(deg);
        const grow = deg + dir * 90; // hướng mọc dọc theo cành
        const s = r1(1.05 - t * 0.45);
        for (const side of [-1, 1]) {
          const alt = (i + (side > 0 ? 1 : 0)) % 3 === 0 ? ' wr-leaf--alt' : '';
          leaves += `<path class="wr-leaf${alt}" d="${leaf}" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(grow + side * 32 + 90)}) scale(${s})"/>`;
        }
      }
      for (const [t, sc] of [[0.3, 0.2], [0.72, 0.15]]) {
        const [x, y] = at(a0 + (a1 - a0) * t);
        blooms += `<g transform="translate(${r1(x)} ${r1(y)}) scale(${sc})">${flowerGroup(kind)}</g>`;
      }
    }
    blooms += `<g transform="translate(${cx} ${cy + R}) scale(0.27)">${flowerGroup(kind)}</g>`;

    return `<svg class="wreath" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${stems}${leaves}${blooms}</svg>`;
  }

  const HEART = 'M0 7C-9-1-5.5-9 0-4.5C5.5-9 9-1 0 7Z';

  // Hộp quà ở màn hình mở đầu: nắp bay lên, tấm thiệp "20·10" trồi ra
  function giftBox() {
    const dots = [[56, 130], [80, 160], [58, 184], [142, 132], [166, 160], [146, 186]]
      .map(([x, y]) => `<circle class="gb-dot" cx="${x}" cy="${y}" r="4.5"/>`)
      .join('');
    return `<svg class="giftbox" viewBox="0 0 220 220" aria-hidden="true" focusable="false">
  <ellipse class="gb-shadow" cx="110" cy="203" rx="76" ry="9"/>
  <g class="gb-card">
    <rect class="gb-card-bg" x="64" y="104" width="92" height="80" rx="9"/>
    <text class="gb-card-num" x="110" y="139" text-anchor="middle">20·10</text>
    <path class="gb-card-heart" transform="translate(110 160)" d="${HEART}"/>
  </g>
  <g class="gb-body">
    <rect class="gb-box" x="36" y="104" width="148" height="94" rx="10"/>
    ${dots}
    <rect class="gb-shade" x="36" y="104" width="148" height="12"/>
    <rect class="gb-ribbon" x="98" y="104" width="24" height="94"/>
    <rect class="gb-ribbon-shade" x="116" y="104" width="6" height="94"/>
  </g>
  <g class="gb-lid">
    <rect class="gb-box" x="28" y="80" width="164" height="30" rx="8"/>
    <rect class="gb-hi" x="34" y="83" width="152" height="6" rx="3"/>
    <rect class="gb-ribbon" x="96" y="80" width="28" height="30"/>
    <path class="gb-bow" d="M110 80C92 48 56 52 64 74C68 84 96 84 110 80Z"/>
    <path class="gb-bow" d="M110 80C128 48 164 52 156 74C152 84 124 84 110 80Z"/>
    <path class="gb-bow-line" d="M108 78C97 61 80 61 79 71"/>
    <path class="gb-bow-line" d="M112 78C123 61 140 61 141 71"/>
    <ellipse class="gb-knot" cx="110" cy="79" rx="10" ry="8"/>
  </g>
</svg>`;
  }

  const ICONS = {
    heart: '<path d="M12 20.6s-7.6-4.6-9.3-9.5C1.5 7.6 3.8 4.4 7.2 4.4c2 0 3.6 1.1 4.8 2.9 1.2-1.8 2.8-2.9 4.8-2.9 3.4 0 5.7 3.2 4.5 6.7-1.7 4.9-9.3 9.5-9.3 9.5z"/>',
    gift: '<path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M2.5 7.5h19V12h-19zM12 22V7.5M12 7.5H7.8a2.3 2.3 0 0 1 0-4.6c3.2 0 4.2 4.6 4.2 4.6zm0 0h4.2a2.3 2.3 0 0 0 0-4.6c-3.2 0-4.2 4.6-4.2 4.6z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    note: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  };

  function icon(name, cls) {
    const paint = name === 'heart'
      ? 'fill="currentColor"'
      : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    return `<svg class="icon icon--${name}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" ${paint} aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
  }

  window.ART = { flower, flowerGroup, wreath, giftBox, icon };
})();

/* Nhạc nền: hộp nhạc tự soạn chạy bằng Web Audio, hoặc file mp3 nếu bạn thêm vào */
(function () {
  'use strict';

  const C = window.CONTENT || {};
  const ROOT = document.body.dataset.root || '';
  const setting = typeof C.music === 'string' ? C.music.trim() : 'auto';

  /* ---------- Hộp nhạc ---------- */
  // Giai điệu tự soạn, giọng Đô trưởng. Hợp âm mỗi ô nhịp: F – G – Em – Am – Dm – G – C – C
  const BPM = 72;
  const BEAT = 60 / BPM; // một phách
  const STEP = BEAT / 2; // một bước = một nốt móc đơn

  // Năm nốt của mỗi hợp âm (số MIDI, 60 = Đô giữa) để rải
  const CHORDS = [
    [53, 60, 65, 69, 72], // F
    [55, 62, 67, 71, 74], // G
    [52, 59, 64, 67, 71], // Em
    [57, 64, 69, 72, 76], // Am
    [50, 57, 62, 65, 69], // Dm
    [55, 62, 67, 71, 74], // G
    [48, 55, 60, 64, 67], // C
    [48, 55, 60, 64, 67], // C
  ];
  const ARP = [0, 1, 2, 3, 4, 3, 2, 1];

  // Giai điệu: [nốt, số phách], mỗi ô nhịp 4 phách; lượt hai lên cao hơn
  const MELODY = [
    [[81, 1], [79, 0.5], [81, 0.5], [84, 2]],
    [[86, 2], [83, 1], [79, 1]],
    [[79, 1], [76, 1], [79, 1], [83, 1]],
    [[81, 3], [76, 1]],
    [[77, 1], [81, 1], [86, 1], [84, 1]],
    [[83, 2], [81, 1], [79, 1]],
    [[79, 1], [76, 0.5], [79, 0.5], [84, 2]],
    [[84, 4]],
    [[84, 1], [81, 1], [84, 1], [86, 1]],
    [[86, 2], [83, 1], [86, 1]],
    [[88, 2], [86, 1], [83, 1]],
    [[84, 3], [81, 1]],
    [[81, 1], [79, 1], [77, 1], [81, 1]],
    [[79, 2], [83, 1], [86, 1]],
    [[88, 1], [86, 1], [84, 1], [83, 1]],
    [[84, 4]],
  ];
  const STEPS = MELODY.length * 8;
  const melodyAt = new Map();
  MELODY.forEach((bar, b) => {
    let beat = 0;
    for (const [note, beats] of bar) {
      melodyAt.set(b * 8 + Math.round(beat * 2), [note, beats]);
      beat += beats;
    }
  });

  function musicBox(onState) {
    let ctx = null, bus = null, master = null, timer = 0, step = 0, next = 0, on = false;
    const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      // iPhone: vẫn phát khi gạt nút im lặng
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* bỏ qua */ }
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      const tone = ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 5200;
      const verb = ctx.createConvolver();
      verb.buffer = impulse(2.6);
      const wet = ctx.createGain();
      wet.gain.value = 0.32;
      const comp = ctx.createDynamicsCompressor();
      bus = ctx.createGain();
      bus.connect(tone);
      tone.connect(master);
      tone.connect(verb);
      verb.connect(wet);
      wet.connect(master);
      master.connect(comp);
      comp.connect(ctx.destination);
      return true;
    }

    // Tiếng vang: nhiễu trắng tắt dần
    function impulse(sec) {
      const rate = ctx.sampleRate, len = Math.floor(rate * sec);
      const buf = ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
      }
      return buf;
    }

    // Một nốt hộp nhạc: âm chính ngân dài, thêm bồi âm sáng tắt nhanh cho tiếng "ting"
    function tine(t, midi, vel, ring) {
      const f = freq(midi);
      const partials = [
        [1, vel, ring],
        [2, vel * 0.45, Math.min(0.6, ring * 0.35)],
        [5.4, vel * 0.16, 0.12],
      ];
      for (const [mult, amp, dur] of partials) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        g.connect(bus);
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f * mult, t);
        o.connect(g);
        o.onended = () => g.disconnect();
        o.start(t);
        o.stop(t + dur + 0.05);
      }
    }

    function playStep(s, t) {
      const bar = Math.floor(s / 8), pos = s % 8;
      const chord = CHORDS[bar % CHORDS.length];
      const jitter = () => (Math.random() - 0.5) * 0.012;
      tine(t + jitter(), chord[ARP[pos]], 0.06 * (0.85 + Math.random() * 0.3), 1.3);
      if (pos === 0) tine(t, chord[0] - 12, 0.05, 2.4);
      const m = melodyAt.get(s);
      if (m) tine(t + jitter(), m[0], 0.18 * (0.9 + Math.random() * 0.2), Math.max(1.6, m[1] * BEAT * 1.5));
    }

    function pump() {
      while (next < ctx.currentTime + 0.3) {
        playStep(step, next);
        next += STEP;
        step = (step + 1) % STEPS;
      }
    }

    function fade(to, sec) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(to, t + sec);
    }

    return {
      start() {
        if (!ctx && !init()) return;
        if (ctx.state !== 'running') {
          ctx.resume().then(
            () => { if (ctx.state !== 'running' && on) { this.stop(); onState(); } },
            () => { if (on) { this.stop(); onState(); } }
          );
        }
        if (on) return;
        on = true;
        if (next < ctx.currentTime + 0.05) next = ctx.currentTime + 0.08;
        clearInterval(timer);
        timer = setInterval(pump, 80);
        pump();
        fade(0.8, 2.5);
      },
      stop() {
        if (!ctx || !on) return;
        on = false;
        clearInterval(timer);
        fade(0, 0.4);
        setTimeout(() => { if (!on) ctx.suspend(); }, 450);
      },
      get playing() { return on; },
    };
  }

  /* ---------- File mp3 ---------- */
  function filePlayer(url, onState) {
    const a = new Audio();
    const player = {
      broken: false,
      start() {
        const p = a.play();
        if (p && p.catch) p.catch(onState);
      },
      stop() { a.pause(); },
      get playing() { return !a.paused; },
    };
    a.loop = true;
    a.preload = 'auto';
    a.addEventListener('play', onState);
    a.addEventListener('pause', onState);
    a.addEventListener('error', () => { player.broken = true; onState(); });
    a.src = url;
    return player;
  }

  const isFile = !!setting && setting !== 'auto';
  const fileUrl = isFile ? (/^(https?:)?\/\//.test(setting) || setting.startsWith('/') ? setting : ROOT + setting) : '';
  let fileOk = null; // null = đang kiểm tra file có tồn tại không
  if (isFile) {
    fetch(fileUrl, { method: 'HEAD' }).then((r) => { fileOk = r.ok; }, () => { fileOk = false; });
  }

  let impl = null, resumeOnShow = false;
  const notify = () => { if (api.onchange) api.onchange(api.playing); };

  const api = {
    enabled: !!setting,
    onchange: null,
    start() {
      if (!api.enabled) return;
      // Không có file mp3 (hoặc file lỗi) thì dùng hộp nhạc
      if (!impl || impl.broken) impl = isFile && fileOk !== false && !(impl && impl.broken) ? filePlayer(fileUrl, notify) : musicBox(notify);
      impl.start();
      notify();
    },
    stop() {
      if (impl) impl.stop();
      notify();
    },
    toggle() {
      if (api.playing) api.stop();
      else api.start();
    },
    get playing() { return !!(impl && impl.playing); },
  };

  // Tạm dừng khi chuyển sang ứng dụng/tab khác, bật lại khi quay về
  document.addEventListener('visibilitychange', () => {
    if (!impl) return;
    if (document.hidden) {
      resumeOnShow = impl.playing;
      if (resumeOnShow) impl.stop();
    } else if (resumeOnShow) {
      resumeOnShow = false;
      impl.start();
    }
    notify();
  });

  window.Music = api;
})();

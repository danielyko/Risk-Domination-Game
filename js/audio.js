/* ============================================================
   AUDIO — procedural battle music + SFX via Web Audio API.
   No external files: everything is synthesized so the game
   works fully offline. Exposes a global `Sound` object.
   ============================================================ */

const Sound = (() => {
  let ctx = null;
  let musicGain = null;
  let sfxGain = null;
  let musicOn = true;
  let sfxOn = true;
  let musicTimer = null;
  let step = 0;

  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.32;
    musicGain.connect(ctx.destination);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(ctx.destination);
  }

  // --- low-level helpers ---
  function tone(freq, dur, type = "sine", gainVal = 0.3, dest = sfxGain, slideTo = null) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(gainVal, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(dest);
    o.start(); o.stop(ctx.currentTime + dur);
  }

  function noise(dur, gainVal = 0.4, dest = sfxGain, lp = 1800) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = lp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filt); filt.connect(g); g.connect(dest);
    src.start(); src.stop(ctx.currentTime + dur);
  }

  // --- background battle music: marching drums + tense bass/pad ---
  // Minor-key bass line over a war-drum pulse.
  const BASS = [55, 55, 82.4, 55, 49, 49, 65.4, 49]; // A1 pattern
  function loopStep() {
    if (!ctx || !musicOn) return;
    const beat = step % 8;
    // war drum: heavy on 0 & 4, snare-ish on 2 & 6
    if (beat % 2 === 0) noise(0.18, beat % 4 === 0 ? 0.5 : 0.28, musicGain, beat % 4 === 0 ? 220 : 900);
    // bass pulse
    tone(BASS[beat], 0.32, "sawtooth", 0.18, musicGain);
    // tension pad swell every bar
    if (beat === 0) {
      tone(220, 1.6, "triangle", 0.08, musicGain);
      tone(329.6, 1.6, "triangle", 0.06, musicGain);
    }
    // sparse high horn motif
    if (beat === 4) tone(440, 0.5, "square", 0.05, musicGain, 660);
    step++;
  }

  return {
    init() { ensure(); if (ctx.state === "suspended") ctx.resume(); },
    startMusic() {
      ensure();
      if (ctx.state === "suspended") ctx.resume();
      if (musicTimer) return;
      step = 0;
      musicTimer = setInterval(loopStep, 300); // ~100bpm eighth notes
    },
    stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } },
    toggleMusic() {
      musicOn = !musicOn;
      if (musicOn) this.startMusic(); else this.stopMusic();
      return musicOn;
    },
    toggleSfx() { sfxOn = !sfxOn; return sfxOn; },
    isMusicOn() { return musicOn; },
    isSfxOn() { return sfxOn; },

    // --- SFX ---
    dice() {
      if (!sfxOn || !ctx) return;
      for (let i = 0; i < 5; i++) setTimeout(() => noise(0.05, 0.3, sfxGain, 2500), i * 45);
    },
    cannon() {
      if (!sfxOn || !ctx) return;
      noise(0.4, 0.7, sfxGain, 700);
      tone(70, 0.4, "sawtooth", 0.4, sfxGain, 40);
    },
    conquer() {
      if (!sfxOn || !ctx) return;
      [523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => tone(f, 0.25, "square", 0.18, sfxGain), i * 90));
    },
    march() {
      if (!sfxOn || !ctx) return;
      for (let i = 0; i < 4; i++) setTimeout(() => noise(0.08, 0.22, sfxGain, 600), i * 110);
    },
    card() {
      if (!sfxOn || !ctx) return;
      tone(880, 0.12, "sine", 0.2, sfxGain);
      setTimeout(() => tone(1320, 0.2, "sine", 0.18, sfxGain), 80);
    },
    place() {
      if (!sfxOn || !ctx) return;
      tone(330, 0.08, "square", 0.15, sfxGain, 420);
    },
    defeat() {
      if (!sfxOn || !ctx) return;
      tone(220, 0.6, "sawtooth", 0.25, sfxGain, 80);
    },
    victory() {
      if (!sfxOn || !ctx) return;
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        setTimeout(() => tone(f, 0.4, "square", 0.2, sfxGain), i * 140));
    },
  };
})();

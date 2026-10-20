// Genera la música y los efectos de sonido del promo 100% con código (síntesis).
// Salida: public/soundtrack.wav (20 s, 44.1 kHz, estéreo, 16 bit)
import { writeFileSync } from "node:fs";

const SR = 44100;
const DUR = 20;
const BPM = 120;
const BEAT = 60 / BPM;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);

// Momentos clave (deben coincidir con las escenas en src/Promo.tsx)
const DROP = 3; // entra el beat completo
const CUTS = [3, 6, 11, 15]; // transiciones de escena
const PILLAR_HITS = [6.4, 7.9, 9.4]; // aparición de cada pilar
const LOGO = 15;
const END_FADE = 18.6;

const rand = (() => {
  let s = 1234567;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
})();
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function add(t0, len, fn, pan = 0, gain = 1) {
  const start = Math.floor(t0 * SR);
  const n = Math.floor(len * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= N) continue;
    const v = fn(i / SR, i);
    L[idx] += v * gl;
    R[idx] += v * gr;
  }
}

// ── Instrumentos ──
const kick = (t0, g = 1) =>
  add(t0, 0.45, (t) => {
    const f = 45 + 110 * Math.exp(-t * 28);
    const ph = 2 * Math.PI * (45 * t + (110 / 28) * (1 - Math.exp(-t * 28)));
    return Math.tanh(1.8 * Math.sin(ph) * Math.exp(-t * 7)) * 0.9 + (t < 0.004 ? rand() * 0.3 : 0) * (f > 0 ? 1 : 0);
  }, 0, g);

const snare = (t0, g = 0.5) => {
  let lp = 0;
  add(t0, 0.3, (t) => {
    const n = rand();
    lp += 0.6 * (n - lp);
    const noise = (n - lp) * Math.exp(-t * 16);
    const body = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30);
    return noise * 0.8 + body * 0.5;
  }, 0, g);
};

const hat = (t0, g = 0.16, pan = 0.25) => {
  let prev = 0;
  add(t0, 0.07, (t) => {
    const n = rand();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-t * 60);
  }, pan, g);
};

function bassNote(t0, len, midi, g = 0.32) {
  const f = mtof(midi);
  let lp = 0;
  add(t0, len, (t) => {
    const ph = (f * t) % 1;
    const saw = 2 * ph - 1;
    const sub = Math.sin(2 * Math.PI * f * t);
    const cutoff = 0.04 + 0.25 * Math.exp(-t * 9);
    lp += cutoff * (saw - lp);
    const env = Math.min(1, t * 200) * Math.min(1, (len - t) * 40);
    return (lp * 0.7 + sub * 0.6) * env;
  }, 0, g);
}

function pad(t0, len, midis, g = 0.06) {
  midis.forEach((m, k) => {
    [-0.08, 0.08].forEach((det, j) => {
      const f = mtof(m + det);
      let lp = 0;
      add(t0, len, (t) => {
        const saw = 2 * ((f * t + k * 0.13) % 1) - 1;
        lp += 0.05 * (saw - lp);
        const env = Math.min(1, t / 0.6) * Math.min(1, (len - t) / 0.5);
        return lp * env;
      }, j === 0 ? -0.6 : 0.6, g);
    });
  });
}

function pluck(t0, midi, g = 0.12, pan = 0) {
  const f = mtof(midi);
  add(t0, 0.5, (t) => {
    const tri = 1 - 4 * Math.abs(((f * t + 0.25) % 1) - 0.5);
    return tri * Math.exp(-t * 9);
  }, pan, g);
}

// ── Efectos ──
function whoosh(tCenter, len = 0.9, g = 0.35) {
  let lp = 0;
  add(tCenter - len * 0.6, len, (t) => {
    const x = t / len;
    const env = Math.sin(Math.PI * x) ** 2;
    const cutoff = 0.02 + 0.5 * Math.sin(Math.PI * x) ** 3;
    lp += cutoff * (rand() - lp);
    return lp * env * 2.2;
  }, 0, g);
}

function impact(t0, g = 0.9) {
  add(t0, 2.4, (t) => {
    const boom = Math.sin(2 * Math.PI * (38 * t + 60 * (1 - Math.exp(-t * 6)) / 6)) * Math.exp(-t * 1.6);
    const crack = rand() * Math.exp(-t * 25) * 0.5;
    return Math.tanh(2 * boom) * 0.9 + crack;
  }, 0, g);
}

function riser(t0, len, g = 0.22) {
  let lp = 0;
  add(t0, len, (t) => {
    const x = t / len;
    lp += (0.01 + 0.4 * x * x) * (rand() - lp);
    const tone = Math.sin(2 * Math.PI * (200 * t + 500 * x * t));
    return (lp * 1.6 + tone * 0.25) * x * x;
  }, 0, g);
}

function stampHit(t0, g = 0.5) {
  add(t0, 0.35, (t) => {
    const body = Math.sin(2 * Math.PI * (70 + 200 * Math.exp(-t * 40)) * t) * Math.exp(-t * 12);
    return Math.tanh(3 * body) * 0.8 + rand() * Math.exp(-t * 50) * 0.4;
  }, 0, g);
}

function ding(t0, midi = 88, g = 0.14) {
  const f = mtof(midi);
  add(t0, 0.9, (t) =>
    (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.01 * t)) * Math.exp(-t * 5),
  0.2, g);
}

// ── Arreglo ──
// Intro de tensión (0–3 s): drone grave + ticks tipo reloj
add(0, DROP, (t) => {
  const env = Math.min(1, t / 0.4);
  return (Math.sin(2 * Math.PI * 55 * t) + 0.3 * Math.sin(2 * Math.PI * 82.5 * t)) * env * 0.18;
});
for (let b = 0; b < DROP / BEAT; b++) hat(b * BEAT, 0.1, b % 2 ? 0.4 : -0.4);
impact(0.05, 0.7);
stampHit(0.35);
stampHit(1.45);
riser(1.6, DROP - 1.6, 0.25);

// Progresión en La menor: Am – F – C – G (un acorde por compás de 2 s)
const chords = [
  { root: 33, pad: [57, 60, 64] },
  { root: 29, pad: [57, 60, 65] },
  { root: 36, pad: [55, 60, 64] },
  { root: 31, pad: [55, 59, 62] },
];
for (let bar = 0; DROP + bar * 4 * BEAT < END_FADE + 1; bar++) {
  const t0 = DROP + bar * 4 * BEAT;
  const ch = chords[bar % 4];
  pad(t0, 4 * BEAT, ch.pad);
  for (let b = 0; b < 4; b++) {
    const tb = t0 + b * BEAT;
    if (tb >= DUR) break;
    const quiet = tb >= LOGO - 0.6 && tb < LOGO; // hueco antes del logo
    if (!quiet) kick(tb, 0.9);
    if (b % 2 === 1 && !quiet) snare(tb, 0.38);
    hat(tb + BEAT / 2, 0.14, 0.3);
    hat(tb + BEAT / 4, 0.06, -0.3);
    hat(tb + (3 * BEAT) / 4, 0.06, -0.3);
    bassNote(tb, BEAT * 0.45, ch.root + 12 * 0);
    bassNote(tb + BEAT / 2, BEAT * 0.4, ch.root + 12);
    if (bar % 2 === 1) pluck(tb + BEAT / 4, ch.pad[(b + 1) % 3] + 12, 0.07, b % 2 ? 0.5 : -0.5);
  }
}

// Efectos sincronizados con las escenas
CUTS.forEach((t) => whoosh(t, 0.8, 0.32));
PILLAR_HITS.forEach((t, i) => {
  stampHit(t, 0.35);
  ding(t + 0.05, 84 + i * 3, 0.1);
});
stampHit(4.5, 0.4); // "te falta dirección"
riser(LOGO - 2, 2, 0.28);
impact(LOGO, 1);
ding(LOGO + 0.1, 93, 0.12);
ding(17.2, 88, 0.1); // aparece el botón CTA

// ── Master: fade final, saturación suave y normalización ──
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = t > END_FADE ? Math.max(0, 1 - (t - END_FADE) / (DUR - END_FADE)) : 1;
  const fin = Math.min(1, t / 0.01);
  L[i] = Math.tanh(L[i] * 1.1) * fade * fin;
  R[i] = Math.tanh(R[i] * 1.1) * fade * fin;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;

const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4);
}
writeFileSync(new URL("../public/soundtrack.wav", import.meta.url), buf);
console.log("public/soundtrack.wav listo");

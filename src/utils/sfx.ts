import { guitarAudio } from './guitarAudio';

/** Tiny synthesized Windows XP / AIM style system sounds (no audio files needed). */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

interface Tone {
  f: number;
  t: number;
  d: number;
  type?: OscillatorType;
  g?: number;
  slideTo?: number;
}

function play(tones: Tone[]) {
  const c = getCtx();
  const master = guitarAudio.volume;
  if (!c || master <= 0) return;
  const now = c.currentTime + 0.02;
  for (const tone of tones) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.f, now + tone.t);
    if (tone.slideTo) osc.frequency.exponentialRampToValueAtTime(tone.slideTo, now + tone.t + tone.d);
    const peak = Math.max(0.0002, (tone.g ?? 0.22) * master);
    gain.gain.setValueAtTime(0.0001, now + tone.t);
    gain.gain.exponentialRampToValueAtTime(peak, now + tone.t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.t + tone.d);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + tone.t);
    osc.stop(now + tone.t + tone.d + 0.05);
  }
}

function noise(duration: number, amount: number, freq = 1800) {
  const c = getCtx();
  const master = guitarAudio.volume;
  if (!c || master <= 0) return;
  const len = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    // crinkly bursts — like crumpling paper
    const burst = Math.random() < 0.08 ? 1 : 0.25;
    data[i] = (Math.random() * 2 - 1) * burst * (1 - i / len);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 0.8;
  const gain = c.createGain();
  gain.gain.value = amount * master;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start();
}

export const sfx = {
  startup() {
    play([
      { f: 311.13, t: 0, d: 1.6, type: 'triangle', g: 0.14 },
      { f: 466.16, t: 0.16, d: 1.5, type: 'triangle', g: 0.13 },
      { f: 622.25, t: 0.34, d: 1.7, type: 'sine', g: 0.14 },
      { f: 783.99, t: 0.52, d: 1.6, type: 'sine', g: 0.09 },
      { f: 932.33, t: 0.7, d: 1.9, type: 'sine', g: 0.08 },
    ]);
  },
  logoff() {
    play([
      { f: 932.33, t: 0, d: 0.7, type: 'sine', g: 0.1 },
      { f: 622.25, t: 0.18, d: 0.8, type: 'triangle', g: 0.12 },
      { f: 466.16, t: 0.36, d: 1.1, type: 'triangle', g: 0.12 },
    ]);
  },
  doorOpen() {
    play([
      { f: 392, t: 0, d: 0.22, type: 'triangle', g: 0.18 },
      { f: 523.25, t: 0.11, d: 0.24, type: 'triangle', g: 0.18 },
      { f: 659.25, t: 0.22, d: 0.4, type: 'triangle', g: 0.2 },
    ]);
  },
  doorClose() {
    play([
      { f: 659.25, t: 0, d: 0.2, type: 'triangle', g: 0.18 },
      { f: 523.25, t: 0.11, d: 0.22, type: 'triangle', g: 0.18 },
      { f: 392, t: 0.22, d: 0.4, type: 'triangle', g: 0.2 },
    ]);
  },
  imReceive() {
    play([
      { f: 740, t: 0, d: 0.12, type: 'sine', g: 0.22, slideTo: 1180 },
      { f: 1180, t: 0.1, d: 0.2, type: 'sine', g: 0.16 },
    ]);
  },
  imSend() {
    play([{ f: 620, t: 0, d: 0.09, type: 'triangle', g: 0.14, slideTo: 420 }]);
  },
  ding() {
    play([
      { f: 1046.5, t: 0, d: 0.5, type: 'sine', g: 0.16 },
      { f: 784, t: 0.09, d: 0.6, type: 'sine', g: 0.12 },
    ]);
  },
  recycle() {
    noise(0.38, 0.55, 2200);
  },
  explode() {
    noise(0.55, 0.9, 400);
    play([{ f: 120, t: 0, d: 0.45, type: 'sawtooth', g: 0.12, slideTo: 40 }]);
  },
  win() {
    play([
      { f: 523.25, t: 0, d: 0.25, type: 'triangle', g: 0.16 },
      { f: 659.25, t: 0.12, d: 0.25, type: 'triangle', g: 0.16 },
      { f: 783.99, t: 0.24, d: 0.25, type: 'triangle', g: 0.16 },
      { f: 1046.5, t: 0.36, d: 0.6, type: 'triangle', g: 0.18 },
    ]);
  },
};

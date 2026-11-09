// Classical Nylon-String Guitar Synthesizer using Karplus-Strong physical modeling
export interface GuitarStringInfo {
  stringNumber: number; // 6 (low E) to 1 (high E)
  note: string;
  freq: number;
  label: string;
  color: string;
}

export const CLASSICAL_STRINGS: GuitarStringInfo[] = [
  { stringNumber: 6, note: 'E2', freq: 82.41, label: '6th String · E2', color: '#b45309' },
  { stringNumber: 5, note: 'A2', freq: 110.0, label: '5th String · A2', color: '#d97706' },
  { stringNumber: 4, note: 'D3', freq: 146.83, label: '4th String · D3', color: '#ca8a04' },
  { stringNumber: 3, note: 'G3', freq: 196.0, label: '3rd String · G3', color: '#65a30d' },
  { stringNumber: 2, note: 'B3', freq: 246.94, label: '2nd String · B3', color: '#0284c7' },
  { stringNumber: 1, note: 'E4', freq: 329.63, label: '1st String · E4', color: '#2563eb' },
];

// Notes inspired by Schubert's Serenade (D major) from chengcxi/rustyguitar
export const SERENADE_NOTES: { note: string; freq: number; stringNumber: number }[] = [
  { note: 'D3', freq: 146.83, stringNumber: 4 },
  { note: 'A3', freq: 220.0, stringNumber: 3 },
  { note: 'D4', freq: 293.66, stringNumber: 2 },
  { note: 'F#4', freq: 369.99, stringNumber: 1 },
  { note: 'A4', freq: 440.0, stringNumber: 1 },
  { note: 'G4', freq: 392.0, stringNumber: 1 },
  { note: 'E4', freq: 329.63, stringNumber: 1 },
  { note: 'B3', freq: 246.94, stringNumber: 2 },
  { note: 'F#3', freq: 185.0, stringNumber: 4 },
  { note: 'G3', freq: 196.0, stringNumber: 3 },
];

export type GuitarScaleMode = 'open-strings' | 'serenade';

export interface PluckEvent {
  note: string;
  freq: number;
  stringNumber: number;
  source: 'click' | 'scroll' | 'fretboard' | 'chord';
  timestamp: number;
}

type PluckListener = (event: PluckEvent) => void;

class ClassicalGuitarEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bodyFilter: BiquadFilterNode | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private listeners = new Set<PluckListener>();

  public enabled = true;
  public volume = 0.45;
  public mode: GuitarScaleMode = 'open-strings';
  private lastNote = '';
  private lastScrollPluckTime = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      // Warm classical cedar/spruce guitar body resonance filter
      this.bodyFilter = this.ctx.createBiquadFilter();
      this.bodyFilter.type = 'lowpass';
      this.bodyFilter.frequency.value = 2850;
      this.bodyFilter.Q.value = 0.7;

      // Subtle warm body boost around 190Hz
      const warmShelf = this.ctx.createBiquadFilter();
      warmShelf.type = 'peaking';
      warmShelf.frequency.value = 190;
      warmShelf.Q.value = 1.1;
      warmShelf.gain.value = 3.2;

      this.bodyFilter.connect(warmShelf);
      warmShelf.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public subscribe(fn: PluckListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(event: PluckEvent) {
    this.listeners.forEach((fn) => fn(event));
  }

  // Synthesize a realistic nylon-string Karplus-Strong audio buffer
  private getOrCreateBuffer(freq: number, note: string): AudioBuffer | null {
    const ctx = this.ensureContext();
    if (!ctx) return null;

    const key = `${note}_${freq.toFixed(2)}`;
    const cached = this.bufferCache.get(key);
    if (cached) return cached;

    const sampleRate = ctx.sampleRate;
    const duration = 2.3;
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // Period length in samples
    const period = Math.max(2, Math.round(sampleRate / freq));

    // Nylon-string warm excitation: soft-filtered noise + warm pluck pulse
    let prevNoise = 0;
    for (let i = 0; i < period; i++) {
      const white = Math.random() * 2 - 1;
      // One-pole lowpass on initial noise burst -> nylon flesh pluck warmth
      prevNoise = 0.62 * prevNoise + 0.38 * white;
      const triangle = 2 * Math.abs(2 * (i / period) - 1) - 1;
      data[i] = prevNoise * 0.72 + triangle * 0.28;
    }

    // Damping factor tuned slightly higher for bass strings, smooth decay for treble
    const decay = freq < 140 ? 0.9965 : freq < 260 ? 0.9955 : 0.9942;

    for (let i = period; i < totalSamples; i++) {
      const a = data[i - period];
      const b = data[i - period - 1] ?? a;
      // Weighted averaging creates authentic nylon string high-frequency roll-off
      data[i] = decay * (0.54 * a + 0.46 * b);
    }

    // Gentle fade-out at the very end to avoid any click
    const fadeSamples = Math.floor(sampleRate * 0.08);
    for (let i = 0; i < fadeSamples; i++) {
      const idx = totalSamples - 1 - i;
      data[idx] *= i / fadeSamples;
    }

    this.bufferCache.set(key, buffer);
    return buffer;
  }

  public pluckNote(
    freq: number,
    note: string,
    stringNumber: number,
    source: PluckEvent['source'] = 'fretboard',
    velocity = 0.85
  ) {
    if (!this.enabled && source !== 'fretboard' && source !== 'chord') return;

    const ctx = this.ensureContext();
    if (!ctx || !this.bodyFilter) return;

    const buffer = this.getOrCreateBuffer(freq, note);
    if (!buffer) return;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(velocity, ctx.currentTime);

    src.connect(noteGain);
    noteGain.connect(this.bodyFilter);
    src.start();

    this.emit({
      note,
      freq,
      stringNumber,
      source,
      timestamp: Date.now(),
    });
  }

  public pluckRandom(source: 'click' | 'scroll') {
    if (!this.enabled) return;

    // Throttle scroll events so scrolling arpeggiates smoothly instead of clipping
    if (source === 'scroll') {
      const now = performance.now();
      if (now - this.lastScrollPluckTime < 135) return;
      this.lastScrollPluckTime = now;
    }

    const pool =
      this.mode === 'serenade'
        ? SERENADE_NOTES
        : CLASSICAL_STRINGS.map((s) => ({
            note: s.note,
            freq: s.freq,
            stringNumber: s.stringNumber,
          }));

    const candidates = pool.filter((item) => item.note !== this.lastNote);
    const chosen =
      candidates[Math.floor(Math.random() * candidates.length)] || pool[0];

    this.lastNote = chosen.note;
    const velocity = source === 'scroll' ? 0.58 + Math.random() * 0.2 : 0.72 + Math.random() * 0.23;

    this.pluckNote(chosen.freq, chosen.note, chosen.stringNumber, source, velocity);
  }

  public strumChord(notes: { note: string; freq: number; stringNumber: number }[]) {
    notes.forEach((n, idx) => {
      window.setTimeout(() => {
        this.pluckNote(n.freq, n.note, n.stringNumber, 'chord', 0.72);
      }, idx * 55);
    });
  }
}

export const guitarAudio = new ClassicalGuitarEngine();

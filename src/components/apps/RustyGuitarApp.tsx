import React, { useEffect, useRef, useState } from 'react';
import {
  CLASSICAL_STRINGS,
  guitarAudio,
  GuitarScaleMode,
  PluckEvent,
} from '../../utils/guitarAudio';

interface RustyGuitarAppProps {
  synthEnabled: boolean;
  onToggleSynth: (next: boolean) => void;
  synthMode: GuitarScaleMode;
  onChangeMode: (mode: GuitarScaleMode) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  lastPluck: PluckEvent | null;
}

const SERENADE_SEQUENCE: { note: string; freq: number; stringNumber: number; delay: number }[] = [
  { note: 'D3', freq: 146.83, stringNumber: 4, delay: 0 },
  { note: 'A3', freq: 220.0, stringNumber: 3, delay: 240 },
  { note: 'D4', freq: 293.66, stringNumber: 2, delay: 480 },
  { note: 'F#4', freq: 369.99, stringNumber: 1, delay: 720 },
  { note: 'A4', freq: 440.0, stringNumber: 1, delay: 980 },
  { note: 'G4', freq: 392.0, stringNumber: 1, delay: 1320 },
  { note: 'F#4', freq: 369.99, stringNumber: 1, delay: 1580 },
  { note: 'E4', freq: 329.63, stringNumber: 1, delay: 1840 },
  { note: 'D4', freq: 293.66, stringNumber: 2, delay: 2200 },
  { note: 'A3', freq: 220.0, stringNumber: 3, delay: 2460 },
  { note: 'F#3', freq: 185.0, stringNumber: 4, delay: 2720 },
  { note: 'D3', freq: 146.83, stringNumber: 4, delay: 3000 },
];

export const RustyGuitarApp: React.FC<RustyGuitarAppProps> = ({
  synthEnabled,
  onToggleSynth,
  synthMode,
  onChangeMode,
  volume,
  onChangeVolume,
  lastPluck,
}) => {
  const [stringPluckTimes, setStringPluckTimes] = useState<Record<number, number>>({});
  const [playingSerenade, setPlayingSerenade] = useState(false);
  const serenadeTimers = useRef<number[]>([]);

  useEffect(() => {
    const unsub = guitarAudio.subscribe((ev) => {
      setStringPluckTimes((prev) => ({
        ...prev,
        [ev.stringNumber]: ev.timestamp,
      }));
    });
    return () => {
      unsub();
      serenadeTimers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const playSerenade = () => {
    serenadeTimers.current.forEach((id) => window.clearTimeout(id));
    serenadeTimers.current = [];
    setPlayingSerenade(true);

    SERENADE_SEQUENCE.forEach((step, idx) => {
      const id = window.setTimeout(() => {
        guitarAudio.pluckNote(step.freq, step.note, step.stringNumber, 'fretboard', 0.82);
        if (idx === SERENADE_SEQUENCE.length - 1) {
          setPlayingSerenade(false);
        }
      }, step.delay);
      serenadeTimers.current.push(id);
    });
  };

  const strumChord = (chordName: 'D' | 'Em' | 'A7' | 'G') => {
    if (chordName === 'D') {
      guitarAudio.strumChord([
        { note: 'D3', freq: 146.83, stringNumber: 4 },
        { note: 'A3', freq: 220.0, stringNumber: 3 },
        { note: 'D4', freq: 293.66, stringNumber: 2 },
        { note: 'F#4', freq: 369.99, stringNumber: 1 },
      ]);
    } else if (chordName === 'Em') {
      guitarAudio.strumChord([
        { note: 'E2', freq: 82.41, stringNumber: 6 },
        { note: 'B2', freq: 123.47, stringNumber: 5 },
        { note: 'E3', freq: 164.81, stringNumber: 4 },
        { note: 'G3', freq: 196.0, stringNumber: 3 },
        { note: 'B3', freq: 246.94, stringNumber: 2 },
        { note: 'E4', freq: 329.63, stringNumber: 1 },
      ]);
    } else if (chordName === 'A7') {
      guitarAudio.strumChord([
        { note: 'A2', freq: 110.0, stringNumber: 5 },
        { note: 'E3', freq: 164.81, stringNumber: 4 },
        { note: 'G3', freq: 196.0, stringNumber: 3 },
        { note: 'C#4', freq: 277.18, stringNumber: 2 },
        { note: 'E4', freq: 329.63, stringNumber: 1 },
      ]);
    } else {
      guitarAudio.strumChord([
        { note: 'G2', freq: 98.0, stringNumber: 6 },
        { note: 'B2', freq: 123.47, stringNumber: 5 },
        { note: 'D3', freq: 146.83, stringNumber: 4 },
        { note: 'G3', freq: 196.0, stringNumber: 3 },
        { note: 'B3', freq: 246.94, stringNumber: 2 },
        { note: 'G4', freq: 392.0, stringNumber: 1 },
      ]);
    }
  };

  return (
    <div className="flex-1 bg-[#ECE9D8] p-3 overflow-y-auto xp-scroll flex flex-col gap-3">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2D1A0E] via-[#4A2B16] to-[#6B3E1F] text-white rounded border border-[#2A1508] p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div>
          <div className="text-[13px] font-bold flex items-center gap-2">
            <span>🎸 Rusty Guitar · Classical Soundbox</span>
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-500/25 border border-amber-300/40 text-amber-100">
              Web Audio Karplus-Strong
            </span>
          </div>
          <div className="text-[11px] text-amber-100/90 mt-0.5">
            Inspired by <code className="text-amber-200 font-mono">chengcxi/rustyguitar</code> —
            click or glide across any nylon string below, or scroll/click anywhere in XP!
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-black/35 border border-amber-300/30 text-[11px] font-mono text-amber-200 min-w-[78px] text-center">
            {lastPluck ? `♪ ${lastPluck.note}` : '♪ Ready'}
          </div>
          <a
            href="https://github.com/chengcxi/rustyguitar"
            target="_blank"
            rel="noreferrer"
            className="xp-btn no-underline font-semibold text-[11px]"
          >
            Repo ↗
          </a>
        </div>
      </div>

      {/* Interactive Classical Guitar Soundbox */}
      <div
        className="relative rounded border-2 border-[#5D3316] overflow-hidden shadow-inner p-3 sm:p-4"
        style={{
          background:
            'radial-gradient(circle at 62% 50%, #D4914D 0%, #B76E2E 45%, #8F4D1B 85%, #6B3610 100%)',
        }}
      >
        {/* Rosette Soundhole */}
        <div
          className="pointer-events-none absolute right-[12%] top-1/2 -translate-y-1/2 w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[6px] border-[#F5D6A3]/75 shadow-[inset_0_4px_18px_rgba(0,0,0,0.85)]"
          style={{
            background: 'radial-gradient(circle, #180B04 0%, #2B1307 75%, #42200D 100%)',
            outline: '3px dashed rgba(246, 200, 128, 0.5)',
            outlineOffset: '3px',
          }}
        />

        {/* Fret markers on left */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[34%] bg-[#3D1E0D]/80 border-r-4 border-[#E5C99B]/80" />
        <div className="pointer-events-none absolute inset-y-0 left-[11%] w-[1px] bg-[#D1B894]/45" />
        <div className="pointer-events-none absolute inset-y-0 left-[22%] w-[1px] bg-[#D1B894]/45" />

        {/* 6 Classical Strings (High E at top to Low E at bottom) */}
        <div className="relative z-10 flex flex-col gap-2.5">
          {[...CLASSICAL_STRINGS].reverse().map((s) => {
            const thickness = s.stringNumber >= 4 ? 3.2 : s.stringNumber === 3 ? 2.4 : 1.7;
            const pluckKey = stringPluckTimes[s.stringNumber] || 0;
            const isRecent = Date.now() - pluckKey < 650;

            return (
              <div
                key={s.stringNumber}
                data-guitar-note="true"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  guitarAudio.pluckNote(s.freq, s.note, s.stringNumber, 'fretboard', 0.9);
                }}
                onPointerEnter={(e) => {
                  if (e.buttons === 1) {
                    guitarAudio.pluckNote(s.freq, s.note, s.stringNumber, 'fretboard', 0.78);
                  }
                }}
                className="group flex items-center gap-2.5 cursor-pointer py-1"
              >
                <span
                  className={`w-24 shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    isRecent
                      ? 'bg-[#FEF08A] text-[#451A03] border-[#F59E0B] shadow-sm'
                      : 'bg-[#2C1508]/80 text-[#FDE68A] border-[#8B5A2B] group-hover:bg-[#4A2511]'
                  }`}
                >
                  {s.label}
                </span>

                <div className="relative flex-1 h-4 flex items-center">
                  <div
                    key={`${s.stringNumber}-${pluckKey}`}
                    className={`w-full rounded-full transition-shadow ${
                      pluckKey ? 'animate-string-pluck' : ''
                    }`}
                    style={{
                      height: `${thickness}px`,
                      background:
                        s.stringNumber >= 4
                          ? 'linear-gradient(180deg, #F3E5D0 0%, #C4A47C 55%, #8D704B 100%)'
                          : 'linear-gradient(180deg, #FFFFFF 0%, #E6EEF8 65%, #B8C7DC 100%)',
                      boxShadow: isRecent
                        ? '0 0 8px rgba(254, 240, 138, 0.9)'
                        : '0 1px 2px rgba(0, 0, 0, 0.55)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Song & Chord Controls */}
      <div className="bg-white border border-[#ACA899] rounded p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5" data-guitar-note="true">
          <button
            type="button"
            onClick={playSerenade}
            className="xp-btn xp-btn-primary font-semibold inline-flex items-center gap-1.5"
          >
            <span>🎼</span>
            {playingSerenade ? 'Playing Schubert Serenade...' : "Play Schubert's Serenade (D Maj)"}
          </button>
          <button type="button" onClick={() => strumChord('D')} className="xp-btn">
            Strum D
          </button>
          <button type="button" onClick={() => strumChord('Em')} className="xp-btn">
            Strum Em
          </button>
          <button type="button" onClick={() => strumChord('A7')} className="xp-btn">
            Strum A7
          </button>
          <button type="button" onClick={() => strumChord('G')} className="xp-btn">
            Strum G
          </button>
        </div>
      </div>

      {/* Global Click & Scroll Synth Settings */}
      <div className="bg-[#F4F2EA] border border-[#ACA899] rounded p-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-[#003399]">
              Desktop Acoustic Mode (Click & Scroll Guitar)
            </div>
            <div className="text-[10px] text-[#555]">
              Plays a random classical nylon guitar string whenever you click or scroll anywhere.
            </div>
          </div>

          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold">
            <input
              type="checkbox"
              checked={synthEnabled}
              onChange={(e) => onToggleSynth(e.target.checked)}
              className="accent-[#0054E3] cursor-pointer"
            />
            {synthEnabled ? 'Enabled' : 'Muted'}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-[#DCD8CC]">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-semibold text-[#333]">Note Pool:</span>
            <button
              type="button"
              onClick={() => onChangeMode('open-strings')}
              className={`xp-btn text-[10px] ${
                synthMode === 'open-strings' ? 'xp-btn-primary font-bold' : ''
              }`}
            >
              6 Open Strings (E A D G B e)
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('serenade')}
              className={`xp-btn text-[10px] ${
                synthMode === 'serenade' ? 'xp-btn-primary font-bold' : ''
              }`}
            >
              Serenade (D Major)
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] ml-auto">
            <span className="font-semibold text-[#333]">Volume:</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-24 accent-[#0054E3] cursor-pointer"
            />
            <span className="w-8 text-right font-mono text-[10px]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

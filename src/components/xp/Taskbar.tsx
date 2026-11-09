import React, { useEffect, useRef, useState } from 'react';
import { useDismiss } from './MenuBar';
import { ClockFlyout } from './ClockFlyout';
import { AimIcon, SpeakerIcon, WindowsFlagIcon } from '../XpIcons';
import type { GuitarScaleMode, PluckEvent } from '../../utils/guitarAudio';
import { formatClock, loadTimeZone, saveTimeZone, systemTimeZone, zoneCity } from '../../utils/timezone';

export interface TaskItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  open: boolean;
  focused: boolean;
  pinned: boolean;
}

interface TaskbarProps {
  items: TaskItem[];
  startOpen: boolean;
  onToggleStart: () => void;
  onTaskClick: (id: string) => void;
  onTaskContext: (id: string, x: number, y: number) => void;
  aimOnline: boolean;
  onOpenAim: () => void;
  synthEnabled: boolean;
  onToggleSynth: (next: boolean) => void;
  synthMode: GuitarScaleMode;
  onChangeMode: (mode: GuitarScaleMode) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  lastPluck: PluckEvent | null;
  onOpenGuitar: () => void;
  balloon: { title: string; body: React.ReactNode; onClick?: () => void } | null;
  onCloseBalloon: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  items,
  startOpen,
  onToggleStart,
  onTaskClick,
  onTaskContext,
  aimOnline,
  onOpenAim,
  synthEnabled,
  onToggleSynth,
  synthMode,
  onChangeMode,
  volume,
  onChangeVolume,
  lastPluck,
  onOpenGuitar,
  balloon,
  onCloseBalloon,
}) => {
  const [now, setNow] = useState(() => new Date());
  const [timeZone, setTimeZone] = useState<string>(loadTimeZone);
  const [clockOpen, setClockOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const soundRef = useRef<HTMLDivElement>(null);
  const systemZone = systemTimeZone();

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useDismiss(soundOpen, soundRef, () => setSoundOpen(false), { ignore: '[data-speaker-button]', blur: false });

  const changeZone = (tz: string) => {
    setTimeZone(tz);
    saveTimeZone(tz);
  };

  return (
    <>
      {balloon && (
        <div className="xp-balloon" role="status">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 font-bold">
              <span>🎸</span>
              <span>{balloon.title}</span>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onCloseBalloon}
              className="flex h-[14px] w-[14px] items-center justify-center rounded-[2px] border border-[#8b8b8b] bg-white text-[9px] leading-none hover:bg-[#e8e8e8]"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              balloon.onClick?.();
              onCloseBalloon();
            }}
            className="mt-1 block text-left text-[11px] leading-snug"
          >
            {balloon.body}
          </button>
        </div>
      )}

      {soundOpen && (
        <div
          ref={soundRef}
          className="absolute bottom-[34px] right-2 z-[9600] w-[252px] space-y-2.5 rounded-[4px] border border-[#0831d9] bg-[#ece9d8] p-3 text-[11px] shadow-[3px_4px_10px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-1.5 border-b border-[#c5c2b2] pb-1.5 font-bold text-[#0b3a9a]">
            <SpeakerIcon size={16} muted={!synthEnabled} />
            Classical Guitar Audio
          </div>
          <label className="flex cursor-pointer items-center justify-between">
            <span>Pluck a string on every click &amp; scroll</span>
            <input type="checkbox" checked={synthEnabled} onChange={(e) => onToggleSynth(e.target.checked)} className="accent-[#0054e3]" />
          </label>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onChangeMode('open-strings')}
              className={`xp-btn px-1 text-[10px] ${synthMode === 'open-strings' ? 'xp-btn-primary font-bold' : ''}`}
            >
              Open Strings
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('serenade')}
              className={`xp-btn px-1 text-[10px] ${synthMode === 'serenade' ? 'xp-btn-primary font-bold' : ''}`}
            >
              Serenade (D)
            </button>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-[#444]">
              <span>Master volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => onChangeVolume(parseFloat(e.target.value))} className="w-full accent-[#0054e3]" />
          </div>
          <button
            type="button"
            className="xp-btn xp-btn-primary w-full"
            onClick={() => {
              onOpenGuitar();
              setSoundOpen(false);
            }}
          >
            Open Rusty Guitar.exe
          </button>
        </div>
      )}

      {clockOpen && (
        <ClockFlyout now={now} timeZone={timeZone} systemZone={systemZone} onChangeZone={changeZone} onClose={() => setClockOpen(false)} />
      )}

      <div className="xp-taskbar" onContextMenu={(e) => e.preventDefault()}>
        <button type="button" data-start-button className={`xp-start ${startOpen ? 'is-open' : ''}`} onClick={onToggleStart}>
          <WindowsFlagIcon size={21} />
          <span>start</span>
        </button>

        <div className="flex min-w-0 flex-1 items-start gap-[3px] overflow-hidden pr-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              title={
                item.pinned && !item.open
                  ? `${item.title} (pinned: click to open, right-click for options)`
                  : `${item.title} (right-click for options)`
              }
              className={`xp-task ${item.focused ? 'is-focused' : ''} ${item.open ? '' : 'opacity-80'}`}
              onClick={() => onTaskClick(item.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTaskContext(item.id, e.clientX, e.clientY);
              }}
            >
              <span className="flex shrink-0 items-center">{item.icon}</span>
              <span className="xp-task__label">{item.title}</span>
              {item.pinned && <span className="shrink-0 text-[9px] opacity-80">📌</span>}
            </button>
          ))}
        </div>

        <div className="xp-tray">
          {aimOnline && (
            <button type="button" className="xp-tray__btn" title="AIM — signed on" onClick={onOpenAim}>
              <AimIcon size={16} />
            </button>
          )}
          <button type="button" data-speaker-button className="xp-tray__btn" title="Guitar synth & volume" onClick={() => setSoundOpen((v) => !v)}>
            <SpeakerIcon size={16} muted={!synthEnabled || volume === 0} />
            <span className="hidden min-w-[34px] font-mono text-[10px] sm:inline">{!synthEnabled ? 'muted' : lastPluck ? `♪${lastPluck.note}` : '♪'}</span>
          </button>
          <button
            type="button"
            data-clock-button
            className="xp-tray__btn whitespace-nowrap text-[11px]"
            title={`${zoneCity(timeZone)}: click to see or change the time zone`}
            onClick={() => setClockOpen((v) => !v)}
          >
            {formatClock(now, timeZone)}
          </button>
        </div>
      </div>
    </>
  );
};

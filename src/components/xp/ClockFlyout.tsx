import React, { useMemo, useRef } from 'react';
import { useDismiss } from './MenuBar';
import { IconImage } from './IconImage';
import { formatClock, formatLongDate, gmtLabel, listTimeZones, offsetMinutes, zoneCity } from '../../utils/timezone';

interface ClockFlyoutProps {
  now: Date;
  timeZone: string;
  systemZone: string;
  onChangeZone: (tz: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Date and Time popup opened by clicking the taskbar clock: live time, calendar and time zone picker. */
export const ClockFlyout: React.FC<ClockFlyoutProps> = ({ now, timeZone, systemZone, onChangeZone, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(true, ref, onClose, { ignore: '[data-clock-button]', blur: false });

  const zoneOptions = useMemo(() => {
    const stamp = new Date();
    const zones = listTimeZones();
    const all = zones.includes(timeZone) ? zones : [timeZone, ...zones];
    return all.map((z) => ({ id: z, label: `(${gmtLabel(stamp, z)}) ${z.replace(/_/g, ' ')}` }));
    // The list is built once per opening; offsets only change with daylight saving.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shift to the selected zone's wall-clock time so the calendar shows the right day.
  const shifted = new Date(now.getTime() + offsetMinutes(now, timeZone) * 60000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const today = shifted.getUTCDate();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(shifted);
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      ref={ref}
      className="absolute bottom-[34px] right-1 z-[9650] w-[316px] select-none rounded-[4px] border border-[#0831d9] bg-[#ece9d8] p-3 text-[11px] text-black shadow-[3px_4px_10px_rgba(0,0,0,0.4)]"
    >
      <div className="mb-2 flex items-center gap-2 border-b border-[#c5c2b2] pb-2">
        <IconImage name="date-time" size={32} fallback={<span className="text-[22px]">🕒</span>} />
        <div className="font-bold text-[#0b3a9a]">Date and Time Properties</div>
      </div>

      <div className="text-[24px] font-bold leading-none text-[#0b3a9a]">{formatClock(now, timeZone, true)}</div>
      <div className="mt-1 text-[10px] text-[#444]">{formatLongDate(now, timeZone)}</div>

      <div className="mt-2">
        <div className="mb-1 text-center font-bold">{monthName}</div>
        <div className="grid grid-cols-7 text-center text-[10px]">
          {WEEKDAYS.map((w) => (
            <div key={w} className="font-bold text-[#555]">
              {w}
            </div>
          ))}
          {cells.map((d, i) => (
            <div key={i} className={`py-[1px] ${d === today ? 'bg-[#316ac5] font-bold text-white' : ''}`}>
              {d ?? ''}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 border-t border-[#c5c2b2] pt-2">
        <label htmlFor="xp-tz-select" className="mb-1 block font-bold">
          Time zone:
        </label>
        <select id="xp-tz-select" className="xp-input w-full" value={timeZone} onChange={(e) => onChangeZone(e.target.value)}>
          {zoneOptions.map((z) => (
            <option key={z.id} value={z.id}>
              {z.label}
            </option>
          ))}
        </select>
        <div className="mt-1 text-[10px] text-[#444]">
          {zoneCity(timeZone)} · {gmtLabel(now, timeZone)}
          {timeZone === systemZone ? ' · your computer’s time zone' : ''}
        </div>
      </div>

      <div className="mt-3 flex justify-between gap-2">
        <button type="button" className="xp-btn" disabled={timeZone === systemZone} onClick={() => onChangeZone(systemZone)}>
          Use my time zone
        </button>
        <button type="button" className="xp-btn xp-btn-primary min-w-[70px]" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

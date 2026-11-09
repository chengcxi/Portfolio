import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MenuBar, type MenuDef } from '../../components/xp/MenuBar';
import { MessageBox } from '../../components/xp/MessageBox';
import { loadJSON, saveJSON } from '../../utils/storage';
import { sfx } from '../../utils/sfx';

type Level = 'beginner' | 'intermediate' | 'expert';
const LEVELS: Record<Level, { rows: number; cols: number; mines: number; label: string }> = {
  beginner: { rows: 9, cols: 9, mines: 10, label: 'Beginner' },
  intermediate: { rows: 16, cols: 16, mines: 40, label: 'Intermediate' },
  expert: { rows: 16, cols: 30, mines: 99, label: 'Expert' },
};

interface Cell {
  mine: boolean;
  adj: number;
  open: boolean;
  mark: 0 | 1 | 2;
}
type Status = 'ready' | 'playing' | 'won' | 'lost';
type Best = Record<Level, number | null>;
type Mood = 'smile' | 'ooh' | 'dead' | 'cool';

const NUM_COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];

const emptyBoard = (rows: number, cols: number): Cell[] =>
  Array.from({ length: rows * cols }, (): Cell => ({ mine: false, adj: 0, open: false, mark: 0 }));

function neighbors(i: number, rows: number, cols: number): number[] {
  const r = Math.floor(i / cols);
  const c = i % cols;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push(nr * cols + nc);
    }
  }
  return out;
}

/** Mines are planted after the first click so it (and its neighbours) are always safe. */
function plantMines(board: Cell[], rows: number, cols: number, mines: number, safe: number): Cell[] {
  const next = board.map((c) => ({ ...c, mine: false, adj: 0 }));
  const forbidden = new Set([safe, ...neighbors(safe, rows, cols)]);
  let pool = next.map((_, i) => i).filter((i) => !forbidden.has(i));
  if (pool.length < mines) pool = next.map((_, i) => i).filter((i) => i !== safe);
  for (let k = 0; k < mines; k++) {
    const j = k + Math.floor(Math.random() * (pool.length - k));
    [pool[k], pool[j]] = [pool[j], pool[k]];
    next[pool[k]].mine = true;
  }
  next.forEach((cell, i) => {
    cell.adj = neighbors(i, rows, cols).filter((n) => next[n].mine).length;
  });
  return next;
}

function floodOpen(board: Cell[], start: number, rows: number, cols: number): Cell[] {
  const next = board.slice();
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    const cell = next[i];
    if (cell.open || cell.mark === 1) continue;
    next[i] = { ...cell, open: true, mark: 0 };
    if (cell.adj === 0 && !cell.mine) {
      for (const n of neighbors(i, rows, cols)) if (!next[n].open && next[n].mark !== 1) stack.push(n);
    }
  }
  return next;
}

/* ----------------------------- graphics ----------------------------- */
const SEG_POINTS: Record<string, string> = {
  a: '2,1 11,1 9,3 4,3',
  b: '12,2 12,11 10,10 10,4',
  c: '12,12 12,21 10,19 10,13',
  d: '4,20 9,20 11,22 2,22',
  e: '1,12 3,13 3,19 1,21',
  f: '1,2 3,4 3,10 1,11',
  g: '3,11.5 4,10.5 9,10.5 10,11.5 9,12.5 4,12.5',
};
const DIGIT_SEGS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
  '-': 'g',
};

const LedDigit: React.FC<{ ch: string }> = ({ ch }) => {
  const on = DIGIT_SEGS[ch] ?? '';
  return (
    <svg width="13" height="23" viewBox="0 0 13 23">
      {Object.entries(SEG_POINTS).map(([s, pts]) => (
        <polygon key={s} points={pts} fill={on.includes(s) ? '#ff0000' : '#420000'} />
      ))}
    </svg>
  );
};

const LedCounter: React.FC<{ value: number }> = ({ value }) => {
  const v = Math.max(-99, Math.min(999, value));
  const str = v < 0 ? `-${String(Math.abs(v)).padStart(2, '0')}` : String(v).padStart(3, '0');
  return (
    <div className="ms-sunken flex bg-black p-[1px]" style={{ borderWidth: 1 }}>
      {str.split('').map((ch, i) => (
        <LedDigit key={i} ch={ch} />
      ))}
    </div>
  );
};

const FaceIcon: React.FC<{ mood: Mood }> = ({ mood }) => (
  <svg width="17" height="17" viewBox="0 0 17 17">
    <circle cx="8.5" cy="8.5" r="7.8" fill="#ffff00" stroke="#000" strokeWidth="1" />
    {mood === 'dead' ? (
      <g stroke="#000" strokeWidth="1.1">
        <path d="M4.5 5 L7 7.5 M7 5 L4.5 7.5" />
        <path d="M10 5 L12.5 7.5 M12.5 5 L10 7.5" />
      </g>
    ) : mood === 'cool' ? (
      <g fill="#000">
        <path d="M2.5 5.4 H14.5 V6.4 H2.5 Z" />
        <path d="M3.5 6 H7.6 L7 8.6 H4.4 Z" />
        <path d="M9.4 6 H13.5 L12.6 8.6 H10 Z" />
      </g>
    ) : (
      <g fill="#000">
        <rect x="5" y="5.5" width="2" height="2" />
        <rect x="10" y="5.5" width="2" height="2" />
      </g>
    )}
    {mood === 'ooh' ? (
      <circle cx="8.5" cy="11.8" r="1.8" fill="none" stroke="#000" strokeWidth="1.1" />
    ) : mood === 'dead' ? (
      <path d="M5.2 12.8 Q8.5 9.8 11.8 12.8" fill="none" stroke="#000" strokeWidth="1.1" />
    ) : (
      <path d="M5 10.5 Q8.5 13.8 12 10.5" fill="none" stroke="#000" strokeWidth="1.1" />
    )}
  </svg>
);

const MineIcon: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 13 13">
    <g stroke="#000" strokeWidth="1.2">
      <line x1="6.5" y1="0.5" x2="6.5" y2="12.5" />
      <line x1="0.5" y1="6.5" x2="12.5" y2="6.5" />
      <line x1="2.3" y1="2.3" x2="10.7" y2="10.7" />
      <line x1="10.7" y1="2.3" x2="2.3" y2="10.7" />
    </g>
    <circle cx="6.5" cy="6.5" r="4" fill="#000" />
    <rect x="4.3" y="4.3" width="1.8" height="1.8" fill="#fff" />
  </svg>
);

const FlagIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12">
    <path d="M7 1 L7 6 L2 3.5 Z" fill="#ff0000" />
    <rect x="6.5" y="1" width="1" height="8" fill="#000" />
    <rect x="4" y="8.6" width="6" height="1" fill="#000" />
    <rect x="2.5" y="9.6" width="9" height="1.6" fill="#000" />
  </svg>
);

/* ----------------------------- component ----------------------------- */
export const Minesweeper: React.FC<{ focused: boolean; onClose: () => void }> = ({ focused, onClose }) => {
  const [level, setLevel] = useState<Level>(() => loadJSON<Level>('xp-ms-level', 'beginner'));
  const cfg = LEVELS[level] ?? LEVELS.beginner;
  const [board, setBoard] = useState<Cell[]>(() => emptyBoard(cfg.rows, cfg.cols));
  const [status, setStatus] = useState<Status>('ready');
  const [time, setTime] = useState(0);
  const [exploded, setExploded] = useState<number | null>(null);
  const [pressed, setPressed] = useState<number | null>(null);
  const pressedRef = useRef<number | null>(null);
  const press = (value: number | null) => {
    pressedRef.current = value;
    setPressed(value);
  };
  const [marks, setMarks] = useState(true);
  const [best, setBest] = useState<Best>(() =>
    loadJSON<Best>('xp-ms-best', { beginner: null, intermediate: null, expert: null })
  );
  const [dialog, setDialog] = useState<null | 'best' | 'about' | 'record' | 'help'>(null);
  const longPress = useRef<{ timer: number | null; fired: boolean }>({ timer: null, fired: false });

  const newGame = useCallback(
    (lvl: Level = level) => {
      const c = LEVELS[lvl];
      setLevel(lvl);
      saveJSON('xp-ms-level', lvl);
      setBoard(emptyBoard(c.rows, c.cols));
      setStatus('ready');
      setTime(0);
      setExploded(null);
      setPressed(null);
    },
    [level]
  );

  useEffect(() => {
    if (status !== 'playing') return;
    const id = window.setInterval(() => setTime((t) => Math.min(999, t + 1)), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        newGame();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused, newGame]);

  useEffect(() => {
    const release = () => setPressed(null);
    window.addEventListener('pointerup', release);
    return () => window.removeEventListener('pointerup', release);
  }, []);

  const over = status === 'won' || status === 'lost';
  const flags = board.reduce((n, c) => n + (c.mark === 1 ? 1 : 0), 0);

  const finish = (next: Cell[]) => {
    if (next.some((c) => !c.mine && !c.open)) {
      setBoard(next);
      return;
    }
    setBoard(next.map((c) => (c.mine ? { ...c, mark: 1 as const } : c)));
    setStatus('won');
    sfx.win();
    const finalTime = Math.max(1, time);
    const prev = best[level];
    if (prev === null || finalTime < prev) {
      const nb = { ...best, [level]: finalTime };
      setBest(nb);
      saveJSON('xp-ms-best', nb);
      setDialog('record');
    }
  };

  const lose = (b: Cell[], i: number) => {
    const next = b.slice();
    next[i] = { ...next[i], open: true };
    setBoard(next);
    setExploded(i);
    setStatus('lost');
    sfx.explode();
  };

  const reveal = (i: number) => {
    if (over) return;
    let b = board;
    if (status === 'ready') {
      b = plantMines(board, cfg.rows, cfg.cols, cfg.mines, i);
      setStatus('playing');
      setTime(1);
    }
    const cell = b[i];
    if (cell.open || cell.mark === 1) {
      if (b !== board) setBoard(b);
      return;
    }
    if (cell.mine) {
      lose(b, i);
      return;
    }
    finish(floodOpen(b, i, cfg.rows, cfg.cols));
  };

  const chord = (i: number) => {
    if (over) return;
    const cell = board[i];
    if (!cell.open || cell.adj === 0) return;
    const ns = neighbors(i, cfg.rows, cfg.cols);
    if (ns.filter((n) => board[n].mark === 1).length !== cell.adj) return;
    let b = board;
    for (const n of ns) {
      const c = b[n];
      if (c.open || c.mark === 1) continue;
      if (c.mine) {
        lose(b, n);
        return;
      }
      b = floodOpen(b, n, cfg.rows, cfg.cols);
    }
    finish(b);
  };

  const toggleMark = (i: number) => {
    if (over) return;
    const c = board[i];
    if (c.open) return;
    const nextMark: 0 | 1 | 2 = c.mark === 0 ? 1 : c.mark === 1 ? (marks ? 2 : 0) : 0;
    const next = board.slice();
    next[i] = { ...c, mark: nextMark };
    setBoard(next);
  };

  const clearLongPress = () => {
    if (longPress.current.timer) window.clearTimeout(longPress.current.timer);
    longPress.current.timer = null;
  };

  const mood: Mood = status === 'lost' ? 'dead' : status === 'won' ? 'cool' : pressed !== null ? 'ooh' : 'smile';

  const renderCell = (c: Cell, i: number) => {
    let cls = 'ms-cell ms-cell--hidden';
    let content: React.ReactNode = null;
    let bg: string | undefined;
    if (c.open) {
      cls = 'ms-cell ms-cell--open';
      if (c.mine) {
        content = <MineIcon />;
        if (i === exploded) bg = '#ff0000';
      } else if (c.adj > 0) {
        content = <span style={{ color: NUM_COLORS[c.adj] }}>{c.adj}</span>;
      }
    } else if (status === 'lost' && c.mine && c.mark !== 1) {
      cls = 'ms-cell ms-cell--open';
      content = <MineIcon />;
    } else if (status === 'lost' && c.mark === 1 && !c.mine) {
      cls = 'ms-cell ms-cell--open';
      content = (
        <span className="relative flex">
          <MineIcon />
          <svg className="absolute inset-0" width="13" height="13">
            <path d="M1 1 L12 12 M12 1 L1 12" stroke="#ff0000" strokeWidth="1.6" />
          </svg>
        </span>
      );
    } else if (c.mark === 1) {
      content = <FlagIcon />;
    } else if (c.mark === 2) {
      content = <span>?</span>;
    } else if (pressed === i && !over) {
      cls = 'ms-cell ms-cell--open';
    }

    return (
      <div
        key={i}
        className={cls}
        style={bg ? { background: bg } : undefined}
        onPointerDown={(e) => {
          if (over) return;
          if (e.button === 2) {
            toggleMark(i);
            return;
          }
          if (e.button !== 0) return;
          press(i);
          if (e.pointerType === 'touch') {
            longPress.current.fired = false;
            clearLongPress();
            longPress.current.timer = window.setTimeout(() => {
              longPress.current.fired = true;
              press(null);
              toggleMark(i);
              navigator.vibrate?.(25);
            }, 420);
          }
        }}
        onPointerEnter={(e) => {
          if (!over && e.pointerType === 'mouse' && e.buttons === 1) press(i);
        }}
        onPointerLeave={() => {
          if (pressedRef.current === i) press(null);
        }}
        onPointerUp={(e) => {
          clearLongPress();
          if (e.button !== 0) return;
          if (longPress.current.fired) {
            longPress.current.fired = false;
            return;
          }
          if (pressedRef.current !== i) return;
          press(null);
          if (board[i].open) chord(i);
          else reveal(i);
        }}
        onPointerCancel={clearLongPress}
        onContextMenu={(e) => e.preventDefault()}
      >
        {content}
      </div>
    );
  };

  const menus: MenuDef[] = [
    {
      label: 'Game',
      items: [
        { label: 'New', shortcut: 'F2', onClick: () => newGame() },
        { separator: true },
        { label: 'Beginner', checked: level === 'beginner', onClick: () => newGame('beginner') },
        { label: 'Intermediate', checked: level === 'intermediate', onClick: () => newGame('intermediate') },
        { label: 'Expert', checked: level === 'expert', onClick: () => newGame('expert') },
        { separator: true },
        { label: 'Marks (?)', checked: marks, onClick: () => setMarks((m) => !m) },
        { separator: true },
        { label: 'Best Times...', onClick: () => setDialog('best') },
        { separator: true },
        { label: 'Exit', onClick: onClose },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'How to Play', onClick: () => setDialog('help') },
        { separator: true },
        { label: 'About Minesweeper...', onClick: () => setDialog('about') },
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      <MenuBar menus={menus} />
      <div className="relative">
        <div className="ms-raised inline-flex flex-col gap-[6px] bg-[#c0c0c0] p-[6px]" style={{ borderWidth: 3 }}>
          <div className="ms-sunken flex h-[37px] items-center justify-between px-[5px]" style={{ borderWidth: 2 }}>
            <LedCounter value={cfg.mines - flags} />
            <button
              type="button"
              aria-label="New game"
              onClick={() => newGame()}
              className="flex h-[26px] w-[26px] items-center justify-center border border-[#7b7b7b] bg-[#c0c0c0] shadow-[inset_2px_2px_#fff,inset_-2px_-2px_#7b7b7b] active:shadow-[inset_1px_1px_#7b7b7b]"
            >
              <FaceIcon mood={mood} />
            </button>
            <LedCounter value={time} />
          </div>
          <div
            className="ms-sunken grid"
            style={{ borderWidth: 3, gridTemplateColumns: `repeat(${cfg.cols}, 16px)`, touchAction: 'manipulation' }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {board.map(renderCell)}
          </div>
        </div>

        {dialog === 'best' && (
          <MessageBox
            title="Fastest Mine Sweepers"
            width={230}
            buttons={[
              {
                label: 'Reset',
                onClick: () => {
                  const cleared: Best = { beginner: null, intermediate: null, expert: null };
                  setBest(cleared);
                  saveJSON('xp-ms-best', cleared);
                },
              },
              { label: 'OK', primary: true, onClick: () => setDialog(null) },
            ]}
          >
            {(Object.keys(LEVELS) as Level[]).map((l) => (
              <div key={l} className="flex justify-between gap-4">
                <span>{LEVELS[l].label}:</span>
                <span>{best[l] === null ? '999 seconds' : `${best[l]} seconds`}</span>
              </div>
            ))}
          </MessageBox>
        )}
        {dialog === 'record' && (
          <MessageBox title="Congratulations" width={230} buttons={[{ label: 'OK', primary: true, onClick: () => setDialog(null) }]}>
            You have the fastest time for {LEVELS[level].label.toLowerCase()} level: <b>{best[level]} seconds</b>! 🎉
          </MessageBox>
        )}
        {dialog === 'help' && (
          <MessageBox title="How to Play" width={230} buttons={[{ label: 'OK', primary: true, onClick: () => setDialog(null) }]}>
            Left-click to uncover a square. Right-click (or long-press on touch) to plant a flag. Click a number whose
            flags are all placed to clear its neighbours. Press F2 for a new game.
          </MessageBox>
        )}
        {dialog === 'about' && (
          <MessageBox title="About Minesweeper" width={230} buttons={[{ label: 'OK', primary: true, onClick: () => setDialog(null) }]}>
            Minesweeper — rebuilt in React for the chengcxi Windows XP portfolio. Every click also plucks a classical
            guitar string. 🎸
          </MessageBox>
        )}
      </div>
    </div>
  );
};

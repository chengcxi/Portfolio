import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MenuBar, type MenuDef } from '../../components/xp/MenuBar';
import { MessageBox } from '../../components/xp/MessageBox';
import { CARD_BACKS, CARD_FACE, CARD_SLOT } from '../../assets/solitaireCards';
import { loadJSON, saveJSON } from '../../utils/storage';
import { sfx } from '../../utils/sfx';
import {
  SUIT_KEY,
  autoFinishStep,
  autoMove,
  canAutoFinish,
  drawStock,
  isWon,
  moveCards,
  newGame,
  pileAt,
  type Card,
  type Game,
  type Loc,
  type Options,
  type Scoring,
} from './solitaireLogic';

/* Layout from the original GameForm (694 x 542 client area, 71 x 96 cards). */
const W = 694;
const MIN_H = 542;
const CW = 71;
const CH = 96;
const OFF = 23;
const TOP_Y = 43;
const STACK_Y = 169;
const DOWN = 3; // face-down cards overlap by 3px
const UP = 15; // face-up cards overlap by 15px
const colX = (i: number) => OFF + i * (CW + OFF);

const DEFAULT_OPTIONS: Options = { drawCount: 1, scoring: 'standard', timed: true, cardBack: 3 };
type Dialog = null | 'again' | 'options' | 'deck' | 'help' | 'about';

interface Drag {
  from: Loc;
  index: number;
  pointerId: number;
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  moved: boolean;
  ids: number[];
}

interface Flying {
  key: number;
  src: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Placed {
  card: Card;
  x: number;
  y: number;
  loc: Loc;
  index: number;
  z: number;
  draggable: boolean;
}

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function layoutGame(g: Game, drawCount: 1 | 3) {
  const items: Placed[] = [];
  const shown = Math.min(drawCount, g.waste.length);
  g.waste.slice(g.waste.length - shown).forEach((card, k) => {
    items.push({
      card,
      x: colX(1) + k * (drawCount === 3 ? 12 : 0),
      y: TOP_Y,
      loc: { kind: 'waste' },
      index: g.waste.length - shown + k,
      z: 100 + k,
      draggable: k === shown - 1,
    });
  });
  g.foundations.forEach((pile, f) =>
    pile.forEach((card, i) =>
      items.push({
        card,
        x: colX(3 + f),
        y: TOP_Y,
        loc: { kind: 'foundation', i: f },
        index: i,
        z: 200 + i,
        draggable: i === pile.length - 1,
      })
    )
  );
  let bottom = STACK_Y + CH;
  g.tableau.forEach((pile, t) => {
    let y = STACK_Y;
    pile.forEach((card, i) => {
      items.push({
        card,
        x: colX(t),
        y,
        loc: { kind: 'tableau', i: t },
        index: i,
        z: 300 + i,
        draggable: card.faceUp,
      });
      if (i < pile.length - 1) y += card.faceUp ? UP : DOWN;
    });
    bottom = Math.max(bottom, y + CH);
  });
  return { items, height: Math.max(MIN_H, bottom + 12) };
}

/** Which pile a design-space point is over (foundations along the top row, columns below). */
function targetAt(px: number, py: number): Loc | null {
  for (let f = 0; f < 4; f++) {
    if (px >= colX(3 + f) - 8 && px <= colX(3 + f) + CW + 8 && py >= TOP_Y - 8 && py <= TOP_Y + CH + 8) {
      return { kind: 'foundation', i: f };
    }
  }
  for (let t = 0; t < 7; t++) {
    if (px >= colX(t) - 8 && px <= colX(t) + CW + 8 && py >= STACK_Y - 8) return { kind: 'tableau', i: t };
  }
  return null;
}

export const Solitaire: React.FC<{ focused: boolean; onClose: () => void }> = ({ focused, onClose }) => {
  const [opt, setOpt] = useState<Options>(() => loadJSON<Options>('xp-sol-options', DEFAULT_OPTIONS));
  const [game, setGame] = useState<Game>(() => newGame(opt.scoring));
  const gameRef = useRef(game);
  const [history, setHistory] = useState<Game[]>([]);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);
  const [cascading, setCascading] = useState(false);
  const [flying, setFlying] = useState<Flying[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [draft, setDraft] = useState<Options>(opt);

  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: W, h: MIN_H });

  const { items, height } = useMemo(() => layoutGame(game, opt.drawCount), [game, opt.drawCount]);
  const scale = Math.max(0.3, Math.min(1.4, (box.w - 8) / W, (box.h - 8) / height));
  const left = (box.w - W * scale) / 2;
  const top = Math.max(0, (box.h - height * scale) / 2);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!started || won) return;
    const id = window.setInterval(() => setTime((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [started, won]);

  /** Applies a legal change, records undo history and checks for the win. */
  const commit = (next: Game) => {
    setHistory((h) => [...h.slice(-150), gameRef.current]);
    gameRef.current = next;
    setGame(next);
    setStarted(true);
    if (isWon(next)) {
      setWon(true);
      setCascading(true);
      sfx.win();
    }
  };

  const newDeal = (o: Options = opt) => {
    const g = newGame(o.scoring);
    gameRef.current = g;
    setGame(g);
    setHistory([]);
    setStarted(false);
    setTime(0);
    setWon(false);
    setCascading(false);
    setFlying([]);
    setDialog(null);
  };

  const undo = () => {
    if (won || !history.length) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    gameRef.current = prev;
    setGame(prev);
  };

  const draw = () => {
    if (won || cascading) return;
    const next = drawStock(gameRef.current, opt);
    if (next) commit(next);
  };

  const onCardDown = (e: React.PointerEvent<HTMLImageElement>, p: Placed) => {
    if (e.button !== 0 || won || cascading || dialog) return;
    if (!p.card.faceUp || !p.draggable) return;
    e.preventDefault();
    const pile = pileAt(gameRef.current, p.loc);
    const ids = pile.slice(p.index).map((c) => c.id);
    const start: Drag = { from: p.loc, index: p.index, pointerId: e.pointerId, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, moved: false, ids };
    dragRef.current = start;

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pointerId) return;
      const mx = ev.clientX - d.sx;
      const my = ev.clientY - d.sy;
      if (!d.moved && Math.hypot(mx, my) < 4) return;
      d.moved = true;
      d.dx = mx / scale;
      d.dy = my / scale;
      setDrag({ ...d });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!d || !d.moved || ev.pointerId !== d.pointerId) return;
      const r = stageRef.current?.getBoundingClientRect();
      if (!r) return;
      const to = targetAt((ev.clientX - r.left) / scale, (ev.clientY - r.top) / scale);
      if (!to) return;
      const next = moveCards(gameRef.current, d.from, d.index, to, opt);
      if (next) commit(next);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const doubleClick = (p: Placed) => {
    if (won || cascading || !p.card.faceUp) return;
    const next = autoMove(gameRef.current, p.loc, p.index, opt);
    if (next) commit(next);
  };

  // Once every card is face up, finish the game automatically.
  useEffect(() => {
    if (won || cascading || dialog || !canAutoFinish(game)) return;
    const id = window.setTimeout(() => {
      const next = autoFinishStep(gameRef.current, opt);
      if (next) commit(next);
    }, 140);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, won, cascading, dialog]);

  // Winning cascade: cards leave each foundation from King down and bounce around the table.
  useEffect(() => {
    if (!cascading) return;
    const queue: { card: Card; x: number }[] = [];
    for (let rank = 12; rank >= 0; rank--) {
      for (let f = 0; f < 4; f++) {
        const card = gameRef.current.foundations[f].find((c) => c.rank === rank);
        if (card) queue.push({ card, x: colX(3 + f) });
      }
    }
    let list: Flying[] = [];
    let next = 0;
    let tick = 0;
    let key = 0;
    const id = window.setInterval(() => {
      tick++;
      if (next < queue.length && tick % 3 === 0) {
        const q = queue[next++];
        list.push({
          key: key++,
          src: CARD_FACE[`${SUIT_KEY[q.card.suit]}${q.card.rank}`],
          x: q.x,
          y: TOP_Y,
          vx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 4),
          vy: -(3 + Math.random() * 5),
        });
      }
      list = list
        .map((c) => {
          const vy = c.vy + 0.55;
          let y = c.y + vy;
          let v = vy;
          if (y + CH > height) {
            y = height - CH;
            v = -vy * 0.8;
          }
          return { ...c, x: c.x + c.vx, y, vy: v };
        })
        .filter((c) => c.x > -CW && c.x < W + CW);
      setFlying([...list]);
      if (next >= queue.length && list.length === 0) {
        window.clearInterval(id);
        setCascading(false);
        setDialog('again');
      }
    }, 30);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cascading]);

  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        newDeal();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const applyOptions = () => {
    const changedRules = draft.drawCount !== opt.drawCount || draft.scoring !== opt.scoring;
    setOpt(draft);
    saveJSON('xp-sol-options', draft);
    if (changedRules) newDeal(draft);
    setDialog(null);
  };

  const setCardBack = (i: number) => {
    const next = { ...opt, cardBack: i };
    setOpt(next);
    saveJSON('xp-sol-options', next);
    setDialog(null);
  };

  const menus: MenuDef[] = [
    {
      label: 'Game',
      items: [
        { label: 'Deal', shortcut: 'F2', onClick: () => newDeal() },
        { label: 'Undo', shortcut: 'Ctrl+Z', disabled: won || history.length === 0, onClick: undo },
        { separator: true },
        { label: 'Deck...', onClick: () => setDialog('deck') },
        {
          label: 'Options...',
          onClick: () => {
            setDraft(opt);
            setDialog('options');
          },
        },
        { separator: true },
        { label: 'Exit', onClick: onClose },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'How to Use Help', onClick: () => setDialog('help') },
        { separator: true },
        { label: "About 'Classic' Solitaire...", onClick: () => setDialog('about') },
      ],
    },
  ];

  const dragIds = drag?.moved ? new Set(drag.ids) : null;
  const resting = dragIds ? items.filter((p) => !dragIds.has(p.card.id)) : items;
  const dragging = dragIds ? items.filter((p) => dragIds.has(p.card.id)) : [];
  const backSrc = CARD_BACKS[opt.cardBack] ?? CARD_BACKS[3];

  const cardImg = (p: Placed, ox: number, oy: number, key: string, isDragging: boolean) => (
    <img
      key={key}
      src={p.card.faceUp ? CARD_FACE[`${SUIT_KEY[p.card.suit]}${p.card.rank}`] : backSrc}
      alt=""
      draggable={false}
      onPointerDown={isDragging ? undefined : (e) => onCardDown(e, p)}
      onDoubleClick={isDragging ? undefined : () => doubleClick(p)}
      className="absolute select-none"
      style={{
        left: p.x + ox,
        top: p.y + oy,
        width: CW,
        height: CH,
        zIndex: isDragging ? 1000 + p.z : p.z,
        pointerEvents: isDragging ? 'none' : undefined,
        cursor: p.card.faceUp && p.draggable ? 'pointer' : 'default',
      }}
    />
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <MenuBar menus={menus} />
      <div
        ref={boxRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ background: '#008000' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          ref={stageRef}
          className="absolute"
          style={{ left, top, width: W, height, transform: `scale(${scale})`, transformOrigin: '0 0' }}
        >
          {/* Stock, waste and foundation slots */}
          <img
            src={CARD_SLOT}
            alt=""
            draggable={false}
            onPointerDown={(e) => {
              if (e.button === 0) draw();
            }}
            className="absolute cursor-pointer"
            style={{ left: colX(0), top: TOP_Y, width: CW, height: CH }}
          />
          <img src={CARD_SLOT} alt="" draggable={false} className="absolute" style={{ left: colX(1), top: TOP_Y, width: CW, height: CH }} />
          {[0, 1, 2, 3].map((f) => (
            <img key={`fs-${f}`} src={CARD_SLOT} alt="" draggable={false} className="absolute" style={{ left: colX(3 + f), top: TOP_Y, width: CW, height: CH }} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map((t) => (
            <img key={`ts-${t}`} src={CARD_SLOT} alt="" draggable={false} className="absolute" style={{ left: colX(t), top: STACK_Y, width: CW, height: CH }} />
          ))}

          {/* Stock pile */}
          {game.stock.length > 0 && (
            <img
              src={backSrc}
              alt=""
              draggable={false}
              onPointerDown={(e) => {
                if (e.button === 0) draw();
              }}
              className="absolute cursor-pointer select-none"
              style={{ left: colX(0), top: TOP_Y, width: CW, height: CH }}
            />
          )}

          {resting.map((p) => cardImg(p, 0, 0, `c${p.card.id}`, false))}
          {dragging.map((p) => cardImg(p, drag?.dx ?? 0, drag?.dy ?? 0, `d${p.card.id}`, true))}

          {flying.map((c) => (
            <img
              key={`f${c.key}`}
              src={c.src}
              alt=""
              draggable={false}
              className="absolute pointer-events-none"
              style={{ left: c.x, top: c.y, width: CW, height: CH, zIndex: 2000 }}
            />
          ))}
        </div>
      </div>

      <div className="xp-statusbar justify-end gap-3">
        <div className="xp-statusbar__field min-w-[70px]">Score: {game.score}</div>
        {opt.timed && <div className="xp-statusbar__field min-w-[70px]">Time: {fmtTime(time)}</div>}
      </div>

      {dialog === 'again' && (
        <MessageBox
          title="Solitaire"
          icon="question"
          width={300}
          onClose={() => setDialog(null)}
          buttons={[
            { label: 'Yes', primary: true, onClick: () => newDeal() },
            { label: 'No', onClick: () => setDialog(null) },
          ]}
        >
          Do you want to play again?
        </MessageBox>
      )}

      {dialog === 'options' && (
        <MessageBox
          title="Options"
          width={300}
          onClose={() => setDialog(null)}
          buttons={[
            { label: 'OK', primary: true, onClick: applyOptions },
            { label: 'Cancel', onClick: () => setDialog(null) },
          ]}
        >
          <div className="space-y-2">
            <div className="font-bold">Draw</div>
            {([1, 3] as const).map((n) => (
              <label key={n} className="flex items-center gap-2">
                <input type="radio" checked={draft.drawCount === n} onChange={() => setDraft({ ...draft, drawCount: n })} />
                Draw {n === 1 ? 'One' : 'Three'}
              </label>
            ))}
            <div className="font-bold">Scoring</div>
            {(
              [
                ['none', 'None'],
                ['standard', 'Standard'],
                ['vegas', 'Vegas'],
              ] as [Scoring, string][]
            ).map(([s, label]) => (
              <label key={s} className="flex items-center gap-2">
                <input type="radio" checked={draft.scoring === s} onChange={() => setDraft({ ...draft, scoring: s })} />
                {label}
              </label>
            ))}
            <label className="flex items-center gap-2 pt-1">
              <input type="checkbox" checked={draft.timed} onChange={(e) => setDraft({ ...draft, timed: e.target.checked })} />
              Timed game
            </label>
          </div>
        </MessageBox>
      )}

      {dialog === 'deck' && (
        <MessageBox
          title="Card Back"
          width={370}
          onClose={() => setDialog(null)}
          buttons={[{ label: 'Cancel', onClick: () => setDialog(null) }]}
        >
          <div className="grid grid-cols-6 gap-2">
            {CARD_BACKS.map((src, i) => (
              <button
                key={i}
                type="button"
                title={`Card back ${i + 1}`}
                onClick={() => setCardBack(i)}
                className="p-[2px]"
                style={{ border: i === opt.cardBack ? '2px solid #000080' : '2px solid transparent' }}
              >
                <img src={src} alt="" draggable={false} style={{ width: 40, height: 54, display: 'block' }} />
              </button>
            ))}
          </div>
        </MessageBox>
      )}

      {dialog === 'help' && (
        <MessageBox
          title="How to Use Help"
          width={320}
          onClose={() => setDialog(null)}
          buttons={[{ label: 'OK', primary: true, onClick: () => setDialog(null) }]}
        >
          Build all four foundations up from Ace to King, one suit each. On the table, stack cards down in alternating
          colours; only a King can start an empty column. Click the stock to turn cards over, drag cards to move them,
          or double-click a card to send it to the foundations. Ctrl+Z undoes and F2 deals a new game.
        </MessageBox>
      )}

      {dialog === 'about' && (
        <MessageBox
          title="About 'Classic' Solitaire"
          width={300}
          onClose={() => setDialog(null)}
          buttons={[{ label: 'OK', primary: true, onClick: () => setDialog(null) }]}
        >
          Classic Solitaire for the chengcxi XP portfolio, ported from DualBrain/Solitaire (MIT). Card art and rules
          come from that project.
        </MessageBox>
      )}
    </div>
  );
};

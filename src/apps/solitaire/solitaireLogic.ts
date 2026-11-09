/* Klondike rules and scoring, ported from DualBrain/Solitaire (GameForm.vb). */

export type Suit = 0 | 1 | 2 | 3; // Spades, Diamonds, Clubs, Hearts (same order as the original)
export const SUIT_KEY = ['S', 'D', 'C', 'H'] as const;

export interface Card {
  id: number;
  suit: Suit;
  rank: number; // 0 = Ace … 12 = King
  faceUp: boolean;
}

export type Scoring = 'none' | 'standard' | 'vegas';

export interface Options {
  drawCount: 1 | 3;
  scoring: Scoring;
  timed: boolean;
  cardBack: number; // 0–11
}

export interface Game {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  score: number;
  cycles: number; // times the waste has been turned back over
  moves: number;
}

export type Loc = { kind: 'waste' } | { kind: 'foundation'; i: number } | { kind: 'tableau'; i: number };

export const isRed = (s: Suit) => s === 1 || s === 3;

export function newGame(scoring: Scoring): Game {
  const deck: Card[] = [];
  let id = 0;
  for (let s = 0; s < 4; s++) {
    for (let r = 0; r < 13; r++) deck.push({ id: id++, suit: s as Suit, rank: r, faceUp: false });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const tableau: Card[][] = [];
  for (let t = 0; t < 7; t++) {
    const pile: Card[] = [];
    for (let k = 0; k <= t; k++) {
      const c = deck.pop()!;
      c.faceUp = k === t;
      pile.push(c);
    }
    tableau.push(pile);
  }
  return {
    stock: deck,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    score: scoring === 'vegas' ? -52 : 0,
    cycles: 0,
    moves: 0,
  };
}

export function cloneGame(g: Game): Game {
  return {
    ...g,
    stock: g.stock.map((c) => ({ ...c })),
    waste: g.waste.map((c) => ({ ...c })),
    foundations: g.foundations.map((p) => p.map((c) => ({ ...c }))),
    tableau: g.tableau.map((p) => p.map((c) => ({ ...c }))),
  };
}

export function pileAt(g: Game, loc: Loc): Card[] {
  if (loc.kind === 'waste') return g.waste;
  if (loc.kind === 'foundation') return g.foundations[loc.i];
  return g.tableau[loc.i];
}

export function acceptsFoundation(card: Card, pile: Card[]): boolean {
  if (!pile.length) return card.rank === 0;
  const top = pile[pile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

export function acceptsTableau(card: Card, pile: Card[]): boolean {
  if (!pile.length) return card.rank === 12;
  const top = pile[pile.length - 1];
  return top.faceUp && isRed(top.suit) !== isRed(card.suit) && card.rank === top.rank - 1;
}

/** Turns over 1 or 3 cards, or turns the waste back onto the stock when the stock is empty. */
export function drawStock(g: Game, opt: Options): Game | null {
  if (!g.stock.length && !g.waste.length) return null;
  const n = cloneGame(g);
  n.moves++;
  if (n.stock.length) {
    const count = Math.min(opt.drawCount, n.stock.length);
    for (let k = 0; k < count; k++) {
      const c = n.stock.pop()!;
      c.faceUp = true;
      n.waste.push(c);
    }
    return n;
  }
  n.stock = n.waste.reverse().map((c) => ({ ...c, faceUp: false }));
  n.waste = [];
  n.cycles++;
  if (opt.scoring === 'standard') {
    if (opt.drawCount === 1 && n.cycles > 1) n.score -= 100;
    if (opt.drawCount === 3 && n.cycles > 3) n.score -= 20;
  }
  return n;
}

/** Moves the card at `index` (and everything above it in a column) to `to`. Null if illegal. */
export function moveCards(g: Game, from: Loc, index: number, to: Loc, opt: Options): Game | null {
  if (to.kind === 'waste') return null;
  if (from.kind === 'tableau' && to.kind === 'tableau' && from.i === to.i) return null;
  if (from.kind === 'foundation' && to.kind === 'foundation') return null;
  const src = pileAt(g, from);
  if (index < 0 || index >= src.length) return null;
  if (from.kind !== 'tableau' && index !== src.length - 1) return null;
  const moving = src.slice(index);
  if (!moving[0].faceUp) return null;
  if (to.kind === 'foundation') {
    if (moving.length !== 1 || !acceptsFoundation(moving[0], g.foundations[to.i])) return null;
  } else if (!acceptsTableau(moving[0], g.tableau[to.i])) {
    return null;
  }

  const n = cloneGame(g);
  const nsrc = pileAt(n, from);
  const cards = nsrc.splice(index);
  pileAt(n, to).push(...cards);
  n.moves++;

  if (opt.scoring === 'standard') {
    if (from.kind === 'waste' && to.kind === 'tableau') n.score += 5;
    else if (from.kind === 'waste' && to.kind === 'foundation') n.score += 10;
    else if (from.kind === 'tableau' && to.kind === 'foundation') n.score += 10;
    else if (from.kind === 'foundation' && to.kind === 'tableau') n.score -= 15;
  } else if (opt.scoring === 'vegas' && to.kind === 'foundation') {
    n.score += 5;
  }

  if (from.kind === 'tableau') {
    const top = nsrc[nsrc.length - 1];
    if (top && !top.faceUp) {
      top.faceUp = true;
      if (opt.scoring === 'standard') n.score += 5;
    }
  }
  return n;
}

/** Double-click behaviour: foundation first for top cards, then the first column that takes the card. */
export function autoMove(g: Game, from: Loc, index: number, opt: Options): Game | null {
  const targets: Loc[] = [];
  if (index === pileAt(g, from).length - 1) for (let f = 0; f < 4; f++) targets.push({ kind: 'foundation', i: f });
  for (let t = 0; t < 7; t++) if (g.tableau[t].length) targets.push({ kind: 'tableau', i: t });
  for (let t = 0; t < 7; t++) if (!g.tableau[t].length) targets.push({ kind: 'tableau', i: t });
  for (const to of targets) {
    const next = moveCards(g, from, index, to, opt);
    if (next) return next;
  }
  return null;
}

export const isWon = (g: Game) => g.foundations.every((p) => p.length === 13);

/** Every card is face up and the stock is empty, so the rest can go to the foundations by itself. */
export const canAutoFinish = (g: Game) =>
  !isWon(g) && g.stock.length === 0 && g.waste.length === 0 && g.tableau.every((p) => p.every((c) => c.faceUp));

/** One foundation move for the auto-finish step, or null. */
export function autoFinishStep(g: Game, opt: Options): Game | null {
  const sources: { loc: Loc; index: number }[] = [];
  if (g.waste.length) sources.push({ loc: { kind: 'waste' }, index: g.waste.length - 1 });
  g.tableau.forEach((p, t) => {
    if (p.length) sources.push({ loc: { kind: 'tableau', i: t }, index: p.length - 1 });
  });
  for (const s of sources) {
    const card = pileAt(g, s.loc)[s.index];
    for (let f = 0; f < 4; f++) {
      if (acceptsFoundation(card, g.foundations[f])) {
        const next = moveCards(g, s.loc, s.index, { kind: 'foundation', i: f }, opt);
        if (next) return next;
      }
    }
  }
  return null;
}

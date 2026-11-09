/** Desktop icon grid helpers (XP "Align to Grid" behaviour). */
export const GRID = { w: 78, h: 88, margin: 8, iconW: 74, iconH: 78 };

export interface IconPos {
  id: string;
  x: number;
  y: number;
}

export const cellOf = (x: number, y: number) => ({
  col: Math.max(0, Math.round((x - GRID.margin) / GRID.w)),
  row: Math.max(0, Math.round((y - GRID.margin) / GRID.h)),
});

export const posOf = (col: number, row: number) => ({
  x: GRID.margin + col * GRID.w,
  y: GRID.margin + row * GRID.h,
});

export function gridSize(areaW: number, areaH: number) {
  return {
    cols: Math.max(1, Math.floor((areaW - GRID.margin - GRID.iconW) / GRID.w) + 1),
    rows: Math.max(1, Math.floor((areaH - GRID.margin - GRID.iconH) / GRID.h) + 1),
  };
}

/** Nearest unoccupied grid cell to `desired` (spiral search). */
export function findFreeCell(
  desired: { x: number; y: number },
  occupied: IconPos[],
  areaW: number,
  areaH: number
): { x: number; y: number } {
  const { cols, rows } = gridSize(areaW, areaH);
  const taken = new Set(
    occupied.map((o) => {
      const c = cellOf(o.x, o.y);
      return `${c.col},${c.row}`;
    })
  );
  const start = cellOf(desired.x, desired.y);
  const sc = Math.min(start.col, cols - 1);
  const sr = Math.min(start.row, rows - 1);
  const maxRadius = Math.max(cols, rows);
  for (let radius = 0; radius <= maxRadius; radius++) {
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue;
        const c = sc + dc;
        const r = sr + dr;
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        if (!taken.has(`${c},${r}`)) return posOf(c, r);
      }
    }
  }
  return posOf(sc, sr);
}

/** Column-major layout like XP; the Recycle Bin sits in the bottom-right corner. */
export function defaultLayout(ids: string[], areaW: number, areaH: number): IconPos[] {
  const { cols, rows } = gridSize(areaW, areaH);
  const result: IconPos[] = [];
  if (ids.includes('recycle')) result.push({ id: 'recycle', ...posOf(cols - 1, rows - 1) });
  ids
    .filter((id) => id !== 'recycle')
    .forEach((id, i) => {
      const desired = posOf(Math.floor(i / rows), i % rows);
      result.push({ id, ...findFreeCell(desired, result, areaW, areaH) });
    });
  return result;
}

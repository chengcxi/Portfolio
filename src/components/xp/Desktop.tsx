import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GRID, findFreeCell, type IconPos } from './desktopGrid';
import { itemLabel, renderItemIcon, type DesktopItemId } from '../../apps/registry';

export interface DesktopIcon {
  id: DesktopItemId;
  x: number;
  y: number;
}

interface DesktopProps {
  icons: DesktopIcon[];
  selected: DesktopItemId[];
  binFull: boolean;
  areaW: number;
  areaH: number;
  onSelect: (ids: DesktopItemId[]) => void;
  onOpen: (id: DesktopItemId) => void;
  onMove: (positions: DesktopIcon[]) => void;
  onRecycle: (ids: DesktopItemId[]) => void;
  onIconContextMenu: (id: DesktopItemId, x: number, y: number) => void;
  onDesktopFocus: () => void;
}

interface DragState {
  ids: DesktopItemId[];
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  pointerType: string;
}

export const Desktop: React.FC<DesktopProps> = ({
  icons,
  selected,
  binFull,
  areaW,
  areaH,
  onSelect,
  onOpen,
  onMove,
  onRecycle,
  onIconContextMenu,
  onDesktopFocus,
}) => {
  const drag = useRef<DragState | null>(null);
  const [ghost, setGhost] = useState<{ ids: DesktopItemId[]; dx: number; dy: number; overBin: boolean } | null>(null);
  const band = useRef<{ startX: number; startY: number; pointerId: number } | null>(null);
  const [bandRect, setBandRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const clampPos = (x: number, y: number) => ({
    x: Math.max(0, Math.min(x, areaW - GRID.iconW)),
    y: Math.max(0, Math.min(y, areaH - GRID.iconH)),
  });

  const overRecycleBin = (x: number, y: number, ids: DesktopItemId[]) => {
    if (ids.includes('recycle')) return false;
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    return Boolean(el?.closest('[data-drop-target="recycle-bin"]'));
  };

  const endDrag = () => {
    drag.current = null;
    setGhost(null);
    document.body.classList.remove('xp-dragging');
  };

  const handleIconPointerDown = (e: React.PointerEvent<HTMLDivElement>, id: DesktopItemId) => {
    onDesktopFocus();
    if (e.button === 2) {
      if (!selected.includes(id)) onSelect([id]);
      return;
    }
    if (e.button !== 0) return;
    let ids: DesktopItemId[];
    if (e.ctrlKey || e.metaKey) {
      ids = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
      onSelect(ids);
      if (!ids.includes(id)) return;
    } else {
      ids = selected.includes(id) ? selected : [id];
      onSelect(ids);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      ids,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      pointerType: e.pointerType,
    };
  };

  const handleIconPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < 5) return;
      d.moved = true;
      document.body.classList.add('xp-dragging');
    }
    setGhost({ ids: d.ids, dx, dy, overBin: overRecycleBin(e.clientX, e.clientY, d.ids) });
  };

  const handleIconPointerUp = (e: React.PointerEvent<HTMLDivElement>, id: DesktopItemId) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    endDrag();
    if (!d.moved) {
      if (d.pointerType !== 'mouse') onOpen(id);
      return;
    }
    if (overRecycleBin(e.clientX, e.clientY, d.ids)) {
      onRecycle(d.ids);
      return;
    }
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const others: IconPos[] = icons.filter((i) => !d.ids.includes(i.id));
    const placed: IconPos[] = [];
    const moved: DesktopIcon[] = icons
      .filter((i) => d.ids.includes(i.id))
      .map((icon) => {
        const pos = findFreeCell(clampPos(icon.x + dx, icon.y + dy), [...others, ...placed], areaW, areaH);
        const next = { id: icon.id, ...pos };
        placed.push(next);
        return next;
      });
    onMove(moved);
  };

  const handleLayerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    onDesktopFocus();
    if (e.button !== 0) return;
    onSelect([]);
    e.currentTarget.setPointerCapture(e.pointerId);
    band.current = { startX: e.clientX, startY: e.clientY, pointerId: e.pointerId };
  };

  const handleLayerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const b = band.current;
    if (!b || b.pointerId !== e.pointerId) return;
    const x = Math.min(b.startX, e.clientX);
    const y = Math.min(b.startY, e.clientY);
    const w = Math.abs(e.clientX - b.startX);
    const h = Math.abs(e.clientY - b.startY);
    if (w < 3 && h < 3) return;
    setBandRect({ x, y, w, h });
    const hits = icons
      .filter((icon) => {
        const p = clampPos(icon.x, icon.y);
        return p.x < x + w && p.x + GRID.iconW > x && p.y < y + h && p.y + GRID.iconH > y;
      })
      .map((i) => i.id);
    onSelect(hits);
  };

  const handleLayerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (band.current?.pointerId !== e.pointerId) return;
    band.current = null;
    setBandRect(null);
  };

  return (
    <div
      className="absolute inset-x-0 top-0 bottom-[30px] z-[1]"
      style={{ touchAction: 'none' }}
      onPointerDown={handleLayerPointerDown}
      onPointerMove={handleLayerPointerMove}
      onPointerUp={handleLayerPointerUp}
      onPointerCancel={handleLayerPointerUp}
    >
      {icons.map((icon) => {
        const p = clampPos(icon.x, icon.y);
        const isSelected = selected.includes(icon.id);
        const isDropTarget = icon.id === 'recycle' && Boolean(ghost?.overBin);
        return (
          <div
            key={icon.id}
            data-desktop-icon={icon.id}
            data-drop-target={icon.id === 'recycle' ? 'recycle-bin' : undefined}
            className={`xp-desktop-icon ${isSelected ? 'is-selected' : ''} ${isDropTarget ? 'is-drop-target' : ''}`}
            style={{ left: p.x, top: p.y }}
            title={icon.id === 'recycle' ? 'Drag icons here to delete them' : `Open ${itemLabel(icon.id)}`}
            onPointerDown={(e) => handleIconPointerDown(e, icon.id)}
            onPointerMove={handleIconPointerMove}
            onPointerUp={(e) => handleIconPointerUp(e, icon.id)}
            onPointerCancel={endDrag}
            onDoubleClick={() => onOpen(icon.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onIconContextMenu(icon.id, e.clientX, e.clientY);
            }}
          >
            <div className="xp-desktop-icon__img">{renderItemIcon(icon.id, 34, binFull)}</div>
            <div className="xp-desktop-icon__label">{itemLabel(icon.id)}</div>
          </div>
        );
      })}

      {bandRect && (
        <div
          className="xp-selection-rect"
          style={{ left: bandRect.x, top: bandRect.y, width: bandRect.w, height: bandRect.h }}
        />
      )}

      {ghost &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[9800]">
            {icons
              .filter((i) => ghost.ids.includes(i.id))
              .map((icon) => {
                const p = clampPos(icon.x + ghost.dx, icon.y + ghost.dy);
                return (
                  <div key={icon.id} className="xp-desktop-icon is-ghost" style={{ left: p.x, top: p.y }}>
                    <div className="xp-desktop-icon__img">{renderItemIcon(icon.id, 34, binFull)}</div>
                    <div className="xp-desktop-icon__label">{itemLabel(icon.id)}</div>
                  </div>
                );
              })}
            {ghost.overBin && (
              <div
                className="absolute rounded-[3px] border border-black bg-[#ffffe1] px-1.5 py-0.5 text-[11px] text-black shadow"
                style={{
                  left: clampPos(icons.find((i) => i.id === ghost.ids[0])?.x ?? 0, 0).x + ghost.dx + 56,
                  top: (icons.find((i) => i.id === ghost.ids[0])?.y ?? 0) + ghost.dy + 44,
                }}
              >
                Move to Recycle Bin
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

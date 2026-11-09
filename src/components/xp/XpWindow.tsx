import React, { useEffect, useRef } from 'react';
import { clamp } from '../../utils/storage';

export interface WindowState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const DIRS: ResizeDir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

interface XpWindowProps {
  win: WindowState;
  title: string;
  icon: React.ReactNode;
  focused: boolean;
  isMobile: boolean;
  resizable: boolean;
  maximizable: boolean;
  autoSize: boolean;
  minWidth: number;
  minHeight: number;
  statusBar?: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (rect: WindowRect) => void;
  children: React.ReactNode;
}

export const XpWindow: React.FC<XpWindowProps> = ({
  win,
  title,
  icon,
  focused,
  isMobile,
  resizable,
  maximizable,
  autoSize,
  minWidth,
  minHeight,
  statusBar,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  onResize,
  children,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const op = useRef<{
    mode: 'move' | ResizeDir;
    pointerId: number;
    startX: number;
    startY: number;
    rect: WindowRect;
  } | null>(null);
  const maximized = win.isMaximized || isMobile;

  useEffect(() => () => document.body.classList.remove('xp-dragging'), []);

  const begin = (mode: 'move' | ResizeDir, e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || maximized) return;
    if (mode !== 'move' && (!resizable || autoSize)) return;
    const el = rootRef.current;
    op.current = {
      mode,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      rect: {
        x: win.x,
        y: win.y,
        width: el?.offsetWidth ?? win.width,
        height: el?.offsetHeight ?? win.height,
      },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.classList.add('xp-dragging');
  };

  const move = (e: React.PointerEvent<HTMLElement>) => {
    const o = op.current;
    if (!o || o.pointerId !== e.pointerId) return;
    const dx = e.clientX - o.startX;
    const dy = e.clientY - o.startY;
    if (o.mode === 'move') {
      onMove(
        clamp(o.rect.x + dx, 70 - o.rect.width, window.innerWidth - 70),
        clamp(o.rect.y + dy, 0, window.innerHeight - 30 - 28)
      );
      return;
    }
    let { x, y, width, height } = o.rect;
    if (o.mode.includes('e')) width = Math.max(minWidth, o.rect.width + dx);
    if (o.mode.includes('s')) height = Math.max(minHeight, o.rect.height + dy);
    if (o.mode.includes('w')) {
      width = Math.max(minWidth, o.rect.width - dx);
      x = o.rect.x + o.rect.width - width;
    }
    if (o.mode.includes('n')) {
      height = Math.max(minHeight, o.rect.height - dy);
      y = o.rect.y + o.rect.height - height;
      if (y < 0) {
        height += y;
        y = 0;
      }
    }
    onResize({ x, y, width, height });
  };

  const end = (e: React.PointerEvent<HTMLElement>) => {
    if (op.current?.pointerId !== e.pointerId) return;
    op.current = null;
    document.body.classList.remove('xp-dragging');
  };

  const style: React.CSSProperties = maximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 30px)', zIndex: win.zIndex }
    : autoSize
      ? { left: win.x, top: win.y, zIndex: win.zIndex }
      : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };
  if (win.isMinimized) style.display = 'none';

  return (
    <div
      ref={rootRef}
      data-window-id={win.id}
      className={`xp-window ${focused ? 'is-focused' : ''} ${maximized ? 'is-maximized' : ''}`}
      style={style}
      onPointerDown={onFocus}
    >
      <div className="xp-titlebar-bg" />
      <div
        className="xp-titlebar"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          begin('move', e);
        }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          if (maximizable && !isMobile) onToggleMaximize();
        }}
      >
        <span className="xp-titlebar__icon">{icon}</span>
        <span className="xp-titlebar__title">{title}</span>
        <div className="xp-titlebar__buttons">
          <button
            type="button"
            aria-label="Minimize"
            className="xp-tbtn xp-tbtn--min"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          />
          {!isMobile && (
            <button
              type="button"
              aria-label={win.isMaximized ? 'Restore Down' : 'Maximize'}
              disabled={!maximizable}
              className={`xp-tbtn ${win.isMaximized ? 'xp-tbtn--restore' : 'xp-tbtn--max'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaximize();
              }}
            />
          )}
          <button
            type="button"
            aria-label="Close"
            className="xp-tbtn xp-tbtn--close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      </div>

      <div className={`xp-window-body ${autoSize && !maximized ? 'is-auto' : ''}`}>
        <div className={`flex min-h-0 flex-1 flex-col ${autoSize && maximized ? 'items-center overflow-auto' : ''}`}>
          {children}
        </div>
        {statusBar !== undefined && (
          <div className="xp-statusbar">
            <div className="xp-statusbar__field flex-1">{statusBar}</div>
            <div className="xp-statusbar__field hidden sm:block">♪ Guitar synth ready</div>
          </div>
        )}
      </div>

      {resizable &&
        !autoSize &&
        !maximized &&
        DIRS.map((d) => (
          <div
            key={d}
            className={`xp-resize xp-resize--${d}`}
            onPointerDown={(e) => begin(d, e)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
          />
        ))}
    </div>
  );
};

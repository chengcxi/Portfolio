import React, { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export interface MenuItemDef {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  checked?: boolean;
  shortcut?: string;
  separator?: boolean;
  bold?: boolean;
}

export interface MenuDef {
  label: string;
  items: MenuItemDef[];
}

interface DismissOptions {
  /** Clicks on elements matching this selector never dismiss (e.g. the button that opened the popup). */
  ignore?: string;
  /** Dismiss when the window loses focus. Clicks inside an iframe (PDF viewer, Paint) only show up here. */
  blur?: boolean;
}

/**
 * Closes a popup when the user clicks or right-clicks anywhere outside it,
 * presses Escape, scrolls, resizes, or moves focus into an iframe.
 */
export function useDismiss(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  options: DismissOptions = {}
) {
  const callback = useRef(onDismiss);
  callback.current = onDismiss;
  const { ignore, blur = true } = options;

  useEffect(() => {
    if (!active) return;
    const isInside = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      if (ref.current?.contains(target)) return true;
      if (ignore && target instanceof Element && target.closest(ignore)) return true;
      return false;
    };
    const onPointer = (e: Event) => {
      if (!isInside(e.target)) callback.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') callback.current();
    };
    const dismiss = () => callback.current();

    window.addEventListener('pointerdown', onPointer, true);
    window.addEventListener('contextmenu', onPointer, true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', dismiss, { passive: true });
    window.addEventListener('resize', dismiss);
    if (blur) window.addEventListener('blur', dismiss);
    return () => {
      window.removeEventListener('pointerdown', onPointer, true);
      window.removeEventListener('contextmenu', onPointer, true);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('resize', dismiss);
      if (blur) window.removeEventListener('blur', dismiss);
    };
  }, [active, ref, ignore, blur]);
}

const MenuItems: React.FC<{ items: MenuItemDef[]; onDone: () => void }> = ({ items, onDone }) => (
  <>
    {items.map((item, i) =>
      item.separator ? (
        <div key={`sep-${i}`} className="xp-menu__sep" />
      ) : (
        <button
          key={`${item.label}-${i}`}
          type="button"
          disabled={item.disabled}
          className="xp-menu__item"
          style={item.bold ? { fontWeight: 700 } : undefined}
          onClick={() => {
            onDone();
            item.onClick?.();
          }}
        >
          {item.checked && <span className="xp-menu__check">✔</span>}
          <span>{item.label}</span>
          {item.shortcut && <span className="xp-menu__shortcut">{item.shortcut}</span>}
        </button>
      )
    )}
  </>
);

/** Window menu bar (File / Edit / View …) with working dropdowns. */
export const MenuBar: React.FC<{ menus: MenuDef[]; classic?: boolean }> = ({ menus, classic = false }) => {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useDismiss(open !== null, ref, () => setOpen(null));

  return (
    <div
      ref={ref}
      className="xp-menubar"
      style={classic ? { background: '#c0c0c0', borderBottom: '1px solid #808080', boxShadow: 'none' } : undefined}
    >
      {menus.map((menu, i) => (
        <div key={menu.label} className="relative">
          <button
            type="button"
            className={`xp-menubar__item ${open === i ? 'is-open' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault();
              setOpen(open === i ? null : i);
            }}
            onPointerEnter={() => {
              if (open !== null) setOpen(i);
            }}
          >
            {menu.label}
          </button>
          {open === i && (
            <div className="xp-menu" style={{ left: 0 }}>
              <MenuItems items={menu.items} onDone={() => setOpen(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/** Right-click menu at the cursor (or above it for taskbar menus), kept on screen, closed by any outside click. */
export const ContextMenu: React.FC<{
  x: number;
  y: number;
  items: MenuItemDef[];
  onClose: () => void;
  above?: boolean;
}> = ({ x, y, items, onClose, above = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const top = above ? y - height : y;
    setPos({
      x: Math.max(2, Math.min(x, window.innerWidth - width - 4)),
      y: Math.max(2, Math.min(top, window.innerHeight - height - 4)),
    });
  }, [x, y, above]);

  useDismiss(true, ref, onClose);

  return (
    <div
      ref={ref}
      className="xp-menu xp-context"
      style={{ left: pos.x, top: pos.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuItems items={items} onDone={onClose} />
    </div>
  );
};

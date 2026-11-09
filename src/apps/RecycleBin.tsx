import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { itemLabel, renderItemIcon, type DesktopItemId } from './registry';
import { MessageBox } from '../components/xp/MessageBox';
import { RecycleBinIcon } from '../components/XpIcons';

export interface RecycledItem {
  id: DesktopItemId;
  x: number;
  y: number;
  deletedAt: number;
}

interface RecycleBinProps {
  items: RecycledItem[];
  onRestore: (ids: DesktopItemId[], drop?: { x: number; y: number }) => void;
  onEmpty: () => void;
  onDeleteForever: (ids: DesktopItemId[]) => void;
}

const TaskCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="overflow-hidden rounded-t-[4px] border border-white/60 shadow-sm">
    <div className="xp-explorer-card-header px-2.5 py-1 text-[11px] font-bold text-[#215dc6]">{title}</div>
    <div className="space-y-1.5 bg-[#d6dff7] p-2 text-[11px] text-[#1a2e5a]">{children}</div>
  </div>
);

const TaskLink: React.FC<{ disabled?: boolean; onClick: () => void; children: React.ReactNode }> = ({
  disabled,
  onClick,
  children,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="block text-left text-[#215dc6] hover:underline disabled:cursor-default disabled:text-[#8aa0cc] disabled:no-underline"
  >
    {children}
  </button>
);

export const RecycleBin: React.FC<RecycleBinProps> = ({ items, onRestore, onEmpty, onDeleteForever }) => {
  const [selected, setSelected] = useState<DesktopItemId[]>([]);
  const [confirm, setConfirm] = useState<null | 'empty' | 'delete'>(null);
  const [view, setView] = useState<'icons' | 'details'>('icons');
  const drag = useRef<{ ids: DesktopItemId[]; pointerId: number; startX: number; startY: number; moved: boolean } | null>(null);
  const [ghost, setGhost] = useState<{ ids: DesktopItemId[]; x: number; y: number; outside: boolean } | null>(null);
  const live = selected.filter((id) => items.some((i) => i.id === id));
  const single = live.length === 1 ? items.find((i) => i.id === live[0]) : undefined;

  const isOutside = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    return !el?.closest('[data-drop-target="recycle-bin"]');
  };

  const endDrag = () => {
    drag.current = null;
    setGhost(null);
    document.body.classList.remove('xp-dragging');
  };

  const onItemDown = (e: React.PointerEvent<HTMLElement>, id: DesktopItemId) => {
    if (e.button !== 0) return;
    const ids =
      e.ctrlKey || e.metaKey
        ? live.includes(id)
          ? live.filter((x) => x !== id)
          : [...live, id]
        : live.includes(id)
          ? live
          : [id];
    setSelected(ids);
    if (!ids.includes(id)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { ids, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false };
  };

  const onItemMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 5) return;
      d.moved = true;
      document.body.classList.add('xp-dragging');
    }
    setGhost({ ids: d.ids, x: e.clientX, y: e.clientY, outside: isOutside(e.clientX, e.clientY) });
  };

  const onItemUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    endDrag();
    if (d.moved && isOutside(e.clientX, e.clientY)) {
      onRestore(d.ids, { x: e.clientX - 37, y: e.clientY - 20 });
      setSelected([]);
    }
  };

  const itemHandlers = (id: DesktopItemId) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => onItemDown(e, id),
    onPointerMove: onItemMove,
    onPointerUp: onItemUp,
    onPointerCancel: endDrag,
    onDoubleClick: () => onRestore([id]),
    title: 'Double-click, press Restore, or drag onto the desktop to restore',
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col" data-drop-target="recycle-bin">
      <div className="xp-toolbar">
        <button
          type="button"
          className="xp-toolbar-btn"
          disabled={!live.length}
          onClick={() => {
            onRestore(live);
            setSelected([]);
          }}
        >
          ♻️ Restore
        </button>
        <button type="button" className="xp-toolbar-btn" disabled={!items.length} onClick={() => onRestore(items.map((i) => i.id))}>
          ↺ Restore All
        </button>
        <button type="button" className="xp-toolbar-btn" disabled={!live.length} onClick={() => setConfirm('delete')}>
          ✖ Delete
        </button>
        <span className="xp-toolbar-sep" />
        <button type="button" className="xp-toolbar-btn" disabled={!items.length} onClick={() => setConfirm('empty')}>
          🗑️ Empty Recycle Bin
        </button>
        <div className="flex-1" />
        <button type="button" className="xp-toolbar-btn" onClick={() => setView((v) => (v === 'icons' ? 'details' : 'icons'))}>
          {view === 'icons' ? '☰ Details' : '▦ Icons'}
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-[#c5c2b2] bg-[#ece9d8] px-2 py-1 text-[11px]">
        <span className="text-[#555]">Address</span>
        <div className="xp-sunken flex flex-1 items-center gap-1.5 px-1.5 py-0.5">
          <RecycleBinIcon size={14} full={items.length > 0} />
          Recycle Bin
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="xp-explorer-sidebar hidden w-[200px] shrink-0 space-y-2.5 overflow-y-auto p-2.5 md:block">
          <TaskCard title="Recycle Bin Tasks">
            <TaskLink disabled={!items.length} onClick={() => setConfirm('empty')}>
              🗑️ Empty the Recycle Bin
            </TaskLink>
            <TaskLink disabled={!items.length} onClick={() => onRestore(items.map((i) => i.id))}>
              ↺ Restore all items
            </TaskLink>
            <TaskLink
              disabled={!live.length}
              onClick={() => {
                onRestore(live);
                setSelected([]);
              }}
            >
              ♻️ Restore {live.length > 1 ? 'the selected items' : 'this item'}
            </TaskLink>
          </TaskCard>
          <TaskCard title="Details">
            {single ? (
              <>
                <div className="font-bold">{itemLabel(single.id)}</div>
                <div>Shortcut · Original location: Desktop</div>
                <div>Deleted: {new Date(single.deletedAt).toLocaleString()}</div>
              </>
            ) : (
              <>
                <div className="font-bold">Recycle Bin</div>
                <div>{items.length} item(s)</div>
                <div className="text-[10px] leading-snug text-[#3a4f7a]">
                  Drag desktop icons onto the bin to delete them. Drag items from here back onto the desktop to restore.
                </div>
              </>
            )}
          </TaskCard>
        </div>

        <div
          className="min-w-0 flex-1 overflow-auto bg-white p-2"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelected([]);
          }}
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[11px] text-[#666]">
              <RecycleBinIcon size={52} />
              <div className="font-bold text-[#333]">The Recycle Bin is empty</div>
              <div className="max-w-[270px] leading-snug">
                Drag any desktop icon onto the Recycle Bin (or into this window) to delete it. Deleted shortcuts can be
                restored from here.
              </div>
            </div>
          ) : view === 'icons' ? (
            <div className="flex flex-wrap content-start gap-1">
              {items.map((item) => {
                const sel = live.includes(item.id);
                return (
                  <div
                    key={item.id}
                    {...itemHandlers(item.id)}
                    className={`flex w-[88px] cursor-default flex-col items-center gap-1 rounded-[2px] p-1.5 text-center ${
                      sel ? 'bg-[#316ac5]/15 outline outline-1 outline-dotted outline-[#316ac5]' : 'hover:bg-[#eef4fc]'
                    }`}
                    style={{ touchAction: 'none' }}
                  >
                    <div className="opacity-90">{renderItemIcon(item.id, 34)}</div>
                    <span className={`px-0.5 text-[11px] leading-tight ${sel ? 'bg-[#316ac5] text-white' : ''}`}>
                      {itemLabel(item.id)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#aca899] bg-[#ece9d8]">
                  <th className="px-2 py-1 font-normal">Name</th>
                  <th className="hidden px-2 py-1 font-normal sm:table-cell">Original Location</th>
                  <th className="px-2 py-1 font-normal">Date Deleted</th>
                  <th className="hidden px-2 py-1 font-normal sm:table-cell">Type</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const sel = live.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      {...itemHandlers(item.id)}
                      className={sel ? 'bg-[#316ac5] text-white' : 'hover:bg-[#eef4fc]'}
                      style={{ touchAction: 'none' }}
                    >
                      <td className="px-2 py-1">
                        <span className="flex items-center gap-1.5">
                          {renderItemIcon(item.id, 16)}
                          {itemLabel(item.id)}
                        </span>
                      </td>
                      <td className="hidden px-2 py-1 sm:table-cell">Desktop</td>
                      <td className="px-2 py-1">{new Date(item.deletedAt).toLocaleString()}</td>
                      <td className="hidden px-2 py-1 sm:table-cell">Shortcut</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="xp-statusbar">
        <div className="xp-statusbar__field flex-1">
          {items.length} object(s){live.length ? ` · ${live.length} selected` : ''}
        </div>
      </div>

      {confirm === 'empty' && (
        <MessageBox
          title="Confirm Multiple File Delete"
          icon="warning"
          buttons={[
            {
              label: 'Yes',
              primary: true,
              onClick: () => {
                onEmpty();
                setSelected([]);
                setConfirm(null);
              },
            },
            { label: 'No', onClick: () => setConfirm(null) },
          ]}
        >
          Are you sure you want to permanently delete these {items.length} item(s)? The programs stay available from
          Start ▸ All Programs, and right-click the desktop ▸ Restore Default Icons brings them back.
        </MessageBox>
      )}
      {confirm === 'delete' && (
        <MessageBox
          title="Confirm File Delete"
          icon="warning"
          buttons={[
            {
              label: 'Yes',
              primary: true,
              onClick: () => {
                onDeleteForever(live);
                setSelected([]);
                setConfirm(null);
              },
            },
            { label: 'No', onClick: () => setConfirm(null) },
          ]}
        >
          Are you sure you want to permanently delete {live.length === 1 ? `“${itemLabel(live[0])}”` : `these ${live.length} items`}?
        </MessageBox>
      )}

      {ghost &&
        createPortal(
          <div className="pointer-events-none fixed z-[9800] flex flex-col items-center gap-0.5" style={{ left: ghost.x - 36, top: ghost.y - 22 }}>
            <div className="flex opacity-70">
              {ghost.ids.slice(0, 3).map((id) => (
                <span key={id}>{renderItemIcon(id, 34)}</span>
              ))}
            </div>
            <span
              className={`rounded-[2px] px-1 text-[11px] ${
                ghost.outside ? 'border border-black bg-[#ffffe1] text-black' : 'bg-[#0b61ff] text-white'
              }`}
            >
              {ghost.outside ? 'Restore to Desktop' : itemLabel(ghost.ids[0])}
            </span>
          </div>,
          document.body
        )}
    </div>
  );
};

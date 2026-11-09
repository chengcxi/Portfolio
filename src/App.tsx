import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_PROFILE, INITIAL_REPOS, syncGitHubLive, type GitHubProfile, type GitHubRepo } from './data/githubData';
import { guitarAudio, type GuitarScaleMode, type PluckEvent } from './utils/guitarAudio';
import { sfx } from './utils/sfx';
import { playXpSound } from './utils/xpSounds';
import { clamp, loadJSON, saveJSON } from './utils/storage';
import { WALLPAPER } from './assets/wallpaper';
import { OWNER, resolvePublicUrl } from './config/portfolio';

// Full-size wallpaper from public/images/. The small built-in copy sits underneath, so the desktop
// still shows Bliss while the big file loads, or if the file is missing.
const WALLPAPER_HD = resolvePublicUrl('images/bliss-xp.jpg');
import { APPS, DEFAULT_PINS, DESKTOP_ORDER, isAppId, type AppId, type DesktopItemId } from './apps/registry';
import { XpWindow, type WindowRect, type WindowState } from './components/xp/XpWindow';
import { Desktop, type DesktopIcon } from './components/xp/Desktop';
import { defaultLayout, findFreeCell } from './components/xp/desktopGrid';
import { Taskbar, type TaskItem } from './components/xp/Taskbar';
import { StartMenu } from './components/xp/StartMenu';
import { ContextMenu, type MenuItemDef } from './components/xp/MenuBar';
import { BootScreen, LoginScreen, PowerDialog, PoweredOffScreen, StandbyScreen } from './components/xp/SessionScreens';
import { AboutApp } from './components/apps/AboutApp';
import { ProjectsExplorerApp } from './components/apps/ProjectsExplorerApp';
import { RustyGuitarApp } from './components/apps/RustyGuitarApp';
import { ReadmeNotepadApp } from './components/apps/ReadmeNotepadApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { RecycleBin, type RecycledItem } from './apps/RecycleBin';
import { Minesweeper } from './apps/minesweeper/Minesweeper';
import { Solitaire } from './apps/solitaire/Solitaire';
import { Paint } from './apps/paint/Paint';
import { PdfViewer } from './apps/pdf/PdfViewer';
import { AimApp } from './apps/aim/AimApp';
import { AimChat } from './apps/aim/AimChat';
import { getAccount, useAim } from './apps/aim/aimStore';

type Overlay = 'boot' | 'login' | 'standby' | 'off' | null;

interface DesktopState {
  icons: DesktopIcon[];
  recycled: RecycledItem[];
  removed: DesktopItemId[];
}

interface FloatingNote {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface ContextState {
  x: number;
  y: number;
  items: MenuItemDef[];
  above?: boolean;
}

const DESKTOP_KEY = 'xp-portfolio-desktop-v2';
const SESSION_KEY = 'xp-portfolio-session';
const PIN_KEY = 'xp-portfolio-pins';
const TASKBAR_H = 30;

const areaSize = () => ({ w: window.innerWidth, h: window.innerHeight - TASKBAR_H });
const isDesktopItem = (id: unknown): id is DesktopItemId => typeof id === 'string' && (DESKTOP_ORDER as string[]).includes(id);

function freshDesktop(): DesktopState {
  const { w, h } = areaSize();
  return { icons: defaultLayout(DESKTOP_ORDER, w, h) as DesktopIcon[], recycled: [], removed: [] };
}

function loadDesktop(): DesktopState {
  const saved = loadJSON<Partial<DesktopState> | null>(DESKTOP_KEY, null);
  if (!saved || !Array.isArray(saved.icons)) return freshDesktop();
  const { w, h } = areaSize();
  const icons: DesktopIcon[] = saved.icons.filter((i) => isDesktopItem(i?.id) && Number.isFinite(i.x) && Number.isFinite(i.y));
  const recycled: RecycledItem[] = (Array.isArray(saved.recycled) ? saved.recycled : []).filter(
    (r) => isDesktopItem(r?.id) && r.id !== 'recycle' && !icons.some((i) => i.id === r.id)
  );
  const removed: DesktopItemId[] = (Array.isArray(saved.removed) ? saved.removed : []).filter(
    (id) => isDesktopItem(id) && id !== 'recycle' && !icons.some((i) => i.id === id) && !recycled.some((r) => r.id === id)
  );
  const known = new Set<string>([...icons.map((i) => i.id), ...recycled.map((r) => r.id), ...removed]);
  for (const id of DESKTOP_ORDER) {
    if (!known.has(id)) icons.push({ id, ...findFreeCell(id === 'recycle' ? { x: w, y: h } : { x: 8, y: 8 }, icons, w, h) });
  }
  return { icons, recycled, removed };
}

const hasSession = () => {
  try {
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return false;
  }
};

export function App() {
  const [overlay, setOverlay] = useState<Overlay>(() => (hasSession() ? null : 'boot'));
  const [sessionActive, setSessionActive] = useState(hasSession);
  const [powerDialog, setPowerDialog] = useState<null | 'shutdown' | 'logoff'>(null);
  // True right after startup, so the welcome screen plays the Windows XP startup sound once.
  const [fromBoot, setFromBoot] = useState(false);

  const [profile, setProfile] = useState<GitHubProfile>(INITIAL_PROFILE);
  const [repos, setRepos] = useState<GitHubRepo[]>(INITIAL_REPOS);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const isMobile = viewport.w < 768;

  const [desk, setDesk] = useState<DesktopState>(loadDesktop);
  const [selectedIcons, setSelectedIcons] = useState<DesktopItemId[]>([]);

  const [pinned, setPinned] = useState<AppId[]>(() => loadJSON<string[]>(PIN_KEY, DEFAULT_PINS).filter(isAppId));

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<AppId | null>(null);
  const windowsRef = useRef(windows);
  windowsRef.current = windows;
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const zRef = useRef(10);
  const bootedRef = useRef(false);

  const [startOpen, setStartOpen] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<ContextState | null>(null);
  const [balloon, setBalloon] = useState(false);

  const [synthEnabled, setSynthEnabled] = useState(true);
  const [synthMode, setSynthMode] = useState<GuitarScaleMode>('open-strings');
  const [volume, setVolume] = useState(guitarAudio.volume);
  const [lastPluck, setLastPluck] = useState<PluckEvent | null>(null);
  const [notes, setNotes] = useState<FloatingNote[]>([]);
  const pointer = useRef({ x: 260, y: 220 });
  const scrollIntent = useRef(0);

  const aimState = useAim();
  const aimAccount = getAccount(aimState, aimState.currentUser);

  /* ----------------------------- effects ----------------------------- */
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    saveJSON(DESKTOP_KEY, desk);
  }, [desk]);

  useEffect(() => {
    saveJSON(PIN_KEY, pinned);
  }, [pinned]);

  useEffect(
    () =>
      guitarAudio.subscribe((ev) => {
        setLastPluck(ev);
        const id = Date.now() + Math.random();
        const { x, y } = pointer.current;
        setNotes((prev) => [...prev.slice(-7), { id, x, y, label: `♪ ${ev.note}` }]);
        window.setTimeout(() => setNotes((prev) => prev.filter((n) => n.id !== id)), 850);
      }),
    []
  );

  // Guitar plucks only happen on the logged-in desktop, never on the boot, welcome, standby or power-off screens.
  const pluckActive = sessionActive && overlay === null && !powerDialog;
  const pluckActiveRef = useRef(pluckActive);
  pluckActiveRef.current = pluckActive;

  // Every click or scroll plucks a random classical guitar string while the desktop is active.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      scrollIntent.current = Date.now();
      const t = e.target as HTMLElement | null;
      if (!t || t.closest('[data-guitar-note="true"]')) return;
      if (t instanceof HTMLInputElement && t.type === 'range') return;
      if (!pluckActiveRef.current) return;
      guitarAudio.pluckRandom('click');
    };
    const onWheel = (e: WheelEvent) => {
      if (!pluckActiveRef.current) return;
      pointer.current = { x: e.clientX, y: e.clientY };
      scrollIntent.current = Date.now();
      guitarAudio.pluckRandom('scroll');
    };
    const onIntent = () => {
      scrollIntent.current = Date.now();
    };
    const onScroll = () => {
      if (!pluckActiveRef.current) return;
      if (Date.now() - scrollIntent.current < 900) guitarAudio.pluckRandom('scroll');
    };
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onIntent, { passive: true });
    window.addEventListener('keydown', onIntent);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onIntent);
      window.removeEventListener('keydown', onIntent);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const data = await syncGitHubLive();
      setProfile(data.profile);
      setRepos(data.repos);
      setLastSynced(data.syncedAt);
    } catch {
      /* rate-limited: keep the verified snapshot */
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  useEffect(() => {
    if (!balloon) return;
    const t = window.setTimeout(() => setBalloon(false), 11000);
    return () => window.clearTimeout(t);
  }, [balloon]);

  /* ------------------------- window management ------------------------- */
  const openApp = useCallback((id: AppId) => {
    zRef.current += 1;
    const z = zRef.current;
    setWindows((prev) => {
      if (prev.some((w) => w.id === id)) return prev.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: z } : w));
      const def = APPS[id];
      const { w: vw, h: vh } = areaSize();
      const width = def.autoSize ? 0 : Math.min(def.width, vw - 16);
      const height = def.autoSize ? 0 : Math.min(def.height, vh - 12);
      const n = prev.length;
      let x: number;
      let y: number;
      if (def.placement === 'right') {
        x = vw - width - 18;
        y = 14;
      } else if (def.x !== undefined && def.y !== undefined) {
        x = def.x;
        y = def.y;
      } else {
        x = 150 + (n % 6) * 28;
        y = 34 + (n % 6) * 26;
      }
      x = clamp(x, 4, vw - (width || 280) - 4);
      y = clamp(y, 4, vh - (height || 320) - 4);
      return [...prev, { id, x, y, width, height, zIndex: z, isMinimized: false, isMaximized: false }];
    });
    setActiveId(id);
    setStartOpen(false);
  }, []);

  const nextTop = (exclude: string): AppId | null =>
    (windowsRef.current
      .filter((w) => w.id !== exclude && !w.isMinimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0]?.id as AppId | undefined) ?? null;

  const closeApp = useCallback((id: AppId) => {
    setActiveId((cur) => (cur === id ? nextTop(id) : cur));
    setWindows((prev) => prev.filter((w) => w.id !== id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minimizeApp = useCallback((id: AppId) => {
    setActiveId((cur) => (cur === id ? nextTop(id) : cur));
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusApp = useCallback((id: AppId) => {
    if (activeRef.current === id) return;
    zRef.current += 1;
    const z = zRef.current;
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: z, isMinimized: false } : w)));
    setActiveId(id);
  }, []);

  const toggleMaximize = useCallback((id: AppId) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))), []);
  const moveWindow = useCallback((id: AppId, x: number, y: number) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w))), []);
  const resizeWindow = useCallback((id: AppId, r: WindowRect) => setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...r } : w))), []);

  /** Taskbar click: open closed apps, restore minimized ones, or minimize the focused one. */
  const onTaskClick = (id: string) => {
    if (!isAppId(id)) return;
    const w = windowsRef.current.find((x) => x.id === id);
    if (!w) {
      openApp(id);
      return;
    }
    if (w.isMinimized || activeRef.current !== id) {
      zRef.current += 1;
      const z = zRef.current;
      setWindows((prev) => prev.map((x) => (x.id === id ? { ...x, isMinimized: false, zIndex: z } : x)));
      setActiveId(id);
    } else {
      minimizeApp(id);
    }
  };

  const togglePin = (id: AppId) => setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /** Right-click on a taskbar button: open / restore / minimize / maximize / close, plus pin or unpin. */
  const openTaskMenu = (id: string, x: number) => {
    if (!isAppId(id)) return;
    const w = windowsRef.current.find((win) => win.id === id);
    const items: MenuItemDef[] = [];
    if (w) {
      items.push(w.isMinimized ? { label: 'Restore', bold: true, onClick: () => onTaskClick(id) } : { label: 'Minimize', onClick: () => minimizeApp(id) });
      if (!APPS[id].autoSize && APPS[id].maximizable !== false) {
        items.push({ label: w.isMaximized ? 'Restore Down' : 'Maximize', onClick: () => toggleMaximize(id) });
      }
      items.push({ separator: true });
      items.push({ label: 'Close', onClick: () => closeApp(id) });
    } else {
      items.push({ label: 'Open', bold: true, onClick: () => openApp(id) });
    }
    items.push({ separator: true });
    items.push({ label: pinned.includes(id) ? 'Unpin from Taskbar' : 'Pin to Taskbar', onClick: () => togglePin(id) });
    setCtxMenu({ x, y: window.innerHeight - TASKBAR_H, items, above: true });
  };

  const openItem = useCallback(
    (id: DesktopItemId) => {
      if (id === 'github') window.open(OWNER.github, '_blank', 'noopener,noreferrer');
      else openApp(id);
    },
    [openApp]
  );

  // Open the welcome windows the first time the desktop appears in a session.
  useEffect(() => {
    if (!sessionActive || overlay !== null || bootedRef.current) return;
    bootedRef.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    if (windowsRef.current.length === 0) {
      const w = window.innerWidth;
      const initial: AppId[] = w < 768 ? ['about'] : w >= 1180 ? ['about', 'aim', 'projects'] : ['about', 'projects'];
      initial.forEach((id) => openApp(id));
    }
    const t = window.setTimeout(() => setBalloon(true), 1400);
    return () => window.clearTimeout(t);
  }, [sessionActive, overlay, openApp]);

  /* ----------------------------- session ----------------------------- */
  const endSession = () => {
    setWindows([]);
    setActiveId(null);
    setSessionActive(false);
    setStartOpen(false);
    setCtxMenu(null);
    setBalloon(false);
    bootedRef.current = false;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  };

  /* ------------------------- desktop & recycle ------------------------- */
  const recycleItems = useCallback((ids: DesktopItemId[]) => {
    const targets: DesktopItemId[] = ids.filter((id) => id !== 'recycle');
    if (!targets.length) return;
    setDesk((d) => ({
      ...d,
      icons: d.icons.filter((i) => !targets.includes(i.id)),
      recycled: [...d.recycled, ...d.icons.filter((i) => targets.includes(i.id)).map((i) => ({ ...i, deletedAt: Date.now() }))],
    }));
    setSelectedIcons([]);
    sfx.recycle();
  }, []);

  const restoreItems = useCallback((ids: DesktopItemId[], drop?: { x: number; y: number }) => {
    const { w, h } = areaSize();
    setDesk((d) => {
      const icons = [...d.icons];
      d.recycled
        .filter((r) => ids.includes(r.id))
        .forEach((item, k) => {
          const desired = drop ? { x: drop.x + k * 78, y: drop.y } : { x: item.x, y: item.y };
          icons.push({ id: item.id, ...findFreeCell(desired, icons, w, h) });
        });
      return { ...d, icons, recycled: d.recycled.filter((r) => !ids.includes(r.id)) };
    });
    sfx.ding();
  }, []);

  const deleteForever = useCallback((ids: DesktopItemId[]) => {
    setDesk((d) => ({
      ...d,
      recycled: d.recycled.filter((r) => !ids.includes(r.id)),
      removed: [...d.removed, ...ids.filter((id) => d.recycled.some((r) => r.id === id))],
    }));
    sfx.recycle();
  }, []);

  const emptyBin = useCallback(() => {
    setDesk((d) => ({ ...d, recycled: [], removed: [...d.removed, ...d.recycled.map((r) => r.id)] }));
    sfx.recycle();
  }, []);

  const arrangeIcons = () => {
    const { w, h } = areaSize();
    setDesk((d) => ({
      ...d,
      icons: defaultLayout(
        DESKTOP_ORDER.filter((id) => d.icons.some((i) => i.id === id)),
        w,
        h
      ) as DesktopIcon[],
    }));
  };

  const toggleSynth = (next: boolean) => {
    setSynthEnabled(next);
    guitarAudio.enabled = next;
  };
  const changeMode = (mode: GuitarScaleMode) => {
    setSynthMode(mode);
    guitarAudio.mode = mode;
  };
  const changeVolume = (v: number) => {
    setVolume(v);
    guitarAudio.setVolume(v);
  };

  // Delete / Enter on selected desktop icons
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!sessionActive || overlay || activeId !== null || !selectedIcons.length) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        recycleItems(selectedIcons);
      } else if (e.key === 'Enter') {
        selectedIcons.forEach((id) => openItem(id));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sessionActive, overlay, activeId, selectedIcons, recycleItems, openItem]);

  const showDesktopMenu = (x: number, y: number) =>
    setCtxMenu({
      x,
      y,
      items: [
        { label: 'Arrange Icons by Name', onClick: arrangeIcons },
        { label: 'Refresh', onClick: handleSync },
        { separator: true },
        { label: 'Open Recycle Bin', onClick: () => openApp('recycle') },
        {
          label: 'Restore Default Icons',
          onClick: () => {
            setDesk(freshDesktop());
            setSelectedIcons([]);
          },
        },
        { separator: true },
        { label: synthEnabled ? 'Mute Guitar Plucks' : 'Enable Guitar Plucks', onClick: () => toggleSynth(!synthEnabled) },
        { label: `Message ${OWNER.handle} (AIM)`, onClick: () => openApp('aim') },
        { separator: true },
        { label: 'Properties', onClick: () => openApp('about') },
      ],
    });

  const showIconMenu = (id: DesktopItemId, x: number, y: number) =>
    setCtxMenu({
      x,
      y,
      items:
        id === 'recycle'
          ? [
              { label: 'Open', bold: true, onClick: () => openApp('recycle') },
              { label: 'Empty Recycle Bin', disabled: !desk.recycled.length, onClick: emptyBin },
            ]
          : [
              { label: 'Open', bold: true, onClick: () => openItem(id) },
              { separator: true },
              { label: 'Delete', onClick: () => recycleItems(selectedIcons.includes(id) ? selectedIcons : [id]) },
              { separator: true },
              { label: 'Properties', onClick: () => openApp('about') },
            ],
    });

  /* ------------------------------ rendering ------------------------------ */
  const titleOf = (id: string): string => {
    if (!isAppId(id)) return id;
    if (id === 'aim') return aimAccount ? `${aimAccount.screenName}'s Buddy List` : 'Sign On';
    return APPS[id].title;
  };

  const taskItems: TaskItem[] = (() => {
    const ids: AppId[] = [...pinned];
    for (const w of windows) {
      const id = w.id as AppId;
      if (!ids.includes(id)) ids.push(id);
    }
    return ids.map((id) => {
      const w = windows.find((x) => x.id === id);
      return {
        id,
        title: titleOf(id),
        icon: APPS[id].icon(16),
        open: Boolean(w),
        focused: Boolean(w) && !w?.isMinimized && activeId === id,
        pinned: pinned.includes(id),
      };
    });
  })();

  const statusOf = (id: AppId): string | undefined => {
    if (id === 'about') return `github.com/${profile.login} · ${profile.public_repos} public repositories`;
    if (id === 'projects') return `${repos.length} objects · Double-click a repository to open it on GitHub`;
    if (id === 'guitar') {
      return synthEnabled
        ? `Click & scroll plucks: ON (${synthMode === 'serenade' ? "Schubert's Serenade, D major" : 'open classical strings'})`
        : 'Click & scroll plucks: muted';
    }
    return undefined;
  };

  const renderApp = (id: AppId) => {
    switch (id) {
      case 'about':
        return <AboutApp profile={profile} repos={repos} onOpenApp={(x) => isAppId(x) && openApp(x)} />;
      case 'projects':
        return <ProjectsExplorerApp repos={repos} syncing={syncing} lastSynced={lastSynced} onSync={handleSync} onOpenGuitar={() => openApp('guitar')} />;
      case 'resume':
        return <PdfViewer docId="resume" onClose={() => closeApp('resume')} />;
      case 'research':
        return <PdfViewer docId="research" onClose={() => closeApp('research')} />;
      case 'aim':
        return <AimApp onOpenChat={() => openApp('aim-chat')} onOpenResume={() => openApp('resume')} />;
      case 'aim-chat':
        return <AimChat onOpenAim={() => openApp('aim')} />;
      case 'guitar':
        return (
          <RustyGuitarApp
            synthEnabled={synthEnabled}
            onToggleSynth={toggleSynth}
            synthMode={synthMode}
            onChangeMode={changeMode}
            volume={volume}
            onChangeVolume={changeVolume}
            lastPluck={lastPluck}
          />
        );
      case 'minesweeper':
        return <Minesweeper focused={activeId === 'minesweeper'} onClose={() => closeApp('minesweeper')} />;
      case 'solitaire':
        return <Solitaire focused={activeId === 'solitaire'} onClose={() => closeApp('solitaire')} />;
      case 'paint':
        return <Paint />;
      case 'notepad':
        return <ReadmeNotepadApp profile={profile} repos={repos} onClose={() => closeApp('notepad')} />;
      case 'terminal':
        return <TerminalApp profile={profile} repos={repos} onOpenApp={(x) => isAppId(x) && openApp(x)} />;
      case 'recycle':
        return <RecycleBin items={desk.recycled} onRestore={restoreItems} onEmpty={emptyBin} onDeleteForever={deleteForever} />;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {sessionActive && (
        <div
          className={`absolute inset-0 overflow-hidden bg-cover bg-center ${powerDialog ? 'xp-grayscale' : ''}`}
          style={{ backgroundImage: `url('${WALLPAPER_HD}'), url('${WALLPAPER}')`, backgroundColor: '#3a6ea5' }}
          onContextMenu={(e) => {
            if ((e.target as HTMLElement).closest('.xp-window, .xp-taskbar, .xp-startmenu, .xp-menu, .xp-balloon')) return;
            e.preventDefault();
            showDesktopMenu(e.clientX, e.clientY);
          }}
        >
          <Desktop
            icons={desk.icons}
            selected={selectedIcons}
            binFull={desk.recycled.length > 0}
            areaW={viewport.w}
            areaH={viewport.h - TASKBAR_H}
            onSelect={setSelectedIcons}
            onOpen={openItem}
            onMove={(moved) => setDesk((d) => ({ ...d, icons: d.icons.map((i) => moved.find((m) => m.id === i.id) ?? i) }))}
            onRecycle={recycleItems}
            onIconContextMenu={showIconMenu}
            onDesktopFocus={() => setActiveId(null)}
          />

          {windows.map((win) => {
            const id = win.id as AppId;
            const def = APPS[id];
            return (
              <XpWindow
                key={id}
                win={win}
                title={titleOf(id)}
                icon={def.icon(16)}
                focused={activeId === id && !win.isMinimized}
                isMobile={isMobile}
                resizable={def.resizable !== false}
                maximizable={def.maximizable !== false}
                autoSize={Boolean(def.autoSize)}
                minWidth={def.minWidth ?? 300}
                minHeight={def.minHeight ?? 220}
                statusBar={statusOf(id)}
                onFocus={() => focusApp(id)}
                onClose={() => closeApp(id)}
                onMinimize={() => minimizeApp(id)}
                onToggleMaximize={() => toggleMaximize(id)}
                onMove={(x, y) => moveWindow(id, x, y)}
                onResize={(r) => resizeWindow(id, r)}
              >
                {renderApp(id)}
              </XpWindow>
            );
          })}

          {startOpen && (
            <StartMenu
              avatar={profile.avatar_url}
              userName={profile.login}
              onOpen={openApp}
              onOpenGithub={() => window.open(OWNER.github, '_blank', 'noopener,noreferrer')}
              onLogOff={() => setPowerDialog('logoff')}
              onShutdown={() => setPowerDialog('shutdown')}
              onClose={() => setStartOpen(false)}
            />
          )}

          <Taskbar
            items={taskItems}
            startOpen={startOpen}
            onToggleStart={() => setStartOpen((v) => !v)}
            onTaskClick={onTaskClick}
            onTaskContext={openTaskMenu}
            aimOnline={Boolean(aimAccount)}
            onOpenAim={() => openApp('aim')}
            synthEnabled={synthEnabled}
            onToggleSynth={toggleSynth}
            synthMode={synthMode}
            onChangeMode={changeMode}
            volume={volume}
            onChangeVolume={changeVolume}
            lastPluck={lastPluck}
            onOpenGuitar={() => openApp('guitar')}
            balloon={
              balloon
                ? {
                    title: `Welcome to ${OWNER.handle}'s XP`,
                    body: (
                      <>
                        Click or scroll anywhere to pluck a classical guitar string. Open <b>Resume.pdf</b>, play Minesweeper, or{' '}
                        <u>sign on to AIM</u> to message me!
                      </>
                    ),
                    onClick: () => openApp('aim'),
                  }
                : null
            }
            onCloseBalloon={() => setBalloon(false)}
          />

          {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} above={ctxMenu.above} onClose={() => setCtxMenu(null)} />}
        </div>
      )}

      {notes.map((n) => (
        <div
          key={n.id}
          className="animate-float-note pointer-events-none fixed z-[9990] text-[13px] font-bold text-[#fef08a] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          style={{ left: n.x - 10, top: n.y - 24 }}
        >
          {n.label}
        </div>
      ))}

      {powerDialog && (
        <PowerDialog
          kind={powerDialog}
          onCancel={() => setPowerDialog(null)}
          onStandBy={() => {
            setPowerDialog(null);
            setOverlay('standby');
          }}
          onTurnOff={() => {
            setPowerDialog(null);
            sfx.logoff();
            endSession();
            setOverlay('off');
          }}
          onRestart={() => {
            setPowerDialog(null);
            sfx.logoff();
            endSession();
            setOverlay('boot');
          }}
          onLogOff={() => {
            setPowerDialog(null);
            playXpSound('logoff');
            endSession();
            setOverlay('login');
          }}
          onSwitchUser={() => {
            setPowerDialog(null);
            setOverlay('login');
          }}
        />
      )}

      {overlay === 'boot' && (
        <BootScreen
          onDone={() => {
            setFromBoot(true);
            setOverlay('login');
          }}
        />
      )}
      {overlay === 'login' && (
        <LoginScreen
          avatar={profile.avatar_url}
          fromBoot={fromBoot}
          onLogin={() => {
            setFromBoot(false);
            setSessionActive(true);
            setOverlay(null);
          }}
          onTurnOff={() => {
            endSession();
            setOverlay('off');
          }}
        />
      )}
      {overlay === 'standby' && <StandbyScreen onWake={() => setOverlay(null)} />}
      {overlay === 'off' && <PoweredOffScreen onPowerOn={() => setOverlay('boot')} />}
    </div>
  );
}

export default App;

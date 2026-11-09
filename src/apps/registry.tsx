import type { ReactNode } from 'react';
import {
  AimIcon,
  FolderIcon,
  GuitarAppIcon,
  InternetIcon,
  MinesweeperIcon,
  MyComputerIcon,
  NotepadIcon,
  PaintIcon,
  PdfIcon,
  RecycleBinIcon,
  SolitaireIcon,
  TerminalIcon,
} from '../components/XpIcons';
import { IconImage } from '../components/xp/IconImage';
import { OWNER } from '../config/portfolio';

export type AppId =
  | 'about'
  | 'projects'
  | 'resume'
  | 'research'
  | 'aim'
  | 'aim-chat'
  | 'guitar'
  | 'minesweeper'
  | 'solitaire'
  | 'paint'
  | 'notepad'
  | 'terminal'
  | 'recycle';

export type DesktopItemId = AppId | 'github';

export interface AppDef {
  id: AppId;
  title: string;
  label: string;
  description: string;
  icon: (size: number) => ReactNode;
  width: number;
  height: number;
  x?: number;
  y?: number;
  placement?: 'right';
  autoSize?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  hiddenFromPrograms?: boolean;
}

/** Windows XP icon from the embedded icon pack, with an SVG fallback. */
const xpIcon = (name: string, fallback: (size: number) => ReactNode) => (size: number) => (
  <IconImage name={name} size={size} fallback={fallback(size)} />
);

export const APPS: Record<AppId, AppDef> = {
  about: {
    id: 'about',
    title: `System Properties — ${OWNER.handle}`,
    label: 'My Computer',
    description: 'Profile & system info',
    icon: xpIcon('my-computer', (s) => <MyComputerIcon size={s} />),
    width: 610,
    height: 455,
    x: 96,
    y: 26,
  },
  projects: {
    id: 'projects',
    title: 'My Projects — GitHub Repositories',
    label: 'My Projects',
    description: 'Public GitHub repositories',
    icon: xpIcon('my-documents', (s) => <FolderIcon size={s} />),
    width: 790,
    height: 510,
    x: 200,
    y: 62,
  },
  resume: {
    id: 'resume',
    title: 'Resume.pdf - Adobe Reader',
    label: 'Resume.pdf',
    description: 'View or download my resume',
    icon: (s) => <PdfIcon size={s} />,
    width: 760,
    height: 590,
    minWidth: 380,
    minHeight: 300,
  },
  research: {
    id: 'research',
    title: 'research.pdf - Adobe Reader',
    label: 'research.pdf',
    description: 'Research overview',
    icon: (s) => <PdfIcon size={s} />,
    width: 760,
    height: 590,
    minWidth: 380,
    minHeight: 300,
  },
  aim: {
    id: 'aim',
    title: 'Sign On',
    label: 'AOL Instant Messenger',
    description: `Message ${OWNER.handle}`,
    icon: (s) => <AimIcon size={s} />,
    width: 262,
    height: 500,
    placement: 'right',
    minWidth: 236,
    minHeight: 420,
  },
  'aim-chat': {
    id: 'aim-chat',
    title: `${OWNER.handle} - Instant Message`,
    label: 'Instant Message',
    description: `Chat with ${OWNER.handle}`,
    icon: (s) => <AimIcon size={s} />,
    width: 500,
    height: 440,
    minWidth: 340,
    minHeight: 330,
    hiddenFromPrograms: true,
  },
  guitar: {
    id: 'guitar',
    title: 'Rusty Guitar.exe — Classical Soundbox',
    label: 'Rusty Guitar',
    description: 'Classical guitar synth',
    icon: (s) => <GuitarAppIcon size={s} />,
    width: 660,
    height: 500,
  },
  minesweeper: {
    id: 'minesweeper',
    title: 'Minesweeper',
    label: 'Minesweeper',
    description: 'Classic mine-clearing puzzle',
    icon: xpIcon('minesweeper', (s) => <MinesweeperIcon size={s} />),
    width: 0,
    height: 0,
    autoSize: true,
    resizable: false,
    maximizable: false,
  },
  solitaire: {
    id: 'solitaire',
    title: "'Classic' Solitaire",
    label: 'Solitaire',
    description: 'Klondike card game',
    icon: xpIcon('solitaire', (s) => <SolitaireIcon size={s} />),
    width: 712,
    height: 600,
    minWidth: 480,
    minHeight: 420,
  },
  paint: {
    id: 'paint',
    title: 'untitled - Paint',
    label: 'Paint',
    description: 'JS Paint (jspaint.app)',
    icon: xpIcon('paint', (s) => <PaintIcon size={s} />),
    width: 900,
    height: 640,
    minWidth: 480,
    minHeight: 360,
  },
  notepad: {
    id: 'notepad',
    title: 'README.txt - Notepad',
    label: 'README.txt',
    description: 'Read me first',
    icon: xpIcon('notepad', (s) => <NotepadIcon size={s} />),
    width: 590,
    height: 440,
  },
  terminal: {
    id: 'terminal',
    title: 'C:\\WINDOWS\\system32\\cmd.exe',
    label: 'Command Prompt',
    description: 'Portfolio shell',
    icon: xpIcon('cmd', (s) => <TerminalIcon size={s} />),
    width: 630,
    height: 400,
  },
  recycle: {
    id: 'recycle',
    title: 'Recycle Bin',
    label: 'Recycle Bin',
    description: 'Restore deleted shortcuts',
    icon: xpIcon('recycle-empty', (s) => <RecycleBinIcon size={s} />),
    width: 640,
    height: 430,
    minWidth: 380,
    minHeight: 280,
  },
};

export const DESKTOP_ORDER: DesktopItemId[] = [
  'about',
  'projects',
  'resume',
  'research',
  'aim',
  'github',
  'guitar',
  'minesweeper',
  'solitaire',
  'paint',
  'notepad',
  'terminal',
  'recycle',
];

/** Apps pinned to the taskbar until the user changes them. */
export const DEFAULT_PINS: AppId[] = ['projects', 'resume', 'aim'];

export const ALL_PROGRAMS: AppId[] = (Object.keys(APPS) as AppId[]).filter((id) => !APPS[id].hiddenFromPrograms);

export const isAppId = (id: string): id is AppId => id in APPS;

export const itemLabel = (id: DesktopItemId): string => (id === 'github' ? 'GitHub Profile' : APPS[id].label);

export function renderItemIcon(id: DesktopItemId, size: number, binFull = false): ReactNode {
  if (id === 'github') {
    return <IconImage name="internet-explorer" size={size} fallback={<InternetIcon size={size} />} />;
  }
  if (id === 'recycle') {
    return (
      <IconImage
        name={binFull ? 'recycle-full' : 'recycle-empty'}
        size={size}
        fallback={<RecycleBinIcon size={size} full={binFull} />}
      />
    );
  }
  return APPS[id].icon(size);
}

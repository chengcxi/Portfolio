import React, { useRef, useState } from 'react';
import { ALL_PROGRAMS, APPS, type AppId } from '../../apps/registry';
import { AimIcon, GreenArrowIcon, HelpIcon, PowerIcon } from '../XpIcons';
import { IconImage } from './IconImage';
import { useDismiss } from './MenuBar';

interface StartMenuProps {
  avatar: string;
  userName: string;
  onOpen: (id: AppId) => void;
  onOpenGithub: () => void;
  onLogOff: () => void;
  onShutdown: () => void;
  onClose: () => void;
}

const PINNED: AppId[] = ['projects', 'resume', 'research', 'guitar', 'minesweeper', 'solitaire', 'paint'];

export const StartMenu: React.FC<StartMenuProps> = ({ avatar, userName, onOpen, onOpenGithub, onLogOff, onShutdown, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [programsOpen, setProgramsOpen] = useState(false);

  // The start button toggles the menu itself, so its clicks are ignored here.
  useDismiss(true, ref, onClose, { ignore: '[data-start-button]' });

  const open = (id: AppId) => {
    onOpen(id);
    onClose();
  };

  const rightItem = (id: AppId, label: string, bold = false, icon?: React.ReactNode) => (
    <button key={`${id}-${label}`} type="button" className="xp-startmenu__item" style={bold ? { fontWeight: 700 } : undefined} onClick={() => open(id)}>
      <span className="flex shrink-0">{icon ?? APPS[id].icon(22)}</span>
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <div ref={ref} className="xp-startmenu">
      <div className="xp-startmenu__header">
        <img className="xp-startmenu__avatar" src={avatar} alt="" />
        <span className="xp-startmenu__user">{userName}</span>
      </div>

      <div className="xp-startmenu__body">
        <div className="xp-startmenu__left">
          <button
            type="button"
            className="xp-startmenu__item"
            onClick={() => {
              onOpenGithub();
              onClose();
            }}
          >
            <IconImage name="internet-explorer" size={30} fallback={<AimIcon size={30} />} />
            <span className="min-w-0">
              <b className="block">Internet</b>
              <small>GitHub · {userName}</small>
            </span>
          </button>
          <button type="button" className="xp-startmenu__item" onClick={() => open('aim')}>
            <AimIcon size={30} />
            <span className="min-w-0">
              <b className="block">Instant Messenger</b>
              <small>Message me on AIM</small>
            </span>
          </button>
          <div className="xp-startmenu__sep" />
          {PINNED.map((id) => (
            <button key={id} type="button" className="xp-startmenu__item" onClick={() => open(id)}>
              <span className="flex shrink-0">{APPS[id].icon(28)}</span>
              <span className="truncate">{APPS[id].label}</span>
            </button>
          ))}
          <div className="min-h-[6px] flex-1" />
          <div className="xp-startmenu__sep" />
          <button
            type="button"
            className="xp-startmenu__item mb-1 justify-center py-1.5 font-bold"
            onClick={() => setProgramsOpen((v) => !v)}
            onPointerEnter={() => setProgramsOpen(true)}
          >
            All Programs
            <GreenArrowIcon size={18} />
          </button>
        </div>

        <div className="xp-startmenu__right" onPointerEnter={() => setProgramsOpen(false)}>
          {rightItem('resume', 'My Resume', true)}
          {rightItem('research', 'My Research', true)}
          {rightItem('projects', 'My Projects', true)}
          {rightItem('about', 'My Computer', true)}
          <div className="xp-startmenu__sep" />
          {rightItem('recycle', 'Recycle Bin')}
          {rightItem('terminal', 'Command Prompt')}
          {rightItem('notepad', 'Help and Support', false, <HelpIcon size={22} />)}
          <div className="xp-startmenu__sep" />
          {rightItem('guitar', 'Sounds & Guitar')}
        </div>
      </div>

      <div className="xp-startmenu__footer">
        <button
          type="button"
          className="xp-startmenu__footer-btn"
          onClick={() => {
            onClose();
            onLogOff();
          }}
        >
          <PowerIcon variant="logoff" size={22} />
          Log Off
        </button>
        <button
          type="button"
          className="xp-startmenu__footer-btn"
          onClick={() => {
            onClose();
            onShutdown();
          }}
        >
          <PowerIcon variant="off" size={22} />
          Turn Off Computer
        </button>
      </div>

      {programsOpen && (
        <div className="xp-programs-flyout" onPointerLeave={() => setProgramsOpen(false)}>
          {ALL_PROGRAMS.map((id) => (
            <button key={id} type="button" className="xp-startmenu__item" onClick={() => open(id)}>
              <span className="flex shrink-0">{APPS[id].icon(18)}</span>
              <span className="truncate">{APPS[id].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

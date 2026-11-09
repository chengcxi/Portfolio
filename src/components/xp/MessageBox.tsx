import React from 'react';

type BoxIcon = 'info' | 'warning' | 'question' | 'error';

const ICONS: Record<BoxIcon, React.ReactNode> = {
  info: (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#2B6FDB" stroke="#0E3E91" strokeWidth="1.5" />
      <circle cx="16" cy="9.5" r="2.2" fill="#fff" />
      <rect x="14" y="13.5" width="4" height="11" rx="1" fill="#fff" />
    </svg>
  ),
  question: (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#2B6FDB" stroke="#0E3E91" strokeWidth="1.5" />
      <text x="16" y="23" textAnchor="middle" fontSize="19" fontWeight="700" fill="#fff" fontFamily="Tahoma, Arial">
        ?
      </text>
    </svg>
  ),
  warning: (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <path d="M16 3 L30 28 H2 Z" fill="#FCD535" stroke="#8A6A00" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="14.3" y="11" width="3.4" height="9" rx="1" fill="#000" />
      <circle cx="16" cy="23.5" r="1.9" fill="#000" />
    </svg>
  ),
  error: (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#E0301E" stroke="#8E1205" strokeWidth="1.5" />
      <path d="M10.5 10.5 L21.5 21.5 M21.5 10.5 L10.5 21.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  ),
};

interface MessageBoxProps {
  title: string;
  icon?: BoxIcon;
  width?: number;
  children: React.ReactNode;
  buttons: { label: string; onClick: () => void; primary?: boolean }[];
  onClose?: () => void;
}

/** In-window modal styled like a Windows XP message box. */
export const MessageBox: React.FC<MessageBoxProps> = ({ title, icon = 'info', width = 310, children, buttons, onClose }) => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/10 p-1">
    <div className="xp-window is-focused" style={{ position: 'relative', width, maxWidth: '100vw' }}>
      <div className="xp-titlebar-bg" />
      <div className="xp-titlebar">
        <span className="xp-titlebar__title pl-1">{title}</span>
        {onClose && (
          <div className="xp-titlebar__buttons">
            <button type="button" aria-label="Close" className="xp-tbtn xp-tbtn--close" onClick={onClose} />
          </div>
        )}
      </div>
      <div className="xp-window-body p-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0">{ICONS[icon]}</div>
          <div className="flex-1 pt-1 text-[11px] leading-snug">{children}</div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              className={`xp-btn min-w-[75px] ${b.primary ? 'xp-btn-primary' : ''}`}
              onClick={b.onClick}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

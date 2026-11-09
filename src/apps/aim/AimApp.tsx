import React, { useState } from 'react';
import { aim, getAccount, useAim } from './aimStore';
import { AimIcon } from '../../components/XpIcons';
import { OWNER } from '../../config/portfolio';

export const AimBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`aim-banner flex shrink-0 items-center gap-2 ${compact ? 'px-2 py-1.5' : 'flex-col px-3 py-4'}`}>
    <AimIcon size={compact ? 30 : 64} />
    <div className={compact ? '' : 'text-center'}>
      <div
        className="font-black italic leading-none text-[#0b2a8a]"
        style={{ fontFamily: "'Arial Black', Tahoma, sans-serif", fontSize: compact ? 18 : 30 }}
      >
        AIM
      </div>
      <div className="text-[10px] text-[#3c4f77]">AOL Instant Messenger™</div>
    </div>
  </div>
);

export const OwnerInfoCard: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/15 p-2">
    <div className="w-full max-w-[270px] border border-[#0831d9] bg-[#ece9d8] shadow-lg">
      <div className="flex items-center justify-between bg-gradient-to-r from-[#0a246a] to-[#3a6fd8] px-2 py-1 text-[11px] font-bold text-white">
        <span>Buddy Info: {OWNER.handle}</span>
        <button type="button" aria-label="Close" onClick={onClose} className="px-1">
          ✕
        </button>
      </div>
      <div className="space-y-2 p-2.5 text-[11px]">
        <div className="flex items-center gap-2">
          <img src={OWNER.avatar} alt="" className="h-12 w-12 border border-[#7f9db9] object-cover" />
          <div>
            <div className="font-bold">{OWNER.handle}</div>
            <div className="text-[10px] text-[#2f7d32]">● Online</div>
            <div className="text-[10px] italic text-[#666]">Away msg: 🎸 practicing Schubert’s Serenade</div>
          </div>
        </div>
        <div className="xp-sunken xp-selectable space-y-1 p-1.5">
          <div>
            📧{' '}
            <a href={`mailto:${OWNER.email}`} className="text-[#0000cc] underline">
              {OWNER.email}
            </a>
          </div>
          <div>
            📱{' '}
            <a href={`tel:${OWNER.phoneE164}`} className="text-[#0000cc] underline">
              {OWNER.phoneDisplay}
            </a>{' '}
            ·{' '}
            <a href={`sms:${OWNER.phoneE164}`} className="text-[#0000cc] underline">
              text
            </a>
          </div>
          <div>
            🐙{' '}
            <a href={OWNER.github} target="_blank" rel="noreferrer" className="text-[#0000cc] underline">
              github.com/{OWNER.handle}
            </a>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" className="xp-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ErrorLine: React.FC<{ text: string | null }> = ({ text }) =>
  text ? (
    <div className="border border-[#d9a0a0] bg-[#fff0f0] px-2 py-1 text-[10.5px] leading-snug text-[#a40000]">{text}</div>
  ) : null;

const SignOn: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
  const s = useAim();
  const [name, setName] = useState(s.accounts[s.accounts.length - 1]?.screenName ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [help, setHelp] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AimBanner />
      <form
        className="flex flex-1 flex-col gap-1.5 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const r = aim.signIn(name, password);
          if (!r.ok) setError(r.error);
        }}
      >
        <label className="text-[11px] font-bold" htmlFor="aim-sn">
          ScreenName
        </label>
        <input
          id="aim-sn"
          list="aim-accounts"
          className="xp-input"
          value={name}
          autoComplete="username"
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
        />
        <datalist id="aim-accounts">
          {s.accounts.map((a) => (
            <option key={a.screenName} value={a.screenName} />
          ))}
        </datalist>
        <button type="button" className="aim-link self-start" onClick={onRegister}>
          Get a Screen Name
        </button>
        <label className="mt-1 text-[11px] font-bold" htmlFor="aim-pw">
          Password
        </label>
        <input
          id="aim-pw"
          type="password"
          className="xp-input"
          value={password}
          autoComplete="current-password"
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
        />
        <button type="button" className="aim-link self-start" onClick={() => setHelp(true)}>
          Forgot Password?
        </button>
        <ErrorLine text={error} />
        {help && (
          <div className="border border-[#c9b96b] bg-[#ffffe1] px-2 py-1 text-[10.5px] leading-snug">
            Screen names live only in this browser. New here or forgot yours? Click <b>Get a Screen Name</b> to leave
            your email &amp; phone for {OWNER.handle} and start chatting.
          </div>
        )}
        <div className="mt-auto flex items-end justify-between pt-3">
          <button type="button" className="xp-btn" onClick={() => setHelp((v) => !v)}>
            Help
          </button>
          <button type="submit" className="flex flex-col items-center gap-0.5 text-[11px] font-bold hover:brightness-110">
            <AimIcon size={34} />
            Sign On
          </button>
        </div>
        <div className="pt-2 text-center text-[10px] text-[#777]">Version 5.9 · Portfolio Edition</div>
      </form>
    </div>
  );
};

const Register: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [form, setForm] = useState({ screenName: '', password: '', confirm: '', email: '', phone: '', shareContact: true });
  const [error, setError] = useState<string | null>(null);

  const field = (key: 'screenName' | 'password' | 'confirm' | 'email' | 'phone', label: string, type = 'text', auto?: string) => (
    <label className="flex flex-col gap-0.5">
      <span className="font-bold">{label}</span>
      <input
        type={type}
        className="xp-input"
        value={form[key]}
        autoComplete={auto}
        onChange={(e) => {
          setForm((f) => ({ ...f, [key]: e.target.value }));
          setError(null);
        }}
      />
    </label>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AimBanner compact />
      <form
        className="flex flex-col gap-1.5 p-3 text-[11px]"
        onSubmit={(e) => {
          e.preventDefault();
          const r = aim.register(form);
          if (!r.ok) setError(r.error);
        }}
      >
        <div className="text-[12px] font-bold text-[#0b2a8a]">Get a Screen Name</div>
        <p className="text-[10.5px] leading-snug text-[#555]">
          Create an account to leave your contact info and message {OWNER.handle} directly.
        </p>
        {field('screenName', 'Screen Name *', 'text', 'username')}
        {field('password', 'Password *', 'password', 'new-password')}
        {field('confirm', 'Confirm Password *', 'password', 'new-password')}
        {field('email', 'Email *', 'email', 'email')}
        {field('phone', 'Phone (optional)', 'tel', 'tel')}
        <label className="mt-1 flex items-start gap-1.5">
          <input
            type="checkbox"
            checked={form.shareContact}
            onChange={(e) => setForm((f) => ({ ...f, shareContact: e.target.checked }))}
            className="mt-[1px] accent-[#0054e3]"
          />
          <span>Share my email &amp; phone with {OWNER.handle} so he can get back to me</span>
        </label>
        <ErrorLine text={error} />
        <div className="mt-1 flex justify-between">
          <button type="button" className="xp-btn" onClick={onBack}>
            « Back
          </button>
          <button type="submit" className="xp-btn xp-btn-primary">
            Register
          </button>
        </div>
        <p className="text-[9.5px] leading-snug text-[#777]">
          Your password is stored (hashed) only in this browser. Contact details are sent to {OWNER.handle} only when
          the box above is checked.
        </p>
      </form>
    </div>
  );
};

const BuddyList: React.FC<{ screenName: string; onOpenChat: () => void; onOpenResume: () => void }> = ({
  screenName,
  onOpenChat,
  onOpenResume,
}) => {
  const s = useAim();
  const account = getAccount(s, screenName);
  const [tab, setTab] = useState<'online' | 'setup'>('online');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState(false);
  const [info, setInfo] = useState(false);

  const group = (id: string, label: string, count: string, children: React.ReactNode) => (
    <div key={id}>
      <button
        type="button"
        className="flex w-full items-center gap-1 px-1 py-[1px] text-left font-bold text-[#0b2a8a]"
        onClick={() => setCollapsed((c) => ({ ...c, [id]: !c[id] }))}
      >
        <span className="w-2 text-[8px]">{collapsed[id] ? '▶' : '▼'}</span>
        {label} ({count})
      </button>
      {!collapsed[id] && <div className="pl-3">{children}</div>}
    </div>
  );

  const toolButton = (icon: string, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 rounded-[3px] border border-transparent px-2 py-0.5 text-[10px] hover:border-[#c5c2b2] hover:bg-white/60"
    >
      <span className="text-[16px] leading-none">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="aim-banner flex shrink-0 items-center gap-2 px-2 py-1.5">
        <AimIcon size={30} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-bold text-[#0b2a8a]">{screenName}</div>
          <div className="text-[10px] text-[#2f7d32]">● Available</div>
        </div>
      </div>
      <button type="button" className="aim-ad shrink-0" onClick={onOpenResume}>
        🎸 HIRING? View {OWNER.handle}’s Resume.pdf »
      </button>
      <div className="flex shrink-0 gap-0.5 px-1 text-[11px]">
        {(['online', 'setup'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t-[3px] border border-b-0 px-2 py-0.5 ${
              tab === t ? 'border-[#919b9c] bg-white font-bold' : 'border-[#c5c2b2] bg-[#e3dfd1]'
            }`}
          >
            {t === 'online' ? 'Online' : 'My Info'}
          </button>
        ))}
      </div>
      <div className="xp-sunken mx-1 min-h-0 flex-1 overflow-y-auto p-1 text-[11px]">
        {tab === 'online' ? (
          <>
            {group(
              'buddies',
              'Buddies',
              '1/1',
              <button
                type="button"
                className={`flex w-full items-center gap-1.5 px-1 py-[2px] text-left ${
                  selected ? 'bg-[#316ac5] text-white' : 'hover:bg-[#e8eefb]'
                }`}
                onClick={() => {
                  setSelected(true);
                  if (window.innerWidth < 768) onOpenChat();
                }}
                onDoubleClick={onOpenChat}
              >
                <AimIcon size={14} />
                <span className="font-bold">{OWNER.handle}</span>
                <span className={`ml-auto text-[9px] ${selected ? 'text-white' : 'text-[#2f7d32]'}`}>online</span>
              </button>
            )}
            {group('recruiters', 'Recruiters', '0/0', <div className="px-1 text-[10px] italic text-[#888]">(empty)</div>)}
            {group(
              'offline',
              'Offline',
              '0/1',
              <div className="flex items-center gap-1.5 px-1 py-[2px] text-[#999]">
                <span className="opacity-40">
                  <AimIcon size={14} />
                </span>
                SmarterChild
              </div>
            )}
            <p className="mt-2 px-1 text-[10px] leading-snug text-[#666]">
              Double-click <b>{OWNER.handle}</b> (or press IM) to send an instant message.
            </p>
          </>
        ) : (
          <div className="space-y-1.5 p-1 text-[10.5px] leading-snug">
            <div className="font-bold text-[#0b2a8a]">Your contact card</div>
            <div>
              Screen name: <b>{account?.screenName}</b>
            </div>
            <div>Email: {account?.email}</div>
            <div>Phone: {account?.phone || '—'}</div>
            <div>
              Shared with {OWNER.handle}: <b>{account?.shareContact ? 'Yes' : 'No'}</b>
            </div>
            {account && <div className="pt-1 text-[#666]">Member since {new Date(account.createdAt).toLocaleDateString()}</div>}
          </div>
        )}
      </div>
      {s.notice && (
        <div className="mx-1 mt-1 flex shrink-0 items-start gap-1 border border-[#c9b96b] bg-[#ffffe1] px-1.5 py-1 text-[10px] leading-snug">
          <span className="flex-1">{s.notice}</span>
          <button type="button" aria-label="Dismiss" onClick={aim.dismissNotice} className="text-[#666]">
            ✕
          </button>
        </div>
      )}
      <div className="flex shrink-0 items-center justify-around px-1 py-1.5">
        {toolButton('💬', 'IM', onOpenChat)}
        {toolButton('ℹ️', 'Info', () => setInfo(true))}
        {toolButton('🚪', 'Sign Off', aim.signOff)}
      </div>
      {info && <OwnerInfoCard onClose={() => setInfo(false)} />}
    </div>
  );
};

export const AimApp: React.FC<{ onOpenChat: () => void; onOpenResume: () => void }> = ({ onOpenChat, onOpenResume }) => {
  const s = useAim();
  const account = getAccount(s, s.currentUser);
  const [view, setView] = useState<'signon' | 'register'>('signon');

  if (account) return <BuddyList screenName={account.screenName} onOpenChat={onOpenChat} onOpenResume={onOpenResume} />;
  return view === 'register' ? (
    <Register onBack={() => setView('signon')} />
  ) : (
    <SignOn onRegister={() => setView('register')} />
  );
};

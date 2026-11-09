import React, { useEffect, useRef, useState } from 'react';
import { aim, getAccount, keyOf, useAim, type AimFormat, type AimMessage } from './aimStore';
import { OwnerInfoCard } from './AimApp';
import { AimIcon } from '../../components/XpIcons';
import { OWNER } from '../../config/portfolio';
import { buildMailto, buildSms } from '../../utils/messageRelay';

const EMOTICONS = ['🙂', '😉', '😀', '😎', '😮', '😛', '😢', '😍', '👍', '🎸', '🎵', '💼'];

const STATUS_COLOR: Record<NonNullable<AimMessage['status']>, string> = {
  sending: 'text-[#777]',
  delivered: 'text-[#2f7d32]',
  pending: 'text-[#9a6a00]',
  failed: 'text-[#b00020]',
};

const statusLabel = (m: AimMessage) =>
  m.status === 'sending'
    ? 'Sending…'
    : m.status === 'delivered'
      ? `✓ ${m.detail ?? 'Delivered'}`
      : m.status === 'pending'
        ? `⏳ ${m.detail ?? 'Pending'}`
        : `⚠ ${m.detail ?? 'Not delivered'}`;

const fmtStyle = (f?: AimFormat): React.CSSProperties => ({
  fontWeight: f?.b ? 700 : undefined,
  fontStyle: f?.i ? 'italic' : undefined,
  textDecoration: f?.u ? 'underline' : undefined,
});

export const AimChat: React.FC<{ onOpenAim: () => void }> = ({ onOpenAim }) => {
  const s = useAim();
  const account = getAccount(s, s.currentUser);
  const [draft, setDraft] = useState('');
  const [fmt, setFmt] = useState<AimFormat>({});
  const [showSmileys, setShowSmileys] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const messages: AimMessage[] = account ? s.conversations[keyOf(account.screenName)] ?? [] : [];
  const last = messages[messages.length - 1];

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, last?.status]);

  if (!account) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-[11px]">
        <AimIcon size={52} />
        <div className="max-w-[300px] leading-snug">
          Sign on to AIM (or grab a free screen name) to send {OWNER.handle} an instant message — your note lands in
          his inbox.
        </div>
        <button type="button" className="xp-btn xp-btn-primary" onClick={onOpenAim}>
          Open AIM Sign On
        </button>
        <div className="text-[10px] text-[#666]">
          Or reach him directly:{' '}
          <a className="text-[#0000cc] underline" href={`mailto:${OWNER.email}`}>
            {OWNER.email}
          </a>{' '}
          ·{' '}
          <a className="text-[#0000cc] underline" href={`sms:${OWNER.phoneE164}`}>
            {OWNER.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  const transcript = messages
    .filter((m) => m.from !== 'system')
    .map((m) => `${m.from === 'me' ? account.screenName : OWNER.handle} (${new Date(m.at).toLocaleTimeString()}): ${m.text}`)
    .join('\n');
  const lastMine = [...messages].reverse().find((m) => m.from === 'me')?.text ?? '';
  const mailHref = buildMailto(
    `AIM message from ${account.screenName}`,
    `${transcript || draft || `Hi ${OWNER.handle}!`}\n\n— ${account.screenName}\nEmail: ${account.email}\nPhone: ${account.phone || 'n/a'}`
  );
  const smsHref = buildSms(
    `Hi ${OWNER.handle}! It's ${account.screenName} (${account.email}) from your portfolio. ${draft || lastMine}`
  );

  const send = () => {
    if (!draft.trim()) return;
    aim.send(draft, fmt);
    setDraft('');
    setShowSmileys(false);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-1.5 p-1.5">
      <div className="flex items-center gap-2 px-0.5 text-[11px]">
        <span>To:</span>
        <b className="text-[#0000cc]">{OWNER.handle}</b>
        <span className="text-[10px] text-[#2f7d32]">● Online</span>
        <span className="ml-auto text-[10px] text-[#666]">Warning level: 0%</span>
      </div>

      <div className="flex min-h-0 flex-1 gap-1.5">
        <div ref={logRef} className="xp-sunken xp-selectable min-w-0 flex-1 overflow-y-auto p-2 text-[12px] leading-snug">
          {messages.length === 0 && (
            <div className="text-[11px] italic text-[#888]">
              Say hi to {OWNER.handle}! Messages are delivered straight to his inbox.
            </div>
          )}
          {messages.map((m) =>
            m.from === 'system' ? (
              <div key={m.id} className="my-1 text-[10.5px] italic text-[#777]">
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="my-0.5 break-words">
                <span className="font-bold" style={{ color: m.from === 'me' ? '#ff0000' : '#0000ff' }}>
                  {m.from === 'me' ? account.screenName : OWNER.handle}
                </span>
                <span className="text-[10px] text-[#888]">
                  {' '}
                  ({new Date(m.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })})
                </span>
                <span>: </span>
                <span style={fmtStyle(m.fmt)}>{m.text}</span>
                {m.from === 'me' && m.status && (
                  <div className={`ml-3 text-[10px] ${STATUS_COLOR[m.status]}`}>{statusLabel(m)}</div>
                )}
              </div>
            )
          )}
        </div>
        <div className="hidden w-[64px] shrink-0 flex-col items-center gap-1 sm:flex">
          <img src={OWNER.avatar} alt="" className="h-[56px] w-[56px] border border-[#7f9db9] bg-white object-cover" />
          <span className="text-[10px]">{OWNER.handle}</span>
        </div>
      </div>

      <div className="relative flex items-center gap-0.5 rounded-[2px] border border-[#c5c2b2] bg-[#f6f5ef] px-1 py-0.5">
        {(['b', 'i', 'u'] as const).map((k) => (
          <button
            key={k}
            type="button"
            title={k === 'b' ? 'Bold' : k === 'i' ? 'Italic' : 'Underline'}
            onClick={() => setFmt((f) => ({ ...f, [k]: !f[k] }))}
            className={`h-[20px] w-[22px] border text-[12px] ${
              fmt[k] ? 'border-[#316ac5] bg-[#c8d9f6]' : 'border-transparent hover:border-[#c5c2b2]'
            }`}
            style={{
              fontWeight: k === 'b' ? 700 : 400,
              fontStyle: k === 'i' ? 'italic' : 'normal',
              textDecoration: k === 'u' ? 'underline' : 'none',
            }}
          >
            {k.toUpperCase()}
          </button>
        ))}
        <span className="mx-1 h-[16px] w-px bg-[#c5c2b2]" />
        <button
          type="button"
          className="h-[20px] border border-transparent px-1 hover:border-[#c5c2b2]"
          onClick={() => setShowSmileys((v) => !v)}
        >
          🙂 ▾
        </button>
        {showSmileys && (
          <div className="absolute bottom-[26px] left-14 z-10 grid grid-cols-6 gap-0.5 border border-[#7f9db9] bg-white p-1 shadow">
            {EMOTICONS.map((e) => (
              <button
                key={e}
                type="button"
                className="h-[22px] w-[22px] hover:bg-[#e8eefb]"
                onClick={() => {
                  setDraft((d) => d + e);
                  setShowSmileys(false);
                }}
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <span className="ml-auto hidden text-[10px] text-[#777] sm:inline">Enter = send · Shift+Enter = new line</span>
      </div>

      <div className="flex h-[66px] shrink-0 gap-1.5">
        <textarea
          value={draft}
          maxLength={2000}
          placeholder={`Message ${OWNER.handle}…`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="xp-input min-w-0 flex-1 resize-none text-[12px]"
          style={fmtStyle(fmt)}
        />
        <div className="hidden w-[64px] shrink-0 flex-col items-center sm:flex">
          <AimIcon size={40} />
          <span className="w-full truncate text-center text-[10px]">{account.screenName}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <a className="xp-btn" href={mailHref}>
          📧 Email
        </a>
        <a className="xp-btn" href={smsHref}>
          💬 Text
        </a>
        <button type="button" className="xp-btn" onClick={() => setShowInfo(true)}>
          Get Info
        </button>
        <div className="flex-1" />
        <button
          type="button"
          className="xp-btn xp-btn-primary min-w-[80px] font-bold"
          onClick={send}
          disabled={!draft.trim()}
        >
          <AimIcon size={16} />
          Send
        </button>
      </div>

      {showInfo && <OwnerInfoCard onClose={() => setShowInfo(false)} />}
    </div>
  );
};

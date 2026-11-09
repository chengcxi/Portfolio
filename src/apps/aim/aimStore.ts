import { useSyncExternalStore } from 'react';
import { OWNER } from '../../config/portfolio';
import { relayToOwner, type RelayStatus } from '../../utils/messageRelay';
import { loadJSON, saveJSON } from '../../utils/storage';
import { sfx } from '../../utils/sfx';

export interface AimAccount {
  screenName: string;
  email: string;
  phone: string;
  passwordHash: string;
  shareContact: boolean;
  createdAt: number;
}

export interface AimFormat {
  b?: boolean;
  i?: boolean;
  u?: boolean;
}

export interface AimMessage {
  id: string;
  from: 'me' | 'owner' | 'system';
  text: string;
  at: number;
  status?: 'sending' | RelayStatus;
  detail?: string;
  fmt?: AimFormat;
}

export interface AimState {
  accounts: AimAccount[];
  currentUser: string | null;
  conversations: Record<string, AimMessage[]>;
  notice: string | null;
}

const KEY = 'xp-aim-v1';

function loadState(): AimState {
  const saved = loadJSON<Partial<AimState>>(KEY, {});
  const conversations: Record<string, AimMessage[]> = {};
  if (saved.conversations && typeof saved.conversations === 'object') {
    for (const [k, list] of Object.entries(saved.conversations)) {
      conversations[k] = (Array.isArray(list) ? list : []).map((m) =>
        m.status === 'sending'
          ? { ...m, status: 'failed' as const, detail: 'Sending was interrupted — use Email or Text instead.' }
          : m
      );
    }
  }
  return {
    accounts: Array.isArray(saved.accounts) ? saved.accounts : [],
    currentUser: typeof saved.currentUser === 'string' ? saved.currentUser : null,
    conversations,
    notice: null,
  };
}

let state: AimState = loadState();
const listeners = new Set<() => void>();
const autoReplied = new Set<string>();

function commit(next: AimState) {
  state = next;
  saveJSON(KEY, { accounts: state.accounts, currentUser: state.currentUser, conversations: state.conversations });
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useAim = () => useSyncExternalStore(subscribe, () => state, () => state);

export const keyOf = (name: string) => name.trim().toLowerCase();

export const getAccount = (s: AimState, name: string | null) =>
  name ? s.accounts.find((a) => keyOf(a.screenName) === keyOf(name)) ?? null : null;

/** FNV-1a — accounts only live in this browser, this just avoids storing plain text. */
function hashPassword(pw: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < pw.length; i++) {
    h ^= pw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function pushMessage(screenName: string, msg: AimMessage) {
  const k = keyOf(screenName);
  commit({ ...state, conversations: { ...state.conversations, [k]: [...(state.conversations[k] ?? []), msg] } });
}

function patchMessage(screenName: string, id: string, patch: Partial<AimMessage>) {
  const k = keyOf(screenName);
  commit({
    ...state,
    conversations: {
      ...state.conversations,
      [k]: (state.conversations[k] ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m)),
    },
  });
}

const setNotice = (notice: string | null) => commit({ ...state, notice });

const RESERVED = ['chengcxi', 'smarterchild', 'admin', 'aim', 'aol'];

export interface RegisterInput {
  screenName: string;
  password: string;
  confirm: string;
  email: string;
  phone: string;
  shareContact: boolean;
}

type Result = { ok: true } | { ok: false; error: string };

export const aim = {
  register(input: RegisterInput): Result {
    const screenName = input.screenName.trim().replace(/\s+/g, ' ');
    const email = input.email.trim();
    const phone = input.phone.trim();
    if (!/^[A-Za-z][A-Za-z0-9 ]{2,15}$/.test(screenName)) {
      return { ok: false, error: 'Screen names are 3–16 letters, numbers or spaces and must start with a letter.' };
    }
    if (RESERVED.includes(keyOf(screenName).replace(/\s/g, ''))) {
      return { ok: false, error: 'That screen name is reserved. Please choose another.' };
    }
    if (getAccount(state, screenName)) {
      return { ok: false, error: 'That screen name is already registered on this computer — try signing on.' };
    }
    if (input.password.length < 4) return { ok: false, error: 'Passwords must be at least 4 characters.' };
    if (input.password !== input.confirm) return { ok: false, error: 'Passwords do not match.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return { ok: false, error: `Please enter a valid email address so ${OWNER.handle} can reply.` };
    }
    const digits = phone.replace(/\D/g, '');
    if (phone && (digits.length < 7 || digits.length > 15)) {
      return { ok: false, error: 'Please enter a valid phone number (or leave it blank).' };
    }

    const account: AimAccount = {
      screenName,
      email,
      phone,
      passwordHash: hashPassword(input.password),
      shareContact: input.shareContact,
      createdAt: Date.now(),
    };
    commit({
      ...state,
      accounts: [...state.accounts, account],
      currentUser: screenName,
      notice: input.shareContact ? `Sharing your contact info with ${OWNER.handle}…` : null,
    });
    sfx.doorOpen();
    pushMessage(screenName, {
      id: uid(),
      from: 'system',
      text: `Welcome to AIM, ${screenName}! Double-click “${OWNER.handle}” in your Buddy List to send an instant message.`,
      at: Date.now(),
    });

    if (input.shareContact) {
      relayToOwner({
        kind: 'new-account',
        screenName,
        email,
        phone,
        message: `${screenName} registered an AIM screen name on your portfolio and shared their contact info.`,
      }).then((r) => {
        setNotice(
          r.status === 'delivered'
            ? `✓ ${OWNER.handle} received your contact info.`
            : r.status === 'pending'
              ? `Your contact info is queued for ${OWNER.handle}'s inbox (relay activation pending).`
              : `Couldn't reach ${OWNER.handle}'s inbox automatically — send an IM or use Email/Text.`
        );
      });
    }
    return { ok: true };
  },

  signIn(name: string, password: string): Result {
    const account = getAccount(state, name);
    if (!account) {
      return { ok: false, error: 'Screen name not found on this computer. Click “Get a Screen Name” to register.' };
    }
    if (account.passwordHash !== hashPassword(password)) return { ok: false, error: 'Incorrect password.' };
    commit({ ...state, currentUser: account.screenName, notice: null });
    sfx.doorOpen();
    return { ok: true };
  },

  signOff() {
    commit({ ...state, currentUser: null, notice: null });
    sfx.doorClose();
  },

  dismissNotice() {
    setNotice(null);
  },

  async send(text: string, fmt?: AimFormat) {
    const account = getAccount(state, state.currentUser);
    const body = text.trim();
    if (!account || !body) return;
    const id = uid();
    pushMessage(account.screenName, { id, from: 'me', text: body, at: Date.now(), status: 'sending', fmt });
    sfx.imSend();

    const transcript = (state.conversations[keyOf(account.screenName)] ?? [])
      .filter((m) => m.from !== 'system')
      .map((m) => `${m.from === 'me' ? account.screenName : OWNER.handle} (${new Date(m.at).toLocaleString()}): ${m.text}`)
      .join('\n');

    const result = await relayToOwner({
      kind: 'message',
      screenName: account.screenName,
      email: account.email,
      phone: account.phone,
      message: body,
      transcript,
    });
    patchMessage(account.screenName, id, { status: result.status, detail: result.detail });

    const k = keyOf(account.screenName);
    if (autoReplied.has(k)) return;
    autoReplied.add(k);
    window.setTimeout(() => {
      const contact = [account.email, account.phone].filter(Boolean).join(' or ');
      const reply =
        result.status === 'delivered'
          ? `Thanks for the message, ${account.screenName}! 🎸 I'm away from my desk, but it's already in my inbox — I'll reply at ${contact}.`
          : `Thanks, ${account.screenName}! I'm away from my desk. If this doesn't reach my inbox automatically, hit “Email” or “Text” below so I get it right away (${OWNER.email} · ${OWNER.phoneDisplay}).`;
      pushMessage(account.screenName, {
        id: uid(),
        from: 'owner',
        text: `Auto response from ${OWNER.handle}: ${reply}`,
        at: Date.now(),
      });
      sfx.imReceive();
    }, 1300);
  },
};

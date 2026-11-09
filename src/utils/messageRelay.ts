import { MESSAGE_RELAY, OWNER } from '../config/portfolio';

export type RelayStatus = 'delivered' | 'pending' | 'failed';
export interface RelayResult {
  status: RelayStatus;
  detail: string;
}

interface RelayInput {
  kind: 'new-account' | 'message';
  screenName: string;
  email: string;
  phone?: string;
  message: string;
  transcript?: string;
}

/** Forwards AIM activity to the owner's inbox via FormSubmit's AJAX endpoint. */
export async function relayToOwner(input: RelayInput): Promise<RelayResult> {
  if (!MESSAGE_RELAY.enabled) {
    return { status: 'failed', detail: 'Automatic delivery is turned off — use Email or Text.' };
  }

  const subject =
    input.kind === 'new-account'
      ? `New AIM screen name on your portfolio: ${input.screenName}`
      : `AIM message from ${input.screenName}`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(MESSAGE_RELAY.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _honey: '',
        _replyto: input.email,
        Type: input.kind === 'new-account' ? 'New AIM account (contact info shared)' : 'Instant message',
        'Screen Name': input.screenName,
        Email: input.email,
        Phone: input.phone || '(not provided)',
        Message: input.message,
        Transcript: input.transcript || '—',
        Page: window.location.href,
      }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    const ok = res.ok && (data.success === true || data.success === 'true');
    if (ok) return { status: 'delivered', detail: `Delivered to ${OWNER.handle}'s inbox.` };

    const msg = data.message || `HTTP ${res.status}`;
    if (/activat/i.test(msg)) {
      return {
        status: 'pending',
        detail: `Queued — ${OWNER.handle}'s inbox relay is awaiting one-time activation. Use Email or Text to reach him right now.`,
      };
    }
    return { status: 'failed', detail: `${msg} — use Email or Text instead.` };
  } catch {
    return { status: 'failed', detail: 'Network error — use the Email or Text buttons instead.' };
  } finally {
    window.clearTimeout(timer);
  }
}

export function buildMailto(subject: string, body: string): string {
  return `mailto:${OWNER.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body.slice(0, 1800)
  )}`;
}

/** `?&body=` works for both iOS and Android messaging apps. */
export function buildSms(body: string): string {
  return `sms:${OWNER.phoneE164}?&body=${encodeURIComponent(body.slice(0, 600))}`;
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  chengcxi Windows XP Portfolio — central configuration
 * ─────────────────────────────────────────────────────────────────────────
 *  • Contact info used by AOL Instant Messenger (email relay, Email & Text buttons)
 *  • Resume / research PDFs shown in the "Adobe Reader" windows
 *
 *  HOW TO UPDATE YOUR PDFs
 *  1. Drop your file into  public/files/  (e.g. public/files/Resume.pdf) and redeploy.
 *  2. Want several versions visitors can switch between? Add entries to `versions`
 *     below, e.g. { id: 'swe', label: 'Resume — SWE (2026)', url: 'files/Resume-SWE.pdf' }.
 *     The first entry is the default.
 *  3. Anyone can also preview a local PDF via File ▸ Open (stored only in their browser).
 */

export const OWNER = {
  handle: 'chengcxi',
  email: 'cxi777555@gmail.com',
  phone: '6266186608',
  phoneDisplay: '(626) 618-6608',
  phoneE164: '+16266186608',
  github: 'https://github.com/chengcxi',
  avatar: 'https://avatars.githubusercontent.com/u/143553765?v=4',
} as const;

/**
 * AIM messages & new-account notifications are forwarded to OWNER.email through
 * FormSubmit (https://formsubmit.co) — no backend required.
 * The very first submission triggers a one-time "Activate Form" email to the inbox;
 * click it once and every later message is delivered automatically.
 * (Optional) after activation FormSubmit gives you a random alias — paste it here
 * instead of the email to hide the address from the page source.
 */
export const MESSAGE_RELAY = {
  enabled: true,
  endpoint: `https://formsubmit.co/ajax/${OWNER.email}`,
};

export type DocumentId = 'resume' | 'research';

export interface DocumentVersion {
  id: string;
  label: string;
  /** Path relative to the site root (files in /public are served from the root). */
  url: string;
}

export interface PortfolioDocument {
  id: DocumentId;
  fileName: string;
  title: string;
  publicPath: string;
  versions: DocumentVersion[];
}

export const DOCUMENTS: Record<DocumentId, PortfolioDocument> = {
  resume: {
    id: 'resume',
    fileName: 'Cheng_Resume.pdf',
    title: 'Cheng_Resume',
    publicPath: 'public/files/Cheng_Resume.pdf',
    versions: [{ id: 'published', label: 'Cheng_Resume.pdf (published)', url: 'files/Cheng_Resume.pdf' }],
  },
  research: {
    id: 'research',
    fileName: 'arxiv_l4s.pdf',
    title: 'L4S_arXiv',
    publicPath: 'public/files/arxiv_l4s.pdf',
    versions: [{ id: 'published', label: 'arxiv_l4s.pdf (published)', url: 'files/arxiv_l4s.pdf' }],
  },
};

/** Resolve a public asset path so it works on GitHub Pages user *and* project sites. */
export function resolvePublicUrl(path: string): string {
  try {
    return new URL(path, document.baseURI).href;
  } catch {
    return path;
  }
}

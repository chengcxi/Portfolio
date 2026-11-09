import { XP_SOUNDS, type XpSoundName } from '../assets/xpSounds';
import { guitarAudio } from './guitarAudio';

/**
 * Plays the Windows XP startup and logoff sounds.
 *
 * Browsers only allow sound after the visitor has interacted with the page. If a sound is blocked,
 * it is kept and played on the visitor's next click or key press, so it is not lost.
 * The volume follows the master volume slider in the taskbar speaker flyout.
 */

const cache = new Map<XpSoundName, HTMLAudioElement>();
let waiting: XpSoundName | null = null;
let listening = false;

function audioFor(name: XpSoundName): HTMLAudioElement {
  let audio = cache.get(name);
  if (!audio) {
    audio = new Audio(XP_SOUNDS[name]);
    audio.preload = 'auto';
    cache.set(name, audio);
  }
  return audio;
}

function playWhenAllowed(name: XpSoundName) {
  waiting = name;
  if (listening) return;
  listening = true;
  const retry = () => {
    window.removeEventListener('pointerdown', retry, true);
    window.removeEventListener('keydown', retry, true);
    listening = false;
    const next = waiting;
    waiting = null;
    if (next) playXpSound(next);
  };
  window.addEventListener('pointerdown', retry, true);
  window.addEventListener('keydown', retry, true);
}

export function playXpSound(name: XpSoundName): void {
  const level = Math.min(1, Math.max(0, guitarAudio.volume));
  if (level <= 0) return;
  const audio = audioFor(name);
  audio.volume = level;
  audio.currentTime = 0;
  const result = audio.play();
  if (result) {
    result.catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'NotAllowedError') playWhenAllowed(name);
    });
  }
}

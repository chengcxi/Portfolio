import React, { useEffect, useRef, useState } from 'react';
import { GitHubProfile, GitHubRepo } from '../../data/githubData';
import { guitarAudio } from '../../utils/guitarAudio';
import { OWNER } from '../../config/portfolio';

interface TerminalAppProps {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  onOpenApp: (id: string) => void;
}

interface LogLine {
  id: number;
  text: string;
  tone?: 'normal' | 'accent' | 'muted' | 'success';
}

const ALIASES: Record<string, string> = {
  projects: 'projects',
  repos: 'projects',
  resume: 'resume',
  'resume.pdf': 'resume',
  research: 'research',
  'research.pdf': 'research',
  aim: 'aim',
  messenger: 'aim',
  im: 'aim',
  guitar: 'guitar',
  rustyguitar: 'guitar',
  minesweeper: 'minesweeper',
  winmine: 'minesweeper',
  solitaire: 'solitaire',
  sol: 'solitaire',
  paint: 'paint',
  mspaint: 'paint',
  notepad: 'notepad',
  readme: 'notepad',
  about: 'about',
  computer: 'about',
  recycle: 'recycle',
  bin: 'recycle',
};

let lineId = 0;
const nextId = () => ++lineId;

export const TerminalApp: React.FC<TerminalAppProps> = ({ profile, repos, onOpenApp }) => {
  const [lines, setLines] = useState<LogLine[]>(() => [
    { id: nextId(), text: 'Microsoft Windows XP [Version 5.1.2600]', tone: 'muted' },
    { id: nextId(), text: `(C) Copyright 1985-2001 Microsoft Corp. · ${OWNER.handle} Portfolio Shell`, tone: 'muted' },
    { id: nextId(), text: 'Type "help" for commands — try "open minesweeper", "contact" or "serenade".', tone: 'accent' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const append = (entries: Omit<LogLine, 'id'>[]) =>
    setLines((prev) => [...prev, ...entries.map((e) => ({ ...e, id: nextId() }))]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setHistory((h) => [...h, cmd]);
    setHistoryIndex(-1);
    append([{ text: `C:\\Users\\${profile.login}> ${cmd}` }]);
    const lower = cmd.toLowerCase();

    if (lower === 'cls' || lower === 'clear') {
      setLines([]);
      return;
    }
    if (lower === 'help' || lower === '?') {
      append([
        { text: 'Available commands:', tone: 'accent' },
        { text: '  whoami            Display GitHub profile info' },
        { text: `  ls / dir          List all ${repos.length} public GitHub repositories` },
        { text: '  open <app>        projects, resume, research, aim, guitar, minesweeper,' },
        { text: '                    solitaire, paint, notepad, about, recycle' },
        { text: '  contact           Show how to reach chengcxi' },
        { text: '  pluck             Pluck a random classical guitar string' },
        { text: '  serenade          Strum a D-major chord (Schubert Serenade)' },
        { text: '  neofetch          XP + GitHub system summary' },
        { text: '  cls / clear       Clear the screen' },
      ]);
      return;
    }
    if (lower === 'whoami') {
      append([
        { text: `User     : @${profile.login}`, tone: 'success' },
        { text: `Location : ${profile.location}` },
        { text: `GitHub   : ${profile.html_url}` },
        { text: `Bio      : ${profile.bio}` },
      ]);
      return;
    }
    if (lower === 'ls' || lower === 'dir') {
      append([
        { text: ` Directory of C:\\Users\\${profile.login}\\GitHub`, tone: 'accent' },
        ...repos.map((r) => ({ text: `  ${r.name.padEnd(32, ' ')} [${r.language || 'Misc'}]` })),
        { text: `        ${repos.length} Dir(s)`, tone: 'muted' },
      ]);
      return;
    }
    if (lower === 'contact') {
      append([
        { text: `Email : ${OWNER.email}`, tone: 'success' },
        { text: `Phone : ${OWNER.phoneDisplay}`, tone: 'success' },
        { text: `AIM   : type "open aim", get a screen name and IM ${OWNER.handle}` },
      ]);
      return;
    }
    if (lower === 'pluck') {
      guitarAudio.pluckRandom('click');
      append([{ text: '♪ Plucked a nylon classical guitar string!', tone: 'success' }]);
      return;
    }
    if (lower === 'serenade') {
      guitarAudio.strumChord([
        { note: 'D3', freq: 146.83, stringNumber: 4 },
        { note: 'A3', freq: 220.0, stringNumber: 3 },
        { note: 'D4', freq: 293.66, stringNumber: 2 },
        { note: 'F#4', freq: 369.99, stringNumber: 1 },
      ]);
      append([{ text: "♪ Strumming Schubert's Serenade D-major chord...", tone: 'success' }]);
      return;
    }
    if (lower === 'neofetch') {
      append([
        { text: `  ${profile.login}@windows-xp`, tone: 'accent' },
        { text: '  ----------------------' },
        { text: '  OS       : Windows XP Professional (Luna Blue)' },
        { text: `  GitHub   : github.com/${profile.login} (${repos.length} repos)` },
        { text: '  Audio    : Karplus-Strong classical nylon synth' },
        { text: '  Apps     : Minesweeper, Solitaire, Paint, AIM, Adobe Reader' },
      ]);
      return;
    }
    const match = lower.match(/^(open|start|run)\s+(.+)$/) ?? lower.match(/^(\S+)$/);
    const target = match ? (match[2] ?? match[1]).trim() : '';
    const id = ALIASES[target];
    if (id) {
      onOpenApp(id);
      append([{ text: `Starting ${target}...`, tone: 'success' }]);
      return;
    }
    append([{ text: `'${cmd}' is not recognized as an internal or external command. Type "help".`, tone: 'muted' }]);
  };

  return (
    <div
      className="flex flex-1 cursor-text flex-col overflow-y-auto bg-[#0c0c0c] p-3 font-mono text-[12px] text-[#e5e5e5]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="xp-selectable flex-1 space-y-1">
        {lines.map((line) => (
          <pre
            key={line.id}
            className={`whitespace-pre-wrap font-mono text-[12px] leading-snug ${
              line.tone === 'accent'
                ? 'text-[#60a5fa]'
                : line.tone === 'success'
                  ? 'text-[#4ade80]'
                  : line.tone === 'muted'
                    ? 'text-[#a1a1aa]'
                    : 'text-[#f4f4f5]'
            }`}
          >
            {line.text}
          </pre>
        ))}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="shrink-0 text-[#4ade80]">C:\Users\{profile.login}&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            autoFocus
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                run(input);
                setInput('');
              } else if (e.key === 'ArrowUp' && history.length) {
                e.preventDefault();
                const idx = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(idx);
                setInput(history[idx]);
              } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
                e.preventDefault();
                const idx = historyIndex + 1;
                if (idx >= history.length) {
                  setHistoryIndex(-1);
                  setInput('');
                } else {
                  setHistoryIndex(idx);
                  setInput(history[idx]);
                }
              }
            }}
            className="flex-1 bg-transparent font-mono text-[12px] text-[#f4f4f5] caret-[#4ade80] outline-none"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

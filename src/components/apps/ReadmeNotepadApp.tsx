import React, { useMemo, useRef, useState } from 'react';
import { GitHubProfile, GitHubRepo } from '../../data/githubData';
import { MenuBar, type MenuDef } from '../xp/MenuBar';
import { OWNER } from '../../config/portfolio';

interface ReadmeNotepadAppProps {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  onClose: () => void;
}

export const ReadmeNotepadApp: React.FC<ReadmeNotepadAppProps> = ({ profile, repos, onClose }) => {
  const initialText = useMemo(
    () => `================================================================
  ${profile.login} · GitHub Portfolio (Windows XP Edition)
  ${profile.html_url}
================================================================

Welcome! This whole site is a working Windows XP desktop.

WHAT'S ON THE DESKTOP
---------------------
  My Computer ............. profile, languages & highlights
  My Projects ............. all ${repos.length} public GitHub repositories
  Resume.pdf .............. my resume (Adobe Reader-style viewer)
  research.pdf ............ research overview
  AOL Instant Messenger ... get a screen name & message me
  Rusty Guitar ............ classical guitar soundbox
  Minesweeper · Solitaire · Paint ... the classics, fully playable
  Command Prompt .......... type "help"
  Recycle Bin ............. drag icons in, restore them later

INTERACTIVE EASTER EGGS
-----------------------
* Click or scroll anywhere to pluck a random classical nylon
  guitar string (Karplus-Strong synthesis, live in your browser).
* Drag icons around the desktop, or rubber-band select several.
* Drop an icon on the Recycle Bin to delete it; open the bin and
  drag it back onto the desktop (or press Restore) to recover it.
* Start > Turn Off Computer for the full XP experience.

HIGHLIGHTED PROJECTS
--------------------
1. rustyguitar (Rust) - classical guitar tutor featuring
   Schubert's Serenade, built with egui/eframe
2. UCSBxGoogleQC-micro-blossom - hardware-accelerated MWPM
   decoder for quantum error correction
3. panamera (Python) - voice-based AI assistant
4. droneCV (C++ / OpenCV) - computer vision for drones
5. BitcoinAlphaGNN (Jupyter) - GNN trust analysis

CONTACT
-------
Email : ${OWNER.email}
Phone : ${OWNER.phoneDisplay}
AIM   : open AOL Instant Messenger and IM "${OWNER.handle}"

Tip: this Notepad is editable - File > Save As downloads it.`,
    [profile.login, profile.html_url, repos.length]
  );

  const [text, setText] = useState(initialText);
  const [wrap, setWrap] = useState(true);
  const [fontSize, setFontSize] = useState(12);
  const ref = useRef<HTMLTextAreaElement>(null);

  const save = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.txt';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        { label: 'New', onClick: () => setText('') },
        { label: 'Revert to README', onClick: () => setText(initialText) },
        { label: 'Save As...', onClick: save },
        { separator: true },
        { label: 'Exit', onClick: onClose },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Select All', shortcut: 'Ctrl+A', onClick: () => ref.current?.select() },
        { label: 'Time/Date', onClick: () => setText((t) => `${t}${new Date().toLocaleString()}`) },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Word Wrap', checked: wrap, onClick: () => setWrap((w) => !w) },
        { separator: true },
        ...[11, 12, 14, 16].map((s) => ({ label: `Font size ${s}`, checked: fontSize === s, onClick: () => setFontSize(s) })),
      ],
    },
    {
      label: 'Help',
      items: [{ label: 'About Notepad', onClick: () => setText((t) => `${t}\n\nNotepad - ${OWNER.handle} XP Portfolio Edition.`) }],
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <MenuBar menus={menus} />
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
        className="min-h-0 w-full flex-1 resize-none bg-white p-2 font-mono leading-relaxed text-[#111] outline-none"
        style={{ fontSize, whiteSpace: wrap ? 'pre-wrap' : 'pre', overflowX: wrap ? 'hidden' : 'auto' }}
      />
    </div>
  );
};

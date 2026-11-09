import React, { useState } from 'react';
import { GitHubProfile, GitHubRepo, LANGUAGE_COLORS } from '../../data/githubData';
import { GitHubGlobeIcon, GuitarAppIcon, FolderIcon } from '../XpIcons';

interface AboutAppProps {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  onOpenApp: (id: string) => void;
}

export const AboutApp: React.FC<AboutAppProps> = ({ profile, repos, onOpenApp }) => {
  const [tab, setTab] = useState<'general' | 'languages' | 'highlights'>('general');

  // Compute language counts
  const langCounts = repos.reduce<Record<string, number>>((acc, repo) => {
    const lang = repo.language || 'Other';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex-1 bg-[#ECE9D8] p-3 flex flex-col overflow-y-auto xp-scroll">
      {/* XP Property Sheet Tabs */}
      <div className="flex items-end gap-0.5 px-1 border-b border-[#919B9C]">
        {(
          [
            { id: 'general', label: 'General' },
            { id: 'languages', label: 'Languages & Stack' },
            { id: 'highlights', label: 'GitHub Highlights' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-1 text-[11px] rounded-t-[3px] border border-b-0 cursor-pointer transition-colors ${
              tab === t.id
                ? 'bg-[#FCFCFA] border-[#919B9C] font-bold -mb-[1px] pb-[5px] z-10'
                : 'bg-[#E3DFD1] border-[#ACA899] text-[#333] hover:bg-[#EFECE2]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="flex-1 bg-[#FCFCFA] border border-t-0 border-[#919B9C] p-3.5 shadow-[inset_1px_1px_0_#ffffff] overflow-y-auto xp-scroll">
        {tab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 items-start">
            {/* Avatar & Badge */}
            <div className="flex flex-col items-center text-center bg-[#F4F2EA] border border-[#D4D0C8] rounded p-3">
              <div className="w-24 h-24 rounded border-2 border-[#0054E3] shadow-md overflow-hidden bg-white">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 font-bold text-[13px] text-[#003399]">@{profile.login}</div>
              <div className="text-[11px] text-[#555]">{profile.location}</div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E5F1FB] border border-[#9EC5EA] text-[10px] text-[#0046AD] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2CA02C]" />
                {profile.public_repos} Public Repos
              </div>
            </div>

            {/* System Details */}
            <div className="space-y-3">
              <div className="border-b border-[#E2DFD3] pb-2">
                <div className="text-[11px] font-bold text-[#003399] uppercase tracking-wider">
                  System:
                </div>
                <div className="text-[12px] font-semibold mt-0.5">
                  chengcxi Portfolio OS · Windows XP Professional (Build 2600)
                </div>
                <div className="text-[11px] text-[#444] mt-1 leading-relaxed xp-selectable">
                  {profile.bio}
                </div>
              </div>

              <div className="border-b border-[#E2DFD3] pb-2">
                <div className="text-[11px] font-bold text-[#003399] uppercase tracking-wider mb-1">
                  Registered Research & Engineering Domains:
                </div>
                <ul className="space-y-1 text-[11px] text-[#222]">
                  {profile.focusAreas.map((area) => (
                    <li key={area} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#0054E3] rounded-xs shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F5F4EE] border border-[#D4D0C8] rounded p-2">
                  <div className="text-[15px] font-bold text-[#0054E3]">{profile.public_repos}</div>
                  <div className="text-[10px] text-[#555]">Repositories</div>
                </div>
                <div className="bg-[#F5F4EE] border border-[#D4D0C8] rounded p-2">
                  <div className="text-[15px] font-bold text-[#0054E3]">
                    {new Date(profile.created_at).getFullYear()}
                  </div>
                  <div className="text-[10px] text-[#555]">GitHub Since</div>
                </div>
                <div className="bg-[#F5F4EE] border border-[#D4D0C8] rounded p-2">
                  <div className="text-[15px] font-bold text-[#2E8B57]">8+</div>
                  <div className="text-[10px] text-[#555]">Languages</div>
                </div>
              </div>

              {/* Quick Launch Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenApp('projects')}
                  className="xp-btn xp-btn-primary inline-flex items-center gap-1.5 font-semibold"
                >
                  <FolderIcon size={15} />
                  Browse {repos.length} Projects
                </button>
                <button
                  type="button"
                  onClick={() => onOpenApp('resume')}
                  className="xp-btn inline-flex items-center gap-1.5 font-semibold"
                >
                  <span>📄</span>
                  View Resume.pdf
                </button>
                <button
                  type="button"
                  onClick={() => onOpenApp('aim')}
                  className="xp-btn inline-flex items-center gap-1.5"
                >
                  <span>💬</span>
                  Message me on AIM
                </button>
                <button
                  type="button"
                  onClick={() => onOpenApp('guitar')}
                  className="xp-btn inline-flex items-center gap-1.5"
                >
                  <GuitarAppIcon size={15} />
                  Play Rusty Guitar
                </button>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="xp-btn inline-flex items-center gap-1.5 no-underline"
                >
                  <GitHubGlobeIcon size={15} />
                  GitHub Profile ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {tab === 'languages' && (
          <div className="space-y-3">
            <div className="text-[12px] font-bold text-[#003399]">
              Language Distribution Across Public Repositories
            </div>
            <p className="text-[11px] text-[#555]">
              Computed from github.com/chengcxi public repositories — spanning systems programming,
              quantum error correction, computer vision, iOS, and smart contracts.
            </p>
            <div className="space-y-2 pt-1">
              {sortedLangs.map(([lang, count]) => {
                const pct = Math.round((count / repos.length) * 100);
                const color = LANGUAGE_COLORS[lang] || '#4E73B5';
                return (
                  <div key={lang} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs inline-block border border-black/20"
                          style={{ backgroundColor: color }}
                        />
                        {lang}
                      </span>
                      <span className="text-[#555]">
                        {count} {count === 1 ? 'repo' : 'repos'} ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 bg-[#E6E3D7] border border-[#ACA899] rounded-xs overflow-hidden p-[1px]">
                      <div
                        className="h-full rounded-[1px] transition-all duration-500"
                        style={{
                          width: `${Math.max(pct, 6)}%`,
                          background: `linear-gradient(180deg, ${color}dd 0%, ${color} 100%)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'highlights' && (
          <div className="space-y-2.5">
            <div className="text-[12px] font-bold text-[#003399]">
              Featured Open Source & Research Work
            </div>
            <div className="grid grid-cols-1 gap-2">
              {repos
                .filter((r) => r.featured)
                .map((repo) => (
                  <div
                    key={repo.id}
                    className="p-2.5 bg-[#F7F6F0] border border-[#D4D0C8] rounded flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[12px] text-[#003399]">{repo.name}</span>
                        {repo.language && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E6EFFB] border border-[#A5C4EC] text-[#1E4B8E]">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#333] mt-1">{repo.description}</p>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="xp-btn shrink-0 no-underline text-[10px]"
                    >
                      Open ↗
                    </a>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

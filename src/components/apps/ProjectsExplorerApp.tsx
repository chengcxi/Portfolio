import React, { useMemo, useState } from 'react';
import { GitHubRepo, LANGUAGE_COLORS } from '../../data/githubData';
import { FolderIcon, GuitarAppIcon, RepoFileIcon } from '../XpIcons';

interface ProjectsExplorerAppProps {
  repos: GitHubRepo[];
  syncing: boolean;
  lastSynced: string | null;
  onSync: () => void;
  onOpenGuitar: () => void;
}

const CATEGORIES = [
  'All',
  'Apps & Audio',
  'Systems & Quantum',
  'AI / ML & CV',
  'Web3 & Tools',
] as const;

export const ProjectsExplorerApp: React.FC<ProjectsExplorerAppProps> = ({
  repos,
  syncing,
  lastSynced,
  onSync,
  onOpenGuitar,
}) => {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'icons' | 'details'>('icons');
  const [selectedId, setSelectedId] = useState<number>(repos[0]?.id ?? 101);

  const filtered = useMemo(() => {
    return repos.filter((r) => {
      const catOk = category === 'All' || r.category === category;
      const q = search.trim().toLowerCase();
      const searchOk =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.language && r.language.toLowerCase().includes(q));
      return catOk && searchOk;
    });
  }, [repos, category, search]);

  const selectedRepo = useMemo(
    () => repos.find((r) => r.id === selectedId) || filtered[0] || repos[0],
    [repos, filtered, selectedId]
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#ECE9D8]">
      {/* Standard Explorer Toolbar */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] px-2 py-1.5 flex flex-wrap items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setCategory('All')}
          className="xp-btn inline-flex items-center gap-1 text-[11px]"
          title="Show all repositories"
        >
          <span>📁</span> All ({repos.length})
        </button>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'icons' ? 'details' : 'icons')}
          className="xp-btn inline-flex items-center gap-1 text-[11px]"
        >
          <span>{viewMode === 'icons' ? '📋' : '🗂️'}</span>
          {viewMode === 'icons' ? 'Details View' : 'Tiles View'}
        </button>

        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="xp-btn inline-flex items-center gap-1 text-[11px]"
          title="Fetch latest public repositories from GitHub API"
        >
          <span className={syncing ? 'animate-spin inline-block' : ''}>🔄</span>
          {syncing ? 'Syncing...' : 'Sync GitHub'}
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[11px] text-[#444] hidden sm:inline">Filter:</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repos, Rust, Python..."
            className="xp-sunken px-2 py-0.5 text-[11px] w-40 sm:w-48 outline-none focus:border-[#0054E3]"
          />
        </div>
      </div>

      {/* Address Bar */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] px-2 py-1 flex items-center gap-2 text-[11px] shrink-0">
        <span className="text-[#555]">Address</span>
        <div className="flex-1 xp-sunken px-2 py-0.5 flex items-center gap-1.5 overflow-hidden">
          <FolderIcon size={14} />
          <span className="truncate text-[#111]">
            C:\Users\chengcxi\GitHub\Repositories
            {category !== 'All' ? `\\${category}` : ''}
          </span>
        </div>
        {lastSynced && (
          <span className="text-[10px] text-[#1D6B2C] hidden md:inline">
            Synced {lastSynced}
          </span>
        )}
      </div>

      {/* Explorer Split Body */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left XP Blue Task Pane */}
        <div className="w-full md:w-[220px] shrink-0 xp-explorer-sidebar p-2.5 overflow-y-auto xp-scroll space-y-2.5 border-b md:border-b-0 md:border-r border-[#5574BA]">
          {/* Categories Box */}
          <div className="rounded-t-[4px] overflow-hidden shadow-sm border border-white/60">
            <div className="xp-explorer-card-header px-2.5 py-1 text-[11px] font-bold text-[#215DC6]">
              Repository Folders
            </div>
            <div className="bg-[#D6DFF7] p-2 space-y-1">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === 'All'
                    ? repos.length
                    : repos.filter((r) => r.category === cat).length;
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#316AC5] text-white font-bold'
                        : 'text-[#215DC6] hover:underline hover:bg-white/40'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className={`text-[10px] ${active ? 'text-white/90' : 'text-[#4B6CA6]'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Details Box */}
          {selectedRepo && (
            <div className="rounded-t-[4px] overflow-hidden shadow-sm border border-white/60">
              <div className="xp-explorer-card-header px-2.5 py-1 text-[11px] font-bold text-[#215DC6]">
                Details
              </div>
              <div className="bg-[#D6DFF7] p-2.5 text-[11px] text-[#1A2E5A] space-y-2">
                <div>
                  <div className="font-bold text-[12px] text-[#002E8A] break-words">
                    {selectedRepo.name}
                  </div>
                  <div className="text-[10px] text-[#455F94] flex items-center gap-1.5 mt-0.5">
                    <span>{selectedRepo.language || 'Misc'}</span>
                    <span>•</span>
                    <span>{selectedRepo.fork ? 'Forked Repo' : 'Original Repo'}</span>
                  </div>
                </div>

                <p className="text-[11px] leading-snug text-[#22355D] xp-selectable">
                  {selectedRepo.description}
                </p>

                {selectedRepo.highlights.length > 0 && (
                  <ul className="space-y-1 text-[10px] text-[#283F70] pl-3 list-disc">
                    {selectedRepo.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}

                <div className="text-[10px] text-[#4B6496]">
                  Updated: {new Date(selectedRepo.pushed_at || selectedRepo.updated_at).toLocaleDateString()}
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <a
                    href={selectedRepo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="xp-btn xp-btn-primary text-center no-underline font-semibold"
                  >
                    Open on GitHub ↗
                  </a>
                  {selectedRepo.name === 'rustyguitar' && (
                    <button
                      type="button"
                      onClick={onOpenGuitar}
                      className="xp-btn inline-flex items-center justify-center gap-1.5 font-semibold"
                    >
                      <GuitarAppIcon size={14} />
                      Launch Synth Demo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main White File Area */}
        <div className="flex-1 min-h-0 bg-white overflow-y-auto xp-scroll p-3">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#666] text-[12px] py-10">
              <div className="text-2xl mb-1">🔎</div>
              <div>No repositories match "{search}".</div>
            </div>
          ) : viewMode === 'icons' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filtered.map((repo) => {
                const isSelected = selectedRepo?.id === repo.id;
                const langColor =
                  LANGUAGE_COLORS[repo.language || ''] || '#64748B';
                return (
                  <div
                    key={repo.id}
                    onClick={() => setSelectedId(repo.id)}
                    onDoubleClick={() => window.open(repo.html_url, '_blank', 'noopener,noreferrer')}
                    className={`p-2.5 rounded border cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-[#E5F0FF] border-[#316AC5] shadow-[inset_0_0_0_1px_#99C1F1]'
                        : 'bg-white border-transparent hover:bg-[#F3F7FD] hover:border-[#D0E0F5]'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {repo.name === 'rustyguitar' ? (
                        <GuitarAppIcon size={32} />
                      ) : (
                        <RepoFileIcon size={32} color={langColor} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-bold text-[12px] truncate ${
                            isSelected ? 'text-[#003C9D]' : 'text-[#111]'
                          }`}
                        >
                          {repo.name}
                        </span>
                        {repo.featured && (
                          <span className="text-[9px] px-1 py-0.2 bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#555] flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: langColor }}
                        />
                        <span>{repo.language || 'Repo'}</span>
                        {repo.fork && <span className="text-[#888]">(fork)</span>}
                      </div>
                      <p className="text-[11px] text-[#444] line-clamp-2 mt-1 leading-snug">
                        {repo.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#ECE9D8] border-b border-[#ACA899] text-[#333]">
                  <th className="py-1.5 px-2 font-semibold">Name</th>
                  <th className="py-1.5 px-2 font-semibold">Language</th>
                  <th className="py-1.5 px-2 font-semibold hidden sm:table-cell">Category</th>
                  <th className="py-1.5 px-2 font-semibold">Updated</th>
                  <th className="py-1.5 px-2 font-semibold text-right">Link</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((repo) => {
                  const isSelected = selectedRepo?.id === repo.id;
                  const langColor = LANGUAGE_COLORS[repo.language || ''] || '#64748B';
                  return (
                    <tr
                      key={repo.id}
                      onClick={() => setSelectedId(repo.id)}
                      onDoubleClick={() =>
                        window.open(repo.html_url, '_blank', 'noopener,noreferrer')
                      }
                      className={`border-b border-[#F0EFEA] cursor-pointer ${
                        isSelected ? 'bg-[#316AC5] text-white' : 'hover:bg-[#EEF4FC]'
                      }`}
                    >
                      <td className="py-1.5 px-2 font-semibold">{repo.name}</td>
                      <td className="py-1.5 px-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: langColor }}
                          />
                          {repo.language || '—'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 hidden sm:table-cell">{repo.category}</td>
                      <td className="py-1.5 px-2">
                        {new Date(repo.pushed_at || repo.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`underline ${isSelected ? 'text-white' : 'text-[#0054E3]'}`}
                        >
                          GitHub ↗
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

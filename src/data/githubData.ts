export interface GitHubProfile {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  bio: string;
  location: string;
  focusAreas: string[];
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  html_url: string;
  updated_at: string;
  pushed_at: string;
  created_at: string;
  default_branch: string;
  category: 'Systems & Quantum' | 'AI / ML & CV' | 'Apps & Audio' | 'Web3 & Tools';
  highlights: string[];
  featured?: boolean;
}

export const INITIAL_PROFILE: GitHubProfile = {
  login: 'chengcxi',
  name: 'chengcxi',
  avatar_url: 'https://avatars.githubusercontent.com/u/143553765?v=4',
  html_url: 'https://github.com/chengcxi',
  public_repos: 15,
  followers: 2,
  following: 3,
  created_at: '2023-08-29T20:31:48Z',
  updated_at: '2026-11-09T07:38:01Z',
  bio: 'UCSB Computer Science · Systems, Quantum Error Correction, Computer Vision, AI & Classical Guitar.',
  location: 'Santa Barbara, CA (UCSB)',
  focusAreas: [
    'Rust & Classical Guitar Audio',
    'Quantum Error Correction (MWPM)',
    'Computer Vision & Drone Tracking',
    'Graph Neural Networks & ML',
    'Voice AI Assistants & iOS (Swift)',
  ],
};

export const INITIAL_REPOS: GitHubRepo[] = [
  {
    id: 101,
    name: 'rustyguitar',
    full_name: 'chengcxi/rustyguitar',
    description:
      "Interactive desktop app in Rust (egui/eframe) that teaches classical guitar one note at a time, turning guitar-tab PDFs into guided practice (ships with Schubert's Serenade).",
    language: 'Rust',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/rustyguitar',
    updated_at: '2026-09-12T01:45:10Z',
    pushed_at: '2026-09-12T01:45:06Z',
    created_at: '2026-09-10T03:59:29Z',
    default_branch: 'main',
    category: 'Apps & Audio',
    featured: true,
    highlights: [
      'Built in Rust with egui / eframe immediate-mode GUI',
      "Features Franz Schubert's Serenade in D major (3/4)",
      'Turns guitar-tab PDFs into note-by-note guided practice',
    ],
  },
  {
    id: 102,
    name: 'UCSBxGoogleQC-micro-blossom',
    full_name: 'chengcxi/UCSBxGoogleQC-micro-blossom',
    description:
      'Hardware Accelerated MWPM (Minimum-Weight Perfect Matching) decoder for Quantum Error Correction.',
    language: 'Rust / Hardware QEC',
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    html_url: 'https://github.com/chengcxi/UCSBxGoogleQC-micro-blossom',
    updated_at: '2026-10-13T22:40:14Z',
    pushed_at: '2026-07-12T19:42:53Z',
    created_at: '2026-10-13T22:40:14Z',
    default_branch: 'main',
    category: 'Systems & Quantum',
    featured: true,
    highlights: [
      'UCSB x Google Quantum AI collaboration fork',
      'Minimum-Weight Perfect Matching decoder architecture',
      'MIT Licensed hardware-accelerated QEC tooling',
    ],
  },
  {
    id: 103,
    name: 'panamera',
    full_name: 'chengcxi/panamera',
    description: 'Voice-based AI Assistant built with Python for natural speech interaction.',
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/panamera',
    updated_at: '2026-06-02T22:31:57Z',
    pushed_at: '2026-06-02T23:04:47Z',
    created_at: '2026-05-31T21:40:38Z',
    default_branch: 'main',
    category: 'AI / ML & CV',
    featured: true,
    highlights: [
      'Voice-first AI assistant pipeline in Python',
      'Real-time speech capture & conversational reasoning',
    ],
  },
  {
    id: 104,
    name: 'droneCV',
    full_name: 'chengcxi/droneCV',
    description:
      'Computer vision for drones in C++ using CMake & OpenCV with ORB and Enhanced Correlation Coefficient (ECC) motion compensation.',
    language: 'C++',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/droneCV',
    updated_at: '2025-07-19T17:08:28Z',
    pushed_at: '2026-07-18T19:35:03Z',
    created_at: '2025-04-02T22:37:38Z',
    default_branch: 'main',
    category: 'AI / ML & CV',
    featured: true,
    highlights: [
      'C++ & OpenCV pipeline compiled via CMake',
      'Oriented FAST & Rotated BRIEF (ORB) motion compensation',
      'Enhanced Correlation Coefficient (ECC) alignment mode',
    ],
  },
  {
    id: 105,
    name: 'BitcoinAlphaGNN',
    full_name: 'chengcxi/BitcoinAlphaGNN',
    description:
      'Graph Neural Network (GNN) to analyze trust networks and reputation scores across the Bitcoin Alpha OTC graph.',
    language: 'Jupyter Notebook',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/BitcoinAlphaGNN',
    updated_at: '2025-05-29T21:39:35Z',
    pushed_at: '2025-05-29T21:39:31Z',
    created_at: '2025-05-29T17:30:20Z',
    default_branch: 'main',
    category: 'AI / ML & CV',
    featured: true,
    highlights: [
      'Signed directed trust network modeling on Bitcoin Alpha',
      'Graph Neural Network edge/node trust prediction',
    ],
  },
  {
    id: 106,
    name: 'swing',
    full_name: 'chengcxi/swing',
    description: 'Swift & iOS 16+ mobile application paired with a local Node.js backend service.',
    language: 'Swift',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/swing',
    updated_at: '2026-05-08T01:07:29Z',
    pushed_at: '2026-06-03T19:49:28Z',
    created_at: '2025-12-12T03:39:01Z',
    default_branch: 'main',
    category: 'Apps & Audio',
    featured: true,
    highlights: [
      'Native Swift targeting iOS 16.0+ simulation',
      'Backed by local Node.js API integration',
    ],
  },
  {
    id: 107,
    name: 'MLAlgorithm',
    full_name: 'chengcxi/MLAlgorithm',
    description: 'Machine learning algorithm for analyzing and modeling leveraged ETFs.',
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/MLAlgorithm',
    updated_at: '2025-04-19T06:43:20Z',
    pushed_at: '2025-05-12T00:08:57Z',
    created_at: '2025-03-22T21:55:49Z',
    default_branch: 'main',
    category: 'AI / ML & CV',
    highlights: ['Quantitative ML modeling for leveraged ETFs in Python'],
  },
  {
    id: 108,
    name: 'CTAPIDDF',
    full_name: 'chengcxi/CTAPIDDF',
    description:
      'Clinical Trials API Discrete Data Finder — queries ClinicalTrials.gov v2 REST API with Pandas & Requests.',
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/CTAPIDDF',
    updated_at: '2025-02-27T00:57:57Z',
    pushed_at: '2025-02-27T00:57:53Z',
    created_at: '2024-12-26T06:24:48Z',
    default_branch: 'main',
    category: 'Web3 & Tools',
    highlights: [
      'Integrates ClinicalTrials.gov OpenAPI v2 endpoints',
      'Structured tabular extraction using Pandas & Requests',
    ],
  },
  {
    id: 109,
    name: 'bugs',
    full_name: 'chengcxi/bugs',
    description: 'Interactive Lua scripting & simulation sandbox project.',
    language: 'Lua',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/bugs',
    updated_at: '2026-10-10T18:37:21Z',
    pushed_at: '2026-10-11T01:19:59Z',
    created_at: '2026-10-08T00:52:41Z',
    default_branch: 'main',
    category: 'Apps & Audio',
    highlights: ['Recent Lua experiment pushed Oct 2026'],
  },
  {
    id: 110,
    name: 'CS190J-sections-code-chengcxi',
    full_name: 'chengcxi/CS190J-sections-code-chengcxi',
    description: 'UCSB CS190J course section exercises and systems programming code.',
    language: 'Coursework',
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    html_url: 'https://github.com/chengcxi/CS190J-sections-code-chengcxi',
    updated_at: '2025-04-04T20:03:11Z',
    pushed_at: '2025-04-04T20:01:37Z',
    created_at: '2025-04-04T20:03:10Z',
    default_branch: 'main',
    category: 'Systems & Quantum',
    highlights: ['UCSB CS190J section implementations'],
  },
  {
    id: 111,
    name: 'Continuum',
    full_name: 'chengcxi/Continuum',
    description: 'Solidity smart contract architecture for the Continuum project.',
    language: 'Solidity',
    stargazers_count: 0,
    forks_count: 1,
    fork: false,
    html_url: 'https://github.com/chengcxi/Continuum',
    updated_at: '2023-09-28T18:59:22Z',
    pushed_at: '2023-10-15T23:45:46Z',
    created_at: '2023-09-28T17:25:21Z',
    default_branch: 'main',
    category: 'Web3 & Tools',
    highlights: ['EVM smart contracts in Solidity (1 fork)'],
  },
  {
    id: 112,
    name: 'Naboo.ai-UX-test',
    full_name: 'chengcxi/Naboo.ai-UX-test',
    description: 'UX exploration & interface prototype repository.',
    language: 'Prototype',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/Naboo.ai-UX-test',
    updated_at: '2024-02-02T00:38:56Z',
    pushed_at: '2024-02-02T00:41:23Z',
    created_at: '2024-02-02T00:38:56Z',
    default_branch: 'main',
    category: 'Web3 & Tools',
    highlights: ['Product UX testing experiment'],
  },
  {
    id: 113,
    name: 'crypto_price_converter',
    full_name: 'chengcxi/crypto_price_converter',
    description: 'JavaScript utility for converting cryptocurrency prices across pairs.',
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    html_url: 'https://github.com/chengcxi/crypto_price_converter',
    updated_at: '2023-12-01T03:06:28Z',
    pushed_at: '2023-12-01T03:18:32Z',
    created_at: '2023-12-01T03:06:18Z',
    default_branch: 'main',
    category: 'Web3 & Tools',
    highlights: ['JavaScript cryptocurrency conversion tool'],
  },
  {
    id: 114,
    name: 'ttctest',
    full_name: 'chengcxi/ttctest',
    description: 'JavaScript experimentation & testing sandbox.',
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    html_url: 'https://github.com/chengcxi/ttctest',
    updated_at: '2023-09-28T17:23:08Z',
    pushed_at: '2023-09-28T17:23:37Z',
    created_at: '2023-09-19T01:08:59Z',
    default_branch: 'main',
    category: 'Web3 & Tools',
    highlights: ['Early JavaScript sandbox repo'],
  },
  {
    id: 115,
    name: 'erc20test',
    full_name: 'chengcxi/erc20test',
    description: 'ERC-20 token standard testing contracts in Solidity.',
    language: 'Solidity',
    stargazers_count: 0,
    forks_count: 0,
    fork: true,
    html_url: 'https://github.com/chengcxi/erc20test',
    updated_at: '2023-09-22T18:25:46Z',
    pushed_at: '2023-09-28T17:10:22Z',
    created_at: '2023-09-06T22:48:58Z',
    default_branch: 'main',
    category: 'Web3 & Tools',
    highlights: ['Solidity ERC-20 token testbed'],
  },
];

export const LANGUAGE_COLORS: Record<string, string> = {
  Rust: '#dea584',
  Python: '#3572A5',
  'C++': '#f34b7d',
  Swift: '#F05138',
  Lua: '#000080',
  'Jupyter Notebook': '#DA5B0B',
  Solidity: '#AA6746',
  JavaScript: '#f1e05a',
  'Rust / Hardware QEC': '#0ea5e9',
  Coursework: '#6b7280',
  Prototype: '#8b5cf6',
};

export async function syncGitHubLive(): Promise<{
  profile: GitHubProfile;
  repos: GitHubRepo[];
  syncedAt: string;
}> {
  const [userRes, reposRes] = await Promise.all([
    fetch('https://api.github.com/users/chengcxi'),
    fetch('https://api.github.com/users/chengcxi/repos?sort=updated&per_page=30'),
  ]);

  if (!userRes.ok || !reposRes.ok) {
    throw new Error('GitHub API rate limit or network error');
  }

  const userJson = await userRes.json();
  const reposJson = await reposRes.json();

  const knownMap = new Map(INITIAL_REPOS.map((r) => [r.name, r]));

  const mergedRepos: GitHubRepo[] = (reposJson as Array<Record<string, unknown>>).map((r) => {
    const name = String(r.name ?? '');
    const existing = knownMap.get(name);
    return {
      id: Number(r.id ?? existing?.id ?? Math.random() * 100000),
      name,
      full_name: String(r.full_name ?? `chengcxi/${name}`),
      description:
        (r.description ? String(r.description) : existing?.description) ||
        `${String(r.language || 'Software')} repository by chengcxi.`,
      language: (r.language as string | null) ?? existing?.language ?? null,
      stargazers_count: Number(r.stargazers_count ?? 0),
      forks_count: Number(r.forks_count ?? 0),
      fork: Boolean(r.fork),
      html_url: String(r.html_url ?? `https://github.com/chengcxi/${name}`),
      updated_at: String(r.updated_at ?? ''),
      pushed_at: String(r.pushed_at ?? ''),
      created_at: String(r.created_at ?? ''),
      default_branch: String(r.default_branch ?? 'main'),
      category: existing?.category ?? 'Web3 & Tools',
      highlights: existing?.highlights ?? ['Public repository on github.com/chengcxi'],
      featured: existing?.featured ?? false,
    };
  });

  const mergedProfile: GitHubProfile = {
    ...INITIAL_PROFILE,
    login: userJson.login ?? INITIAL_PROFILE.login,
    name: userJson.name || INITIAL_PROFILE.name,
    avatar_url: userJson.avatar_url ?? INITIAL_PROFILE.avatar_url,
    html_url: userJson.html_url ?? INITIAL_PROFILE.html_url,
    public_repos: userJson.public_repos ?? mergedRepos.length,
    followers: userJson.followers ?? INITIAL_PROFILE.followers,
    following: userJson.following ?? INITIAL_PROFILE.following,
    created_at: userJson.created_at ?? INITIAL_PROFILE.created_at,
    updated_at: userJson.updated_at ?? INITIAL_PROFILE.updated_at,
    bio: userJson.bio || INITIAL_PROFILE.bio,
    location: userJson.location || INITIAL_PROFILE.location,
  };

  return {
    profile: mergedProfile,
    repos: mergedRepos,
    syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

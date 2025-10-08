"use server";

// Server actions for CommitLens Repositories page
// Uses GitHub REST API with tokens from env: GITHUB_FINE_GRAINED_TOKEN (preferred) or GITHUB_CLASSIC_TOKEN

// Local types mirroring the UI shape (avoid importing client modules)
export type Commit = {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
  files: string[];
  diff: string;
  tags: string[];
  aiNote?: string;
};

export type Repository = {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  commits: Commit[];
  private?: boolean; // included to compute overview stats accurately
  ownerLogin?: string;
  ownerType?: "User" | "Organization";
  fork?: boolean;
  archived?: boolean;
  forks?: number;
  defaultBranch?: string;
  totalCommits?: number;
};

export type OverviewStats = {
  totalRepos: number;
  totalCommits: number;
  totalStars: number;
  languagesUsed: number;
  privateRepos: number;
  publicRepos: number;
  avgCommitsPerRepo: number;
  lastUpdated: string;
  mostActiveRepo?: string;
};

const GITHUB_TOKEN =
  process.env.GITHUB_FINE_GRAINED_TOKEN || process.env.GITHUB_CLASSIC_TOKEN;

function assertToken() {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Missing GitHub token. Set GITHUB_FINE_GRAINED_TOKEN or GITHUB_CLASSIC_TOKEN in .env"
    );
  }
}

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string; // owner/repo
  description: string | null;
  language: string | null;
  stargazers_count: number;
  private: boolean;
  fork: boolean;
  archived: boolean;
  owner: { login: string; type: "User" | "Organization" };
  forks_count: number;
  default_branch: string | null;
};

type GitHubCommitSummary = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
    committer: { name: string; date: string } | null;
  };
  author: { login: string } | null;
};

async function githubFetch<T>(
  path: string,
  searchParams?: Record<string, string | number | undefined>
): Promise<T> {
  assertToken();
  const url = new URL(`https://api.github.com${path}`);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "CommitLens-App",
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GitHub API error ${res.status}: ${text || res.statusText}`
    );
  }
  return (await res.json()) as T;
}

// Hoisted once for performance
const LAST_PAGE_RE = /[?&]page=(\d+)>; rel="last"/;

async function fetchTotalCommits(
  owner: string,
  repo: string,
  branch?: string
): Promise<number> {
  assertToken();
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
  url.searchParams.set("per_page", "1");
  if (branch) url.searchParams.set("sha", branch);
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "CommitLens-App",
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) return 0;
  const link = res.headers.get("link");
  if (link?.includes('rel="last"')) {
    const match = link.match(LAST_PAGE_RE);
    const page = match ? Number(match[1]) : Number.NaN;
    if (!Number.isNaN(page)) return page;
  }
  // No Link header means 0 or 1 commits
  const arr = (await res.json()) as unknown[];
  return Array.isArray(arr) ? arr.length : 0;
}

function toCommit(summary: GitHubCommitSummary): Commit {
  const authorName =
    summary.commit.author?.name ||
    summary.commit.committer?.name ||
    summary.author?.login ||
    "unknown";
  const date =
    summary.commit.author?.date ||
    summary.commit.committer?.date ||
    new Date().toISOString();
  return {
    id: summary.sha,
    hash: summary.sha,
    message: summary.commit.message,
    author: authorName,
    date,
    additions: 0,
    deletions: 0,
    files: [],
    diff: "",
    tags: [],
  };
}

function toRepository(repo: GitHubRepo, commits: Commit[]): Repository {
  return {
    id: String(repo.id),
    name: repo.name,
    description: repo.description ?? "",
    language: repo.language ?? "Unknown",
    stars: repo.stargazers_count ?? 0,
    commits,
    private: repo.private,
    ownerLogin: repo.owner?.login,
    ownerType: repo.owner?.type,
    fork: repo.fork,
    archived: repo.archived,
    forks: repo.forks_count ?? 0,
    defaultBranch: repo.default_branch ?? undefined,
  };
}

export type ListReposParams = {
  perPageRepos?: number;
  page?: number;
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
  visibility?: "all" | "public" | "private";
  affiliation?: string; // owner,collaborator,organization_member
  since?: string; // ISO date
  perPageCommits?: number; // recent commits per repo
  includeTotalCommits?: boolean;
};

export async function fetchUserRepositories(
  params: ListReposParams = {}
): Promise<Repository[]> {
  const {
    perPageRepos = 30,
    page = 1,
    sort = "updated",
    direction = "desc",
    visibility = "all",
    affiliation = "owner,collaborator,organization_member",
    since,
    perPageCommits = 3,
    includeTotalCommits = false,
  } = params;

  const repos = await githubFetch<GitHubRepo[]>("/user/repos", {
    per_page: perPageRepos,
    page,
    sort,
    direction,
    visibility,
    affiliation,
    since,
  });

  const results: Repository[] = [];
  for (const r of repos) {
    let commits: Commit[] = [];
    try {
      const ghCommits =
        perPageCommits > 0
          ? await githubFetch<GitHubCommitSummary[]>(
              `/repos/${r.owner.login}/${r.name}/commits`,
              { per_page: perPageCommits }
            )
          : [];
      commits = ghCommits.map(toCommit);
    } catch {
      commits = [];
    }
    const repoObj = toRepository(r, commits);
    if (includeTotalCommits) {
      try {
        repoObj.totalCommits = await fetchTotalCommits(
          r.owner.login,
          r.name,
          r.default_branch ?? undefined
        );
      } catch {
        repoObj.totalCommits = undefined;
      }
    }
    results.push(repoObj);
  }
  return results;
}

export type FilterAndSortParams = {
  query?: string; // name or description
  language?: string; // exact language
  sortBy?: "name" | "stars" | "commits" | "updated";
};

export async function filterAndSortRepos(
  repos: Repository[],
  opts: FilterAndSortParams = {}
): Promise<Repository[]> {
  const { query = "", language = "all", sortBy = "updated" } = opts;
  const filtered = repos.filter((repo) => {
    const q = query.toLowerCase();
    const matchesSearch =
      repo.name.toLowerCase().includes(q) ||
      repo.description.toLowerCase().includes(q);
    const matchesLanguage = language === "all" || repo.language === language;
    return matchesSearch && matchesLanguage;
  });
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stars":
        return (b.stars ?? 0) - (a.stars ?? 0);
      case "commits":
        return (b.commits?.length ?? 0) - (a.commits?.length ?? 0);
      default: {
        const bDate = new Date(b.commits?.[0]?.date || 0).getTime();
        const aDate = new Date(a.commits?.[0]?.date || 0).getTime();
        return bDate - aDate;
      }
    }
  });
  // Ensure this async function contains an await to satisfy server action linting
  await Promise.resolve();
  return sorted;
}

export async function extractLanguages(repos: Repository[]): Promise<string[]> {
  const languages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean))
  );
  // Ensure this async function contains an await to satisfy server action linting
  await Promise.resolve();
  return languages;
}

export async function computeOverviewStats(
  repos: Repository[]
): Promise<OverviewStats> {
  const totalRepos = repos.length;
  const totalCommits = repos.reduce(
    (sum, r) => sum + (r.commits?.length ?? 0),
    0
  );
  const totalStars = repos.reduce((sum, r) => sum + (r.stars ?? 0), 0);
  const languagesList = await extractLanguages(repos);
  const languagesUsed = languagesList.length;
  const privateRepos = repos.filter((r) => r.private === true).length;
  const publicRepos = totalRepos - privateRepos;
  const avgCommitsPerRepo =
    totalRepos > 0 ? Math.round(totalCommits / totalRepos) : 0;
  const lastUpdated = new Date().toLocaleDateString();
  const mostActiveRepo = [...repos].sort(
    (a, b) => (b.commits?.length ?? 0) - (a.commits?.length ?? 0)
  )?.[0]?.name;
  return {
    totalRepos,
    totalCommits,
    totalStars,
    languagesUsed,
    privateRepos,
    publicRepos,
    avgCommitsPerRepo,
    lastUpdated,
    mostActiveRepo,
  };
}

export async function fetchRepositoryCommits(
  owner: string,
  repo: string,
  perPage = 10
): Promise<Commit[]> {
  const summaries = await githubFetch<GitHubCommitSummary[]>(
    `/repos/${owner}/${repo}/commits`,
    { per_page: perPage }
  );
  return summaries.map(toCommit);
}

export async function getRepositories(
  opts: ListReposParams & FilterAndSortParams = {}
): Promise<Repository[]> {
  const repos = await fetchUserRepositories(opts);
  return await filterAndSortRepos(repos, opts);
}

export async function getRepositoriesOverview(
  opts: ListReposParams = {}
): Promise<OverviewStats> {
  const repos = await fetchUserRepositories(opts);
  return await computeOverviewStats(repos);
}

export async function getCurrentUserLogin(): Promise<string> {
  const me = await githubFetch<{ login: string; type: string }>("/user");
  return me.login;
}

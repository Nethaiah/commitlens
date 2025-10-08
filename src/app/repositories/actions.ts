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
  branches?: number;
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

async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  assertToken();
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "CommitLens-App",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub GraphQL error ${res.status}: ${text || res.statusText}`);
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`GitHub GraphQL returned errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

// REST GitHubRepo type removed (we use GraphQL now for list-page accuracy)

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
  const { perPageRepos = 30 } = params;

  const QUERY = /* GraphQL */ `
    query ViewerRepos($first: Int!, $after: String) {
      viewer {
        repositories(
          first: $first
          after: $after
          orderBy: { field: UPDATED_AT, direction: DESC }
          affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
        ) {
          nodes {
            id
            name
            description
            stargazerCount
            isPrivate
            isFork
            isArchived
            owner { login __typename }
            primaryLanguage { name }
            defaultBranchRef {
              name
              target {
                ... on Commit {
                  history(first: 1) {
                    totalCount
                    edges { node { committedDate oid messageHeadline author { name user { login } } } }
                  }
                }
              }
            }
            refs(refPrefix: "refs/heads/", first: 1) { totalCount }
            updatedAt
            forkCount
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  `;

  type RepoNode = {
    id: string;
    name: string;
    description?: string | null;
    stargazerCount: number;
    isPrivate: boolean;
    isFork: boolean;
    isArchived: boolean;
    owner?: { login: string; __typename: string } | null;
    primaryLanguage?: { name: string } | null;
    defaultBranchRef?: {
      name?: string;
      target?: {
        history?: {
          totalCount: number;
          edges?: Array<{ node: { committedDate: string; oid: string; messageHeadline?: string; author?: { name?: string; user?: { login?: string } | null } | null } }>;
        };
      } | null;
    } | null;
    refs?: { totalCount: number } | null;
    updatedAt: string;
    forkCount: number;
  };
  type ViewerReposResponse = { viewer: { repositories: { nodes: RepoNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } };

  const data = await graphqlFetch<ViewerReposResponse>(QUERY, {
    first: perPageRepos,
    after: null,
  });
  const nodes = data.viewer.repositories.nodes;
  const repos: Repository[] = nodes.map((n) => {
    const lastEdge = n.defaultBranchRef?.target?.history?.edges?.[0]?.node;
    const totalCount = n.defaultBranchRef?.target?.history?.totalCount ?? 0;
    const lastCommitDate: string | undefined = lastEdge?.committedDate ?? n.updatedAt;
    const commitId: string | undefined = lastEdge?.oid;
    const languageName: string = n.primaryLanguage?.name ?? "Unknown";
    const ownerType = n.owner?.__typename === "Organization" ? "Organization" : "User";

    const mapped: Repository = {
      id: n.id,
      name: n.name,
      description: n.description ?? "",
      language: languageName,
      stars: n.stargazerCount ?? 0,
      commits: lastCommitDate
        ? [{ id: commitId ?? n.id, hash: commitId ?? n.id, message: lastEdge?.messageHeadline ?? "", author: lastEdge?.author?.name ?? n.owner?.login ?? "unknown", date: lastCommitDate, additions: 0, deletions: 0, files: [], diff: "", tags: [] }]
        : [],
      private: n.isPrivate ?? false,
      ownerLogin: n.owner?.login ?? undefined,
      ownerType,
      fork: n.isFork ?? false,
      archived: n.isArchived ?? false,
      forks: n.forkCount ?? 0,
      defaultBranch: n.defaultBranchRef?.name ?? undefined,
      totalCommits: totalCount,
      branches: n.refs?.totalCount ?? 0,
    };
    return mapped;
  });
  return repos;
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
    (sum, r) => sum + (r.totalCommits ?? r.commits?.length ?? 0),
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
    (a, b) =>
      (b.totalCommits ?? b.commits?.length ?? 0) -
      (a.totalCommits ?? a.commits?.length ?? 0)
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

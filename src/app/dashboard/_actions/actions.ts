"use server";

// Server actions for CommitLens Dashboard page
// Uses GitHub GraphQL API (token in env: GITHUB_FINE_GRAINED_TOKEN or GITHUB_CLASSIC_TOKEN)

export type LanguageStat = {
  name: string;
  commits: number;
  percentage: number;
  color?: string;
};

export type ContributionDay = {
  date: string; // ISO
  count: number;
  weekday: number; // 0..6, Monday is 0 in GitHub schema
};

export type ContributionWeek = {
  firstDay: string; // ISO date of week start
  days: ContributionDay[];
};

export type DashboardOverview = {
  totalCommits: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  avgCommitsPerDay: number;
};

export type DashboardData = {
  overview: DashboardOverview;
  languages: LanguageStat[];
  contributionWeeks: ContributionWeek[];
  selectedRepoCommitTotal?: number;
};

const GITHUB_TOKEN =
  process.env.GITHUB_FINE_GRAINED_TOKEN || process.env.GITHUB_CLASSIC_TOKEN;

function assertToken() {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Missing GitHub token. Set GITHUB_FINE_GRAINED_TOKEN or GITHUB_CLASSIC_TOKEN in .env",
    );
  }
}

async function restFetch<T>(url: string): Promise<T> {
  assertToken();
  const res = await fetch(url, {
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
      `GitHub REST error ${res.status}: ${text || res.statusText}`,
    );
  }
  return (await res.json()) as T;
}

// Paginate through /repos/{owner}/{repo}/commits and collect SHAs
async function listCommitShasByQuery(
  owner: string,
  repo: string,
  query: string,
): Promise<Set<string>> {
  const perPage = 100;
  const shas = new Set<string>();
  let page = 1;
  // Safety cap to avoid unbounded work in huge repos
  const MAX_PAGES = 50; // up to ~5000 commits per query
  while (page <= MAX_PAGES) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?${query}&per_page=${perPage}&page=${page}`;
    const data = await restFetch<Array<{ sha: string }>>(url);
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }
    for (const c of data) shas.add(c.sha);
    if (data.length < perPage) {
      break;
    }
    page += 1;
  }
  return shas;
}

export async function fetchAuthoredCommitTotalREST(
  owner: string,
  repo: string,
  viewerLogin: string,
): Promise<number> {
  // For all-time, omit since/until. If includeUnmerged=false, we could restrict to default branch via sha param,
  // but we don't have the default branch name here; keeping includeUnmerged behavior to all branches.
  // Collect both author= and committer= to catch upload commits and mismatched identity cases.
  const params = new URLSearchParams();
  params.set("author", viewerLogin);
  const authorQuery = params.toString();
  const commitParams = new URLSearchParams();
  commitParams.set("committer", viewerLogin);
  const committerQuery = commitParams.toString();

  const [authorShas, committerShas] = await Promise.all([
    listCommitShasByQuery(owner, repo, authorQuery),
    listCommitShasByQuery(owner, repo, committerQuery),
  ]);
  const all = new Set<string>([...authorShas, ...committerShas]);
  return all.size;
}

function getDefaultDateRange(
  range: "7d" | "30d" | "90d" | "1y" = "30d",
): DateRange {
  const to = new Date();
  const from = new Date(to);
  const DAYS_7_INCLUSIVE_OFFSET = 6; // last 7 days includes today => offset 6
  const DAYS_30_INCLUSIVE_OFFSET = 29;
  const DAYS_90_INCLUSIVE_OFFSET = 89;
  switch (range) {
    case "7d":
      from.setDate(to.getDate() - DAYS_7_INCLUSIVE_OFFSET);
      break;
    case "90d":
      from.setDate(to.getDate() - DAYS_90_INCLUSIVE_OFFSET);
      break;
    case "1y":
      from.setFullYear(to.getFullYear() - 1);
      break;
    default:
      from.setDate(to.getDate() - DAYS_30_INCLUSIVE_OFFSET);
  }
  return { from: formatISODate(from), to: formatISODate(to) };
}

async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
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
    throw new Error(
      `GitHub GraphQL error ${res.status}: ${text || res.statusText}`,
    );
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(
      `GitHub GraphQL returned errors: ${JSON.stringify(json.errors)}`,
    );
  }
  return json.data as T;
}

export async function getCurrentUserLogin(): Promise<string> {
  const QUERY = /* GraphQL */ "query { viewer { login } }";
  const data = await graphqlFetch<{ viewer: { login: string } }>(QUERY);
  return data.viewer.login;
}

// Returns the list of years in which the viewer has contributions
export async function fetchContributionYears(): Promise<number[]> {
  const QUERY = /* GraphQL */ `
    query ViewerContributionYears {
      viewer {
        contributionsCollection {
          contributionYears
        }
      }
    }
  `;
  type Resp = {
    viewer: { contributionsCollection: { contributionYears: number[] } };
  };
  const data = await graphqlFetch<Resp>(QUERY);
  const years = data.viewer.contributionsCollection.contributionYears || [];
  // GitHub returns ascending; keep as-is for predictability
  return years.sort((a, b) => a - b);
}

const MS_PER_MINUTE = 60_000;
function formatISODate(d: Date): string {
  const iso = new Date(d.getTime() - d.getTimezoneOffset() * MS_PER_MINUTE)
    .toISOString()
    .split(".")[0];
  return `${iso}Z`;
}

export type DateRange = {
  from: string; // ISO
  to: string; // ISO
};

// Build a full calendar year range in UTC ISO format
function yearRange(year: number): DateRange {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  return { from, to };
}

export async function fetchContributionCalendar(range?: DateRange): Promise<{
  total: number;
  weeks: ContributionWeek[];
}> {
  const { from, to } = range ?? getDefaultDateRange("30d");
  const QUERY = /* GraphQL */ `
    query ViewerContributions($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              firstDay
              contributionDays {
                date
                contributionCount
                weekday
                color
              }
            }
          }
        }
      }
    }
  `;
  type Resp = {
    viewer: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            firstDay: string;
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              weekday: number;
              color?: string;
            }>;
          }>;
        };
      };
    };
  };
  const data = await graphqlFetch<Resp>(QUERY, { from, to });
  const cal = data.viewer.contributionsCollection.contributionCalendar;
  const weeks: ContributionWeek[] = cal.weeks.map((w) => ({
    firstDay: w.firstDay,
    days: w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      weekday: d.weekday,
    })),
  }));
  return { total: cal.totalContributions, weeks };
}

// Returns the number of commits the current viewer made to a specific repository within the range
export async function fetchViewerRepoCommitTotal(
  range?: DateRange,
  repoName?: string,
): Promise<number> {
  if (!repoName || repoName === "All Repositories") {
    return 0;
  }
  const { from, to } = range ?? getDefaultDateRange("1y");
  const QUERY = /* GraphQL */ `
    query ViewerRepoCommitContribs($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              name
            }
            contributions {
              totalCount
            }
          }
        }
      }
    }
  `;
  type Resp = {
    viewer: {
      contributionsCollection: {
        commitContributionsByRepository: Array<{
          repository: { name: string };
          contributions: { totalCount: number };
        }>;
      };
    };
  };
  const data = await graphqlFetch<Resp>(QUERY, { from, to });
  const items =
    data.viewer.contributionsCollection.commitContributionsByRepository;
  const match = items.find((i) => i.repository.name === repoName);
  return match?.contributions?.totalCount ?? 0;
}

export async function fetchLanguagesDistribution(
  selectedRepoName?: string,
): Promise<LanguageStat[]> {
  // Aggregate commits per primary language across recent repositories
  const QUERY = /* GraphQL */ `
    query ViewerReposForLangs($first: Int!, $after: String) {
      viewer {
        repositories(
          first: $first
          after: $after
          orderBy: { field: UPDATED_AT, direction: DESC }
          affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER]
        ) {
          nodes {
            name
            primaryLanguage {
              name
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    totalCount
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;
  type RepoNode = {
    name: string;
    primaryLanguage?: { name: string } | null;
    defaultBranchRef?: {
      target?: { history?: { totalCount: number } | null } | null;
    } | null;
  };
  type Resp = {
    viewer: {
      repositories: {
        nodes: RepoNode[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
  };
  const pageSize = 50;
  let after: string | null = null;
  const byLang = new Map<string, number>();
  // Fetch at most 100 repos to keep it fast
  for (let i = 0; i < 2; i++) {
    const resp = await graphqlFetch<Resp>(QUERY, { first: pageSize, after });
    const nodes: RepoNode[] = resp.viewer.repositories.nodes;
    for (const n of nodes) {
      if (
        selectedRepoName &&
        selectedRepoName !== "All Repositories" &&
        n.name !== selectedRepoName
      ) {
        continue;
      }
      const lang = n.primaryLanguage?.name ?? "Other";
      const commits = n.defaultBranchRef?.target?.history?.totalCount ?? 0;
      byLang.set(lang, (byLang.get(lang) ?? 0) + commits);
    }
    const pageInfo: { hasNextPage: boolean; endCursor: string | null } =
      resp.viewer.repositories.pageInfo;
    if (!pageInfo.hasNextPage || pageInfo.endCursor === null) {
      break;
    }
    after = pageInfo.endCursor;
  }
  const totalCommits =
    Array.from(byLang.values()).reduce((a, b) => a + b, 0) || 1;
  const colorMap: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Go: "#00ADD8",
    Java: "#b07219",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    Shell: "#89e051",
    Other: "#6b7280",
  };
  const list: LanguageStat[] = Array.from(byLang.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, commits]) => ({
      name,
      commits,
      percentage: Math.round((commits / totalCommits) * 100),
      color: colorMap[name] ?? colorMap.Other,
    }));
  return list;
}

export async function computeOverview(
  range?: DateRange,
): Promise<DashboardOverview> {
  const { total, weeks } = await fetchContributionCalendar(range);
  const allDays = weeks
    .flatMap((w) => w.days)
    .sort((a, b) => a.date.localeCompare(b.date));
  const activeDays = allDays.filter((d) => d.count > 0).length;
  // Compute streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  for (const day of allDays) {
    if (day.count > 0) {
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }
  // Current streak from end
  for (const day of [...allDays].reverse()) {
    if (day.count > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }
  const totalDays = allDays.length || 1;
  const avgCommitsPerDay = Number((total / totalDays).toFixed(2));
  return {
    totalCommits: total,
    activeDays,
    currentStreak,
    longestStreak,
    avgCommitsPerDay,
  };
}

export async function getDashboardData(
  range?: DateRange,
  repoName?: string,
  opts?: {
    countMode?: "contrib" | "all";
    ownerLogin?: string;
    viewerLogin?: string;
  },
): Promise<DashboardData> {
  const [overview, languages, years] = await Promise.all([
    computeOverview(range),
    fetchLanguagesDistribution(repoName),
    fetchContributionYears(),
  ]);

  // Fetch heatmap weeks for all contribution years so the UI can filter by year like GitHub
  const yearCalPromises = years.map((y) =>
    fetchContributionCalendar(yearRange(y)),
  );
  const yearCals = await Promise.all(yearCalPromises);
  const contributionWeeks = yearCals.flatMap((c) => c.weeks);

  let repoCommitTotal = 0;
  const isAllRepos = !repoName || repoName === "All Repositories";
  if (!isAllRepos) {
    if (
      opts?.countMode === "all" &&
      opts?.ownerLogin &&
      opts?.viewerLogin &&
      repoName
    ) {
      repoCommitTotal = await fetchAuthoredCommitTotalREST(
        opts.ownerLogin,
        repoName,
        opts.viewerLogin,
      );
    } else {
      repoCommitTotal = await fetchViewerRepoCommitTotal(range, repoName);
    }
  }

  return {
    overview,
    languages,
    contributionWeeks,
    selectedRepoCommitTotal: repoCommitTotal,
  };
}

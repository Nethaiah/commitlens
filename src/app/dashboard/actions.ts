"use server";

// Server actions for CommitLens Dashboard page
// Uses GitHub GraphQL API (token in env: GITHUB_FINE_GRAINED_TOKEN or GITHUB_CLASSIC_TOKEN)

export type LanguageStat = {
  name: string;
  commits: number;
  percentage: number;
  color?: string;
};

export type MostProductiveDay = { day: string; commits: number };

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
  mostProductiveDays: MostProductiveDay[];
  contributionWeeks: ContributionWeek[];
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

function getDefaultDateRange(range: "7d" | "30d" | "90d" | "1y" = "30d"): DateRange {
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

export async function getCurrentUserLogin(): Promise<string> {
  const QUERY = /* GraphQL */ "query { viewer { login } }";
  const data = await graphqlFetch<{ viewer: { login: string } }>(QUERY);
  return data.viewer.login;
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

export async function fetchLanguagesDistribution(selectedRepoName?: string): Promise<LanguageStat[]> {
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
            primaryLanguage { name }
            defaultBranchRef { 
              target { 
                ... on Commit { history(first: 1) { totalCount } } 
              } 
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  `;
  type RepoNode = {
    name: string;
    primaryLanguage?: { name: string } | null;
    defaultBranchRef?: { target?: { history?: { totalCount: number } | null } | null } | null;
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
      if (selectedRepoName && selectedRepoName !== "All Repositories" && n.name !== selectedRepoName) {
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
  const totalCommits = Array.from(byLang.values()).reduce((a, b) => a + b, 0) || 1;
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

export async function computeMostProductiveDays(range?: DateRange): Promise<MostProductiveDay[]> {
  const { weeks } = await fetchContributionCalendar(range);
  const days = weeks.flatMap((w) => w.days);
  // Take last 7 days
  const last7 = days
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  return last7.map((d) => {
    const date = new Date(d.date);
    // Convert JS Sunday=0..Saturday=6 to Mon..Sun label
    const jsDay = date.getDay();
    const label = DAY_LABELS[((jsDay + 6) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6];
    return { day: label, commits: d.count };
  });
}

export async function computeOverview(range?: DateRange): Promise<DashboardOverview> {
  const { total, weeks } = await fetchContributionCalendar(range);
  const allDays = weeks.flatMap((w) => w.days).sort((a, b) => a.date.localeCompare(b.date));
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
  return { totalCommits: total, activeDays, currentStreak, longestStreak, avgCommitsPerDay };
}

export async function getDashboardData(range?: DateRange, repoName?: string): Promise<DashboardData> {
  const [overview, languages, mostProductiveDays, contrib] = await Promise.all([
    computeOverview(range),
    fetchLanguagesDistribution(repoName),
    computeMostProductiveDays(range),
    fetchContributionCalendar(range),
  ]);
  return {
    overview,
    languages,
    mostProductiveDays,
    contributionWeeks: contrib.weeks,
  };
}
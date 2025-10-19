import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardPage from "./_components/dashboard";
import { getDashboardData } from "./actions";
import { rangeKeyToDateRange } from "@/lib/date-range";
import { getRepositories, getCurrentUserLogin } from "../repositories/actions";

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const repo = (searchParams?.repo as string) || undefined;
  const count = (
    (searchParams?.count as string) === "contrib" ? "contrib" : "all"
  ) as "contrib" | "all";
  const range = rangeKeyToDateRange("1y");

  // Fetch repositories to populate header filter options
  const repos = await getRepositories({ perPageRepos: 50 });
  const viewerLogin = await getCurrentUserLogin();
  const ownerLogin = repo
    ? repos.find((r) => r.name === repo)?.ownerLogin
    : undefined;
  const data = await getDashboardData(range, repo, {
    countMode: count,
    ownerLogin,
    viewerLogin,
  });
  const repoOptions: {
    id: string;
    name: string;
    commits: number;
    affiliation?: "All" | "Owner" | "Collaborator";
  }[] = [
    {
      id: "all",
      name: "All Repositories",
      commits: 0,
      affiliation: "All" as const,
    },
    ...repos.map((r) => ({
      id: r.id,
      name: r.name,
      commits: r.totalCommits ?? r.commits?.length ?? 0,
      affiliation:
        r.ownerLogin === viewerLogin
          ? ("Owner" as const)
          : ("Collaborator" as const),
    })),
  ];

  return (
    <div>
      <DashboardPage
        overview={data.overview}
        languages={data.languages}
        contributionWeeks={data.contributionWeeks}
        repoOptions={repoOptions}
        selectedRepoCommitTotal={data.selectedRepoCommitTotal}
      />
    </div>
  );
}

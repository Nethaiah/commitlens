import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardPage from "./_components/dashboard";
import { getDashboardData } from "./actions";
import { rangeKeyToDateRange } from "@/lib/date-range";
import { getRepositories } from "../repositories/actions";

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

  const rangeKey = (searchParams?.range as string) || "1y";
  const repo = (searchParams?.repo as string) || undefined;
  const range = rangeKeyToDateRange(
    (rangeKey === "7d" || rangeKey === "30d" || rangeKey === "90d" || rangeKey === "1y" || rangeKey === "all"
      ? rangeKey
      : "1y") as "7d" | "30d" | "90d" | "1y" | "all"
  );
  const data = await getDashboardData(range, repo);

  // Fetch repositories to populate header filter options
  const repos = await getRepositories({ perPageRepos: 50 });
  const repoOptions: { id: string; name: string; commits: number }[] = [
    { id: "all", name: "All Repositories", commits: 0 },
    ...repos.map((r) => ({ id: r.id, name: r.name, commits: r.totalCommits ?? r.commits?.length ?? 0 })),
  ];

  return (
    <div>
      <DashboardPage
        overview={data.overview}
        languages={data.languages}
        mostProductiveDays={data.mostProductiveDays}
        contributionWeeks={data.contributionWeeks}
        repoOptions={repoOptions}
      />
    </div>
  );
}

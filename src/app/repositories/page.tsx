import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import RepositoriesPage from "./_components/repositories";
import { getRepositories, extractLanguages, computeOverviewStats, getCurrentUserLogin } from "./actions";

export default async function Repositories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  // Fetch repositories and derive UI data on the server
  const repos = await getRepositories({
    perPageRepos: 30,
    perPageCommits: 3,
    visibility: "all",
    // affiliation ensures inclusion across roles
    affiliation: "owner,collaborator,organization_member",
    includeTotalCommits: true,
  });
  const languages = await extractLanguages(repos);
  const overview = await computeOverviewStats(repos);
  const currentUserLogin = await getCurrentUserLogin();
  const lastSyncText = new Date().toLocaleTimeString();

  return (
    <div>
      <Header/>
      <RepositoriesPage
        repos={repos}
        languages={languages}
        overview={overview}
        currentUserLogin={currentUserLogin}
        lastSyncText={lastSyncText}
      />
    </div>
  );
}

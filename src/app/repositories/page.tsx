import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { auth } from "@/lib/auth";
import RepositoriesPage from "./_components/repositories";
import {
  computeOverviewStats,
  extractLanguages,
  getCurrentUserLogin,
  getRepositories,
} from "./actions";
import Loading from "./_components/loading";

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
    //includeTotalCommits: true,
  });
  const languages = await extractLanguages(repos);
  const overview = await computeOverviewStats(repos);
  const currentUserLogin = await getCurrentUserLogin();
  const lastSyncText = new Date().toLocaleTimeString();

  return (
    <div>
      <Header />
      <RepositoriesPage
        currentUserLogin={currentUserLogin}
        languages={languages}
        lastSyncText={lastSyncText}
        overview={overview}
        repos={repos}
      />
    </div>
  );
}

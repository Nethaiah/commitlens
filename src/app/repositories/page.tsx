import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { RepositoriesPage } from "./_components/repositories";

export default async function Repositories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  return (
    <div>
      <Header/>
      <RepositoriesPage/>
    </div>
  );
}

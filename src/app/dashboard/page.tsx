import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardPage from "./_components/dashboard";
import { getDashboardData } from "./_actions/actions";
import { rangeKeyToDateRange } from "@/lib/date-range";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const range = rangeKeyToDateRange("1y");

  const data = await getDashboardData(range);

  return (
    <div>
      <DashboardPage
        overview={data.overview}
        languages={data.languages}
        contributionWeeks={data.contributionWeeks}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ContributionWeek,
  DashboardOverview,
  LanguageStat,
} from "../actions";
import { RoundedPieChart } from "@/app/dashboard/_components/rounded-pie-chart";
import { ContributionHeatmap } from "./contribution-heatmap";
import { DashboardOverview as OverviewCards } from "./dashboard-overview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardHeader, type RepoOption } from "./dashboard-header";
import { ProductivityInsights } from "./productivity-insights";
import { useSearchParams } from "next/navigation";

export type DashboardProps = {
  overview: DashboardOverview;
  languages: LanguageStat[];
  contributionWeeks: ContributionWeek[];
  repoOptions: RepoOption[];
};

export default function DashboardPage(props: DashboardProps) {
  const { overview, languages, contributionWeeks, repoOptions } = props;
  const sp = useSearchParams();
  const [selectedRepo, setSelectedRepo] = useState(
    sp.get("repo") ?? "All Repositories",
  );
  const isRepoSelected = selectedRepo !== "All Repositories";
  const countMode = (sp.get("count") === "contrib" ? "contrib" : "all") as
    | "contrib"
    | "all";
  const DAYS_PER_YEAR = 365;
  const repoTotal = useMemo(() => {
    if (!isRepoSelected) return 0;
    const repo = repoOptions.find((r) => r.name === selectedRepo);
    return repo?.commits ?? 0;
  }, [isRepoSelected, repoOptions, selectedRepo]);

  const repoAvgPerDay = useMemo(
    () => Number(((repoTotal || 0) / DAYS_PER_YEAR).toFixed(2)),
    [repoTotal],
  );
  const displayOverview: DashboardOverview = isRepoSelected
    ? {
        totalCommits: repoTotal,
        activeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        avgCommitsPerDay: repoAvgPerDay,
      }
    : overview;
  const years = useMemo(() => {
    const s = new Set<number>();
    for (const w of contributionWeeks) {
      for (const d of w.days) s.add(new Date(d.date).getFullYear());
    }
    return Array.from(s).sort((a, b) => a - b);
  }, [contributionWeeks]);
  const [selectedYear, setSelectedYear] = useState<number>(
    years.length ? years[years.length - 1] : new Date().getFullYear(),
  );
  const yearWeeks = useMemo(() => {
    if (!years.length) return contributionWeeks;
    return contributionWeeks.filter((w) =>
      w.days.some((d) => new Date(d.date).getFullYear() === selectedYear),
    );
  }, [contributionWeeks, selectedYear, years]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <DashboardHeader
            repoOptions={repoOptions}
            selectedRepo={selectedRepo}
            onRepoChange={setSelectedRepo}
          />
        </div>

        <OverviewCards
          overview={displayOverview}
          selectedRepo={isRepoSelected ? selectedRepo : undefined}
          countMode={countMode}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RoundedPieChart
              languages={languages}
              title="Programming Languages"
              subtitle="Distribution of commits by programming language"
            />

            <ProductivityInsights
              overview={overview}
              languages={languages}
              contributionWeeks={contributionWeeks}
            />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Coding Activity</CardTitle>
                    <CardDescription>
                      Your commit activity in {selectedYear}
                    </CardDescription>
                  </div>
                  {years.length > 0 && (
                    <Select
                      value={String(selectedYear)}
                      onValueChange={(v) => setSelectedYear(Number(v))}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ContributionHeatmap
                  weeks={yearWeeks}
                  label={String(selectedYear)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

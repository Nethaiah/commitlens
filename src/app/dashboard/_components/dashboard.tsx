"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContributionWeek, DashboardOverview, LanguageStat, MostProductiveDay } from "../actions";
import { RoundedPieChart } from "@/app/dashboard/_components/rounded-pie-chart";
import { MonochromeBarChart } from "@/app/dashboard/_components/most-productive-days";
import { ContributionHeatmap } from "./contribution-heatmap";
import { FourWeeksHeatmap } from "./four-weeks-heatmap";
import { DashboardOverview as OverviewCards } from "./dashboard-overview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardHeader, type RepoOption } from "./dashboard-header";
import { ProductivityInsights } from "./productivity-insights";

export type DashboardProps = {
  overview: DashboardOverview;
  languages: LanguageStat[];
  mostProductiveDays: MostProductiveDay[];
  contributionWeeks: ContributionWeek[];
  repoOptions: RepoOption[];
};

export default function DashboardPage(props: DashboardProps) {
  const { overview, languages, mostProductiveDays, contributionWeeks, repoOptions } = props;
  const barData = mostProductiveDays.map((d) => ({ label: d.day, value: d.commits }));
  const years = useMemo(() => {
    const s = new Set<number>();
    for (const w of contributionWeeks) {
      for (const d of w.days) s.add(new Date(d.date).getFullYear());
    }
    return Array.from(s).sort((a, b) => a - b);
  }, [contributionWeeks]);
  const [selectedYear, setSelectedYear] = useState<number>(
    years.length ? years[years.length - 1] : new Date().getFullYear()
  );
  const yearWeeks = useMemo(() => {
    if (!years.length) return contributionWeeks;
    return contributionWeeks.filter((w) => w.days.some((d) => new Date(d.date).getFullYear() === selectedYear));
  }, [contributionWeeks, selectedYear, years]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <DashboardHeader repoOptions={repoOptions} />
        </div>

        <OverviewCards overview={overview} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RoundedPieChart
              languages={languages}
              title="Programming Languages"
              subtitle="Distribution of commits by programming language"
            />

          <div className="grid gap-8 xl:grid-cols-2">
            <MonochromeBarChart
              data={barData}
              subtitle="Daily commit activity over the past 7 days"
              weeks={contributionWeeks}
            />

            <FourWeeksHeatmap weeks={contributionWeeks} />
          </div>

            <ProductivityInsights overview={overview} languages={languages} contributionWeeks={contributionWeeks} />

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Coding Activity</CardTitle>
                    <CardDescription>Your commit activity over the past year</CardDescription>
                  </div>
                  {years.length > 0 && (
                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
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
                <ContributionHeatmap weeks={yearWeeks} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

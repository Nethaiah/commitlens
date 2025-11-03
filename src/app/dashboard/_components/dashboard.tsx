"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoundedPieChart } from "@/app/dashboard/_components/rounded-pie-chart";
import { ContributionHeatmap } from "./contribution-heatmap";
import { DashboardOverview as OverviewCards } from "./dashboard-overview";
import { DashboardHeader } from "./dashboard-header";
import { ProductivityInsights } from "./productivity-insights";
import type {
  ContributionWeek,
  DashboardOverview,
  LanguageStat,
} from "../_actions/actions";

export type DashboardProps = {
  overview: DashboardOverview;
  languages: LanguageStat[];
  contributionWeeks: ContributionWeek[];
};

export default function DashboardPage(props: DashboardProps) {
  const { overview, languages, contributionWeeks } = props;
  const countMode = "all" as "contrib" | "all";
  const years = Array.from(
    new Set(
      contributionWeeks.flatMap((w) =>
        w.days.map((d) => new Date(d.date).getFullYear()),
      ),
    ),
  ).sort((a, b) => a - b);
  const [selectedYear, setSelectedYear] = useState<number>(
    years.at(-1) ?? new Date().getFullYear(),
  );
  const yearWeeks = years.length
    ? contributionWeeks.filter((w) =>
        w.days.some((d) => new Date(d.date).getFullYear() === selectedYear),
      )
    : contributionWeeks;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <DashboardHeader />
        </div>

        <OverviewCards
          overview={overview}
          selectedRepo={undefined}
          countMode={countMode}
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
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

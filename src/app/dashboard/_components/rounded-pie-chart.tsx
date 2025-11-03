"use client";

import { LabelList, Pie, PieChart, Tooltip, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import type { LanguageStat } from "../_actions/actions";

export function RoundedPieChart({
  languages,
  title = "Programming Languages",
  subtitle = "Distribution of commits by programming language",
}: {
  languages: LanguageStat[];
  title?: string;
  subtitle?: string;
}) {
  const pieData = languages.map((l) => ({
    key: l.name,
    value: l.percentage,
    commits: l.commits,
    fill: l.color ?? "#6b7280",
    display: l.name,
  }));

  const chartConfig = {
    value: { label: "Value" },
    ...Object.fromEntries(
      languages.map((l, i) => [l.name, { label: l.name, color: l.color ?? `var(--chart-${(i % 5) + 1})` }])
    ),
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className="flex-shrink-0">
            <div className="mx-auto h-64 w-64">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[256px] [&_.recharts-text]:fill-background"
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={30}
                    dataKey="value"
                    radius={10}
                    cornerRadius={8}
                    paddingAngle={4}
                    nameKey="display"
                  >
                    {pieData.map((d) => (
                      <Cell key={d.key} fill={d.fill as string} />
                    ))}
                    {/* Label values inside slices */}
                    <LabelList
                      dataKey="value"
                      stroke="none"
                      fontSize={12}
                      fontWeight={500}
                      fill="currentColor"
                      formatter={(v: number) => `${v}%`}
                    />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(val: number, _name: string, item: { payload: { commits: number; display: string } }) => [
                      `${val}% (${item.payload.commits ?? 0} commits)`,
                      item.payload.display ?? "",
                    ]}
                  />
                </PieChart>
              </ChartContainer>
            </div>
          </div>

          <div className="w-full flex-1">
            <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
              {pieData.map((lang) => (
                <div key={lang.key} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: lang.fill as string }}
                  />
                  <span className="whitespace-nowrap text-sm">{lang.display}</span>
                  <span className="text-sm text-muted-foreground">({lang.value}%)</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pieData.slice(0, 4).map((lang) => (
                <div key={lang.key} className="rounded-lg bg-secondary border-transparent p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <div
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: lang.fill as string }}
                    />
                    <span className="text-sm font-medium">{lang.display}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{lang.commits} commits</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

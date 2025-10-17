"use client";

import { useMemo, useState } from "react";
import type { ContributionWeek } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  weeks: ContributionWeek[];
};

function intensityClass(commits: number) {
  if (commits === 0) return "bg-muted";
  if (commits <= 2) return "bg-primary/20";
  if (commits <= 5) return "bg-primary/40";
  if (commits <= 8) return "bg-primary/60";
  return "bg-primary";
}

const dayOrder = [1, 2, 3, 4, 5, 6, 0];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function FourWeeksHeatmap({ weeks }: Props) {
  const windows = useMemo(() => {
    const chunks: ContributionWeek[][] = [];
    for (let i = weeks.length; i > 0; i -= 4) {
      const start = Math.max(0, i - 4);
      chunks.push(weeks.slice(start, i));
    }
    return chunks.reverse();
  }, [weeks]);
  const [windowIndex, setWindowIndex] = useState<number>(Math.max(0, windows.length - 1));
  const lastFour = windows[windowIndex] ?? weeks.slice(-4);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Coding Activity Heatmap</CardTitle>
            <CardDescription>Commit frequency over the past 4 weeks</CardDescription>
          </div>
          {windows.length > 1 && (
            <Select value={String(windowIndex)} onValueChange={(v) => setWindowIndex(Number(v))}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Window" />
              </SelectTrigger>
              <SelectContent align="end">
                {windows.map((w, idx) => (
                  <SelectItem key={`${w[0]?.firstDay}-${idx}`} value={String(idx)}>
                    {idx === windows.length - 1 ? "Recent" : `Window ${idx + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground">
            <div></div>
            {dayOrder.map((d) => (
              <div key={d} className="text-center">{dayLabels[d]}</div>
            ))}
          </div>
          {lastFour.map((week, weekIndex) => (
            <div key={week.firstDay} className="grid grid-cols-8 gap-1">
              <div className="text-xs text-muted-foreground text-right pr-2">{`Week ${weekIndex + 1}`}</div>
              {dayOrder.map((d) => {
                const day = week.days.find((x) => new Date(x.date).getDay() === d);
                const commits = day?.count ?? 0;
                const title = `${dayLabels[d]}, Week ${weekIndex + 1}: ${commits} commits`;
                return (
                  <div
                    key={`${week.firstDay}-${d}`}
                    className={`h-6 w-6 rounded-sm border ${intensityClass(commits)}`}
                    title={title}
                  />
                );
              })}
            </div>
          ))}
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-muted rounded-sm"></div>
              <div className="h-3 w-3 bg-primary/20 rounded-sm"></div>
              <div className="h-3 w-3 bg-primary/40 rounded-sm"></div>
              <div className="h-3 w-3 bg-primary/60 rounded-sm"></div>
              <div className="h-3 w-3 bg-primary rounded-sm"></div>
            </div>
            <span>More</span>
            <span className="ml-4">Hover for details</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

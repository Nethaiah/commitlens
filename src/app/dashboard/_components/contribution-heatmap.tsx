"use client";

import { useMemo, useRef, useState } from "react";
import type { ContributionWeek } from "../actions";

type Props = {
  weeks: ContributionWeek[];
};

export function ContributionHeatmap({ weeks }: Props) {
  const days = useMemo(() => weeks.flatMap((w) => w.days), [weeks]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getLevel = (count: number) => {
    if (count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const levelClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-200 dark:bg-green-900";
      case 2:
        return "bg-green-300 dark:bg-green-800";
      case 3:
        return "bg-green-400 dark:bg-green-700";
      case 4:
        return "bg-green-500 dark:bg-green-600";
      default:
        return "bg-muted";
    }
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  const totalContributions = useMemo(() => days.reduce((s, d) => s + (d.count ?? 0), 0), [days]);

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalContributions}</span> contributions in the last year
        </div>
      </div>
      {/* Month labels */}
      <div className="flex gap-1 pl-8">
        {weeks.map((week, idx) => {
          const first = new Date(week.firstDay);
          const show = first.getDate() <= 7;
          return (
            <div key={`${week.firstDay}-${idx}`} className="w-3 text-center text-xs text-muted-foreground">
              {show ? monthLabels[first.getMonth()] : ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {/* Day labels (every other like GitHub: Mon, Wed, Fri) */}
        <div className="flex w-8 flex-col gap-1">
          {dayNames.map((d, i) => (
            <div key={d} className="flex h-3 items-center text-xs text-muted-foreground">
              {i % 2 === 0 ? d : ""}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="relative" ref={containerRef}>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={`${week.firstDay}-${wi}`} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, di) => {
                  const day = week.days.find((d) => d.weekday === di);
                  const count = day?.count ?? 0;
                  const level = getLevel(count);
                  const title = day
                    ? `${count} ${count === 1 ? "contribution" : "contributions"} on ${new Date(day.date).toLocaleDateString()}`
                    : "No contributions";
                  return (
                    <button
                      type="button"
                      key={day?.date ?? `${week.firstDay}-wd${di}`}
                      aria-label={title}
                      className={`h-3 w-3 rounded-sm ${levelClass(level)} border`}
                      onMouseEnter={(e) => {
                        const cellRect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        const containerRect = containerRef.current?.getBoundingClientRect();
                        const cx = containerRect ? cellRect.left - containerRect.left + cellRect.width / 2 : 0;
                        const cy = containerRect ? cellRect.top - containerRect.top : 0;
                        setTooltip({ x: cx, y: cy, text: title });
                      }}
                      onMouseMove={(e) => {
                        const cellRect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        const containerRect = containerRef.current?.getBoundingClientRect();
                        const cx = containerRect ? cellRect.left - containerRect.left + cellRect.width / 2 : 0;
                        const cy = containerRect ? cellRect.top - containerRect.top : 0;
                        setTooltip({ x: cx, y: cy, text: title });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      title={title}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {tooltip && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-3 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow"
              style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            >
              {tooltip.text}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-800" />
          <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="h-3 w-3 rounded-sm bg-green-500 dark:bg-green-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

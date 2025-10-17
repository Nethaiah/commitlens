"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";
import React, { type SVGProps } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContributionWeek } from "../actions";
import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type BarDatum = { label: string; value: number };

const defaultData: BarDatum[] = [
  { label: "January", value: 342 },
  { label: "February", value: 876 },
  { label: "March", value: 512 },
  { label: "April", value: 629 },
  { label: "May", value: 458 },
  { label: "June", value: 781 },
  { label: "July", value: 394 },
  { label: "August", value: 925 },
];

const chartConfig = {
  value: { label: "Value", color: "var(--secondary-foreground)" },
} satisfies ChartConfig;

export function MonochromeBarChart(props: {
  data?: BarDatum[];
  title?: string;
  subtitle?: string;
  weeks?: ContributionWeek[];
}) {
  const chartData = props.data ?? defaultData;
  const weeks = props.weeks ?? [];
  const [selectedWeek, setSelectedWeek] = React.useState<number>(
    weeks.length > 0 ? weeks.length - 1 : -1
  );
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined
  );

  const activeData = React.useMemo(() => {
    if (activeIndex === undefined) return null;
    return chartData[activeIndex];
  }, [activeIndex, chartData]);

  const computedData: BarDatum[] = React.useMemo(() => {
    if (!weeks.length || selectedWeek < 0 || !weeks[selectedWeek]) return chartData;
    const w = weeks[selectedWeek];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
    const order = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sun
    return order.map((dow) => {
      const day = w.days.find((d) => {
        // Some shapes use weekday 0..6, else derive from date
        const dwd = (d as any).weekday ?? new Date(d.date).getDay();
        return dwd === dow;
      });
      const value = day?.count ?? 0;
      return { label: dayNames[dow], value };
    });
  }, [weeks, selectedWeek, chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p>Most Productive Days</p>
            {weeks.length > 0 && (
              <Select value={String(selectedWeek)} onValueChange={(v) => setSelectedWeek(Number(v))}>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent align="start">
                  {weeks.map((w, idx) => (
                    <SelectItem key={w.firstDay} value={String(idx)}>
                      {new Date(w.firstDay).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(jetBrainsMono.className, "text-2xl tracking-tighter")}>
              {activeData ? activeData.value : computedData[0]?.value ?? 0}
            </span>
          </div>
        </CardTitle>
        <CardDescription>{props.subtitle ?? "vs. last week"}</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={computedData}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => String(value).slice(0, 3)}
              />
              <Bar
                dataKey="value"
                fill="var(--secondary-foreground)"
                shape={
                  <CustomBar
                    setActiveIndex={setActiveIndex}
                    activeIndex={activeIndex}
                  />
                }
              ></Bar>
            </BarChart>
          </ChartContainer>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface CustomBarProps extends SVGProps<SVGSVGElement> {
  setActiveIndex: (index?: number) => void;
  index?: number;
  activeIndex?: number;
  value?: string;
}

const CustomBar = (props: CustomBarProps) => {
  const { fill, x, y, width, height, index, activeIndex, value } = props;

  // Custom variables
  const xPos = Number(x || 0);
  const realWidth = Number(width || 0);
  const isActive = index === activeIndex;
  const collapsedWidth = 2;
  // centered bar x-position
  const barX = isActive ? xPos : xPos + (realWidth - collapsedWidth) / 2;
  // centered text x-position
  const textX = xPos + realWidth / 2;
  // Custom bar shape
  return (
    <g onMouseEnter={() => props.setActiveIndex(index)}>
      {/* rendering the bar with custom postion and animated width */}
      <motion.rect
        style={{
          willChange: "transform, width", // helps with performance
        }}
        y={y}
        initial={{ width: collapsedWidth, x: barX }}
        animate={{ width: isActive ? realWidth : collapsedWidth, x: barX }}
        transition={{
          duration: activeIndex === index ? 0.5 : 1,
          type: "spring",
        }}
        height={height}
        fill={fill}
      />
      {/* Render value text on top of bar */}
      {isActive && (
        <motion.text
          style={{
            willChange: "transform, opacity", // helps with performance
          }}
          className={jetBrainsMono.className}
          key={index}
          initial={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          transition={{ duration: 0.1 }}
          x={textX}
          y={Number(y) - 5}
          textAnchor="middle"
          fill={fill}
        >
          {value}
        </motion.text>
      )}
    </g>
  );
};

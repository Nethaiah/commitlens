"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContributionWeek, DashboardOverview, LanguageStat } from "../actions";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

type Insights = {
  paragraphs: string[];
};

export function ProductivityInsights({
  overview,
  languages,
  contributionWeeks,
}: {
  overview: DashboardOverview;
  languages: LanguageStat[];
  contributionWeeks: ContributionWeek[];
}) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const sp = useSearchParams();
  const rangeKey = (sp.get("range") as "7d" | "30d" | "90d" | "1y" | "all") ?? "1y";
  const repo = sp.get("repo") ?? "All Repositories";
  const countMode = sp.get("count") as "all" | "contrib" | null;

  const payload = useMemo(
    () => ({ overview, languages, contributionWeeks, countMode: countMode ?? undefined, repo }),
    [overview, languages, contributionWeeks, countMode, repo],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadCached() {
      setLoading(true);
      try {
        const res = await fetch(`/api/insights?range=${encodeURIComponent(rangeKey)}&repo=${encodeURIComponent(repo)}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!cancelled) setInsights(null);
          return;
        }
        if (!res.ok) throw new Error("Failed to load cached insights");
        const json = (await res.json()) as Insights;
        if (!cancelled) setInsights(json);
      } catch (_) {
        if (!cancelled) setInsights(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCached();
    return () => {
      cancelled = true;
    };
  }, [payload, rangeKey, repo]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rangeKey, repo, ...payload }),
      });
      if (!res.ok) {
        let msg = "Failed to generate insights";
        try {
          const err = (await res.json()) as { error?: string };
          if (err?.error) msg = err.error;
        } catch {}
        throw new Error(msg);
      }
      const json = (await res.json()) as Insights;
      setInsights(json);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  const paragraphs = insights?.paragraphs ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Productivity Insights</CardTitle>
            <CardDescription>Powered by Gemini AI</CardDescription>
          </div>
        </div>
        <div>
          <Button size="sm" onClick={generate} disabled={generating}>
            {insights ? (generating ? "Generating..." : "Regenerate") : generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !paragraphs ? (
          <p className="text-sm text-muted-foreground">Loading insights…</p>
        ) : paragraphs && paragraphs.length > 0 ? (
          <div className="space-y-3">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground">{p}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No insights yet for this filter. Click Generate.</p>
        )}
      </CardContent>
    </Card>
  );
}

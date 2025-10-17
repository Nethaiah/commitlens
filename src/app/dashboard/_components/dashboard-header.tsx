"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, RefreshCw, Search, Download } from "lucide-react";
import { ExportModal } from "@/components/export-modal";

const RANGE_LABELS: Record<string, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 3 months",
  "1y": "Last year",
  "all": "All time",
};

export type RepoOption = { id: string; name: string; commits: number };

export function DashboardHeader({ repoOptions }: { repoOptions: RepoOption[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const range = sp.get("range") ?? "1y";
  const repo = sp.get("repo") ?? "All Repositories";

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) params.set(k, v);
    router.replace(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights into your development productivity patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/repositories">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Repositories
            </Button>
          </Link>
          <Button onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Date Range</div>
            <Select value={range} onValueChange={(v) => updateParams({ range: v })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RANGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Repository</div>
            <Select value={repo} onValueChange={(v) => updateParams({ repo: v })}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search options..." className="pl-8" />
                  </div>
                </div>
                {repoOptions.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{r.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{r.commits ?? 0} commits</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center">
          <ExportModal
            type="dashboard"
            trigger={
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}

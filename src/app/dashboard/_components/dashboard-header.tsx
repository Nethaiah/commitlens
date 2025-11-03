"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, RefreshCw, Search, Download, Info } from "lucide-react";
import { ExportModal } from "@/components/export-modal";

export type RepoOption = {
  id: string;
  name: string;
  commits: number;
  affiliation?: "All" | "Owner" | "Collaborator";
};

type DashboardHeaderProps = {
  repoOptions: RepoOption[];
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const { repoOptions, selectedRepo, onRepoChange } = props;
  const router = useRouter();
  const sp = useSearchParams();
  const count = (sp.get("count") as "contrib" | "all") ?? "all";
  const isAllRepos = selectedRepo === "All Repositories";

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
            <div className="text-sm font-medium">Repository</div>
            <Select value={selectedRepo} onValueChange={onRepoChange}>
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
                      <div className="flex items-center gap-2">
                        {r.affiliation && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-2">
                            {r.affiliation}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{r.commits ?? 0} commits</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isAllRepos && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Counting Mode</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
                      <Info className="h-3.5 w-3.5" />
                      <span className="sr-only">Info about counting modes</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] text-xs">
                    <p className="mb-1 font-semibold">Counting Modes:</p>
                    <ul className="list-disc space-y-1 pl-4">
                      <li><span className="font-medium">All Authored Commits:</span> Shows every commit you've authored, including those in forks and unmerged changes.</li>
                      <li><span className="font-medium">GitHub Contributions:</span> Matches GitHub's contribution graph, showing only commits that meet GitHub's contribution criteria.</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={count} onValueChange={(v) => updateParams({ count: v })}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Counting mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authored commits</SelectItem>
                  <SelectItem value="contrib">Contributions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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

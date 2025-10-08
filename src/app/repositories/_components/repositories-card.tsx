"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, GitBranch, Star } from "lucide-react";
type RepoForCard = {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  commits: { date?: string }[];
  forks?: number;
  defaultBranch?: string;
  ownerLogin?: string;
  totalCommits?: number;
  branches?: number;
};

export function RepositoryCard({ repo }: { repo: RepoForCard }) {
  const languageColors: Record<string, string> = {
    TypeScript: "#3178c6",
    Python: "#3776ab",
    Go: "#00add8",
    JavaScript: "#f7df1e",
  };

  const timeAgo = (iso?: string) => {
    const SECONDS_PER_MINUTE = 60;
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;
    if (!iso) {
      return "No recent commits";
    }
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) {
      return "No recent commits";
    }
    const diff = Math.max(0, Date.now() - t);
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / SECONDS_PER_MINUTE);
    const h = Math.floor(m / MINUTES_PER_HOUR);
    const d = Math.floor(h / HOURS_PER_DAY);
    if (d > 0) {
      return `${d} day${d === 1 ? "" : "s"} ago`;
    }
    if (h > 0) {
      return `${h} hour${h === 1 ? "" : "s"} ago`;
    }
    if (m > 0) {
      return `${m} minute${m === 1 ? "" : "s"} ago`;
    }
    return `${s} second${s === 1 ? "" : "s"} ago`;
  };

  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg transition-colors group-hover:text-primary">
              {repo.name}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {repo.totalCommits ?? repo.commits.length}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">{repo.ownerLogin ?? "unknown"}</div>
        <CardDescription className="line-clamp-2 flex-1">
          {repo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: languageColors[repo.language] || "#6b7280" }}
            />
            <span>{repo.language}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{repo.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>{repo.branches ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>{repo.defaultBranch ?? "default"}</span>
          </div>
        </div>

        <div className="mb-4 text-xs text-muted-foreground">
          Updated {timeAgo(repo.commits[0]?.date)}
        </div>

        <div className="mt-auto space-y-2">
          <Link href={`/repositories/${repo.id}/commits`} className="block">
            <Button className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View Commits
            </Button>
          </Link>
          <Link href={`/repositories/${repo.id}`} className="block">
            <Button variant="outline" className="w-full bg-transparent">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

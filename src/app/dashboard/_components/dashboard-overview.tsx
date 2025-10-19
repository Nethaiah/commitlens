import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Flame, GitBranch, TrendingUp } from "lucide-react";
import type { DashboardOverview } from "../actions";

export function DashboardOverview({ overview, selectedRepo, countMode }: { overview: DashboardOverview; selectedRepo?: string; countMode?: "contrib" | "all" }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Contributions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{overview.totalCommits}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500">&nbsp;</span>
            <span className="ml-1">{selectedRepo ? "Selected repository" : "Across all repositories"}</span>
            {selectedRepo && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {countMode === "all" ? "All authored" : "Contributions"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditionally render: either Active/Current Streak (all repos) or Avg only (repo selected) */}
      {selectedRepo ? (
        countMode !== "all" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Commits/Day</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{overview.avgCommitsPerDay}</div>
            </CardContent>
          </Card>
        )
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{overview.activeDays}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{overview.currentStreak} days</div>
              <div className="text-xs text-muted-foreground mt-1">Longest: {overview.longestStreak} days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Commits/Day</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{overview.avgCommitsPerDay}</div>
              <div className="text-xs text-muted-foreground mt-1">Based on active days</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

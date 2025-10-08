"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Code, GitBranch, GitFork, Globe, Lock, Star, TrendingUp } from "lucide-react";

export function RepositoriesOverview(props: {
  totalRepos: number;
  totalCommits: number;
  totalStars: number;
  languagesUsed: number;
  privateRepos: number;
  publicRepos: number;
  avgCommitsPerRepo: number;
  lastUpdated: string;
  mostActiveRepo?: string;
}) {
  const {
    totalRepos,
    totalCommits,
    totalStars,
    languagesUsed,
    privateRepos,
    publicRepos,
    avgCommitsPerRepo,
    lastUpdated,
    mostActiveRepo = "",
  } = props;

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Repository Overview</CardTitle>
            <CardDescription>
              Quick insights into your repository collection
            </CardDescription>
          </div>
          {mostActiveRepo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Most Active: {mostActiveRepo}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{totalRepos}</div>
            <div className="text-sm text-muted-foreground">Total Repositories</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mx-auto mb-2">
              <GitFork className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{totalCommits.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Commits</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-lg mx-auto mb-2">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold">{totalStars.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Stars</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mx-auto mb-2">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{languagesUsed}</div>
            <div className="text-sm text-muted-foreground">Languages Used</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-500/10 rounded-lg mx-auto mb-2">
              <Lock className="h-6 w-6 text-gray-600" />
            </div>
            <div className="text-2xl font-bold">{privateRepos}</div>
            <div className="text-sm text-muted-foreground">Private Repos</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-lg mx-auto mb-2">
              <Globe className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{publicRepos}</div>
            <div className="text-sm text-muted-foreground">Public Repos</div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Average commits per repository: {avgCommitsPerRepo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

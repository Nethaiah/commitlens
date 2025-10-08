"use client";

import { Clock } from "lucide-react";

export function RepositoriesHeader({ lastSyncText = "3:08:32 PM" }: { lastSyncText?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Your Repositories</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last sync: {lastSyncText}</span>
        </div>
      </div>
      <p className="text-muted-foreground">
        Manage and analyze your GitHub repositories with AI-powered insights
      </p>
    </div>
  );
}

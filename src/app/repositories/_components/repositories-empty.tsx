"use client";

import { GitBranch } from "lucide-react";

export function RepositoriesEmptyState() {
  return (
    <div className="py-12 text-center">
      <GitBranch className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-medium">No repositories found</h3>
      <p className="text-muted-foreground">
        Try adjusting your search criteria or connect more repositories
      </p>
    </div>
  );
}

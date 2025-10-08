"use client";

import { Search, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RepositoriesToolbar(props: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  onRefresh?: () => void;
}) {
  const { searchQuery, onSearchChange, onToggleFilters, onRefresh } = props;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Search repositories by name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onToggleFilters} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

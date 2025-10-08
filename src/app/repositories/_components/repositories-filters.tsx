"use client";

import { X, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

export function RepositoriesFilters(props: {
  languages: string[];
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedVisibility: "all" | "public" | "private";
  onVisibilityChange: (value: "all" | "public" | "private") => void;
  selectedScope: "all" | "owner" | "collaborator" | "organization";
  onScopeChange: (value: "all" | "owner" | "collaborator" | "organization") => void;
  hideForks: boolean;
  onHideForksChange: (value: boolean) => void;
  hideArchived: boolean;
  onHideArchivedChange: (value: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  const {
    languages,
    selectedLanguage,
    onLanguageChange,
    sortBy,
    onSortChange,
    selectedVisibility,
    onVisibilityChange,
    selectedScope,
    onScopeChange,
    hideForks,
    onHideForksChange,
    hideArchived,
    onHideArchivedChange,
    hasActiveFilters,
    onClearFilters,
  } = props;

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-muted/50 p-4 sm:flex-row">
      <div className="flex-1">
        <span className="block font-medium mb-2 text-sm">Programming Language</span>
        <Select onValueChange={onLanguageChange} value={selectedLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((language) => (
              <SelectItem key={language} value={language}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <span className="block font-medium mb-2 text-sm">Sort By</span>
        <Select onValueChange={onSortChange} value={sortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="stars">Stars</SelectItem>
            <SelectItem value="commits">Commits</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <span className="block font-medium mb-2 text-sm">Scope</span>
        <Select onValueChange={onScopeChange} value={selectedScope}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="collaborator">Collaborator</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <span className="block font-medium mb-2 text-sm">Visibility</span>
        <Select onValueChange={onVisibilityChange} value={selectedVisibility}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <span className="block font-medium mb-2 text-sm">Others</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Advanced</span>
              <span className="text-muted-foreground">
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuCheckboxItem
              checked={hideForks}
              onCheckedChange={(v) => onHideForksChange(v === true)}
            >
              Hide forks
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={hideArchived}
              onCheckedChange={(v) => onHideArchivedChange(v === true)}
            >
              Hide archived
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {hasActiveFilters && (
        <div className="flex items-end">
          <Button
            className="flex items-center gap-2"
            onClick={onClearFilters}
            variant="ghost"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

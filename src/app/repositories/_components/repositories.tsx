"use client";

import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
// Define the repository shape used by this page to align with server data
type Repo = {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  commits: { id: string; date: string }[];
  private?: boolean;
  ownerLogin?: string;
  ownerType?: "User" | "Organization";
  fork?: boolean;
  archived?: boolean;
};
import { RepositoryCard } from "./repositories-card";
import { RepositoriesEmptyState } from "./repositories-empty";
import { RepositoriesFilters } from "./repositories-filters";
import { RepositoriesHeader } from "./repositories-header";
import { RepositoriesOverview } from "./repositories-overview";
import { RepositoriesToolbar } from "./repositories-toolbar";

type OverviewStats = {
  totalRepos: number;
  totalCommits: number;
  totalStars: number;
  languagesUsed: number;
  privateRepos: number;
  publicRepos: number;
  avgCommitsPerRepo: number;
  lastUpdated: string;
  mostActiveRepo?: string;
};

export type RepositoriesPageProps = {
  repos: Repo[];
  languages: string[];
  overview: OverviewStats;
  lastSyncText?: string;
  currentUserLogin: string;
};

export default function RepositoriesPage(props: RepositoriesPageProps) {
  const { repos, languages, overview, lastSyncText, currentUserLogin } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<"all" | "public" | "private">("all");
  const [selectedScope, setSelectedScope] = useState<"all" | "owner" | "collaborator" | "organization">("all");
  const [hideForks, setHideForks] = useState<boolean>(false);
  const [hideArchived, setHideArchived] = useState<boolean>(false);

  const filteredRepos = repos.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      selectedLanguage === "all" || repo.language === selectedLanguage;
    const isPrivate = repo.private === true;
    const matchesVisibility =
      selectedVisibility === "all" ||
      (selectedVisibility === "public" && !isPrivate) ||
      (selectedVisibility === "private" && isPrivate);
    const isOwner = repo.ownerLogin === currentUserLogin;
    const isOrg = repo.ownerType === "Organization";
    const matchesScope =
      selectedScope === "all" ||
      (selectedScope === "owner" && isOwner) ||
      (selectedScope === "collaborator" && !isOwner && !isOrg) ||
      (selectedScope === "organization" && isOrg);
    const passesFork = hideForks ? repo.fork !== true : true;
    const passesArchived = hideArchived ? repo.archived !== true : true;
    return (
      matchesSearch &&
      matchesLanguage &&
      matchesVisibility &&
      matchesScope &&
      passesFork &&
      passesArchived
    );
  });

  const sortedRepos = [...filteredRepos].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stars":
        return b.stars - a.stars;
      case "commits":
        return b.commits.length - a.commits.length;
      default:
        return (
          new Date(b.commits[0]?.date || 0).getTime() -
          new Date(a.commits[0]?.date || 0).getTime()
        );
    }
  });

  const totalRepos = overview.totalRepos;
  const totalCommits = overview.totalCommits;
  const totalStars = overview.totalStars;
  const languagesUsed = overview.languagesUsed;
  const privateRepos = overview.privateRepos;
  const publicRepos = overview.publicRepos;
  const avgCommitsPerRepo = overview.avgCommitsPerRepo;
  const lastUpdated = overview.lastUpdated;
  const mostActiveRepoName = overview.mostActiveRepo || "";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSortBy("updated");
    setSelectedVisibility("all");
    setSelectedScope("all");
    setHideForks(false);
    setHideArchived(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedLanguage !== "all" ||
    sortBy !== "updated" ||
    selectedVisibility !== "all" ||
    selectedScope !== "all" ||
    hideForks ||
    hideArchived;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Repositories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Page Header */}
        <RepositoriesHeader lastSyncText={lastSyncText} />

        <RepositoriesOverview
          avgCommitsPerRepo={avgCommitsPerRepo}
          languagesUsed={languagesUsed}
          lastUpdated={lastUpdated}
          mostActiveRepo={mostActiveRepoName}
          privateRepos={privateRepos}
          publicRepos={publicRepos}
          totalCommits={totalCommits}
          totalRepos={totalRepos}
          totalStars={totalStars}
        />

        <div className="mb-8 space-y-4">
          <RepositoriesToolbar
            onSearchChange={setSearchQuery}
            onToggleFilters={() => setShowFilters(!showFilters)}
            searchQuery={searchQuery}
          />

          {showFilters && (
            <RepositoriesFilters
              hasActiveFilters={!!hasActiveFilters}
              languages={languages}
              onClearFilters={clearFilters}
              onLanguageChange={setSelectedLanguage}
              onSortChange={setSortBy}
              selectedVisibility={selectedVisibility}
              onVisibilityChange={(v) => setSelectedVisibility(v)}
              selectedScope={selectedScope}
              onScopeChange={(v) => setSelectedScope(v)}
              hideForks={hideForks}
              onHideForksChange={setHideForks}
              hideArchived={hideArchived}
              onHideArchivedChange={setHideArchived}
              selectedLanguage={selectedLanguage}
              sortBy={sortBy}
            />
          )}

          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span>
              Showing {sortedRepos.length} of {totalRepos} repositories
            </span>
            {hasActiveFilters && <span>Last updated: {lastUpdated}</span>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedRepos.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} />
          ))}
        </div>

        {sortedRepos.length === 0 && <RepositoriesEmptyState />}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { mockRepositories } from "@/lib/mock-data";
import { RepositoriesHeader } from "./repositories-header";
import { RepositoriesOverview } from "./repositories-overview";
import { RepositoriesToolbar } from "./repositories-toolbar";
import { RepositoriesFilters } from "./repositories-filters";
import { RepositoryCard } from "./repositories-card";
import { RepositoriesEmptyState } from "./repositories-empty";

export function RepositoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [showFilters, setShowFilters] = useState(false);

  const filteredRepos = mockRepositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      selectedLanguage === "all" || repo.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const sortedRepos = [...filteredRepos].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stars":
        return b.stars - a.stars;
      case "commits":
        return b.commits.length - a.commits.length;
      case "updated":
      default:
        return (
          new Date(b.commits[0]?.date || 0).getTime() -
          new Date(a.commits[0]?.date || 0).getTime()
        );
    }
  });

  const languages = Array.from(
    new Set(mockRepositories.map((repo) => repo.language))
  );

  const totalRepos = mockRepositories.length;
  const totalCommits = mockRepositories.reduce(
    (sum, repo) => sum + repo.commits.length,
    0
  );
  const totalStars = mockRepositories.reduce(
    (sum, repo) => sum + repo.stars,
    0
  );
  const languagesUsed = languages.length;
  const privateRepos = Math.floor(totalRepos * 0.3); // Mock private repos
  const publicRepos = totalRepos - privateRepos;
  const avgCommitsPerRepo = Math.round(totalCommits / totalRepos);
  const lastUpdated = new Date().toLocaleDateString();
  const mostActiveRepoName =
    [...mockRepositories].sort((a, b) => b.commits.length - a.commits.length)[0]
      ?.name || "";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSortBy("updated");
  };

  const hasActiveFilters =
    searchQuery || selectedLanguage !== "all" || sortBy !== "updated";

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
        <RepositoriesHeader lastSyncText="3:08:32 PM" />

        <RepositoriesOverview
          totalRepos={totalRepos}
          totalCommits={totalCommits}
          totalStars={totalStars}
          languagesUsed={languagesUsed}
          privateRepos={privateRepos}
          publicRepos={publicRepos}
          avgCommitsPerRepo={avgCommitsPerRepo}
          lastUpdated={lastUpdated}
          mostActiveRepo={mostActiveRepoName}
        />

        <div className="space-y-4 mb-8">
          <RepositoriesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {showFilters && (
            <RepositoriesFilters
              languages={languages}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hasActiveFilters={!!hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {sortedRepos.length} of {totalRepos} repositories
            </span>
            {hasActiveFilters && <span>Last updated: 3:09:12 PM</span>}
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

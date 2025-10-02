"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  GitCommit,
  BarChart3,
  Search,
  FileText,
  Users,
  Shield,
  Activity,
  Target,
  GitBranch,
  Settings,
  Calendar,
  Code,
  LinkIcon,
  Github,
  Twitter,
  Linkedin,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
	const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 text-center max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            <GitCommit className="h-4 w-4" />
            GitHub Repository Analysis
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 leading-tight">
            Transform your GitHub workflow with
            <span className="text-primary block">Commit Companion</span>
          </h1>

          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto leading-relaxed">
            Analyze commit history, visualize repository insights, and manage
            your GitHub repositories with powerful filtering and search
            capabilities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button
                size="lg"
                className="text-base px-8 bg-primary hover:bg-primary/90"
              >
                Get started
              </Button>
            </Link>
          </div>

          <div className="flex justify-center mb-16">
            <TooltipProvider>
              <Tooltip open={hoveredAvatar === "nethaiah"}>
                <TooltipTrigger asChild>
                  <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setHoveredAvatar("nethaiah")}
                    onMouseLeave={() => setHoveredAvatar(null)}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-110">
                      <span className="text-2xl font-bold text-primary">N</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-card border shadow-lg p-4 max-w-xs"
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-foreground mb-1">
                      Nethaiah
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Full Stack Developer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Creator of GitHub Commit Companion - a project designed to
                      enhance developer productivity through intelligent
                      repository analysis and commit visualization.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border">
              {/* Light theme image */}
              <Image
                src="/dashboard-light.png"
                alt="GitHub Commit Companion Dashboard - Light Theme"
                width={1200}
                height={800}
                className="w-full h-auto block dark:hidden"
                priority
              />
              {/* Dark theme image */}
              <Image
                src="/dashboard-dark.png"
                alt="GitHub Commit Companion Dashboard - Dark Theme"
                width={1200}
                height={800}
                className="w-full h-auto hidden dark:block"
                priority
              />
              {/* Bottom fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Repository Management */}
        <section className="py-16">
          <div className="text-center mb-12">
            <div className="inline-block text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full mb-4">
              Repository Management
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive GitHub Repository Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect your GitHub repositories and gain powerful insights into
              your development workflow with advanced filtering, search, and
              visualization tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GitBranch className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Repository Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete statistics and insights for all repositories
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <GitCommit className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Commit History Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed commit tracking with filtering and search
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Repository Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage repository configurations and preferences
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Development Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to analyze, understand, and manage your GitHub
              repositories effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              {/* Grid pattern background */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
              <CardContent className="relative p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">
                  Advanced Search & Filtering
                </h3>
                <p className="text-sm text-muted-foreground">
                  Search commits by message, author, or hash with powerful
                  filtering by branch, language, and date.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
              <CardContent className="relative p-6">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">Repository Statistics</h3>
                <p className="text-sm text-muted-foreground">
                  View comprehensive stats including commits, stars, languages,
                  and activity trends.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
              <CardContent className="relative p-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Commit Tagging System</h3>
                <p className="text-sm text-muted-foreground">
                  Organize commits with custom tags and preset categories for
                  better project management.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
              <CardContent className="relative p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Author Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track contributions by author with detailed commit history and
                  activity patterns.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
              <CardContent className="relative p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">File Change Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor file additions, deletions, and modifications across
                  your entire project history.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>
              <CardContent className="relative p-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Timeline Visualization</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your development timeline with chronological commit
                  history and activity patterns.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full mb-4">
                About This Project
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built by Developers, for Developers
              </h2>
              <p className="text-muted-foreground mb-6">
                GitHub Commit Companion is a personal project created by
                Nethaiah, a full-stack developer passionate about improving
                developer workflows. This tool was built to address the need for
                better repository analysis and commit management in modern
                development teams.
              </p>
              <p className="text-muted-foreground mb-8">
                The project showcases modern web development practices using
                Next.js, TypeScript, and Tailwind CSS, while providing practical
                value for developers who want to gain deeper insights into their
                GitHub repositories.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="text-base px-8">
                    Try It Now
                  </Button>
                </Link>
                <Link href="https://github.com/Nethaiah/commitlens">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base px-8 bg-transparent"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    View Source
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Code className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Modern Tech Stack</h3>
                      <p className="text-sm text-muted-foreground">
                        Built with Next.js 14, TypeScript, Tailwind CSS, and
                        modern React patterns for optimal performance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Real GitHub Integration
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Connects directly with GitHub's API to provide real-time
                        repository data and commit analysis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Privacy Focused</h3>
                      <p className="text-sm text-muted-foreground">
                        Your repository data stays secure with read-only access
                        and no data storage on external servers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about GitHub Commit Companion.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left font-semibold">
                  What can I do with GitHub Commit Companion?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can analyze your GitHub repositories, view detailed commit
                  histories, filter commits by author or date, track file
                  changes, manage repository settings, and gain insights into
                  your development patterns. The tool provides comprehensive
                  statistics and visualization for better project management.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left font-semibold">
                  How do I connect my GitHub repositories?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Simply authenticate with your GitHub account through our
                  secure OAuth integration. Once connected, the app will
                  automatically sync your repositories and provide real-time
                  access to your commit data and repository statistics.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left font-semibold">
                  Is my repository data secure and private?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, absolutely. The app only requests read-only access to
                  your repositories and doesn't store your data on external
                  servers. All analysis happens in real-time through GitHub's
                  API, ensuring your code and commit history remain private and
                  secure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left font-semibold">
                  Can I filter and search through my commits?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, the app provides powerful filtering and search
                  capabilities. You can search commits by message, author, or
                  hash, filter by branch, date range, or programming language,
                  and organize commits with custom tags for better project
                  management.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left font-semibold">
                  What technologies were used to build this project?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  GitHub Commit Companion is built with modern web technologies
                  including Next.js 14, TypeScript, Tailwind CSS, and React. It
                  integrates directly with GitHub's REST API and follows current
                  best practices for performance, security, and user experience.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16">
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get notified about new features, updates, and development insights
              from the GitHub Commit Companion project.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 rounded-lg border bg-background"
              />
              <Button className="px-8">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                © 2025 GitHub Commit Companion. All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help
              </Link>
              <Link
                href="/#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link
                  href="https://github.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                </Link>
                <Link
                  href="https://twitter.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </Link>
                <Link
                  href="https://discord.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <Link
                  href="https://linkedin.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { ArrowLeft, GitBranch, Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useState } from "react";
import { githubSignIn } from "../actions";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      await githubSignIn();
      
      toast.success("GitHub sign-in successful! Redirecting...", {
        duration: 3000,
        position: "bottom-right",
      });
    } catch {
      toast.error("GitHub sign-in failed.", {
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Landing Page
            </Button>
          </Link>
        </div>
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Link href="/">
              <GitBranch className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">CommitLens</span>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Connect your GitHub account to get started
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Continue with Github to analyze your repositories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GitHub OAuth Button */}
            <Button
              className="h-12 w-full text-base"
              disabled={isLoading}
              onClick={handleGitHubLogin}
              size="lg"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <Github className="mr-2 h-5 w-5" />
              )}
              Continue with GitHub
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-muted-foreground text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
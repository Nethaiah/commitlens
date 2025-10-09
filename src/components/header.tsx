"use client";

import { GitBranch } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";
import { HeaderSkeleton } from "./header-skeleton";

export function Header() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = [
    { href: "/repositories", label: "Repositories" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  // Show loading skeleton on initial render
  if (!isClient || isPending) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link className="flex items-center gap-2" href="/">
            <GitBranch className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">CommitLens</span>
          </Link>
        </div>

        {session ? (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link href={item.href} key={item.href}>
                  <Button
                    size="sm"
                    variant={pathname === item.href ? "default" : "ghost"}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu
                image={session?.user?.image || "/placeholder.svg"}
                name={session?.user?.name || "User"}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button
                className="bg-primary px-8 text-base hover:bg-primary/90"
                size="lg"
              >
                Get started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

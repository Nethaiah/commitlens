"use client";

import { GitBranch } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const pathname = usePathname();

  const { data: session } = authClient.useSession();

  const navItems = [
    { href: "/repositories", label: "Repositories" },
    { href: "/dashboard", label: "Dashboard" },
  ];

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
                <Link href={item.href as any} key={item.href}>
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
              <UserMenu />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        )}
      </div>
    </header>
  );
}

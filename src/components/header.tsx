"use client";

import { GitBranch, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const navItems = [
    { href: "/repositories", label: "Repositories" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const handleLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully.", {
            duration: 3000,
            position: "bottom-right",
          });
          router.push("/");
        },
        onError: () => {
          toast.error("Failed to sign out. Please try again.", {
            duration: 3000,
            position: "bottom-right",
          });
        },
      },
    });
  };

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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex h-auto items-center gap-2 p-2"
                    variant="ghost"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        alt={session.user?.name || "User"}
                        src={session.user?.image || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {session.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden font-medium text-sm sm:inline">
                      {session.user?.name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link className="flex items-center gap-2" href="/#">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link className="flex items-center gap-2" href="/settings">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

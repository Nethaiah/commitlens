"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, Download } from "lucide-react";
import { ExportModal } from "@/components/export-modal";

export function DashboardHeader() {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Developer Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights into your development productivity patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/repositories">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Repositories
            </Button>
          </Link>
          <Button onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <ExportModal
          type="dashboard"
          trigger={
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          }
        />
      </div>
    </div>
  );
}

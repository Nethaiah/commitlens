"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Loader2 } from "lucide-react"
import type { Commit, Repository } from "@/lib/mock-data"

interface ExportModalProps {
  repository?: Repository
  commits?: Commit[]
  type: "repository" | "commit" | "dashboard"
  trigger?: React.ReactNode
}

export function ExportModal({ repository, commits, type, trigger }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<"markdown" | "pdf" | "png">("markdown")
  const [includeAINotes, setIncludeAINotes] = useState(true)
  const [includeTags, setIncludeTags] = useState(true)
  const [includeStats, setIncludeStats] = useState(true)
  const [customNotes, setCustomNotes] = useState("")

  const handleExport = async () => {
    setIsExporting(true)

    // Mock export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate export content based on type
    let content = ""

    if (type === "repository" && repository) {
      content = generateRepositoryExport(repository, {
        includeAINotes,
        includeTags,
        includeStats,
        customNotes,
      })
    } else if (type === "commit" && commits) {
      content = generateCommitExport(commits, {
        includeAINotes,
        includeTags,
        includeStats,
        customNotes,
      })
    } else if (type === "dashboard") {
      content = generateDashboardExport({
        includeStats,
        customNotes,
      })
    }

    // Create and download file
    if (exportFormat === "png") {
      // Render text content to a simple PNG via canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const padding = 24
      const lineHeight = 20
      const maxWidth = 900
      const lines = [] as string[]
      const words = content.split(/\s+/)
      let line = ""
      const measure = (s: string) => {
        if (!ctx) return 0
        return ctx.measureText(s).width
      }
      canvas.width = maxWidth + padding * 2
      canvas.height = 1200 // provisional height, will expand as needed
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#111827"
      ctx.font = "16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
      for (const w of words) {
        const test = line ? `${line} ${w}` : w
        if (measure(test) > maxWidth) {
          lines.push(line)
          line = w
        } else {
          line = test
        }
      }
      if (line) lines.push(line)
      const neededHeight = padding * 2 + lines.length * lineHeight
      if (neededHeight > canvas.height) {
        const tmp = document.createElement("canvas")
        tmp.width = canvas.width
        tmp.height = neededHeight
        const tctx = tmp.getContext("2d")!
        tctx.fillStyle = "#ffffff"
        tctx.fillRect(0, 0, tmp.width, tmp.height)
        tctx.fillStyle = "#111827"
        tctx.font = ctx.font
        lines.forEach((ln, i) => {
          tctx.fillText(ln, padding, padding + (i + 1) * lineHeight)
        })
        const dataUrl = tmp.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        lines.forEach((ln, i) => {
          ctx.fillText(ln, padding, padding + (i + 1) * lineHeight)
        })
        const dataUrl = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } else {
      const blob = new Blob([content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.${exportFormat === "markdown" ? "md" : "pdf"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    setIsExporting(false)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Export {type === "repository" ? "Repository" : type === "commit" ? "Commit" : "Dashboard"}
          </DialogTitle>
          <DialogDescription>Choose your export options and format</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="markdown"
                  name="format"
                  checked={exportFormat === "markdown"}
                  onChange={() => setExportFormat("markdown")}
                  className="text-primary"
                />
                <Label htmlFor="markdown" className="cursor-pointer">
                  Markdown (.md)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="pdf"
                  name="format"
                  checked={exportFormat === "pdf"}
                  onChange={() => setExportFormat("pdf")}
                  className="text-primary"
                />
                <Label htmlFor="pdf" className="cursor-pointer">
                  PDF (.pdf)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="png"
                  name="format"
                  checked={exportFormat === "png"}
                  onChange={() => setExportFormat("png")}
                  className="text-primary"
                />
                <Label htmlFor="png" className="cursor-pointer">
                  PNG (.png)
                </Label>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Include in Export</Label>
            <div className="space-y-3">
              {(type === "repository" || type === "commit") && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ai-notes"
                      checked={includeAINotes}
                      onCheckedChange={(checked) => setIncludeAINotes(checked as boolean)}
                    />
                    <Label htmlFor="ai-notes" className="cursor-pointer">
                      AI-generated notes
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tags"
                      checked={includeTags}
                      onCheckedChange={(checked) => setIncludeTags(checked as boolean)}
                    />
                    <Label htmlFor="tags" className="cursor-pointer">
                      Tags and categories
                    </Label>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stats"
                  checked={includeStats}
                  onCheckedChange={(checked) => setIncludeStats(checked as boolean)}
                />
                <Label htmlFor="stats" className="cursor-pointer">
                  Statistics and metrics
                </Label>
              </div>
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-2">
            <Label htmlFor="custom-notes">Custom Notes (Optional)</Label>
            <Textarea
              id="custom-notes"
              placeholder="Add any additional notes or context..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <Button onClick={handleExport} disabled={isExporting} className="flex-1">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function generateRepositoryExport(
  repository: Repository,
  options: {
    includeAINotes: boolean
    includeTags: boolean
    includeStats: boolean
    customNotes: string
  },
): string {
  let content = `# ${repository.name}\n\n`
  content += `${repository.description}\n\n`

  if (options.includeStats) {
    content += `## Repository Statistics\n\n`
    content += `- **Language**: ${repository.language}\n`
    content += `- **Stars**: ${repository.stars}\n`
    content += `- **Total Commits**: ${repository.commits.length}\n`
    content += `- **Contributors**: ${new Set(repository.commits.map((c) => c.author)).size}\n\n`
  }

  content += `## Commit History\n\n`
  repository.commits.forEach((commit) => {
    content += `### ${commit.hash} - ${commit.message}\n\n`
    content += `- **Author**: ${commit.author}\n`
    content += `- **Date**: ${new Date(commit.date).toLocaleDateString()}\n`
    content += `- **Changes**: +${commit.additions} -${commit.deletions}\n`
    content += `- **Files**: ${commit.files.join(", ")}\n`

    if (options.includeTags && commit.tags.length > 0) {
      content += `- **Tags**: ${commit.tags.join(", ")}\n`
    }

    if (options.includeAINotes && commit.aiNote) {
      content += `\n**AI Analysis**: ${commit.aiNote}\n`
    }

    content += `\n---\n\n`
  })

  if (options.customNotes) {
    content += `## Additional Notes\n\n${options.customNotes}\n\n`
  }

  content += `---\n*Exported from GitHub Commit Companion on ${new Date().toLocaleDateString()}*`

  return content
}

function generateCommitExport(
  commits: Commit[],
  options: {
    includeAINotes: boolean
    includeTags: boolean
    includeStats: boolean
    customNotes: string
  },
): string {
  let content = `# Commit Export\n\n`

  if (options.includeStats) {
    const totalAdditions = commits.reduce((sum, c) => sum + c.additions, 0)
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0)
    const totalFiles = new Set(commits.flatMap((c) => c.files)).size

    content += `## Summary Statistics\n\n`
    content += `- **Total Commits**: ${commits.length}\n`
    content += `- **Total Additions**: ${totalAdditions}\n`
    content += `- **Total Deletions**: ${totalDeletions}\n`
    content += `- **Files Modified**: ${totalFiles}\n\n`
  }

  commits.forEach((commit) => {
    content += `## ${commit.hash} - ${commit.message}\n\n`
    content += `- **Author**: ${commit.author}\n`
    content += `- **Date**: ${new Date(commit.date).toLocaleDateString()}\n`
    content += `- **Changes**: +${commit.additions} -${commit.deletions}\n`

    if (options.includeTags && commit.tags.length > 0) {
      content += `- **Tags**: ${commit.tags.join(", ")}\n`
    }

    if (options.includeAINotes && commit.aiNote) {
      content += `\n**AI Analysis**: ${commit.aiNote}\n`
    }

    content += `\n### Code Changes\n\n`
    content += "```diff\n"
    content += commit.diff
    content += "\n```\n\n"

    content += `---\n\n`
  })

  if (options.customNotes) {
    content += `## Additional Notes\n\n${options.customNotes}\n\n`
  }

  content += `---\n*Exported from GitHub Commit Companion on ${new Date().toLocaleDateString()}*`

  return content
}

function generateDashboardExport(options: {
  includeStats: boolean
  customNotes: string
}): string {
  let content = `# Developer Dashboard Export\n\n`

  if (options.includeStats) {
    content += `## Development Statistics\n\n`
    content += `- **Total Commits**: 1,247\n`
    content += `- **Active Repositories**: 23\n`
    content += `- **Current Streak**: 15 days\n`
    content += `- **Average Daily Commits**: 3.4\n\n`

    content += `## Language Distribution\n\n`
    content += `- TypeScript: 45%\n`
    content += `- Python: 30%\n`
    content += `- Go: 15%\n`
    content += `- JavaScript: 10%\n\n`

    content += `## Weekly Activity\n\n`
    content += `- Monday: 12 commits\n`
    content += `- Tuesday: 8 commits\n`
    content += `- Wednesday: 15 commits\n`
    content += `- Thursday: 22 commits\n`
    content += `- Friday: 18 commits\n`
    content += `- Saturday: 5 commits\n`
    content += `- Sunday: 3 commits\n\n`
  }

  if (options.customNotes) {
    content += `## Additional Notes\n\n${options.customNotes}\n\n`
  }

  content += `---\n*Exported from GitHub Commit Companion on ${new Date().toLocaleDateString()}*`

  return content
}

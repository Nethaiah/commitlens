import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { insight } from "@/db/schema";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-pro";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rangeKey = url.searchParams.get("range") ?? "1y";
  const repo = url.searchParams.get("repo") ?? "All Repositories";
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await db
      .select()
      .from(insight)
      .where(and(eq(insight.userId, session.user.id), eq(insight.rangeKey, rangeKey), eq(insight.repo, repo)))
      .limit(1);
    if (!rows.length) return NextResponse.json({ notFound: true }, { status: 404 });
    const d: any = rows[0].data as any;
    if (Array.isArray(d?.paragraphs)) {
      return NextResponse.json(d);
    }
    if (
      typeof d?.peakPerformance === "string" &&
      typeof d?.avgCommitsOnPeak === "number" &&
      typeof d?.languageFocus === "string" &&
      typeof d?.languageFocusPercentage === "number" &&
      typeof d?.consistencyStreak === "number" &&
      typeof d?.consistencyRecord === "number"
    ) {
      const paragraphs = [
        `Your most productive day tends to be ${d.peakPerformance}, averaging ${d.avgCommitsOnPeak} commits on that day.`,
        `${d.languageFocus} is your most used language at ${d.languageFocusPercentage}%.`,
        `You're currently on a ${d.consistencyStreak}-day streak. Your best streak so far is ${d.consistencyRecord} days.`,
      ];
      return NextResponse.json({ paragraphs });
    }
    return NextResponse.json({ notFound: true }, { status: 404 });
  } catch {
    // If table doesn't exist or DB error, treat as cache miss
    return NextResponse.json({ notFound: true }, { status: 404 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const key = process.env.GEMINI_API_KEY ?? process.env.GEMINI_GEN_AI_KEY;
    const body = (await req.json()) as {
      rangeKey: string;
      repo: string;
      countMode?: "all" | "contrib";
      overview: {
        totalCommits: number;
        activeDays: number;
        currentStreak: number;
        longestStreak: number;
        avgCommitsPerDay: number;
      };
      languages: Array<{ name: string; percentage: number; commits: number }>;
      contributionWeeks: Array<{
        firstDay: string;
        days: Array<{ date: string; count: number; weekday: number }>;
      }>;
    };

    if (!key) {
      // Graceful fallback if no key is configured
      const topLang = body.languages[0]?.name ?? "Unknown";
      const topPct = body.languages[0]?.percentage ?? 0;
      const consistencyRecord = body.overview.longestStreak ?? 0;
      const consistencyStreak = body.overview.currentStreak ?? 0;
      const lastWeek = body.contributionWeeks.at(-1);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
      let peakIdx = 0;
      let peakVal = 0;
      if (lastWeek) {
        for (const d of lastWeek.days) {
          if (d.count >= peakVal) {
            peakVal = d.count;
            peakIdx = ((d.weekday % 7) + 7) % 7;
          }
        }
      }
      const paragraphs: string[] = [];
      paragraphs.push(
        body.repo === "All Repositories"
          ? `Across all repositories, you average ${body.overview.avgCommitsPerDay.toFixed(2)} commits/day with ${body.overview.totalCommits} total commits and ${body.overview.activeDays} active days.`
          : `In ${body.repo}, you average ${body.overview.avgCommitsPerDay.toFixed(2)} commits/day with ${body.overview.totalCommits} commits.`
      );
      paragraphs.push(
        `Your most productive day tends to be ${dayNames[peakIdx]}, averaging ${peakVal} commits. ${topLang} is the dominant language at ${topPct}%.`
      );
      paragraphs.push(
        `You're on a ${consistencyStreak}-day streak; your record is ${consistencyRecord} days. Keep momentum to set a new high.`
      );
      if (body.countMode) {
        paragraphs.push(
          body.countMode === "all"
            ? `Counting mode is set to All Authored Commits, which includes commits that may not count toward GitHub contributions (e.g., work on forks or non-default branches).`
            : `Counting mode is set to Contributions, matching GitHub’s contribution rules (default branch or gh-pages, merged PRs).`
        );
      }
      const payload = { paragraphs } as const;
      try {
        await db.delete(insight).where(and(eq(insight.userId, session.user.id), eq(insight.rangeKey, body.rangeKey), eq(insight.repo, body.repo)));
        await db.insert(insight).values({ userId: session.user.id, rangeKey: body.rangeKey, repo: body.repo, data: payload });
      } catch {}
      return NextResponse.json(payload);
    }

    const prompt = buildPrompt(body);
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const text = (response as any).text as string | undefined;
    if (!text) return NextResponse.json({ error: "Empty response from Gemini" }, { status: 500 });
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/^```json\n?|```$/g, "");
      parsed = JSON.parse(cleaned);
    }

    try {
      await db.delete(insight).where(and(eq(insight.userId, session.user.id), eq(insight.rangeKey, body.rangeKey), eq(insight.repo, body.repo)));
      await db.insert(insight).values({ userId: session.user.id, rangeKey: body.rangeKey, repo: body.repo, data: parsed as any });
    } catch {}

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function buildPrompt(input: {
  repo?: string;
  countMode?: "all" | "contrib";
  overview: {
    totalCommits: number;
    activeDays: number;
    currentStreak: number;
    longestStreak: number;
    avgCommitsPerDay: number;
  };
  languages: Array<{ name: string; percentage: number; commits: number }>;
  contributionWeeks: Array<{
    firstDay: string;
    days: Array<{ date: string; count: number; weekday: number }>;
  }>;
}) {
  const summary = JSON.stringify(input, null, 0);
  return `You are an assistant that writes concise, paragraph-based developer productivity insights.
Use the provided JSON to produce 2-4 short paragraphs that summarize:
- Overall activity and commit volume for the selected repository (or all repositories).
- Peak performance day and its average commits.
- Language focus (dominant language and its percentage).
- Consistency (current streak and record).
If countMode is provided, include a brief note about how this counting mode affects interpretation (e.g., All Authored vs Contributions).

Return ONLY a JSON object:
{
  "paragraphs": ["<paragraph1>", "<paragraph2>", "<paragraph3>"]
}

Rules:
- No extra commentary.
- Keep paragraphs concise and non-repetitive.
- If data is insufficient, infer best effort from recent weeks.

Data:
${summary}`;
}

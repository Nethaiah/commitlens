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
    return NextResponse.json(rows[0].data);
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
      // compute peak day from last week of contributions
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
      const payload = {
        peakPerformance: dayNames[peakIdx],
        avgCommitsOnPeak: peakVal,
        languageFocus: topLang,
        languageFocusPercentage: topPct,
        consistencyStreak,
        consistencyRecord,
      } as const;
      // Best-effort persist
      try {
        await db.delete(insight).where(and(eq(insight.userId, session.user.id), eq(insight.rangeKey, body.rangeKey), eq(insight.repo, body.repo)));
        await db.insert(insight).values({ userId: session.user.id, rangeKey: body.rangeKey, repo: body.repo, data: payload });
      } catch {
        // ignore DB errors
      }
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

    // Best-effort persist
    try {
      await db.delete(insight).where(and(eq(insight.userId, session.user.id), eq(insight.rangeKey, body.rangeKey), eq(insight.repo, body.repo)));
      await db.insert(insight).values({ userId: session.user.id, rangeKey: body.rangeKey, repo: body.repo, data: parsed as any });
    } catch {
      // ignore DB errors
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

function buildPrompt(input: {
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
  return `You are an assistant that writes concise data-driven developer productivity insights.
Use the provided JSON to compute:
- Peak Performance: which weekday tends to have the highest commit counts across recent data; provide the weekday name and average commits that day.
- Language Focus: the most dominant programming language and its percentage from the languages distribution provided.
- Consistency: the user's current streak and their historical best streak from overview.

Return ONLY a JSON object with the exact fields:
{
  "peakPerformance": "<Weekday>",
  "avgCommitsOnPeak": <number>,
  "languageFocus": "<Language>",
  "languageFocusPercentage": <number>,
  "consistencyStreak": <number>,
  "consistencyRecord": <number>
}

Rules:
- No extra commentary.
- Keep numbers integers.
- If data is insufficient, infer best effort from the most recent week.

Data:
${summary}`;
}

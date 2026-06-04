import { NextRequest, NextResponse } from "next/server";

export interface PsiMetric {
  id: string;
  title: string;
  displayValue: string;
  score: number | null;
  numericValue?: number;
}

export interface PsiAudit {
  id: string;
  title: string;
  description: string;
  displayValue?: string;
  score: number | null;
  savingsMs?: number;
  savingsBytes?: number;
}

export interface FieldMetric {
  value: number;
  category: "FAST" | "AVERAGE" | "SLOW";
}

export interface PageSpeedResult {
  url: string;
  finalUrl: string;
  strategy: "mobile" | "desktop";
  fetchTime: string;
  performanceScore: number;
  metrics: {
    fcp: PsiMetric;
    si: PsiMetric;
    lcp: PsiMetric;
    tbt: PsiMetric;
    cls: PsiMetric;
    tti: PsiMetric;
    ttfb?: PsiMetric;
  };
  opportunities: PsiAudit[];
  diagnostics: PsiAudit[];
  fieldData?: {
    fcp?: FieldMetric;
    lcp?: FieldMetric;
    cls?: FieldMetric;
    fid?: FieldMetric;
    inp?: FieldMetric;
    overallCategory?: string;
  };
}

function extractMetric(audits: Record<string, unknown>, key: string): PsiMetric {
  const a = audits[key] as Record<string, unknown> | undefined;
  if (!a) return { id: key, title: key, displayValue: "N/A", score: null };
  return {
    id: key,
    title: (a.title as string) ?? key,
    displayValue: (a.displayValue as string) ?? "N/A",
    score: typeof a.score === "number" ? a.score : null,
    numericValue: typeof a.numericValue === "number" ? a.numericValue : undefined,
  };
}

function extractOpportunities(audits: Record<string, unknown>, ids: string[]): PsiAudit[] {
  return ids
    .map(id => {
      const a = audits[id] as Record<string, unknown> | undefined;
      if (!a || (typeof a.score === "number" && a.score >= 0.9)) return null;
      const details = a.details as Record<string, unknown> | undefined;
      return {
        id,
        title: (a.title as string) ?? id,
        description: (a.description as string) ?? "",
        displayValue: (a.displayValue as string) ?? undefined,
        score: typeof a.score === "number" ? a.score : null,
        savingsMs: typeof details?.overallSavingsMs === "number" ? details.overallSavingsMs : undefined,
        savingsBytes: typeof details?.overallSavingsBytes === "number" ? details.overallSavingsBytes : undefined,
      } satisfies PsiAudit;
    })
    .filter(Boolean) as PsiAudit[];
}

export async function POST(req: NextRequest) {
  let url: string;
  let strategy: "mobile" | "desktop" = "mobile";
  try {
    ({ url, strategy = "mobile" } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  try { new URL(url); } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const apiKey = process.env.PAGESPEED_API_KEY ?? "";
  const psiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(url)}` +
    `&strategy=${strategy}` +
    `&category=performance` +
    (apiKey ? `&key=${apiKey}` : "");

  let psiRes: Response;
  try {
    psiRes = await fetch(psiUrl, { signal: AbortSignal.timeout(30000) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      return NextResponse.json({ error: "PageSpeed Insights timed out — try again in a moment." }, { status: 504 });
    }
    return NextResponse.json({ error: `Request failed: ${msg}` }, { status: 502 });
  }

  if (!psiRes.ok) {
    const body = await psiRes.json().catch(() => ({})) as Record<string, unknown>;
    const msg = (body?.error as Record<string, unknown>)?.message as string | undefined;
    if (psiRes.status === 429) {
      return NextResponse.json({ error: "PageSpeed Insights rate limit hit — try again in a few seconds." }, { status: 429 });
    }
    return NextResponse.json({ error: msg ?? `PageSpeed Insights returned ${psiRes.status}` }, { status: psiRes.status });
  }

  const data = await psiRes.json() as Record<string, unknown>;
  const lr = data.lighthouseResult as Record<string, unknown>;
  const audits = (lr?.audits ?? {}) as Record<string, unknown>;
  const categories = (lr?.categories ?? {}) as Record<string, unknown>;
  const perfScore = Math.round(((categories.performance as Record<string, unknown>)?.score as number ?? 0) * 100);

  const metrics: PageSpeedResult["metrics"] = {
    fcp:  extractMetric(audits, "first-contentful-paint"),
    si:   extractMetric(audits, "speed-index"),
    lcp:  extractMetric(audits, "largest-contentful-paint"),
    tbt:  extractMetric(audits, "total-blocking-time"),
    cls:  extractMetric(audits, "cumulative-layout-shift"),
    tti:  extractMetric(audits, "interactive"),
    ttfb: extractMetric(audits, "server-response-time"),
  };

  const opportunities = extractOpportunities(audits, [
    "render-blocking-resources",
    "unused-css-rules",
    "unused-javascript",
    "uses-optimized-images",
    "uses-webp-images",
    "uses-text-compression",
    "uses-long-cache-ttl",
    "efficient-animated-content",
    "uses-responsive-images",
    "preload-lcp-image",
    "uses-rel-preconnect",
    "font-display",
  ]);

  const diagnostics = extractOpportunities(audits, [
    "dom-size",
    "critical-request-chains",
    "network-requests",
    "network-rtt",
    "network-server-latency",
    "main-thread-tasks",
    "bootup-time",
    "third-party-summary",
    "no-document-write",
    "uses-passive-event-listeners",
    "image-alt",
    "link-text",
  ]);

  const le = data.loadingExperience as Record<string, unknown> | undefined;
  const leMetrics = (le?.metrics ?? {}) as Record<string, unknown>;

  function fieldMetric(key: string): FieldMetric | undefined {
    const m = leMetrics[key] as Record<string, unknown> | undefined;
    if (!m || typeof m.percentile !== "number") return undefined;
    return { value: m.percentile as number, category: m.category as FieldMetric["category"] };
  }

  const fieldData: PageSpeedResult["fieldData"] = {
    fcp: fieldMetric("FIRST_CONTENTFUL_PAINT_MS"),
    lcp: fieldMetric("LARGEST_CONTENTFUL_PAINT_MS"),
    cls: fieldMetric("CUMULATIVE_LAYOUT_SHIFT_SCORE"),
    fid: fieldMetric("FIRST_INPUT_DELAY_MS"),
    inp: fieldMetric("INTERACTION_TO_NEXT_PAINT"),
    overallCategory: le?.overall_category as string | undefined,
  };

  return NextResponse.json({
    url,
    finalUrl: (data.id as string) ?? url,
    strategy,
    fetchTime: (lr?.fetchTime as string) ?? new Date().toISOString(),
    performanceScore: perfScore,
    metrics,
    opportunities,
    diagnostics,
    fieldData: Object.values(fieldData).some(Boolean) ? fieldData : undefined,
  } satisfies PageSpeedResult);
}

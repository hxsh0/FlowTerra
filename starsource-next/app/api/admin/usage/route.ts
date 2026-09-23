import { NextResponse } from "next/server";
import { getApiUsage, type ApiService } from "@/lib/api-usage-store";
import type { AdminUsageResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = getApiUsage();

  const summary: AdminUsageResponse["summary"] = {
    google_places: { calls: 0, estimatedCostUsd: 0 },
    anthropic: { calls: 0, estimatedCostUsd: 0 },
    resend: { calls: 0, estimatedCostUsd: 0 },
  };

  for (const e of entries) {
    const key = e.service as ApiService;
    summary[key].calls += 1;
    summary[key].estimatedCostUsd += e.estimatedCostUsd;
  }

  const totalEstimatedCostUsd = Object.values(summary).reduce((sum, s) => sum + s.estimatedCostUsd, 0);
  const recent = entries.slice(-50).reverse();

  const response: AdminUsageResponse = { summary, totalEstimatedCostUsd, recent };
  return NextResponse.json(response);
}

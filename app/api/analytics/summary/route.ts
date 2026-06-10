import { getSummary } from "@/lib/analytics-store";
import { isAnalyticsUserAllowed } from "@/lib/analytics-access";

export async function GET(req: Request) {
  try {
    const requesterEmail = req.headers.get("x-analytics-user");
    if (!isAnalyticsUserAllowed(requesterEmail)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    const summary = await getSummary(from, to);
    return Response.json(summary);
  } catch {
    return Response.json({ error: "Unable to fetch analytics summary." }, { status: 500 });
  }
}

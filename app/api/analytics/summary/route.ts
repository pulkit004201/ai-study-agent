import { getSummary } from "@/lib/analytics-store";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    const summary = await getSummary(from, to);
    return Response.json(summary);
  } catch {
    return Response.json({ error: "Unable to fetch analytics summary." }, { status: 500 });
  }
}

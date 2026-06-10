import { getUserHistory } from "@/lib/user-history-store";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = Number(url.searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(200, Math.floor(limitParam)))
      : 50;

    const rows = await getUserHistory(limit);
    return Response.json({ rows });
  } catch {
    return Response.json({ error: "Unable to fetch user history." }, { status: 500 });
  }
}

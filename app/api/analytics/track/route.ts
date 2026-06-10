import { appendEvent } from "@/lib/analytics-store";
import type { AnalyticsModule } from "@/lib/analytics-store";

type TrackPayload = {
  type: "login" | "module_access" | "module_session";
  userId: string;
  module?: AnalyticsModule;
  durationMs?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TrackPayload;

    if (!body?.type || !body?.userId) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    if ((body.type === "module_access" || body.type === "module_session") && !body.module) {
      return Response.json({ error: "Module is required for module access events." }, { status: 400 });
    }

    if (body.type === "module_session" && typeof body.durationMs !== "number") {
      return Response.json({ error: "durationMs is required for module_session events." }, { status: 400 });
    }

    await appendEvent({
      id: crypto.randomUUID(),
      type: body.type,
      userId: body.userId,
      module: body.module,
      durationMs: body.durationMs,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to track analytics event." }, { status: 500 });
  }
}

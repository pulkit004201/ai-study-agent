import { appendEvent, AnalyticsModule } from "@/lib/analytics-store";

type TrackPayload = {
  type: "login" | "module_access";
  userId: string;
  module?: AnalyticsModule;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TrackPayload;

    if (!body?.type || !body?.userId) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (body.type === "module_access" && !body.module) {
      return Response.json({ error: "Module is required for module access events." }, { status: 400 });
    }

    await appendEvent({
      id: crypto.randomUUID(),
      type: body.type,
      userId: body.userId,
      module: body.module,
      timestamp: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to track analytics event." }, { status: 500 });
  }
}

import { recordUserLogin } from "@/lib/user-history-store";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; name?: string };
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() ?? "";

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    await recordUserLogin(email, name);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to record login." }, { status: 500 });
  }
}

import type { AnalyticsModule } from "@/lib/analytics-store";

function getOrCreateUserId() {
  if (typeof window === "undefined") return "server";

  const email = localStorage.getItem("userEmail")?.trim();
  if (email) return email.toLowerCase();

  const anonKey = "analyticsAnonUserId";
  const existing = localStorage.getItem(anonKey);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `anon-${crypto.randomUUID()}`
      : `anon-${Date.now()}`;

  localStorage.setItem(anonKey, next);
  return next;
}

async function sendEvent(payload: {
  type: "login" | "module_access" | "module_session";
  module?: AnalyticsModule;
  durationMs?: number;
}) {
  if (typeof window === "undefined") return;

  const userId = getOrCreateUserId();
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ ...payload, userId }),
    });
  } catch {
    // Ignore analytics failures to avoid affecting UX.
  }
}

export function trackLogin(email: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem("userEmail", email.trim().toLowerCase());
  sendEvent({ type: "login" });
}

export function trackModuleAccess(module: AnalyticsModule) {
  sendEvent({ type: "module_access", module });
}

export function trackModuleSession(module: AnalyticsModule, durationMs: number) {
  const safeDuration = Math.max(0, Math.round(durationMs));
  sendEvent({ type: "module_session", module, durationMs: safeDuration });
}

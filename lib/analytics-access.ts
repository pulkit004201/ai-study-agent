export const ANALYTICS_ALLOWED_USERS = [
  "pulkit004201@gmail.com",
  "pulkit.jain@pristyncare.com",
] as const;

export function isAnalyticsUserAllowed(userEmail: string | null | undefined) {
  if (!userEmail) return false;
  const normalized = userEmail.trim().toLowerCase();
  return ANALYTICS_ALLOWED_USERS.includes(
    normalized as (typeof ANALYTICS_ALLOWED_USERS)[number]
  );
}

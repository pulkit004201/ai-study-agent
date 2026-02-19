import { promises as fs } from "fs";
import path from "path";

export type AnalyticsModule = "learn" | "quiz" | "visualize";

export type AnalyticsEvent = {
  id: string;
  type: "login" | "module_access";
  userId: string;
  module?: AnalyticsModule;
  timestamp: string;
};

const STORE_PATH = path.join(process.cwd(), "data", "analytics-events.json");

let memoryStore: AnalyticsEvent[] = [];

async function readFromDisk(): Promise<AnalyticsEvent[] | null> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return null;
  }
}

async function writeToDisk(events: AnalyticsEvent[]) {
  try {
    await fs.writeFile(STORE_PATH, JSON.stringify(events, null, 2), "utf8");
  } catch {
    // On some environments (e.g., read-only deployments) disk writes can fail.
    // We still keep in-memory events so the app remains functional.
  }
}

export async function getAllEvents() {
  const disk = await readFromDisk();
  if (disk) {
    memoryStore = disk;
    return disk;
  }
  return memoryStore;
}

export async function appendEvent(event: AnalyticsEvent) {
  const events = await getAllEvents();
  const updated = [...events, event];
  memoryStore = updated;
  await writeToDisk(updated);
}

function parseDateBoundary(input: string, endOfDay: boolean) {
  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const parsed = new Date(`${input}${suffix}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function getSummary(from?: string, to?: string) {
  const events = await getAllEvents();

  const fromDate = from ? parseDateBoundary(from, false) : null;
  const toDate = to ? parseDateBoundary(to, true) : null;

  const filtered = events.filter((event) => {
    const time = new Date(event.timestamp).getTime();
    if (Number.isNaN(time)) return false;

    if (fromDate && time < fromDate.getTime()) return false;
    if (toDate && time > toDate.getTime()) return false;
    return true;
  });

  const uniqueLoggedInUsers = new Set(
    filtered.filter((e) => e.type === "login").map((e) => e.userId)
  ).size;

  const uniqueQuizUsers = new Set(
    filtered
      .filter((e) => e.type === "module_access" && e.module === "quiz")
      .map((e) => e.userId)
  ).size;

  const uniqueLearnUsers = new Set(
    filtered
      .filter((e) => e.type === "module_access" && e.module === "learn")
      .map((e) => e.userId)
  ).size;

  const uniqueVisualizeUsers = new Set(
    filtered
      .filter((e) => e.type === "module_access" && e.module === "visualize")
      .map((e) => e.userId)
  ).size;

  return {
    from: from ?? null,
    to: to ?? null,
    uniqueLoggedInUsers,
    uniqueQuizUsers,
    uniqueLearnUsers,
    uniqueVisualizeUsers,
    totalEvents: filtered.length,
  };
}

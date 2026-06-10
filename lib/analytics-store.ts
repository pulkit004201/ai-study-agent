import { sql } from "@vercel/postgres";
import { promises as fs } from "fs";
import path from "path";

export type AnalyticsModule =
  | "dashboard"
  | "learn"
  | "quiz"
  | "visualize"
  | "movies"
  | "case_studies"
  | "analytics";

export type AnalyticsEvent = {
  id: string;
  type: "login" | "module_access" | "module_session";
  userId: string;
  module?: AnalyticsModule;
  durationMs?: number;
  timestamp: string;
};

type SectionStats = {
  uniqueUsers: number;
  accessEvents: number;
  sessionEvents: number;
  totalTimeMs: number;
  avgSessionSec: number;
};

type UserBreakdown = {
  userId: string;
  totalEvents: number;
  totalTimeMs: number;
  avgSessionSec: number;
  lastActiveAt: string | null;
  sections: Record<AnalyticsModule, SectionStats>;
};

const MODULES: AnalyticsModule[] = [
  "dashboard",
  "learn",
  "quiz",
  "visualize",
  "movies",
  "case_studies",
  "analytics",
];

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "analytics-events.json");
let schemaInitPromise: Promise<void> | null = null;
let memoryStore: AnalyticsEvent[] = [];

function createEmptySectionStats(): SectionStats {
  return {
    uniqueUsers: 0,
    accessEvents: 0,
    sessionEvents: 0,
    totalTimeMs: 0,
    avgSessionSec: 0,
  };
}

function createEmptySections(): Record<AnalyticsModule, SectionStats> {
  return {
    dashboard: createEmptySectionStats(),
    learn: createEmptySectionStats(),
    quiz: createEmptySectionStats(),
    visualize: createEmptySectionStats(),
    movies: createEmptySectionStats(),
    case_studies: createEmptySectionStats(),
    analytics: createEmptySectionStats(),
  };
}

function hasPostgresConfig() {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING
  );
}

async function readLocalEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    memoryStore = parsed;
    return parsed;
  } catch {
    return memoryStore;
  }
}

async function writeLocalEvents(events: AnalyticsEvent[]) {
  memoryStore = events;
  try {
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(events, null, 2), "utf8");
  } catch {
    // ignore local write errors
  }
}

async function ensureSchema() {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      await sql`
        create table if not exists analytics_events (
          id uuid primary key,
          event_type text not null,
          user_id text not null,
          module text,
          duration_ms integer,
          created_at timestamptz not null default now()
        )
      `;

      await sql`
        alter table analytics_events
        add column if not exists duration_ms integer
      `;

      await sql`
        alter table analytics_events
        drop constraint if exists analytics_events_event_type_check
      `;

      await sql`
        alter table analytics_events
        add constraint analytics_events_event_type_check
        check (event_type in ('login', 'module_access', 'module_session'))
      `;

      await sql`
        alter table analytics_events
        drop constraint if exists analytics_events_module_check
      `;

      await sql`
        alter table analytics_events
        add constraint analytics_events_module_check
        check (module is null or module in ('dashboard', 'learn', 'quiz', 'visualize', 'movies', 'case_studies', 'analytics'))
      `;

      await sql`
        create index if not exists idx_analytics_created_at
        on analytics_events(created_at)
      `;

      await sql`
        create index if not exists idx_analytics_user
        on analytics_events(user_id)
      `;

      await sql`
        create index if not exists idx_analytics_module
        on analytics_events(module)
      `;

      await sql`
        create index if not exists idx_analytics_event_type
        on analytics_events(event_type)
      `;
    })();
  }

  await schemaInitPromise;
}

function parseDateBoundary(input: string, endOfDay: boolean) {
  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const parsed = new Date(`${input}${suffix}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

async function getFilteredEvents(from?: string, to?: string): Promise<AnalyticsEvent[]> {
  const fromDate = from ? parseDateBoundary(from, false) : null;
  const toDate = to ? parseDateBoundary(to, true) : null;

  if (!hasPostgresConfig()) {
    const local = await readLocalEvents();
    return local.filter((event) => {
      const t = new Date(event.timestamp).getTime();
      if (Number.isNaN(t)) return false;
      if (fromDate && t < fromDate.getTime()) return false;
      if (toDate && t > toDate.getTime()) return false;
      return true;
    });
  }

  await ensureSchema();

  const res = await sql<{
    id: string;
    event_type: AnalyticsEvent["type"];
    user_id: string;
    module: AnalyticsModule | null;
    duration_ms: number | null;
    created_at: string;
  }>`
    select id, event_type, user_id, module, duration_ms, created_at
    from analytics_events
    where (${fromDate ? fromDate.toISOString() : null}::timestamptz is null or created_at >= ${fromDate ? fromDate.toISOString() : null}::timestamptz)
      and (${toDate ? toDate.toISOString() : null}::timestamptz is null or created_at <= ${toDate ? toDate.toISOString() : null}::timestamptz)
    order by created_at desc
  `;

  return res.rows.map((row) => ({
    id: row.id,
    type: row.event_type,
    userId: row.user_id,
    module: row.module ?? undefined,
    durationMs: row.duration_ms ?? undefined,
    timestamp: row.created_at,
  }));
}

export async function appendEvent(event: AnalyticsEvent) {
  if (!hasPostgresConfig()) {
    const local = await readLocalEvents();
    await writeLocalEvents([...local, event]);
    return;
  }

  await ensureSchema();

  await sql`
    insert into analytics_events (id, event_type, user_id, module, duration_ms, created_at)
    values (
      ${event.id}::uuid,
      ${event.type},
      ${event.userId},
      ${event.module ?? null},
      ${typeof event.durationMs === "number" ? event.durationMs : null},
      ${new Date(event.timestamp).toISOString()}::timestamptz
    )
  `;
}

export async function getSummary(from?: string, to?: string) {
  const filtered = await getFilteredEvents(from, to);

  const sections: Record<AnalyticsModule, SectionStats> = createEmptySections();
  const userStatsMap = new Map<
    string,
    {
      totalEvents: number;
      totalTimeMs: number;
      sessionEvents: number;
      lastActiveAt: string | null;
      sections: Record<AnalyticsModule, SectionStats>;
    }
  >();

  const sectionUserSets: Record<AnalyticsModule, Set<string>> = {
    dashboard: new Set(),
    learn: new Set(),
    quiz: new Set(),
    visualize: new Set(),
    movies: new Set(),
    case_studies: new Set(),
    analytics: new Set(),
  };

  for (const event of filtered) {
    if (!userStatsMap.has(event.userId)) {
      userStatsMap.set(event.userId, {
        totalEvents: 0,
        totalTimeMs: 0,
        sessionEvents: 0,
        lastActiveAt: null,
        sections: createEmptySections(),
      });
    }

    const userStats = userStatsMap.get(event.userId);
    if (userStats) {
      userStats.totalEvents += 1;
      if (
        !userStats.lastActiveAt ||
        new Date(event.timestamp).getTime() > new Date(userStats.lastActiveAt).getTime()
      ) {
        userStats.lastActiveAt = event.timestamp;
      }
    }

    if (!event.module || !MODULES.includes(event.module)) continue;

    sectionUserSets[event.module].add(event.userId);
    if (userStats) {
      userStats.sections[event.module].uniqueUsers = 1;
    }

    if (event.type === "module_access") {
      sections[event.module].accessEvents += 1;
      if (userStats) {
        userStats.sections[event.module].accessEvents += 1;
      }
    }

    if (event.type === "module_session") {
      const duration = Math.max(0, event.durationMs ?? 0);
      sections[event.module].sessionEvents += 1;
      sections[event.module].totalTimeMs += duration;
      if (userStats) {
        userStats.sessionEvents += 1;
        userStats.totalTimeMs += duration;
        userStats.sections[event.module].sessionEvents += 1;
        userStats.sections[event.module].totalTimeMs += duration;
      }
    }
  }

  for (const moduleName of MODULES) {
    sections[moduleName].uniqueUsers = sectionUserSets[moduleName].size;
    sections[moduleName].avgSessionSec =
      sections[moduleName].sessionEvents === 0
        ? 0
        : Math.round(
            sections[moduleName].totalTimeMs /
              sections[moduleName].sessionEvents /
              1000
          );
  }

  const uniqueLoggedInUsers = new Set(
    filtered.filter((e) => e.type === "login").map((e) => e.userId)
  ).size;

  const uniqueTrackedUsers = new Set(filtered.map((e) => e.userId)).size;

  const totalActiveTimeMs = MODULES.reduce(
    (sum, moduleName) => sum + sections[moduleName].totalTimeMs,
    0
  );

  const totalSessionEvents = MODULES.reduce(
    (sum, moduleName) => sum + sections[moduleName].sessionEvents,
    0
  );

  const avgSessionSecOverall =
    totalSessionEvents === 0
      ? 0
      : Math.round(totalActiveTimeMs / totalSessionEvents / 1000);

  const mostEngagedSection = MODULES.reduce((best, moduleName) => {
    return sections[moduleName].totalTimeMs > sections[best].totalTimeMs
      ? moduleName
      : best;
  }, MODULES[0]);

  const userBreakdown: UserBreakdown[] = Array.from(userStatsMap.entries())
    .map(([userId, stats]) => {
      for (const moduleName of MODULES) {
        const moduleStats = stats.sections[moduleName];
        moduleStats.avgSessionSec =
          moduleStats.sessionEvents === 0
            ? 0
            : Math.round(moduleStats.totalTimeMs / moduleStats.sessionEvents / 1000);
      }

      return {
        userId,
        totalEvents: stats.totalEvents,
        totalTimeMs: stats.totalTimeMs,
        avgSessionSec:
          stats.sessionEvents === 0
            ? 0
            : Math.round(stats.totalTimeMs / stats.sessionEvents / 1000),
        lastActiveAt: stats.lastActiveAt,
        sections: stats.sections,
      };
    })
    .sort((a, b) => {
      if (b.totalTimeMs !== a.totalTimeMs) return b.totalTimeMs - a.totalTimeMs;
      return b.totalEvents - a.totalEvents;
    });

  return {
    from: from ?? null,
    to: to ?? null,

    uniqueLoggedInUsers,
    uniqueQuizUsers: sections.quiz.uniqueUsers,
    uniqueLearnUsers: sections.learn.uniqueUsers,
    uniqueVisualizeUsers: sections.visualize.uniqueUsers,

    totalQuizAccessEvents: sections.quiz.accessEvents,
    totalLearnAccessEvents: sections.learn.accessEvents,
    totalVisualizeAccessEvents: sections.visualize.accessEvents,

    totalEvents: filtered.length,
    sections,
    uniqueTrackedUsers,
    totalActiveTimeMs,
    avgSessionSecOverall,
    mostEngagedSection,
    userBreakdown,
  };
}

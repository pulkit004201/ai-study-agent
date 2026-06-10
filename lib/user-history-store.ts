import { sql } from "@vercel/postgres";
import { promises as fs } from "fs";
import path from "path";

export type UserHistoryRow = {
  email: string;
  name: string;
  loginCount: number;
  quizAnsweredCount: number;
  firstLoginAt: string;
  lastLoginAt: string;
};

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "user-history.json");
let schemaInitPromise: Promise<void> | null = null;
let memoryStore: Record<string, UserHistoryRow> = {};

function hasPostgresConfig() {
  return Boolean(
    process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING
  );
}

async function ensureSchema() {
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      await sql`
        create table if not exists user_history (
          email text primary key,
          name text not null default '',
          login_count integer not null default 0,
          quiz_answered_count integer not null default 0,
          first_login_at timestamptz not null default now(),
          last_login_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `;

      await sql`
        create index if not exists idx_user_history_last_login
        on user_history(last_login_at desc)
      `;
    })();
  }

  await schemaInitPromise;
}

async function readLocalStore() {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Record<string, UserHistoryRow>;
    memoryStore = parsed;
    return parsed;
  } catch {
    return memoryStore;
  }
}

async function writeLocalStore(next: Record<string, UserHistoryRow>) {
  memoryStore = next;
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(next, null, 2), "utf8");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function recordUserLogin(email: string, name: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  if (!hasPostgresConfig()) {
    const store = await readLocalStore();
    const existing = store[normalizedEmail];
    const now = new Date().toISOString();
    store[normalizedEmail] = existing
      ? {
          ...existing,
          name: name || existing.name,
          loginCount: existing.loginCount + 1,
          lastLoginAt: now,
        }
      : {
          email: normalizedEmail,
          name: name || normalizedEmail,
          loginCount: 1,
          quizAnsweredCount: 0,
          firstLoginAt: now,
          lastLoginAt: now,
        };
    await writeLocalStore(store);
    return;
  }

  await ensureSchema();
  await sql`
    insert into user_history (email, name, login_count, quiz_answered_count, first_login_at, last_login_at, updated_at)
    values (${normalizedEmail}, ${name || normalizedEmail}, 1, 0, now(), now(), now())
    on conflict (email)
    do update set
      name = case
        when excluded.name is not null and excluded.name <> '' then excluded.name
        else user_history.name
      end,
      login_count = user_history.login_count + 1,
      last_login_at = now(),
      updated_at = now()
  `;
}

export async function recordQuizAnswered(email: string, name?: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  if (!hasPostgresConfig()) {
    const store = await readLocalStore();
    const existing = store[normalizedEmail];
    const now = new Date().toISOString();
    store[normalizedEmail] = existing
      ? {
          ...existing,
          name: name || existing.name,
          quizAnsweredCount: existing.quizAnsweredCount + 1,
          lastLoginAt: existing.lastLoginAt || now,
        }
      : {
          email: normalizedEmail,
          name: name || normalizedEmail,
          loginCount: 0,
          quizAnsweredCount: 1,
          firstLoginAt: now,
          lastLoginAt: now,
        };
    await writeLocalStore(store);
    return;
  }

  await ensureSchema();
  await sql`
    insert into user_history (email, name, login_count, quiz_answered_count, first_login_at, last_login_at, updated_at)
    values (${normalizedEmail}, ${name || normalizedEmail}, 0, 1, now(), now(), now())
    on conflict (email)
    do update set
      name = case
        when excluded.name is not null and excluded.name <> '' then excluded.name
        else user_history.name
      end,
      quiz_answered_count = user_history.quiz_answered_count + 1,
      updated_at = now()
  `;
}

export async function getUserHistory(limit = 50) {
  if (!hasPostgresConfig()) {
    const store = await readLocalStore();
    return Object.values(store)
      .sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime())
      .slice(0, limit);
  }

  await ensureSchema();
  const result = await sql<{
    email: string;
    name: string;
    login_count: number;
    quiz_answered_count: number;
    first_login_at: string;
    last_login_at: string;
  }>`
    select email, name, login_count, quiz_answered_count, first_login_at, last_login_at
    from user_history
    order by last_login_at desc
    limit ${limit}
  `;

  return result.rows.map((row) => ({
    email: row.email,
    name: row.name,
    loginCount: row.login_count,
    quizAnsweredCount: row.quiz_answered_count,
    firstLoginAt: row.first_login_at,
    lastLoginAt: row.last_login_at,
  }));
}

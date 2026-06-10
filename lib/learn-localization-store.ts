import { sql } from "@vercel/postgres";
import { promises as fs } from "fs";
import path from "path";

export type LearnLanguage =
  | "english"
  | "hindi"
  | "german"
  | "mandarin_chinese"
  | "french"
  | "spanish"
  | "japanese";

export type LocalizedContent = {
  explanation: string;
  analogy: string;
  example: string;
  usage: string;
  deepExample: {
    title: string;
    context: string;
    setup: string[];
    realtimeFlow: string[];
    whyBetter: string;
    failureModes: string[];
  };
};

export type LocalizationImportItem = {
  language: LearnLanguage;
  title: string;
} & LocalizedContent;

const LOCALIZATION_CACHE_PATH = path.join(
  process.cwd(),
  "data",
  "learn-localizations.json"
);
let schemaInitPromise: Promise<void> | null = null;

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
        create table if not exists learn_localizations (
          language text not null,
          title text not null,
          normalized_title text not null,
          explanation text not null,
          analogy text not null,
          example text not null,
          usage text not null,
          deep_example_json text not null default '{}',
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          primary key (language, normalized_title)
        )
      `;

      await sql`
        alter table learn_localizations
        add column if not exists deep_example_json text not null default '{}'
      `;

      await sql`
        create index if not exists idx_learn_localizations_language
        on learn_localizations(language)
      `;
    })();
  }

  await schemaInitPromise;
}

export function getLocalizationCacheKey(language: LearnLanguage, title: string) {
  return `${language}::${title.trim().toLowerCase()}`;
}

export async function readLocalizationCache() {
  if (hasPostgresConfig()) {
    await ensureSchema();
    const result = await sql<{
      language: LearnLanguage;
      title: string;
      explanation: string;
      analogy: string;
      example: string;
      usage: string;
      deep_example_json: string;
    }>`
      select language, title, explanation, analogy, example, usage, deep_example_json
      from learn_localizations
    `;

    const cache: Record<string, LocalizedContent> = {};
    for (const row of result.rows) {
      cache[getLocalizationCacheKey(row.language, row.title)] = {
        explanation: row.explanation,
        analogy: row.analogy,
        example: row.example,
        usage: row.usage,
        deepExample: parseDeepExampleSafe(row.deep_example_json),
      };
    }
    return cache;
  }

  try {
    const raw = await fs.readFile(LOCALIZATION_CACHE_PATH, "utf8");
    return JSON.parse(raw) as Record<string, LocalizedContent>;
  } catch {
    return {} as Record<string, LocalizedContent>;
  }
}

export async function writeLocalizationCache(
  cache: Record<string, LocalizedContent>
) {
  if (hasPostgresConfig()) {
    await ensureSchema();
    const entries = Object.entries(cache);
    for (const [key, value] of entries) {
      const [language, normalizedTitle] = key.split("::");
      if (!language || !normalizedTitle) continue;

      await sql`
        insert into learn_localizations (language, title, normalized_title, explanation, analogy, example, usage, deep_example_json, updated_at)
        values (
          ${language},
          ${normalizedTitle},
          ${normalizedTitle},
          ${value.explanation},
          ${value.analogy},
          ${value.example},
          ${value.usage},
          ${JSON.stringify(value.deepExample)},
          now()
        )
        on conflict (language, normalized_title)
        do update set
          explanation = excluded.explanation,
          analogy = excluded.analogy,
          example = excluded.example,
          usage = excluded.usage,
          deep_example_json = excluded.deep_example_json,
          updated_at = now()
      `;
    }
    return;
  }

  await fs.writeFile(LOCALIZATION_CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

export async function importLocalizationItems(
  items: LocalizationImportItem[],
  options?: { replace?: boolean }
) {
  if (hasPostgresConfig()) {
    await ensureSchema();

    if (options?.replace) {
      await sql`delete from learn_localizations`;
    }

    for (const item of items) {
      const normalizedTitle = item.title.trim().toLowerCase();
      await sql`
        insert into learn_localizations (language, title, normalized_title, explanation, analogy, example, usage, deep_example_json, updated_at)
        values (
          ${item.language},
          ${item.title},
          ${normalizedTitle},
          ${item.explanation},
          ${item.analogy},
          ${item.example},
          ${item.usage},
          ${JSON.stringify(item.deepExample)},
          now()
        )
        on conflict (language, normalized_title)
        do update set
          title = excluded.title,
          explanation = excluded.explanation,
          analogy = excluded.analogy,
          example = excluded.example,
          usage = excluded.usage,
          deep_example_json = excluded.deep_example_json,
          updated_at = now()
      `;
    }

    const countResult = await sql<{ count: string }>`
      select count(*)::text as count from learn_localizations
    `;

    return {
      imported: items.length,
      totalInCache: Number(countResult.rows[0]?.count ?? "0"),
    };
  }

  const replace = options?.replace ?? false;
  const cache = replace ? {} : await readLocalizationCache();

  let imported = 0;
  for (const item of items) {
    const key = getLocalizationCacheKey(item.language, item.title);
    cache[key] = {
      explanation: item.explanation,
      analogy: item.analogy,
      example: item.example,
      usage: item.usage,
      deepExample: item.deepExample,
    };
    imported += 1;
  }

  await writeLocalizationCache(cache);
  return { imported, totalInCache: Object.keys(cache).length };
}

function parseDeepExampleSafe(input: string) {
  try {
    const parsed = JSON.parse(input) as LocalizedContent["deepExample"];
    if (
      parsed &&
      typeof parsed.title === "string" &&
      typeof parsed.context === "string" &&
      Array.isArray(parsed.setup) &&
      Array.isArray(parsed.realtimeFlow) &&
      typeof parsed.whyBetter === "string" &&
      Array.isArray(parsed.failureModes)
    ) {
      return parsed;
    }
  } catch {
    // ignore invalid JSON
  }

  return {
    title: "",
    context: "",
    setup: [],
    realtimeFlow: [],
    whyBetter: "",
    failureModes: [],
  };
}

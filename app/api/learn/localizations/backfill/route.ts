import OpenAI from "openai";
import { CONCEPTS } from "@/data/concepts";
import { isAnalyticsUserAllowed } from "@/lib/analytics-access";
import {
  getLocalizationCacheKey,
  importLocalizationItems,
  LearnLanguage,
  LocalizationImportItem,
  readLocalizationCache,
} from "@/lib/learn-localization-store";

type Payload = {
  language?: LearnLanguage;
  onlyMissing?: boolean;
  offset?: number;
  limit?: number;
};

function buildEnglishContent(concept: (typeof CONCEPTS)[number]) {
  return {
    explanation: `${concept.explanation} In practice, this matters because ${concept.usage.toLowerCase()}.`,
    analogy: concept.analogy,
    example: concept.example,
    usage: concept.usage,
    deepExample: concept.deepExample,
  };
}

function parseJsonSafe(text: string) {
  try {
    return JSON.parse(text) as {
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
  } catch {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();
    try {
      return JSON.parse(cleaned) as {
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
    } catch {
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        const sliced = cleaned.slice(firstBrace, lastBrace + 1);
        return JSON.parse(sliced) as {
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
      }
      throw new Error("Could not parse model response JSON.");
    }
  }
}

export async function POST(req: Request) {
  try {
    const requesterEmail = req.headers.get("x-analytics-user");
    if (!isAnalyticsUserAllowed(requesterEmail)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as Payload;
    const language = body.language ?? "hindi";
    const onlyMissing = body.onlyMissing ?? true;
    const offset = Number.isFinite(body.offset)
      ? Math.max(0, Math.floor(Number(body.offset)))
      : 0;
    const limit = Number.isFinite(body.limit)
      ? Math.max(1, Math.min(40, Math.floor(Number(body.limit))))
      : CONCEPTS.length;

    if (language !== "hindi") {
      return Response.json(
        { error: "This backfill endpoint currently supports only Hindi." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing on server." },
        { status: 400 }
      );
    }

    const existing = await readLocalizationCache();
    const client = new OpenAI({ apiKey });
    const toImport: LocalizationImportItem[] = [];
    let skipped = 0;
    const failedTitles: string[] = [];

    const batch = CONCEPTS.slice(offset, offset + limit);

    for (const concept of batch) {
      const key = getLocalizationCacheKey(language, concept.title);
      const existingEntry = existing[key];
      const hasDetailedExample = Boolean(
        existingEntry?.deepExample?.title &&
          existingEntry.deepExample.title.trim().length > 0
      );

      if (onlyMissing && existingEntry && hasDetailedExample) {
        skipped += 1;
        continue;
      }

      const english = buildEnglishContent(concept);

      try {
        const response = await client.chat.completions.create({
          model: "gpt-4.1-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "Translate AI educational content to simple Hindi in Devanagari. Return strict JSON only with keys explanation, analogy, example, usage, deepExample. deepExample must include keys: title, context, setup, realtimeFlow, whyBetter, failureModes. setup/realtimeFlow/failureModes must be arrays of short strings.",
            },
            {
              role: "user",
              content: `Title: ${concept.title}
Explanation: ${english.explanation}
Analogy: ${english.analogy}
Example: ${english.example}
Usage: ${english.usage}

Deep Example Title: ${english.deepExample.title}
Deep Example Context: ${english.deepExample.context}
Deep Example Setup: ${english.deepExample.setup.join(" | ")}
Deep Example Realtime Flow: ${english.deepExample.realtimeFlow.join(" | ")}
Deep Example Why Better: ${english.deepExample.whyBetter}
Deep Example Failure Modes: ${english.deepExample.failureModes.join(" | ")}`,
            },
          ],
        });

        const text = response.choices[0]?.message?.content?.trim();
        if (!text) {
          failedTitles.push(concept.title);
          continue;
        }

        const localized = parseJsonSafe(text);
        const deepExample = localized.deepExample ?? english.deepExample;
        toImport.push({
          language,
          title: concept.title,
          explanation: localized.explanation,
          analogy: localized.analogy,
          example: localized.example,
          usage: localized.usage,
          deepExample: {
            title: deepExample.title || english.deepExample.title,
            context: deepExample.context || english.deepExample.context,
            setup:
              Array.isArray(deepExample.setup) && deepExample.setup.length > 0
                ? deepExample.setup
                : english.deepExample.setup,
            realtimeFlow:
              Array.isArray(deepExample.realtimeFlow) &&
              deepExample.realtimeFlow.length > 0
                ? deepExample.realtimeFlow
                : english.deepExample.realtimeFlow,
            whyBetter: deepExample.whyBetter || english.deepExample.whyBetter,
            failureModes:
              Array.isArray(deepExample.failureModes) &&
              deepExample.failureModes.length > 0
                ? deepExample.failureModes
                : english.deepExample.failureModes,
          },
        });
      } catch {
        failedTitles.push(concept.title);
      }
    }

    if (toImport.length === 0) {
      return Response.json({
        ok: true,
        imported: 0,
        skipped,
        offset,
        limit,
        totalConcepts: CONCEPTS.length,
        processedConcepts: batch.length,
        failedTitles,
        message: "No concepts needed import.",
      });
    }

    const result = await importLocalizationItems(toImport, { replace: false });
    return Response.json({
      ok: true,
      language,
      imported: result.imported,
      skipped,
      totalInStore: result.totalInCache,
      offset,
      limit,
      totalConcepts: CONCEPTS.length,
      processedConcepts: batch.length,
      failedTitles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backfill failed.";
    return Response.json({ error: "Backfill failed.", detail: message }, { status: 500 });
  }
}

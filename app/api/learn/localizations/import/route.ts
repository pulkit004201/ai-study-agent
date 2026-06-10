import { isAnalyticsUserAllowed } from "@/lib/analytics-access";
import {
  importLocalizationItems,
  LearnLanguage,
  LocalizationImportItem,
} from "@/lib/learn-localization-store";

type ImportPayload = {
  replace?: boolean;
  items?: Array<{
    language?: LearnLanguage;
    title?: string;
    explanation?: string;
    analogy?: string;
    example?: string;
    usage?: string;
    deepExample?: {
      title?: string;
      context?: string;
      setup?: string[];
      realtimeFlow?: string[];
      whyBetter?: string;
      failureModes?: string[];
    };
  }>;
};

const VALID_LANGUAGES: LearnLanguage[] = [
  "english",
  "hindi",
  "german",
  "mandarin_chinese",
  "french",
  "spanish",
  "japanese",
];

function normalizeItem(
  item: ImportPayload["items"][number]
): LocalizationImportItem | null {
  if (!item) return null;
  if (!item.language || !VALID_LANGUAGES.includes(item.language)) return null;
  if (!item.title?.trim()) return null;
  if (!item.explanation?.trim()) return null;
  if (!item.analogy?.trim()) return null;
  if (!item.example?.trim()) return null;
  if (!item.usage?.trim()) return null;
  if (!item.deepExample) return null;
  if (!item.deepExample.title?.trim()) return null;
  if (!item.deepExample.context?.trim()) return null;
  if (!Array.isArray(item.deepExample.setup)) return null;
  if (!Array.isArray(item.deepExample.realtimeFlow)) return null;
  if (!item.deepExample.whyBetter?.trim()) return null;
  if (!Array.isArray(item.deepExample.failureModes)) return null;
  if (item.deepExample.setup.some((step) => typeof step !== "string" || !step.trim()))
    return null;
  if (
    item.deepExample.realtimeFlow.some(
      (step) => typeof step !== "string" || !step.trim()
    )
  )
    return null;
  if (
    item.deepExample.failureModes.some(
      (step) => typeof step !== "string" || !step.trim()
    )
  )
    return null;

  return {
    language: item.language,
    title: item.title.trim(),
    explanation: item.explanation.trim(),
    analogy: item.analogy.trim(),
    example: item.example.trim(),
    usage: item.usage.trim(),
    deepExample: {
      title: item.deepExample.title.trim(),
      context: item.deepExample.context.trim(),
      setup: item.deepExample.setup.map((step) => step.trim()),
      realtimeFlow: item.deepExample.realtimeFlow.map((step) => step.trim()),
      whyBetter: item.deepExample.whyBetter.trim(),
      failureModes: item.deepExample.failureModes.map((step) => step.trim()),
    },
  };
}

export async function POST(req: Request) {
  try {
    const requesterEmail = req.headers.get("x-analytics-user");
    if (!isAnalyticsUserAllowed(requesterEmail)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as ImportPayload;
    const rawItems = body.items ?? [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return Response.json(
        { error: "Invalid payload. Provide a non-empty items array." },
        { status: 400 }
      );
    }

    if (rawItems.length > 5000) {
      return Response.json(
        { error: "Too many items in one request. Limit is 5000." },
        { status: 400 }
      );
    }

    const validItems: LocalizationImportItem[] = [];
    const invalidIndices: number[] = [];

    rawItems.forEach((item, index) => {
      const normalized = normalizeItem(item);
      if (!normalized) {
        invalidIndices.push(index);
        return;
      }
      validItems.push(normalized);
    });

    if (validItems.length === 0) {
      return Response.json(
        {
          error:
            "No valid items found. Each item must include language, title, explanation, analogy, example, usage, and deepExample structure.",
        },
        { status: 400 }
      );
    }

    const result = await importLocalizationItems(validItems, {
      replace: Boolean(body.replace),
    });

    return Response.json({
      ok: true,
      imported: result.imported,
      totalInCache: result.totalInCache,
      invalidItems: invalidIndices.length,
      invalidIndices,
    });
  } catch {
    return Response.json({ error: "Unable to import translations." }, { status: 500 });
  }
}

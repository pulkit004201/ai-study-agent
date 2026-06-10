import {
  getLocalizationCacheKey,
  LearnLanguage,
  LocalizedContent,
  readLocalizationCache,
  writeLocalizationCache,
} from "@/lib/learn-localization-store";

type Payload = {
  language: LearnLanguage;
  title: string;
  explanation: string;
  usage: string;
  analogy: string;
  example: string;
  deepExample: LocalizedContent["deepExample"];
};

type CachedResponse = LocalizedContent & {
  fallback?: boolean;
  message?: string;
};

function buildEnglishContent(body: Payload): LocalizedContent {
  return {
    explanation: `${body.explanation} In practice, this matters because ${body.usage.toLowerCase()}.`,
    analogy: body.analogy,
    example: body.example,
    usage: body.usage,
    deepExample: body.deepExample,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    if (
      !body?.language ||
      !body?.title ||
      !body?.explanation ||
      !body?.deepExample
    ) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (body.language === "english") {
      return Response.json(buildEnglishContent(body));
    }
    const cache = await readLocalizationCache();
    const cacheKey = getLocalizationCacheKey(body.language, body.title);

    if (cache[cacheKey]) {
      const cached = cache[cacheKey];
      if (cached.deepExample?.title) {
        return Response.json(cached);
      }

      const englishContent = buildEnglishContent(body);
      const merged = {
        ...cached,
        deepExample: englishContent.deepExample,
      };
      cache[cacheKey] = merged;
      await writeLocalizationCache(cache);
      return Response.json({
        ...merged,
        fallback: true,
        message:
          "Detailed example for this language is missing. Showing English detailed example.",
      });
    }

    // No OpenAI call: we persist a one-time fallback entry that can be replaced later.
    const fallback = buildEnglishContent(body);
    cache[cacheKey] = fallback;
    await writeLocalizationCache(cache);

    const response: CachedResponse = {
      ...fallback,
      fallback: true,
      message:
        "Stored translation is not available yet for this language. Showing saved base content.",
    };
    return Response.json(response);
  } catch {
    return Response.json({ error: "Unable to generate explanation." }, { status: 500 });
  }
}

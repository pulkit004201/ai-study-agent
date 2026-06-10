import { CONCEPTS } from "@/data/concepts";
import { LearnLanguage } from "@/lib/learn-localization-store";

const DEFAULT_LANGUAGE: LearnLanguage = "hindi";

export async function GET() {
  const template = {
    replace: false,
    items: CONCEPTS.map((concept) => ({
      language: DEFAULT_LANGUAGE,
      title: concept.title,
      explanation: "",
      analogy: "",
      example: "",
      usage: "",
      deepExample: {
        title: concept.deepExample.title,
        context: "",
        setup: concept.deepExample.setup.map(() => ""),
        realtimeFlow: concept.deepExample.realtimeFlow.map(() => ""),
        whyBetter: "",
        failureModes: concept.deepExample.failureModes.map(() => ""),
      },
    })),
  };

  return Response.json(template);
}

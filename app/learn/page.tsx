"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CONCEPTS } from "@/data/concepts";
import { useSectionAnalytics } from "@/lib/use-section-analytics";

type Language =
  | "english"
  | "hindi";

type LocalizedContent = {
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

function normalizeDeepExample(
  value: Partial<LocalizedContent["deepExample"]> | undefined,
  fallback: LocalizedContent["deepExample"]
): LocalizedContent["deepExample"] {
  return {
    title: value?.title || fallback.title,
    context: value?.context || fallback.context,
    setup:
      Array.isArray(value?.setup) && value.setup.length > 0
        ? value.setup
        : fallback.setup,
    realtimeFlow:
      Array.isArray(value?.realtimeFlow) && value.realtimeFlow.length > 0
        ? value.realtimeFlow
        : fallback.realtimeFlow,
    whyBetter: value?.whyBetter || fallback.whyBetter,
    failureModes:
      Array.isArray(value?.failureModes) && value.failureModes.length > 0
        ? value.failureModes
        : fallback.failureModes,
  };
}

const LANGUAGE_LABELS: Record<Language, string> = {
  english: "English",
  hindi: "Hindi",
};

const LANGUAGE_TTS: Record<Language, string> = {
  english: "en-US",
  hindi: "hi-IN",
};

function getEnglishContent(concept: (typeof CONCEPTS)[number]): LocalizedContent {
  return {
    explanation: `${concept.explanation} In practice, this matters because ${concept.usage.toLowerCase()}.`,
    analogy: concept.analogy,
    example: concept.example,
    usage: concept.usage,
    deepExample: concept.deepExample,
  };
}

export default function LearnPage() {
  const [index, setIndex] = useState(0);
  const [isConceptMenuOpen, setConceptMenuOpen] = useState(false);
  const [conceptQuery, setConceptQuery] = useState("");
  const [language, setLanguage] = useState<Language>("english");
  const [localizedContent, setLocalizedContent] = useState<LocalizedContent>(
    getEnglishContent(CONCEPTS[0])
  );
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [languageError, setLanguageError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isDetailedExampleOpen, setDetailedExampleOpen] = useState(false);

  const conceptSearchRef = useRef<HTMLInputElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const total = CONCEPTS.length;
  const concept = CONCEPTS[index];
  const progress = Math.round(((index + 1) / total) * 100);
  const deepExample = normalizeDeepExample(
    localizedContent.deepExample,
    concept.deepExample
  );
  const filteredConcepts = useMemo(() => {
    const query = conceptQuery.trim().toLowerCase();
    if (!query) return CONCEPTS;
    return CONCEPTS.filter((item) => item.title.toLowerCase().includes(query));
  }, [conceptQuery]);

  const audioScript = useMemo(() => {
    return [
      `Explanation: ${localizedContent.explanation}`,
      `Analogy: ${localizedContent.analogy}`,
      `Example: ${localizedContent.example}`,
      `Usage today: ${localizedContent.usage}`,
    ].join(" ");
  }, [localizedContent]);

  function clearAudioProgressTimer() {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }

  useEffect(() => {
    localStorage.setItem("conceptProgress", String(index));
  }, [index]);

  useEffect(() => {
    if (isConceptMenuOpen) {
      window.setTimeout(() => conceptSearchRef.current?.focus(), 0);
    } else {
      setConceptQuery("");
    }
  }, [isConceptMenuOpen]);

  useSectionAnalytics("learn");

  useEffect(() => {
    const englishContent = getEnglishContent(concept);

    if (language === "english") {
      setLocalizedContent(englishContent);
      setLanguageError("");
      setIsLoadingExplanation(false);
      return;
    }

    let cancelled = false;

    async function loadLocalizedContent() {
      setIsLoadingExplanation(true);
      setLanguageError("");

      try {
        const res = await fetch("/api/learn/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            title: concept.title,
            explanation: concept.explanation,
            usage: concept.usage,
            analogy: concept.analogy,
            example: concept.example,
            deepExample: concept.deepExample,
          }),
        });

        const data = (await res.json()) as
          | (LocalizedContent & { fallback?: boolean; message?: string; error?: never })
          | { error?: string };

        if (cancelled) return;

        if (
          !res.ok ||
          !("explanation" in data) ||
          !("analogy" in data) ||
          !("example" in data) ||
          !("usage" in data) ||
          !("deepExample" in data)
        ) {
          setLanguageError(
            "error" in data && data.error
              ? data.error
              : `Could not load ${LANGUAGE_LABELS[language]} explanation.`
          );
          setLocalizedContent(englishContent);
          return;
        }

        setLocalizedContent({
          explanation: data.explanation,
          analogy: data.analogy,
          example: data.example,
          usage: data.usage,
          deepExample: normalizeDeepExample(data.deepExample, concept.deepExample),
        });

        if ("fallback" in data && data.fallback) {
          setLanguageError(
            data.message ??
              `Stored translation not available for ${LANGUAGE_LABELS[language]}. Showing saved base content.`
          );
        }
      } catch {
        if (cancelled) return;
        setLanguageError(`Could not load ${LANGUAGE_LABELS[language]} explanation.`);
        setLocalizedContent(englishContent);
      } finally {
        if (!cancelled) setIsLoadingExplanation(false);
      }
    }

    loadLocalizedContent();

    return () => {
      cancelled = true;
    };
  }, [concept, language]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (typeof window !== "undefined") {
        clearAudioProgressTimer();
      }
    };
  }, []);

  function stopAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    clearAudioProgressTimer();
    setIsSpeaking(false);
    setAudioProgress(0);
  }

  function playAudio() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!audioScript.trim()) return;

    window.speechSynthesis.cancel();
    clearAudioProgressTimer();

    const utterance = new SpeechSynthesisUtterance(audioScript);
    utterance.lang = LANGUAGE_TTS[language];
    utterance.rate = 0.95;

    const totalChars = Math.max(audioScript.length, 1);

    utterance.onstart = () => {
      setIsSpeaking(true);
      setAudioProgress(0);

      // Fallback progress for browsers that do not emit boundary events reliably.
      progressTimerRef.current = window.setInterval(() => {
        setAudioProgress((prev) => (prev >= 95 ? prev : prev + 2));
      }, 400);
    };

    utterance.onboundary = (event) => {
      if (event.charIndex >= 0) {
        const pct = Math.min(99, Math.round((event.charIndex / totalChars) * 100));
        setAudioProgress((prev) => (pct > prev ? pct : prev));
      }
    };

    utterance.onend = () => {
      clearAudioProgressTimer();
      setAudioProgress(100);
      setIsSpeaking(false);
      window.setTimeout(() => setAudioProgress(0), 500);
    };

    utterance.onerror = () => {
      clearAudioProgressTimer();
      setIsSpeaking(false);
      setAudioProgress(0);
    };

    window.speechSynthesis.speak(utterance);
  }

  return (
    <main style={page}>
      <div style={headerWrap}>
        <p style={eyebrow}>LEARN · AI FUNDAMENTALS</p>
        <h1 style={headline}>Learn AI</h1>
      </div>

      <div style={progressWrap}>
        <div style={selectorsRow}>
          <div style={selectorWrap}>
            <p style={selectorLabel}>Jump to Concept</p>
            <button
              type="button"
              style={selectorTrigger}
              onClick={() => setConceptMenuOpen((open) => !open)}
            >
              <span>
                {index + 1}. {concept.title}
              </span>
              <span>{isConceptMenuOpen ? "▲" : "▼"}</span>
            </button>

            {isConceptMenuOpen && (
              <div style={selectorMenu}>
                <div style={selectorMenuHeader}>
                  <input
                    ref={conceptSearchRef}
                    value={conceptQuery}
                    onChange={(event) => setConceptQuery(event.target.value)}
                    placeholder="Search concepts"
                    style={selectorSearchInput}
                  />
                  <p style={selectorSearchMeta}>
                    {filteredConcepts.length} result{filteredConcepts.length === 1 ? "" : "s"}
                  </p>
                </div>
                {filteredConcepts.length === 0 && (
                  <p style={selectorEmpty}>No matching concepts.</p>
                )}
                {filteredConcepts.map((item) => {
                  const i = CONCEPTS.indexOf(item);
                  const active = i === index;
                  return (
                    <button
                      key={`${item.title}-${i}`}
                      type="button"
                      style={active ? { ...selectorOption, ...selectorOptionActive } : selectorOption}
                      onClick={() => {
                        setIndex(i);
                        setConceptMenuOpen(false);
                        stopAudio();
                        setDetailedExampleOpen(false);
                      }}
                    >
                      {i + 1}. {item.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={languageWrap}>
            <p style={selectorLabel}>Explanation Language</p>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as Language);
                stopAudio();
                setDetailedExampleOpen(false);
              }}
              style={languageSelect}
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
        </div>

        <div style={progressTrack}>
          <div style={{ ...progressFill, width: `${progress}%` }} />
        </div>
        <p style={progressText}>
          {index + 1} / {total} concepts explored
        </p>
      </div>

      <section style={glassCard}>
        <h2 style={cardTitle}>
          {index + 1}. {concept.title}
        </h2>

        <div style={audioRow}>
          <button
            type="button"
            style={audioBtn}
            onClick={playAudio}
            disabled={isLoadingExplanation}
          >
            {isLoadingExplanation ? "Preparing..." : "Play Audio"}
          </button>
          <button type="button" style={stopBtn} onClick={stopAudio} disabled={!isSpeaking}>
            Stop
          </button>
        </div>

        <div style={audioProgressTrack}>
          <div style={{ ...audioProgressFill, width: `${audioProgress}%` }} />
        </div>

        {languageError && <p style={languageErrorText}>{languageError}</p>}

        <Block label={`Detailed Explanation (${LANGUAGE_LABELS[language]})`}>
          {isLoadingExplanation ? "Loading explanation..." : localizedContent.explanation}
        </Block>
        <Block label={`Analogy (${LANGUAGE_LABELS[language]})`}>
          {isLoadingExplanation ? "Loading analogy..." : localizedContent.analogy}
        </Block>
        <Block label={`Example (${LANGUAGE_LABELS[language]})`}>
          {isLoadingExplanation ? "Loading example..." : localizedContent.example}
        </Block>
        <Block label={`Usage Today (${LANGUAGE_LABELS[language]})`}>
          {isLoadingExplanation ? "Loading usage..." : localizedContent.usage}
        </Block>

        <section style={detailedExampleWrap}>
          <button
            type="button"
            style={detailedExampleToggle}
            onClick={() => setDetailedExampleOpen((open) => !open)}
          >
            <span>
              {`Detailed Example (${LANGUAGE_LABELS[language]})`}
            </span>
            <span style={detailedExampleArrow}>{isDetailedExampleOpen ? "▲" : "▼"}</span>
          </button>

          {isDetailedExampleOpen && (
            <div style={detailedExampleBody}>
              <p style={detailedExampleIntro}>
                Detailed real-world walkthrough with setup, live flow, and failure cases.
              </p>
              <h3 style={detailedExampleTitle}>
                {isLoadingExplanation
                  ? "Loading detailed example..."
                  : deepExample.title}
              </h3>
              <p style={detailedExampleText}>
                {isLoadingExplanation
                  ? "Loading context..."
                  : deepExample.context}
              </p>

              <DeepList
                label="The Setup"
                items={
                  isLoadingExplanation
                    ? ["Loading setup..."]
                    : deepExample.setup
                }
              />

              <DeepList
                label="The Query (Real Time Flow)"
                items={
                  isLoadingExplanation
                    ? ["Loading real-time flow..."]
                    : deepExample.realtimeFlow
                }
              />

              <p style={deepSectionLabel}>Why This Is Better</p>
              <p style={detailedExampleText}>
                {isLoadingExplanation
                  ? "Loading why this is better..."
                  : deepExample.whyBetter}
              </p>

              <DeepList
                label="What Could Go Wrong"
                items={
                  isLoadingExplanation
                    ? ["Loading failure modes..."]
                    : deepExample.failureModes
                }
              />
            </div>
          )}
        </section>
      </section>

      <div style={nav}>
        <button
          style={secondaryBtn}
          disabled={index === 0}
          onClick={() => {
            setIndex((i) => i - 1);
            stopAudio();
            setDetailedExampleOpen(false);
          }}
        >
          ← Back
        </button>

        <button
          style={primaryBtn}
          disabled={index === total - 1}
          onClick={() => {
            setIndex((i) => i + 1);
            stopAudio();
            setDetailedExampleOpen(false);
          }}
        >
          Next →
        </button>
      </div>
    </main>
  );
}

function DeepList({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={deepListWrap}>
      <p style={deepSectionLabel}>{label}</p>
      <ul style={deepList}>
        {items.map((item, index) => (
          <li key={`${label}-${index}`} style={deepListItem}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={block}>
      <p style={blockLabel}>{label}</p>
      <p style={blockText}>{children}</p>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  padding: "80px 24px",
  background:
    "radial-gradient(1200px 600px at 30% -10%, rgba(56,189,248,0.14), transparent 40%), var(--background)",
  color: "var(--foreground)",
};

const headerWrap = {
  maxWidth: 900,
  margin: "0 auto 24px",
};

const eyebrow = {
  color: "var(--hero-accent)",
  letterSpacing: "0.14em",
  fontSize: 12,
  marginBottom: 10,
};

const headline = {
  fontSize: 40,
  fontWeight: 800,
};

const progressWrap = {
  maxWidth: 900,
  margin: "0 auto 28px",
};

const selectorsRow = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap" as const,
};

const selectorWrap = {
  marginBottom: 12,
  position: "relative" as const,
  minWidth: 340,
  flex: 1.7,
};

const selectorLabel = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--hero-accent)",
};

const selectorTrigger = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface-alt)",
  color: "var(--foreground)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  textAlign: "left" as const,
};

const selectorMenu = {
  position: "absolute" as const,
  top: 68,
  left: 0,
  right: 0,
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface-alt)",
  overflowY: "auto" as const,
  maxHeight: 400,
  zIndex: 20,
};

const selectorMenuHeader = {
  position: "sticky" as const,
  top: 0,
  background: "var(--surface-alt)",
  padding: "10px 12px 8px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
  zIndex: 1,
};

const selectorSearchInput = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--foreground)",
  fontSize: 14,
};

const selectorSearchMeta = {
  margin: 0,
  fontSize: 12,
  color: "var(--text-muted)",
};

const selectorEmpty = {
  padding: "10px 12px",
  margin: 0,
  fontSize: 13,
  color: "var(--text-muted)",
};

const selectorOption = {
  width: "100%",
  padding: "10px 12px",
  border: "none",
  background: "transparent",
  color: "var(--foreground)",
  textAlign: "left" as const,
  cursor: "pointer",
};

const selectorOptionActive = {
  background: "rgba(37, 99, 235, 0.28)",
};

const languageWrap = {
  marginBottom: 12,
  minWidth: 220,
  maxWidth: 280,
  flex: 0.9,
};

const languageSelect = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface-alt)",
  color: "var(--foreground)",
};

const progressTrack = {
  height: 10,
  borderRadius: 999,
  background: "var(--border)",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  background: "linear-gradient(90deg, #22c55e, #38bdf8)",
  transition: "width 0.4s ease",
};

const progressText = {
  marginTop: 8,
  fontSize: 14,
  opacity: 0.85,
};

const glassCard = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 28,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, var(--surface-alt), var(--surface))",
  backdropFilter: "blur(14px)",
  border: "1px solid var(--border)",
  boxShadow: "0 24px 54px rgba(0,0,0,0.18)",
};

const cardTitle = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 18,
  color: "var(--foreground)",
};

const audioRow = {
  display: "flex",
  gap: 10,
  marginBottom: 12,
};

const audioBtn = {
  padding: "9px 14px",
  borderRadius: 999,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

const stopBtn = {
  padding: "9px 14px",
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--foreground)",
  cursor: "pointer",
};

const audioProgressTrack = {
  height: 8,
  borderRadius: 999,
  background: "var(--border)",
  overflow: "hidden",
  marginBottom: 12,
};

const audioProgressFill = {
  height: "100%",
  background: "linear-gradient(90deg, #22d3ee, #3b82f6)",
  transition: "width 0.2s linear",
};

const languageErrorText = {
  marginTop: 0,
  marginBottom: 12,
  color: "#fda4af",
  fontSize: 14,
};

const block = {
  marginBottom: 18,
};

const blockLabel = {
  fontSize: 13,
  letterSpacing: "0.08em",
  opacity: 0.6,
  marginBottom: 6,
};

const blockText = {
  fontSize: 16,
  lineHeight: 1.65,
  color: "var(--foreground)",
};

const detailedExampleWrap = {
  marginTop: 8,
  border: "1px solid var(--border)",
  borderRadius: 16,
  overflow: "hidden",
  background:
    "linear-gradient(180deg, var(--surface), var(--surface-alt))",
};

const detailedExampleToggle = {
  width: "100%",
  padding: "13px 14px",
  border: "none",
  background: "linear-gradient(90deg, rgba(37, 99, 235, 0.28), rgba(14, 116, 144, 0.22))",
  color: "var(--foreground)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left" as const,
};

const detailedExampleArrow = {
  opacity: 0.9,
  fontSize: 13,
};

const detailedExampleBody = {
  padding: 14,
};

const detailedExampleIntro = {
  margin: "0 0 10px",
  fontSize: 13,
  color: "#0ea5e9",
};

const detailedExampleTitle = {
  margin: "0 0 8px",
  fontSize: 18,
  color: "var(--foreground)",
};

const detailedExampleText = {
  margin: "0 0 10px",
  fontSize: 15,
  lineHeight: 1.6,
  color: "var(--foreground)",
};

const deepListWrap = {
  marginBottom: 10,
};

const deepSectionLabel = {
  margin: "0 0 6px",
  fontSize: 13,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#0ea5e9",
};

const deepList = {
  margin: 0,
  paddingLeft: 18,
};

const deepListItem = {
  marginBottom: 6,
  color: "var(--foreground)",
  lineHeight: 1.55,
};

const nav = {
  maxWidth: 900,
  margin: "32px auto 0",
  display: "flex",
  justifyContent: "space-between",
};

const primaryBtn = {
  padding: "10px 18px",
  borderRadius: 999,
  background: "#2563eb",
  border: "none",
  color: "#fff",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "10px 18px",
  borderRadius: 999,
  background: "var(--surface-alt)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  cursor: "pointer",
};

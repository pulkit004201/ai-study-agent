"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  QUIZ_BY_DIFFICULTY,
  QUIZ_LABELS,
  QuizDifficulty,
} from "@/data/quizzes";
import { recordQuizAnswerHistory } from "@/lib/user-history-client";
import { useSectionAnalytics } from "@/lib/use-section-analytics";

type QuizSession = {
  current: number;
  selected: number | null;
  showAnswer: boolean;
  score: number;
  attempted: number;
  completed: boolean;
};

const DIFFICULTIES: QuizDifficulty[] = ["easy", "medium", "hard"];
const QUIZ_PROGRESS_KEY_PREFIX = "quiz_progress_v1";

function createInitialSession(): QuizSession {
  return {
    current: 0,
    selected: null,
    showAnswer: false,
    score: 0,
    attempted: 0,
    completed: false,
  };
}

function createInitialSessions() {
  return {
    easy: createInitialSession(),
    medium: createInitialSession(),
    hard: createInitialSession(),
  } as Record<QuizDifficulty, QuizSession>;
}

type SavedQuizProgress = {
  difficulty: QuizDifficulty;
  sessions: Record<QuizDifficulty, QuizSession>;
};

function getProgressKey(userEmail: string) {
  return `${QUIZ_PROGRESS_KEY_PREFIX}:${userEmail}`;
}

function parseSavedProgress(raw: string | null): SavedQuizProgress | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SavedQuizProgress;
    if (
      !parsed ||
      !parsed.sessions ||
      !parsed.sessions.easy ||
      !parsed.sessions.medium ||
      !parsed.sessions.hard ||
      !parsed.difficulty
    ) {
      return null;
    }
    if (!DIFFICULTIES.includes(parsed.difficulty)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function QuizPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("easy");
  const [sessions, setSessions] = useState<Record<QuizDifficulty, QuizSession>>(
    createInitialSessions()
  );
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);
  const userEmail = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      window.addEventListener("focus", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("focus", handler);
      };
    },
    () => localStorage.getItem("userEmail")?.trim().toLowerCase() ?? "",
    () => ""
  );
  const isSignedInUser = Boolean(userEmail);

  const questions = QUIZ_BY_DIFFICULTY[difficulty];
  const session = sessions[difficulty];
  const q = questions[session.current];

  const accuracy = useMemo(() => {
    if (session.attempted === 0) return 0;
    return Math.round((session.score / session.attempted) * 100);
  }, [session.attempted, session.score]);

  const hasSavedProgress = useMemo(() => {
    return DIFFICULTIES.some((level) => {
      const s = sessions[level];
      return (
        s.current > 0 ||
        s.selected !== null ||
        s.showAnswer ||
        s.score > 0 ||
        s.attempted > 0 ||
        s.completed
      );
    });
  }, [sessions]);

  useSectionAnalytics("quiz");

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!userEmail) {
        setIsProgressLoaded(true);
        return;
      }
      const saved = parseSavedProgress(localStorage.getItem(getProgressKey(userEmail)));
      if (saved) {
        setSessions(saved.sessions);
        setDifficulty(saved.difficulty);
      }
      setIsProgressLoaded(true);
    });
  }, [userEmail]);

  useEffect(() => {
    if (!isProgressLoaded) return;
    if (!userEmail) return;
    const payload: SavedQuizProgress = { difficulty, sessions };
    localStorage.setItem(getProgressKey(userEmail), JSON.stringify(payload));
  }, [difficulty, isProgressLoaded, sessions, userEmail]);

  function updateSession(updater: (prev: QuizSession) => QuizSession) {
    setSessions((prev) => ({
      ...prev,
      [difficulty]: updater(prev[difficulty]),
    }));
  }

  function switchDifficulty(level: QuizDifficulty) {
    setDifficulty(level);
  }

  function resetCurrentDifficulty() {
    setSessions((prev) => ({
      ...prev,
      [difficulty]: createInitialSession(),
    }));
  }

  function resetSavedProgress() {
    const userEmail = localStorage.getItem("userEmail")?.trim().toLowerCase() ?? "";
    if (!userEmail) return;
    localStorage.removeItem(getProgressKey(userEmail));
    setSessions(createInitialSessions());
    setDifficulty("easy");
  }

  function selectOption(i: number) {
    if (session.showAnswer || session.completed) return;

    const userEmail = localStorage.getItem("userEmail")?.trim().toLowerCase() ?? "";
    const userName = localStorage.getItem("userName")?.trim() ?? userEmail;
    if (userEmail) {
      void recordQuizAnswerHistory(userEmail, userName);
    }

    updateSession((prev) => ({
      ...prev,
      selected: i,
      showAnswer: true,
      attempted: prev.attempted + 1,
      score: prev.score + (i === q.correctIndex ? 1 : 0),
    }));
  }

  function nextQuestion() {
    updateSession((prev) => {
      const isLast = prev.current + 1 >= questions.length;
      if (isLast) {
        return {
          ...prev,
          completed: true,
          showAnswer: false,
          selected: null,
        };
      }

      return {
        ...prev,
        current: prev.current + 1,
        selected: null,
        showAnswer: false,
      };
    });
  }

  return (
    <main style={page}>
      <div style={container}>
        <p style={eyebrow}>QUIZ MODE</p>
        <h1 style={headline}>AI Quiz</h1>

        <div style={tabsWrap}>
          {DIFFICULTIES.map((level) => {
            const active = level === difficulty;
            return (
              <button
                key={level}
                type="button"
                style={active ? { ...tabBtn, ...tabBtnActive } : tabBtn}
                onClick={() => switchDifficulty(level)}
              >
                {QUIZ_LABELS[level]} (20)
              </button>
            );
          })}
        </div>

        <div style={statsWrap}>
          <div style={statCard}>
            <p style={statLabel}>Attempted</p>
            <p style={statValue}>{session.attempted} / {questions.length}</p>
          </div>
          <div style={statCard}>
            <p style={statLabel}>Accuracy</p>
            <p style={statValue}>{accuracy}%</p>
          </div>
        </div>

        {isSignedInUser && (
          <div style={resumeWrap}>
            <p style={resumeText}>
              {hasSavedProgress
                ? "Saved progress loaded for this account."
                : "No saved progress yet for this account."}
            </p>
            <button style={resetSavedBtn} onClick={resetSavedProgress}>
              Reset Saved Progress
            </button>
          </div>
        )}

        {!session.completed ? (
          <section style={card}>
            <p style={counter}>
              {QUIZ_LABELS[difficulty]} · Question {session.current + 1} of {questions.length}
            </p>

            <h3 style={question}>{q.question}</h3>

            {q.options.map((opt, i) => {
              let bg: string = optionBg;

              if (session.showAnswer) {
                if (i === q.correctIndex) bg = correctBg;
                else if (i === session.selected) bg = wrongBg;
              }

              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  style={{
                    ...option,
                    background: bg,
                    cursor: session.showAnswer ? "default" : "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}

            {session.showAnswer && (
              <div style={explanation}>
                <strong>Explanation</strong>
                <p>{q.explanation}</p>
              </div>
            )}

            {session.showAnswer && (
              <button style={nextBtn} onClick={nextQuestion}>
                {session.current + 1 === questions.length ? "Finish Quiz" : "Next →"}
              </button>
            )}
          </section>
        ) : (
          <section style={card}>
            <h2 style={{ marginBottom: 12 }}>{QUIZ_LABELS[difficulty]} Quiz Completed</h2>
            <p style={{ opacity: 0.88 }}>
              You scored <strong>{session.score}</strong> out of {questions.length}
            </p>
            <p style={{ opacity: 0.74 }}>
              Attempted: <strong>{session.attempted}</strong> · Accuracy: <strong>{accuracy}%</strong>
            </p>

            <div style={resultActions}>
              <button style={secondaryBtn} onClick={resetCurrentDifficulty}>
                Retry {QUIZ_LABELS[difficulty]}
              </button>
              <button style={primaryBtn} onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ---------------- Styles ---------------- */

const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 600px at 30% -10%, rgba(56,189,248,0.18), transparent 40%), var(--background)",
  padding: "80px 24px",
  color: "var(--foreground)",
};

const container = {
  maxWidth: 760,
  margin: "0 auto",
};

const eyebrow = {
  fontSize: 12,
  letterSpacing: "0.14em",
  color: "var(--hero-accent)",
  marginBottom: 8,
};

const headline = {
  fontSize: 36,
  fontWeight: 800,
  marginBottom: 20,
};

const tabsWrap = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  marginBottom: 16,
};

const tabBtn = {
  border: "1px solid var(--border)",
  background: "var(--surface-alt)",
  color: "var(--foreground)",
  borderRadius: 999,
  padding: "8px 14px",
  cursor: "pointer",
  fontWeight: 600,
};

const tabBtnActive = {
  background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
  border: "1px solid #60a5fa",
  color: "#fff",
};

const statsWrap = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 10,
};

const resumeWrap = {
  marginBottom: 14,
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
  alignItems: "center",
  justifyContent: "space-between",
};

const resumeText = {
  margin: 0,
  color: "var(--text-muted)",
  fontSize: 12,
};

const resetSavedBtn = {
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid var(--border)",
  background: "var(--surface-alt)",
  color: "var(--text-muted)",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 12,
  opacity: 0.85,
};

const statCard = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface-alt)",
};

const statLabel = {
  margin: 0,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--hero-accent)",
};

const statValue = {
  margin: "4px 0 0",
  fontSize: 17,
  fontWeight: 700,
};

const card = {
  padding: 28,
  borderRadius: 20,
  background: "linear-gradient(180deg, var(--surface-alt), var(--surface))",
  border: "1px solid var(--border)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 24px 54px rgba(0,0,0,0.18)",
};

const counter = {
  fontSize: 14,
  opacity: 0.7,
};

const question = {
  fontSize: 20,
  fontWeight: 600,
  margin: "12px 0 18px",
};

const option = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  marginBottom: 12,
  textAlign: "left" as const,
  transition: "all 0.25s ease",
};

const optionBg = "var(--surface-alt)";
const correctBg = "linear-gradient(90deg, #14532d, #166534)";
const wrongBg = "linear-gradient(90deg, #7f1d1d, #991b1b)";

const explanation = {
  marginTop: 16,
  padding: 14,
  background: "var(--surface-alt)",
  borderRadius: 12,
  fontSize: 14,
  lineHeight: 1.6,
};

const nextBtn = {
  marginTop: 20,
  padding: "10px 18px",
  borderRadius: 999,
  background: "#2563eb",
  border: "none",
  color: "#fff",
  cursor: "pointer",
};

const resultActions = {
  marginTop: 18,
  display: "flex",
  gap: 10,
  flexWrap: "wrap" as const,
};

const primaryBtn = {
  padding: "12px 22px",
  borderRadius: 999,
  background: "#22c55e",
  border: "none",
  color: "#022c22",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "12px 22px",
  borderRadius: 999,
  background: "var(--surface-alt)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  fontWeight: 600,
  cursor: "pointer",
};

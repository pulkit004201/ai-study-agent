"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  QUIZ_BY_DIFFICULTY,
  QUIZ_LABELS,
  QuizDifficulty,
} from "@/data/quizzes";
import { trackModuleAccess } from "@/lib/client-analytics";

type QuizSession = {
  current: number;
  selected: number | null;
  showAnswer: boolean;
  score: number;
  attempted: number;
  completed: boolean;
};

const DIFFICULTIES: QuizDifficulty[] = ["easy", "medium", "hard"];

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

export default function QuizPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("easy");
  const [sessions, setSessions] = useState<Record<QuizDifficulty, QuizSession>>({
    easy: createInitialSession(),
    medium: createInitialSession(),
    hard: createInitialSession(),
  });

  const questions = QUIZ_BY_DIFFICULTY[difficulty];
  const session = sessions[difficulty];
  const q = questions[session.current];

  const accuracy = useMemo(() => {
    if (session.attempted === 0) return 0;
    return Math.round((session.score / session.attempted) * 100);
  }, [session.attempted, session.score]);

  useEffect(() => {
    trackModuleAccess("quiz");
  }, []);

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

  function selectOption(i: number) {
    if (session.showAnswer || session.completed) return;

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
    "radial-gradient(1200px 600px at 30% -10%, rgba(56,189,248,0.18), transparent 40%), #020617",
  padding: "80px 24px",
  color: "#e5e7eb",
};

const container = {
  maxWidth: 760,
  margin: "0 auto",
};

const eyebrow = {
  fontSize: 12,
  letterSpacing: "0.14em",
  color: "#67e8f9",
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
  border: "1px solid rgba(148,163,184,0.32)",
  background: "#0b152e",
  color: "#cbd5e1",
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
  marginBottom: 14,
};

const statCard = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.25)",
  background: "rgba(15, 23, 42, 0.6)",
};

const statLabel = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "#67e8f9",
};

const statValue = {
  margin: "6px 0 0",
  fontSize: 20,
  fontWeight: 700,
};

const card = {
  padding: 28,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
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
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e5e7eb",
  marginBottom: 12,
  textAlign: "left" as const,
  transition: "all 0.25s ease",
};

const optionBg = "rgba(255,255,255,0.06)";
const correctBg = "linear-gradient(90deg, #14532d, #166534)";
const wrongBg = "linear-gradient(90deg, #7f1d1d, #991b1b)";

const explanation = {
  marginTop: 16,
  padding: 14,
  background: "rgba(255,255,255,0.06)",
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
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "#e5e7eb",
  fontWeight: 600,
  cursor: "pointer",
};

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CONCEPTS } from "@/data/concepts";

export default function LearnPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const total = CONCEPTS.length;
  const concept = CONCEPTS[index];
  const progress = Math.round(((index + 1) / total) * 100);

  useEffect(() => {
    localStorage.setItem("conceptProgress", String(index));
  }, [index]);

  return (
    <main style={page}>
      {/* Header */}
      <div style={headerWrap}>
        <p style={eyebrow}>LEARN · AI FUNDAMENTALS</p>
        <h1 style={headline}>Learn AI</h1>
      </div>

      {/* Progress */}
      <div style={progressWrap}>
        <div style={progressTrack}>
          <div style={{ ...progressFill, width: `${progress}%` }} />
        </div>
        <p style={progressText}>
          {index + 1} / {total} concepts explored
        </p>
      </div>

      {/* Concept Card */}
      <section style={glassCard}>
        <h2 style={cardTitle}>
          {index + 1}. {concept.title}
        </h2>

        <Block label="Explanation">{concept.explanation}</Block>
        <Block label="Analogy">{concept.analogy}</Block>
        <Block label="Example">{concept.example}</Block>
        <Block label="Usage Today">{concept.usage}</Block>
      </section>

      {/* Navigation */}
      <div style={nav}>
        <button
          style={secondaryBtn}
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          ← Back
        </button>

        <button
          style={primaryBtn}
          disabled={index === total - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next →
        </button>
      </div>
    </main>
  );
}

/* ---------------- Blocks ---------------- */

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

/* ---------------- Styles ---------------- */

const page = {
  minHeight: "100vh",
  padding: "80px 24px",
  background:
    "radial-gradient(1200px 600px at 30% -10%, rgba(56,189,248,0.18), transparent 40%), #020617",
  color: "#e5e7eb",
};

const headerWrap = {
  maxWidth: 900,
  margin: "0 auto 24px",
};

const eyebrow = {
  color: "#67e8f9",
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

const progressTrack = {
  height: 10,
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
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
  opacity: 0.7,
};

const glassCard = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 28,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
};

const cardTitle = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 18,
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
  color: "#e5e7eb",
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
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e5e7eb",
  cursor: "pointer",
};

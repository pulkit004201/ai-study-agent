"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_STUDIES } from "@/data/case-studies";

export default function CaseStudiesPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const cs = CASE_STUDIES[index];
  const total = CASE_STUDIES.length;

  return (
    <main style={page}>
      {/* Header */}
      <div style={headerWrap}>
        <p style={eyebrow}>PRACTICE · AI CASE STUDIES</p>
        <h1 style={headline}>Real-world AI product decisions</h1>
        <p style={subhead}>
          Understand how leading companies apply AI to solve business problems.
        </p>
      </div>

      {/* Progress */}
      <p style={counter}>
        Case Study {index + 1} of {total}
      </p>

      {/* Content Card */}
      <section style={glassCard}>
        <Block label="Company / Industry">
          {cs.company} — {cs.industry}
        </Block>

        <Block label="Business Problem">{cs.problem}</Block>

        <Block label="AI Solution">{cs.solution}</Block>

        <Block label="Impact">{cs.impact}</Block>

        {cs.source && (
          <a href={cs.source} target="_blank" style={source}>
            🔗 Source
          </a>
        )}
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

        <button style={ghostBtn} onClick={() => router.push("/dashboard")}>
          Dashboard
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

/* ---------------- Components ---------------- */

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
    "radial-gradient(1200px 600px at 30% -10%, rgba(56,189,248,0.15), transparent 40%), #020617",
  color: "#e5e7eb",
};

const headerWrap = {
  maxWidth: 900,
  margin: "0 auto 40px",
};

const eyebrow = {
  color: "#67e8f9",
  letterSpacing: "0.12em",
  fontSize: 12,
  marginBottom: 10,
};

const headline = {
  fontSize: 42,
  fontWeight: 800,
  lineHeight: 1.1,
};

const subhead = {
  marginTop: 12,
  maxWidth: 600,
  opacity: 0.8,
};

const counter = {
  maxWidth: 900,
  margin: "0 auto 12px",
  opacity: 0.6,
};

const glassCard = {
  maxWidth: 900,
  margin: "0 auto",
  padding: 28,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  backdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
};

const block = {
  marginBottom: 22,
};

const blockLabel = {
  fontSize: 13,
  letterSpacing: "0.08em",
  opacity: 0.6,
  marginBottom: 6,
};

const blockText = {
  fontSize: 16,
  lineHeight: 1.6,
};

const source = {
  display: "inline-block",
  marginTop: 6,
  color: "#38bdf8",
  fontSize: 14,
};

const nav = {
  maxWidth: 900,
  margin: "32px auto 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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

const ghostBtn = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
};

"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main style={page}>
      {/* HERO */}
      <section style={hero}>
        <span style={badge}>BUILT FOR AI LEARNERS</span>

        <h1 style={headline}>
          Modern AI learning,
          <br />
          <span style={accent}>built for real-world mastery.</span>
        </h1>

        <p style={subtext}>
          
Learn AI from first principles to applied use cases with structured concepts, interactive learning, and hands-on practice—all in one platform.
        </p>

        <div style={ctaRow}>
          <button
            style={{ ...ctaCard, ...primaryCard }}
            onClick={() => router.push("/learn")}
          >
            <span style={ctaTitle}>Learn Concepts →</span>
            <span style={ctaDesc}>Explore fundamentals with structured lessons.</span>
          </button>
        
          <button
            style={{ ...ctaCard, ...secondaryCard }}
            onClick={() => router.push("/quiz")}
          >
            <span style={ctaTitle}>Quiz Mode →</span>
            <span style={ctaDesc}>Test your understanding with quick rounds.</span>
          </button>

          <button
            style={{ ...ctaCard, ...tertiaryCard }}
            onClick={() => router.push("/visualize")}
          >
            <span style={ctaTitle}>Picture in the mind&apos;s eye →</span>
            <span style={ctaDesc}>Explore visual concepts with image-first learning.</span>
          </button>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Styles ---------------- */

const page = {
  minHeight: "100vh",
  padding: "60px 80px",
  color: "#e5e7eb",
};

const hero = {
  maxWidth: 900,
};

const badge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#0f766e",
  color: "#a7f3d0",
  fontSize: 12,
  letterSpacing: 1,
  marginBottom: 20,
};

const headline = {
  fontSize: 56,
  fontWeight: 800,
  lineHeight: 1.1,
  marginBottom: 20,
};

const accent = {
  color: "#99f6e4",
};

const subtext = {
  maxWidth: 700,
  fontSize: 18,
  opacity: 0.85,
  marginBottom: 30,
};

const ctaRow = {
  display: "flex",
  gap: 18,
  flexWrap: "wrap" as const,
  marginBottom: 60,
};

const ctaCard = {
  minWidth: 280,
  maxWidth: 360,
  flex: 1,
  padding: "24px 24px",
  borderRadius: 18,
  textAlign: "left" as const,
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
  cursor: "pointer",
  borderWidth: 1,
  borderStyle: "solid",
  transition: "transform 0.2s ease",
};

const primaryCard = {
  background: "linear-gradient(135deg, #14b8a6, #06b6d4)",
  borderColor: "#22d3ee",
  color: "#06202b",
};

const secondaryCard = {
  background: "linear-gradient(180deg, #020617, #0b1730)",
  borderColor: "#1e3a8a",
  color: "#e5e7eb",
};

const tertiaryCard = {
  background: "linear-gradient(180deg, #1f1147, #100829)",
  borderColor: "#6d28d9",
  color: "#ede9fe",
};

const ctaTitle = {
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.1,
};

const ctaDesc = {
  fontSize: 16,
  opacity: 0.8,
};

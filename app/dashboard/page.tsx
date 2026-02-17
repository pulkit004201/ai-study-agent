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
        </div>
      </section>

      
    </main>
  );
}

/* ---------------- Components ---------------- */

function FeatureCard({
  tag,
  title,
  desc,
  onClick,
}: {
  tag: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <div style={card} onClick={onClick}>
      <span style={cardTag}>{tag}</span>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardDesc}>{desc}</p>
      <span style={arrow}>→</span>
    </div>
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

const ctaTitle = {
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.1,
};

const ctaDesc = {
  fontSize: 16,
  opacity: 0.8,
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
  maxWidth: 1100,
};

const card = {
  position: "relative" as const,
  background: "linear-gradient(180deg, #020617, #020617cc)",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 24,
  cursor: "pointer",
  transition: "transform 0.2s ease, border 0.2s ease",
};

const cardTag = {
  fontSize: 11,
  letterSpacing: 1,
  opacity: 0.7,
};

const cardTitle = {
  fontSize: 20,
  marginTop: 12,
};

const cardDesc = {
  opacity: 0.75,
  marginTop: 8,
  lineHeight: 1.5,
};

const arrow = {
  position: "absolute" as const,
  bottom: 20,
  right: 20,
  fontSize: 20,
  opacity: 0.6,
};

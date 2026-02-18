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

      <section style={conceptSection}>
        <p style={sectionEyebrow}>Picture in the mind&apos;s eye</p>
        <h2 style={sectionTitle}>Core ideas behind the visuals</h2>
        <div style={conceptGrid}>
          <article style={conceptCard}>
            <h3 style={conceptTitle}>From Meaning to Numbers: How Embeddings Work</h3>
            <p style={conceptText}>
              Embedding models transform text, audio, and images into numeric vectors
              that represent meaning. Similar concepts land close together in vector
              space, enabling semantic search, recommendation, and retrieval.
            </p>
          </article>

          <article style={conceptCard}>
            <h3 style={conceptTitle}>The AI Family Tree: AI → ML → DL → LLMs/GenAI</h3>
            <p style={conceptText}>
              Artificial Intelligence is the broad field. Machine Learning is a subset
              that learns from data. Deep Learning is a specialized ML approach using
              neural networks. LLMs and Generative AI are focused applications inside
              this deeper layer.
            </p>
          </article>

          <article style={conceptCard}>
            <h3 style={conceptTitle}>One Vector Space for Many Data Types</h3>
            <p style={conceptText}>
              Documents, images, audio, and database content can all be embedded into a
              shared space. This allows one query to retrieve related information across
              multiple formats using distance and similarity between vectors.
            </p>
          </article>

          <article style={conceptCard}>
            <h3 style={conceptTitle}>Layered Intelligence: Why Generative AI Sits Inside Deep Learning</h3>
            <p style={conceptText}>
              Generative AI is built on deep learning and large-scale training data.
              Unlike classic predictive models, it synthesizes new content such as text,
              images, and code. It is a specialized capability within the broader AI
              stack, not a separate branch.
            </p>
          </article>
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

const conceptSection = {
  maxWidth: 1100,
};

const sectionEyebrow = {
  margin: 0,
  color: "#67e8f9",
  fontSize: 12,
  letterSpacing: 1.4,
  textTransform: "uppercase" as const,
};

const sectionTitle = {
  marginTop: 10,
  marginBottom: 18,
  fontSize: 34,
  lineHeight: 1.15,
  color: "#f8fafc",
};

const conceptGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 16,
};

const conceptCard = {
  background: "linear-gradient(180deg, #020617, #0b1224)",
  border: "1px solid #1f2a44",
  borderRadius: 14,
  padding: 18,
};

const conceptTitle = {
  margin: 0,
  fontSize: 19,
  lineHeight: 1.28,
  color: "#dbeafe",
};

const conceptText = {
  marginTop: 10,
  marginBottom: 0,
  fontSize: 15,
  lineHeight: 1.62,
  color: "#a9b5cb",
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

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { VISUALIZE_CONCEPTS } from "@/data/visualize";

export default function VisualizePage() {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const concept = VISUALIZE_CONCEPTS[index];

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth < 900);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  return (
    <main style={page}>
      <header style={header}>
        <p style={eyebrow}>VISUALISE</p>
        <h1 style={heading}>Learn AI concepts with visuals</h1>
        <p style={subhead}>
          Explore 10 core concepts through diagrams and simplified explanations.
        </p>
      </header>

      <section style={{ ...layout, ...(isMobile ? layoutMobile : {}) }}>
        <aside style={{ ...listPanel, ...(isMobile ? listPanelMobile : {}) }}>
          {VISUALIZE_CONCEPTS.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={item.title}
                style={{
                  ...listItem,
                  ...(active ? listItemActive : {}),
                }}
                onClick={() => setIndex(i)}
              >
                <span style={listIndex}>{String(i + 1).padStart(2, "0")}</span>
                <span style={listTitle}>{item.title}</span>
              </button>
            );
          })}
        </aside>

        <article style={card}>
          <div style={imageWrap}>
            <Image
              src={concept.image}
              alt={`${concept.title} diagram`}
              width={860}
              height={360}
              style={image}
              priority
            />
          </div>

          <div style={content}>
            <h2 style={title}>{concept.title}</h2>
            <p style={summary}>{concept.summary}</p>
            <Block label="Concept Breakdown">{concept.detail}</Block>
            <Block label="Analogy">{concept.analogy}</Block>
            <Block label="Where it is used">{concept.useCase}</Block>
          </div>
        </article>
      </section>

      <div style={nav}>
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          style={{ ...btn, opacity: index === 0 ? 0.4 : 1 }}
        >
          ← Previous
        </button>

        <span style={counter}>
          {index + 1} / {VISUALIZE_CONCEPTS.length}
        </span>

        <button
          disabled={index === VISUALIZE_CONCEPTS.length - 1}
          onClick={() => setIndex((i) => i + 1)}
          style={{ ...btn, opacity: index === VISUALIZE_CONCEPTS.length - 1 ? 0.4 : 1 }}
        >
          Next →
        </button>
      </div>
    </main>
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

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: "100vh",
  padding: "32px 20px 56px",
  background:
    "radial-gradient(1000px 500px at 10% -10%, rgba(56,189,248,0.16), transparent 48%), #020617",
  color: "#fff",
};

const header = {
  maxWidth: 1180,
  margin: "0 auto 20px",
};

const eyebrow = {
  margin: "0 0 6px",
  color: "#67e8f9",
  fontSize: 12,
  letterSpacing: "0.12em",
};

const heading = {
  margin: 0,
  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
  fontWeight: 800,
};

const subhead = {
  marginTop: 10,
  color: "#94a3b8",
  maxWidth: 720,
  lineHeight: 1.55,
};

const layout = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr)",
  gap: 18,
};

const listPanel = {
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 10,
  background: "rgba(15,23,42,0.65)",
  height: "fit-content",
  maxHeight: "72vh",
  overflowY: "auto" as const,
};

const listItem = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "40px minmax(0, 1fr)",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#cbd5e1",
  textAlign: "left" as const,
  cursor: "pointer",
  marginBottom: 8,
};

const listItemActive = {
  background: "#10284f",
  borderColor: "#2563eb",
  color: "#fff",
};

const listIndex = {
  fontSize: 12,
  color: "#7dd3fc",
};

const listTitle = {
  fontSize: 14,
  fontWeight: 600,
};

const card = {
  border: "1px solid #1e293b",
  background: "linear-gradient(180deg, rgba(2,6,23,0.92), rgba(15,23,42,0.8))",
  borderRadius: 20,
  padding: 18,
};

const imageWrap = {
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid rgba(100,116,139,0.35)",
};

const image = {
  width: "100%",
  height: "auto",
  display: "block",
};

const content = {
  padding: "16px 6px 4px",
};

const title = {
  margin: 0,
  fontSize: "clamp(1.4rem, 3vw, 2rem)",
  fontWeight: 700,
};

const summary = {
  marginTop: 8,
  color: "#cbd5e1",
  fontSize: 17,
};

const block = {
  marginTop: 14,
};

const blockLabel = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.08em",
  color: "#67e8f9",
  textTransform: "uppercase" as const,
};

const blockText = {
  marginTop: 6,
  color: "#dbeafe",
  lineHeight: 1.65,
};

const nav = {
  margin: "22px auto 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  maxWidth: 1180,
};

const btn = {
  padding: "10px 16px",
  borderRadius: 10,
  background: "#13233d",
  border: "1px solid #334155",
  color: "#fff",
  cursor: "pointer",
};

const counter = {
  opacity: 0.8,
  color: "#94a3b8",
};

const layoutMobile = {
  gridTemplateColumns: "1fr",
};

const listPanelMobile = {
  maxHeight: 260,
};

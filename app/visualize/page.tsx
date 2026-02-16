"use client";

import { useState } from "react";
import Image from "next/image";
import { VISUALIZE_CONCEPTS } from "@/data/visualize";

export default function VisualizePage() {
  const [index, setIndex] = useState(0);
  const concept = VISUALIZE_CONCEPTS[index];

  return (
    <main style={page}>
      <h1 style={heading}>Visualize AI Concepts</h1>

      <section style={card}>
        <div style={imageWrap}>
          <Image
            src={concept.image}
            alt={concept.title}
            width={420}
            height={260}
            style={{ borderRadius: 16 }}
          />
        </div>

        <div>
          <h2 style={title}>{concept.title}</h2>
          <p style={desc}>{concept.description}</p>
        </div>
      </section>

      <div style={nav}>
        <button
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          style={{ ...btn, opacity: index === 0 ? 0.4 : 1 }}
        >
          ← Back
        </button>

        <span style={counter}>
          {index + 1} / {VISUALIZE_CONCEPTS.length}
        </span>

        <button
          disabled={index === VISUALIZE_CONCEPTS.length - 1}
          onClick={() => setIndex((i) => i + 1)}
          style={{
            ...btn,
            opacity:
              index === VISUALIZE_CONCEPTS.length - 1 ? 0.4 : 1,
          }}
        >
          Next →
        </button>
      </div>
    </main>
  );
}

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: "100vh",
  padding: "60px 24px",
  background: "radial-gradient(circle at top, #0f172a, #000)",
  color: "#fff",
};

const heading = {
  fontSize: 32,
  fontWeight: 700,
  marginBottom: 32,
};

const card = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 40,
  background: "linear-gradient(180deg, #0b1220, #020617)",
  padding: 32,
  borderRadius: 20,
  maxWidth: 1000,
};

const imageWrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const title = {
  fontSize: 26,
  fontWeight: 600,
  marginBottom: 12,
};

const desc = {
  opacity: 0.85,
  fontSize: 16,
  lineHeight: 1.7,
};

const nav = {
  marginTop: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  maxWidth: 1000,
};

const btn = {
  padding: "10px 18px",
  borderRadius: 10,
  background: "#1e293b",
  border: "1px solid #334155",
  color: "#fff",
  cursor: "pointer",
};

const counter = {
  opacity: 0.6,
};

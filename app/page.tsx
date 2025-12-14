"use client";

import { useState } from "react";

const SUGGESTED_TOPICS = [
  "Large Language Models (LLMs)",
  "Prompt Engineering",
  "Retrieval Augmented Generation (RAG)",
  "AI Agents",
  "Fine-tuning vs Prompting",
  "Embeddings & Vector Databases",
  "Hallucinations in LLMs",
  "Evaluation of LLMs",
  "Multi-modal AI",
  "AI Safety & Guardrails",
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function learnTopic(selectedTopic?: string) {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic.trim()) return;

    setLoading(true);
    setResult("");
    setTopic(finalTopic);

    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: finalTopic }),
    });

    const data = await res.json();
    setResult(data.result || JSON.stringify(data, null, 2));
    setLoading(false);
  }

  return (
    <main style={{ padding: 40, maxWidth: 900 }}>
      <h1>AI Study Agent</h1>

      {/* Suggested Topics */}
      <h2 style={{ marginTop: 30 }}>Suggested Topics</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        {SUGGESTED_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => learnTopic(t)}
            style={{
              padding: 14,
              background: "#111",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              textAlign: "left",
              lineHeight: 1.4,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Manual Input */}
      <h2 style={{ marginTop: 40 }}>Explore Any Topic</h2>

      <input
        placeholder="Enter AI topic (e.g. Transformers, RAG evaluation)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{
          padding: 12,
          width: "100%",
          marginTop: 12,
          fontSize: 16,
        }}
      />

      <button
        onClick={() => learnTopic()}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          fontSize: 16,
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Learning..." : "Learn"}
      </button>

      {/* Result */}
      {result && (
        <pre
          style={{
            marginTop: 30,
            padding: 20,
            background: "#111",
            borderRadius: 10,
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
          }}
        >
          {result}
        </pre>
      )}
    </main>
  );
}

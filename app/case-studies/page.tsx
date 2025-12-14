"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CaseStudy = {
  id: number;
  company: string;
  industry: string;
  problem: string;
  solution: string;
  concepts: string[];
  impact: string;
  learnings: string;
  source: string;
  sourceLabel: string;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 1,
    company: "Amazon",
    industry: "E-commerce",
    problem:
      "Customers struggled to discover relevant products from millions of SKUs.",
    solution:
      "Amazon uses collaborative filtering and deep learning–based recommendation models that analyze user behavior, purchases, and item similarity using embeddings.",
    concepts: ["Personalization", "Embeddings", "ML"],
    impact:
      "Product recommendations contribute to ~35% of Amazon’s total revenue.",
    learnings:
      "Personalization at scale directly drives revenue and customer lifetime value.",
    source: "https://www.aboutamazon.com/news/innovation/how-amazon-personalizes-shopping",
    sourceLabel: "About Amazon – Personalization",
  },
  {
    id: 2,
    company: "Netflix",
    industry: "Media / Streaming",
    problem:
      "Users experienced choice overload due to a massive content catalog.",
    solution:
      "Netflix uses ML-based ranking systems that personalize content rows and thumbnails using viewing history and engagement signals.",
    concepts: ["ML", "Ranking Algorithms", "Personalization"],
    impact:
      "75–80% of Netflix viewing activity is driven by its recommendation system.",
    learnings:
      "Strong personalization significantly reduces churn.",
    source: "https://netflixtechblog.com/",
    sourceLabel: "Netflix Tech Blog",
  },
  {
    id: 3,
    company: "Uber",
    industry: "Logistics",
    problem:
      "Supply-demand imbalance caused longer wait times and inefficient dispatch.",
    solution:
      "Uber uses demand forecasting and ML-based dispatch systems to optimize driver positioning and ETAs.",
    concepts: ["Prediction", "ML", "Optimization"],
    impact:
      "Improved ETA accuracy and higher driver utilization across cities.",
    learnings:
      "Operational AI improves marketplace efficiency.",
    source: "https://www.uber.com/en-GB/blog/uber-driving-science/",
    sourceLabel: "Uber Engineering",
  },
  // 👉 keep remaining case studies exactly as you already have (4–10)
];

export default function CaseStudiesPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) router.push("/");
  }, [router]);

  const cs = CASE_STUDIES[index];

  return (
    <main style={{ padding: 40, maxWidth: 900 }}>
      {/* Back to Dashboard */}
      <button
        onClick={() => router.push("/dashboard")}
        style={secondaryBtn}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ marginTop: 20 }}>AI Case Studies</h1>

      {/* Progress Indicator */}
      <div style={progressContainer}>
        {CASE_STUDIES.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            style={{
              ...dot,
              backgroundColor: i === index ? "#ffffff" : "#444",
            }}
            title={`Go to case ${i + 1}`}
          />
        ))}
      </div>

      <p style={{ marginTop: 8 }}>
        Case study {index + 1} of {CASE_STUDIES.length}
      </p>

      {/* Header Card */}
      <div style={headerCard}>
        <h2>{cs.company}</h2>
        <small>{cs.industry}</small>
      </div>

      {/* Problem */}
      <div style={card}>
        <h3>Problem</h3>
        <p>{cs.problem}</p>
      </div>

      {/* AI Solution */}
      <div style={card}>
        <h3>AI Solution</h3>
        <p>{cs.solution}</p>

        <div style={{ marginTop: 10 }}>
          {cs.concepts.map((tag) => (
            <span key={tag} style={tagStyle}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Impact */}
      <div style={card}>
        <h3>Impact</h3>
        <p>{cs.impact}</p>
      </div>

      {/* PM Learning */}
      <div style={card}>
        <h3>PM Learning</h3>
        <p>{cs.learnings}</p>
      </div>

      {/* Source */}
      <div style={card}>
        <a
          href={cs.source}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#60a5fa" }}
        >
          {cs.sourceLabel} →
        </a>
      </div>

      {/* Navigation Buttons */}
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          style={primaryBtn}
        >
          ← Back
        </button>

        <button
          onClick={() =>
            setIndex((i) => Math.min(i + 1, CASE_STUDIES.length - 1))
          }
          disabled={index === CASE_STUDIES.length - 1}
          style={primaryBtn}
        >
          Next →
        </button>
      </div>
    </main>
  );
}

/* ---------- Styles ---------- */

const card = {
  marginTop: 16,
  padding: 20,
  background: "#111",
  borderRadius: 12,
};

const headerCard = {
  marginTop: 24,
  padding: 20,
  background: "#1a1a1a",
  borderRadius: 14,
};

const tagStyle = {
  display: "inline-block",
  marginRight: 8,
  marginTop: 6,
  padding: "4px 10px",
  fontSize: 12,
  background: "#333",
  borderRadius: 999,
};

const primaryBtn = {
  padding: "12px 24px",
  fontSize: 16,
  fontWeight: 600,
  backgroundColor: "#ffffff",
  color: "#000000",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "8px 16px",
  fontSize: 14,
  backgroundColor: "#2a2a2a",
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const progressContainer = {
  display: "flex",
  gap: 8,
  marginTop: 16,
};

const dot = {
  width: 12,
  height: 12,
  borderRadius: "50%",
  cursor: "pointer",
};

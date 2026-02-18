"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_STUDIES } from "@/data/case-studies";

export default function CaseStudiesPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [isIndustryMenuOpen, setIndustryMenuOpen] = useState(false);

  const industries = [
    "All Industries",
    ...Array.from(new Set(CASE_STUDIES.map((item) => item.industry))),
  ];

  const filteredCaseStudies =
    selectedIndustry === "All Industries"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((item) => item.industry === selectedIndustry);

  const total = filteredCaseStudies.length;
  const safeIndex = index >= total ? 0 : index;
  const cs = filteredCaseStudies[safeIndex];

  if (!cs) return null;

  const detailedProblem = buildDetailedProblem(cs.company, cs.problem);
  const detailedSolution = buildDetailedSolution(cs.company, cs.solution);

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
      <div style={industryWrap}>
        <p style={industryLabel}>Select Industry</p>
        <button
          type="button"
          style={industryTrigger}
          onClick={() => setIndustryMenuOpen((open) => !open)}
        >
          <span>{selectedIndustry}</span>
          <span>{isIndustryMenuOpen ? "▲" : "▼"}</span>
        </button>

        {isIndustryMenuOpen && (
          <div style={industryMenu}>
            {industries.map((industry) => {
              const active = selectedIndustry === industry;
              return (
                <button
                  key={industry}
                  type="button"
                  style={active ? { ...industryItem, ...industryItemActive } : industryItem}
                  onClick={() => {
                    setSelectedIndustry(industry);
                    setIndex(0);
                    setIndustryMenuOpen(false);
                  }}
                >
                  {industry}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p style={counter}>
        Case Study {safeIndex + 1} of {total}
      </p>

      {/* Content Card */}
      <section style={glassCard}>
        <Block label="Company / Industry">
          {cs.company} — {cs.industry}
        </Block>

        <Block label="Business Problem">{detailedProblem}</Block>

        <Block label="AI Solution">{detailedSolution}</Block>

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
          disabled={safeIndex === 0}
          onClick={() => setIndex(safeIndex - 1)}
        >
          ← Back
        </button>

        <button style={ghostBtn} onClick={() => router.push("/dashboard")}>
          Dashboard
        </button>

        <button
          style={primaryBtn}
          disabled={safeIndex === total - 1}
          onClick={() => setIndex(safeIndex + 1)}
        >
          Next →
        </button>
      </div>
    </main>
  );
}

function buildDetailedProblem(company: string, problem: string) {
  return `${company} was facing a core product and business challenge: ${problem} 
This was not just a model-quality issue; it directly affected user trust, conversion, retention, and operating efficiency. 
If the team did not solve this, the product risked weaker engagement loops, slower growth, and higher cost-to-serve over time.`;
}

function buildDetailedSolution(company: string, solution: string) {
  return `The product team approached this as a structured PM initiative: ${solution} 
Execution-wise, they defined success metrics first, aligned data, engineering, and domain teams, and rolled out the capability in controlled phases with experimentation. 
They also implemented monitoring and feedback loops so model behavior could be improved continuously after launch, ensuring the solution stayed reliable as user behavior and business context evolved.`;
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

const industryWrap = {
  maxWidth: 900,
  margin: "0 auto 12px",
  position: "relative" as const,
};

const industryLabel = {
  margin: "0 0 6px",
  fontSize: 12,
  color: "#67e8f9",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const industryTrigger = {
  width: "100%",
  maxWidth: 460,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "#08152f",
  color: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  textAlign: "left" as const,
};

const industryMenu = {
  position: "absolute" as const,
  top: 64,
  width: "100%",
  maxWidth: 460,
  maxHeight: 420, // roughly 10 options visible, then scroll
  overflowY: "auto" as const,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "#08152f",
  zIndex: 20,
};

const industryItem = {
  width: "100%",
  padding: "10px 12px",
  border: "none",
  textAlign: "left" as const,
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const industryItemActive = {
  background: "rgba(37,99,235,0.3)",
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type SummaryResponse = {
  from: string | null;
  to: string | null;
  uniqueLoggedInUsers: number;
  uniqueQuizUsers: number;
  uniqueLearnUsers: number;
  uniqueVisualizeUsers: number;
  totalEvents: number;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(formatDate(new Date(today.getTime() - 6 * 86400000)));
  const [to, setTo] = useState(formatDate(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  const loadSummary = useCallback(async (nextFrom = from, nextTo = to) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ from: nextFrom, to: nextTo });
      const res = await fetch(`/api/analytics/summary?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch analytics summary.");
      const data = (await res.json()) as SummaryResponse;
      setSummary(data);
    } catch {
      setError("Unable to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <main style={page}>
      <section style={container}>
        <p style={eyebrow}>ANALYTICS DASHBOARD</p>
        <h1 style={headline}>User Access Insights</h1>

        <div style={filtersWrap}>
          <div style={inputWrap}>
            <label style={label} htmlFor="from-date">From</label>
            <input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={input}
            />
          </div>

          <div style={inputWrap}>
            <label style={label} htmlFor="to-date">To</label>
            <input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={input}
            />
          </div>

          <button style={refreshBtn} onClick={() => loadSummary()} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <p style={errorText}>{error}</p>}

        <div style={cards}>
          <StatCard title="Unique Logged-in Users" value={summary?.uniqueLoggedInUsers ?? 0} />
          <StatCard title="Unique Quiz Users" value={summary?.uniqueQuizUsers ?? 0} />
          <StatCard title="Unique Learn Users" value={summary?.uniqueLearnUsers ?? 0} />
          <StatCard title="Unique Visualise Users" value={summary?.uniqueVisualizeUsers ?? 0} />
        </div>

        <section style={metaCard}>
          <p style={metaText}>
            Date Range: <strong>{summary?.from ?? from}</strong> to <strong>{summary?.to ?? to}</strong>
          </p>
          <p style={metaText}>
            Total tracked events: <strong>{summary?.totalEvents ?? 0}</strong>
          </p>
        </section>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <article style={card}>
      <p style={cardTitle}>{title}</p>
      <p style={cardValue}>{value}</p>
    </article>
  );
}

const page = {
  minHeight: "100vh",
  padding: "80px 24px",
  background:
    "radial-gradient(1000px 500px at 20% -10%, rgba(34,197,94,0.15), transparent 40%), #020617",
  color: "#e5e7eb",
};

const container = {
  maxWidth: 980,
  margin: "0 auto",
};

const eyebrow = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.12em",
  color: "#67e8f9",
};

const headline = {
  marginTop: 10,
  marginBottom: 20,
  fontSize: 42,
  fontWeight: 800,
  lineHeight: 1.1,
};

const filtersWrap = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 12,
  marginBottom: 16,
  alignItems: "end",
};

const inputWrap = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
};

const label = {
  fontSize: 12,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#67e8f9",
};

const input = {
  minWidth: 180,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.25)",
  background: "#0b1226",
  color: "#e2e8f0",
};

const refreshBtn = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid #1d4ed8",
  background: "#1d4ed8",
  color: "#fff",
  cursor: "pointer",
};

const errorText = {
  color: "#fda4af",
  marginBottom: 12,
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const card = {
  border: "1px solid rgba(148,163,184,0.22)",
  borderRadius: 14,
  padding: 16,
  background: "linear-gradient(180deg, #0a1224, #0f1f3f)",
};

const cardTitle = {
  margin: 0,
  fontSize: 13,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const cardValue = {
  margin: "10px 0 0",
  fontSize: 34,
  fontWeight: 800,
  color: "#f8fafc",
};

const metaCard = {
  marginTop: 16,
  border: "1px solid rgba(148,163,184,0.22)",
  borderRadius: 14,
  padding: 16,
  background: "rgba(15, 23, 42, 0.5)",
};

const metaText = {
  margin: "6px 0",
  color: "#cbd5e1",
};

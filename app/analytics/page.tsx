"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAnalyticsUserAllowed } from "@/lib/analytics-access";
import { useSectionAnalytics } from "@/lib/use-section-analytics";

type SectionStats = {
  uniqueUsers: number;
  accessEvents: number;
  sessionEvents: number;
  totalTimeMs: number;
  avgSessionSec: number;
};

type SummaryResponse = {
  from: string | null;
  to: string | null;
  uniqueLoggedInUsers: number;
  totalEvents: number;
  uniqueTrackedUsers: number;
  totalActiveTimeMs: number;
  avgSessionSecOverall: number;
  mostEngagedSection: string;
  sections: Record<string, SectionStats>;
  userBreakdown: Array<{
    userId: string;
    totalEvents: number;
    totalTimeMs: number;
    avgSessionSec: number;
    lastActiveAt: string | null;
    sections: Record<string, SectionStats>;
  }>;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (hours >= 1) {
    const remMins = Math.floor((totalSec % 3600) / 60);
    return `${hours}h ${remMins}m`;
  }
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatSeconds(totalSec: number) {
  if (totalSec >= 3600) {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
  if (totalSec >= 60) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  }
  return `${totalSec}s`;
}

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  learn: "Learn",
  quiz: "Quiz",
  visualize: "Visualise",
  movies: "Movies",
  case_studies: "Case Studies",
  resources: "Resources",
  analytics: "Analytics",
};

export default function AnalyticsPage() {
  useSectionAnalytics("analytics");

  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(formatDate(new Date(today.getTime() - 6 * 86400000)));
  const [to, setTo] = useState(formatDate(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("all");

  const loadSummary = useCallback(async (nextFrom = from, nextTo = to) => {
    const currentEmail =
      typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;

    if (!isAnalyticsUserAllowed(currentEmail)) {
      setError("You are not authorized to access analytics.");
      setSummary(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ from: nextFrom, to: nextTo });
      const res = await fetch(`/api/analytics/summary?${params.toString()}`, {
        cache: "no-store",
        headers: { "x-analytics-user": currentEmail ?? "" },
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
    const email = localStorage.getItem("userEmail");
    const allowed = isAnalyticsUserAllowed(email);
    setIsAuthorized(allowed);
    setAuthChecked(true);

    if (allowed) loadSummary();
    else setError("You are not authorized to access analytics.");
  }, [loadSummary]);

  useEffect(() => {
    const users = summary?.userBreakdown ?? [];
    if (users.length === 0) {
      setSelectedUserId("all");
      return;
    }

    if (selectedUserId === "all") return;

    const stillPresent = users.some((u) => u.userId === selectedUserId);
    if (!stillPresent) {
      setSelectedUserId(users[0].userId);
    }
  }, [summary, selectedUserId]);

  if (!authChecked) return null;

  if (!isAuthorized) {
    return (
      <main style={page}>
        <section style={container}>
          <p style={eyebrow}>ANALYTICS DASHBOARD</p>
          <h1 style={headline}>User Access Insights</h1>
          <p style={errorText}>Access denied for this account.</p>
        </section>
      </main>
    );
  }

  const sectionEntries = Object.entries(summary?.sections ?? {}).sort(
    (a, b) => b[1].totalTimeMs - a[1].totalTimeMs
  );
  const sectionCoveragePct = sectionEntries.length
    ? Math.round(
        (sectionEntries.filter(([, stats]) => stats.uniqueUsers > 0).length /
          sectionEntries.length) *
          100
      )
    : 0;
  const avgTimePerTrackedUserSec =
    !summary || summary.uniqueTrackedUsers === 0
      ? 0
      : Math.round(summary.totalActiveTimeMs / summary.uniqueTrackedUsers / 1000);
  const mostVisitedSection = sectionEntries.reduce(
    (best, current) => (current[1].accessEvents > best[1].accessEvents ? current : best),
    sectionEntries[0] ?? ["", { uniqueUsers: 0, accessEvents: 0, sessionEvents: 0, totalTimeMs: 0, avgSessionSec: 0 }]
  )[0];
  const selectedUser =
    selectedUserId === "all"
      ? null
      : (summary?.userBreakdown ?? []).find((user) => user.userId === selectedUserId) ?? null;
  const selectedUserSectionEntries = Object.entries(selectedUser?.sections ?? {}).sort(
    (a, b) => b[1].totalTimeMs - a[1].totalTimeMs
  );

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
          <StatCard title="Unique Logged-in Users" value={String(summary?.uniqueLoggedInUsers ?? 0)} />
          <StatCard title="Unique Tracked Users" value={String(summary?.uniqueTrackedUsers ?? 0)} />
          <StatCard title="Total Events" value={String(summary?.totalEvents ?? 0)} />
          <StatCard title="Total Time Spent" value={formatDuration(summary?.totalActiveTimeMs ?? 0)} />
          <StatCard title="Avg Session Time" value={formatSeconds(summary?.avgSessionSecOverall ?? 0)} />
          <StatCard title="Avg Time / Tracked User" value={formatSeconds(avgTimePerTrackedUserSec)} />
          <StatCard title="Section Coverage" value={`${sectionCoveragePct}%`} />
          <StatCard
            title="Most Visited Section"
            value={SECTION_LABELS[mostVisitedSection] ?? "-"}
          />
          <StatCard
            title="Most Engaged Section"
            value={SECTION_LABELS[summary?.mostEngagedSection ?? ""] ?? "-"}
          />
        </div>

        <section style={metaCard}>
          <p style={metaTitle}>Section-wise Analytics</p>
          <p style={metaText}>
            Date Range: <strong>{summary?.from ?? from}</strong> to <strong>{summary?.to ?? to}</strong>
          </p>

          <div style={sectionGrid}>
            {sectionEntries.map(([sectionKey, stats]) => (
              <article key={sectionKey} style={sectionCard}>
                <p style={sectionTitle}>{SECTION_LABELS[sectionKey] ?? sectionKey}</p>
                <p style={sectionStat}>Unique users: <strong>{stats.uniqueUsers}</strong></p>
                <p style={sectionStat}>Access events: <strong>{stats.accessEvents}</strong></p>
                <p style={sectionStat}>Session events: <strong>{stats.sessionEvents}</strong></p>
                <p style={sectionStat}>Time spent: <strong>{formatDuration(stats.totalTimeMs)}</strong></p>
                <p style={sectionStat}>Avg session: <strong>{stats.avgSessionSec}s</strong></p>
              </article>
            ))}
          </div>
        </section>

        <section style={metaCard}>
          <div style={userHeaderRow}>
            <div>
              <p style={metaTitle}>User-wise Analytics</p>
              <p style={metaText}>
                Select a user to inspect section-level behavior and time spent.
              </p>
            </div>
            <div style={userFilterWrap}>
              <label style={label} htmlFor="user-filter">Select user</label>
              <select
                id="user-filter"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={input}
              >
                <option value="all">All users</option>
                {(summary?.userBreakdown ?? []).map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.userId}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p style={metaTextCompact}>Tip: choose a specific user to see per-section depth.</p>
          {selectedUser ? (
            <>
              <div style={userCards}>
                <UserMetricCard title="Selected User" value={selectedUser.userId} />
                <UserMetricCard title="User Events" value={String(selectedUser.totalEvents)} />
                <UserMetricCard
                  title="User Time Spent"
                  value={formatDuration(selectedUser.totalTimeMs)}
                />
                <UserMetricCard
                  title="User Avg Session"
                  value={formatSeconds(selectedUser.avgSessionSec)}
                />
              </div>
              <p style={metaText}>
                Last active:{" "}
                <strong>
                  {selectedUser.lastActiveAt
                    ? new Date(selectedUser.lastActiveAt).toLocaleString()
                    : "-"}
                </strong>
              </p>
              <div style={sectionGrid}>
                {selectedUserSectionEntries.map(([sectionKey, stats]) => (
                  <article key={sectionKey} style={sectionCard}>
                    <p style={sectionTitle}>{SECTION_LABELS[sectionKey] ?? sectionKey}</p>
                    <p style={sectionStat}>
                      Access events: <strong>{stats.accessEvents}</strong>
                    </p>
                    <p style={sectionStat}>
                      Session events: <strong>{stats.sessionEvents}</strong>
                    </p>
                    <p style={sectionStat}>
                      Time spent: <strong>{formatDuration(stats.totalTimeMs)}</strong>
                    </p>
                    <p style={sectionStat}>
                      Avg session: <strong>{formatSeconds(stats.avgSessionSec)}</strong>
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p style={metaText}>
              Choose a user from the dropdown to open user-wise analytics.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <article style={card}>
      <p style={cardTitle}>{title}</p>
      <p style={cardValue}>{value}</p>
    </article>
  );
}

function UserMetricCard({ title, value }: { title: string; value: string }) {
  return (
    <article style={userCard}>
      <p style={cardTitle}>{title}</p>
      <p style={userCardValue}>{value}</p>
    </article>
  );
}

const page = {
  minHeight: "100vh",
  padding: "80px 24px",
  background:
    "radial-gradient(1000px 500px at 20% -10%, rgba(34,197,94,0.15), transparent 40%), var(--background)",
  color: "var(--foreground)",
};

const container = {
  maxWidth: 1080,
  margin: "0 auto",
};

const eyebrow = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.12em",
  color: "var(--hero-accent)",
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
  color: "var(--hero-accent)",
};

const input = {
  minWidth: 180,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface-alt)",
  color: "var(--foreground)",
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
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 16,
  background: "linear-gradient(180deg, var(--surface-alt), var(--surface))",
};

const cardTitle = {
  margin: 0,
  fontSize: 12,
  color: "var(--text-soft)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const cardValue = {
  margin: "10px 0 0",
  fontSize: 30,
  fontWeight: 800,
  color: "var(--foreground)",
};

const metaCard = {
  marginTop: 16,
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 16,
  background: "var(--surface)",
};

const metaTitle = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 700,
};

const metaText = {
  margin: "6px 0 12px",
  color: "var(--text-muted)",
};

const metaTextCompact = {
  margin: "0 0 12px",
  color: "var(--text-soft)",
  fontSize: 13,
};

const userHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 16,
  flexWrap: "wrap" as const,
};

const userFilterWrap = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
  minWidth: 240,
};

const userCards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const userCard = {
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 16,
  background: "linear-gradient(180deg, var(--surface-alt), var(--surface))",
};

const userCardValue = {
  margin: "10px 0 0",
  fontSize: 24,
  fontWeight: 700,
  color: "var(--foreground)",
  lineHeight: 1.2,
  wordBreak: "break-word" as const,
};

const sectionGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 10,
};

const sectionCard = {
  border: "1px solid var(--border)",
  borderRadius: 12,
  background: "var(--surface-alt)",
  padding: 12,
};

const sectionTitle = {
  margin: "0 0 8px",
  fontSize: 16,
  fontWeight: 700,
  color: "var(--foreground)",
};

const sectionStat = {
  margin: "4px 0",
  color: "var(--text-muted)",
  fontSize: 14,
};

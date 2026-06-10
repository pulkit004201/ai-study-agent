"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useSectionAnalytics } from "@/lib/use-section-analytics";

export default function DashboardPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const userName = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      window.addEventListener("focus", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("focus", handler);
      };
    },
    () => {
      const storedName = localStorage.getItem("userName")?.trim();
      const storedEmail = localStorage.getItem("userEmail")?.trim();
      return storedName || storedEmail || "Guest";
    },
    () => "Guest"
  );

  useSectionAnalytics("dashboard");

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  return (
    <main style={isMobile ? { ...page, ...pageMobile } : page}>
      <section style={hero}>
        <span style={isMobile ? { ...badge, ...badgeMobile } : badge}>BUILT FOR AI LEARNERS</span>
        <p style={isMobile ? { ...welcome, ...welcomeMobile } : welcome}>Logged in as: {userName}</p>

        <h1 style={isMobile ? { ...headline, ...headlineMobile } : headline}>
          Modern AI learning,
          <br />
          <span style={accent}>built for real-world mastery.</span>
        </h1>

        <p style={isMobile ? { ...subtext, ...subtextMobile } : subtext}>
          Learn AI from first principles to applied use cases with structured concepts, interactive
          learning, and hands-on practice-all in one platform.
        </p>

        <div style={ctaRow}>
          <button
            style={{ ...ctaCard, ...(isMobile ? ctaCardMobile : {}), ...primaryCard }}
            onClick={() => router.push("/learn")}
          >
            <span style={isMobile ? { ...ctaTitle, ...ctaTitleMobile } : ctaTitle}>Learn Concepts →</span>
            <span style={isMobile ? { ...ctaDesc, ...ctaDescMobile } : ctaDesc}>Explore fundamentals with structured lessons.</span>
          </button>

          <button
            style={{ ...ctaCard, ...(isMobile ? ctaCardMobile : {}), ...secondaryCard }}
            onClick={() => router.push("/quiz")}
          >
            <span style={isMobile ? { ...ctaTitle, ...ctaTitleMobile } : ctaTitle}>Quiz Mode →</span>
            <span style={isMobile ? { ...ctaDesc, ...ctaDescMobile } : ctaDesc}>Test your understanding with quick rounds.</span>
          </button>

          <button
            style={{ ...ctaCard, ...(isMobile ? ctaCardMobile : {}), ...tertiaryCard }}
            onClick={() => router.push("/visualize")}
          >
            <span style={isMobile ? { ...ctaTitle, ...ctaTitleMobile } : ctaTitle}>Picture in the mind&apos;s eye →</span>
            <span style={isMobile ? { ...ctaDesc, ...ctaDescMobile } : ctaDesc}>Explore visual concepts with image-first learning.</span>
          </button>
        </div>
      </section>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  padding: "60px 80px",
  color: "var(--foreground)",
};

const pageMobile = {
  padding: "28px 18px",
};

const hero = {
  maxWidth: 1100,
};

const badge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#0f766e",
  color: "#a7f3d0",
  fontSize: 12,
  letterSpacing: 1,
  marginBottom: 10,
};

const badgeMobile = {
  fontSize: 9,
  padding: "5px 10px",
};

const welcome = {
  margin: "0 0 16px",
  color: "var(--text-muted)",
  fontSize: 15,
};

const welcomeMobile = {
  margin: "0 0 10px",
  fontSize: 12,
};

const headline = {
  fontSize: 56,
  fontWeight: 800,
  lineHeight: 1.1,
  marginBottom: 20,
  color: "var(--foreground)",
};

const headlineMobile = {
  fontSize: 20,
  lineHeight: 1.22,
  marginBottom: 10,
};

const accent = {
  color: "var(--hero-accent)",
};

const subtext = {
  maxWidth: 700,
  fontSize: 18,
  color: "var(--text-muted)",
  marginBottom: 30,
};

const subtextMobile = {
  fontSize: 11,
  lineHeight: 1.5,
  marginBottom: 14,
};

const ctaRow = {
  display: "flex",
  gap: 18,
  flexWrap: "wrap" as const,
  marginBottom: 30,
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

const ctaCardMobile = {
  minWidth: "100%",
  padding: "16px",
  borderRadius: 14,
  gap: 5,
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

const ctaTitleMobile = {
  fontSize: 16,
  lineHeight: 1.2,
};

const ctaDesc = {
  fontSize: 16,
  opacity: 0.8,
};

const ctaDescMobile = {
  fontSize: 12,
};

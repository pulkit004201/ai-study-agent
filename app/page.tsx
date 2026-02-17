"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Please enter your email to continue.");
      return;
    }

    localStorage.setItem("userEmail", normalizedEmail);
    router.push("/dashboard");
  }

  return (
    <main className={styles.page}>
      <div className={styles.backdrop} />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>AI STUDY AGENT</p>
        <h1 className={styles.title}>
          Learn AI with
          <span> structured practice and real-world thinking.</span>
        </h1>
        <p className={styles.description}>
          Move from concepts to execution with guided lessons, scenario-based
          case studies, and fast quiz loops.
        </p>

        <div className={styles.metrics}>
          <Metric label="Learning tracks" value="4" />
          <Metric label="Quiz questions" value="20+" />
          <Metric label="Case studies" value="Curated" />
        </div>
      </section>

      <section className={styles.card}>
        <span className={styles.badge}>WELCOME BACK</span>
        <h2 className={styles.cardTitle}>Pick up your AI learning journey</h2>
        <p className={styles.cardText}>
          Use any email to enter the demo workspace.
        </p>

        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.primaryBtn} onClick={handleLogin}>
          Enter Dashboard
        </button>
        <p className={styles.hint}>No password required for this demo.</p>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <p className={styles.metricValue}>{value}</p>
      <p className={styles.metricLabel}>{label}</p>
    </div>
  );
}

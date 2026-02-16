"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (!email) return;

    // mock auth (replace later)
    localStorage.setItem("userEmail", email);
    router.push("/dashboard");
  }

  return (
    <main style={page}>
      {/* Brand */}
      <header style={brand}>
      
      </header>

      {/* Login Card */}
      <section style={card}>
        <span style={badge}>WELCOME BACK</span>

        <h1 style={headline}>
          Log in to
          <br />
          <span style={accent}>AI LEARN HUB</span>
        </h1>

        <p style={subtext}>
          Continue learning AI concepts designed for real-world execution.
        </p>

        <input
          style={input}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button style={primaryBtn} onClick={handleLogin}>
          Enter Dashboard →
        </button>

        <p style={hint}>
          This is a demo login. No password required.
        </p>
      </section>
    </main>
  );
}

/* ---------------- Styles ---------------- */

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at top right, #0f766e44, transparent 40%), #020617",
  color: "#e5e7eb",
};

const brand = {
  position: "absolute" as const,
  top: 30,
  left: 40,
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const logo = {
  width: 36,
  height: 36,
  borderRadius: 12,
  background: "#0f766e",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
};

const tagline = {
  margin: 0,
  fontSize: 12,
  opacity: 0.7,
};

const card = {
  width: 420,
  padding: 36,
  borderRadius: 20,
  background:
    "linear-gradient(180deg, rgba(2,6,23,0.9), rgba(2,6,23,0.8))",
  border: "1px solid #1f2937",
  boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
};

const badge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#0f766e",
  color: "#99f6e4",
  fontSize: 11,
  letterSpacing: 1,
  marginBottom: 20,
};

const headline = {
  fontSize: 32,
  fontWeight: 800,
  lineHeight: 1.2,
};

const accent = {
  color: "#99f6e4",
};

const subtext = {
  marginTop: 12,
  opacity: 0.75,
  marginBottom: 24,
};

const input = {
  width: "100%",
  padding: "12px 14px",
  marginTop: 12,
  borderRadius: 10,
  background: "#020617",
  border: "1px solid #1f2937",
  color: "#e5e7eb",
  outline: "none",
};

const primaryBtn = {
  width: "100%",
  marginTop: 20,
  padding: "12px 16px",
  borderRadius: 999,
  background: "#14b8a6",
  color: "#020617",
  fontWeight: 700,
  cursor: "pointer",
  border: "none",
};

const hint = {
  marginTop: 16,
  fontSize: 12,
  opacity: 0.6,
  textAlign: "center" as const,
};

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleSubmit() {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    localStorage.setItem("userEmail", email);
    localStorage.removeItem("conceptsCompleted"); // reset progress on new login
    setError("");
    router.push("/dashboard");
  }

  return (
    <main style={{ padding: 40, maxWidth: 500 }}>
      <h1>Welcome AI Learner</h1>
      <p>Learn AI concepts, validate with quizzes, explore real case studies.</p>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          fontSize: 16,
        }}
      />

      {error && (
        <p style={{ color: "red", marginTop: 8 }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 16,
          padding: "12px 24px",
          fontSize: 16,
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Continue →
      </button>
    </main>
  );
}

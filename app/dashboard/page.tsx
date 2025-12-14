"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const completed = localStorage.getItem("conceptsCompleted");

    if (!storedEmail) {
      router.push("/");
      return;
    }

    setEmail(storedEmail);
    setProgress(completed ? Number(completed) : 0);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("conceptsCompleted");
    router.push("/");
  }

  if (!email) return null;

  return (
    <main style={{ padding: 40, maxWidth: 900, position: "relative" }}>
      {/* Logout */}
      
      <h1>Dashboard</h1>
      <p style={{ marginTop: 8 }}>
        Welcome, <strong>{email}</strong>
      </p>

      {/* Progress */}
      <div style={{ marginTop: 30 }}>
        <p>Learning Progress</p>
        <div
          style={{
            background: "#333",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(progress / 5) * 100}%`,
              background: "#4ade80",
              padding: 6,
            }}
          />
        </div>
        <small>{progress}/5 concepts completed</small>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 30 }}>
        <button
          onClick={() => router.push("/learn")}
          style={btnStyle}
        >
          Continue Learning
        </button>

        <button
          onClick={() => router.push("/case-studies")}
          style={{ ...btnStyle, marginLeft: 12 }}
        >
          Explore Case Studies
        </button>
      </div>
    </main>
  );
}

const btnStyle = {
  padding: "12px 24px",
  fontSize: 16,
  cursor: "pointer",
};

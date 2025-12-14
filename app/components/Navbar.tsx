"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("conceptsCompleted");
    router.push("/");
  }

  return (
    <nav style={navStyle}>
      {/* Left */}
      <div style={leftStyle}>
        <span style={logoStyle}>AI Learn Hub</span>

        <button onClick={() => router.push("/dashboard")} style={linkBtn}>
          Dashboard
        </button>

        <button onClick={() => router.push("/learn")} style={linkBtn}>
          Learn
        </button>

        <button onClick={() => router.push("/case-studies")} style={linkBtn}>
          Case Studies
        </button>
      </div>

      {/* Right */}
      <button onClick={handleLogout} style={logoutBtn}>
        Logout
      </button>
    </nav>
  );
}

/* -------- Styles -------- */

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 32px",
  borderBottom: "1px solid #222",
  background: "#000",
};

const leftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const logoStyle = {
  fontWeight: 700,
  fontSize: 18,
  marginRight: 20,
};

const linkBtn = {
  background: "transparent",
  border: "none",
  color: "#ffffff",
  fontSize: 14,
  cursor: "pointer",
};

const logoutBtn = {
  backgroundColor: "#ef4444",
  border: "none",
  color: "#ffffff",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

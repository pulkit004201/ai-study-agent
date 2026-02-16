"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Learn", path: "/learn" },
    { label: "Case Studies", path: "/case-studies" },
    { label: "Quiz", path: "/quiz" },
  ];

  return (
    <nav style={styles.nav}>
      {/* Brand */}
      <div style={styles.brand} >
        AI Learn Hub
      </div>

      {/* Nav buttons */}
      <div style={styles.menu}>
        {navItems.map((item) => {
          const active = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                ...styles.button,
                ...(active ? styles.activeButton : {}),
              }}
            >
              {item.label}
            </button>
          );
        })}

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          style={{ ...styles.button, ...styles.logout }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#1f2937",
  },

  brand: {
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    cursor: "pointer",
  },

  menu: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  button: {
    padding: "8px 16px",
    borderRadius: 999,
    backgroundColor: "#111827",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 14,

    /* 👇 IMPORTANT: no shorthand border */
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#1f2937",

    transition: "all 0.2s ease",
  },

  activeButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#ffffff",
  },

  logout: {
    backgroundColor: "#7f1d1d",
    borderColor: "#991b1b",
    color: "#ffffff",
  },
};

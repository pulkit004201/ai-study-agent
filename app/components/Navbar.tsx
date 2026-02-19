"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncViewport = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile, menuOpen]);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Learn", path: "/learn" },
    { label: "Visualise", path: "/visualize" },
    { label: "Analytics", path: "/analytics" },
    { label: "Case Studies", path: "/case-studies" },
    { label: "Quiz", path: "/quiz" },
  ];

  function handleLogout() {
    localStorage.clear();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <>
      <nav style={styles.nav}>
        {/* Brand */}
        <div style={styles.brand} >
          AI Learn Hub
        </div>

        {!isMobile && (
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
            <button onClick={handleLogout} style={{ ...styles.button, ...styles.logout }}>
              Logout
            </button>
          </div>
        )}

        {isMobile && (
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
            style={styles.hamburger}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {isMobile && menuOpen && <button style={styles.overlay} onClick={() => setMenuOpen(false)} />}

      {isMobile && (
        <aside
          style={{
            ...styles.drawer,
            ...(menuOpen ? styles.drawerOpen : {}),
          }}
        >
          <div style={styles.drawerTitle}>Menu</div>
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  setMenuOpen(false);
                  router.push(item.path);
                }}
                style={{
                  ...styles.drawerButton,
                  ...(active ? styles.drawerActive : {}),
                }}
              >
                {item.label}
              </button>
            );
          })}
          <button onClick={handleLogout} style={{ ...styles.drawerButton, ...styles.drawerLogout }}>
            Logout
          </button>
        </aside>
      )}

      <div style={styles.spacer} />
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    backdropFilter: "blur(8px)",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#1f2937",
  },

  spacer: {
    height: 73,
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

  hamburger: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#1f2937",
    backgroundColor: "#0f172a",
    color: "#e5e7eb",
    fontSize: 22,
    cursor: "pointer",
    lineHeight: 1,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1100,
    border: "none",
    background: "rgba(2,6,23,0.55)",
    padding: 0,
    cursor: "pointer",
  },

  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: 270,
    height: "100vh",
    zIndex: 1200,
    padding: "90px 16px 20px",
    background: "#020617",
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: "#1f2937",
    transform: "translateX(100%)",
    transition: "transform 0.24s ease",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  drawerOpen: {
    transform: "translateX(0)",
  },

  drawerTitle: {
    marginBottom: 6,
    color: "#94a3b8",
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  drawerButton: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#1f2937",
    background: "#0f172a",
    color: "#e5e7eb",
    textAlign: "left",
    fontSize: 16,
    cursor: "pointer",
  },

  drawerActive: {
    background: "#1d4ed8",
    borderColor: "#2563eb",
    color: "#ffffff",
  },

  drawerLogout: {
    marginTop: 8,
    background: "#7f1d1d",
    borderColor: "#991b1b",
    color: "#ffffff",
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

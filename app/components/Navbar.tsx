"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAnalyticsUserAllowed } from "@/lib/analytics-access";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }
    return localStorage.getItem("theme-preference") === "light"
      ? "light"
      : "dark";
  });
  const canViewAnalytics = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleChange = () => onStoreChange();
      window.addEventListener("storage", handleChange);
      window.addEventListener("focus", handleChange);
      return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener("focus", handleChange);
      };
    },
    () =>
      typeof window !== "undefined" &&
      isAnalyticsUserAllowed(localStorage.getItem("userEmail")),
    () => false
  );
  const userEmail = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const handleChange = () => onStoreChange();
      window.addEventListener("storage", handleChange);
      window.addEventListener("focus", handleChange);
      return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener("focus", handleChange);
      };
    },
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("userEmail")?.trim().toLowerCase() || "Guest"
        : "Guest",
    () => "Guest"
  );

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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Learn", path: "/learn" },
    { label: "Visualise", path: "/visualize" },
    { label: "Movies", path: "/movies" },
    { label: "Quiz", path: "/quiz" },
    { label: "Resources", path: "/resources" },
  ];
  if (canViewAnalytics) {
    navItems.splice(3, 0, { label: "Analytics", path: "/analytics" });
  }

  function handleLogout() {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPicture");
    setMenuOpen(false);
    setAccountOpen(false);
    router.push("/");
  }

  function handleThemeChange(nextTheme: "dark" | "light") {
    setTheme(nextTheme);
    localStorage.setItem("theme-preference", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }

  if (pathname === "/") {
    return null;
  }

  return (
    <>
      <nav style={isMobile ? { ...styles.nav, ...styles.navMobile } : styles.nav}>
        {/* Brand */}
        <div style={isMobile ? { ...styles.brand, ...styles.brandMobile } : styles.brand} >
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

            <div style={styles.accountWrap}>
              <button
                onClick={() => setAccountOpen((open) => !open)}
                aria-label="Account"
                style={{
                  ...styles.accountIconBtn,
                  ...(accountOpen ? styles.accountIconBtnActive : {}),
                }}
              >
                <span style={styles.accountIcon}>👤</span>
              </button>

              {accountOpen && (
                <div style={styles.accountDropdown}>
                  <p style={styles.mobileAccountTitle}>Theme</p>
                  <div style={styles.themeToggleWrap}>
                    <button
                      aria-label="Enable dark theme"
                      onClick={() => handleThemeChange("dark")}
                      style={{
                        ...styles.themeToggleBtn,
                        ...(theme === "dark" ? styles.themeToggleBtnActive : {}),
                      }}
                    >
                      Dark
                    </button>
                    <button
                      aria-label="Enable light theme"
                      onClick={() => handleThemeChange("light")}
                      style={{
                        ...styles.themeToggleBtn,
                        ...(theme === "light" ? styles.themeToggleBtnActive : {}),
                      }}
                    >
                      Light
                    </button>
                  </div>
                  <span style={styles.emailTag}>{userEmail}</span>
                  <button
                    onClick={handleLogout}
                    style={{ ...styles.button, ...styles.logout, ...styles.accountLogoutBtn }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isMobile && (
          <button
            aria-label="Toggle menu"
            onClick={() => {
              setMenuOpen((open) => !open);
              setAccountOpen(false);
            }}
            style={styles.hamburger}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {isMobile && menuOpen && (
        <button
          style={styles.overlay}
          onClick={() => {
            setMenuOpen(false);
            setAccountOpen(false);
          }}
        />
      )}

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
                  setAccountOpen(false);
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
          <div style={styles.mobileAccountBlock}>
            <p style={styles.mobileAccountTitle}>Theme</p>
            <div style={styles.themeToggleWrapMobile}>
              <button
                aria-label="Enable dark theme"
                onClick={() => handleThemeChange("dark")}
                style={{
                  ...styles.themeToggleBtn,
                  ...(theme === "dark" ? styles.themeToggleBtnActive : {}),
                }}
              >
                Dark
              </button>
              <button
                aria-label="Enable light theme"
                onClick={() => handleThemeChange("light")}
                style={{
                  ...styles.themeToggleBtn,
                  ...(theme === "light" ? styles.themeToggleBtnActive : {}),
                }}
              >
                Light
              </button>
            </div>
            <p style={styles.mobileAccountTitle}>Account</p>
            <span style={styles.mobileEmailTag}>{userEmail}</span>
            <button onClick={handleLogout} style={{ ...styles.drawerButton, ...styles.drawerLogout }}>
              Logout
            </button>
          </div>
        </aside>
      )}

      <div style={isMobile ? { ...styles.spacer, ...styles.spacerMobile } : styles.spacer} />
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
    backgroundColor: "var(--nav-bg)",
    backdropFilter: "blur(8px)",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--border)",
  },

  navMobile: {
    padding: "12px 16px",
  },

  spacer: {
    height: 73,
  },

  spacerMobile: {
    height: 62,
  },

  brand: {
    fontSize: 20,
    fontWeight: 800,
    color: "var(--foreground)",
    cursor: "pointer",
  },

  brandMobile: {
    fontSize: 16,
  },

  menu: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  hamburger: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--nav-button-border)",
    backgroundColor: "var(--nav-button-bg)",
    color: "var(--nav-button-text)",
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
    background: "var(--surface)",
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: "var(--border)",
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
    borderColor: "var(--nav-button-border)",
    background: "var(--nav-button-bg)",
    color: "var(--nav-button-text)",
    textAlign: "left",
    fontSize: 16,
    cursor: "pointer",
  },

  drawerActive: {
    background: "var(--nav-button-active)",
    borderColor: "var(--nav-button-active-border)",
    color: "var(--nav-button-active-text)",
  },

  drawerLogout: {
    marginTop: 10,
    background: "var(--danger-bg)",
    borderColor: "var(--danger-border)",
    color: "var(--danger-text)",
  },

  accountWrap: {
    position: "relative",
  },

  accountDropdown: {
    position: "absolute",
    right: 0,
    top: 44,
    minWidth: 240,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
    background: "var(--account-dropdown-bg)",
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 12px 34px rgba(0,0,0,0.45)",
    zIndex: 1500,
  },

  emailTag: {
    display: "inline-block",
    maxWidth: 220,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "6px 10px",
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(147, 197, 253, 0.5)",
    color: "var(--account-email-text)",
    background: "var(--account-email-bg)",
    fontSize: 12,
  },

  accountIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--nav-button-border)",
    backgroundColor: "var(--nav-button-bg)",
    color: "var(--nav-button-text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 18,
    transition: "all 0.2s ease",
  },

  accountIconBtnActive: {
    backgroundColor: "var(--nav-button-active)",
    borderColor: "var(--nav-button-active-border)",
    color: "var(--nav-button-active-text)",
  },

  accountIcon: {
    lineHeight: 1,
  },

  accountLogoutBtn: {
    width: "100%",
    textAlign: "center",
  },

  button: {
    padding: "9px 16px",
    borderRadius: 8,
    backgroundColor: "transparent",
    color: "var(--nav-button-text)",
    cursor: "pointer",
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",

    /* 👇 IMPORTANT: no shorthand border */
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--nav-button-border)",

    transition: "all 0.18s ease",
  },

  activeButton: {
    backgroundColor: "var(--nav-button-active)",
    borderColor: "var(--nav-button-active-border)",
    color: "var(--nav-button-active-text)",
  },

  logout: {
    backgroundColor: "var(--danger-bg)",
    borderColor: "var(--danger-border)",
    color: "var(--danger-text)",
  },

  mobileAccountBlock: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "var(--border)",
    paddingTop: 10,
  },

  mobileAccountTitle: {
    margin: "0 0 8px",
    color: "#94a3b8",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  mobileEmailTag: {
    display: "inline-block",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "6px 10px",
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(147, 197, 253, 0.5)",
    color: "var(--account-email-text)",
    background: "var(--account-email-bg)",
    fontSize: 12,
  },

  themeToggleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  themeToggleWrapMobile: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  themeToggleBtn: {
    padding: "8px 12px",
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--nav-button-border)",
    backgroundColor: "var(--nav-button-bg)",
    color: "var(--nav-button-text)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  themeToggleBtnActive: {
    backgroundColor: "var(--nav-button-active)",
    borderColor: "var(--nav-button-active-border)",
    color: "var(--nav-button-active-text)",
  },
};

"use client";

// React Imports
import { useState } from "react";

// Next Imports
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

// MUI Imports
import useMediaQuery from "@mui/material/useMediaQuery";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useColorScheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";

// Third-party Imports
import classnames from "classnames";

// Type Imports
import type { Mode } from "@core/types";

// Component Imports
import ModeDropdown from "@components/layout/shared/ModeDropdown";
import FrontMenu from "./FrontMenu";

// Util Imports
import { frontLayoutClasses } from "@layouts/utils/layoutClasses";

// Styles Imports
import styles from "./styles.module.css";
import Logo from "@/@core/svg/Logo";
import { useParams } from "next/navigation";

const Header = ({ mode }: { mode: Mode }) => {
  const { lang: locale } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;

  const { mode: muiMode, systemMode } = useColorScheme();
  const isDark = (muiMode === "system" ? systemMode : muiMode) === "dark";

  const isBelowLgScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg")
  );

  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true,
  });

  // Background: dark = semi-transparent dark purple, light = semi-transparent white/light
  const navBg = isDark ? "rgba(30, 13, 69, 0.85)" : "rgba(237, 232, 245, 0.92)";
  const fontFamily = '"Baloo 2", sans-serif';

  return (
    <header
      className={classnames(frontLayoutClasses.header, styles.header)}
      dir="rtl"
      style={{
        background: navBg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
    >
      <div
        className={classnames(frontLayoutClasses.navbar, styles.navbar, {
          [styles.headerScrolled]: trigger,
        })}
        style={{
          width: "100%",
          maxWidth: "none",
          paddingInline: "0",
          background: "transparent",
        }}
      >
        {/* Container */}
        <div
          className="container"
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            paddingInline: "1.5rem",
          }}
        >
          <div
            className={classnames(
              frontLayoutClasses.navbarContent,
              styles.navbarContent
            )}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              width: "100%",
            }}
          >
            {/* ── Logo (always right in RTL) ── */}
            <Link
              href="/ar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <Logo height={isBelowLgScreen ? 36 : 44} />
              <span
                style={{
                  fontFamily: fontFamily,
                  fontWeight: 800,
                  fontSize: isBelowLgScreen ? "18px" : "22px",
                  color: "var(--mui-palette-text-primary)",
                  letterSpacing: "-0.3px",
                  whiteSpace: "nowrap",
                }}
              >
                Teacher Ai
              </span>
            </Link>

            {/* ── Center nav links (desktop only) ── */}
            {!isBelowLgScreen && (
              <FrontMenu
                mode={mode}
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
              />
            )}

            {/* ── Right-side actions ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              {/* Dark mode toggle */}
              <ModeDropdown />

              {!isBelowLgScreen ? (
                /* Desktop auth buttons — always shown (no loading gate) */
                !session ? (
                  <>
                    {/* تسجيل الدخول button */}
                    <Link
                      href="/ar/login"
                      style={{
                        display: "inline-flex",
                        height: "40px",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 25px",
                        gap: "10px",
                        borderRadius: "100px",
                        border: "1.25px solid rgba(255,255,255,0.20)",
                        background: isDark
                          ? "transparent"
                          : "rgba(255,255,255,0.15)",
                        fontFamily: '"Readex Pro", sans-serif',
                        fontWeight: 600,
                        fontSize: "15px",
                        color: "var(--mui-palette-text-primary)",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        transition: "border-color 0.2s, background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "rgba(255,255,255,0.45)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "rgba(255,255,255,0.20)";
                      }}
                    >
                      تسجيل الدخول
                    </Link>

                    {/* ابدأ مجاناً button */}
                    <Link
                      href="/ar/register"
                      style={{
                        display: "inline-flex",
                        height: "40px",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 25px",
                        gap: "10px",
                        borderRadius: "100px",
                        border: "1.25px solid rgba(255,255,255,0.20)",
                        background:
                          "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)",
                        fontFamily: '"Readex Pro", sans-serif',
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "#FFFFFF",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        boxShadow: "0 0 20px 0 rgba(105,72,184,0.50)",
                        transition: "opacity 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "0.88";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 0 28px 0 rgba(105,72,184,0.70)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "1";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 0 20px 0 rgba(105,72,184,0.50)";
                      }}
                    >
                      ابدأ مجاناً
                    </Link>
                  </>
                ) : null
              ) : (
                /* Mobile hamburger */
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  aria-label="فتح القائمة"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border: "1.5px solid var(--mui-palette-divider)",
                    background: "transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line
                      x1="3"
                      y1="6"
                      x2="21"
                      y2="6"
                    />
                    <line
                      x1="3"
                      y1="12"
                      x2="21"
                      y2="12"
                    />
                    <line
                      x1="3"
                      y1="18"
                      x2="21"
                      y2="18"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {isBelowLgScreen && (
          <FrontMenu
            mode={mode}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
          />
        )}
      </div>
    </header>
  );
};

export default Header;

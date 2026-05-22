"use client";
// React Imports
import React, { useState, useCallback, memo } from "react";

// Third-party Imports
import classnames from "classnames";
import { useParams, usePathname } from "next/navigation";
import { useTheme, useMediaQuery, Typography } from "@mui/material";

// Type Imports
import type { Locale } from "@configs/i18n";

// Component Imports
import Link from "@components/Link";
import HomeSidebar from "@/components/home/HomeSidebar";

// Util Imports
import { verticalLayoutClasses } from "@layouts/utils/layoutClasses";
import UserDropdown from "../shared/UserDropdown";
import Logo from "@/@core/svg/Logo";
import { getLocalizedUrl } from "@/utils/i18n";
import { useSettings } from "@core/hooks/useSettings";
import { useCoreUISound } from "@/hooks/useCoreUISound";

// ─── Component ────────────────────────────────────────────────────────────────

const NavbarContent = memo(() => {
  const { lang: locale } = useParams();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDark = theme.palette.mode === "dark";
  const { settings, updateSettings } = useSettings();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { play } = useCoreUISound();

  const logoSize = isMobile ? 32 : isTablet ? 36 : 40;

  const handleToggleDark = () => {
    play("ui-theme-toggle");
    updateSettings({ mode: settings.mode === "dark" ? "light" : "dark" });
  };

  // ─── Hamburger icon ───────────────────────────────────────────────────────────

  const navBtnBg = isDark ? "rgba(255,255,255,0.08)" : "#FFF";
  const navBtnShadow = isDark
    ? "0 2px 6px 0 rgba(0,0,0,0.3)"
    : "0 2px 6px 0 rgba(0,0,0,0.08)";

  const HamburgerIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="20"
      viewBox="0 0 18 16"
      fill="none"
    >
      <path
        d="M1 1H17M1 8H17M1 15H17"
        stroke={isDark ? "#FFF" : "#5531A8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <React.Fragment>
      <div
        className={classnames(verticalLayoutClasses.navbarContent)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: isDark
            ? "1px solid rgba(245, 240, 255, 0.10)"
            : "1px solid rgba(105, 72, 184, 0.10)",
          background: isDark ? "rgba(105, 72, 184, 0.92)" : "#fff",
          margin: "auto",
          width: "100%",
        }}
      >
        <div
          className="page-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "16px 65px",
            minHeight: "70px",
            position: "relative",
          }}
        >
          {/* Right: hamburger */}
          <button
            onClick={() => {
              play("ui-menu-toggle");
              setSidebarOpen(true);
            }}
            aria-label="Open navigation menu"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "12px",
              background: navBtnBg,
              boxShadow: navBtnShadow,
              width: "48px",
              height: "48px",
              border: "none",
              transition: "background 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <HamburgerIcon />
          </button>

          {/* Center: Logo + brand name inline - absolutely positioned */}
          <Link
            href={getLocalizedUrl("/apps/home", locale as Locale)}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <Typography
              component="span"
              style={{
                fontFamily: '"Baloo 2", sans-serif',
                fontSize: isMobile ? "20px" : isTablet ? "24px" : "28px",
                fontWeight: 700,
                color: isDark ? "#F5F0FF" : "#3E256B",
                lineHeight: 1,
                whiteSpace: "nowrap",
                letterSpacing: "-0.5px",
              }}
            >
              Teacher AI
            </Typography>
            <Logo
              height={logoSize}
              width={logoSize}
            />
          </Link>

          {/* Left: user dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {pathname?.includes("/apps/chat") && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("toggle-chat-sidebar"));
                }}
                aria-label="chat history"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: "12px",
                  background: navBtnBg,
                  boxShadow: navBtnShadow,
                  width: "48px",
                  height: "48px",
                  border: "none",
                  transition: "background 0.2s ease, transform 0.2s ease",
                  color: isDark ? "#ffffff" : "#5531A8",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 12C3 13.78 3.52784 15.5201 4.51677 17.0001C5.50571 18.4802 6.91131 19.6337 8.55585 20.3149C10.2004 20.9961 12.01 21.1743 13.7558 20.8271C15.5016 20.4798 17.1053 19.6226 18.364 18.364C19.6226 17.1053 20.4798 15.5016 20.8271 13.7558C21.1743 12.01 20.9961 10.2004 20.3149 8.55585C19.6337 6.91131 18.4802 5.50571 17.0001 4.51677C15.5201 3.52784 13.78 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8M3 8V3M3 8H8M12 7V12L16 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <UserDropdown />
          </div>

          {/* Sidebar drawer */}
          <HomeSidebar
            open={sidebarOpen}
            onClose={() => {
              play("ui-menu-toggle");
              setSidebarOpen(false);
            }}
            isDark={isDark}
            onToggleDark={handleToggleDark}
          />
        </div>
      </div>
    </React.Fragment>
  );
});

NavbarContent.displayName = "NavbarContent";

export default NavbarContent;

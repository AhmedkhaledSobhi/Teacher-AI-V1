"use client";

// MUI Imports
import { useColorScheme } from "@mui/material";

/**
 * Reusable skeleton shimmer blocks used while the NextAuth session is loading.
 * variant="navbar"  – compact horizontal badge (used in UserDropdown)
 * variant="sidebar" – larger vertical header (used in Navigation + HomeSidebar)
 */

const shimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(105,72,184,0.10) 25%, rgba(105,72,184,0.20) 50%, rgba(105,72,184,0.10) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 2s infinite",
  borderRadius: 8,
};

type Props = { variant: "navbar" | "sidebar" };

export default function UserInfoSkeleton({ variant }: Props) {
  const { mode: muiMode, systemMode } = useColorScheme();
  const resolvedMode = muiMode === "system" ? systemMode : muiMode;
  const isDark = resolvedMode === "dark";

  // Shimmer colors adapt to dark/light background
  const shimmerBase = isDark
    ? "rgba(255,255,255,0.07)"
    : "rgba(105,72,184,0.10)";
  const shimmerPeak = isDark
    ? "rgba(255,255,255,0.14)"
    : "rgba(105,72,184,0.22)";

  const shimmerStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, ${shimmerBase} 25%, ${shimmerPeak} 50%, ${shimmerBase} 75%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer 2s infinite",
    borderRadius: 8,
  };

  if (variant === "navbar") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "3px 10px",
          border: `1.3px solid ${isDark ? "rgba(212,189,255,0.25)" : "#D4BDFF"}`,
          borderRadius: 12,
          boxShadow: "0 2px 6px 0 rgba(0,0,0,0.08)",
          height: "100%",
          overflow: "hidden",
        }}
        aria-busy="true"
        aria-label="جارٍ تحميل بيانات المستخدم"
      >
        {/* Avatar circle */}
        <div
          style={{
            ...shimmerStyle,
            width: 38,
            height: 38,
            borderRadius: "50%",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        {/* Name + grade lines */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 5 }}
          aria-hidden="true"
        >
          <div style={{ ...shimmerStyle, width: 72, height: 11 }} />
          <div style={{ ...shimmerStyle, width: 50, height: 9 }} />
        </div>
      </div>
    );
  }

  // variant === "sidebar"
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 14 }}
      aria-busy="true"
      aria-label="جارٍ تحميل بيانات المستخدم"
    >
      {/* Large avatar circle */}
      <div
        style={{
          ...shimmerStyle,
          width: 70,
          height: 70,
          borderRadius: "50%",
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {/* Name + grade lines */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
        aria-hidden="true"
      >
        <div style={{ ...shimmerStyle, width: 110, height: 16 }} />
        <div style={{ ...shimmerStyle, width: 76, height: 13 }} />
      </div>
    </div>
  );
}

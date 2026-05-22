"use client";

// MUI Imports
import { useColorScheme } from "@mui/material";

/**
 * Skeleton placeholder that mirrors ConversationItem's layout.
 * Renders a shimmer animation that matches the icon box + text + button structure.
 * Adapts shimmer colors for dark and light backgrounds via useColorScheme.
 */

interface ConversationItemSkeletonProps {
  /** Number of skeleton rows to render. Defaults to 3. */
  count?: number;
}

export default function ConversationItemSkeleton({
  count = 3,
}: ConversationItemSkeletonProps) {
  const { mode: muiMode, systemMode } = useColorScheme();
  const resolvedMode = muiMode === "system" ? systemMode : muiMode;
  const isDark = resolvedMode === "dark";

  // Two-stop shimmer that reads well on both light and dark card backgrounds
  const shimmerBase = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(105,72,184,0.08)";
  const shimmerPeak = isDark
    ? "rgba(255,255,255,0.13)"
    : "rgba(105,72,184,0.18)";

  const shimmer: React.CSSProperties = {
    background: `linear-gradient(90deg, ${shimmerBase} 25%, ${shimmerPeak} 50%, ${shimmerBase} 75%)`,
    backgroundSize: "200% 100%",
    animation: "shimmer 2s infinite",
    borderRadius: 8,
  };

  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const cardBorder = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(212,189,255,0.18)";
  const cardShadow = isDark ? "none" : "0 2px 12px 0 rgba(105,72,184,0.06)";

  const iconBoxBg = isDark ? "rgba(229,57,53,0.12)" : "rgba(229,57,53,0.08)";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      aria-busy="true"
      aria-label="جارٍ تحميل المحادثات"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          dir="rtl"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "clamp(14px, 2vw, 18px) clamp(16px, 2.5vw, 24px)",
            borderRadius: 20,
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow,
          }}
          aria-hidden="true"
        >
          {/* Right side: icon box + text lines */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Icon box placeholder */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: iconBoxBg,
                flexShrink: 0,
                ...shimmer,
              }}
            />

            {/* Title + timestamp lines */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 7,
                flex: 1,
                minWidth: 0,
                alignItems: "flex-end",
              }}
            >
              {/* Title line — varies width slightly per row for realism */}
              <div
                style={{
                  ...shimmer,
                  height: 14,
                  width: `${60 + (i % 3) * 10}%`,
                  maxWidth: 280,
                  borderRadius: 6,
                }}
              />
              {/* Timestamp line */}
              <div
                style={{
                  ...shimmer,
                  height: 10,
                  width: "35%",
                  maxWidth: 100,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>

          {/* Left side: button placeholder */}
          <div
            style={{
              ...shimmer,
              width: 72,
              height: 36,
              borderRadius: 12,
              flexShrink: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}

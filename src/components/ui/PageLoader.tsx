"use client";

// MUI Imports
import { useColorScheme } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import Box from "@mui/material/Box";

// Type Imports
import type { SystemMode } from "@core/types";

interface PageLoaderProps {
  /** SSR fallback mode — resolved live via useColorScheme on client */
  mode?: SystemMode;
  /** Fill the full viewport height (default: true) */
  fullPage?: boolean;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.85); }
`;

/**
 * Theme-aware full-page (or inline) loader.
 *
 * Uses useColorScheme() for live dark/light reactivity — no stale SSR prop issues.
 * The outer ring spins while the inner dot pulses, both using the brand purple palette.
 */
const PageLoader = ({ mode = "light", fullPage = true }: PageLoaderProps) => {
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme();
  const resolvedMode = muiMode === "system" ? muiSystemMode : (muiMode ?? mode);
  const isDark = resolvedMode === "dark";

  const bgColor = isDark ? "#2A1657" : "#F5F0FF";
  const ringColor = isDark ? "#6948B8" : "#6948B8";
  const ringTrackColor = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(105,72,184,0.12)";
  const dotColor = isDark ? "#B656C0" : "#5531A8";

  const SIZE = 56;
  const STROKE = 4;
  const R = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: fullPage ? "100vh" : "100%",
        minHeight: fullPage ? undefined : 160,
        backgroundColor: bgColor,
        transition: "background-color 0.3s ease",
      }}
    >
      <Box sx={{ position: "relative", width: SIZE, height: SIZE }}>
        {/* Track ring */}
        <Box
          component="svg"
          sx={{
            position: "absolute",
            inset: 0,
            width: SIZE,
            height: SIZE,
          }}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={ringTrackColor}
            strokeWidth={STROKE}
          />
        </Box>

        {/* Spinning progress arc */}
        <Box
          component="svg"
          sx={{
            position: "absolute",
            inset: 0,
            width: SIZE,
            height: SIZE,
            animation: `${spin} 1.1s linear infinite`,
            transformOrigin: "center",
          }}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * 0.75}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </Box>

        {/* Pulsing center dot */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: dotColor,
              animation: `${pulse} 1.1s ease-in-out infinite`,
              boxShadow: `0 0 12px ${dotColor}80`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PageLoader;

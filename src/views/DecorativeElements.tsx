// MUI Imports
import { useColorScheme } from "@mui/material";

// Type Imports
import type { SystemMode } from "@core/types";

// SVG Asset Imports
import Star from "@/assets/svg/Star";
import Rocket from "@/assets/svg/Rocket";
import Heart from "@/assets/svg/Heart";
import Book from "@/assets/svg/Book";
import Toogle from "@/assets/svg/Toogle";

interface DecorativeElementsProps {
  onToggleTheme?: () => void;
  currentMode?: SystemMode;
  withToogle?: boolean;
}

const DecorativeElements = ({
  onToggleTheme,
  currentMode = "light",
  withToogle = false,
}: DecorativeElementsProps) => {
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme();
  const resolvedMode =
    muiMode === "system" ? muiSystemMode : (muiMode ?? currentMode);
  const isDark = resolvedMode === "dark";

  return (
    <>
      {/* ── Dark Mode Toggle ──────────────────────────────────────────────────*/}
      {withToogle && (
        <button
          onClick={onToggleTheme}
          className="fixed w-14 h-14 rounded-[15px] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-50 pointer-events-auto cursor-pointer select-none"
          style={{
            top: "32px",
            left: "32px",
            WebkitTapHighlightColor: "transparent",
            background: isDark
              ? "var(--auth-card-bg)"
              : "var(--auth-btn-primary)",
          }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="pointer-events-none flex items-center justify-center">
            <Toogle isDark={isDark} />
          </span>
        </button>
      )}

      {/* ── Blob top-right ──────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed top-[-150px] right-[-120px] sm:top-[-180px] sm:right-[-150px] md:top-[-200px] md:right-[-170px]"
        style={{ zIndex: 0 }}
      >
        <div
          className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full opacity-30"
          style={{
            background: "linear-gradient(45deg, #795de4, #040308)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* ── Blob bottom-left ────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed bottom-[-150px] left-[-120px] sm:bottom-[-180px] sm:left-[-150px] md:bottom-[-200px] md:left-[-170px]"
        style={{ zIndex: 0 }}
      >
        <div
          className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full opacity-30"
          style={{
            background: isDark ? "#5531a8" : "#DC64C9",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* ── Star — top-left, below toggle ─────────────────────────────────── */}
      <div
        className="pointer-events-none fixed top-20 left-32 sm:top-24 sm:left-8 md:top-28 md:left-14 lg:top-24 lg:left-28 xl:top-[140px] xl:left-[165px] auth-icon-float-1"
        style={{ opacity: isDark ? 0.55 : 0.45, zIndex: 1 }}
      >
        <Star
          isDark={isDark}
          className="w-16 h-16 xl:w-[100px] xl:h-[100px]"
        />
      </div>

      {/* ── Rocket — left middle ────────────────────────────────────────────*/}
      <div
        className="pointer-events-none fixed top-1/2 -translate-y-1/2 left-3 sm:left-6 md:left-32 lg:left-24 xl:left-[350px] auth-icon-float-2"
        style={{ opacity: isDark ? 0.55 : 0.4, zIndex: 1 }}
      >
        <Rocket
          isDark={isDark}
          className="w-16 h-16 xl:w-[80px] xl:h-[80px]"
        />
      </div>

      {/* ── Heart — top-right ───────────────────────────────────────────────*/}
      <div
        className="pointer-events-none fixed top-32 right-14 sm:top-20 sm:right-8 md:top-28 md:right-20 lg:top-24 lg:right-28 xl:top-[140px] xl:right-[165px] auth-icon-float-3"
        style={{ opacity: isDark ? 0.55 : 0.4, zIndex: 1 }}
      >
        <Heart
          isDark={isDark}
          className="w-16 h-16 xl:w-[100px] xl:h-[100px]"
        />
      </div>

      {/* ── Book — bottom-right ─────────────────────────────────────────────*/}
      <div
        className="pointer-events-none fixed bottom-12 right-4 sm:bottom-20 sm:right-8 md:bottom-28 md:right-32 lg:bottom-[100px] lg:right-28 xl:bottom-[140px] xl:right-[350px] auth-icon-float-4"
        style={{ opacity: isDark ? 0.55 : 0.4, zIndex: 1 }}
      >
        <Book
          isDark={isDark}
          className="w-16 h-16 xl:w-[80px] xl:h-[80px]"
        />
      </div>
    </>
  );
};

export default DecorativeElements;

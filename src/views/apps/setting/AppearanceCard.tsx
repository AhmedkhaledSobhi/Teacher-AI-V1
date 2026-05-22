"use client";

import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useSettings } from "@core/hooks/useSettings";
import type { getDictionary } from "@/utils/getDictionary";

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const PaletteIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.52-.2-1-.52-1.36-.3-.34-.49-.79-.49-1.27 0-1.1.9-2 2-2h2.35c3.12 0 5.65-2.53 5.65-5.65C22.99 6.02 17.99 2 12 2z"
      fill="currentColor"
      opacity="0.4"
    />
    <circle
      cx="6.5"
      cy="11.5"
      r="1.5"
      fill="currentColor"
    />
    <circle
      cx="9.5"
      cy="7.5"
      r="1.5"
      fill="currentColor"
    />
    <circle
      cx="14.5"
      cy="7.5"
      r="1.5"
      fill="currentColor"
    />
    <circle
      cx="17.5"
      cy="11.5"
      r="1.5"
      fill="currentColor"
    />
  </svg>
);

const SunIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="5"
      fill="currentColor"
    />
    <path
      d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      fill="currentColor"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AppearanceCard({ dictionary }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { updateSettings } = useSettings();
  const t = (dictionary as any)?.settings?.appearance || {};

  const [savedMode, setSavedMode] = useState<string | null>(null);

  const handleModeChange = (mode: "light" | "dark") => {
    updateSettings({ mode });
    setSavedMode(mode);
    setTimeout(() => setSavedMode(null), 2500);
  };

  return (
    <div
      className="setting-card"
      dir="rtl"
    >
      {/* Header */}
      <div className="setting-card-header">
        <span className="setting-card-icon">
          <PaletteIcon />
        </span>
        <h2 className="setting-card-title">{t.title || "السمة والنمط"}</h2>
      </div>

      {/* Toggle row */}
      <div
        className="setting-two-col"
        style={{ gap: 16 }}
      >
        <button
          onClick={() => handleModeChange("light")}
          aria-pressed={!isDark}
          className={`setting-theme-btn${!isDark ? " active" : ""}`}
        >
          <SunIcon />
          <span>{t.lightMode || "النمط الفاتح"}</span>
        </button>

        <button
          onClick={() => handleModeChange("dark")}
          aria-pressed={isDark}
          className={`setting-theme-btn${isDark ? " active" : ""}`}
        >
          <MoonIcon />
          <span>{t.darkMode || "النمط الداكن"}</span>
        </button>
      </div>

      {/* Success confirmation */}
      {savedMode && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            background: "var(--quiz-success-bg)",
            border: "1px solid var(--quiz-success)",
            color: "var(--quiz-success)",
            fontSize: 14,
            fontFamily: "var(--quiz-font)",
            marginTop: 4,
            direction: "rtl",
          }}
          role="status"
          aria-live="polite"
        >
          <CheckIcon />
          <span>
            {savedMode === "dark"
              ? t.darkModeApplied || "تم تطبيق النمط الداكن"
              : t.lightModeApplied || "تم تطبيق النمط الفاتح"}
          </span>
        </div>
      )}
    </div>
  );
}

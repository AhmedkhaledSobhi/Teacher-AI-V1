"use client";

// Hook Imports
import { useSettings } from "@core/hooks/useSettings";
import { useCoreUISound } from "@/hooks/useCoreUISound";

const ModeDropdown = () => {
  const { settings, updateSettings } = useSettings();
  const { play } = useCoreUISound();

  const isDark = settings.mode === "dark";

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    play("ui-theme-toggle");
    updateSettings({ mode: next });
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      style={{
        width: 40,
        height: 40,
        borderRadius: "11px",
        background: isDark ? "rgba(255,255,255,0.12)" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.18)" : "1px solid #e2d9f3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: isDark ? "#c4b5fd" : "#6948B8",
        transition: "background 0.2s, color 0.2s",
        flexShrink: 0,
      }}
    >
      <i className={isDark ? "tabler-sun" : "tabler-moon-stars"} style={{ fontSize: 20 }} />
    </button>
  );
};

export default ModeDropdown;

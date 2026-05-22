"use client";

// React Imports
import { useEffect, type ReactNode } from "react";

// MUI Imports
import { useColorScheme } from "@mui/material/styles";
import { useMedia } from "react-use";

// Component Imports
import DecorativeElements from "@/views/DecorativeElements";

// Hook Imports
import { useSettings } from "@core/hooks/useSettings";

// Type Imports
import type { SystemMode, Mode } from "@core/types";

type AuthPageShellProps = {
  children: ReactNode;
  initialMode: SystemMode;
  settingsMode: Mode;
};

const AuthPageShell = ({
  children,
  initialMode,
  settingsMode,
}: AuthPageShellProps) => {
  const { settings, updateSettings } = useSettings();
  const { setMode } = useColorScheme();
  const isSystemDark = useMedia("(prefers-color-scheme: dark)", false);

  const currentMode: SystemMode =
    settings.mode === "system"
      ? isSystemDark
        ? "dark"
        : "light"
      : (settings.mode as SystemMode);

  useEffect(() => {
    if (settings.mode === "system") {
      setMode(isSystemDark ? "dark" : "light");
    } else {
      setMode(settings.mode as SystemMode);
    }
  }, [settings.mode, isSystemDark, setMode]);

  const toggleTheme = () => {
    let newMode: "light" | "dark" | "system";
    if (settings.mode === "light") {
      newMode = "dark";
    } else if (settings.mode === "dark") {
      newMode = "system";
    } else {
      newMode = "light";
    }
    updateSettings({ mode: newMode });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/images/patternLogin.png)",
          backgroundPosition: "0% 0%",
          backgroundRepeat: "repeat",
          opacity: "0.02",
        }}
      />

      {/* Shared animated background — blobs + icons + theme toggle */}
      <DecorativeElements
        onToggleTheme={toggleTheme}
        currentMode={currentMode}
        withToogle={true}
      />

      {/* Page-specific content */}
      <main className="relative z-10 w-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
};

export default AuthPageShell;

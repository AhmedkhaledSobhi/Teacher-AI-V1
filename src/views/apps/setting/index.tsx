"use client";

import { useCallback } from "react";
import { signOut } from "@/utils/auth-utils";

import type { getDictionary } from "@/utils/getDictionary";
import type { SystemMode } from "@core/types";
import DecorativeElements from "@/views/DecorativeElements";

import AppearanceCard from "./AppearanceCard";
import StudentSettingsCard from "./StudentSettingCard";
import SecurityCard from "./SecuirtyCard";

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  mode: SystemMode;
};

const LogoutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SettingsView({ dictionary, mode }: Props) {
  const t = (dictionary as any)?.settings || {};

  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
  }, []);

  return (
    <div
      dir="rtl"
      className="page-bg"
    >
      <DecorativeElements currentMode={mode} />

      <div className="page-container">
        <div className="flex flex-col gap-5">
          <StudentSettingsCard dictionary={dictionary} />
          <AppearanceCard dictionary={dictionary} />
          <SecurityCard dictionary={dictionary} />

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="setting-logout-btn"
          >
            <LogoutIcon />
            {t.logout || "تسجيل الخروج"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

// Next Imports
import { redirect, usePathname } from "next/navigation";

// Type Imports
import type { Locale } from "@configs/i18n";

// Config Imports
import themeConfig from "@configs/themeConfig";

// Util Imports
import { getLocalizedUrl } from "@/utils/i18n";

const AuthRedirect = ({ lang }: { lang: Locale }) => {
  const pathname = usePathname();

  // Always redirect to landing page if not authenticated
  const landingPage = "/apps/home";

  // Redirect to landing page
  return redirect(landingPage);
};

export default AuthRedirect;

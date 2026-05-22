"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEFAULT_LANG = "ar";

/** Forward `/forgot-password` (no lang) to `/<lang>/forgot-password`. */
export default function ForgotPasswordLangForward() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const target =
      `/${DEFAULT_LANG}/forgot-password` +
      (qs ? `?${qs}` : "") +
      (hash || "");
    router.replace(target);
  }, [router, searchParams]);

  return null;
}

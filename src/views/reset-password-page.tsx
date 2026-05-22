"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Default language used when the email link omits the /<lang> prefix.
const DEFAULT_LANG = "ar";

/**
 * Catches `/reset-password` (no language prefix) — which is where Supabase /
 * the backend sometimes lands after a password-recovery email — and forwards
 * to `/<lang>/reset-password` while preserving query string AND URL hash
 * (the recovery `access_token` / `type=recovery` lives in the hash).
 */
export default function ResetPasswordLangForward() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const target =
      `/${DEFAULT_LANG}/reset-password` +
      (qs ? `?${qs}` : "") +
      (hash || "");
    // replace() so the bare URL isn't left in history
    router.replace(target);
  }, [router, searchParams]);

  return null;
}

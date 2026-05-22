"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DEFAULT_LANG = "ar";

/** Forward `/login` (no lang) to `/<lang>/login`, preserving query + hash. */
export default function LoginLangForward() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const target =
      `/${DEFAULT_LANG}/login` +
      (qs ? `?${qs}` : "") +
      (hash || "");
    router.replace(target);
  }, [router, searchParams]);

  return null;
}

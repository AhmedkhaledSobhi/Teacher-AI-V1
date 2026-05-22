// Type Imports
import type { Locale } from "@configs/i18n";
import type { ChildrenType } from "@core/types";

// Util Imports
import { requireAuth } from "@/app/api/api-headers/auth-server-utils";

/**
 * AuthGuard - Server Component
 * Protects routes by checking for an active session
 * Redirects to login page if no session is found
 *
 * @example
 * ```tsx
 * // In a layout or page
 * <AuthGuard locale={locale}>
 *   <YourProtectedContent />
 * </AuthGuard>
 * ```
 */
export default async function AuthGuard({
  children,
  locale,
}: ChildrenType & { locale: Locale }) {
  // requireAuth will redirect to login if no session exists
  const session = await requireAuth(locale);

  // Log successful authentication check (only in development)
  if (process.env.NODE_ENV === "development") {
  }

  return <>{children}</>;
}

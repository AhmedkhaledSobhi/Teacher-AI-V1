// Next Imports
import { redirect } from "next/navigation";

// Type Imports
import type { Locale } from "@configs/i18n";

// Util Imports
import { checkAuth } from "@/app/api/api-headers/auth-server-utils";
import { getLocalizedUrl } from "@/utils/i18n";
import { getServerMode } from "@core/utils/serverHelpers";
import { i18n } from "@configs/i18n";

// Component Imports
import LandingPageWrapper from "@views/front-pages/landing-page";
import Providers from "@components/Providers";
import BlankLayout from "@layouts/BlankLayout";
import FrontLayout from "@components/layout/front-pages";
import { IntersectionProvider } from "@/contexts/intersectionContext";

/**
 * الصفحة الرئيسية - تتحقق من حالة تسجيل الدخول
 * - إذا لم يكن مسجل دخول → عرض landing-page
 * - إذا كان مسجل دخول → توجيه إلى dashboard/chat
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const isAuthenticated = await checkAuth();

  // إذا كان المستخدم مسجل دخول، قم بتوجيهه إلى صفحة الدردشة
  if (isAuthenticated) {
    const dashboardUrl = getLocalizedUrl("/apps/home", lang);
    redirect(dashboardUrl);
  }

  // إذا لم يكن مسجل دخول، عرض صفحة الهبوط مع Providers
  const mode = await getServerMode();
  const direction = i18n.langDirection[lang];

  return (
    <Providers
      direction={direction}
      locale={lang}
    >
      <BlankLayout systemMode={mode}>
        <IntersectionProvider>
          <FrontLayout>
            <LandingPageWrapper mode={mode} />
          </FrontLayout>
        </IntersectionProvider>
      </BlankLayout>
    </Providers>
  );
}

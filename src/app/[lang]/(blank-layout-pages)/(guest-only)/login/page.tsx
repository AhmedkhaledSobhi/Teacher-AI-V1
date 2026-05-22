// Next Imports
import type { Metadata } from "next";

// Component Imports

// Server Action Imports
import { getServerMode, getMode } from "@core/utils/serverHelpers";
import { getDictionary } from "@/utils/getDictionary";
import type { Locale } from "@configs/i18n";
import NewLoginClient from "../new-login/NewLoginClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://drsi.ai/"),
  title: "تسجيل الدخول | المعلم الذكي",
  description: "سجل دخولك إلى حسابك في منصة المعلم الذكي",
  openGraph: {
    title: "تسجيل الدخول | المعلم الذكي",
    description: "سجل دخولك إلى حسابك في منصة المعلم الذكي",
    images: [
      {
        url: "/images/personas/og-image.png",
        width: 1200,
        height: 630,
        alt: "المعلم الذكي",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "تسجيل الدخول | المعلم الذكي",
    description: "سجل دخولك إلى حسابك في منصة المعلم الذكي",
    images: ["/images/personas/og-image.png"],
  },
};

const NewLoginPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  // Vars
  const { lang } = await params;
  const mode = await getServerMode();
  const settingsMode = await getMode();
  const dictionary = await getDictionary(lang);

  return (
    <NewLoginClient
      initialMode={mode}
      settingsMode={settingsMode}
      dictionary={dictionary}
    />
  );
};

export default NewLoginPage;

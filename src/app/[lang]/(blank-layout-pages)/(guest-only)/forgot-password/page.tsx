// Next Imports
import type { Metadata } from "next";

// Component Imports
import ForgotPasswordClient from "./ForgetPasswordClient";

// Server Action Imports
import { getServerMode, getMode } from "@core/utils/serverHelpers";
import { getDictionary } from "@/utils/getDictionary";
import type { Locale } from "@configs/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://drsi.ai/"),
  title: "نسيت كلمة المرور | المعلم الذكي",
  description: "استعادة كلمة المرور الخاصة بحسابك",
  openGraph: {
    title: "نسيت كلمة المرور | المعلم الذكي",
    description: "استعادة كلمة المرور الخاصة بحسابك",
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
    title: "نسيت كلمة المرور | المعلم الذكي",
    description: "استعادة كلمة المرور الخاصة بحسابك",
    images: ["/images/personas/og-image.png"],
  },
};

const ForgotPasswordPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const mode = await getServerMode();
  const settingsMode = await getMode();
  const dictionary = await getDictionary(lang);

  return (
    <ForgotPasswordClient
      initialMode={mode}
      settingsMode={settingsMode}
      dictionary={dictionary}
    />
  );
};

export default ForgotPasswordPage;

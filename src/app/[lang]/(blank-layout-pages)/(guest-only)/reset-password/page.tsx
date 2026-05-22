import type { Metadata } from "next";
import { getServerMode, getMode } from "@core/utils/serverHelpers";
import { getDictionary } from "@/utils/getDictionary";
import type { Locale } from "@configs/i18n";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://drsi.ai/"),
  title: "إعادة تعيين كلمة المرور | المعلم الذكي",
  description: "قم بتعيين كلمة مرور جديدة لحسابك",
  openGraph: {
    title: "إعادة تعيين كلمة المرور | المعلم الذكي",
    description: "قم بتعيين كلمة مرور جديدة لحسابك",
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
    title: "إعادة تعيين كلمة المرور | المعلم الذكي",
    description: "قم بتعيين كلمة مرور جديدة لحسابك",
    images: ["/images/personas/og-image.png"],
  },
};

const ResetPasswordPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const mode = await getServerMode();
  const settingsMode = await getMode();
  const dictionary = await getDictionary(lang);

  return (
    <ResetPasswordClient
      initialMode={mode}
      settingsMode={settingsMode}
      dictionary={dictionary}
    />
  );
};

export default ResetPasswordPage;

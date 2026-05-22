import type { Metadata } from "next";
import { getServerMode, getMode } from "@core/utils/serverHelpers";
import { getDictionary } from "@/utils/getDictionary";
import type { Locale } from "@configs/i18n";
import ConfirmEmailClient from "./ConfirmEmailClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://drsi.ai/"),
  title: "تأكيد البريد الإلكتروني | المعلم الذكي",
  description: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني",
  openGraph: {
    title: "تأكيد البريد الإلكتروني | المعلم الذكي",
    description: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني",
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
    title: "تأكيد البريد الإلكتروني | المعلم الذكي",
    description: "تم إرسال رابط التأكيد إلى بريدك الإلكتروني",
    images: ["/images/personas/og-image.png"],
  },
};

const ConfirmEmailPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const mode = await getServerMode();
  const settingsMode = await getMode();
  const dictionary = await getDictionary(lang);

  return (
    <ConfirmEmailClient
      initialMode={mode}
      settingsMode={settingsMode}
      dictionary={dictionary}
    />
  );
};

export default ConfirmEmailPage;

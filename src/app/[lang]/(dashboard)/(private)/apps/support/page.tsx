import type { Metadata } from "next";
import type { Locale } from "@configs/i18n";
import { getServerMode } from "@core/utils/serverHelpers";
import SupportView from "@/views/apps/support";

export const metadata: Metadata = {
  title: "المساعدة والدعم | Teacher AI",
  description: "الدعم الفني واستبيان التطوير",
};

const SupportPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const mode = await getServerMode();

  return <SupportView mode={mode} lang={lang} />;
};

export default SupportPage;

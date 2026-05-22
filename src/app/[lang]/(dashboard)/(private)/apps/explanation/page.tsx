import type { Metadata } from "next";
import type { Locale } from "@configs/i18n";
import { getServerMode } from "@core/utils/serverHelpers";
import ExplanationView from "@/views/apps/explanation";

export const metadata: Metadata = {
  title: "شرح الدرس | Teacher AI",
  description: "استمع لشرح الدرس من معلمك المفضل",
};

const ExplanationPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  await params;
  const mode = await getServerMode();

  return <ExplanationView mode={mode} />;
};

export default ExplanationPage;

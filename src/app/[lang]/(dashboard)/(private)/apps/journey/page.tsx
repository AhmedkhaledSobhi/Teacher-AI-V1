import type { Metadata } from "next";
import type { Locale } from "@configs/i18n";

import { getDictionary } from "@/utils/getDictionary";
import { getServerMode } from "@core/utils/serverHelpers";
import JourneyView from "@/views/apps/journey";

export const metadata: Metadata = {
  title: "رحلة التعلم | Teacher AI",
  description: "ابدأ رحلتك التعليمية - اختر المادة والوحدة والدرس",
};

const JourneyPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const [mode, dictionary] = await Promise.all([
    getServerMode(),
    getDictionary(lang),
  ]);

  return (
    <JourneyView
      mode={mode}
      dictionary={dictionary}
    />
  );
};

export default JourneyPage;

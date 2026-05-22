import type { Metadata } from "next";
import type { Locale } from "@configs/i18n";
import { getDictionary } from "@/utils/getDictionary";
import { getServerMode } from "@core/utils/serverHelpers";
import StatisticsView from "@/views/apps/statistics/StatisticsView";

export const metadata: Metadata = {
  title: "الإحصائيات | Teacher AI",
  description: "تابع تقدمك وأداءك في جميع المواد",
};

const StatisticsPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const mode = await getServerMode();
  const dictionary = await getDictionary(lang);

  return (
    <StatisticsView
      mode={mode}
      dictionary={dictionary}
      lang={lang}
    />
  );
};

export default StatisticsPage;

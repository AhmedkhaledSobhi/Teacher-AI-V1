// Type Imports
import type { Metadata } from "next";
import type { Locale } from "@configs/i18n";

// Util Imports
import { getDictionary } from "@/utils/getDictionary";
import { getServerMode } from "@core/utils/serverHelpers";

// View Import
import SettingsView from "@/views/apps/setting";

export const metadata: Metadata = {
  title: "الإعدادات | Teacher AI",
  description: "إعدادات الحساب والمظهر والأمان",
};

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const mode = await getServerMode();
  const dictionary = await getDictionary(lang);

  return (
    <SettingsView
      mode={mode}
      dictionary={dictionary}
    />
  );
};

export default SettingsPage;

// Type Imports
import type { Metadata } from "next";
import type { Locale } from "@configs/i18n";

// Util Imports
import { getDictionary } from "@/utils/getDictionary";
import { getServerMode } from "@core/utils/serverHelpers";
import Home from "@/views/Home";

// View Import

export const metadata: Metadata = {
  title: "الرئيسية | Teacher AI",
  description: "منصة المعلم الذكي - رحلتك التعليمية تبدأ هنا",
};

const HomePage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params;
  const mode = await getServerMode();
  const dictionary = await getDictionary(lang);

  return (
    <Home
      mode={mode}
      dictionary={dictionary}
    />
  );
};

export default HomePage;

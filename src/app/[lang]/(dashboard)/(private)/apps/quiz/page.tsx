import type { Metadata } from "next";
import type { Locale } from "@configs/i18n";
import { getServerMode } from "@core/utils/serverHelpers";
import QuizView from "@/views/apps/quiz";

export const metadata: Metadata = {
  title: "الاختبارات | Teacher AI",
  description: "اختبر نفسك وتابع تقدمك في جميع المواد",
};

const QuizPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  await params;
  const mode = await getServerMode();
  return <QuizView mode={mode} />;
};

export default QuizPage;

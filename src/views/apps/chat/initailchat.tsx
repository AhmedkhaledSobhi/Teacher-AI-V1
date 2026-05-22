import {
  StarDecor,
  SmallStar,
  TinyStar,
  CircleDecor,
  TriangleDecor,
  DiamondDecor,
} from "@/components/chat/decoraticeElements";
import {
  CalculatorIcon,
  MosqueIcon,
  HeartHomeIcon,
  ArabicIcon,
  SienceIcon,
  localIcon as LocalIcon,
} from "@/views/apps/chat/subjectIcons";
import SubjectCard from "@/@core/components/subject-card";
import RobotMascot from "@/@core/components/RobotMascot";
import { Typography, Button } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import {
  FaBookOpen,
  FaQuran,
  FaLanguage,
  FaFlask,
  FaAppleAlt,
  FaGlobe,
  FaLaptopCode,
  FaCalculator,
  FaLock,
} from "react-icons/fa";
import { isSubjectEnabled } from "@/views/apps/journey/shared";
import { useCoreUISound } from "@/hooks/useCoreUISound";

const subjects = [
  { icon: <ArabicIcon />, title: "لغتي", color: "#7C4DFF" },
  { icon: <CalculatorIcon />, title: "الرياضيات", color: "#4FC3F7" },
  { icon: <SienceIcon />, title: "العلوم", color: "#66BB6A" },
  { icon: <MosqueIcon />, title: "الدراسات الإسلامية", color: "#7C4DFF" },
  { icon: <LocalIcon />, title: "اللغة الإنجليزية", color: "#FF7043" },
  {
    icon: <HeartHomeIcon />,
    title: "المهارات الحياتية والأسرية",
    color: "#66BB6A",
  },
];

type InitialChatProps = {
  curriculum: any;
  startSubjectConversation: (subject: string, display_name: string) => void;
  isBelowMdScreen: boolean;
  isBelowSmScreen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setBackdropOpen: (open: boolean) => void;
};

const InitialChat = ({
  curriculum,
  startSubjectConversation,
  isBelowMdScreen,
  isBelowSmScreen,
  setSidebarOpen,
  setBackdropOpen,
}: InitialChatProps) => {
  const { t } = useTranslation();
  const { play } = useCoreUISound();

  let curriculumData = curriculum?.data || ([] as any[]);

  const getSubjectIcon = (subjectDisplayName: string) => {
    switch (subjectDisplayName) {
      case "لغتي":
        return {
          icon: <ArabicIcon />,
          bgVar: "--stats-violet-bg",
          textVar: "--stats-violet",
        };

      case "الدراسات الإسلامية":
        return {
          icon: <MosqueIcon />,
          bgVar: "--stats-green-bg",
          textVar: "--stats-green",
        };

      case "اللغة الإنجليزية":
        return {
          icon: <LocalIcon />,
          bgVar: "--stats-amber-bg",
          textVar: "--stats-amber",
        };

      case "العلوم":
        return {
          icon: <SienceIcon />,
          bgVar: "--quiz-teal-light",
          textVar: "--quiz-teal",
        };

      case "المهارات الحياتية والأسرية":
        return {
          icon: <HeartHomeIcon />,
          bgVar: "--quiz-grade-f-bg",
          textVar: "--quiz-grade-f",
        };

      case "المهارات الرقمية":
        return {
          icon: <FaLaptopCode />,
          bgVar: "--stats-red-bg",
          textVar: "--stats-red",
        };

      case "الدراسات الاجتماعية":
        return {
          icon: <FaGlobe />,
          bgVar: "--stats-amber-bg",
          textVar: "--stats-amber",
        };

      case "الرياضيات":
        return {
          icon: <CalculatorIcon />,
          bgVar: "--stats-blue-bg",
          textVar: "--stats-blue",
        };

      default:
        return {
          icon: <FaBookOpen />,
          bgVar: "--chat-subject-default-bg",
          textVar: "--chat-subject-default-text",
        };
    }
  };
  return (
    <div className="relative">
      {/* Decorative elements - absolutely positioned */}
      <StarDecor className="absolute top-[8%] left-[12%]" />
      <SmallStar className="absolute top-[5%] left-[25%]" />
      <TinyStar className="absolute top-[15%] left-[8%]" />
      <StarDecor className="absolute top-[10%] right-[15%]" />
      <SmallStar className="absolute top-[6%] right-[28%]" />
      <TinyStar className="absolute top-[18%] right-[10%]" />

      <CircleDecor
        className="absolute top-[12%] left-[5%]"
        color="#9575CD"
      />
      <CircleDecor
        className="absolute top-[20%] left-[18%]"
        color="#7E57C2"
      />
      <CircleDecor
        className="absolute top-[8%] right-[8%]"
        color="#9575CD"
      />
      <CircleDecor
        className="absolute top-[22%] right-[20%]"
        color="#7E57C2"
      />

      <TriangleDecor className="absolute top-[25%] left-[3%] rotate-12" />
      <TriangleDecor className="absolute top-[28%] right-[5%] -rotate-12" />

      <DiamondDecor className="absolute top-[4%] left-[45%]" />
      <DiamondDecor className="absolute top-[30%] left-[2%]" />
      <DiamondDecor className="absolute top-[32%] right-[3%]" />

      {/* Small dots scattered */}
      <div className="absolute top-[14%] left-[30%] w-1 h-1 rounded-full bg-purple-light opacity-50" />
      <div className="absolute top-[16%] right-[35%] w-1 h-1 rounded-full bg-purple-light opacity-50" />
      <div className="absolute top-[24%] left-[40%] w-1.5 h-1.5 rounded-full bg-purple-light opacity-40" />
      <div className="absolute top-[26%] right-[42%] w-1 h-1 rounded-full bg-purple-light opacity-50" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-6 pb-4">
        {/* Robot mascot with animations */}
        <div className="mb-4 md:mb-5 animate-fade-in-up">
          <div className="relative inline-block animate-float">
            <div className="absolute inset-0 bg-primary-200/20 rounded-full blur-2xl animate-pulse-slow"></div>
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <RobotMascot />
            </div>
          </div>
        </div>

        {/* Main heading */}
        <div className="flex flex-col items-center gap-3 mb-2 animate-fade-in-up animation-delay-200">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-secondary text-center text-balance">
            {t("chat.heroTitle") || "جاهز للإبداع؟ اختر مادة لننطلق معاً!"}
          </h1>
          <Typography className="font-medium md:text-xl lg:text-2xl text-base text-center text-secondary">
            {t("chat.heroSubtitle") ||
              "معلمك الذكي هنا ليجعل دروسك أسهل وأكثر متعة"}
          </Typography>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 lg:gap-4 gap-3 w-full max-w-4xl mx-auto lg:px-4 pb-8 lg:pt-5 pt-2 animate-fade-in-up animation-delay-400">
          {[...curriculumData]
            .sort((a: any, b: any) => {
              const aEnabled = isSubjectEnabled(a.subject, a.display_name);
              const bEnabled = isSubjectEnabled(b.subject, b.display_name);
              if (aEnabled && !bEnabled) return -1;
              if (!aEnabled && bEnabled) return 1;
              return 0;
            })
            .map((item: any, index: number) => {
              const { icon, bgVar, textVar } = getSubjectIcon(
                item.display_name
              );
              const enabled = isSubjectEnabled(item.subject, item.display_name);
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (!enabled) return;
                    play("card-feature-click");
                    startSubjectConversation(item.subject, item.display_name);
                  }}
                  style={{
                    backgroundColor: "rgb(var(--background-color-rgb) / 0.92)",
                    borderRadius: "32px",
                    animationDelay: `${index * 0.1}s`,
                    opacity: enabled ? 1 : 0.6,
                  }}
                  className={`relative group flex flex-col items-center p-5 rounded-xl border transition-all duration-300 ${
                    enabled
                      ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                >
                  {/* Coming soon badge for disabled subjects */}
                  {!enabled && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                      <FaLock className="w-3 h-3" />
                      <span>قريبا</span>
                    </div>
                  )}

                  {/* أيقونة داخل مربع */}
                  <div
                    style={{
                      boxShadow:
                        "0 1.288px 3.863px 0 rgba(0, 0, 0, 0.10), 0 1.288px 2.575px -1.288px rgba(0, 0, 0, 0.10)",
                      background: `var(${bgVar})`,
                      color: `var(${textVar})`,
                    }}
                    className={`w-16 h-16 flex items-center justify-center rounded-[20.603px] mb-4 ${enabled ? "group-hover:scale-110" : ""} transition-transform duration-300`}
                  >
                    <span className="text-2xl mt-4">{icon}</span>
                  </div>

                  {/* اسم المادة */}
                  <Typography
                    className={`md:text-xl text-base font-bold text-secondary text-center mb-1 ${enabled ? "group-hover:text-primary-600" : ""} transition-colors duration-300`}
                  >
                    {item.display_name}
                  </Typography>
                </div>
              );
            })}
        </div>

        {/* Spacing */}
        <div className="mb-4" />
      </div>
    </div>
  );
};

export default InitialChat;

import {
  StarDecor,
  SmallStar,
  TinyStar,
  CircleDecor,
  TriangleDecor,
  DiamondDecor,
} from "@/components/chat/decoraticeElements";
import RobotMascot from "@/@core/components/RobotMascot";
import { Typography, Button } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";

const EmptyChat = () => {
  const { t } = useTranslation();

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
      <div className="relative z-10 flex flex-col items-center px-4 pt-2 pb-4">
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
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-secondary text-center">
            معلمك الذكي جاهز للمساعدة!{" "}
          </h1>
          <Typography className="font-medium md:text-lg lg:text-lg text-base  text-center text-secondary mb-4">
            اكتب سؤالك في الأسفل، وسأساعدك خطوة بخطوة{" "}
          </Typography>
          <i className="tabler-arrow-down text-2xl text-secondary animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;

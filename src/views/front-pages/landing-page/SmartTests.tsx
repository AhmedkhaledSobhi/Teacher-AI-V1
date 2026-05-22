"use client";

// MUI Imports
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme } from "@mui/material/styles";

// Third-party Imports
import classnames from "classnames";

// Styles Imports
import frontCommonStyles from "@views/front-pages/styles.module.css";

// ─── Quiz type card data ──────────────────────────────────────────────────────

type QuizCard = {
  icon: string;
  iconColor: string;
  iconBg: string;
  iconBgDark: string;
  title: string;
  description: string;
};

const quizCards: QuizCard[] = [
  {
    icon: "tabler-clipboard-list",
    iconColor: "#22c55e",
    iconBg: "#dcfce7",
    iconBgDark: "rgba(34,197,94,0.15)",
    title: "اختبار أساسي",
    description:
      "أسئلة جاهزة ومحددة من الدرس لقياس الاستيعاب السريع للمعلومات الأساسية.",
  },
  {
    icon: "tabler-clipboard-check",
    iconColor: "#ec4899",
    iconBg: "#fce7f3",
    iconBgDark: "rgba(236,72,153,0.15)",
    title: "اختبار ذكي",
    description:
      "تمارين تفاعلية بأسئلة متجددة في كل مرة، تتكيف صعوبتها تلقائياً مع مستوى الطالب لضمان الفهم العميق للدرس.",
  },
  {
    icon: "tabler-file-text",
    iconColor: "#8b5cf6",
    iconBg: "#ede9fe",
    iconBgDark: "rgba(139,92,246,0.15)",
    title: "اختبار شامل",
    description:
      "أسئلة مجمعة ومخصصة تغطي وحدات ودروس متعددة للمراجعة الشاملة قبل الامتحانات.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SmartTests = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <section
      className="plb-[80px] md:plb-[100px]"
      style={{ background: isDark ? "#1e0d45" : "#ede8f5" }}
      dir="rtl"
    >
      <div
        className={classnames(
          "flex flex-col gap-8",
          frontCommonStyles.layoutSpacing
        )}
      >
        {/* ── Badge + Heading ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            style={{
              display: "flex",
              padding: "10px 18px",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              borderRadius: "100px",
              border: isDark
                ? "1.235px solid rgba(255, 255, 255, 0.10)"
                : "1.235px solid rgba(15, 23, 42, 0.10)",
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.50)",
            }}
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  width="24"
                  height="24"
                  rx="12"
                  fill="white"
                  fill-opacity="0.1"
                />
                <path
                  d="M17.5 6H6.5C6.23478 6 5.98043 6.10536 5.79289 6.29289C5.60536 6.48043 5.5 6.73478 5.5 7V17C5.49994 17.0853 5.52169 17.1691 5.56318 17.2436C5.60467 17.3181 5.66452 17.3808 5.73705 17.4256C5.80958 17.4705 5.89237 17.496 5.97756 17.4999C6.06274 17.5037 6.14749 17.4857 6.22375 17.4475L8 16.5588L9.77625 17.4475C9.84572 17.4823 9.92232 17.5004 10 17.5004C10.0777 17.5004 10.1543 17.4823 10.2238 17.4475L12 16.5588L13.7762 17.4475C13.8457 17.4823 13.9223 17.5004 14 17.5004C14.0777 17.5004 14.1543 17.4823 14.2238 17.4475L16 16.5588L17.7762 17.4475C17.8525 17.4857 17.9373 17.5037 18.0224 17.4999C18.1076 17.496 18.1904 17.4705 18.2629 17.4256C18.3355 17.3808 18.3953 17.3181 18.4368 17.2436C18.4783 17.1691 18.5001 17.0853 18.5 17V7C18.5 6.73478 18.3946 6.48043 18.2071 6.29289C18.0196 6.10536 17.7652 6 17.5 6ZM17.5 16.1912L16.2238 15.5525C16.1543 15.5177 16.0777 15.4996 16 15.4996C15.9223 15.4996 15.8457 15.5177 15.7762 15.5525L14 16.4412L12.2238 15.5525C12.1543 15.5177 12.0777 15.4996 12 15.4996C11.9223 15.4996 11.8457 15.5177 11.7762 15.5525L10 16.4412L8.22375 15.5525C8.15429 15.5177 8.07768 15.4996 8 15.4996C7.92232 15.4996 7.84572 15.5177 7.77625 15.5525L6.5 16.1912V7H17.5V16.1912ZM7.77625 13.9475C7.83501 13.9769 7.89899 13.9945 7.96454 13.9992C8.03009 14.0038 8.09591 13.9956 8.15826 13.9748C8.2206 13.954 8.27823 13.9211 8.32787 13.8781C8.3775 13.835 8.41815 13.7825 8.4475 13.7238L8.80875 13H11.1912L11.5525 13.7238C11.5819 13.7825 11.6226 13.8349 11.6722 13.878C11.7218 13.921 11.7795 13.9539 11.8418 13.9746C11.9041 13.9954 11.9699 14.0037 12.0355 13.9991C12.101 13.9944 12.165 13.9769 12.2238 13.9475C12.2825 13.9181 12.3349 13.8774 12.378 13.8278C12.421 13.7782 12.4539 13.7205 12.4746 13.6582C12.4954 13.5959 12.5037 13.5301 12.4991 13.4645C12.4944 13.399 12.4769 13.335 12.4475 13.2762L10.4475 9.27625C10.406 9.19305 10.3422 9.12305 10.2631 9.07413C10.1841 9.0252 10.093 8.99928 10 8.99928C9.90703 8.99928 9.81591 9.0252 9.73686 9.07413C9.65781 9.12305 9.59397 9.19305 9.5525 9.27625L7.5525 13.2762C7.52307 13.335 7.50552 13.399 7.50084 13.4645C7.49616 13.5301 7.50445 13.5959 7.52523 13.6583C7.54601 13.7206 7.57888 13.7782 7.62195 13.8279C7.66502 13.8775 7.71745 13.9181 7.77625 13.9475ZM10 10.6181L10.6912 12H9.30875L10 10.6181ZM12.5 11.5C12.5 11.3674 12.5527 11.2402 12.6464 11.1464C12.7402 11.0527 12.8674 11 13 11H14V10C14 9.86739 14.0527 9.74021 14.1464 9.64645C14.2402 9.55268 14.3674 9.5 14.5 9.5C14.6326 9.5 14.7598 9.55268 14.8536 9.64645C14.9473 9.74021 15 9.86739 15 10V11H16C16.1326 11 16.2598 11.0527 16.3536 11.1464C16.4473 11.2402 16.5 11.3674 16.5 11.5C16.5 11.6326 16.4473 11.7598 16.3536 11.8536C16.2598 11.9473 16.1326 12 16 12H15V13C15 13.1326 14.9473 13.2598 14.8536 13.3536C14.7598 13.4473 14.6326 13.5 14.5 13.5C14.3674 13.5 14.2402 13.4473 14.1464 13.3536C14.0527 13.2598 14 13.1326 14 13V12H13C12.8674 12 12.7402 11.9473 12.6464 11.8536C12.5527 11.7598 12.5 11.6326 12.5 11.5Z"
                  fill="#DC64C9"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                  fill="white"
                />
                <path
                  d="M17.5 6H6.5C6.23478 6 5.98043 6.10536 5.79289 6.29289C5.60536 6.48043 5.5 6.73478 5.5 7V17C5.49994 17.0853 5.52169 17.1691 5.56318 17.2436C5.60467 17.3181 5.66452 17.3808 5.73705 17.4256C5.80958 17.4705 5.89237 17.496 5.97756 17.4999C6.06274 17.5037 6.14749 17.4857 6.22375 17.4475L8 16.5588L9.77625 17.4475C9.84572 17.4823 9.92232 17.5004 10 17.5004C10.0777 17.5004 10.1543 17.4823 10.2238 17.4475L12 16.5588L13.7762 17.4475C13.8457 17.4823 13.9223 17.5004 14 17.5004C14.0777 17.5004 14.1543 17.4823 14.2238 17.4475L16 16.5588L17.7762 17.4475C17.8525 17.4857 17.9373 17.5037 18.0224 17.4999C18.1076 17.496 18.1904 17.4705 18.2629 17.4256C18.3355 17.3808 18.3953 17.3181 18.4368 17.2436C18.4783 17.1691 18.5001 17.0853 18.5 17V7C18.5 6.73478 18.3946 6.48043 18.2071 6.29289C18.0196 6.10536 17.7652 6 17.5 6ZM17.5 16.1912L16.2238 15.5525C16.1543 15.5177 16.0777 15.4996 16 15.4996C15.9223 15.4996 15.8457 15.5177 15.7762 15.5525L14 16.4412L12.2238 15.5525C12.1543 15.5177 12.0777 15.4996 12 15.4996C11.9223 15.4996 11.8457 15.5177 11.7762 15.5525L10 16.4412L8.22375 15.5525C8.15429 15.5177 8.07768 15.4996 8 15.4996C7.92232 15.4996 7.84572 15.5177 7.77625 15.5525L6.5 16.1912V7H17.5V16.1912ZM7.77625 13.9475C7.83501 13.9769 7.89899 13.9945 7.96454 13.9992C8.03009 14.0038 8.09591 13.9956 8.15826 13.9748C8.2206 13.954 8.27823 13.9211 8.32787 13.8781C8.3775 13.835 8.41815 13.7825 8.4475 13.7238L8.80875 13H11.1912L11.5525 13.7238C11.5819 13.7825 11.6226 13.8349 11.6722 13.878C11.7218 13.921 11.7795 13.9539 11.8418 13.9746C11.9041 13.9954 11.9699 14.0037 12.0355 13.9991C12.101 13.9944 12.165 13.9769 12.2238 13.9475C12.2825 13.9181 12.3349 13.8774 12.378 13.8278C12.421 13.7782 12.4539 13.7205 12.4746 13.6582C12.4954 13.5959 12.5037 13.5301 12.4991 13.4645C12.4944 13.399 12.4769 13.335 12.4475 13.2762L10.4475 9.27625C10.406 9.19305 10.3422 9.12305 10.2631 9.07413C10.1841 9.0252 10.093 8.99928 10 8.99928C9.90703 8.99928 9.81591 9.0252 9.73686 9.07413C9.65781 9.12305 9.59397 9.19305 9.5525 9.27625L7.5525 13.2762C7.52307 13.335 7.50552 13.399 7.50084 13.4645C7.49616 13.5301 7.50445 13.5959 7.52523 13.6583C7.54601 13.7206 7.57888 13.7782 7.62195 13.8279C7.66502 13.8775 7.71745 13.9181 7.77625 13.9475ZM10 10.6181L10.6912 12H9.30875L10 10.6181ZM12.5 11.5C12.5 11.3674 12.5527 11.2402 12.6464 11.1464C12.7402 11.0527 12.8674 11 13 11H14V10C14 9.86739 14.0527 9.74021 14.1464 9.64645C14.2402 9.55268 14.3674 9.5 14.5 9.5C14.6326 9.5 14.7598 9.55268 14.8536 9.64645C14.9473 9.74021 15 9.86739 15 10V11H16C16.1326 11 16.2598 11.0527 16.3536 11.1464C16.4473 11.2402 16.5 11.3674 16.5 11.5C16.5 11.6326 16.4473 11.7598 16.3536 11.8536C16.2598 11.9473 16.1326 12 16 12H15V13C15 13.1326 14.9473 13.2598 14.8536 13.3536C14.7598 13.4473 14.6326 13.5 14.5 13.5C14.3674 13.5 14.2402 13.4473 14.1464 13.3536C14.0527 13.2598 14 13.1326 14 13V12H13C12.8674 12 12.7402 11.9473 12.6464 11.8536C12.5527 11.7598 12.5 11.6326 12.5 11.5Z"
                  fill="#DC64C9"
                />
              </svg>
            )}
            <span
              style={{
                color: isDark ? "#D4BDFF" : "#5531A8",
                textAlign: "right",
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "19.752px",
              }}
            >
              تحديات متنوعة وتقييم مستمر
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <Typography
              variant="h3"
              color="text.primary"
              className="font-extrabold text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-tight"
            >
              اختبارات ذكية..
            </Typography>
            <Typography
              variant="h3"
              className="font-extrabold text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-tight"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              تكتشف نقاط الضعف وتعالجها
            </Typography>
          </div>

          <Typography
            color="text.secondary"
            className="text-base leading-relaxed"
          >
            لا مزيد من القلق قبل الامتحان. المعلم الذكي ينشئ اختبارات مراجعة
            مخصصة، ويصححها فوراً، ويقدم نصائح ذهبية للتحسين.
          </Typography>
        </div>

        {/* ── Bento grid ────────────────────────────────────────────────── */}
        {/* In RTL: first col = right side (score card), second col = left side (quiz type cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* ── RIGHT (RTL first col) — three quiz-type cards ─────────── */}
          <div className="flex flex-col gap-5 order-2 md:order-1">
            {quizCards.map((card) => (
              <Card
                key={card.title}
                elevation={isDark ? 0 : 3}
                sx={{
                  borderRadius: "1.25rem",
                  background: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(120,80,200,0.08)",
                  flex: 1,
                }}
              >
                <CardContent className="p-5 md:p-6 flex flex-col items-center text-center gap-3">
                  {/* Icon badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: isDark ? card.iconBgDark : card.iconBg,
                    }}
                  >
                    <i
                      className={`${card.icon} text-2xl`}
                      style={{ color: card.iconColor }}
                    />
                  </div>

                  <Typography
                    variant="h6"
                    color="text.primary"
                    className="font-bold"
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    className="text-sm leading-relaxed"
                  >
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── LEFT (RTL second col) — "تقييمات فورية دقيقة" big card ── */}
          <Card
            elevation={isDark ? 0 : 3}
            className="order-1 md:order-2"
            sx={{
              borderRadius: "1.5rem",
              background: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
              border: isDark
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(120,80,200,0.08)",
            }}
          >
            <CardContent className="p-6 md:p-8 flex flex-col gap-6 h-full">
              {/* Card header */}
              <div className="flex flex-col gap-2">
                <Typography
                  variant="h5"
                  color="text.primary"
                  className="font-bold text-xl leading-snug"
                >
                  تقييمات فورية دقيقة
                </Typography>
                <Typography
                  color="text.secondary"
                  className="text-sm leading-relaxed"
                >
                  نتائج وإحصائيات مفصلة عن الأداء، مع توصيات من المعلم الذكي
                </Typography>
              </div>

              {/* Inner score card */}
              <div
                className="rounded-2xl p-6 flex flex-col items-center gap-5 flex-1"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f5f3ff",
                  border: isDark
                    ? "1px dashed rgba(255,255,255,0.12)"
                    : "1.5px dashed #c4b5fd",
                }}
              >
                {/* Progress circle */}
                <div
                  className="relative w-24 h-24"
                  style={{ animation: "icon-float 2.4s ease-in-out infinite" }}
                >
                  {/* Outer dashed ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: isDark
                        ? "2px dashed rgba(255,255,255,0.18)"
                        : "2px dashed #c4b5fd",
                    }}
                  />
                  {/* Solid gradient circle */}
                  <div
                    className="absolute inset-3 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
                    }}
                  >
                    <i className="tabler-trending-up text-white text-3xl" />
                  </div>
                </div>

                {/* Praise label */}
                <div className="flex flex-col items-center gap-1 text-center">
                  <Typography
                    variant="h4"
                    color="text.primary"
                    className="font-extrabold"
                  >
                    رائع جداً!
                  </Typography>
                  <Typography
                    color="text.secondary"
                    className="text-sm leading-relaxed text-center"
                  >
                    أداء مميز! أنت على الطريق الصحيح استمر في التقدم
                  </Typography>
                </div>

                {/* Score */}
                <div
                  className="flex items-baseline gap-1 justify-center"
                  dir="ltr"
                >
                  <Typography
                    className="font-extrabold leading-none"
                    style={{
                      fontSize: "3.5rem",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    80
                  </Typography>
                  <Typography
                    color="text.secondary"
                    className="text-lg"
                  >
                    /100
                  </Typography>
                </div>

                {/* "درجتك النهائية" label */}
                <Typography
                  color="text.secondary"
                  variant="caption"
                  className="font-medium -mt-3"
                >
                  درجتك النهائية
                </Typography>

                {/* Progress bar */}
                <div
                  className="w-full h-2.5 rounded-full overflow-hidden"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "80%",
                      background:
                        "linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SmartTests;

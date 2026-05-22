"use client";

// MUI Imports
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme } from "@mui/material/styles";

// Third-party Imports
import classnames from "classnames";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "@/libs/Recharts";

// Styles Imports
import frontCommonStyles from "@views/front-pages/styles.module.css";

// Data
const activityData = [
  { name: "الرياضيات", value: 25, color: "#22c55e" },
  { name: "اللغة الإنجليزية", value: 20, color: "#06b6d4" },
  { name: "العلوم", value: 20, color: "#8b5cf6" },
  { name: "الدراسات الإسلامية", value: 20, color: "#ef4444" },
  { name: "لغتي", value: 15, color: "#f59e0b" },
];

const progressData = [
  { week: "1", level: 55 },
  { week: "5", level: 58 },
  { week: "10", level: 62 },
  { week: "15", level: 65 },
  { week: "20", level: 70 },
  { week: "25", level: 75 },
  { week: "30", level: 80 },
];

const subjectScores = [
  { subject: "الرياضيات", score: 80, fill: "#8b5cf6" },
  { subject: "المهارات الحياتية والأسرية", score: 60, fill: "#f59e0b" },
  { subject: "الدراسات الإسلامية", score: 95, fill: "#22c55e" },
  { subject: "لغتي", score: 80, fill: "#ef4444" },
  { subject: "علوم", score: 40, fill: "#06b6d4" },
  { subject: "اللغة الإنجليزية", score: 78, fill: "#22c55e" },
];

const conceptData = [
  { name: "الكسور", strength: 85, color: "#22c55e" },
  { name: "المعادلات", strength: 62, color: "#f59e0b" },
  { name: "الهندسة", strength: 45, color: "#ef4444" },
  { name: "الإحصاء", strength: 78, color: "#06b6d4" },
  { name: "الأعداد", strength: 91, color: "#8b5cf6" },
];

const studyPlan = [
  { icon: "tabler-bulb", label: "مراجعة مبادئ الهندسة", color: "#8b5cf6" },
  { icon: "tabler-book", label: "تمارين المعادلات اليومية", color: "#06b6d4" },
  { icon: "tabler-target", label: "اختبار تقدمي في الإحصاء", color: "#22c55e" },
  { icon: "tabler-star", label: "مسابقة الكسور الأسبوعية", color: "#f59e0b" },
];

const StatTile = ({
  value,
  label,
  icon,
  color,
  isDark,
}: {
  value: string;
  label: string;
  icon: string;
  color: string;
  isDark: boolean;
}) => (
  <div
    className="flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-center"
    style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f5f3ff" }}
  >
    <i
      className={`${icon} text-xl`}
      style={{ color }}
    />
    <Typography
      variant="h6"
      color="text.primary"
      className="font-extrabold leading-none text-lg"
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
    >
      {label}
    </Typography>
  </div>
);

const BottomTile = ({
  value,
  label,
  sub,
  accent,
  isDark,
}: {
  value: string;
  label: string;
  sub?: string;
  accent: string;
  isDark: boolean;
}) => (
  <div
    className="flex flex-col items-center justify-center gap-1 rounded-xl p-3 text-center flex-1"
    style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#f8f7ff" }}
  >
    <Typography
      color="text.secondary"
      className="text-xs font-medium"
    >
      {label}
    </Typography>
    <Typography
      className="font-extrabold text-2xl leading-none"
      style={{ color: accent }}
    >
      {value}
    </Typography>
    {sub && (
      <Typography
        color="text.secondary"
        className="text-xs"
      >
        {sub}
      </Typography>
    )}
  </div>
);

const ProgressDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cardStyle = {
    borderRadius: "1.25rem",
    background: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
    border: isDark
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(120,80,200,0.08)",
  };

  const sectionBg = isDark ? "#1e0d45" : "#ede8f5";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const textSecondary = isDark ? "rgba(255,255,255,0.5)" : "#9ca3af";

  return (
    <section
      className={classnames("plb-[80px] md:plb-[100px]")}
      style={{ background: sectionBg }}
      dir="rtl"
    >
      <div
        className={classnames(
          "flex flex-col gap-8",
          frontCommonStyles.layoutSpacing
        )}
      >
        {/* Badge + Heading */}
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
                  d="M10.7509 11.2769C10.827 11.233 10.8901 11.1699 10.934 11.0938C10.9779 11.0178 11.001 10.9315 11.001 10.8437V6.34292C11.0005 6.26319 10.981 6.18473 10.9441 6.11407C10.9072 6.04341 10.8539 5.9826 10.7887 5.93672C10.7235 5.89084 10.6482 5.86122 10.5692 5.85033C10.4903 5.83943 10.4098 5.84758 10.3346 5.87409C8.87497 6.39069 7.64746 7.41102 6.87276 8.75165C6.09806 10.0923 5.82697 11.6653 6.10824 13.1879C6.12281 13.2666 6.15609 13.3407 6.20526 13.4039C6.25443 13.4671 6.31805 13.5176 6.39079 13.5511C6.45633 13.5817 6.52784 13.5975 6.6002 13.5974C6.68797 13.5974 6.77421 13.5743 6.85024 13.5305L10.7509 11.2769ZM10.0008 7.10056V10.5549L7.00777 12.2821C7.00027 12.1877 7.00027 12.0927 7.00027 12.0002C7.00116 10.9865 7.28175 9.99268 7.81116 9.1282C8.34057 8.26372 9.09826 7.56209 10.0008 7.10056ZM12.5013 5.49902C12.3686 5.49902 12.2414 5.55171 12.1476 5.6455C12.0539 5.73928 12.0012 5.86648 12.0012 5.99911V11.7389L7.07466 14.6088C7.01749 14.6419 6.96746 14.6861 6.92745 14.7387C6.88744 14.7912 6.85825 14.8512 6.84157 14.9152C6.82489 14.9791 6.82104 15.0457 6.83026 15.1112C6.83947 15.1766 6.86156 15.2396 6.89525 15.2964C7.47267 16.278 8.29782 17.0907 9.28809 17.6532C10.2784 18.2156 11.399 18.5081 12.5378 18.5012C13.6767 18.4944 14.7937 18.1885 15.7772 17.6142C16.7606 17.04 17.576 16.2174 18.1416 15.2289C18.7072 14.2405 19.0032 13.1207 19 11.9819C18.9968 10.8431 18.6945 9.72503 18.1233 8.73975C17.5522 7.75448 16.7322 6.93652 15.7455 6.36778C14.7589 5.79903 13.6401 5.49945 12.5013 5.49902ZM12.5013 17.5012C11.6283 17.4988 10.7682 17.2899 9.99147 16.8913C9.21474 16.4928 8.54338 15.9161 8.03233 15.2083L12.7532 12.4578C12.8291 12.4139 12.8922 12.3509 12.9361 12.2749C12.98 12.199 13.0031 12.1129 13.0032 12.0252V6.52171C14.4137 6.64968 15.7205 7.31675 16.6516 8.38404C17.5826 9.45133 18.0661 10.8366 18.0014 12.2514C17.9367 13.6663 17.3288 15.0016 16.3043 15.9795C15.2798 16.9574 13.9176 17.5024 12.5013 17.5012Z"
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
                  d="M10.7509 11.2789C10.827 11.235 10.8901 11.1718 10.934 11.0958C10.9779 11.0197 11.001 10.9335 11.001 10.8457V6.34488C11.0005 6.26515 10.981 6.18668 10.9441 6.11602C10.9072 6.04536 10.8539 5.98455 10.7887 5.93867C10.7235 5.8928 10.6482 5.86317 10.5692 5.85228C10.4903 5.84138 10.4098 5.84953 10.3346 5.87604C8.87497 6.39265 7.64746 7.41297 6.87276 8.7536C6.09806 10.0942 5.82697 11.6672 6.10824 13.1899C6.12281 13.2686 6.15609 13.3427 6.20526 13.4059C6.25443 13.4691 6.31805 13.5196 6.39079 13.553C6.45633 13.5837 6.52784 13.5995 6.6002 13.5993C6.68797 13.5993 6.77421 13.5763 6.85024 13.5324L10.7509 11.2789ZM10.0008 7.10251V10.5569L7.00777 12.2841C7.00027 12.1897 7.00027 12.0947 7.00027 12.0021C7.00116 10.9884 7.28175 9.99463 7.81116 9.13015C8.34057 8.26567 9.09826 7.56404 10.0008 7.10251ZM12.5013 5.50098C12.3686 5.50098 12.2414 5.55366 12.1476 5.64745C12.0539 5.74123 12.0012 5.86843 12.0012 6.00107V11.7408L7.07466 14.6107C7.01749 14.6439 6.96746 14.688 6.92745 14.7406C6.88744 14.7932 6.85825 14.8532 6.84157 14.9171C6.82489 14.9811 6.82104 15.0477 6.83026 15.1131C6.83947 15.1786 6.86156 15.2415 6.89525 15.2984C7.47267 16.28 8.29782 17.0927 9.28809 17.6551C10.2784 18.2176 11.399 18.51 12.5378 18.5032C13.6767 18.4964 14.7937 18.1905 15.7772 17.6162C16.7606 17.0419 17.576 16.2194 18.1416 15.2309C18.7072 14.2424 19.0032 13.1227 19 11.9839C18.9968 10.845 18.6945 9.72698 18.1233 8.7417C17.5522 7.75643 16.7322 6.93847 15.7455 6.36973C14.7589 5.80098 13.6401 5.5014 12.5013 5.50098ZM12.5013 17.5031C11.6283 17.5008 10.7682 17.2918 9.99147 16.8933C9.21474 16.4948 8.54338 15.918 8.03233 15.2102L12.7532 12.4597C12.8291 12.4159 12.8922 12.3528 12.9361 12.2769C12.98 12.201 13.0031 12.1148 13.0032 12.0271V6.52366C14.4137 6.65163 15.7205 7.31871 16.6516 8.386C17.5826 9.45329 18.0661 10.8386 18.0014 12.2534C17.9367 13.6682 17.3288 15.0036 16.3043 15.9815C15.2798 16.9593 13.9176 17.5044 12.5013 17.5031Z"
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
              لوحة متابعة شاملة
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <Typography
              variant="h3"
              color="text.primary"
              className="font-extrabold text-[2rem] sm:text-[2.4rem] md:text-[3rem] leading-tight"
            >
              إحصائيات دقيقة..
            </Typography>
            <Typography
              variant="h3"
              className="font-extrabold text-[2rem] sm:text-[2.4rem] md:text-[3rem] leading-tight"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ترسم رحلة التفوق
            </Typography>
          </div>
          <Typography
            color="text.secondary"
            className="max-w-xl text-base leading-relaxed"
          >
            لا مفاجآت في مستوى طفلك بعد اليوم. راقب تقدمه عبر لوحة إحصائيات
            مبسطة تلخص إنجازاته وتمنحك الطمأنينة.
          </Typography>
        </div>

        {/* Main bento grid
            In RTL: first col = right side (big dashboard), second col = left side (small cards)
            Both columns stretch to equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-stretch">
          {/* Col 1 (RTL = right): 2 small cards stacked */}
          <div
            className="grid grid-cols-1 gap-5 order-2 lg:order-2"
            style={{ gridTemplateRows: "1fr 1fr" }}
          >
            {/* Card 1 — Concept Analysis */}
            <Card
              elevation={isDark ? 0 : 3}
              sx={cardStyle}
            >
              <CardContent className="p-5 md:p-6 flex flex-col gap-4 h-full">
                <div>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    className="font-bold text-lg"
                  >
                    تحليل مفصل للمفاهيم
                  </Typography>
                  <Typography
                    color="text.secondary"
                    className="text-sm leading-relaxed mt-1"
                  >
                    اكتشف بدقة نقاط القوة التي يتميز بها طفلك لتعزيزها، ونقاط
                    الضعف التي تحتاج إلى مراجعة وتدريب.
                  </Typography>
                </div>
                <div className="flex flex-col gap-3">
                  {conceptData.map((c) => (
                    <div
                      key={c.name}
                      className="flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {c.strength}%
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.primary"
                          className="font-medium"
                        >
                          {c.name}
                        </Typography>
                      </div>
                      <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.1)"
                            : "#e5e7eb",
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${c.strength}%`,
                            background: c.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card 2 — Study Plan */}
            <Card
              elevation={isDark ? 0 : 3}
              sx={cardStyle}
            >
              <CardContent className="p-5 md:p-6 flex flex-col gap-4 h-full">
                <div>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    className="font-bold text-lg"
                  >
                    توصيات وخطط دراسية
                  </Typography>
                  <Typography
                    color="text.secondary"
                    className="text-sm leading-relaxed mt-1"
                  >
                    لا نكتفي برصد الأخطاء، احصل على نصائح ذكية وخطوات عملية
                    مقترحة لمساعدة طفلك على التحسن المستمر.
                  </Typography>
                </div>
                <div className="flex flex-col gap-2">
                  {studyPlan.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "#f8f7ff",
                      }}
                    >
                      <Typography
                        color="text.primary"
                        className="text-sm flex-1"
                      >
                        {item.label}
                      </Typography>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${item.color}22` }}
                      >
                        <i
                          className={`${item.icon} text-sm`}
                          style={{ color: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Col 2 (RTL = right): Big integrated dashboard card */}
          <Card
            elevation={isDark ? 0 : 3}
            sx={{ ...cardStyle, borderRadius: "1.5rem" }}
            className="order-1 lg:order-1"
          >
            <CardContent className="p-5 md:p-6 flex flex-col gap-5 h-full">
              <div>
                <Typography
                  variant="h6"
                  color="text.primary"
                  className="font-bold text-lg"
                >
                  لوحة تتبع متكاملة
                </Typography>
                <Typography
                  color="text.secondary"
                  className="text-sm leading-relaxed mt-1"
                >
                  تابع المعدل العام لتطور طفلك، وتعرف على إجمالي وقت التعلم
                  ونشاطه في مختلف المواد بلمحة بصر.
                </Typography>
              </div>

              {/* 4 stat tiles - RTL order matching actual stats page */}
              <div className="grid grid-cols-4 gap-2">
                <StatTile
                  value="28محادثة"
                  label="المحادثات مع المعلم الذكي"
                  icon="tabler-message-circle"
                  color="#22c55e"
                  isDark={isDark}
                />
                <StatTile
                  value="145سؤال"
                  label="عدد أسئلة الاختبارات"
                  icon="tabler-file-text"
                  color="#f59e0b"
                  isDark={isDark}
                />
                <StatTile
                  value="12ساعة"
                  label="وقت التعلم"
                  icon="tabler-clock"
                  color="#06b6d4"
                  isDark={isDark}
                />
                <StatTile
                  value="92%"
                  label="المعدل العام"
                  icon="tabler-chart-pie"
                  color="#8b5cf6"
                  isDark={isDark}
                />
              </div>

              {/* Donut + Area charts row - RTL: توزيع النشاط on RIGHT, تطور مستواك on LEFT */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3 flex flex-col gap-2"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "#f8f7ff",
                  }}
                >
                  <div>
                    <Typography
                      variant="caption"
                      color="text.primary"
                      className="font-semibold"
                    >
                      توزيع النشاط
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="block text-[10px]"
                    >
                      نشاطك حسب المواد الدراسية
                    </Typography>
                  </div>
                  <ResponsiveContainer
                    width="100%"
                    height={100}
                  >
                    <PieChart>
                      <Pie
                        data={activityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={45}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {activityData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: isDark ? "#2d1f6e" : "#fff",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 11,
                          direction: "rtl",
                        }}
                        formatter={(val: number, name: string) => [
                          `${val}%`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1">
                    {activityData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center gap-1.5"
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: d.color }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {d.name}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl p-3 flex flex-col gap-2"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "#f8f7ff",
                  }}
                >
                  <div>
                    <Typography
                      variant="caption"
                      color="text.primary"
                      className="font-semibold"
                    >
                      تطور مستواك
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="block text-[10px]"
                    >
                      تقدم درجاتك بالاختبارات خلال الشهر الحالي
                    </Typography>
                  </div>
                  <ResponsiveContainer
                    width="100%"
                    height={130}
                  >
                    <AreaChart
                      data={progressData}
                      margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="areaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={gridColor}
                      />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 9, fill: textSecondary }}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: textSecondary }}
                        domain={[40, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: isDark ? "#2d1f6e" : "#fff",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 11,
                          direction: "rtl",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="level"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar chart */}
              <div
                className="rounded-xl p-3"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f8f7ff",
                }}
              >
                <div className="mb-2">
                  <Typography
                    variant="caption"
                    color="text.primary"
                    className="font-semibold block"
                  >
                    متوسط درجاتك حسب المواد
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    className="block text-[10px]"
                  >
                    متوسط درجاتك بالاختبارات خلال الشهر الحالي
                  </Typography>
                </div>
                <ResponsiveContainer
                  width="100%"
                  height={110}
                >
                  <BarChart
                    data={subjectScores}
                    margin={{ top: 0, right: 4, left: -24, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={gridColor}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: textSecondary }}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: textSecondary }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? "#2d1f6e" : "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 11,
                        direction: "rtl",
                      }}
                    />
                    <Bar
                      dataKey="score"
                      radius={[6, 6, 0, 0]}
                    >
                      {subjectScores.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.fill}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom 3 tiles - RTL order matching actual stats page */}
              <div className="flex gap-3">
                <BottomTile
                  value="89"
                  label="إجاباتك الصحيحة"
                  sub="إجابة صحيحة"
                  accent="#22c55e"
                  isDark={isDark}
                />
                <BottomTile
                  value="لغتي"
                  label="إكمال المسيرة"
                  sub="لا تترك عملاً رائعاً في المنتصف"
                  accent="#8b5cf6"
                  isDark={isDark}
                />
                <BottomTile
                  value="2"
                  label="سرعة اجابتك"
                  sub="دقيقة"
                  accent="#8b5cf6"
                  isDark={isDark}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProgressDashboard;

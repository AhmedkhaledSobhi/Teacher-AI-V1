"use client";

// React Imports
import { useEffect, useRef, useState } from "react";

// MUI Imports
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

// Third-party Imports
import classnames from "classnames";

// Hook Imports
import { useIntersection } from "@/hooks/useIntersection";

// Styles Imports
import frontCommonStyles from "@views/front-pages/styles.module.css";

type TabId = "text" | "image" | "voice";

const tabs: { id: TabId; label: string; icon: string; color: string }[] = [
  { id: "text", label: "نصوص", icon: "tabler-file-text", color: "#F59E0B" },
  { id: "image", label: "صور", icon: "tabler-photo", color: "#8B5CF6" },
  { id: "voice", label: "صوت", icon: "tabler-microphone", color: "#EF4444" },
];

const tabMessages: Record<TabId, string> = {
  text: "أستاذ، كيف أحل هذه المسألة؟ 20 = 3x + 5 .. شكلها صعب! 😰",
  image: "أستاذ، شرح لي هذه الصورة من الكتاب 📷",
  voice: "أستاذ، ممكن تشرح لي الدرس بصوتك؟ 🎙️",
};

const UsefulFeature = () => {
  const [activeTab, setActiveTab] = useState<TabId>("text");

  const skipIntersection = useRef(true);
  const ref = useRef<null | HTMLDivElement>(null);

  const { updateIntersections } = useIntersection();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false;
          return;
        }
        updateIntersections({ [entry.target.id]: entry.isIntersecting });
      },
      { threshold: 0.35 }
    );
    ref.current && observer.observe(ref.current);
  }, [updateIntersections]);

  return (
    <section
      id="features"
      ref={ref}
      dir="rtl"
      style={{
        background: isDark ? "#1e0d45" : "#ede8f5",
      }}
    >
      <div
        className={classnames(
          "flex flex-col items-center gap-10 pbs-16 pbe-20",
          frontCommonStyles.layoutSpacing
        )}
      >
        {/* Badge */}
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
                d="M12.2602 9.11675V11.9422L14.6079 13.3507C14.7262 13.4218 14.8114 13.5368 14.8448 13.6707C14.8782 13.8045 14.857 13.9462 14.786 14.0644C14.715 14.1827 14.5999 14.2679 14.4661 14.3013C14.3322 14.3347 14.1906 14.3135 14.0723 14.2425L11.4724 12.6825C11.3955 12.6363 11.3318 12.571 11.2876 12.4928C11.2434 12.4147 11.2202 12.3264 11.2202 12.2367V9.11675C11.2202 8.97885 11.275 8.84659 11.3725 8.74907C11.47 8.65155 11.6023 8.59677 11.7402 8.59677C11.8781 8.59677 12.0104 8.65155 12.1079 8.74907C12.2054 8.84659 12.2602 8.97885 12.2602 9.11675ZM17.98 7.5568C17.8421 7.5568 17.7098 7.61159 17.6123 7.7091C17.5148 7.80662 17.46 7.93888 17.46 8.07679V9.24675C17.0473 8.76837 16.6261 8.30753 16.1523 7.82784C15.2851 6.96058 14.1816 6.36809 12.9796 6.12441C11.7776 5.88073 10.5305 5.99666 9.39402 6.45773C8.25756 6.91879 7.28216 7.70454 6.58971 8.71678C5.89727 9.72903 5.51847 10.9229 5.50066 12.1492C5.48285 13.3755 5.82681 14.5799 6.48957 15.6118C7.15233 16.6437 8.10449 17.4575 9.22709 17.9513C10.3497 18.4452 11.5929 18.5973 12.8015 18.3886C14.01 18.18 15.1303 17.6198 16.0223 16.7781C16.072 16.7311 16.1119 16.6749 16.1398 16.6125C16.1678 16.5501 16.1831 16.4828 16.1851 16.4145C16.187 16.3462 16.1754 16.2781 16.1511 16.2143C16.1267 16.1504 16.09 16.092 16.0431 16.0423C15.9961 15.9926 15.9399 15.9527 15.8775 15.9247C15.8151 15.8968 15.7478 15.8814 15.6795 15.8795C15.6112 15.8776 15.5431 15.8891 15.4793 15.9135C15.4154 15.9378 15.357 15.9746 15.3073 16.0215C14.5637 16.7222 13.6302 17.1884 12.6233 17.3617C11.6165 17.5351 10.5808 17.408 9.64571 16.9963C8.71063 16.5846 7.91755 15.9065 7.36552 15.0468C6.81348 14.1871 6.52696 13.1837 6.54173 12.1621C6.5565 11.1405 6.8719 10.1459 7.44856 9.3025C8.02521 8.45908 8.83756 7.80423 9.78415 7.41973C10.7307 7.03522 11.7696 6.93811 12.7711 7.1405C13.7726 7.3429 14.6922 7.83584 15.4152 8.55777C15.9443 9.09336 16.4077 9.60944 16.875 10.1567H15.3801C15.2422 10.1567 15.1099 10.2115 15.0124 10.309C14.9149 10.4065 14.8601 10.5388 14.8601 10.6767C14.8601 10.8146 14.9149 10.9469 15.0124 11.0444C15.1099 11.1419 15.2422 11.1967 15.3801 11.1967H17.98C18.1179 11.1967 18.2502 11.1419 18.3477 11.0444C18.4452 10.9469 18.5 10.8146 18.5 10.6767V8.07679C18.5 7.93888 18.4452 7.80662 18.3477 7.7091C18.2502 7.61159 18.1179 7.5568 17.98 7.5568Z"
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
                d="M12.2602 9.11675V11.9422L14.6079 13.3507C14.7262 13.4218 14.8114 13.5368 14.8448 13.6707C14.8782 13.8045 14.857 13.9462 14.786 14.0644C14.715 14.1827 14.5999 14.2679 14.4661 14.3013C14.3322 14.3347 14.1906 14.3135 14.0723 14.2425L11.4724 12.6825C11.3955 12.6363 11.3318 12.571 11.2876 12.4928C11.2434 12.4147 11.2202 12.3264 11.2202 12.2367V9.11675C11.2202 8.97885 11.275 8.84659 11.3725 8.74907C11.47 8.65155 11.6023 8.59677 11.7402 8.59677C11.8781 8.59677 12.0104 8.65155 12.1079 8.74907C12.2054 8.84659 12.2602 8.97885 12.2602 9.11675ZM17.98 7.5568C17.8421 7.5568 17.7098 7.61159 17.6123 7.7091C17.5148 7.80662 17.46 7.93888 17.46 8.07679V9.24675C17.0473 8.76837 16.6261 8.30753 16.1523 7.82784C15.2851 6.96058 14.1816 6.36809 12.9796 6.12441C11.7776 5.88073 10.5305 5.99666 9.39402 6.45773C8.25756 6.91879 7.28216 7.70454 6.58971 8.71678C5.89727 9.72903 5.51847 10.9229 5.50066 12.1492C5.48285 13.3755 5.82681 14.5799 6.48957 15.6118C7.15233 16.6437 8.10449 17.4575 9.22709 17.9513C10.3497 18.4452 11.5929 18.5973 12.8015 18.3886C14.01 18.18 15.1303 17.6198 16.0223 16.7781C16.072 16.7311 16.1119 16.6749 16.1398 16.6125C16.1678 16.5501 16.1831 16.4828 16.1851 16.4145C16.187 16.3462 16.1754 16.2781 16.1511 16.2143C16.1267 16.1504 16.09 16.092 16.0431 16.0423C15.9961 15.9926 15.9399 15.9527 15.8775 15.9247C15.8151 15.8968 15.7478 15.8814 15.6795 15.8795C15.6112 15.8776 15.5431 15.8891 15.4793 15.9135C15.4154 15.9378 15.357 15.9746 15.3073 16.0215C14.5637 16.7222 13.6302 17.1884 12.6233 17.3617C11.6165 17.5351 10.5808 17.408 9.64571 16.9963C8.71063 16.5846 7.91755 15.9065 7.36552 15.0468C6.81348 14.1871 6.52696 13.1837 6.54173 12.1621C6.5565 11.1405 6.8719 10.1459 7.44856 9.3025C8.02521 8.45908 8.83756 7.80423 9.78415 7.41973C10.7307 7.03522 11.7696 6.93811 12.7711 7.1405C13.7726 7.3429 14.6922 7.83584 15.4152 8.55777C15.9443 9.09336 16.4077 9.60944 16.875 10.1567H15.3801C15.2422 10.1567 15.1099 10.2115 15.0124 10.309C14.9149 10.4065 14.8601 10.5388 14.8601 10.6767C14.8601 10.8146 14.9149 10.9469 15.0124 11.0444C15.1099 11.1419 15.2422 11.1967 15.3801 11.1967H17.98C18.1179 11.1967 18.2502 11.1419 18.3477 11.0444C18.4452 10.9469 18.5 10.8146 18.5 10.6767V8.07679C18.5 7.93888 18.4452 7.80662 18.3477 7.7091C18.2502 7.61159 18.1179 7.5568 17.98 7.5568Z"
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
            معلم ذكي على مدار الساعة
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Typography
            variant="h3"
            component="h2"
            className="font-extrabold text-balance leading-tight"
          >
            <span style={{ color: isDark ? "#e2d4ff" : "#3b1f8c" }}>
              معلم خصوصي..{" "}
            </span>
            <span
              style={{
                background: "linear-gradient(90deg, #c084fc, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              متاح 24/7
            </span>
          </Typography>
          <Typography
            variant="body1"
            className="max-w-xl text-center"
            style={{
              color: isDark ? "#c4b5e8" : "#5b4a8a",
              fontWeight: 500,
              lineHeight: 1.7,
            }}
          >
            لا إحراج في الأسئلة بعد اليوم. طفلك يسأل، والمعلم الذكي يجيب بالصوت
            والصورة والنص، بطريقة مشجعة ومبسطة.
          </Typography>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  background: isActive
                    ? isDark
                      ? "rgba(255,255,255,0.13)"
                      : "rgba(255,255,255,0.95)"
                    : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.55)",
                  color: isActive ? tab.color : isDark ? "#b8a8d8" : "#7c6aaa",
                  boxShadow: isActive
                    ? isDark
                      ? "0 4px 20px rgba(0,0,0,0.4)"
                      : "0 4px 16px rgba(100,60,200,0.15)"
                    : "none",
                  transform: isActive ? "translateY(-2px)" : "none",
                }}
              >
                <i
                  className={`${tab.icon} text-lg`}
                  style={{ color: tab.color }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Chat Card */}
        <div
          className="w-full rounded-3xl overflow-hidden"
          style={{
            background: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
            boxShadow: isDark
              ? "0 32px 80px rgba(0,0,0,0.4)"
              : "0 24px 64px rgba(100,60,200,0.13)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(200,180,255,0.35)",
          }}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{
              borderBottom: isDark
                ? "1px solid rgba(255,255,255,0.07)"
                : "1px solid rgba(200,180,255,0.2)",
            }}
          >
            {/* History button */}
            <button
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: isDark ? "rgba(124,58,237,0.2)" : "#ede8ff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7c3aed",
              }}
            >
              <i className="tabler-history text-xl" />
            </button>

            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <Typography
                  variant="body2"
                  style={{
                    fontWeight: 700,
                    color: isDark ? "#e2d4ff" : "#3b1f8c",
                  }}
                >
                  Teacher Ai
                </Typography>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <Typography
                    variant="caption"
                    style={{ color: isDark ? "#a89cc8" : "#7c6aaa" }}
                  >
                    متصل الآن
                  </Typography>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: isDark ? "rgba(124,58,237,0.2)" : "#ede8ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className="tabler-robot text-xl"
                  style={{ color: "#7c3aed" }}
                />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="px-5 py-6"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "#faf9ff",
              minHeight: "340px",
            }}
          >
            {/* User row */}
            <div className="flex items-center gap-2 mb-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isDark ? "rgba(124,58,237,0.2)" : "#ede8ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                🧒
              </div>
              <Typography
                variant="body2"
                style={{ color: isDark ? "#b8a8d8" : "#7c6aaa" }}
              >
                أنت
              </Typography>
            </div>

            {/* Message bubble */}
            <div className="mr-11">
              <div
                key={activeTab}
                style={{
                  display: "inline-block",
                  background: isDark
                    ? "linear-gradient(135deg, #4c2d9c, #5b21b6)"
                    : "linear-gradient(135deg, #5b21b6, #6d28d9)",
                  color: "#ffffff",
                  padding: "12px 18px",
                  borderRadius: "18px 4px 18px 18px",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  lineHeight: 1.65,
                  maxWidth: "440px",
                  direction: "rtl",
                  animation: "fadeSlideIn 0.25s ease",
                }}
              >
                {tabMessages[activeTab]}
              </div>
              <Typography
                variant="caption"
                className="block mt-1.5"
                style={{ color: isDark ? "#6a5a8a" : "#b0a0cc" }}
              >
                ص 10:35
              </Typography>
            </div>
          </div>

          {/* Input Bar */}
          <div
            className="px-4 py-3"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
              borderTop: isDark
                ? "1px solid rgba(255,255,255,0.07)"
                : "1px solid rgba(200,180,255,0.2)",
            }}
          >
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5"
              style={{
                background: isDark ? "#1c1040" : "#f5f0ff",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(200,180,255,0.3)",
              }}
            >
              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <i className="tabler-send-2 text-base" />
                </button>
                <button
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: isDark ? "rgba(239,68,68,0.15)" : "#fff0f0",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ef4444",
                    flexShrink: 0,
                  }}
                >
                  <i className="tabler-microphone text-base" />
                </button>
                <div
                  style={{
                    width: 1,
                    height: 26,
                    background: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(200,180,255,0.5)",
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Placeholder */}
              <Typography
                variant="body2"
                className="flex-1 text-right select-none"
                style={{ color: isDark ? "#4a3a6a" : "#c4b5e8" }}
              >
                اكتب رسالتك هنا يا بطل ...
              </Typography>

              {/* Image icon */}
              <button
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  background: isDark ? "rgba(255,255,255,0.07)" : "#ede8ff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isDark ? "#9d8ac0" : "#7c3aed",
                  flexShrink: 0,
                }}
              >
                <i className="tabler-photo text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default UsefulFeature;

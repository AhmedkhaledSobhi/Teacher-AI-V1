"use client";

// React Imports
import Image from "next/image";

// MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Context Imports
import { usePremiumModal } from "@/contexts/PremiumModalContext";

// --- Feature list data ---
const features = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconBg: "#fce4ec",
    iconColor: "#e91e8c",
    title: "حوار ذكي بلا حدود",
    desc: "تواصل مستمر مع المعلم الذكي للإجابة على كافة التساؤلات.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 8c1.1-1.333 3-1 3 1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    iconBg: "#e8eaf6",
    iconColor: "#5c6bc0",
    title: "معلمك بشخصية فريدة",
    desc: "حرية تصميم هوية المعلم لتناسب اهتمامات طفلك.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <polyline
          points="22 12 18 12 15 21 9 3 6 12 2 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconBg: "#e3f2fd",
    iconColor: "#1e88e5",
    title: "رؤية تحليلية دقيقة",
    desc: "تقارير ذكية توضح مسار التقدم ونقاط القوة بدقة.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    iconBg: "#fff3e0",
    iconColor: "#fb8c00",
    title: "ذكاء الاختبارات المتجددة",
    desc: "توليد تمارين تفاعلية مخصصة لكل درس لضمان الفهم العميق.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
      >
        <polygon
          points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    iconBg: "#f3e5f5",
    iconColor: "#8e24aa",
    title: "تحديات المعرفة الشاملة",
    desc: "إنشاء اختبارات مجمعة تغطي عدة وحدات بضغطة زر.",
  },
];

const PremiumModal = () => {
  const { isPremiumModalOpen, closePremiumModal } = usePremiumModal();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={isPremiumModalOpen}
      onClose={closePremiumModal}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      scroll="body"
      closeAfterTransition={false}
      sx={{
        "& .MuiDialog-paper": {
          overflow: "hidden",
          borderRadius: isMobile ? 0 : "20px",
          m: isMobile ? 0 : 2,
        },
        "& .MuiBackdrop-root": {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            minHeight: isMobile ? "auto" : 560,
            position: "relative",
          }}
        >
          {/* ---- Close Button ---- */}
          <IconButton
            onClick={closePremiumModal}
            size="small"
            aria-label="close"
            sx={{
              position: "absolute",
              top: 12,
              insetInlineStart: 12,
              zIndex: 10,
              color: "text.secondary",
              bgcolor: "background.paper",
              boxShadow: 1,
              width: 32,
              height: 32,
              "&:hover": { bgcolor: "background.default" },
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>

          {/* ========== LEFT PANEL: Features ========== */}
          <div
            style={{
              flex: isMobile ? "none" : "0 0 55%",
              padding: isMobile ? "28px 20px 24px" : "40px 36px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              background: "var(--mui-palette-background-paper, #fff)",
            }}
          >
            {/* Title */}
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "1.4rem" : "1.65rem",
                  fontWeight: 700,
                  color: "var(--mui-palette-text-primary)",
                  lineHeight: 1.4,
                }}
              >
                كن بطلاً مع المعلم الذكي
              </h2>
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "1.4rem" : "1.65rem",
                  fontWeight: 700,
                  color: "#e91e8c",
                  lineHeight: 1.4,
                }}
              >
                المميز!
              </h2>
            </div>

            {/* Features List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    flexDirection: "row-reverse",
                  }}
                >
                  {/* Icon tile */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: f.iconBg,
                      color: f.iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {f.icon}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: "var(--mui-palette-text-primary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {f.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.78rem",
                        color: "var(--mui-palette-text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming soon note */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 6,
                marginTop: 18,
                direction: "rtl",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: "#7c4dca", flexShrink: 0 }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontSize: "0.76rem",
                  color: "var(--mui-palette-text-secondary)",
                  textAlign: "right",
                }}
              >
                هذه الميزات الحصرية قيد التطوير حالياً وستكون متاحة قريباً.
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={closePremiumModal}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "14px 24px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, #c850c0 0%, #7c4dca 50%, #4527a0 100%)",
                color: "#fff",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "0.01em",
                boxShadow: "0 6px 20px rgba(124,77,202,0.35)",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
              }}
            >
              أعلمني فور الإطلاق
            </button>

            {/* Skip link */}
            <button
              onClick={closePremiumModal}
              style={{
                marginTop: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.82rem",
                color: "var(--mui-palette-text-secondary)",
                textAlign: "center",
                width: "100%",
              }}
            >
              الاستمرار بالباقة الأساسية حالياً
            </button>
          </div>

          {/* ========== RIGHT PANEL: Decorative ========== */}
          <div
            style={{
              flex: isMobile ? "none" : "0 0 45%",
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(160deg, #3a1f6e 0%, #2d1a5a 100%)"
                  : "linear-gradient(160deg, #f8f0ff 0%, #f0e6fc 60%, #fce4f4 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "36px 24px 28px" : "48px 32px",
              position: "relative",
              minHeight: isMobile ? 300 : "auto",
              overflow: "hidden",
            }}
          >
            {/* Decorative sparkle top-right */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              style={{
                position: "absolute",
                top: 20,
                insetInlineEnd: 20,
                opacity: 0.4,
              }}
            >
              <path
                d="M14 2L15.5 12.5L26 14L15.5 15.5L14 26L12.5 15.5L2 14L12.5 12.5L14 2Z"
                fill={theme.palette.mode === "dark" ? "#c084fc" : "#c084fc"}
              />
            </svg>
            {/* Decorative sparkle bottom-left */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 28 28"
              fill="none"
              style={{
                position: "absolute",
                bottom: 32,
                insetInlineStart: 20,
                opacity: 0.3,
              }}
            >
              <path
                d="M14 2L15.5 12.5L26 14L15.5 15.5L14 26L12.5 15.5L2 14L12.5 12.5L14 2Z"
                fill={theme.palette.mode === "dark" ? "#c084fc" : "#c084fc"}
              />
            </svg>

            {/* Robot mascot */}
            <div
              style={{
                position: "relative",
                width: isMobile ? 160 : 200,
                height: isMobile ? 160 : 200,
                marginBottom: 20,
              }}
            >
              <Image
                src="/images/premium-robot-mascot.jpg"
                alt="المعلم الذكي المميز"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            {/* Right panel text */}
            <h3
              style={{
                margin: 0,
                marginBottom: 10,
                fontSize: isMobile ? "1.3rem" : "1.5rem",
                fontWeight: 800,
                color: theme.palette.mode === "dark" ? "#e2b8ff" : "#5531a8",
                textAlign: "center",
                lineHeight: 1.45,
              }}
            >
              ارتق برحلة التعلم مع{" "}
              <span style={{ color: "#e91e8c" }}>الباقة المميزة</span>
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: theme.palette.mode === "dark" ? "#c4a8e8" : "#7c4dca",
                textAlign: "center",
                lineHeight: 1.7,
                maxWidth: 260,
              }}
            >
              ميزات استثنائية صُممت بحب لتجعل تجربة طفلك التعليمية أكثر ذكاءً
              ومتعة.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumModal;

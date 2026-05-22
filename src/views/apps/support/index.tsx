"use client";

import { useState } from "react";
import { useTheme } from "@mui/material";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "support" | "survey";
type SurveyRole = "student" | "parent" | null;

// ─── Student survey steps ─────────────────────────────────────────────────────

const STUDENT_STEPS = [
  {
    key: "كيف كان يومك مع المعلم الذكي اليوم؟",
    type: "emoji-grid" as const,
    options: [
      { label: "ممتع", emoji: "😊" },
      { label: "رهيب جداً", emoji: "🤩" },
      { label: "ممل شوي", emoji: "🤭" },
      { label: "عادي", emoji: "😐" },
    ],
  },
  {
    key: "وش أكثر شيء ساعدك تفهم الدرس بسرعة؟",
    type: "icon-grid" as const,
    options: [
      { label: "سماع الشرح بالصوت", icon: "🎧" },
      { label: "سؤال المعلم الذكي", icon: "💬" },
      { label: "قراءة شرح الدرس", icon: "📖" },
      { label: "انجاز الاختبارات", icon: "🎯" },
    ],
  },
  {
    key: "عشان تصير المنصة أحسن، في شيء زعجك أو حسيته صعب؟",
    type: "icon-grid" as const,
    options: [
      { label: "ما في ألعاب كفاية", icon: "🎮" },
      { label: "المنصة بطيئة أحياناً", icon: "🐢" },
      { label: "لا، كل شيء رهيب", icon: "🦸" },
      { label: "الأسئلة صعبة جداً", icon: "❓" },
    ],
  },
];

// ─── Parent survey steps ──────────────────────────────────────────────────────

const PARENT_STEPS = [
  {
    key: "ما هو أكبر تغيير إيجابي لمسته في طفلك منذ استخدامه منصة المعلم الذكي؟",
    type: "text-grid" as const,
    options: [
      {
        label: "تحسن أكاديمي",
        desc: "لاحظت ارتفاعاً في درجاته وفهمه للمنهج",
      },
      {
        label: "استقلالية أكبر",
        desc: "صار يعتمد على نفسه في المذاكرة وحل الواجبات",
      },
      {
        label: "تغيير في السلوك",
        desc: "صار يحب وقت المذاكرة وما يتهرب منها",
      },
      {
        label: "توفير مادي",
        desc: "المنصة أغنتني عن الدروس الخصوصية",
      },
    ],
  },
  {
    key: 'كولي أمر، كيف تقيم لوحة "إحصائيات الطالب" والمقترحات التي نقدمها لك؟',
    type: "text-grid" as const,
    options: [
      {
        label: "ممتازة وواضحة",
        desc: "وأعرف تماماً كيف أوجه طفلي بعدها",
      },
      {
        label: "جيدة كأرقام",
        desc: "لكني أحتاج (نصائح عملية) لمعالجة نقاط ضعفه",
      },
      {
        label: "صعبة القراءة",
        desc: "وأحس بضياع بين الأرقام والتفاصيل",
      },
      {
        label: "لم أجربها",
        desc: "لم أستخدمها أو لم أنتبه لوجودها حتى الآن",
      },
    ],
  },
  {
    key: "بناءً على التطور الذي حققه طفلك، ما مدى احتمالية أن تنصح عائلة أخرى بمنصة المعلم الذكي؟",
    type: "nps" as const,
  },
  {
    key: "هل هناك ميزة معينة تتمنى رؤيتها قريباً؟ أو أي اقتراح تراه مناسباً لتطوير المنصة؟",
    type: "textarea" as const,
    optional: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const HeadingSection = ({ isDark }: { isDark: boolean }) => (
  <div style={{ textAlign: "center", marginBottom: "32px" }}>
    <h1
      style={{
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "clamp(28px, 5vw, 44px)",
        fontWeight: 800,
        color: isDark ? "#F5F0FF" : "#2D1260",
        margin: "0 0 8px",
        lineHeight: 1.25,
      }}
    >
      نحن هنا من أجلك يا بطل!
    </h1>
    <p
      style={{
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "clamp(15px, 2.5vw, 18px)",
        fontWeight: 500,
        color: isDark ? "#C4ABFF" : "#6948B8",
        margin: 0,
      }}
    >
      شاركنا رأيك لنجعل المنصة أفضل، أو دع فريقنا يحل أي مشكلة تقنية تواجهك
      فوراً
    </p>
  </div>
);

const TabSwitcher = ({
  active,
  onChange,
  isDark,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  isDark: boolean;
}) => {
  const bg = isDark ? "rgba(255,255,255,0.07)" : "#FFFFFF";
  const border = isDark
    ? "1px solid rgba(255,255,255,0.10)"
    : "1px solid #E8E0FF";

  return (
    <div
      style={{
        display: "flex",
        borderRadius: "16px",
        overflow: "hidden",
        background: bg,
        border,
        marginBottom: "24px",
        direction: "rtl",
      }}
    >
      {(
        [
          { key: "support" as Tab, label: "الدعم الفني", icon: "🎧" },
          { key: "survey" as Tab, label: "استبيان التطوير", icon: "📋" },
        ] as const
      ).map(({ key, label, icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              flex: 1,
              padding: "18px 24px",
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "16px",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "#FFFFFF" : isDark ? "#C4ABFF" : "#6948B8",
              background: isActive
                ? "linear-gradient(90deg, #7C3AED, #A855F7)"
                : "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background 0.2s",
            }}
          >
            <span style={{ fontSize: "20px" }}>{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
};

// ─── Support (contact) form ───────────────────────────────────────────────────

const SupportForm = ({ isDark }: { isDark: boolean }) => {
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF";
  const cardBorder = isDark
    ? "1px solid rgba(255,255,255,0.10)"
    : "1px solid #EDE8FF";
  const inputBg = isDark ? "rgba(255,255,255,0.08)" : "#F8F5FF";
  const inputBorder = isDark
    ? "1px solid rgba(255,255,255,0.12)"
    : "1px solid #D4C5FF";
  const labelColor = isDark ? "#C4ABFF" : "#4C2E9E";
  const textColor = isDark ? "#F5F0FF" : "#2D1260";
  const placeholderColor = isDark ? "rgba(196,171,255,0.5)" : "#A08EC8";

  const [inquiryType, setInquiryType] = useState<"تقني" | "تعليمي" | "آخر">(
    "تقني"
  );
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const types = ["تقني", "تعليمي", "آخر"] as const;

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/v1/form/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, inquiry_type: inquiryType }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    background: inputBg,
    border: inputBorder,
    fontFamily: '"Readex Pro", sans-serif',
    fontSize: "15px",
    color: textColor,
    outline: "none",
    direction: "rtl" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: "20px",
        padding: "clamp(20px, 4vw, 36px)",
        boxShadow: isDark
          ? "0 4px 32px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(105,72,184,0.08)",
      }}
      dir="rtl"
    >
      <h2
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "20px",
          fontWeight: 700,
          color: textColor,
          margin: "0 0 8px",
          textAlign: "center",
        }}
      >
        لديك مشكلة أو استفسار؟
      </h2>
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "14px",
          color: "#DC64C9",
          textAlign: "center",
          margin: "0 0 28px",
        }}
      >
        ولا يهمك أخبرنا بالمشكلة التي تواجهك وسيقوم فريق الدعم الفني بالعمل على
        حلها
      </p>

      {/* Issue type */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "14px",
          fontWeight: 600,
          color: labelColor,
          margin: "0 0 12px",
        }}
      >
        طبيعة المشكلة: *
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {(
          [
            {
              type: "مشكلة تقنية" as const,
              key: "تقني" as const,
              icon: "ℹ️",
              desc: "بطء، تعليق في النظام، أو خطأ في صفحة",
            },
            {
              type: "استفسار تعليمي" as const,
              key: "تعليمي" as const,
              icon: "❓",
              desc: "خطأ في سؤال، أو استفسار عن درس معين",
            },
            {
              type: "اقتراح آخر" as const,
              key: "آخر" as const,
              icon: "💡",
              desc: "الباقات المميزة، الدفع، أو أفكار للتطوير",
            },
          ] as const
        ).map(({ type, key, icon, desc }) => {
          const sel = inquiryType === key;
          return (
            <button
              key={key}
              onClick={() => setInquiryType(key)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                padding: "16px 8px",
                borderRadius: "14px",
                border: sel
                  ? "2px solid #7C3AED"
                  : isDark
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid #E0D5FF",
                background: sel
                  ? isDark
                    ? "rgba(124,58,237,0.18)"
                    : "rgba(124,58,237,0.07)"
                  : inputBg,
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: "22px" }}>{icon}</span>
              <span
                style={{
                  fontFamily: '"Readex Pro", sans-serif',
                  fontSize: "13px",
                  fontWeight: 700,
                  color: sel ? "#7C3AED" : textColor,
                }}
              >
                {type}
              </span>
              <span
                style={{
                  fontFamily: '"Readex Pro", sans-serif',
                  fontSize: "11px",
                  color: placeholderColor,
                  textAlign: "center",
                }}
              >
                {desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Details textarea */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "14px",
          fontWeight: 600,
          color: labelColor,
          margin: "0 0 10px",
        }}
      >
        تفاصيل المشكلة: *
      </p>
      <textarea
        value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        placeholder="الرجاء الشرح بالتفصيل (أين حدثت المشكلة وماذا ظهر لك؟)..."
        rows={5}
        style={{
          ...inputStyle,
          resize: "vertical",
          marginBottom: "16px",
        }}
      />

      {/* Name + Email row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "14px",
              fontWeight: 600,
              color: labelColor,
              margin: "0 0 8px",
            }}
          >
            الاسم: *
          </p>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="أدخل اسمك"
            style={inputStyle}
          />
        </div>
        <div>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "14px",
              fontWeight: 600,
              color: labelColor,
              margin: "0 0 8px",
            }}
          >
            البريد الإلكتروني: *
          </p>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="example@email.com"
            style={{ ...inputStyle, direction: "ltr" }}
          />
        </div>
      </div>

      {status === "success" ? (
        <div
          style={{
            textAlign: "center",
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(16,185,129,0.12)",
            color: "#10b981",
            fontFamily: '"Readex Pro", sans-serif',
            fontWeight: 600,
          }}
        >
          تم إرسال رسالتك بنجاح! سيتواصل معك الفريق قريباً.
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={
            status === "loading" || !form.name || !form.email || !form.message
          }
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            background:
              status === "loading"
                ? "#9CA3AF"
                : "linear-gradient(90deg, #7C3AED, #A855F7)",
            border: "none",
            cursor: status === "loading" ? "wait" : "pointer",
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "17px",
            fontWeight: 700,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {status === "loading" ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
      )}
    </div>
  );
};

// ─── Option card (emoji / icon grid) ─────────────────────────────────────────

const OptionCard = ({
  label,
  icon,
  emoji,
  selected,
  onSelect,
  isDark,
}: {
  label: string;
  icon?: string;
  emoji?: string;
  selected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) => (
  <button
    onClick={onSelect}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "12px",
      padding: "24px 16px 16px",
      borderRadius: "16px",
      border: selected
        ? "2px solid #7C3AED"
        : isDark
          ? "1px solid rgba(255,255,255,0.10)"
          : "1px solid #E8E0FF",
      background: selected
        ? isDark
          ? "rgba(124,58,237,0.18)"
          : "rgba(124,58,237,0.07)"
        : isDark
          ? "rgba(255,255,255,0.04)"
          : "#FFFFFF",
      cursor: "pointer",
      transition: "all 0.18s",
      minHeight: "140px",
    }}
  >
    <span style={{ fontSize: "40px", lineHeight: 1 }}>{emoji || icon}</span>
    <span
      style={{
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "13px",
        fontWeight: 600,
        color: selected ? "#7C3AED" : isDark ? "#C4ABFF" : "#4C2E9E",
        textAlign: "center",
        background: selected
          ? isDark
            ? "rgba(124,58,237,0.25)"
            : "rgba(124,58,237,0.10)"
          : isDark
            ? "rgba(255,255,255,0.08)"
            : "#F3EEFF",
        padding: "4px 14px",
        borderRadius: "100px",
        border: selected ? "1px solid #7C3AED40" : "none",
      }}
    >
      {label}
    </span>
  </button>
);

// ─── Text option card (for parent survey) ─────────────────────────────────────

const TextCard = ({
  label,
  desc,
  selected,
  onSelect,
  isDark,
}: {
  label: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) => (
  <button
    onClick={onSelect}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "24px 16px",
      borderRadius: "16px",
      border: selected
        ? "2px solid #7C3AED"
        : isDark
          ? "1px solid rgba(255,255,255,0.10)"
          : "1px solid #E8E0FF",
      background: selected
        ? isDark
          ? "rgba(124,58,237,0.18)"
          : "rgba(124,58,237,0.07)"
        : isDark
          ? "rgba(255,255,255,0.04)"
          : "#FFFFFF",
      cursor: "pointer",
      transition: "all 0.18s",
      textAlign: "center",
    }}
  >
    <span
      style={{
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "15px",
        fontWeight: 700,
        color: selected ? "#7C3AED" : isDark ? "#F5F0FF" : "#2D1260",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "13px",
        color: isDark ? "rgba(196,171,255,0.7)" : "#7C65A8",
      }}
    >
      {desc}
    </span>
  </button>
);

// ─── Survey flow ──────────────────────────────────────────────────────────────

const SurveyFlow = ({
  isDark,
  userName,
}: {
  isDark: boolean;
  userName: string;
}) => {
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF";
  const cardBorder = isDark
    ? "1px solid rgba(255,255,255,0.10)"
    : "1px solid #EDE8FF";
  const textColor = isDark ? "#F5F0FF" : "#2D1260";

  const [role, setRole] = useState<SurveyRole>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [nps, setNps] = useState<number | null>(null);
  const [openText, setOpenText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const steps = role === "student" ? STUDENT_STEPS : PARENT_STEPS;
  const totalSteps = steps.length;
  const currentStep = steps[step];

  const currentAnswer = currentStep ? answers[currentStep.key] : null;
  const canNext =
    currentStep?.type === "nps"
      ? nps !== null
      : currentStep?.type === "textarea"
        ? true // optional
        : Boolean(currentAnswer);

  const handleSubmit = async () => {
    setLoading(true);
    const finalResponses = { ...answers };
    if (nps !== null) {
      const npsKey =
        "بناءً على التطور الذي حققه طفلك، ما مدى احتمالية أن تنصح عائلة أخرى بمنصة المعلم الذكي؟";
      finalResponses[npsKey] = String(nps);
    }
    if (openText) {
      const textKey =
        "هل هناك ميزة معينة تتمنى رؤيتها قريباً؟ أو أي اقتراح تراه مناسباً لتطوير المنصة؟";
      finalResponses[textKey] = openText;
    }

    try {
      await fetch("/api/v1/form/internal-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: finalResponses,
          session_id: `sess-${Date.now()}`,
          user_type: role === "student" ? `البطل ${userName}` : "ولي الأمر",
        }),
      });
    } catch {
      // Silently submit
    }
    setLoading(false);
    setSubmitted(true);
  };

  // Role selection
  if (!role) {
    return (
      <div
        style={{
          background: cardBg,
          border: cardBorder,
          borderRadius: "20px",
          padding: "clamp(20px, 4vw, 36px)",
          boxShadow: isDark
            ? "0 4px 32px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(105,72,184,0.08)",
        }}
        dir="rtl"
      >
        <h2
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "22px",
            fontWeight: 800,
            color: textColor,
            textAlign: "center",
            margin: "0 0 6px",
          }}
        >
          مرحباً بك في مساحة الإبداع!
        </h2>
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "15px",
            color: "#DC64C9",
            textAlign: "center",
            margin: "0 0 32px",
          }}
        >
          أخبرنا أولاً من أنت؟ لنطرح عليك الأسئلة المناسبة
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {(
            [
              {
                key: "student" as const,
                label: `أنا البطل ${userName}`,
                img: "/images/personas/avatar-student.jpg",
              },
              {
                key: "parent" as const,
                label: "أنا ولي الأمر",
                img: "/images/personas/avatar-parent.jpg",
              },
            ] as const
          ).map(({ key, label, img }) => (
            <button
              key={key}
              onClick={() => setRole(key)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "32px 16px 24px",
                borderRadius: "16px",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.10)"
                  : "1px solid #E8E0FF",
                background: isDark ? "rgba(255,255,255,0.04)" : "#FAFBFF",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#7C3AED";
                (e.currentTarget as HTMLButtonElement).style.background = isDark
                  ? "rgba(124,58,237,0.12)"
                  : "rgba(124,58,237,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  isDark ? "rgba(255,255,255,0.10)" : "#E8E0FF";
                (e.currentTarget as HTMLButtonElement).style.background = isDark
                  ? "rgba(255,255,255,0.04)"
                  : "#FAFBFF";
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #7C3AED40",
                }}
              >
                <Image
                  src={img}
                  alt={label}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <span
                style={{
                  fontFamily: '"Readex Pro", sans-serif',
                  fontSize: "16px",
                  fontWeight: 700,
                  color: textColor,
                }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Submitted
  if (submitted) {
    return (
      <div
        style={{
          background: cardBg,
          border: cardBorder,
          borderRadius: "20px",
          padding: "60px 32px",
          textAlign: "center",
          boxShadow: isDark
            ? "0 4px 32px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(105,72,184,0.08)",
        }}
        dir="rtl"
      >
        <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎉</div>
        <h2
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "24px",
            fontWeight: 800,
            color: textColor,
            margin: "0 0 12px",
          }}
        >
          شكراً جزيلاً على وقتك!
        </h2>
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "15px",
            color: "#DC64C9",
            margin: 0,
          }}
        >
          رأيك يساعدنا نصير أفضل كل يوم
        </p>
      </div>
    );
  }

  // Progress bar
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: isDark
          ? "0 4px 32px rgba(0,0,0,0.3)"
          : "0 4px 24px rgba(105,72,184,0.08)",
      }}
      dir="rtl"
    >
      {/* Progress */}
      <div
        style={{
          height: "5px",
          background: isDark ? "rgba(255,255,255,0.08)" : "#EDE8FF",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #7C3AED, #A855F7)",
            transition: "width 0.3s ease",
            borderRadius: "0 4px 4px 0",
          }}
        />
      </div>

      <div style={{ padding: "clamp(20px, 4vw, 36px)" }}>
        {/* Question */}
        <h3
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "clamp(16px, 2.5vw, 20px)",
            fontWeight: 700,
            color: textColor,
            margin: "0 0 8px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {currentStep.key}
        </h3>

        {currentStep.type === "textarea" && (
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "14px",
              color: "#DC64C9",
              textAlign: "center",
              margin: "0 0 20px",
            }}
          >
            (هذا الحقل اختياري، لكننا نقرأ كل حرف بعناية)
          </p>
        )}

        {/* Options */}
        <div style={{ marginTop: "24px", marginBottom: "32px" }}>
          {(currentStep.type === "emoji-grid" ||
            currentStep.type === "icon-grid") && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
            >
              {currentStep.options.map((opt) => (
                <OptionCard
                  key={opt.label}
                  label={opt.label}
                  emoji={"emoji" in opt ? opt.emoji : undefined}
                  icon={"icon" in opt ? opt.icon : undefined}
                  selected={currentAnswer === opt.label}
                  onSelect={() =>
                    setAnswers((a) => ({
                      ...a,
                      [currentStep.key]: opt.label,
                    }))
                  }
                  isDark={isDark}
                />
              ))}
            </div>
          )}

          {currentStep.type === "text-grid" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
            >
              {currentStep.options.map((opt) => (
                <TextCard
                  key={opt.label}
                  label={opt.label}
                  desc={opt.desc}
                  selected={currentAnswer === opt.label}
                  onSelect={() =>
                    setAnswers((a) => ({
                      ...a,
                      [currentStep.key]: opt.label,
                    }))
                  }
                  isDark={isDark}
                />
              ))}
            </div>
          )}

          {currentStep.type === "nps" && (
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {Array.from({ length: 11 }, (_, i) => 10 - i).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNps(n)}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "12px",
                      border:
                        nps === n
                          ? "2px solid #7C3AED"
                          : isDark
                            ? "1px solid rgba(255,255,255,0.15)"
                            : "1px solid #D4C5FF",
                      background:
                        nps === n
                          ? "linear-gradient(135deg, #7C3AED, #A855F7)"
                          : isDark
                            ? "rgba(255,255,255,0.05)"
                            : "#F8F5FF",
                      color:
                        nps === n ? "#FFF" : isDark ? "#C4ABFF" : "#4C2E9E",
                      fontFamily: '"Readex Pro", sans-serif',
                      fontSize: "16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: '"Readex Pro", sans-serif',
                    fontSize: "12px",
                    color: isDark ? "rgba(196,171,255,0.6)" : "#9080B8",
                  }}
                >
                  أكيد أنصح فيها بقوة
                </span>
                <span
                  style={{
                    fontFamily: '"Readex Pro", sans-serif',
                    fontSize: "12px",
                    color: isDark ? "rgba(196,171,255,0.6)" : "#9080B8",
                  }}
                >
                  مستحيل أنصح بها
                </span>
              </div>
            </div>
          )}

          {currentStep.type === "textarea" && (
            <textarea
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              placeholder="اكتب اقتراحاتك وما يجول في ذهنك حول منصة المعلم الذكي..."
              rows={5}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                background: isDark ? "rgba(255,255,255,0.08)" : "#F8F5FF",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid #D4C5FF",
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "15px",
                color: isDark ? "#F5F0FF" : "#2D1260",
                outline: "none",
                direction: "rtl",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          )}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              if (step === 0) {
                setRole(null);
                setAnswers({});
                setNps(null);
                setOpenText("");
              } else {
                setStep((s) => s - 1);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              background: "transparent",
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "16px",
              fontWeight: 600,
              color: isDark ? "#C4ABFF" : "#6948B8",
              cursor: "pointer",
            }}
          >
            السابق
            <span style={{ fontSize: "18px" }}>&#x2192;</span>
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "12px 28px",
                borderRadius: "12px",
                border: "none",
                background: canNext
                  ? "linear-gradient(90deg, #7C3AED, #A855F7)"
                  : isDark
                    ? "rgba(255,255,255,0.12)"
                    : "#E0D5FF",
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "16px",
                fontWeight: 700,
                color: canNext
                  ? "#FFFFFF"
                  : isDark
                    ? "rgba(255,255,255,0.3)"
                    : "#B0A0D8",
                cursor: canNext ? "pointer" : "default",
                transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: "18px" }}>&#x2190;</span>
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "12px 28px",
                borderRadius: "12px",
                border: "none",
                background: loading
                  ? "#9CA3AF"
                  : "linear-gradient(90deg, #7C3AED, #A855F7)",
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "16px",
                fontWeight: 700,
                color: "#FFFFFF",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "جاري الإرسال..." : "إرسال الاستبيان"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main SupportView ─────────────────────────────────────────────────────────

const SupportView = ({
  mode,
  lang,
}: {
  mode: "light" | "dark";
  lang: string;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user: sessionUser } = useUser();
  const userName = sessionUser?.name || "";
  const [activeTab, setActiveTab] = useState<Tab>("support");

  const sectionBg = isDark
    ? "linear-gradient(160deg, #1a0a3c 0%, #2d1260 100%)"
    : "#EDE8F7";

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: sectionBg,
        padding: "clamp(24px, 5vw, 56px) clamp(16px, 5vw, 32px)",
        fontFamily: '"Readex Pro", sans-serif',
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <HeadingSection isDark={isDark} />
        <TabSwitcher
          active={activeTab}
          onChange={setActiveTab}
          isDark={isDark}
        />
        {activeTab === "support" ? (
          <SupportForm isDark={isDark} />
        ) : (
          <SurveyFlow
            isDark={isDark}
            userName={userName}
          />
        )}
      </div>
    </div>
  );
};

export default SupportView;

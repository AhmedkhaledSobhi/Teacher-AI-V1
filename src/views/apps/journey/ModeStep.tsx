"use client";

import type { getDictionary } from "@/utils/getDictionary";
import type { Selection } from "./types";

type JourneyDict = Awaited<ReturnType<typeof getDictionary>>["journey"];

// ─── SVG Icons — match the screenshot exactly ─────────────────────────────────

/** شرح الدرس — classroom / teacher-screen icon */
const TeacherIcon = () => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      width="56"
      height="56"
      rx="16"
      fill="#EDEAFF"
    />
    <rect
      x="12"
      y="14"
      width="32"
      height="22"
      rx="3"
      stroke="#4B3FA0"
      strokeWidth="2.2"
    />
    <path
      d="M22 36v4"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M34 36v4"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M18 40h20"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle
      cx="28"
      cy="25"
      r="4"
      stroke="#4B3FA0"
      strokeWidth="2.2"
    />
    <path
      d="M21 33c0-3.866 3.134-5 7-5s7 1.134 7 5"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

/** الإختبار بالدرس — target / goal icon */
const TargetIcon = () => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      width="56"
      height="56"
      rx="16"
      fill="#EDEAFF"
    />
    <circle
      cx="28"
      cy="28"
      r="12"
      stroke="#4B3FA0"
      strokeWidth="2.2"
    />
    <circle
      cx="28"
      cy="28"
      r="6"
      stroke="#4B3FA0"
      strokeWidth="2.2"
    />
    <circle
      cx="28"
      cy="28"
      r="2"
      fill="#4B3FA0"
    />
    <path
      d="M38 18l-4.5 4.5"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M41 15l-3 3"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M38 18h3"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M38 18v-3"
      stroke="#4B3FA0"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Free Badge ───────────────────────────────────────────────────────────────

function FreeBadge({ label = "مجاني" }: { label?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        background: "rgba(0,180,110,0.15)",
        border: "1px solid rgba(0,180,110,0.30)",
        borderRadius: "20px",
        padding: "4px 12px",
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "13px",
        fontWeight: 600,
        color: "#00995A",
        direction: "rtl",
      }}
    >
      {label}
    </div>
  );
}

// ─── Mode Card ────────────────────────────────────────────────────────────────

interface ModeCardProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
  badgeLabel?: string;
}

function ModeCard({
  label,
  description,
  icon,
  selected,
  onClick,
  isDark,
  badgeLabel,
}: ModeCardProps) {
  const cardBg = "#ffffff";
  const cardBgDark = selected ? "rgba(88,56,165,0.65)" : "rgba(88,56,165,0.30)";
  const borderColor = selected
    ? isDark
      ? "rgba(180,150,255,0.55)"
      : "#7C4DFF"
    : isDark
      ? "rgba(150,120,220,0.20)"
      : "rgba(105,72,184,0.10)";
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const descColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(62,37,107,0.55)";

  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        background: isDark
          ? cardBgDark
          : selected
            ? "rgba(105,72,184,0.06)"
            : cardBg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: "24px",
        padding: "40px 24px 36px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        width: "100%",
        direction: "rtl",
        transition: "all 0.2s ease",
        boxShadow: selected
          ? isDark
            ? "0 4px 20px rgba(0,0,0,0.28)"
            : "0 4px 20px rgba(105,72,184,0.16)"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.20)"
            : "0 4px 20px rgba(105,72,184,0.07)",
      }}
    >
      {badgeLabel && <FreeBadge label={badgeLabel} />}

      {/* Icon with subtle circle background */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(105,72,184,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(20px, 2.5vw, 28px)",
          fontWeight: 700,
          color: titleColor,
          textAlign: "center",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "15px",
          fontWeight: 400,
          color: descColor,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        {description}
      </span>
    </button>
  );
}

// ─── ModeStep ─────────────────────────────────────────────────────────────────

interface ModeStepProps {
  dict: JourneyDict;
  selection: Selection;
  onSelect: (v: string) => void;
  isDark: boolean;
}

export default function ModeStep({
  dict,
  selection,
  onSelect,
  isDark,
}: ModeStepProps) {
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#6948B8";

  const badgeLabel = (dict as any).mode?.freeBadge ?? "مجاني";

  return (
    <div>
      <h2
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(22px, 3vw, 45px)",
          fontWeight: 700,
          color: titleColor,
          textAlign: "center",
          marginBottom: "8px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {dict.mode.title}
      </h2>
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "22px",
          fontWeight: 500,
          color: subColor,
          textAlign: "center",
          marginBottom: "40px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {dict.mode.subtitle}
      </p>

      {/* Two equal cards side-by-side — matching screenshot */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* شرح الدرس — "explain" mode */}
        <ModeCard
          label={dict.mode.explain}
          description={dict.mode.explainDesc}
          icon={<TeacherIcon />}
          selected={selection.mode === "explain"}
          onClick={() => onSelect("explain")}
          isDark={isDark}
          badgeLabel={badgeLabel}
        />

        {/* الإختبار بالدرس — "quiz" mode */}
        <ModeCard
          label={dict.mode.quiz}
          description={dict.mode.quizDesc}
          icon={<TargetIcon />}
          selected={selection.mode === "quiz"}
          onClick={() => onSelect("quiz")}
          isDark={isDark}
          badgeLabel={badgeLabel}
        />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function PremiumBadge() {
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        background: "rgba(185,28,28,0.10)",
        border: "1px solid rgba(185,28,28,0.25)",
        borderRadius: "20px",
        padding: "4px 12px",
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "13px",
        fontWeight: 600,
        color: "#B91C1C",
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <LockIcon
        size={12}
        color="#B91C1C"
      />
      مميز
    </div>
  );
}

function FreeBadge() {
  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        background: "rgba(0,180,110,0.12)",
        border: "1px solid rgba(0,180,110,0.28)",
        borderRadius: "20px",
        padding: "4px 12px",
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "13px",
        fontWeight: 600,
        color: "#00995A",
        direction: "rtl",
      }}
    >
      مجاني
    </div>
  );
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────────

function LockIcon({
  size = 16,
  color = "#B91C1C",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="3"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Pink clipboard icon for "اختبار ذكي" */
function SmartClipboardIcon() {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "rgba(236,72,153,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect
          x="8"
          y="2"
          width="8"
          height="4"
          rx="1"
          stroke="#EC4899"
          strokeWidth="1.8"
        />
        <rect
          x="4"
          y="4"
          width="16"
          height="18"
          rx="2"
          stroke="#EC4899"
          strokeWidth="1.8"
        />
        <path
          d="M8 4h8"
          stroke="#EC4899"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 10h8M8 13h6M8 16h4"
          stroke="#EC4899"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle
          cx="18"
          cy="18"
          r="4"
          fill="#EC4899"
        />
        <path
          d="M16.5 18l1 1 2-2"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** Green clipboard icon for "اختبار أساسي" */
function BasicClipboardIcon() {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "rgba(34,197,94,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect
          x="8"
          y="2"
          width="8"
          height="4"
          rx="1"
          stroke="#16A34A"
          strokeWidth="1.8"
        />
        <rect
          x="4"
          y="4"
          width="16"
          height="18"
          rx="2"
          stroke="#16A34A"
          strokeWidth="1.8"
        />
        <path
          d="M8 4h8"
          stroke="#16A34A"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 10h8M8 13h6M8 16h4"
          stroke="#16A34A"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ─── Tag pills ─────────────────────────────────────────────────────────────────

function TagPill({ label, pink }: { label: string; pink?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "20px",
        border: `1px solid ${pink ? "rgba(236,72,153,0.30)" : "rgba(105,72,184,0.20)"}`,
        background: pink ? "rgba(236,72,153,0.08)" : "rgba(105,72,184,0.06)",
        fontFamily: '"Readex Pro", sans-serif',
        fontSize: "13px",
        fontWeight: 500,
        color: pink ? "#BE185D" : "#5531A8",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ─── Quiz Type Card ─────────────────────────────────────────────────────────────

interface QuizTypeCardProps {
  type: "basic" | "smart";
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
  disabled?: boolean;
}

function QuizTypeCard({
  type,
  selected,
  onClick,
  isDark,
  disabled = false,
}: QuizTypeCardProps) {
  const [hovered, setHovered] = useState(false);

  const isSmart = type === "smart";
  const isActive = !disabled;

  const borderColor = selected
    ? isDark
      ? "rgba(180,150,255,0.55)"
      : "#7C4DFF"
    : isActive && hovered
      ? isDark
        ? "rgba(180,150,255,0.30)"
        : "rgba(105,72,184,0.30)"
      : isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(105,72,184,0.10)";

  const bg = disabled
    ? isDark
      ? "rgba(40,28,80,0.35)"
      : "rgba(0,0,0,0.04)"
    : isDark
      ? selected
        ? "rgba(88,56,165,0.55)"
        : hovered
          ? "rgba(88,56,165,0.30)"
          : "rgba(40,28,80,0.70)"
      : selected
        ? "rgba(105,72,184,0.06)"
        : "#FFFFFF";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => {
        if (!disabled) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        position: "relative",
        background: bg,
        border: `1.5px solid ${borderColor}`,
        borderRadius: "24px",
        padding: "48px 24px 36px",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        direction: "rtl",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.5 : 1,
        boxShadow: selected
          ? isDark
            ? "0 4px 24px rgba(0,0,0,0.30)"
            : "0 4px 24px rgba(105,72,184,0.16)"
          : isActive && hovered
            ? isDark
              ? "0 4px 16px rgba(0,0,0,0.25)"
              : "0 4px 20px rgba(105,72,184,0.12)"
            : isDark
              ? "0 2px 8px rgba(0,0,0,0.20)"
              : "0 4px 16px rgba(105,72,184,0.07)",
        transform:
          isActive && hovered && !selected
            ? "translateY(-2px)"
            : "translateY(0)",
      }}
    >
      {isSmart ? <PremiumBadge /> : <FreeBadge />}

      {isSmart ? <SmartClipboardIcon /> : <BasicClipboardIcon />}

      <span
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(20px, 2.5vw, 28px)",
          fontWeight: 700,
          color: isDark ? "#F5F0FF" : "#3E256B",
          textAlign: "center",
        }}
      >
        {isSmart ? "اختبار ذكي" : "اختبار أساسي"}
      </span>

      <span
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "14px",
          color: isDark ? "rgba(255,255,255,0.55)" : "rgba(62,37,107,0.55)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        {isSmart
          ? "أسئلة مخصصة تتكيف مع مستواك تلقائياً"
          : "أسئلة جاهزة من الدرس لاختبار فهمك"}
      </span>

      {/* Tag pills */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {isSmart ? (
          <>
            <TagPill
              label="أسئلة متجددة"
              pink
            />
            <TagPill
              label="تقرير مفصل"
              pink
            />
          </>
        ) : (
          <>
            <TagPill label="٥ أسئلة" />
            <TagPill label="اختيار من متعدد" />
          </>
        )}
      </div>
    </button>
  );
}

// ─── QuizTypeStep ─────────────────────────────────────────────────────────────

interface QuizTypeStepProps {
  isDark: boolean;
  selectedType?: "basic" | "smart";
  onSelect: (type: "basic" | "smart") => void;
}

export default function QuizTypeStep({
  isDark,
  selectedType,
  onSelect,
}: QuizTypeStepProps) {
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#6948B8";

  return (
    <div>
      <h2
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(22px, 3vw, 40px)",
          fontWeight: 700,
          color: titleColor,
          textAlign: "center",
          marginBottom: "8px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        اختر نوع الاختبار
      </h2>
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "18px",
          fontWeight: 500,
          color: subColor,
          textAlign: "center",
          marginBottom: "40px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        اختر نوع الاختبار الذي تريده
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <QuizTypeCard
          type="basic"
          selected={selectedType === "basic"}
          onClick={() => onSelect("basic")}
          isDark={isDark}
        />
        <QuizTypeCard
          type="smart"
          selected={false}
          onClick={() => {}}
          isDark={isDark}
          disabled
        />
      </div>

      {/* Tip */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "15px",
          color: subColor,
          textAlign: "center",
          marginTop: "28px",
          direction: "rtl",
        }}
      >
        نصيحة: حاول مراجعة الشرح أولاً ثم اختبر نفسك لنتائج أفضل!
      </p>
    </div>
  );
}

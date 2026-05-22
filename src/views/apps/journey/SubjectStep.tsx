"use client";

import type { getDictionary } from "@/utils/getDictionary";
import RobotMascot from "@core/components/RobotMascot";
import {
  SUBJECT_KEYS_ORDER,
  SUBJECT_ICONS,
  SUBJECT_ICON_BG,
  SUBJECT_ICON_BG_DARK,
} from "./shared";
import type { Selection } from "./types";
import type { ApiSubject } from "./index";

type JourneyDict = Awaited<ReturnType<typeof getDictionary>>["journey"];

interface SubjectCardProps {
  subjectKey: string;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
}

function SubjectCard({
  subjectKey,
  label,
  icon,
  selected,
  onClick,
  isDark,
}: SubjectCardProps) {
  const cardBg = isDark
    ? selected
      ? "rgba(88,56,165,0.70)"
      : "rgba(88,56,165,0.40)"
    : selected
      ? "rgba(105,72,184,0.08)"
      : "#ffffff";

  const borderColor = selected
    ? isDark
      ? "rgba(180,150,255,0.5)"
      : "#7C4DFF"
    : isDark
      ? "rgba(150,120,220,0.25)"
      : "rgba(105,72,184,0.12)";

  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const iconBg = isDark
    ? (SUBJECT_ICON_BG_DARK[subjectKey] ?? "rgba(255,255,255,0.15)")
    : (SUBJECT_ICON_BG[subjectKey] ?? "#F5F3FF");

  return (
    <button
      onClick={onClick}
      style={{
        background: cardBg,
        border: `2px solid ${borderColor}`,
        borderRadius: "16px",
        padding:
          "clamp(16px, 3vw, 28px) clamp(12px, 2.5vw, 20px) clamp(14px, 3vw, 24px)",
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        transition: "all 0.2s ease",
        boxShadow: selected
          ? isDark
            ? "0 4px 20px rgba(0,0,0,0.30)"
            : "0 4px 20px rgba(105,72,184,0.20)"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.25)"
            : "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: "clamp(44px, 8vw, 64px)",
          height: "clamp(44px, 8vw, 64px)",
          borderRadius: "14px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(14px, 2.5vw, 22px)",
          fontWeight: 700,
          color: titleColor,
          lineHeight: "150%",
          textAlign: "center",
          direction: "rtl",
        }}
      >
        {label}
      </span>
    </button>
  );
}

interface SubjectStepProps {
  dict: JourneyDict;
  selection: Selection;
  onSelect: (label: string, key: string) => void;
  isDark: boolean;
  /** Subjects from the curriculum API — when provided, renders all of them instead of the static list */
  apiSubjects?: ApiSubject[];
}

export default function SubjectStep({
  dict,
  selection,
  onSelect,
  isDark,
  apiSubjects,
}: SubjectStepProps) {
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#5531A8";

  return (
    <div style={{ textAlign: "center" }}>
      {/* Robot mascot */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <RobotMascot
          width={128}
          height={120}
        />
      </div>

      {/* Title — 54px H1 */}
      <h1
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(28px, 4vw, 54px)",
          fontWeight: 700,
          color: titleColor,
          textAlign: "center",
          marginBottom: "12px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {dict.subject.title}
      </h1>

      {/* Subtitle — 31px H4 */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(16px, 2.5vw, 31px)",
          fontWeight: 400,
          color: subColor,
          textAlign: "center",
          marginBottom: "40px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {dict.subject.subtitle}
      </p>

      {/* Subject grid — data-driven from API when available, falls back to static dict */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {apiSubjects && apiSubjects.length > 0
          ? apiSubjects.map((s) => {
              const key = s.subjectKey;
              const label = s.display_name;
              const icon = SUBJECT_ICONS[key] ?? SUBJECT_ICONS["science"];
              return (
                <SubjectCard
                  key={s.subject_id}
                  subjectKey={key}
                  label={label}
                  icon={icon}
                  selected={selection.subject === label}
                  onClick={() => onSelect(label, key)}
                  isDark={isDark}
                />
              );
            })
          : SUBJECT_KEYS_ORDER.map((key) => {
              const label = (dict.subject.subjects as Record<string, string>)[
                key
              ];
              if (!label) return null;
              return (
                <SubjectCard
                  key={key}
                  subjectKey={key}
                  label={label}
                  icon={SUBJECT_ICONS[key]}
                  selected={selection.subject === label}
                  onClick={() => onSelect(label, key)}
                  isDark={isDark}
                />
              );
            })}
      </div>
    </div>
  );
}

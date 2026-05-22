"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import { useRouter, useParams } from "next/navigation";
import api from "@/utils/api";
import { useUser } from "@/hooks/useUser";
import type { SystemMode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";
import DecorativeElements from "@/views/DecorativeElements";
import { getLocalizedUrl } from "@/utils/i18n";
import type { Locale } from "@configs/i18n";
import RobotMascot from "@core/components/RobotMascot";

import {
  SUBJECT_KEYS_ORDER,
  SUBJECT_ICONS,
  SUBJECT_ICON_BG,
  SUBJECT_ICON_BG_DARK,
  isSubjectEnabled,
  LockSVG,
} from "./shared";
import PrepareQuizScreen from "./PrepareQuizScreen";
import {
  QuizTakingScreen,
  QuizResultsScreen,
  type QuizData,
  type StudentAnswer,
} from "@/views/apps/quiz/QuizScreens";
import type { UnitData, LessonData } from "./types";

// ─── Types ─────────────────────────────────────────────────────────────────────

type JourneyDict = Awaited<ReturnType<typeof getDictionary>>["journey"];

export type SubjectIdMap = Record<string, number>;

export interface ApiSubject {
  subject_id: number;
  subject: string;
  display_name: string;
  subjectKey: string;
}

type Props = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

// ─── Helper: resolve subject key from API response ─────────────────────────────

function resolveSubjectKey(subject: string, displayName: string): string {
  const s = (subject ?? "").toLowerCase().trim();
  const d = (displayName ?? "").trim();
  if (
    s.includes("arabic") ||
    d.includes("لغتي") ||
    d.includes("اللغة العربية") ||
    d.includes("عربي")
  )
    return "arabic";
  if (s.includes("math") || d.includes("رياضيات")) return "math";
  if (s.includes("science") || d.includes("علوم")) return "science";
  if (
    s.includes("islamic") ||
    d.includes("إسلامية") ||
    d.includes("الدراسات الإسلامية")
  )
    return "islamic";
  if (
    s.includes("english") ||
    d.includes("الإنجليزية") ||
    d.includes("إنجليزي")
  )
    return "english";
  if (
    s.includes("digital") ||
    d.includes("الرقمية") ||
    d.includes("رقمية") ||
    d.includes("تقنية")
  )
    return "digital";
  if (
    s.includes("social studies") ||
    d.includes("الاجتماعية") ||
    d.includes("اجتماعية")
  )
    return "social_studies";
  if (
    s.includes("life") ||
    d.includes("الحياتية") ||
    d.includes("مهارات الحياة") ||
    d.includes("الأسرية")
  )
    return "life_skills";
  if (s.includes("social") || d.includes("مهارات") || d.includes("تربية وطنية"))
    return "social";
  return s.replace(/\s+/g, "_") || "other";
}

function normalizeUnit(u: any, idx: number): UnitData {
  return {
    unit_id: u.unit_id ?? u.id,
    unit_title: u.unit_title ?? u.name ?? `وحدة ${idx + 1}`,
    unit_number: u.unit_number ?? idx + 1,
    lessons_count:
      u.lessons_count ?? (Array.isArray(u.lessons) ? u.lessons.length : 0),
    cover_image: u.cover_image ?? u.unit_cover ?? undefined,
    lessons: u.lessons ?? [],
  };
}

// ─── SVG: ChevronDown ─────────────────────────────────────────────────────────

function ChevronDown({
  size = 18,
  color = "currentColor",
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
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── SVG: BookOpen icon ───────────────────────────────────────────────────────

function BookOpenIcon({
  color = "#6948B8",
  size = 18,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── SVG: Target icon ─────────────────────────────────────────────────────────

function TargetIcon({
  color = "#6948B8",
  size = 18,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="6"
        stroke={color}
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="2"
        fill={color}
      />
    </svg>
  );
}

// ─── SVG: Spinner ────────────────────────────────────────────────────────────

function Spinner({
  color = "#6948B8",
  size = 20,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "journeySpin 0.8s linear infinite" }}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "rgba(124,95,212,0.18)" : "#f0ebff";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: bg,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, height: 16, borderRadius: 6, background: bg }} />
    </div>
  );
}

// ─── Teacher Picker Modal ─────────────────────────�����────�����──────────────────────

type TeacherPersona = "Ahmad" | "Shifa" | "Omar" | "Safa";

interface TeacherCard {
  id: TeacherPersona;
  nameFirst: string;
  nameLast: string;
  title: string;
  free: boolean;
  image: string;
}

const TEACHER_PERSONAS: TeacherCard[] = [
  {
    id: "Shifa",
    nameFirst: "المعلمة",
    nameLast: "شفاء",
    title: "فنانة القصص والألوان",
    free: true,
    image: "/images/personas/Shifaa.png",
  },
  {
    id: "Ahmad",
    nameFirst: "المعلم",
    nameLast: "أحمد",
    title: "بطل المغامرات والكشتات",
    free: true,
    image: "/images/personas/Ahmed.png",
  },
  {
    id: "Safa",
    nameFirst: "المعلمة",
    nameLast: "صفا",
    title: "مهندسة التقنية والابتكار",
    free: false,
    image: "/images/personas/Safa.png",
  },
  {
    id: "Omar",
    nameFirst: "المعلم",
    nameLast: "عمر",
    title: "كابتن الألعاب والتحديات",
    free: false,
    image: "/images/personas/Omar.png",
  },
];

function LockIconSmall() {
  return (
    <svg
      width="11"
      height="13"
      viewBox="0 0 11 13"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.75 5.5H8.25V3.75C8.25 2.23 7.02 1 5.5 1C3.98 1 2.75 2.23 2.75 3.75V5.5H2.25C1.56 5.5 1 6.06 1 6.75V11.25C1 11.94 1.56 12.5 2.25 12.5H8.75C9.44 12.5 10 11.94 10 11.25V6.75C10 6.06 9.44 5.5 8.75 5.5ZM5.5 9.75C4.81 9.75 4.25 9.19 4.25 8.5C4.25 7.81 4.81 7.25 5.5 7.25C6.19 7.25 6.75 7.81 6.75 8.5C6.75 9.19 6.19 9.75 5.5 9.75ZM7.25 5.5H3.75V3.75C3.75 2.79 4.54 2 5.5 2C6.46 2 7.25 2.79 7.25 3.75V5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface TeacherPickerModalProps {
  isDark: boolean;
  onSelect: (persona: TeacherPersona) => void;
  onClose: () => void;
}

function TeacherPickerModal({
  isDark,
  onSelect,
  onClose,
}: TeacherPickerModalProps) {
  const overlayBg = isDark ? "rgba(10,6,28,0.88)" : "rgba(30,15,70,0.55)";
  const modalBg = isDark ? "rgba(26,16,62,0.98)" : "#FFFFFF";
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subtitleColor = isDark ? "rgba(245,240,255,0.65)" : "#5531A8";

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: overlayBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="اختر المعلم"
    >
      <div
        style={{
          background: modalBg,
          borderRadius: 24,
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px 28px 28px",
          direction: "rtl",
          boxShadow: "0 24px 80px rgba(0,0,0,0.40)",
          position: "relative",
          marginTop: "90px",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(62,37,107,0.08)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDark ? "rgba(255,255,255,0.70)" : "rgba(62,37,107,0.70)",
            fontSize: 20,
            lineHeight: 1,
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(62,37,107,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(62,37,107,0.08)";
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 700,
              color: titleColor,
              margin: "0 0 8px",
            }}
          >
            مين حابب يشرحلك الدرس اليوم؟
          </h2>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(13px, 1.6vw, 16px)",
              fontWeight: 400,
              color: subtitleColor,
              margin: 0,
            }}
          >
            اختار معلمك المفضل وخلينا نبدأ رحلة التعلم!
          </p>
        </div>

        {/* Teacher cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          {TEACHER_PERSONAS.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              isDark={isDark}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherCard({
  teacher,
  isDark,
  onSelect,
}: {
  teacher: TeacherCard;
  isDark: boolean;
  onSelect: (id: TeacherPersona) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF";
  const borderColor =
    hovered && teacher.free
      ? isDark
        ? "rgba(124,95,212,0.70)"
        : "rgba(105,72,184,0.45)"
      : isDark
        ? "rgba(255,255,255,0.10)"
        : "rgba(105,72,184,0.12)";
  const boxShadow =
    hovered && teacher.free
      ? "0 8px 32px rgba(105,72,184,0.22)"
      : "0 2px 12px rgba(0,0,0,0.06)";
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subtitleColor = isDark
    ? "rgba(245,240,255,0.50)"
    : "rgba(62,37,107,0.55)";

  return (
    <div
      role={teacher.free ? "button" : undefined}
      tabIndex={teacher.free ? 0 : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => teacher.free && onSelect(teacher.id)}
      onKeyDown={(e) =>
        teacher.free && e.key === "Enter" && onSelect(teacher.id)
      }
      style={{
        position: "relative",
        borderRadius: 18,
        background: cardBg,
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        overflow: "hidden",
        cursor: teacher.free ? "pointer" : "default",
        opacity: teacher.free ? 1 : 0.6,
        transform:
          hovered && teacher.free ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.20s ease",
        direction: "rtl",
      }}
    >
      {/* Free / Coming soon badge */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          background: teacher.free
            ? isDark
              ? "rgba(16,185,129,0.22)"
              : "#DCFCE7"
            : isDark
              ? "rgba(245,158,11,0.22)"
              : "#FEF9C3",
          color: teacher.free ? "#16A34A" : "#92400E",
          borderRadius: 100,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: '"Readex Pro", sans-serif',
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {!teacher.free && <LockIconSmall />}
        {teacher.free ? "مجاني" : "قريباً"}
      </div>

      {/* Image */}
      <div
        style={{
          background: isDark ? "rgba(167,139,250,0.08)" : "#F5F0FF",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          height: 180,
          overflow: "hidden",
        }}
      >
        <img
          src={teacher.image}
          alt={`${teacher.nameFirst} ${teacher.nameLast}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      </div>

      {/* Text */}
      <div style={{ padding: "14px 16px", textAlign: "center" }}>
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 12,
            fontWeight: 400,
            color: subtitleColor,
            margin: "0 0 2px",
          }}
        >
          {teacher.nameFirst}
        </p>
        <h3
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 20,
            fontWeight: 700,
            color: "#E040FB",
            margin: "0 0 4px",
          }}
        >
          {teacher.nameLast}
        </h3>
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 12,
            fontWeight: 400,
            color: subtitleColor,
            margin: 0,
          }}
        >
          {teacher.title}
        </p>
      </div>
    </div>
  );
}

// ─── Quiz Type Picker Modal ───────────────────────────────────────────────────

interface QuizTypePickerModalProps {
  isDark: boolean;
  onSelect: (category: "basic" | "smart") => void;
  onClose: () => void;
}

function QuizTypePickerModal({
  isDark,
  onSelect,
  onClose,
}: QuizTypePickerModalProps) {
  const overlayBg = isDark ? "rgba(10,6,28,0.88)" : "rgba(30,15,70,0.55)";
  const modalBg = isDark ? "rgba(26,16,62,0.98)" : "#FFFFFF";
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subtitleColor = isDark ? "rgba(245,240,255,0.65)" : "#5531A8";

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: overlayBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="اختر نوع الاختبار"
    >
      <div
        style={{
          background: modalBg,
          borderRadius: 24,
          width: "100%",
          maxWidth: 560,
          padding: "36px 28px 32px",
          direction: "rtl",
          boxShadow: "0 24px 80px rgba(0,0,0,0.40)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(62,37,107,0.08)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDark ? "rgba(255,255,255,0.70)" : "rgba(62,37,107,0.70)",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(20px, 3vw, 26px)",
              fontWeight: 700,
              color: titleColor,
              margin: "0 0 8px",
            }}
          >
            اختر نوع الاختبار
          </h2>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(13px, 1.6vw, 15px)",
              fontWeight: 400,
              color: subtitleColor,
              margin: 0,
            }}
          >
            الاختبار المجاني يغطي أساسيات الدرس، والمميز يُولَّد بالذكاء
            الاصطناعي لمستواك
          </p>
        </div>

        {/* Cards */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <QuizTypeCard
            isDark={isDark}
            type="basic"
            title="مجاني"
            description="أسئلة من محتوى الدرس"
            badge="مجاني"
            badgeFree
            icon={<BasicQuizIcon isDark={isDark} />}
            onSelect={onSelect}
          />
          <QuizTypeCard
            isDark={isDark}
            type="smart"
            title="مميز"
            description="أسئلة مخصصة بالذكاء الاصطناعي"
            badge="قريباً"
            badgeFree={false}
            icon={<SmartQuizIcon isDark={isDark} />}
            onSelect={onSelect}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function BasicQuizIcon({ isDark }: { isDark: boolean }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <rect
        width="36"
        height="36"
        rx="10"
        fill={isDark ? "rgba(124,95,212,0.25)" : "rgba(105,72,184,0.12)"}
      />
      <path
        d="M10 13h16M10 18h10M10 23h13"
        stroke={isDark ? "#d4bdff" : "#6948B8"}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SmartQuizIcon({ isDark }: { isDark: boolean }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <rect
        width="36"
        height="36"
        rx="10"
        fill={isDark ? "rgba(234,179,8,0.18)" : "rgba(234,179,8,0.12)"}
      />
      <path
        d="M18 8l2.2 6.8H27l-5.6 4.1 2.1 6.7L18 21.5l-5.5 4.1 2.1-6.7L9 14.8h6.8z"
        fill="#EAB308"
      />
    </svg>
  );
}

interface QuizTypeCardProps {
  isDark: boolean;
  type: "basic" | "smart";
  title: string;
  description: string;
  badge: string;
  badgeFree: boolean;
  icon: React.ReactNode;
  onSelect: (type: "basic" | "smart") => void;
  disabled?: boolean;
}

function QuizTypeCard({
  isDark,
  type,
  title,
  description,
  badge,
  badgeFree,
  icon,
  onSelect,
  disabled = false,
}: QuizTypeCardProps) {
  const [hovered, setHovered] = useState(false);

  const cardBg = disabled
    ? isDark
      ? "rgba(255,255,255,0.03)"
      : "rgba(0,0,0,0.04)"
    : isDark
      ? "rgba(255,255,255,0.05)"
      : "#FFFFFF";
  const borderBase = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(105,72,184,0.12)";
  const borderHovered =
    type === "basic"
      ? isDark
        ? "rgba(124,95,212,0.70)"
        : "rgba(105,72,184,0.45)"
      : isDark
        ? "rgba(234,179,8,0.60)"
        : "rgba(234,179,8,0.45)";
  const titleColor = disabled
    ? isDark
      ? "rgba(245,240,255,0.30)"
      : "rgba(62,37,107,0.35)"
    : isDark
      ? "#F5F0FF"
      : "#3E256B";
  const descColor = disabled
    ? isDark
      ? "rgba(245,240,255,0.20)"
      : "rgba(62,37,107,0.25)"
    : isDark
      ? "rgba(245,240,255,0.55)"
      : "rgba(62,37,107,0.55)";

  function handleClick() {
    if (!disabled) onSelect(type);
  }

  return (
    <div
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onMouseEnter={() => {
        if (!disabled) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      style={{
        borderRadius: 18,
        background: cardBg,
        border: `1.5px solid ${!disabled && hovered ? borderHovered : borderBase}`,
        boxShadow:
          !disabled && hovered
            ? type === "basic"
              ? "0 8px 32px rgba(105,72,184,0.20)"
              : "0 8px 32px rgba(234,179,8,0.18)"
            : "0 2px 12px rgba(0,0,0,0.06)",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "24px 16px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: !disabled && hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.20s ease",
        position: "relative",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Badge */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: badgeFree
            ? isDark
              ? "rgba(16,185,129,0.22)"
              : "#DCFCE7"
            : isDark
              ? "rgba(234,179,8,0.22)"
              : "#FEF9C3",
          color: badgeFree ? "#16A34A" : "#92400E",
          borderRadius: 100,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: '"Readex Pro", sans-serif',
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {!badgeFree && <LockIconSmall />}
        {badge}
      </div>

      {/* Icon */}
      <div style={{ marginTop: 8 }}>{icon}</div>

      {/* Text */}
      <div>
        <h3
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: titleColor,
            margin: "0 0 6px",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 13,
            fontWeight: 400,
            color: descColor,
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Lesson Action Buttons ─────────────────────────────────────────────────────

interface LessonActionsProps {
  isDark: boolean;
  isRtl: boolean;
  onExplain: () => void;
  onQuiz: () => void;
  locale: string;
}

function LessonActions({
  isDark,
  isRtl,
  onExplain,
  onQuiz,
  locale,
}: LessonActionsProps) {
  return (
    <div
      className="lesson-actions-container"
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        padding: "10px 16px 14px",
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* Explain button */}
      <button
        onClick={onExplain}
        className="lesson-action-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 12,
          border: `1.5px solid ${isDark ? "rgba(124,95,212,0.55)" : "rgba(105,72,184,0.30)"}`,
          background: isDark
            ? "rgba(124,95,212,0.20)"
            : "rgba(105,72,184,0.07)",
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: 14,
          fontWeight: 700,
          color: isDark ? "#d4bdff" : "#5531A8",
          cursor: "pointer",
          transition: "all 0.18s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = isDark
            ? "rgba(124,95,212,0.35)"
            : "rgba(105,72,184,0.14)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = isDark
            ? "rgba(124,95,212,0.20)"
            : "rgba(105,72,184,0.07)";
        }}
        aria-label={locale === "ar" ? "شرح الدرس" : "Explain Lesson"}
      >
        <BookOpenIcon
          color={isDark ? "#d4bdff" : "#5531A8"}
          size={16}
        />
        {locale === "ar" ? "شرح الدرس" : "Explain"}
      </button>

      {/* Quiz button */}
      <button
        onClick={onQuiz}
        className="lesson-action-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #6948B8 0%, #9B5FCF 100%)",
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: 14,
          fontWeight: 700,
          color: "#FFFFFF",
          cursor: "pointer",
          transition: "opacity 0.18s ease",
          flexShrink: 0,
          boxShadow: "0 4px 14px rgba(105,72,184,0.35)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        }}
        aria-label={locale === "ar" ? "اختبار الدرس" : "Quiz"}
      >
        <TargetIcon
          color="#FFFFFF"
          size={16}
        />
        {locale === "ar" ? "اختبار الدرس" : "Quiz"}
      </button>
    </div>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────

interface LessonRowProps {
  lesson: LessonData;
  index: number;
  isDark: boolean;
  isRtl: boolean;
  isOpen: boolean;
  onClick: () => void;
  onExplain: () => void;
  onQuiz: () => void;
  locale: string;
}

function LessonRow({
  lesson,
  index,
  isDark,
  isRtl,
  isOpen,
  onClick,
  onExplain,
  onQuiz,
  locale,
}: LessonRowProps) {
  const numColor = isDark ? "#d4bdff" : "#5531A8";
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const circleBg = isDark ? "rgba(124,95,212,0.22)" : "rgba(105,72,184,0.08)";
  const bg = isOpen
    ? isDark
      ? "rgba(88,56,165,0.28)"
      : "rgba(105,72,184,0.05)"
    : "transparent";
  const borderColor = isOpen
    ? isDark
      ? "rgba(124,95,212,0.45)"
      : "rgba(105,72,184,0.25)"
    : "transparent";

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
        background: bg,
        marginBottom: 4,
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          direction: isRtl ? "rtl" : "ltr",
          textAlign: isRtl ? "right" : "left",
        }}
        aria-expanded={isOpen}
      >
        {/* Number circle */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: circleBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: numColor,
          }}
        >
          {index + 1}
        </div>

        {/* Title */}
        <span
          style={{
            flex: 1,
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 15,
            fontWeight: isOpen ? 700 : 500,
            color: titleColor,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {lesson.lesson_title}
        </span>

        {/* Chevron */}
        <div
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          <ChevronDown
            color={isDark ? "rgba(212,189,255,0.65)" : "rgba(62,37,107,0.40)"}
          />
        </div>
      </button>

      {/* Expandable actions */}
      <div
        style={{
          maxHeight: isOpen ? 120 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <LessonActions
          isDark={isDark}
          isRtl={isRtl}
          onExplain={onExplain}
          onQuiz={onQuiz}
          locale={locale}
        />
      </div>
    </div>
  );
}

// ─── Unit Accordion ──────────────────────────────────────────────────────────

interface UnitAccordionProps {
  unit: UnitData;
  isDark: boolean;
  isRtl: boolean;
  isOpen: boolean;
  onClick: () => void;
  openLessonId: number | null;
  onLessonClick: (lessonId: number) => void;
  onExplain: (
    lessonId: number | undefined,
    lessonTitle: string,
    unitId: number
  ) => void;
  /** lessonId is optional — when omitted the quiz runs at unit level (no lesson) */
  onQuiz: (lessonId: number | undefined, unitId: number) => void;
  locale: string;
  subjectId: number;
  gradeId: number;
}

function UnitAccordion({
  unit,
  isDark,
  isRtl,
  isOpen,
  onClick,
  openLessonId,
  onLessonClick,
  onExplain,
  onQuiz,
  locale,
  subjectId,
  gradeId,
}: UnitAccordionProps) {
  const fetchedRef = useRef<number | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonsError, setLessonsError] = useState(false);

  // Whether this unit has lessons at all (based on metadata from the API).
  // When false we skip the lessons fetch entirely and show actions inline.
  const hasLessons = (unit.lessons_count ?? 0) > 0;

  // Fetch lessons only when unit has them and is opened
  useEffect(() => {
    if (!hasLessons) return;
    if (!isOpen) return;
    if (fetchedRef.current === unit.unit_id) return;
    fetchedRef.current = unit.unit_id;

    setLoadingLessons(true);
    setLessonsError(false);

    api
      .get<any>(`/api/v1/unit/${unit.unit_id}/lessons`)
      .then((data) => {
        const items: any[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.lessons)
            ? data.lessons
            : [];
        if (items.length > 0) {
          setLessons(
            items.map((l: any) => ({
              lesson_id: l.lesson_id ?? l.id,
              lesson_title: l.lesson_title ?? l.title ?? l.name ?? "",
              unit_id: l.unit_id ?? unit.unit_id,
            }))
          );
        } else {
          setLessonsError(true);
        }
      })
      .catch(() => setLessonsError(true))
      .finally(() => setLoadingLessons(false));
  }, [isOpen, unit.unit_id, hasLessons]);

  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(62,37,107,0.50)";
  const borderColor = isOpen
    ? isDark
      ? "rgba(124,95,212,0.45)"
      : "rgba(105,72,184,0.30)"
    : isDark
      ? "rgba(255,255,255,0.07)"
      : "rgba(105,72,184,0.10)";

  const cardBg = isDark
    ? isOpen
      ? "rgba(88,56,165,0.35)"
      : "rgba(88,56,165,0.18)"
    : isOpen
      ? "rgba(105,72,184,0.04)"
      : "#ffffff";

  // ── Cover image / book icon shared across both layouts ──────────────────────
  const CoverImage = (
    <div
      style={{
        width: 48,
        height: 56,
        borderRadius: 8,
        overflow: "hidden",
        background: isDark ? "rgba(255,255,255,0.08)" : "#EDE8FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {unit.cover_image ? (
        <img
          src={unit.cover_image}
          alt={unit.unit_title}
          crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 44 44"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M8 9C8 6.79 9.79 5 12 5H32C34.21 5 36 6.79 36 9V39L22 33L8 39V9Z"
            stroke={isDark ? "rgba(212,189,255,0.55)" : "#9B7FD4"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );

  // ── Inline action button factory ────────────────────────────────────────────
  function ActionBtn({
    label,
    onClick,
    accent,
  }: {
    label: string;
    onClick: () => void;
    accent: "purple" | "teal";
  }) {
    const purpleBg = isDark ? "rgba(105,72,184,0.28)" : "rgba(105,72,184,0.09)";
    const purpleBorder = isDark
      ? "rgba(180,150,255,0.35)"
      : "rgba(105,72,184,0.22)";
    const purpleColor = isDark ? "#D4BDFF" : "#6948B8";
    const tealBg = isDark ? "rgba(20,184,166,0.20)" : "rgba(20,184,166,0.09)";
    const tealBorder = isDark
      ? "rgba(20,184,166,0.38)"
      : "rgba(20,184,166,0.25)";
    const tealColor = isDark ? "#5EEAD4" : "#0F766E";

    return (
      <button
        onClick={onClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "9px 18px",
          borderRadius: 11,
          background: accent === "purple" ? purpleBg : tealBg,
          border: `1.5px solid ${accent === "purple" ? purpleBorder : tealBorder}`,
          color: accent === "purple" ? purpleColor : tealColor,
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          transition: "opacity 0.15s ease",
          direction: isRtl ? "rtl" : "ltr",
          whiteSpace: "nowrap",
        }}
      >
        {accent === "purple" ? (
          // Quiz icon
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Explain icon
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {label}
      </button>
    );
  }

  // ── NO-LESSON VARIANT: flat card with inline quiz + explain buttons ──────────
  if (!hasLessons) {
    return (
      <div
        style={{
          borderRadius: 16,
          border: `1.5px solid ${borderColor}`,
          background: cardBg,
          marginBottom: 10,
          overflow: "hidden",
          transition: "all 0.2s ease",
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.15)"
            : "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 20px",
            direction: isRtl ? "rtl" : "ltr",
          }}
        >
          {CoverImage}

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: titleColor,
                margin: 0,
                direction: isRtl ? "rtl" : "ltr",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {unit.unit_title}
            </p>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <ActionBtn
              label={locale === "ar" ? "شرح" : "Explain"}
              onClick={() =>
                onExplain(undefined, unit.unit_title, unit.unit_id)
              }
              accent="teal"
            />
            <ActionBtn
              label={locale === "ar" ? "اختبار" : "Quiz"}
              onClick={() => onQuiz(undefined, unit.unit_id)}
              accent="purple"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── NORMAL VARIANT: collapsible accordion with lessons list ─────────────────
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1.5px solid ${borderColor}`,
        background: cardBg,
        marginBottom: 10,
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: isOpen
          ? isDark
            ? "0 4px 20px rgba(0,0,0,0.25)"
            : "0 4px 20px rgba(105,72,184,0.12)"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.15)"
            : "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      {/* Unit header button */}
      <button
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          direction: isRtl ? "rtl" : "ltr",
          textAlign: isRtl ? "right" : "left",
        }}
        aria-expanded={isOpen}
      >
        {CoverImage}

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: titleColor,
              margin: 0,
              direction: isRtl ? "rtl" : "ltr",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {unit.unit_title}
          </p>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: 12,
              color: subColor,
              margin: "2px 0 0",
              direction: isRtl ? "rtl" : "ltr",
            }}
          >
            {locale === "ar"
              ? `${unit.lessons_count} درس`
              : `${unit.lessons_count} lessons`}
          </p>
        </div>

        {/* Chevron */}
        <div
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          <ChevronDown
            color={isDark ? "rgba(212,189,255,0.70)" : "rgba(62,37,107,0.45)"}
            size={20}
          />
        </div>
      </button>

      {/* Lessons list */}
      <div
        style={{
          maxHeight: isOpen ? 2000 : 0,
          overflow: "hidden",
          transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{ padding: "4px 12px 12px", direction: isRtl ? "rtl" : "ltr" }}
        >
          {loadingLessons && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow
                  key={i}
                  isDark={isDark}
                />
              ))}
            </div>
          )}

          {lessonsError && !loadingLessons && (
            <p
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: 13,
                color: isDark ? "#FF8FAB" : "#C62828",
                textAlign: "center",
                padding: "12px 0",
                direction: "rtl",
              }}
            >
              {locale === "ar"
                ? "تعذّر تحميل الدروس."
                : "Could not load lessons."}
            </p>
          )}

          {!loadingLessons &&
            !lessonsError &&
            lessons.map((lesson, idx) => (
              <LessonRow
                key={lesson.lesson_id}
                lesson={lesson}
                index={idx}
                isDark={isDark}
                isRtl={isRtl}
                isOpen={openLessonId === lesson.lesson_id}
                onClick={() => onLessonClick(lesson.lesson_id)}
                onExplain={() =>
                  onExplain(lesson.lesson_id, lesson.lesson_title, unit.unit_id)
                }
                onQuiz={() => onQuiz(lesson.lesson_id, unit.unit_id)}
                locale={locale}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Subject Accordion ──────────────�����────────�����───────────────────────────────

interface SubjectAccordionProps {
  subject: ApiSubject;
  isDark: boolean;
  isRtl: boolean;
  isOpen: boolean;
  onClick: () => void;
  openUnitId: number | null;
  onUnitClick: (unitId: number) => void;
  openLessonId: number | null;
  onLessonClick: (lessonId: number) => void;
  onExplain: (
    lessonId: number | undefined,
    lessonTitle: string,
    unitId: number,
    subjectId?: number
  ) => void;
  onQuiz: (
    lessonId: number | undefined,
    unitId: number,
    subjectId: number
  ) => void;
  locale: string;
  gradeId: number;
}

// ─── Types for Islamic Studies grouped response ───────────────────────────────

interface IslamicCourse {
  course_master_id: number;
  course_title: string;
  units: {
    unit_id: number;
    unit_title: string;
    unit_cover: string;
    lessons_count: number;
  }[];
}

function SubjectAccordion({
  subject,
  isDark,
  isRtl,
  isOpen,
  onClick,
  openUnitId,
  onUnitClick,
  openLessonId,
  onLessonClick,
  onExplain,
  onQuiz,
  locale,
  gradeId,
}: SubjectAccordionProps) {
  const fetchedRef = useRef<number | null>(null);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [courses, setCourses] = useState<IslamicCourse[]>([]); // For Islamic Studies grouped response
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [unitsError, setUnitsError] = useState(false);

  // Check if subject is enabled
  const enabled = isSubjectEnabled(subject.subjectKey, subject.display_name);
  
  // Check if this is Islamic Studies (subject_id=3)
  const isIslamicStudies = subject.subject_id === 3 || subject.subjectKey === "islamic";

  // Fetch units when subject opens.
  // `gradeId` is always sourced from the authenticated session in the parent,
  // so we rely on it directly instead of calling useSession() again here.
  useEffect(() => {
    if (!isOpen || !enabled) return;
    // gradeId=0 means the parent hasn't resolved the session grade yet
    if (!gradeId) return;
    if (fetchedRef.current === subject.subject_id) return;
    fetchedRef.current = subject.subject_id;

    setLoadingUnits(true);
    setUnitsError(false);

    api
      .get<any>(
        `/api/v1/grade/${gradeId}/subject/${subject.subject_id}/units?term_id=2`
      )
      .then((data) => {
        const items: any[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.units)
            ? data.units
            : [];
        if (items.length > 0) {
          // Check if response is grouped by courses (Islamic Studies format)
          if (items[0].course_master_id !== undefined && items[0].units !== undefined) {
            // Islamic Studies grouped format
            setCourses(items as IslamicCourse[]);
            // Flatten units for state compatibility
            const flatUnits: UnitData[] = [];
            for (const course of items as IslamicCourse[]) {
              for (const u of course.units) {
                flatUnits.push({
                  unit_id: u.unit_id,
                  unit_title: u.unit_title,
                  cover_image: u.unit_cover,
                  lessons_count: u.lessons_count,
                  lessons: [],
                });
              }
            }
            setUnits(flatUnits);
          } else {
            // Normal flat units format
            setUnits(items.map(normalizeUnit));
            setCourses([]);
          }
        } else {
          setUnitsError(true);
        }
      })
      .catch(() => setUnitsError(true))
      .finally(() => setLoadingUnits(false));
  }, [isOpen, subject.subject_id, enabled]);

  const iconBg = isDark
    ? (SUBJECT_ICON_BG_DARK[subject.subjectKey] ?? "rgba(255,255,255,0.15)")
    : (SUBJECT_ICON_BG[subject.subjectKey] ?? "#F5F3FF");

  const borderColor = isOpen
    ? isDark
      ? "rgba(124,95,212,0.55)"
      : "#7C4DFF"
    : isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(105,72,184,0.12)";

  const cardBg = isDark
    ? isOpen
      ? "rgba(88,56,165,0.50)"
      : "rgba(88,56,165,0.22)"
    : isOpen
      ? "rgba(105,72,184,0.06)"
      : "#ffffff";

  const titleColor = isDark ? "#FFFFFF" : "#3E256B";

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 20,
        border: `2px solid ${borderColor}`,
        background: cardBg,
        marginBottom: 14,
        overflow: "hidden",
        transition: "all 0.22s ease",
        boxShadow: isOpen
          ? isDark
            ? "0 6px 28px rgba(0,0,0,0.30)"
            : "0 6px 28px rgba(105,72,184,0.16)"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.18)"
            : "0 2px 12px rgba(0,0,0,0.04)",
        opacity: enabled ? 1 : 0.6,
      }}
    >
      {/* Coming soon badge for disabled subjects */}
      {!enabled && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: isRtl ? 16 : "auto",
            right: isRtl ? "auto" : 16,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: isDark ? "rgba(245,158,11,0.22)" : "#FEF9C3",
            color: "#92400E",
            padding: "4px 12px",
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: '"Readex Pro", sans-serif',
          }}
        >
          <LockSVG />
          قريبا
        </div>
      )}

      {/* Subject header */}
      <button
        onClick={enabled ? onClick : undefined}
        disabled={!enabled}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: enabled ? "pointer" : "not-allowed",
          direction: isRtl ? "rtl" : "ltr",
          textAlign: isRtl ? "right" : "left",
        }}
        aria-expanded={isOpen}
      >
        {/* Subject icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {SUBJECT_ICONS[subject.subjectKey] ?? SUBJECT_ICONS["science"]}
        </div>

        {/* Subject label */}
        <span
          style={{
            flex: 1,
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 20,
            fontWeight: 700,
            color: titleColor,
            direction: "rtl",
          }}
        >
          {subject.display_name}
        </span>

        {/* Spinner while loading or chevron */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {isOpen && loadingUnits ? (
            <Spinner
              color={isDark ? "#d4bdff" : "#6948B8"}
              size={22}
            />
          ) : (
            <div
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
              }}
            >
              <ChevronDown
                color={
                  isDark ? "rgba(212,189,255,0.70)" : "rgba(62,37,107,0.50)"
                }
                size={22}
              />
            </div>
          )}
        </div>
      </button>

      {/* Units list */}
      <div
        style={{
          maxHeight: isOpen ? 5000 : 0,
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{ padding: "0 16px 16px", direction: isRtl ? "rtl" : "ltr" }}
        >
          {/* Unit skeletons while loading */}
          {loadingUnits && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: 4,
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 80,
                    borderRadius: 16,
                    background: isDark ? "rgba(88,56,165,0.20)" : "#f0ebff",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "0 20px",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 56,
                      borderRadius: 8,
                      background: isDark ? "rgba(124,95,212,0.22)" : "#e8e0ff",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: "30%",
                        height: 12,
                        borderRadius: 4,
                        background: isDark
                          ? "rgba(124,95,212,0.18)"
                          : "#e0d8f8",
                      }}
                    />
                    <div
                      style={{
                        width: "65%",
                        height: 16,
                        borderRadius: 4,
                        background: isDark
                          ? "rgba(124,95,212,0.18)"
                          : "#e0d8f8",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {unitsError && !loadingUnits && (
            <p
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: 14,
                color: isDark ? "#FF8FAB" : "#C62828",
                textAlign: "center",
                padding: "16px 0",
                direction: "rtl",
              }}
            >
              {locale === "ar"
                ? "تعذّر تحميل الوحدات. تأكد من اتصالك بالإنترنت."
                : "Could not load units. Check your connection."}
            </p>
          )}

          {/* Islamic Studies grouped by courses */}
          {!loadingUnits && !unitsError && isIslamicStudies && courses.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {courses.map((course) => (
                <div
                  key={course.course_master_id}
                  style={{
                    background: isDark ? "rgba(88,56,165,0.15)" : "rgba(105,72,184,0.04)",
                    border: `1px solid ${isDark ? "rgba(150,120,220,0.20)" : "rgba(105,72,184,0.10)"}`,
                    borderRadius: 20,
                    padding: "20px 16px",
                  }}
                >
                  {/* Course Title */}
                  <h4
                    style={{
                      fontFamily: '"Readex Pro", sans-serif',
                      fontSize: "clamp(16px, 2vw, 20px)",
                      fontWeight: 700,
                      color: isDark ? "#FFFFFF" : "#3E256B",
                      textAlign: "center",
                      marginBottom: 16,
                      direction: "rtl",
                    }}
                  >
                    {course.course_title}
                  </h4>

                  {/* Units in this course */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {course.units.map((u) => {
                      const unitData: UnitData = {
                        unit_id: u.unit_id,
                        unit_title: u.unit_title,
                        cover_image: u.unit_cover,
                        lessons_count: u.lessons_count,
                        lessons: [],
                      };
                      return (
                        <UnitAccordion
                          key={u.unit_id}
                          unit={unitData}
                          isDark={isDark}
                          isRtl={isRtl}
                          isOpen={openUnitId === u.unit_id}
                          onClick={() => onUnitClick(u.unit_id)}
                          openLessonId={openLessonId}
                          onLessonClick={onLessonClick}
                          onExplain={(lessonId, lessonTitle, unitId) =>
                            onExplain(lessonId, lessonTitle, unitId, subject.subject_id)
                          }
                          onQuiz={(lessonId, unitId) =>
                            onQuiz(lessonId, unitId, subject.subject_id)
                          }
                          locale={locale}
                          subjectId={subject.subject_id}
                          gradeId={gradeId}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regular subjects (non-Islamic Studies) */}
          {!loadingUnits &&
            !unitsError &&
            (!isIslamicStudies || courses.length === 0) &&
            units.map((unit) => (
              <UnitAccordion
                key={unit.unit_id}
                unit={unit}
                isDark={isDark}
                isRtl={isRtl}
                isOpen={openUnitId === unit.unit_id}
                onClick={() => onUnitClick(unit.unit_id)}
                openLessonId={openLessonId}
                onLessonClick={onLessonClick}
                onExplain={(lessonId, lessonTitle, unitId) =>
                  onExplain(lessonId, lessonTitle, unitId, subject.subject_id)
                }
                onQuiz={(lessonId, unitId) =>
                  onQuiz(lessonId, unitId, subject.subject_id)
                }
                locale={locale}
                subjectId={subject.subject_id}
                gradeId={gradeId}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main JourneyView ─────────────────���───────��───────────────────────────────

export default function JourneyView({ mode, dictionary }: Props) {
  const router = useRouter();
  const { lang } = useParams();
  const locale = Array.isArray(lang) ? lang[0] : (lang ?? "ar");
  const isRtl = locale === "ar";
  const { user: journeySessionUser, status: sessionStatus } = useUser();
  const journeySession = journeySessionUser
    ? { user: journeySessionUser }
    : null;

  // Dark mode detection — use MUI's useTheme() which always reflects the
  // current palette mode correctly regardless of how MUI applies dark styles.
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === "dark";

  // Curriculum fetch
  const [subjectIdMap, setSubjectIdMap] = useState<SubjectIdMap>({});
  const [gradeId, setGradeId] = useState<number>(0);
  const [apiSubjects, setApiSubjects] = useState<ApiSubject[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);

  useEffect(() => {
    // Wait until the session has fully loaded before fetching curriculum.
    // This prevents fetching with a wrong/missing grade_id during the
    // "loading" phase, which caused 403 errors when the stale default
    // did not match the authenticated user's grade.
    if (sessionStatus === "loading") return;

    const sessionGradeId = (journeySession?.user as any)?.grade_id;
    // If session is authenticated but has no grade_id, show static fallback.
    if (!sessionGradeId) {
      setLoadingCurriculum(false);
      return;
    }
    const resolvedGradeId = Number(sessionGradeId);

    api
      .get<any>(`/api/v1/grade/${resolvedGradeId}/subjects`)
      .then((data) => {
        const items: any[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.subjects)
            ? data.subjects
            : Array.isArray(data)
              ? data
              : [];
        if (items.length > 0) {
          setGradeId(resolvedGradeId);

          const map: SubjectIdMap = {};
          const subjects: ApiSubject[] = [];
          for (const s of items) {
            const key = resolveSubjectKey(
              s.subject ?? s.subject_name ?? "",
              s.display_name ?? s.name ?? ""
            );
            const id = s.subject_id ?? s.id;
            if (id) {
              map[key] = id;
              subjects.push({
                subject_id: id,
                subject: s.subject ?? s.subject_name ?? "",
                display_name: s.display_name ?? s.name ?? s.subject ?? "",
                subjectKey: key,
              });
            }
          }
          setSubjectIdMap(map);
          setApiSubjects(subjects);
        }
      })
      .catch(() => {
        /* show static fallback */
      })
      .finally(() => setLoadingCurriculum(false));
  }, []);

  // journeySession, sessionStatus

  // Tree open state
  const [openSubjectId, setOpenSubjectId] = useState<number | null>(null);
  const [openUnitId, setOpenUnitId] = useState<number | null>(null);
  const [openLessonId, setOpenLessonId] = useState<number | null>(null);

  // Teacher picker state (for explain flow).
  // lessonId is optional — for unit-only subjects (e.g. English) it is omitted.
  const [teacherPickerContext, setTeacherPickerContext] = useState<{
    lessonId?: number;
    lessonTitle: string;
    unitId: number;
  } | null>(null);

  // Quiz type picker state (shown before quiz starts)
  const [quizPickerContext, setQuizPickerContext] = useState<{
    lessonId?: number;
    unitId: number;
    subjectId: number;
  } | null>(null);

  // Quiz state
  const [quizContext, setQuizContext] = useState<{
    lessonId?: number;
    unitId: number;
    subjectId: number;
    quizCategory: "basic" | "smart";
  } | null>(null);
  const [journeyQuiz, setJourneyQuiz] = useState<QuizData | null>(null);
  const [journeyScreen, setJourneyScreen] = useState<
    "prepare" | "taking" | "results"
  >("prepare");
  const [journeyAnswers, setJourneyAnswers] = useState<StudentAnswer[]>([]);
  const [journeyTotalSeconds, setJourneyTotalSeconds] = useState(0);

  // Handlers
  function handleSubjectClick(subjectId: number) {
    setOpenSubjectId((prev) => (prev === subjectId ? null : subjectId));
    setOpenUnitId(null);
    setOpenLessonId(null);
  }

  function handleUnitClick(unitId: number) {
    setOpenUnitId((prev) => (prev === unitId ? null : unitId));
    setOpenLessonId(null);
  }

  function handleLessonClick(lessonId: number) {
    setOpenLessonId((prev) => (prev === lessonId ? null : lessonId));
  }

  function handleExplain(
    lessonId: number | undefined,
    lessonTitle: string,
    unitId: number,
    subjectId?: number
  ) {
    // Open teacher picker first; navigate after teacher is chosen
    setTeacherPickerContext({ lessonId, lessonTitle, unitId });
  }

  function handleTeacherSelected(persona: TeacherPersona) {
    if (!teacherPickerContext) return;
    const { lessonId, unitId } = teacherPickerContext;
    const params = new URLSearchParams({ persona });
    // lesson_id is optional — unit-only subjects send unit_id alone
    if (lessonId) params.set("lesson_id", String(lessonId));
    if (unitId) params.set("unit_id", String(unitId));
    // Navigate first - modal will be cleared when route changes
    router.push(
      getLocalizedUrl(
        `/apps/explanation?${params.toString()}`,
        locale as Locale
      )
    );
  }

  function handleQuiz(
    lessonId: number | undefined,
    unitId: number,
    subjectId: number
  ) {
    // Open quiz type picker first
    setQuizPickerContext({ lessonId, unitId, subjectId });
  }

  function handleQuizTypeSelected(category: "basic" | "smart") {
    if (!quizPickerContext) return;
    const { lessonId, unitId, subjectId } = quizPickerContext;
    setQuizPickerContext(null);
    setQuizContext({ lessonId, unitId, subjectId, quizCategory: category });
    setJourneyScreen("prepare");
    setJourneyQuiz(null);
    setJourneyAnswers([]);
    setJourneyTotalSeconds(0);
  }

  function handleQuizBack() {
    setQuizContext(null);
    setJourneyQuiz(null);
    setJourneyScreen("prepare");
  }

  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#5531A8";

  // ── Render: Quiz screens overlay ────────────────────────────────────────────
  if (quizContext && journeyScreen === "prepare") {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="min-h-screen relative"
        style={{ backgroundColor: "var(--mui-palette-background-default)" }}
      >
        <DecorativeElements currentMode={mode} />
        <div
          className="page-container"
          style={{ zIndex: 1 }}
        >
          <PrepareQuizScreen
            isDark={isDark}
            subjectId={quizContext.subjectId}
            gradeId={gradeId}
            unitId={quizContext.unitId}
            lessonId={quizContext.lessonId}
            quizCategory={quizContext.quizCategory}
            onBack={handleQuizBack}
            onQuizReady={(quiz) => {
              setJourneyQuiz(quiz);
              setJourneyScreen("taking");
            }}
          />
        </div>
      </div>
    );
  }

  if (quizContext && journeyScreen === "taking" && journeyQuiz) {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="min-h-screen relative"
        style={{ backgroundColor: "var(--mui-palette-background-default)" }}
      >
        <DecorativeElements currentMode={mode} />
        <div
          className="page-container"
          style={{ zIndex: 1 }}
        >
          <QuizTakingScreen
            isDark={isDark}
            quiz={journeyQuiz}
            onFinish={(answers, seconds) => {
              setJourneyAnswers(answers);
              setJourneyTotalSeconds(seconds);
              setJourneyScreen("results");
            }}
            onBack={() => {
              setJourneyScreen("prepare");
              setJourneyQuiz(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (quizContext && journeyScreen === "results" && journeyQuiz) {
    return (
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="min-h-screen relative"
        style={{ backgroundColor: "var(--mui-palette-background-default)" }}
      >
        <DecorativeElements currentMode={mode} />
        <div
          className="page-container"
          style={{ zIndex: 1 }}
        >
          <QuizResultsScreen
            isDark={isDark}
            quiz={journeyQuiz}
            answers={journeyAnswers}
            totalSeconds={journeyTotalSeconds}
            lessonId={quizContext.lessonId}
            onBack={() => {
              handleQuizBack();
            }}
          />
        </div>
      </div>
    );
  }

  // ── Main tree view ────────────────────────────────────────────────────��─────
  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen relative"
      style={{ backgroundColor: "var(--mui-palette-background-default)" }}
    >
      {/* Inject spin animation */}
      <style>{`@keyframes journeySpin { to { transform: rotate(360deg); } }`}</style>

      {/* Teacher picker modal (for explain flow) */}
      {teacherPickerContext && (
        <TeacherPickerModal
          isDark={isDark}
          onSelect={handleTeacherSelected}
          onClose={() => setTeacherPickerContext(null)}
        />
      )}

      {/* Quiz type picker modal (for quiz flow) */}
      {quizPickerContext && (
        <QuizTypePickerModal
          isDark={isDark}
          onSelect={handleQuizTypeSelected}
          onClose={() => setQuizPickerContext(null)}
        />
      )}

      <DecorativeElements currentMode={mode} />

      <div
        className="page-container"
        style={{ zIndex: 1, margin: "0 auto" }}
      >
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <RobotMascot
              width={100}
              height={94}
            />
          </div>
          <h1
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(26px, 4vw, 48px)",
              fontWeight: 800,
              color: isDark ? "#F5F0FF" : "#3E256B",
              marginBottom: 10,
              lineHeight: "150%",
              direction: "rtl",
            }}
          >
            {(dictionary as any).journey?.subject?.title ??
              (isRtl
                ? "جاهز للإبداع؟ اختر مادة لننطلق معاً!"
                : "Ready? Choose a subject!")}
          </h1>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(15px, 2vw, 20px)",
              fontWeight: 400,
              color: isDark ? "#D4BDFF" : "#5531A8",
              lineHeight: "150%",
              direction: "rtl",
            }}
          >
            {(dictionary as any).journey?.subject?.subtitle ??
              (isRtl
                ? "معلمك الذكي هنا ليجعل دروسك أسهل وأكثر متعة"
                : "Your AI teacher is here to make lessons easier and more fun")}
          </p>
        </div>

        {/* ── Subject accordion list ── */}
        {loadingCurriculum ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 88,
                  borderRadius: 20,
                  background: isDark ? "rgba(88,56,165,0.20)" : "#f0ebff",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 24px",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: isDark ? "rgba(124,95,212,0.25)" : "#e8e0ff",
                  }}
                />
                <div
                  style={{
                    width: "40%",
                    height: 20,
                    borderRadius: 6,
                    background: isDark ? "rgba(124,95,212,0.20)" : "#e0d8f8",
                  }}
                />
              </div>
            ))}
          </div>
        ) : apiSubjects.length > 0 ? (
          <div>
            {[...apiSubjects]
              .sort((a, b) => {
                const aEnabled = isSubjectEnabled(a.subjectKey, a.display_name);
                const bEnabled = isSubjectEnabled(b.subjectKey, b.display_name);
                if (aEnabled && !bEnabled) return -1;
                if (!aEnabled && bEnabled) return 1;
                return 0;
              })
              .map((subject) => (
                <SubjectAccordion
                  key={subject.subject_id}
                  subject={subject}
                  isDark={isDark}
                  isRtl={isRtl}
                  isOpen={openSubjectId === subject.subject_id}
                  onClick={() => handleSubjectClick(subject.subject_id)}
                  openUnitId={openUnitId}
                  onUnitClick={handleUnitClick}
                  openLessonId={openLessonId}
                  onLessonClick={handleLessonClick}
                  onExplain={handleExplain}
                  onQuiz={handleQuiz}
                  locale={locale}
                  gradeId={gradeId}
                />
              ))}
          </div>
        ) : (
          /* Fallback: static subject grid */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 24px",
              gap: 16,
            }}
          >
            <p
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: 18,
                fontWeight: 600,
                color: isDark
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(62,37,107,0.45)",
                textAlign: "center",
                direction: "rtl",
              }}
            >
              {isRtl
                ? "لا توجد مواد متاحة حالياً"
                : "No subjects available yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/utils/api";
import type { getDictionary } from "@/utils/getDictionary";
import type { Selection, LessonData } from "./types";

type JourneyDict = Awaited<ReturnType<typeof getDictionary>>["journey"];

// ─── Lesson Card ──────────────────────────────────────────────────────────────

interface LessonCardProps {
  lesson: LessonData;
  index: number;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
  lang: string;
}

function LessonCard({
  lesson,
  index,
  selected,
  onClick,
  isDark,
  lang,
}: LessonCardProps) {
  const cardBg = isDark
    ? selected
      ? "rgba(88,56,165,0.65)"
      : "rgba(40,28,80,0.80)"
    : "#ffffff";
  const shadow = isDark
    ? "0 10px 15px -3px rgba(0,0,0,0.40), 0 4px 6px -4px rgba(0,0,0,0.30)"
    : "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)";
  const circleBg = isDark ? "rgba(180,150,255,0.12)" : "rgba(105,72,184,0.05)";
  const numColor = isDark ? "#C4A8FF" : "#5531A8";
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "rgba(255,255,255,0.50)" : "rgba(62,37,107,0.60)";
  const lessonLabel =
    lang === "ar"
      ? `الدرس ${toArabicNumeral(index + 1)}`
      : `Lesson ${index + 1}`;

  return (
    <button
      onClick={onClick}
      style={{
        background: cardBg,
        borderRadius: "24px",
        padding: "24px 48px",
        height: "240px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        direction: "rtl",
        transition: "all 0.2s ease",
        boxShadow: shadow,
        border: selected
          ? `2px solid ${isDark ? "rgba(180,150,255,0.55)" : "#7C4DFF"}`
          : "2px solid transparent",
      }}
    >
      {/* Number circle */}
      <div
        style={{
          display: "flex",
          width: "60px",
          height: "60px",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "150px",
          background: circleBg,
          color: numColor,
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "27.857px",
          fontWeight: 700,
          lineHeight: "150%",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>

      {/* Lesson title */}
      <span
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "26px",
          fontWeight: 700,
          color: titleColor,
          lineHeight: "150%",
          textAlign: "center",
        }}
      >
        {lesson.lesson_title}
      </span>

      {/* Lesson ordinal label */}
      <span
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "15px",
          fontWeight: 400,
          color: subColor,
          lineHeight: "150%",
          textAlign: "center",
        }}
      >
        {lessonLabel}
      </span>
    </button>
  );
}

function toArabicNumeral(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LessonSkeleton({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "rgba(255,255,255,0.06)" : "#f3f0ff";
  const shimmer = isDark ? "rgba(255,255,255,0.04)" : "#ebe5ff";
  return (
    <div
      style={{
        background: bg,
        borderRadius: "24px",
        height: "240px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "150px",
          background: shimmer,
        }}
      />
      <div
        style={{
          width: "60%",
          height: "22px",
          borderRadius: "6px",
          background: shimmer,
        }}
      />
      <div
        style={{
          width: "35%",
          height: "14px",
          borderRadius: "4px",
          background: shimmer,
        }}
      />
    </div>
  );
}

// ─── LessonStep ───────────────────────────────────────────────────────────────

interface LessonStepProps {
  dict: JourneyDict;
  selection: Selection;
  onSelect: (lessonTitle: string, lessonId: number) => void;
  isDark: boolean;
  lang: string;
}

export default function LessonStep({
  dict,
  selection,
  onSelect,
  isDark,
  lang,
}: LessonStepProps) {
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#6948B8";

  const unitId = selection.unitId;
  const fetchedRef = useRef<number | null>(null);

  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!unitId) return;
    if (fetchedRef.current === unitId) return;
    fetchedRef.current = unitId;

    setLoading(true);
    setError(false);
    setErrorMessage("");

    // Direct backend call with Bearer token
    api.get<any>(`/api/v1/unit/${unitId}/lessons`)
      .then((data) => {
        const items: any[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.lessons)
            ? data.lessons
            : [];

        if (items.length > 0) {
          // Normalize field names: backend may use lesson_title or title
          const normalized = items.map((l: any) => ({
            lesson_id: l.lesson_id ?? l.id,
            lesson_title: l.lesson_title ?? l.title ?? l.name ?? "",
            unit_id: l.unit_id ?? unitId,
          }));
          setLessons(normalized);
        } else {
          // Show message from API response if available, otherwise fallback
          const apiMessage =
            data?.message ||
            data?.detail ||
            data?.error ||
            null;
          setErrorMessage(apiMessage || "");
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [unitId]);

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
        {(dict as any).lesson?.title ??
          (lang === "ar" ? "اختر الدرس" : "Choose Lesson")}
      </h2>
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "22px",
          fontWeight: 500,
          color: subColor,
          textAlign: "center",
          marginBottom: "36px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {(dict as any).lesson?.subtitle ??
          (lang === "ar"
            ? "اختر الدرس الذي تريد دراسته"
            : "Choose the lesson you want to study")}
      </p>

      {error && !loading && (
        <p
          style={{
            fontSize: "14px",
            color: "#DC64C9",
            textAlign: "center",
            marginBottom: "16px",
            direction: "rtl",
            padding: "12px 16px",
            background: isDark ? "rgba(220,100,201,0.08)" : "rgba(220,100,201,0.06)",
            borderRadius: "12px",
          }}
        >
          {errorMessage
            ? errorMessage
            : lang === "ar"
              ? "لا توجد دروس متاحة لهذه الوحدة."
              : "No lessons available for this unit."}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <LessonSkeleton
                key={i}
                isDark={isDark}
              />
            ))
          : lessons.map((lesson, idx) => (
              <LessonCard
                key={lesson.lesson_id}
                lesson={lesson}
                index={idx}
                selected={selection.lessonId === lesson.lesson_id}
                onClick={() => onSelect(lesson.lesson_title, lesson.lesson_id)}
                isDark={isDark}
                lang={lang}
              />
            ))}
      </div>
    </div>
  );
}

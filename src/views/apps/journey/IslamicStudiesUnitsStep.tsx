"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/utils/api";
import type { getDictionary } from "@/utils/getDictionary";
import type { Selection, UnitData } from "./types";
import { useUser } from "@/hooks/useUser";

type JourneyDict = Awaited<ReturnType<typeof getDictionary>>["journey"];

// ─── Types for Islamic Studies grouped response ───────────────────────────────

interface IslamicCourse {
  course_master_id: number;
  course_title: string;
  units: IslamicUnit[];
}

interface IslamicUnit {
  unit_id: number;
  unit_title: string;
  unit_cover: string;
  lessons_count: number;
}

// ─── Ordinal helpers ──────────────────────────────────────────────────────────

const AR_ORDINALS: Record<number, string> = {
  1: "الأولى",
  2: "الثانية",
  3: "الثالثة",
  4: "الرابعة",
  5: "الخامسة",
  6: "السادسة",
  7: "السابعة",
  8: "الثامنة",
  9: "التاسعة",
  10: "العاشرة",
};

function getUnitLabel(num: number, lang: string): string {
  if (lang === "ar") return `الوحدة ${AR_ORDINALS[num] ?? num}`;
  return `Unit ${num}`;
}

// ─── Unit Card ────────────────────────────────────────────────────────────────

interface UnitCardProps {
  unit: IslamicUnit;
  unitIndex: number;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
  lang: string;
}

function UnitCard({ unit, unitIndex, selected, onClick, isDark, lang }: UnitCardProps) {
  const lessonCount = unit.lessons_count ?? 0;

  return (
    <button
      onClick={onClick}
      style={{
        background: isDark
          ? selected
            ? "rgba(88,56,165,0.65)"
            : "rgba(88,56,165,0.25)"
          : "#ffffff",
        border: `1.5px solid ${
          selected
            ? isDark
              ? "rgba(180,150,255,0.5)"
              : "#7C4DFF"
            : isDark
              ? "rgba(150,120,220,0.18)"
              : "rgba(105,72,184,0.10)"
        }`,
        borderRadius: "20px",
        padding: "16px 14px",
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        transition: "all 0.2s ease",
        boxShadow: selected
          ? isDark
            ? "0 4px 20px rgba(0,0,0,0.30)"
            : "0 4px 20px rgba(105,72,184,0.18)"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.18)"
            : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Book cover image */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/5",
          borderRadius: "12px",
          overflow: "hidden",
          background: isDark ? "rgba(255,255,255,0.07)" : "#F0EBFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {unit.unit_cover ? (
          <img
            src={unit.unit_cover}
            alt={unit.unit_title}
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
          >
            <path
              d="M8 9C8 6.79 9.79 5 12 5H32C34.21 5 36 6.79 36 9V39L22 33L8 39V9Z"
              stroke={isDark ? "rgba(255,255,255,0.35)" : "#9B7FD4"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Unit ordinal label */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "12px",
          fontWeight: 400,
          color: isDark ? "rgba(255,255,255,0.70)" : "rgba(62,37,107,0.50)",
          margin: 0,
          direction: "rtl",
        }}
      >
        {getUnitLabel(unitIndex + 1, lang)}
      </p>

      {/* Unit title */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(14px, 1.5vw, 18px)",
          fontWeight: 700,
          color: isDark ? "#FFFFFF" : "#3E256B",
          margin: 0,
          direction: "rtl",
          lineHeight: "1.3",
        }}
      >
        {unit.unit_title}
      </p>

      {/* Lesson count */}
      {lessonCount > 0 && (
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "12px",
            fontWeight: 400,
            color: isDark ? "rgba(255,255,255,0.65)" : "rgba(62,37,107,0.45)",
            margin: 0,
            direction: "rtl",
          }}
        >
          {lang === "ar" ? `${lessonCount} دروس` : `${lessonCount} lessons`}
        </p>
      )}
    </button>
  );
}

// ─── Course Section ───────────────────────────────────────────────────────────

interface CourseSectionProps {
  course: IslamicCourse;
  selectedUnitId: number | undefined;
  onSelectUnit: (unitTitle: string, unitId: number) => void;
  isDark: boolean;
  lang: string;
}

function CourseSection({
  course,
  selectedUnitId,
  onSelectUnit,
  isDark,
  lang,
}: CourseSectionProps) {
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const bgColor = isDark ? "rgba(88,56,165,0.15)" : "rgba(105,72,184,0.04)";
  const borderColor = isDark ? "rgba(150,120,220,0.20)" : "rgba(105,72,184,0.10)";

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "24px",
        padding: "24px 20px",
        marginBottom: "24px",
      }}
    >
      {/* Course Title */}
      <h3
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(18px, 2.2vw, 26px)",
          fontWeight: 700,
          color: titleColor,
          textAlign: "center",
          marginBottom: "20px",
          direction: "rtl",
        }}
      >
        {course.course_title}
      </h3>

      {/* Units Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
        }}
      >
        {course.units.map((unit, idx) => (
          <UnitCard
            key={unit.unit_id}
            unit={unit}
            unitIndex={idx}
            selected={selectedUnitId === unit.unit_id}
            onClick={() => onSelectUnit(unit.unit_title, unit.unit_id)}
            isDark={isDark}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(255,255,255,0.06)" : "#F3F0FF";
  const shine = isDark ? "rgba(255,255,255,0.03)" : "#EBE5FF";
  
  return (
    <div
      style={{
        background: base,
        borderRadius: "24px",
        padding: "24px 20px",
        marginBottom: "24px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div
        style={{
          width: "40%",
          height: "28px",
          borderRadius: "8px",
          background: shine,
          margin: "0 auto 20px",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: shine,
              borderRadius: "20px",
              padding: "16px",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "4/5",
                borderRadius: "12px",
                background: base,
                marginBottom: "8px",
              }}
            />
            <div style={{ width: "60%", height: "12px", borderRadius: "6px", background: base, margin: "0 auto 6px" }} />
            <div style={{ width: "80%", height: "18px", borderRadius: "6px", background: base, margin: "0 auto 6px" }} />
            <div style={{ width: "40%", height: "12px", borderRadius: "6px", background: base, margin: "0 auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface IslamicStudiesUnitsStepProps {
  dict: JourneyDict;
  selection: Selection;
  onSelect: (unitTitle: string, unitId: number) => void;
  isDark: boolean;
  lang: string;
  gradeId?: number;
}

export default function IslamicStudiesUnitsStep({
  dict,
  selection,
  onSelect,
  isDark,
  lang,
}: IslamicStudiesUnitsStepProps) {
  const subjectId = selection.subjectId; // Should be 3 for Islamic Studies
  const fetchedRef = useRef<number | null>(null);

  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const [courses, setCourses] = useState<IslamicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Wait until subjectId is resolved
    if (!subjectId) return;
    // Skip if already fetched for this subject
    if (fetchedRef.current === subjectId) return;
    fetchedRef.current = subjectId;

    setLoading(true);
    setError(false);
    setCourses([]);

    const gradeId = session?.user?.grade_id;

    // Fetch Islamic Studies units (grouped by courses)
    api
      .get<any>(`/api/v1/grade/${gradeId}/subject/${subjectId}/units?term_id=2`)
      .then((response) => {
        // The response for Islamic Studies groups units under courses
        const data = response?.data;
        if (Array.isArray(data) && data.length > 0) {
          // Check if it's grouped by courses
          if (data[0].course_master_id !== undefined) {
            setCourses(data as IslamicCourse[]);
          } else {
            // Fallback: wrap in a single course
            setCourses([{
              course_master_id: 0,
              course_title: "الوحدات",
              units: data.map((u: any) => ({
                unit_id: u.unit_id ?? u.id,
                unit_title: u.unit_title ?? u.name,
                unit_cover: u.unit_cover ?? u.cover_image ?? "",
                lessons_count: u.lessons_count ?? 0,
              })),
            }]);
          }
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [subjectId, session?.user?.grade_id]);

  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#6948B8";

  return (
    <div>
      <h2
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(24px, 3vw, 48px)",
          fontWeight: 700,
          color: titleColor,
          textAlign: "center",
          marginBottom: "8px",
          direction: "rtl",
        }}
      >
        {lang === "ar" ? "الدراسات الإسلامية" : "Islamic Studies"}
      </h2>
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(15px, 1.8vw, 22px)",
          fontWeight: 500,
          color: subColor,
          textAlign: "center",
          marginBottom: "36px",
          direction: "rtl",
        }}
      >
        {lang === "ar"
          ? "اختر الوحدة التي تريدها لنبدأ الدراسة معاً!"
          : "Choose the unit to start studying together!"}
      </p>

      {error && !loading && (
        <p
          style={{
            fontSize: "14px",
            color: isDark ? "#FF8FAB" : "#C62828",
            textAlign: "center",
            marginBottom: "16px",
            direction: "rtl",
          }}
        >
          {lang === "ar"
            ? "تعذّر تحميل الوحدات. تأكد من اتصالك بالإنترنت."
            : "Could not load units. Please check your connection."}
        </p>
      )}

      {loading ? (
        <>
          <CourseSkeleton isDark={isDark} />
          <CourseSkeleton isDark={isDark} />
        </>
      ) : (
        courses.map((course) => (
          <CourseSection
            key={course.course_master_id}
            course={course}
            selectedUnitId={selection.unitId}
            onSelectUnit={onSelect}
            isDark={isDark}
            lang={lang}
          />
        ))
      )}

      {/* Selected unit info */}
      {selection.unitId && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px 20px",
            background: isDark ? "rgba(16,185,129,0.15)" : "#DCFCE7",
            borderRadius: "16px",
            textAlign: "center",
            direction: "rtl",
          }}
        >
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "14px",
              fontWeight: 600,
              color: isDark ? "#34D399" : "#16A34A",
              margin: 0,
            }}
          >
            الوحدة المختارة: {selection.unit} (ID: {selection.unitId})
          </p>
        </div>
      )}
    </div>
  );
}

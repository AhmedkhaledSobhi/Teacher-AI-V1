"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/utils/api";
import type { getDictionary } from "@/utils/getDictionary";
import type { Selection, UnitData } from "./types";
import { useUser } from "@/hooks/useUser";

type JourneyDict = Awaited<ReturnType<typeof getDictionary>>["journey"];

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
  if (lang === "ar") return `الوحدة ${AR_ORDINALS[num] ?? num} ${num}`;
  return `Unit ${num}`;
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

// ─── Unit Card ────────────────────────────────────────────────────────────────

interface UnitCardProps {
  unit: UnitData;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
  lang: string;
}

function UnitCard({ unit, selected, onClick, isDark, lang }: UnitCardProps) {
  const num = unit.unit_number ?? 1;
  const lessonCount = unit.lessons_count ?? unit.lessons?.length ?? 0;

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
        padding: "20px 16px",
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
        {unit.cover_image ? (
          <img
            src={unit.cover_image}
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
          fontSize: "13px",
          fontWeight: 400,
          color: isDark ? "rgba(255,255,255,0.70)" : "rgba(62,37,107,0.50)",
          margin: 0,
          direction: "rtl",
        }}
      >
        {getUnitLabel(num, lang)}
      </p>

      {/* Unit title */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(16px, 1.8vw, 26px)",
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
            fontSize: "13px",
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function UnitSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(255,255,255,0.06)" : "#F3F0FF";
  const shine = isDark ? "rgba(255,255,255,0.03)" : "#EBE5FF";
  return (
    <div
      style={{
        background: base,
        borderRadius: "20px",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "4/5",
          borderRadius: "12px",
          background: shine,
        }}
      />
      <div
        style={{
          width: "55%",
          height: "13px",
          borderRadius: "6px",
          background: shine,
        }}
      />
      <div
        style={{
          width: "75%",
          height: "24px",
          borderRadius: "6px",
          background: shine,
        }}
      />
      <div
        style={{
          width: "40%",
          height: "12px",
          borderRadius: "6px",
          background: shine,
        }}
      />
    </div>
  );
}

// ─── UnitStep ─────────────────────────────────────────────────────────────────

interface UnitStepProps {
  dict: JourneyDict;
  selection: Selection;
  onSelect: (unitTitle: string, unitId: number) => void;
  isDark: boolean;
  lang: string;
  gradeId?: number;
}

export default function UnitStep({
  dict,
  selection,
  onSelect,
  isDark,
  lang,
}: UnitStepProps) {
  const subjectId = selection.subjectId;
  const fetchedRef = useRef<number | null>(null);

  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Wait until subjectId is resolved from the curriculum fetch in JourneyView
    if (!subjectId) return;
    // Skip if already fetched for this subject
    if (fetchedRef.current === subjectId) return;
    fetchedRef.current = subjectId;

    setLoading(true);
    setError(false);
    setUnits([]);

    //get gradeId from session (backend will validate it) and use it to fetch units for the selected subject

    const gradeId = session?.user?.grade_id;

    // Direct backend call with Bearer token
    api
      .get<any>(`/api/v1/grade/${gradeId}/subject/${subjectId}/units?term_id=2`)
      .then((data) => {
        const items: any[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.units)
            ? data.units
            : [];
        if (items.length > 0) {
          setUnits(items.map(normalizeUnit));
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [subjectId]);

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
        {(dict as any).unit?.title ??
          (lang === "ar" ? "اختر الوحدة" : "Choose Unit")}
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
        {(dict as any).unit?.subtitle ??
          (lang === "ar"
            ? "اختر الوحدة التي تريدها لنبدأ الدراسة معاً!"
            : "Choose the unit to start studying together!")}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <UnitSkeleton
                key={i}
                isDark={isDark}
              />
            ))
          : units.map((unit, idx) => (
              <UnitCard
                key={unit.unit_id}
                unit={unit}
                selected={selection.unitId === unit.unit_id}
                onClick={() => onSelect(unit.unit_title, unit.unit_id)}
                isDark={isDark}
                lang={lang}
              />
            ))}
      </div>
    </div>
  );
}

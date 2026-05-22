"use client";

import { useState, useEffect, useRef } from "react";
import { getSession } from "next-auth/react";
import api from "@/utils/api";
import { useUser } from "@/hooks/useUser";
import {
  SUBJECT_KEYS_ORDER,
  SUBJECT_ICONS,
  SUBJECT_ICON_BG,
  SUBJECT_ICON_BG_DARK,
  SubjectChip,
  isSubjectEnabled,
} from "@/views/apps/journey/shared";
import { parseLessonQuizResponse, type QuizData } from "./QuizScreens";
import { useCoreUISound } from "@/hooks/useCoreUISound";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrepareParams {
  subjectId: number;
  gradeId: number;
  unitId?: number;
  lessonId?: number;
  quizCategory: "basic" | "smart";
}

type WizardStep = 1 | 2 | 3;

interface SubjectInfo {
  key: string;
  label: string;
  subjectId: number;
  gradeId: number;
}

interface UnitInfo {
  unit_id: number;
  unit_title: string;
  unit_number?: number;
}

interface LessonInfo {
  lesson_id: number;
  lesson_title: string;
}

interface WizardState {
  subject?: SubjectInfo;
  selectedUnits: UnitInfo[];
  selectedLessons: LessonInfo[];
  totalQuestions: number;
  /** True when the selected subject returns no lessons from the API (e.g. English).
   *  When true, the quiz is sent with unit_id only. */
  subjectHasNoLessons: boolean;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  step,
  isDark,
}: {
  step: WizardStep;
  isDark: boolean;
}) {
  const steps = [1, 2, 3];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 32,
      }}
    >
      {steps.map((s, i) => {
        const done = s < step;
        const active = s === step;
        return (
          <div
            key={s}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--quiz-font)",
                fontSize: 17,
                fontWeight: 700,
                flexShrink: 0,
                transition: "background 0.25s, border-color 0.25s",
                background: done
                  ? "var(--quiz-teal)"
                  : active
                    ? "var(--quiz-purple)"
                    : "transparent",
                color:
                  done || active
                    ? "#fff"
                    : isDark
                      ? "rgba(255,255,255,0.5)"
                      : "var(--quiz-sub)",
                border:
                  done || active
                    ? "2.5px solid transparent"
                    : `2.5px solid var(--quiz-nav-border)`,
              }}
            >
              {done ? <CheckSVG /> : s}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: "clamp(50px, 8vw, 80px)",
                  height: 3,
                  background: done ? "var(--quiz-teal)" : "var(--quiz-progress-track)",
                  transition: "background 0.3s",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Subject labels ───────────────────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  arabic: "لغتي",
  math: "الرياضيات",
  science: "العلوم",
  islamic: "الدراسات الإسلامية",
  english: "اللغة الإنجليزية",
  social: "المهارات الحياتية",
  social_studies: "الدراسات الاجتماعية",
};

// ─── Step 1: Subject ──────────────────────────────────────────────────────────

function SubjectCard({
  subjectKey,
  selected,
  onClick,
  isDark,
}: {
  subjectKey: string;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  const iconBg = isDark
    ? (SUBJECT_ICON_BG_DARK[subjectKey] ?? "rgba(255,255,255,0.15)")
    : (SUBJECT_ICON_BG[subjectKey] ?? "#F5F3FF");

  const enabled = isSubjectEnabled(subjectKey);

  return (
    <button
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      style={{
        position: "relative",
        background: selected ? "var(--quiz-purple-light)" : "var(--quiz-card-bg)",
        border: `2px solid ${selected ? "var(--quiz-purple)" : "var(--quiz-card-border)"}`,
        borderRadius: 20,
        padding: "28px 20px 24px",
        cursor: enabled ? "pointer" : "not-allowed",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        width: "100%",
        transition: "all 0.2s ease",
        boxShadow: selected
          ? "var(--quiz-card-shadow)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        opacity: enabled ? 1 : 0.6,
      }}
    >
      {/* Coming soon badge */}
      {!enabled && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--quiz-lock-badge-bg)",
            color: "var(--quiz-lock-badge-text)",
            padding: "3px 10px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--quiz-font)",
          }}
        >
          <LockSVGSmall />
          قريبا
        </div>
      )}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 37,
            height: 37,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {SUBJECT_ICONS[subjectKey]}
        </div>
      </div>
      <span
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: 20,
          fontWeight: 700,
          color: "var(--quiz-title)",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {SUBJECT_LABELS[subjectKey]}
      </span>
    </button>
  );
}

function LockSVGSmall() {
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

// ─── Step 2: Units & Lessons ──────────────────────────────────────────────────

type Tab2 = "units" | "lessons";

function Step2Content({
  state,
  setState,
  isDark,
}: {
  state: WizardState;
  setState: (s: WizardState) => void;
  isDark: boolean;
}) {
  const { user: sessionUser2, status: sessionStatus } = useUser();
  const session = sessionUser2 ? { user: sessionUser2 } : null;

  const [tab, setTab] = useState<Tab2 | null>("units");
  const [units, setUnits] = useState<UnitInfo[]>([]);
  const [lessons, setLessons] = useState<LessonInfo[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const fetchedRef = useRef<number | null>(null);

  // Alias from shared state for convenience
  const subjectHasNoLessons = state.subjectHasNoLessons;

  const subjectId = state.subject?.subjectId;
  // gradeId is sourced from the subject entry (populated during curriculum
  // fetch which already waited for an authenticated session), so it is always
  // the correct grade for this user.
  const gradeId = state.subject?.gradeId;

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!subjectId || !gradeId || fetchedRef.current === subjectId) return;
    fetchedRef.current = subjectId;
    setLoadingUnits(true);
    // Reset lesson flag when subject changes
    setState({ ...state, subjectHasNoLessons: false });
    const run = async () => {
      try {
        const d = await api.get<any>(`/api/v1/grade/${gradeId}/subject/${subjectId}/units?term_id=2`);
        const items: any[] = Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d?.units)
            ? d.units
            : [];
        setUnits(items);
      } catch {
        // silently ignore
      } finally {
        setLoadingUnits(false);
      }
    };
    run();
  }, [subjectId, gradeId, sessionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.selectedUnits.length === 0) {
      setLessons([]);
      if (state.subjectHasNoLessons) {
        setState({ ...state, subjectHasNoLessons: false });
      }
      return;
    }
    setLoadingLessons(true);
    const run = async () => {
      try {
        const results = await Promise.all(
          state.selectedUnits.map(async (u) => {
            try {
              const d = await api.get<any>(`/api/v1/unit/${u.unit_id}/lessons`);
              const items: any[] = Array.isArray(d?.data)
                ? d.data
                : Array.isArray(d?.lessons)
                  ? d.lessons
                  : [];
              return items.map((l: any) => ({
                lesson_id: l.lesson_id ?? l.id,
                lesson_title: l.lesson_title ?? l.title ?? l.name ?? "",
                unit_id: l.unit_id ?? u.unit_id,
              })) as LessonInfo[];
            } catch {
              return [] as LessonInfo[];
            }
          })
        );
        const flat = results.flat();
        setLessons(flat);
        // If no lessons came back at all, this subject only has units
        const noLessons = flat.length === 0;
        if (noLessons !== state.subjectHasNoLessons) {
          setState({ ...state, subjectHasNoLessons: noLessons });
        }
      } finally {
        setLoadingLessons(false);
      }
    };
    run();
  }, [state.selectedUnits.map((u) => u.unit_id).join(",")]); // eslint-disable-line

  function toggleUnit(unit: UnitInfo) {
    const exists = state.selectedUnits.find((u) => u.unit_id === unit.unit_id);
    const newUnits = exists
      ? state.selectedUnits.filter((u) => u.unit_id !== unit.unit_id)
      : [...state.selectedUnits, unit];
    setState({ ...state, selectedUnits: newUnits, selectedLessons: [] });
  }

  function toggleLesson(lesson: LessonInfo) {
    const exists = state.selectedLessons.find(
      (l) => l.lesson_id === lesson.lesson_id
    );
    const newLessons = exists
      ? state.selectedLessons.filter((l) => l.lesson_id !== lesson.lesson_id)
      : [...state.selectedLessons, lesson];
    setState({ ...state, selectedLessons: newLessons });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Subject badge card ───────────────────────────────────── */}
      {state.subject && (
        <div
          className="quiz-card"
          style={{ padding: "16px 20px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
              direction: "rtl",
            }}
          >
            {/* Text side */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 11,
                  color: "var(--quiz-sub)",
                  letterSpacing: "0.02em",
                }}
              >
                المادة المختارة
              </span>
              <span
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--quiz-title)",
                  lineHeight: 1.2,
                }}
              >
                {SUBJECT_LABELS[state.subject.key]}
              </span>
            </div>
            {/* Icon box */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: isDark
                  ? (SUBJECT_ICON_BG_DARK[state.subject.key] ??
                    "rgba(255,255,255,0.12)")
                  : (SUBJECT_ICON_BG[state.subject.key] ?? "#F5F3FF"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {SUBJECT_ICONS[state.subject.key]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Selectors card ───────────────────────────────────────── */}
      <div
        className="quiz-card"
        style={{ padding: "16px 20px" }}
      >
        {/* Two parallel selector buttons (lessons tab hidden when subject has none) */}
        <div
          style={{
            display: "flex",
            gap: 10,
            direction: "rtl",
          }}
        >
          {(["units", "lessons"] as Tab2[])
            // Hide the lessons tab entirely when this subject has no lessons
            .filter((t) => !(t === "lessons" && subjectHasNoLessons))
            .map((t) => {
              const isOpen = tab === t;
              const count =
                t === "units"
                  ? state.selectedUnits.length
                  : state.selectedLessons.length;
              return (
                <button
                  key={t}
                  onClick={() => setTab(isOpen ? null : t)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: isOpen
                      ? "var(--quiz-purple-light)"
                      : "transparent",
                    border: `1.5px solid ${
                      isOpen ? "var(--quiz-purple)" : "var(--quiz-card-border)"
                    }`,
                    fontFamily: "var(--quiz-font)",
                    fontSize: 15,
                    fontWeight: 600,
                    color: isOpen ? "var(--quiz-purple)" : "var(--quiz-sub)",
                    cursor: "pointer",
                    direction: "rtl",
                    transition: "all 0.18s ease",
                  }}
                >
                  <span>{t === "units" ? "الوحدات" : "الدروس"}</span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {count > 0 && (
                      <span
                        style={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: 10,
                          background: "var(--quiz-purple)",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 5px",
                        }}
                      >
                        {count}
                      </span>
                    )}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.18s ease",
                        flexShrink: 0,
                      }}
                    >
                      <path
                        d="M3 5L7 9L11 5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Expanded list panel */}
        {tab !== null && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {tab === "units" &&
              (loadingUnits ? (
                <LoadingRows />
              ) : units.length === 0 ? (
                <EmptyMsg text="لا توجد وحدات" />
              ) : (
                units.map((unit) => {
                  const sel = !!state.selectedUnits.find(
                    (u) => u.unit_id === unit.unit_id
                  );
                  return (
                    <CheckRow
                      key={unit.unit_id}
                      label={unit.unit_title}
                      selected={sel}
                      onClick={() => toggleUnit(unit)}
                    />
                  );
                })
              ))}
            {tab === "lessons" &&
              (state.selectedUnits.length === 0 ? (
                <EmptyMsg text="اختر وحدة أولاً لعرض الدروس" />
              ) : loadingLessons ? (
                <LoadingRows />
              ) : lessons.length === 0 ? (
                <EmptyMsg text="لا توجد دروس" />
              ) : (
                lessons.map((lesson) => {
                  const sel = !!state.selectedLessons.find(
                    (l) => l.lesson_id === lesson.lesson_id
                  );
                  return (
                    <CheckRow
                      key={lesson.lesson_id}
                      label={lesson.lesson_title}
                      selected={sel}
                      onClick={() => toggleLesson(lesson)}
                    />
                  );
                })
              ))}
          </div>
        )}
      </div>

      {/* ── Summary bar / hint ──────────────────────────────────── */}
      {state.selectedUnits.length > 0 &&
      state.selectedLessons.length === 0 &&
      !subjectHasNoLessons &&
      !loadingLessons ? (
        // Warn only when lessons exist for this subject but none are selected
        <div
          style={{
            padding: "14px 20px",
            borderRadius: 14,
            background: "var(--quiz-warn-bg)",
            border: "1.5px solid var(--quiz-warn-border)",
            direction: "rtl",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--quiz-lock-badge-text)",
            }}
          >
            يجب اختيار درس واحد على الأقل للمتابعة
          </span>
        </div>
      ) : (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: 14,
            background: "var(--quiz-purple-light)",
            direction: "rtl",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--quiz-sub)",
            }}
          >
            {state.selectedLessons.length > 0
              ? `تم اختيار ${state.selectedUnits.length} وحدة و ${state.selectedLessons.length} ${state.selectedLessons.length === 1 ? "درس" : "دروس"}`
              : "اختر وحدة ثم حدد الدروس"}
          </span>
        </div>
      )}
    </div>
  );
}

function CheckRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 12,
        background: selected ? "var(--quiz-purple-light)" : "transparent",
        border: `1.5px solid ${selected ? "var(--quiz-purple)" : "var(--quiz-card-border)"}`,
        cursor: "pointer",
        direction: "rtl",
        width: "100%",
        transition: "all 0.15s",
      }}
    >
      <span
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: 15,
          fontWeight: selected ? 600 : 400,
          color: "var(--quiz-title)",
          textAlign: "right",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          flexShrink: 0,
          border: `2px solid ${selected ? "var(--quiz-purple)" : "var(--quiz-sub)"}`,
          background: selected ? "var(--quiz-purple)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        {selected && <CheckSVG size={12} />}
      </div>
    </button>
  );
}

function LoadingRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 44,
            borderRadius: 12,
            background: "var(--quiz-purple-light)",
          }}
        />
      ))}
    </>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <span
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: 14,
          color: "var(--quiz-sub)",
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Step 3: Question Count ───────────────────────────────────────────────────

function Step3Content({
  state,
  setState,
}: {
  state: WizardState;
  setState: (s: WizardState) => void;
}) {
  const MIN = 5;
  const MAX = 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── Slider card ─────────────────────────────────────────── */}
      {/* <div
        className="quiz-card"
        style={{ padding: "20px 24px" }}
      >
        <div
          style={{
            textAlign: "right",
            direction: "rtl",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--quiz-title)",
            }}
          >
            عدد الأسئلة:
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            direction: "rtl",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "var(--quiz-purple)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--quiz-font)",
              fontSize: 24,
              fontWeight: 700,
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            {state.totalQuestions}
          </div>

          <input
            type="range"
            min={MIN}
            max={MAX}
            value={state.totalQuestions}
            onChange={(e) =>
              setState({ ...state, totalQuestions: +e.target.value })
            }
            style={{
              flex: 1,
              accentColor: "var(--quiz-purple)",
              cursor: "pointer",
              height: 4,
              direction: "ltr",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            direction: "rtl",
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 13,
              color: "var(--quiz-sub)",
            }}
          >
            {`الأعلى ${MAX}`}
          </span>
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 13,
              color: "var(--quiz-sub)",
            }}
          >
            {`الأدنى ${MIN}`}
          </span>
        </div>
      </div> */}

      {/* ── Summary card ────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 16,
          background: "var(--quiz-purple-light)",
          padding: "24px",
          direction: "rtl",
          border: "1px solid transparent",
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontFamily: "var(--quiz-font)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--quiz-title)",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          ملخص الإختبار
        </h3>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            {
              label: "المادة",
              value: state.subject ? SUBJECT_LABELS[state.subject.key] : "—",
            },
            {
              label: "الوحدات",
              value:
                state.selectedUnits.map((u) => u.unit_title).join("، ") || "—",
            },
            {
              label: "الدروس",
              value:
                state.selectedLessons.length > 0
                  ? state.selectedLessons.map((l) => l.lesson_title).join("، ")
                  : "كل دروس الوحدات",
            },
            { label: "عدد الأسئلة", value: String(state.totalQuestions) },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "baseline",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {/* Bold label on the right */}
              <span
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--quiz-title)",
                  flexShrink: 0,
                }}
              >
                {label}:
              </span>
              {/* Value on the left */}
              <span
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 14,
                  color: "var(--quiz-sub)",
                  textAlign: "right",
                  minWidth: 0,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

interface QuizCreateWizardProps {
  isDark: boolean;
  onBack: () => void;
  /** Called with the quiz_id when the backend returns it synchronously */
  onCreated: (quizId: string) => void;
  /** Called with the async job_id when the backend queues the job */
  onCreatedAsync?: (jobId: string) => void;
  onCreatedWithData?: (quiz: QuizData) => void;
  /** Show the loading/prepare screen with the given params before hitting the API */
  onPrepare?: (params: PrepareParams) => void;
}

export default function QuizCreateWizard({
  isDark,
  onBack,
  onCreated,
  onCreatedAsync,
  onCreatedWithData,
  onPrepare,
}: QuizCreateWizardProps) {
  const { user: sessionUser, status: sessionStatus } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const sessionGradeId: number | undefined = (session?.user as any)?.grade_id;

  const [step, setStep] = useState<WizardStep>(1);
  const [wizardState, setWizardState] = useState<WizardState>({
    selectedUnits: [],
    selectedLessons: [],
    totalQuestions: 5,
    subjectHasNoLessons: false,
  });
  const [subjectIdMap, setSubjectIdMap] = useState<
    Record<string, { subjectId: number; gradeId: number }>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { play } = useCoreUISound();

  // Fetch curriculum on mount to get subject IDs.
  // Wait until the session has fully loaded to avoid fetching with
  // an incorrect or missing grade_id (which causes 403 errors).
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!sessionGradeId) return;
    const run = async () => {
      try {
        const data = await api.get<any>(`/api/v1/grade/${sessionGradeId}/subjects`);
        const items: any[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.subjects)
            ? data.subjects
            : Array.isArray(data)
              ? data
              : [];
        if (items.length > 0) {
          const map: Record<string, { subjectId: number; gradeId: number }> =
            {};
          for (const s of items) {
            const key = resolveSubjectKey(s.subject ?? s.subject_name ?? "");
            const id = s.subject_id ?? s.id;
            if (key && id)
              map[key] = { subjectId: id, gradeId: sessionGradeId };
          }
          setSubjectIdMap(map);
        }
      } catch {
        // silently ignore network errors
      }
    };
    run();
  }, [sessionGradeId, sessionStatus]);

  function handleSelectSubject(key: string) {
    const info = subjectIdMap[key];
    setWizardState({
      ...wizardState,
      subject: {
        key,
        label: SUBJECT_LABELS[key],
        subjectId: info?.subjectId ?? 0,
        gradeId: info?.gradeId ?? 1,
      },
      selectedUnits: [],
      selectedLessons: [],
    });
  }

  const STEP_TITLES: Record<WizardStep, { title: string; subtitle: string }> = {
    1: {
      title: "اختر المادة",
      subtitle: "اختر المادة التي تريد إنشاء اختبار لها",
    },
    2: {
      title: "حدد الوحدات والدروس",
      subtitle: "اختر وحدة أولاً ثم حدد الدروس التي تريد أن يشملها الاختبار",
    },
    3: { title: "حدد عدد الأسئلة", subtitle: "حدد عدد الأسئلة واستعد للتحدي!" },
  };

  // Step 2 requires at least one lesson — UNLESS the subject has no lessons at
  // all (e.g. English), in which case selecting at least one unit is sufficient
  // and the API will be called with unit_id only.
  const canNext =
    (step === 1 && !!wizardState.subject) ||
    (step === 2 &&
      (wizardState.selectedLessons.length > 0 ||
        (wizardState.subjectHasNoLessons &&
          wizardState.selectedUnits.length > 0))) ||
    step === 3;

  function handleCreate() {
    if (!wizardState.subject) return;
    play("btn-hero-start");

    const hasLessons = wizardState.selectedLessons.length > 0;
    // Prefer the gradeId stored on the subject (set from the curriculum fetch
    // which already used the authenticated session grade).  Fall back to the
    // live session value only as a last resort.
    const gradeId =
      wizardState.subject.gradeId && wizardState.subject.gradeId !== 0
        ? wizardState.subject.gradeId
        : (sessionGradeId ?? 0);

    // If parent provided onPrepare, delegate to the dedicated loading screen
    if (onPrepare) {
      const lesson = wizardState.selectedLessons[0];
      const unit = wizardState.selectedUnits[0];
      onPrepare({
        subjectId: wizardState.subject.subjectId,
        gradeId,
        unitId: unit?.unit_id,
        // When the subject has no lessons, omit lessonId so the API receives
        // only unit_id (e.g. English subject)
        lessonId: wizardState.subjectHasNoLessons
          ? undefined
          : lesson?.lesson_id,
        quizCategory: "basic",
      });
      return;
    }

    // Legacy fallback: call API inline (used when parent does not pass onPrepare)
    setSubmitting(true);
    setError(null);

    (async () => {
      try {
        if (hasLessons || wizardState.subjectHasNoLessons) {
          const lesson = wizardState.selectedLessons[0];
          const unit = wizardState.selectedUnits[0];
          const body: Record<string, unknown> = { unit_id: unit?.unit_id };
          if (!wizardState.subjectHasNoLessons && lesson) {
            body.lesson_id = lesson.lesson_id;
          }
          const data = await api.post<any>("/api/v1/quiz/lesson-quiz", body);
          const quizId = data?.quiz_id ?? data?.data?.quiz_id ?? data?.id;
          if (quizId) {
            if (onCreatedWithData) {
              onCreatedWithData(parseLessonQuizResponse(data));
            } else {
              onCreated(String(quizId));
            }
            return;
          }
          setError("حدث خطأ أثناء إنشاء الاختبار. حاول مجدداً.");
          return;
        }

        const asyncBody = {
          grade_id: gradeId,
          quiz_type: "text",
          selected_course_id: 0,
          selected_unit_ids: wizardState.selectedUnits.map((u) => u.unit_id),
          subject_id: wizardState.subject!.subjectId,
          term_id: 2,
          total_questions: wizardState.totalQuestions,
        };
        const asyncData = await api.post<any>("/api/v1/quiz/create-quiz-async", asyncBody);
        const jobId = asyncData?.job_id ?? asyncData?.data?.job_id;
        if (jobId) {
          onCreatedAsync ? onCreatedAsync(jobId) : onCreated(jobId);
          return;
        }
        setError("حدث خطأ أثناء إنشاء الاختبار. حاول مجدداً.");
      } catch {
        setError("حدث خطأ في الاتصال. تحقق من الإنترنت وحاول مجدداً.");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  return (
    /* Full-viewport lavender background wrapper */
    <div
      style={{
        minHeight: "100vh",
        background: "var(--quiz-bg)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Narrow centred content */}
      <div
        className="page-container"
        style={{
          marginInline: "auto",
          padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)",
          direction: "rtl",
        }}
      >
        <StepIndicator
          step={step}
          isDark={isDark}
        />

        {/* Title block */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 700,
              color: "var(--quiz-title)",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {STEP_TITLES[step].title}
          </h1>
          <p
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: "clamp(13px, 1.6vw, 15px)",
              color: "var(--quiz-accent)",
              margin: 0,
            }}
          >
            {STEP_TITLES[step].subtitle}
          </p>
        </div>

        {/* Step content */}
        {step === 1 && (
          <div
            className="quiz-subjects-grid"
            style={{ marginBottom: 32 }}
          >
            {[...SUBJECT_KEYS_ORDER]
              .sort((a, b) => {
                const aEnabled = isSubjectEnabled(a);
                const bEnabled = isSubjectEnabled(b);
                if (aEnabled && !bEnabled) return -1;
                if (!aEnabled && bEnabled) return 1;
                return 0;
              })
              .map((key) => (
                <SubjectCard
                  key={key}
                  subjectKey={key}
                  isDark={isDark}
                  selected={wizardState.subject?.key === key}
                  onClick={() => handleSelectSubject(key)}
                />
              ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ marginBottom: 32 }}>
            <Step2Content
              state={wizardState}
              setState={setWizardState}
              isDark={isDark}
            />
          </div>
        )}

        {step === 3 && (
          <div style={{ marginBottom: 32 }}>
            <Step3Content
              state={wizardState}
              setState={setWizardState}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--quiz-wrong-bg)",
              border: "1.5px solid var(--quiz-wrong-border)",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: 14,
                color: "var(--quiz-error-text)",
              }}
            >
              {error}
            </span>
          </div>
        )}

        {/* Footer nav */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            direction: "ltr",
          }}
        >
          {/* Left group: primary action */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {step === 3 ? (
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="quiz-btn-primary"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <SparkSVG />
                {submitting ? "جاري الإنشاء..." : "إنشاء الاختبار"}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (canNext) setStep((s) => (s + 1) as WizardStep);
                }}
                disabled={!canNext}
                className="quiz-btn-primary"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                التالي <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
              </button>
            )}
          </div>

          {/* Right group: back + cancel */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as WizardStep)}
                className="quiz-btn-ghost"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
                السابق
              </button>
            )}
            <button
              onClick={onBack}
              style={{
                background: "var(--quiz-cancel-bg)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--quiz-radius-btn)",
                padding: "11px 22px",
                fontFamily: "var(--quiz-font)",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveSubjectKey(subject: string): string {
  const s = (subject ?? "").toLowerCase();
  if (s.includes("arabic") || s.includes("لغتي") || s.includes("عرب"))
    return "arabic";
  if (s.includes("math") || s.includes("رياضيات")) return "math";
  if (s.includes("science") || s.includes("علوم")) return "science";
  if (s.includes("islamic") || s.includes("إسلامية")) return "islamic";
  if (s.includes("english") || s.includes("إنجليزي")) return "english";
  return "social";
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function CheckSVG({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SparkSVG() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

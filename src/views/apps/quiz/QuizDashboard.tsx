"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession } from "next-auth/react";
import api from "@/utils/api";
import {
  SUBJECT_ICONS,
  SUBJECT_ICON_BG,
  SUBJECT_ICON_BG_DARK,
} from "@/views/apps/journey/shared";
import { Box } from "@mui/material";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizRecord {
  quiz_id: string;
  subject_id: number;
  grade_id: number;
  term_id: number;
  created_at: string;
  status: string; // "completed" | "active" | "expired"
  selected_course_id: number | null;
  selected_unit_ids: number[] | null;
  selected_lesson_ids: number[] | null;
  total_possible: number;
  total_score: number;
  subject_name_ar: string;
  subject_name_en: string;
  units_names: string[];
  lessons_names: string[];
  course_name: string | null;
  question_results: QuestionResult[];
  quiz_feedback: QuizFeedback | null;
}

export interface QuestionResult {
  concept: string;
  difficulty: string;
  is_correct: boolean;
  question_id: string;
  question_text: string;
  correct_answer: string;
  student_answer: string;
  time_spent_seconds: number;
}

export interface QuizFeedback {
  weak_concepts: string[];
  recommendations: string[];
  concept_accuracy: Record<string, number>;
  difficulty_performance: Record<string, { total: number; correct: number }>;
}

interface QuizSummary {
  total_quizzes: number;
  completed: number;
  active: number;
  expired: number;
}

type FilterTab = "all" | "active" | "completed" | "expired";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveSubjectKey(nameAr: string, nameEn: string): string {
  const combined = `${nameAr} ${nameEn}`.toLowerCase();
  if (combined.includes("math") || combined.includes("رياضيات")) return "math";
  if (combined.includes("science") || combined.includes("علوم"))
    return "science";
  if (combined.includes("islamic") || combined.includes("إسلامية"))
    return "islamic";
  if (
    combined.includes("english") ||
    combined.includes("إنجليزي") ||
    combined.includes("لغة الإنجليزية")
  )
    return "english";
  if (
    combined.includes("arabic") ||
    combined.includes("لغتي") ||
    combined.includes("عرب")
  )
    return "arabic";
  if (
    combined.includes("digital") ||
    combined.includes("رقمية") ||
    combined.includes("حاسب") ||
    combined.includes("تقنية")
  )
    return "social";
  return "social";
}

function statusLabel(status: string): string {
  if (status === "completed") return "مكتمل";
  if (status === "active" || status === "ready") return "جاهز للبدء";
  if (status === "expired") return "منتهي";
  return status;
}

function statusStyle(
  status: string,
  _isDark: boolean
): { bg: string; text: string } {
  if (status === "completed")
    return {
      bg: "var(--quiz-status-completed-bg)",
      text: "var(--quiz-status-completed-text)",
    };
  if (status === "active" || status === "ready")
    return {
      bg: "var(--quiz-status-active-bg)",
      text: "var(--quiz-status-active-text)",
    };
  return {
    bg: "var(--quiz-status-expired-bg)",
    text: "var(--quiz-status-expired-text)",
  };
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return d;
  }
}

function scorePct(quiz: QuizRecord): number {
  if (!quiz.total_possible) return 0;
  return Math.round((quiz.total_score / quiz.total_possible) * 100);
}

function gradeColor(pct: number): string {
  if (pct >= 90) return "var(--quiz-grade-a)";
  if (pct >= 75) return "var(--quiz-grade-b)";
  if (pct >= 60) return "var(--quiz-grade-c)";
  if (pct >= 50) return "var(--quiz-grade-d)";
  return "var(--quiz-grade-f)";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  accent,
  isDark,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent: string;
  isDark: boolean;
}) {
  return (
    <div
      className="quiz-card"
      style={{
        flex: 1,
        minWidth: "120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: "clamp(28px,4vw,40px)",
          fontWeight: 700,
          color: accent,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: "14px",
          color: "var(--quiz-sub)",
          direction: "rtl",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function QuizCard({
  quiz,
  isDark,
  onAction,
}: {
  quiz: QuizRecord;
  isDark: boolean;
  onAction: (quiz: QuizRecord) => void;
}) {
  const subjectKey = resolveSubjectKey(
    quiz.subject_name_ar,
    quiz.subject_name_en
  );
  const iconBg = isDark
    ? (SUBJECT_ICON_BG_DARK[subjectKey] ?? "rgba(255,255,255,0.12)")
    : (SUBJECT_ICON_BG[subjectKey] ?? "#F5F3FF");
  const { bg: sBg, text: sText } = statusStyle(quiz.status, isDark);
  const isCompleted = quiz.status === "completed";
  const pct = scorePct(quiz);
  const gc = gradeColor(pct);

  const meta: string[] = [];
  if (quiz.course_name) meta.push(quiz.course_name);
  if (quiz.units_names?.length) meta.push(...quiz.units_names);
  if (quiz.lessons_names?.length) meta.push(...quiz.lessons_names);

  return (
    <div
      className="quiz-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        direction: "rtl",
        padding: "clamp(14px, 2.5vw, 20px) clamp(16px, 3vw, 24px)",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        flexWrap: "wrap",
      }}
      onClick={() => onAction(quiz)}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow = isDark
          ? "0 8px 24px rgba(0,0,0,0.40)"
          : "0 8px 24px rgba(105,72,184,0.16)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--quiz-card-shadow)")
      }
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
        <div style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
          {SUBJECT_ICONS[subjectKey]}
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: "17px",
              fontWeight: 700,
              color: "var(--quiz-title)",
            }}
          >
            {quiz.subject_name_ar || quiz.subject_name_en}
          </span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 20,
              background: sBg,
              fontFamily: "var(--quiz-font)",
              fontSize: "12px",
              fontWeight: 600,
              color: sText,
            }}
          >
            {statusLabel(quiz.status)}
          </span>
          {isCompleted && (
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 20,
                background: isDark ? `${gc}22` : `${gc}18`,
                fontFamily: "var(--quiz-font)",
                fontSize: "12px",
                fontWeight: 700,
                color: gc,
              }}
            >
              {quiz.total_score}/{quiz.total_possible}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          {meta.length > 0 && (
            <span
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: "13px",
                color: "var(--quiz-sub)",
              }}
            >
              {meta.slice(0, 2).join(" • ")}
            </span>
          )}
          {quiz.total_possible > 0 && (
            <span
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: "13px",
                color: "var(--quiz-sub)",
              }}
            >
              {quiz.total_possible} سؤال
            </span>
          )}
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: "13px",
              color: "var(--quiz-sub)",
            }}
          >
            {formatDate(quiz.created_at)}
          </span>
        </div>

        {/* Score bar for completed */}
        {isCompleted && quiz.total_possible > 0 && (
          <div style={{ marginTop: "4px" }}>
            <div
              className="quiz-progress-track"
              style={{ height: "7px" }}
            >
              <div
                className="quiz-progress-fill"
                style={{ width: `${pct}%`, background: gc }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction(quiz);
        }}
        className={isCompleted ? "" : "quiz-btn-primary"}
        style={
          isCompleted
            ? {
                padding: "10px 18px",
                borderRadius: 12,
                border: "none",
                background: "var(--quiz-status-completed-bg)",
                color: "var(--quiz-status-completed-text)",
                fontFamily: "var(--quiz-font)",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }
            : {
                padding: "10px 18px",
                fontSize: "14px",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }
        }
      >
        {isCompleted ? "عرض النتيجة" : "ابدأ الاختبار"}
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

interface QuizDashboardProps {
  isDark: boolean;
  onCreateQuiz: () => void;
  onStartQuiz: (quiz: QuizRecord) => void;
}

export default function QuizDashboard({
  isDark,
  onCreateQuiz,
  onStartQuiz,
}: QuizDashboardProps) {
  const [summary, setSummary] = useState<QuizSummary>({
    total_quizzes: 0,
    completed: 0,
    active: 0,
    expired: 0,
  });
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    const safeFetchGet = async (url: string) => {
      try {
        return await api.get<any>(url, { skipErrorToast: true });
      } catch {
        return null;
      }
    };

    const safeFetchPost = async (url: string, body: any) => {
      try {
        return await api.post<any>(url, body, { skipErrorToast: true });
      } catch {
        return null;
      }
    };

    const fetchAll = async () => {
      const session = await getSession();
      const userId =
        (session as any)?.user?.id || (session as any)?.session?.user_id || "";

      return Promise.all([
        safeFetchGet("/api/v1/quiz/quiz-summary"),
        safeFetchPost("/api/v1/quiz/user_quizzes", { user_id: userId }),
      ]);
    };

    fetchAll()
      .then(([summaryData, quizzesData]) => {
        if (summaryData && summaryData.total_quizzes != null)
          setSummary(summaryData);
        // API returns key "quizes" (single z)
        const list =
          quizzesData?.quizes ??
          quizzesData?.quizzes ??
          quizzesData?.data ??
          [];
        if (Array.isArray(list)) setQuizzes(list);
        else setError("تعذّر تحميل الاختبارات");
      })
      .catch(() => setError("تعذّر تحميل الاختبارات"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = quizzes.filter((q) => {
    const s = q.status ?? "active";
    const matchFilter =
      filter === "all" ||
      (filter === "active" && (s === "active" || s === "ready")) ||
      (filter === "completed" && s === "completed") ||
      (filter === "expired" && s === "expired");
    const matchSearch =
      !search ||
      q.subject_name_ar?.includes(search) ||
      q.subject_name_en?.toLowerCase().includes(search.toLowerCase()) ||
      q.quiz_id.includes(search);
    return matchFilter && matchSearch;
  });

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "الكل", count: quizzes.length },
    { key: "active", label: "جاهز", count: summary.active },
    { key: "completed", label: "مكتمل", count: summary.completed },
    { key: "expired", label: "منتهي", count: summary.expired },
  ];

  const inputStyle: React.CSSProperties = {
    background: "var(--quiz-card-bg)",
    border: "1.5px solid var(--quiz-card-border)",
    borderRadius: 12,
    padding: "10px 16px",
    fontFamily: "var(--quiz-font)",
    fontSize: "14px",
    color: "var(--quiz-title)",
    outline: "none",
    direction: "rtl",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ direction: "rtl" }}>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h1
          style={{
            fontFamily: "var(--quiz-font)",
            fontSize: "clamp(26px,4vw,44px)",
            fontWeight: 700,
            color: "var(--quiz-title)",
            margin: "0 0 8px",
          }}
        >
          مرحباً بك في صفحة الاختبارات
        </h1>
        <p
          style={{
            fontFamily: "var(--quiz-font)",
            fontSize: "17px",
            color: "var(--quiz-sub)",
            margin: 0,
          }}
        >
          اختبر نفسك وتابع تقدمك في جميع المواد
        </p>
      </div>

      {/* ── Stat cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          icon={<TotalIcon />}
          value={summary.total_quizzes}
          label="إجمالي الاختبارات"
          accent="var(--quiz-grade-f)"
          isDark={isDark}
        />
        <StatCard
          icon={<DoneIcon />}
          value={summary.completed}
          label="مكتملة"
          accent="var(--quiz-grade-a)"
          isDark={isDark}
        />
        <StatCard
          icon={<ActiveIcon />}
          value={summary.active}
          label="جاهزة للبدء"
          accent="var(--quiz-purple)"
          isDark={isDark}
        />
        <StatCard
          icon={<ExpiredIcon />}
          value={summary.expired}
          label="منتهية"
          accent="var(--quiz-grade-d)"
          isDark={isDark}
        />
      </Box>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
          rowGap: "8px",
          direction: "ltr",
        }}
      >
        <button
          className="quiz-btn-primary"
          onClick={onCreateQuiz}
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: 0.5,
            cursor: "not-allowed",
          }}
        >
          <span style={{ fontSize: "20px", lineHeight: 1, marginTop: "-1px" }}>
            +
          </span>
          اختبار شامل جديد
        </button>

        <button
          onClick={load}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--quiz-card-bg)",
            border: "1.5px solid var(--quiz-card-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="تحديث"
        >
          <RefreshIcon />
        </button>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                background:
                  filter === t.key
                    ? "var(--quiz-purple)"
                    : "var(--quiz-card-bg)",
                color: filter === t.key ? "#ffffff" : "var(--quiz-title)",
                border: `1.5px solid ${filter === t.key ? "var(--quiz-purple)" : "var(--quiz-card-border)"}`,
                fontFamily: "var(--quiz-font)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {t.label}
              {t.count != null && (
                <span
                  style={{
                    background:
                      filter === t.key
                        ? "rgba(255,255,255,0.22)"
                        : "var(--quiz-purple-light)",
                    color: filter === t.key ? "#fff" : "var(--quiz-accent)",
                    borderRadius: 20,
                    padding: "1px 7px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: "160px", position: "relative" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن مادة أو اختبار..."
            style={inputStyle}
          />
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          >
            <SearchIcon />
          </span>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 92,
                borderRadius: 16,
                background: "var(--quiz-purple-light)",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: "17px",
              color: "var(--quiz-error-text)",
              marginBottom: "16px",
            }}
          >
            {error}
          </p>
          <button
            className="quiz-btn-primary"
            onClick={load}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: "18px",
              color: "var(--quiz-sub)",
              marginBottom: "20px",
            }}
          >
            {search || filter !== "all"
              ? "لا توجد نتائج مطابقة"
              : "لا توجد اختبارات بعد. أنشئ اختباراً جديداً!"}
          </p>
          {filter === "all" && !search && (
            <button
              className="quiz-btn-primary"
              onClick={onCreateQuiz}
              disabled
            >
              أنشئ أول اختبار
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((quiz) => (
            <QuizCard
              key={quiz.quiz_id}
              quiz={quiz}
              isDark={isDark}
              onAction={onStartQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TotalIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line
        x1="16"
        y1="13"
        x2="8"
        y2="13"
      />
      <line
        x1="16"
        y1="17"
        x2="8"
        y2="17"
      />
    </svg>
  );
}
function DoneIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  );
}
function ActiveIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
      />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function ExpiredIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
      />
      <line
        x1="15"
        y1="9"
        x2="9"
        y2="15"
      />
      <line
        x1="9"
        y1="9"
        x2="15"
        y2="15"
      />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--quiz-purple)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--quiz-title)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="11"
        cy="11"
        r="8"
      />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
      />
    </svg>
  );
}

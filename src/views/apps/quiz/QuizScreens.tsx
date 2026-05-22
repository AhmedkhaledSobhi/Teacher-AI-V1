"use client";
import { useCoreUISound } from "@/hooks/useCoreUISound";

import { useState, useEffect, useRef } from "react";
import { getSession } from "next-auth/react";
import api from "@/utils/api";
import RobotMascot from "@core/components/RobotMascot";
import { useRouter, useParams } from "next/navigation";
import { getLocalizedUrl } from "@/utils/i18n";
import type { Locale } from "@/configs/i18n";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisualOption {
  url: string;
  arabic_concept: string;
  english_concept?: string;
  concept?: string;
  s3_key?: string;
  source?: string;
}

export interface Question {
  question_id: string;
  question_text: string;
  /** Text options (for text-based questions) */
  options: string[];
  /** Image options (for visual questions from lesson-quiz) */
  visual_options?: VisualOption[];
  question_type?: string;
  display_labels?: boolean;
  concept?: string;
  difficulty?: string;
  correct_answer?: string;
  topic?: string;
}

export interface QuizData {
  quiz_id: string;
  /** Whether quiz_id is really an async job_id that needs polling */
  isAsync?: boolean;
  questions: Question[];
  total_questions: number;
  estimated_duration_minutes?: number;
  quiz_metadata?: {
    subject?: string;
    grade?: string;
    term?: string;
    quiz_type?: string;
    subject_name_arabic?: string;
  };
}

/** Parse raw lesson-quiz API response into a QuizData */
export function parseLessonQuizResponse(data: any): QuizData {
  const rawQuestions: any[] = data?.questions ?? [];
  const questions: Question[] = rawQuestions.map((q: any) => ({
    question_id: q.question_id,
    question_text: q.question_text,
    question_type: q.question_type ?? "text",
    display_labels: q.display_labels ?? true,
    // For text questions populate options as strings; for visual populate visual_options
    options:
      q.question_type === "visual"
        ? []
        : Array.isArray(q.options)
          ? q.options.map((o: any) =>
              typeof o === "string"
                ? o
                : (o.arabic_concept ?? o.concept ?? String(o))
            )
          : [],
    visual_options:
      q.question_type === "visual" && Array.isArray(q.options)
        ? q.options.map((o: any) =>
            typeof o === "string"
              ? { url: "", arabic_concept: o, english_concept: "" }
              : {
                  url: o.url ?? "",
                  arabic_concept: o.arabic_concept ?? o.concept ?? "",
                  english_concept: o.english_concept ?? o.concept ?? "",
                }
          )
        : [],
    concept: q.concept ?? "",
    difficulty: q.difficulty ?? "",
    topic: q.topic ?? "",
  }));
  return {
    quiz_id: data.quiz_id,
    questions,
    total_questions: data.total_questions ?? questions.length,
    estimated_duration_minutes: data.estimated_duration_minutes,
    quiz_metadata: data.quiz_metadata,
  };
}

export interface StudentAnswer {
  question_id: string;
  student_answer: string;
  time_spent_seconds: number;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Detect the primary text direction of a string.
 * Returns "rtl" if the string contains more Arabic/Hebrew characters than Latin ones,
 * otherwise returns "ltr".
 */
function getTextDir(text: string): "ltr" | "rtl" {
  const arabicCount = (
    text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []
  ).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;
  return arabicCount >= latinCount ? "rtl" : "ltr";
}

function parseQuizFromData(quizId: string, data: any): QuizData {
  // Resolve questions from whichever key the backend uses
  const rawQs: any[] =
    data?.questions ??
    data?.question_results ??
    data?.data?.questions ??
    data?.data?.question_results ??
    [];

  // Run the same full mapping as parseLessonQuizResponse so visual_options
  // and english_concept are always populated correctly
  const questions: Question[] = rawQs.map((q: any) => ({
    question_id: q.question_id,
    question_text: q.question_text,
    question_type: q.question_type ?? "text",
    display_labels: q.display_labels ?? true,
    options:
      q.question_type === "visual"
        ? []
        : Array.isArray(q.options)
          ? q.options.map((o: any) =>
              typeof o === "string"
                ? o
                : (o.arabic_concept ?? o.concept ?? String(o))
            )
          : [],
    visual_options:
      q.question_type === "visual" && Array.isArray(q.options)
        ? q.options.map((o: any) =>
            typeof o === "string"
              ? { url: "", arabic_concept: o, english_concept: "" }
              : {
                  url: o.url ?? "",
                  arabic_concept: o.arabic_concept ?? o.concept ?? "",
                  english_concept: o.english_concept ?? o.concept ?? "",
                }
          )
        : [],
    concept: q.concept ?? "",
    difficulty: q.difficulty ?? "",
    topic: q.topic ?? "",
  }));

  return {
    quiz_id: quizId,
    questions,
    total_questions:
      data?.total_questions ?? data?.data?.total_questions ?? questions.length,
    estimated_duration_minutes: data?.estimated_duration_minutes,
    quiz_metadata: data?.quiz_metadata,
  };
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

interface QuizLoadingProps {
  isDark: boolean;
  /** quiz_id for sync start, or job_id for async polling */
  quizId: string;
  isAsyncJob?: boolean;
  /** Existing quiz record from the dashboard (for active quizzes already in the list) */
  quizRecord?: {
    subject_name_en?: string;
    subject_name_ar?: string;
    grade_id?: number;
    term_id?: number;
    total_possible?: number;
    selected_lesson_ids?: number[] | null;
    question_results?: any[];
  };
  onReady: (quiz: QuizData) => void;
  onBack: () => void;
}

export function QuizLoadingScreen({
  isDark,
  quizId,
  isAsyncJob,
  quizRecord,
  onReady,
  onBack,
}: QuizLoadingProps) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState(
    "المعلم الذكي يختار الأسئلة المناسبة لك..."
  );
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef(false);
  const { play } = useCoreUISound();

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    let pollInterval: ReturnType<typeof setInterval>;

    progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 4 : p));
    }, 500);

    /**
     * Two-step finish:
     * 1. POST /quiz/{id}/start  — records start time (returns a string)
     * 2. GET  /quiz/{id}        — fetches the quiz with questions
     */
    async function finish(resolvedQuizId: string) {
      if (doneRef.current) return;
      doneRef.current = true;
      clearInterval(progressInterval);
      clearInterval(pollInterval);
      setProgress(100);
      setStatusText("تم تجهيز الاختبار!");
      play("quiz-loader-done");

      try {
        // Step 1: POST /quiz/{id}/start — records start time, MAY return quiz with questions
        let startPayload: any = null;
        try {
          startPayload = await api.post<any>(
            `/api/v1/quiz/${resolvedQuizId}/start`,
            {}
          );
        } catch {
          // Backend returned a bare string — that is fine, no questions here
        }

        // Unwrap possible nesting: { data: { questions: [...] } } or { questions: [...] }
        const startData = startPayload?.data ?? startPayload;
        const startQuestions: any[] | undefined = startData?.questions;

        if (Array.isArray(startQuestions) && startQuestions.length > 0) {
          // /start returned questions directly — use them
          setTimeout(
            () => onReady(parseQuizFromData(resolvedQuizId, startData)),
            400
          );
          return;
        }

        // Step 2: Re-fetch user_quizzes after /start — backend may now embed questions
        setStatusText("جاري تحميل الأسئلة...");
        let listData: any = {};
        try {
          const session = await getSession();
          const userId =
            (session as any)?.user?.id ||
            (session as any)?.session?.user_id ||
            "";
          listData = await api.post<any>("/api/v1/quiz/user_quizzes", {
            user_id: userId,
          });
        } catch {
          /* ignore */
        }

        // API returns "quizes" (one z) or "quizzes"
        const allQuizzes: any[] =
          listData?.quizes ?? listData?.quizzes ?? listData?.data ?? [];
        const found = allQuizzes.find(
          (q: any) => String(q.quiz_id) == resolvedQuizId
        );

        const foundQuestions: any[] | undefined =
          found?.questions ?? found?.question_results;
        if (Array.isArray(foundQuestions) && foundQuestions.length > 0) {
          // Ensure quiz_metadata is populated from whichever field the record uses
          const foundWithMeta = {
            ...found,
            quiz_metadata: found?.quiz_metadata ?? {
              subject: found?.subject_name_en ?? found?.subject_name_ar ?? "",
              grade: String(found?.grade_id ?? ""),
              term: String(found?.term_id ?? ""),
              quiz_type: found?.quiz_type ?? "basic",
            },
          };
          setTimeout(
            () => onReady(parseQuizFromData(resolvedQuizId, foundWithMeta)),
            400
          );
          return;
        }

        // Step 3: question_results on the found record (populated after /start for some backends)
        const rawQuestions = found?.questions ?? found?.question_results ?? [];
        const resultQuestions: any[] = rawQuestions.map((q: any) => ({
          question_id: q.question_id,
          question_text: q.question_text,
          question_type: q.question_type ?? "text",
          options: Array.isArray(q.options) ? q.options : [],
          concept: q.concept ?? "",
          difficulty: q.difficulty ?? "",
          correct_answer: q.correct_answer ?? "",
        }));

        if (resultQuestions.length === 0) {
          setError(
            "لم يتم العثور على أسئلة لهذا الاختبار. يرجى المحاولة مجدداً."
          );
          return;
        }

        const record = found ?? quizRecord ?? {};
        const total = (record as any).total_possible ?? resultQuestions.length;
        const quiz: QuizData = {
          quiz_id: resolvedQuizId,
          questions: resultQuestions,
          total_questions: total,
          estimated_duration_minutes: Math.ceil(total * 1.5),
          quiz_metadata: {
            subject:
              (record as any).subject_name_en ??
              (record as any).subject_name_ar ??
              "",
            grade: String((record as any).grade_id ?? ""),
            term: String((record as any).term_id ?? ""),
            quiz_type: (record as any).quiz_type ?? "text",
          },
        };
        setTimeout(() => onReady(quiz), 400);
      } catch (err) {
        setError("تعذّر تحميل الاختبار. حاول مجدداً.");
      }
    }

    if (isAsyncJob) {
      // Poll the async job until the real quiz_id is ready
      let attempts = 0;
      const maxAttempts = 60;
      pollInterval = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(pollInterval);
          clearInterval(progressInterval);
          setError("استغرق إنشاء الاختبار وقتاً طويلاً. حاول مجدداً.");
          return;
        }
        try {
          const data = await api.get<any>(`/api/v1/quiz/quiz-status/${quizId}`);
          const payload = data?.data ?? data;
          const status = payload?.status ?? "";
          const resolvedQuizId = payload?.quiz_id ?? quizId;

          const isDone =
            status === "completed" ||
            status === "success" ||
            status === "ready";
          const hasDifferentId = resolvedQuizId !== quizId;

          if (isDone || hasDifferentId) {
            setStatusText("تم إنشاء الاختبار!");
            await finish(resolvedQuizId);
          } else if (status === "failed" || status === "error") {
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            setError("فشل في إنشاء الاختبار. حاول مجدداً.");
          } else {
            setStatusText(data?.message ?? "جاري تجهيز الاختبار...");
          }
        } catch {
          // Network blip — keep retrying
        }
      }, 1000);
    } else {
      // Sync quiz_id: run the two-step flow immediately
      finish(quizId).catch(() => {
        clearInterval(progressInterval);
        setError("تعذّر تحميل الاختبار. حاول مجدداً.");
      });
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(pollInterval);
    };
  }, [quizId, isAsyncJob]); // eslint-disable-line

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "32px 24px",
        direction: "rtl",
      }}
    >
      <RobotMascot
        width={160}
        height={150}
      />

      <h1
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 700,
          color: "var(--quiz-title)",
          marginTop: 24,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        المعلم الذكي يقوم بتجهيز الاختبار!
      </h1>
      <p
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: 16,
          color: "var(--quiz-accent)",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        {statusText}
      </p>

      {/* Progress bar */}
      {!error && (
        <div
          className="quiz-progress-track"
          style={{ width: "100%", maxWidth: 360, marginBottom: 28 }}
        >
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: "var(--quiz-font)",
              fontSize: 11,
              fontWeight: 700,
              color: "#ffffff",
              textShadow: "0 1px 2px rgba(0,0,0,0.40)",
            }}
          >
            {progress}%
          </span>
        </div>
      )}

      {/* Note card */}
      {!error && (
        <div
          className="quiz-card"
          style={{ maxWidth: 360, width: "100%", textAlign: "center" }}
        >
          <p
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--quiz-title)",
              marginBottom: 8,
            }}
          >
            ملاحظة:
          </p>
          <p
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 14,
              color: "var(--quiz-sub)",
              lineHeight: 1.6,
            }}
          >
            قد يستغرق إنشاء الاختبار القليل من الوقت. يمكنك الانتظار أو العودة
            لاحقاً.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 15,
              color: "var(--quiz-error-text)",
              marginBottom: 20,
            }}
          >
            {error}
          </p>
        </div>
      )}

      <button
        onClick={onBack}
        className="quiz-btn-primary"
        style={{ marginTop: 24 }}
      >
        العودة للصفحة الرئيسية
      </button>
    </div>
  );
}

// ─── Quiz Taking Screen ───────────────────────────────────────────────────────

interface QuizTakingProps {
  isDark: boolean;
  quiz: QuizData;
  onFinish: (answers: StudentAnswer[], totalSeconds: number) => void;
  onBack: () => void;
}

export function QuizTakingScreen({
  isDark,
  quiz,
  onFinish,
  onBack,
}: QuizTakingProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.lang as Locale) || "ar";

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const questionStartRef = useRef<number>(Date.now());
  const totalStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = quiz.questions[currentIdx];
  const total = quiz.questions.length;
  const isLast = currentIdx === total - 1;
  const selectedAnswer = question ? answers[question.question_id] : undefined;

  // Detect English subject to show english_concept label alongside arabic_concept
  const subjectName = (quiz.quiz_metadata?.subject ?? "").toLowerCase();
  const isEnglishSubject =
    subjectName.includes("english") ||
    subjectName.includes("انجليز") ||
    subjectName.includes("إنجليز");

  // Normalize options: some APIs return plain strings, others return objects
  const rawOptions: any[] = Array.isArray(question?.options)
    ? question.options
    : [];
  const rawVisualOptions: VisualOption[] = Array.isArray(
    question?.visual_options
  )
    ? question.visual_options
    : [];

  // Detect visual question: explicit type OR options array contains objects with a url/arabic_concept
  const firstOpt = rawOptions[0];
  const optionsAreObjects = firstOpt !== null && typeof firstOpt === "object";

  const isVisual =
    (question?.question_type === "visual" || optionsAreObjects) &&
    (rawVisualOptions.length > 0 || optionsAreObjects);

  // Build the visual options list from whichever source has them
  const visualOpts: VisualOption[] =
    rawVisualOptions.length > 0
      ? rawVisualOptions
      : optionsAreObjects
        ? rawOptions.map((o: any) => ({
            url: o.url ?? "",
            arabic_concept: o.arabic_concept ?? o.concept ?? String(o),
            english_concept: o.english_concept ?? o.concept ?? String(o),
          }))
        : [];

  // Build plain text options
  const textOpts: string[] = isVisual
    ? []
    : rawOptions.map((o: any) =>
        typeof o === "string" ? o : (o.arabic_concept ?? o.concept ?? String(o))
      );

  // Global countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIdx]);

  const timerMin = Math.floor(elapsedSeconds / 60);
  const timerSec = elapsedSeconds % 60;
  const timerLabel = `${String(timerMin).padStart(2, "0")}:${String(timerSec).padStart(2, "0")}`;

  function handleAnswer(value: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.question_id]: value }));
  }

  function handleNav(direction: "next" | "prev") {
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    if (question) {
      setTimings((prev) => ({ ...prev, [question.question_id]: elapsed }));
    }

    if (direction === "next" && isLast) {
      const totalSecs = Math.round((Date.now() - totalStartRef.current) / 1000);
      if (timerRef.current) clearInterval(timerRef.current);
      const studentAnswers: StudentAnswer[] = quiz.questions.map((q) => ({
        question_id: q.question_id,
        student_answer: answers[q.question_id] ?? "",
        time_spent_seconds:
          q.question_id === question?.question_id
            ? elapsed
            : (timings[q.question_id] ?? 0),
      }));
      onFinish(studentAnswers, totalSecs);
    } else if (direction === "next") {
      setCurrentIdx((i) => i + 1);
    } else {
      setCurrentIdx((i) => Math.max(0, i - 1));
    }
  }

  if (!question) return null;

  const letters = ["A", "B", "C", "D", "E"];
  const circleIndices = Array.from({ length: total }, (_, i) => i);

  // All questions answered → last card gets dashed teal border
  const allAnswered = quiz.questions.every(
    (q) => answers[q.question_id] !== undefined
  );

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / total) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--quiz-bg)",
        display: "flex",
        flexDirection: "column",
        direction: "rtl",
        padding: "clamp(16px, 3vw, 28px)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Top Bar — sits on lavender bg, no card ──────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(8px, 2vw, 16px)",
          marginBottom: "clamp(14px, 2.5vw, 24px)",
          flexWrap: "wrap",
        }}
      >
        {/* Cancel — rightmost in RTL */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            router.push(getLocalizedUrl("/apps/home", locale));
          }}
          style={{
            padding: "9px 20px",
            borderRadius: 12,
            border: "none",
            background: "var(--quiz-cancel-bg)",
            color: "#fff",
            fontFamily: "var(--quiz-font)",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          إلغاء الاختبار
        </button>

        {/* Progress bar + counter — center */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            minWidth: 0,
            direction: "ltr",
          }}
        >
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--quiz-accent)",
              whiteSpace: "nowrap",
            }}
          >
            {currentIdx + 1}/{total}
          </span>
          {/* Track */}
          <div
            style={{
              flex: 1,
              maxWidth: 160,
              height: 8,
              borderRadius: 100,
              background: "var(--quiz-progress-track)",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: 100,
                background: "var(--quiz-purple)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 13,
              color: "var(--quiz-sub)",
              whiteSpace: "nowrap",
            }}
          >
            التقدم
          </span>
        </div>

        {/* Timer — leftmost in RTL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--quiz-title)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timerLabel}
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--quiz-title)"
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
        </div>
      </div>

      {/* ── Main card — white, rounded, contains steps + question + options ── */}
      <div
        style={{
          background: "var(--quiz-card-bg)",
          borderRadius: 20,
          padding: "clamp(18px, 3vw, 32px)",
          boxShadow: "var(--quiz-card-shadow)",
          border: allAnswered
            ? `2.5px dashed var(--quiz-teal)`
            : "2.5px solid transparent",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          transition: "border-color 0.3s ease",
        }}
      >
        {/* ── Step circles inside card ─��─────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: 2,
            scrollbarWidth: "none",
            gap: 0,
          }}
        >
          {circleIndices.map((idx, pos) => {
            const isActive = idx === currentIdx;
            const isAnswered =
              answers[quiz.questions[idx].question_id] !== undefined;
            return (
              <div
                key={idx}
                style={{ display: "flex", alignItems: "center" }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--quiz-font)",
                    fontSize: 13,
                    fontWeight: 700,
                    background: isActive
                      ? "var(--quiz-purple)"
                      : isAnswered
                        ? "var(--quiz-teal)"
                        : "var(--quiz-option-unselected-border)",
                    color:
                      isActive || isAnswered
                        ? "#fff"
                        : "var(--quiz-option-dot-unselected)",
                    border: "none",
                    transition: "all 0.25s ease",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                {/* Connector line */}
                {pos < total - 1 && (
                  <div
                    style={{
                      width: "clamp(20px, 4vw, 40px)",
                      height: 2,
                      background: isAnswered
                        ? "var(--quiz-teal)"
                        : "var(--quiz-progress-track)",
                      transition: "background 0.25s ease",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Question text ─────────────────────────────────────── */}
        <p
          style={{
            fontFamily: "var(--quiz-font)",
            fontSize: "clamp(17px, 2.4vw, 22px)",
            fontWeight: 700,
            color: "var(--quiz-title)",
            lineHeight: "165%",
            textAlign: "center",
            margin: 0,
            direction: getTextDir(question.question_text),
            unicodeBidi: "plaintext",
          }}
        >
          {question.question_text}
        </p>

        {/* ── Options grid ──────────────────────────────────────── */}
        {isVisual ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
            }}
          >
            {visualOpts.map((opt, i) => {
              const value = isEnglishSubject
                ? opt.english_concept || opt.arabic_concept
                : opt.arabic_concept;

              const isSelected = selectedAnswer === value;
              const letter = letters[i] ?? String.fromCharCode(65 + i);
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(value)}
                  style={{
                    position: "relative",
                    background: isSelected
                      ? "var(--quiz-purple-light)"
                      : "var(--quiz-option-unselected-bg)",
                    border: `2px solid ${isSelected ? "var(--quiz-purple)" : "var(--quiz-card-border)"}`,
                    borderRadius: 16,
                    padding: "16px 12px 12px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isSelected
                        ? "var(--quiz-purple)"
                        : "var(--quiz-option-unselected-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--quiz-font)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: isSelected ? "#fff" : "var(--quiz-accent)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {letter}
                  </div>
                  {opt.url ? (
                    <img
                      src={opt.url}
                      alt={opt.arabic_concept}
                      crossOrigin="anonymous"
                      style={{
                        width: "100%",
                        maxWidth: 180,
                        height: 130,
                        objectFit: "cover",
                        borderRadius: 10,
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 180,
                        height: 130,
                        borderRadius: 10,
                        background: "var(--quiz-purple-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--quiz-font)",
                          fontSize: 28,
                          color: "var(--quiz-accent)",
                        }}
                      >
                        ؟
                      </span>
                    </div>
                  )}
                  {question?.display_labels !== false && (
                    <span
                      style={{
                        fontFamily: "var(--quiz-font)",
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected
                          ? "var(--quiz-accent)"
                          : "var(--quiz-title)",
                        textAlign: "center",
                        direction: isEnglishSubject ? "ltr" : "rtl",
                      }}
                    >
                      {isEnglishSubject
                        ? opt.english_concept || opt.arabic_concept
                        : opt.arabic_concept}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Text options — 2-column grid matching screenshot */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {textOpts.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const letter = letters[i] ?? String.fromCharCode(65 + i);
              const optDir = getTextDir(option);
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: `1.5px solid ${isSelected ? "var(--quiz-purple)" : "var(--quiz-option-unselected-border)"}`,
                    background: isSelected
                      ? "var(--quiz-purple-light)"
                      : "var(--quiz-option-unselected-bg)",
                    cursor: "pointer",
                    direction: optDir,
                    transition: "all 0.18s ease",
                    minHeight: 56,
                    textAlign: optDir === "rtl" ? "right" : "left",
                  }}
                >
                  {/* Answer text — right side in RTL */}
                  <span
                    style={{
                      fontFamily: "var(--quiz-font)",
                      fontSize: "clamp(14px, 1.8vw, 16px)",
                      fontWeight: isSelected ? 600 : 400,
                      color: "var(--quiz-title)",
                      flex: 1,
                      lineHeight: "150%",
                    }}
                  >
                    {option}
                  </span>
                  {/* Letter badge — left side in RTL (LTR end) */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--quiz-font)",
                      fontSize: 13,
                      fontWeight: 700,
                      background: isSelected
                        ? "var(--quiz-purple)"
                        : "var(--quiz-option-unselected-border)",
                      color: isSelected ? "#fff" : "var(--quiz-accent)",
                      transition: "all 0.18s ease",
                    }}
                  >
                    {letter}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Nav — outside the card on lavender bg ─────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "clamp(14px, 2.5vw, 24px)",
          direction: "rtl",
          gap: 12,
        }}
      >
        {/* Primary action: "التالي" or "تسليم الاختبار" — rightmost in RTL */}
        <button
          onClick={() => handleNav("next")}
          disabled={!selectedAnswer}
          style={{
            padding: "12px clamp(18px, 3vw, 28px)",
            borderRadius: 14,
            border: "none",
            background: selectedAnswer
              ? isLast
                ? "var(--quiz-teal)"
                : "var(--quiz-purple)"
              : "var(--quiz-progress-track)",
            color: selectedAnswer ? "#fff" : "var(--quiz-sub)",
            fontFamily: "var(--quiz-font)",
            fontSize: 15,
            fontWeight: 700,
            cursor: selectedAnswer ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {/* Arrow left (RTL next) */}
          <span>{isLast ? "تسليم الاختبار" : "التالي"}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line
              x1="19"
              y1="12"
              x2="5"
              y2="12"
            />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Center: question label */}
        <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 12,
              color: "var(--quiz-teal)",
              marginBottom: 2,
              whiteSpace: "nowrap",
            }}
          >
            السؤال التالي:
          </div>
          <div
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--quiz-title)",
              whiteSpace: "nowrap",
            }}
          >
            {currentIdx + 1} من {total}
          </div>
        </div>

        {/* "السابق" — leftmost in RTL */}
        <button
          onClick={() => handleNav("prev")}
          disabled={currentIdx === 0}
          style={{
            padding: "12px clamp(14px, 2.5vw, 22px)",
            borderRadius: 14,
            border: `1.5px solid ${currentIdx === 0 ? "transparent" : "var(--quiz-nav-border)"}`,
            background: "transparent",
            color: currentIdx === 0 ? "var(--quiz-sub)" : "var(--quiz-title)",
            fontFamily: "var(--quiz-font)",
            fontSize: 15,
            fontWeight: 600,
            cursor: currentIdx === 0 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
            />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <span>السابق</span>
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Results Screen ──────────────────────────────────────────────────────

interface QuizResultsProps {
  isDark: boolean;
  quiz: QuizData;
  answers: StudentAnswer[];
  totalSeconds: number;
  /** Lesson ID used to call the lesson completion API after feedback is received */
  lessonId?: number;
  onBack: () => void;
}

interface QuestionResult {
  question_id: string;
  question_text?: string;
  student_answer?: string;
  correct_answer?: string;
  is_correct?: boolean;
  concept?: string;
  difficulty?: string;
  time_spent_seconds?: number;
}

interface ImprovementItem {
  concept: string;
  type: string;
}

interface FeedbackResult {
  score?: number;
  total_score?: number;
  total_possible?: number;
  correct_count?: number;
  wrong_count?: number;
  skipped_count?: number;
  percentage?: number;
  level?: string;
  grade_level?: string;
  feedback_message?: string;
  /** Full per-question results from the API */
  question_results?: QuestionResult[];
  /** Legacy corrections field */
  corrections?: QuestionResult[];
  improvements?: ImprovementItem[];
  strengths?: ImprovementItem[];
  suggested_recommendations?: string[];
  study_plan?: string | string[];
  questions_time_graph?: number[];
  time_analysis?: {
    total_time_seconds?: number;
    total_time_minutes?: number;
    average_per_question_seconds?: number;
    analysis?: string;
    fastest_question_seconds?: number;
    slowest_question_seconds?: number;
  };
}

export function QuizResultsScreen({
  isDark,
  quiz,
  answers,
  totalSeconds,
  lessonId,
  onBack,
}: QuizResultsProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const { play } = useCoreUISound();

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    async function submit() {
      try {
        const body = {
          quiz_id: quiz.quiz_id,
          student_answers: answers,
          total_time_spent_seconds: totalSeconds,
        };
        const data = await api.post<any>(
          `/api/v1/quiz/${quiz.quiz_id}/feedback`,
          body
        );
        if (data?.operation_status === "success" || data?.data) {
          const d = data?.data ?? data;
          setResult({
            score: d.total_score ?? d.score ?? d.correct_count,
            total_score: d.total_score,
            total_possible: d.total_possible,
            correct_count:
              d.correct_answers_count ?? d.correct_count ?? d.score,
            wrong_count: d.incorrect_answers_count ?? d.wrong_count,
            skipped_count: d.skipped_count,
            percentage: d.percentage ?? d.score_percentage,
            level: d.grade_level ?? d.level ?? d.performance_level,
            grade_level: d.grade_level,
            feedback_message: d.feedback_message ?? d.message,
            question_results: d.question_results,
            corrections: d.corrections ?? d.answers_feedback,
            improvements: d.improvements,
            strengths: d.strengths,
            suggested_recommendations: d.suggested_recommendations,
            study_plan: d.study_plan,
            questions_time_graph: d.questions_time_graph,
            time_analysis: d.time_analysis,
          });
        } else {
          // Fallback: compute from local answers
          const answered = answers.filter((a) => a.student_answer).length;
          setResult({
            correct_count: answered,
            wrong_count: quiz.total_questions - answered,
            percentage: Math.round(
              (answered / (quiz.total_questions || 1)) * 100
            ),
          });
        }
      } catch {
        setSubmitError("تعذّر رفع إجاباتك. سيتم عرض نتيجة تقديرية.");
        const answered = answers.filter((a) => a.student_answer).length;
        setResult({
          correct_count: answered,
          wrong_count: quiz.total_questions - answered,
          percentage: Math.round(
            (answered / (quiz.total_questions || 1)) * 100
          ),
        });
      } finally {
        setLoading(false);
      }
    }

    submit();
  }, []); // eslint-disable-line

  const pct = result?.percentage ?? 0;

  // Play result fanfare once when the result loads.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loading || !result) return;
    if (pct === 100) {
      play("quiz-result-perfect");
    } else if (pct >= 60) {
      play("quiz-result-good");
    } else {
      play("quiz-result-retry");
    }
  }, [loading, result]); // intentionally omitting `play` and `pct` to fire only once

  const badgeColor =
    pct >= 80
      ? "var(--quiz-grade-a)"
      : pct >= 60
        ? "var(--quiz-grade-d)"
        : "var(--quiz-grade-f)";
  const badgeBg =
    pct >= 80
      ? "var(--quiz-grade-a-bg)"
      : pct >= 60
        ? "var(--quiz-grade-d-bg)"
        : "var(--quiz-grade-f-bg)";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div style={{ direction: "rtl" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <RobotMascot
          width={130}
          height={120}
        />
        <h1
          style={{
            fontFamily: "var(--quiz-font)",
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 700,
            color: "var(--quiz-title)",
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          انتهيت من الاختبار!
        </h1>
        <p
          style={{
            fontFamily: "var(--quiz-font)",
            fontSize: 16,
            color: "var(--quiz-sub)",
          }}
        >
          {result?.feedback_message ?? "أحسنت! إليك نتيجتك"}
        </p>
      </div>

      {loading ? (
        /* Submitting spinner */
        <div style={{ textAlign: "center", padding: 48 }}>
          <div
            className="quiz-progress-track"
            style={{ maxWidth: 260, margin: "0 auto 16px" }}
          >
            <div
              className="quiz-progress-fill"
              style={{ width: "60%", animationDuration: "1s" }}
            />
          </div>
          <p
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 15,
              color: "var(--quiz-sub)",
            }}
          >
            جاري تقييم إجاباتك...
          </p>
        </div>
      ) : (
        <>
          {submitError && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "var(--quiz-wrong-bg)",
                border: "1.5px solid var(--quiz-wrong-border)",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 13,
                  color: "var(--quiz-error-text)",
                }}
              >
                {submitError}
              </span>
            </div>
          )}

          {/* ── Score card ── */}
          <div
            className="quiz-card"
            style={{
              textAlign: "center",
              marginBottom: 20,
              padding: "28px 24px",
            }}
          >
            {/* Percentage circle */}
            <div
              className="quiz-result-badge"
              style={{ background: badgeBg, color: badgeColor }}
            >
              {pct}%
            </div>

            {/* Score fraction + grade level */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {result?.total_score != null &&
                result?.total_possible != null && (
                  <span
                    style={{
                      fontFamily: "var(--quiz-font)",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--quiz-title)",
                    }}
                  >
                    {result.total_score} / {result.total_possible}
                  </span>
                )}
              {result?.level && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 18px",
                    borderRadius: 20,
                    background: badgeBg,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--quiz-font)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: badgeColor,
                    }}
                  >
                    {result.level}
                  </span>
                </div>
              )}
            </div>

            {/* Stat chips — 3 columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div className="quiz-stat-chip">
                <span
                  className="value"
                  style={{ fontSize: 20 }}
                >
                  {timeStr}
                </span>
                <span className="label">الوقت المستغرق</span>
              </div>
              <div
                className="quiz-stat-chip"
                style={
                  {
                    "--quiz-purple": "var(--quiz-grade-f)",
                    "--quiz-purple-light": "var(--quiz-grade-f-bg)",
                  } as React.CSSProperties
                }
              >
                <span
                  className="value"
                  style={{ color: "var(--quiz-grade-f)" }}
                >
                  {result?.wrong_count ?? "—"}
                </span>
                <span className="label">إجابات خاطئة</span>
              </div>
              <div
                className="quiz-stat-chip"
                style={
                  {
                    "--quiz-purple": "var(--quiz-grade-a)",
                    "--quiz-purple-light": "var(--quiz-grade-a-bg)",
                  } as React.CSSProperties
                }
              >
                <span
                  className="value"
                  style={{ color: "var(--quiz-grade-a)" }}
                >
                  {result?.correct_count ?? "—"}
                </span>
                <span className="label">إجابات صحيحة</span>
              </div>
            </div>

            {/* Time analysis details */}
            {result?.time_analysis && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.time_analysis.analysis && (
                  <div
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: "var(--quiz-purple-light)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      alignSelf: "center",
                    }}
                  >
                    <ClockIcon size={13} />
                    <span
                      style={{
                        fontFamily: "var(--quiz-font)",
                        fontSize: 13,
                        color: "var(--quiz-sub)",
                      }}
                    >
                      {result.time_analysis.analysis}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {result.time_analysis.average_per_question_seconds !=
                    null && (
                    <span
                      style={{
                        fontFamily: "var(--quiz-font)",
                        fontSize: 12,
                        color: "var(--quiz-sub)",
                      }}
                    >
                      متوسط السؤال:{" "}
                      <strong>
                        {result.time_analysis.average_per_question_seconds}ث
                      </strong>
                    </span>
                  )}
                  {result.time_analysis.fastest_question_seconds != null && (
                    <span
                      style={{
                        fontFamily: "var(--quiz-font)",
                        fontSize: 12,
                        color: "var(--quiz-grade-a)",
                      }}
                    >
                      أسرع إجابة:{" "}
                      <strong>
                        {result.time_analysis.fastest_question_seconds}ث
                      </strong>
                    </span>
                  )}
                  {result.time_analysis.slowest_question_seconds != null && (
                    <span
                      style={{
                        fontFamily: "var(--quiz-font)",
                        fontSize: 12,
                        color: "var(--quiz-grade-d)",
                      }}
                    >
                      أبطأ إجابة:{" "}
                      <strong>
                        {result.time_analysis.slowest_question_seconds}ث
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Per-question time bar chart ── */}
          {result?.questions_time_graph &&
            result.questions_time_graph.length > 0 && (
              <div
                className="quiz-card"
                style={{ marginBottom: 20, padding: "20px 20px 16px" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--quiz-font)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--quiz-title)",
                    marginBottom: 14,
                    textAlign: "right",
                  }}
                >
                  الوقت لكل سؤال (ثانية)
                </h2>
                <TimeBarChart
                  data={result.questions_time_graph}
                  questionResults={result.question_results}
                  isDark={isDark}
                />
              </div>
            )}

          {/* ── Per-question breakdown ── */}
          {(() => {
            const rows = result?.question_results ?? result?.corrections ?? [];
            if (rows.length === 0) return null;
            return (
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontFamily: "var(--quiz-font)",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--quiz-title)",
                    marginBottom: 14,
                    textAlign: "right",
                  }}
                >
                  مراجعة الإجابات
                </h2>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {rows.map((c, i) => (
                    <div
                      key={c.question_id ?? i}
                      className={`quiz-answer-row ${c.is_correct ? "correct" : "wrong"}`}
                    >
                      {/* Question number + status circle */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: c.is_correct
                              ? "var(--quiz-correct-dot)"
                              : "var(--quiz-wrong-dot)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {c.is_correct ? (
                            <CheckIcon size={14} />
                          ) : (
                            <XIcon size={14} />
                          )}
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 10,
                            color: "var(--quiz-sub)",
                            fontWeight: 600,
                          }}
                        >
                          س{i + 1}
                        </span>
                      </div>

                      {/* Text content */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {c.question_text && (
                          <p
                            style={{
                              fontFamily: "var(--quiz-font)",
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--quiz-title)",
                              margin: 0,
                              lineHeight: "1.55",
                            }}
                          >
                            {c.question_text}
                          </p>
                        )}
                        {/* Answers */}
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                          {c.student_answer && (
                            <span
                              style={{
                                fontFamily: "var(--quiz-font)",
                                fontSize: 13,
                                padding: "2px 10px",
                                borderRadius: 8,
                                background: c.is_correct
                                  ? "var(--quiz-correct-bg)"
                                  : "var(--quiz-grade-f-bg)",
                                color: c.is_correct
                                  ? "var(--quiz-grade-a)"
                                  : "var(--quiz-grade-f)",
                              }}
                            >
                              إجابتك: {c.student_answer}
                            </span>
                          )}
                          {!c.is_correct && c.correct_answer && (
                            <span
                              style={{
                                fontFamily: "var(--quiz-font)",
                                fontSize: 13,
                                padding: "2px 10px",
                                borderRadius: 8,
                                background: "var(--quiz-correct-bg)",
                                color: "var(--quiz-grade-a)",
                              }}
                            >
                              الصحيحة: {c.correct_answer}
                            </span>
                          )}
                        </div>
                        {/* Meta tags: concept / difficulty / time */}
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                        >
                          {c.concept && (
                            <span
                              style={{
                                fontFamily: "var(--quiz-font)",
                                fontSize: 11,
                                padding: "2px 9px",
                                borderRadius: 20,
                                background: "var(--quiz-purple-light)",
                                color: "var(--quiz-accent)",
                              }}
                            >
                              {c.concept}
                            </span>
                          )}
                          {c.difficulty && (
                            <span
                              style={{
                                fontFamily: "var(--quiz-font)",
                                fontSize: 11,
                                padding: "2px 9px",
                                borderRadius: 20,
                                background: "var(--quiz-card-border)",
                                color: "var(--quiz-sub)",
                              }}
                            >
                              {c.difficulty}
                            </span>
                          )}
                          {c.time_spent_seconds != null && (
                            <span
                              style={{
                                fontFamily: "var(--quiz-font)",
                                fontSize: 11,
                                padding: "2px 9px",
                                borderRadius: 20,
                                background: "var(--quiz-card-border)",
                                color: "var(--quiz-sub)",
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <ClockIcon size={10} />
                              {c.time_spent_seconds}ث
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Result badge */}
                      <span
                        style={{
                          fontFamily: "var(--quiz-font)",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                          padding: "3px 12px",
                          borderRadius: 20,
                          background: c.is_correct
                            ? "var(--quiz-correct-bg)"
                            : "var(--quiz-wrong-bg)",
                          color: c.is_correct
                            ? "var(--quiz-grade-a)"
                            : "var(--quiz-grade-f)",
                        }}
                      >
                        {c.is_correct ? "صح" : "خطأ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Strengths ── */}
          {result?.strengths && result.strengths.length > 0 && (
            <div
              className="quiz-card"
              style={{ marginBottom: 20, padding: "22px 20px" }}
            >
              <h2
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--quiz-title)",
                  marginBottom: 12,
                  textAlign: "right",
                }}
              >
                نقاط القوة
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "var(--quiz-correct-bg)",
                      border: "1.5px solid var(--quiz-correct-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--quiz-correct-dot)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--quiz-font)",
                        fontSize: 14,
                        color: "var(--quiz-title)",
                        fontWeight: 500,
                      }}
                    >
                      {s.concept}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Improvements ── */}
          {result?.improvements && result.improvements.length > 0 && (
            <div
              className="quiz-card"
              style={{ marginBottom: 20, padding: "22px 20px" }}
            >
              <h2
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--quiz-title)",
                  marginBottom: 12,
                  textAlign: "right",
                }}
              >
                محاور تحتاج مراجعة
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.improvements.map((imp, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "var(--quiz-wrong-bg)",
                      border: "1.5px solid var(--quiz-wrong-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--quiz-wrong-dot)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--quiz-font)",
                        fontSize: 14,
                        color: "var(--quiz-title)",
                        fontWeight: 500,
                      }}
                    >
                      {imp.concept}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Suggested recommendations ── */}
          {result?.suggested_recommendations &&
            result.suggested_recommendations.length > 0 && (
              <div
                className="quiz-card"
                style={{ marginBottom: 20, padding: "22px 20px" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--quiz-font)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--quiz-title)",
                    marginBottom: 12,
                    textAlign: "right",
                  }}
                >
                  توصيات لتحسين الأداء
                </h2>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {result.suggested_recommendations.map((line, i) => {
                    const isH3 = line.startsWith("###");
                    const isBullet =
                      line.startsWith("- ") || line.startsWith("* ");
                    const clean = line
                      .replace(/^#+\s*/, "")
                      .replace(/\*\*/g, "")
                      .replace(/^[-*]\s+/, "");
                    if (!clean.trim()) return null;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        {isBullet && (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--quiz-purple, #6948B8)",
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <p
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: isH3 ? 14 : 13,
                            fontWeight: isH3 ? 700 : 400,
                            color: isH3
                              ? "var(--quiz-title)"
                              : "var(--quiz-sub)",
                            margin: isH3 ? "8px 0 2px" : 0,
                            lineHeight: "1.65",
                            flex: 1,
                          }}
                        >
                          {clean}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* ── Study plan ── */}
          {result?.study_plan &&
            (typeof result.study_plan === "string"
              ? result.study_plan.trim().length > 0
              : result.study_plan.length > 0) && (
              <div
                className="quiz-card"
                style={{ marginBottom: 20, padding: "22px 20px" }}
              >
                <h2
                  style={{
                    fontFamily: "var(--quiz-font)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--quiz-title)",
                    marginBottom: 12,
                    textAlign: "right",
                  }}
                >
                  خطة المراجعة المقترحة
                </h2>
                <div
                  className="study-plan-markdown"
                  style={{
                    fontFamily: "var(--quiz-font)",
                    fontSize: 13,
                    color: "var(--quiz-sub)",
                    lineHeight: 1.7,
                    direction: "rtl",
                    textAlign: "right",
                  }}
                >
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 18,
                            fontWeight: 700,
                            color: "var(--quiz-title)",
                            margin: "16px 0 8px",
                          }}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--quiz-title)",
                            margin: "14px 0 6px",
                          }}
                        >
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--quiz-title)",
                            margin: "12px 0 4px",
                          }}
                        >
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 13,
                            color: "var(--quiz-sub)",
                            margin: "6px 0",
                            lineHeight: 1.7,
                          }}
                        >
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul
                          style={{
                            margin: "8px 0",
                            paddingRight: 20,
                            paddingLeft: 0,
                            listStyleType: "disc",
                          }}
                        >
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol
                          style={{
                            margin: "8px 0",
                            paddingRight: 20,
                            paddingLeft: 0,
                          }}
                        >
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 13,
                            color: "var(--quiz-sub)",
                            marginBottom: 4,
                            lineHeight: 1.65,
                          }}
                        >
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong
                          style={{
                            fontWeight: 700,
                            color: "var(--quiz-title)",
                          }}
                        >
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em style={{ fontStyle: "italic" }}>{children}</em>
                      ),
                      hr: () => (
                        <hr
                          style={{
                            border: "none",
                            borderTop: "1px solid var(--quiz-border, #e0e0e0)",
                            margin: "12px 0",
                          }}
                        />
                      ),
                      table: ({ children }) => (
                        <div style={{ overflowX: "auto", margin: "12px 0" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontSize: 12,
                            }}
                          >
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead
                          style={{
                            background: "var(--quiz-purple-light, #f3f0ff)",
                          }}
                        >
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--quiz-title)",
                            padding: "8px 10px",
                            textAlign: "right",
                            borderBottom:
                              "1px solid var(--quiz-border, #e0e0e0)",
                          }}
                        >
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td
                          style={{
                            fontFamily: "var(--quiz-font)",
                            fontSize: 12,
                            color: "var(--quiz-sub)",
                            padding: "8px 10px",
                            textAlign: "right",
                            borderBottom:
                              "1px solid var(--quiz-border, #e0e0e0)",
                          }}
                        >
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {typeof result.study_plan === "string"
                      ? result.study_plan
                      : result.study_plan.join("\n")}
                  </Markdown>
                </div>
              </div>
            )}
        </>
      )}

      <button
        onClick={onBack}
        className="quiz-btn-primary"
        style={{ width: "100%", padding: 15, fontSize: 17 }}
      >
        العودة للاختبارات
      </button>
    </div>
  );
}

// ─── Time Bar Chart ───────────────────────────────────────────────────────────

function TimeBarChart({
  data,
  questionResults,
  isDark,
}: {
  data: number[];
  questionResults?: QuestionResult[];
  isDark: boolean;
}) {
  const max = Math.max(...data, 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height: 72,
        direction: "ltr",
      }}
    >
      {data.map((seconds, i) => {
        const heightPct = (seconds / max) * 100;
        const isCorrect = questionResults?.[i]?.is_correct;
        const barColor =
          isCorrect === true
            ? "var(--quiz-correct-dot)"
            : isCorrect === false
              ? "var(--quiz-wrong-dot)"
              : "var(--quiz-purple)";
        const barBg =
          isCorrect === true
            ? "var(--quiz-correct-bg)"
            : isCorrect === false
              ? "var(--quiz-wrong-bg)"
              : "var(--quiz-purple-light)";
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              height: "100%",
              justifyContent: "flex-end",
            }}
            title={`س${i + 1}: ${seconds}ث`}
          >
            {/* Bar */}
            <div
              style={{
                width: "100%",
                height: `${heightPct}%`,
                minHeight: 8,
                borderRadius: "6px 6px 0 0",
                background: barColor,
                opacity: 0.85,
                position: "relative",
              }}
            />
            {/* Time label */}
            <span
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: 10,
                color: "var(--quiz-sub)",
                lineHeight: 1,
              }}
            >
              {seconds}ث
            </span>
            {/* Question number */}
            <span
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: 10,
                color: "var(--quiz-sub)",
                opacity: 0.7,
                lineHeight: 1,
              }}
            >
              س{i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── SVG helpers ──────────────────────────────────────���───────────────────────

function ClockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--quiz-sub)", flexShrink: 0 }}
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

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
      />
      <line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
      />
    </svg>
  );
}

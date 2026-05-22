"use client";

import { useState, useEffect, useRef } from "react";
import RobotMascot from "@core/components/RobotMascot";
import api from "@/utils/api";
import {
  parseLessonQuizResponse,
  type QuizData,
} from "@/views/apps/quiz/QuizScreens";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PrepareQuizScreenProps {
  isDark: boolean;
  subjectId: number;
  gradeId: number;
  unitId?: number;
  lessonId?: number;
  /** "basic" uses lesson-quiz with quiz_category:"basic"; "smart" uses lesson-quiz with quiz_category:"smart" */
  quizCategory?: "basic" | "smart";
  onBack: () => void;
  /** Called when quiz data is ready — parent should show the taking screen */
  onQuizReady?: (quiz: QuizData) => void;
}

// ─── Prep Screen ───────────────────────────────────────────────────────────────

export default function PrepareQuizScreen({
  isDark,
  subjectId,
  gradeId,
  unitId,
  lessonId,
  quizCategory = "basic",
  onBack,
  onQuizReady,
}: PrepareQuizScreenProps) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState(
    quizCategory === "smart"
      ? "المعلم الذكي يولّد أسئلة مخصصة لمستواك..."
      : "جاري تحضير أسئلة الاختبار من الدرس..."
  );
  const [error, setError] = useState<string | null>(null);
  const doneRef = useRef(false);
  const createdRef = useRef(false);

  const cardBg = isDark ? "rgba(40,28,80,0.85)" : "#FFFFFF";
  const noteBg = isDark ? "rgba(105,72,184,0.15)" : "rgba(105,72,184,0.07)";
  const noteBorder = isDark
    ? "rgba(180,150,255,0.20)"
    : "rgba(105,72,184,0.15)";
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#6948B8";

  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 3 : p));
    }, 400);

    async function createAndRedirect() {
      try {
        if (quizCategory === "smart") {
          // ── Smart quiz: async creation + polling ─────────────────────────
          setStatusText("المعلم الذكي يولّد أسئلة مخصصة لمستواك...");

          const asyncBody: Record<string, unknown> = {};
          if (lessonId) asyncBody.lesson_id = lessonId;
          if (unitId) asyncBody.unit_id = unitId;

          const asyncData = await api.post<any>(
            "/api/v1/quiz/create-quiz-async",
            asyncBody
          );
          const jobId =
            asyncData?.job_id ??
            asyncData?.data?.job_id ??
            asyncData?.id ??
            asyncData?.data?.id;

          if (!jobId) {
            clearInterval(progressInterval);
            setError("تعذّر بدء إنشاء الاختبار الذكي. حاول مجدداً.");
            return;
          }

          // Poll quiz-status/{job_id} until completed
          setStatusText("جاري معالجة الأسئلة...");
          let attempts = 0;
          const maxAttempts = 60;

          const pollInterval = setInterval(async () => {
            attempts++;
            if (attempts > maxAttempts) {
              clearInterval(pollInterval);
              clearInterval(progressInterval);
              setError("استغرق إنشاء الاختبار وقتاً طويلاً. حاول مجدداً.");
              return;
            }

            try {
              const statusData = await api.get<any>(
                `/api/v1/quiz/quiz-status/${jobId}`
              );
              const payload = statusData?.data ?? statusData;
              const status: string = payload?.status ?? "";
              const resolvedQuizId: string | undefined =
                payload?.quiz_id ?? payload?.data?.quiz_id;

              const isDone =
                status === "completed" ||
                status === "success" ||
                status === "ready";

              if (!isDone) return; // keep polling

              clearInterval(pollInterval);
              clearInterval(progressInterval);

              if (!resolvedQuizId) {
                setError("اكتمل الاختبار لكن لم يُعد معرّفه. حاول مجدداً.");
                return;
              }

              setProgress(95);
              setStatusText("جاري تحميل الأسئلة...");

              // Fetch the full quiz questions via /start then /user-quizzes
              let startPayload: any = null;
              try {
                startPayload = await api.post<any>(
                  `/api/v1/quiz/${resolvedQuizId}/start`,
                  {}
                );
              } catch {
                /* bare string ok */
              }

              const startData = startPayload?.data ?? startPayload;
              const startQuestions: any[] | undefined = startData?.questions;

              if (Array.isArray(startQuestions) && startQuestions.length > 0) {
                const quiz = parseLessonQuizResponse({
                  ...startData,
                  quiz_id: resolvedQuizId,
                });
                setProgress(100);
                setStatusText("تم تجهيز الاختبار!");
                setTimeout(() => onQuizReady?.(quiz), 400);
                return;
              }

              // Fallback: fetch from user-quizzes list
              const listData = await api.get<any>("/api/v1/quiz/user_quizzes");
              const allQuizzes: any[] =
                listData?.quizes ?? listData?.quizzes ?? listData?.data ?? [];
              const found = allQuizzes.find(
                (q: any) => String(q.quiz_id) === String(resolvedQuizId)
              );

              const rawQuestions: any[] =
                found?.questions ?? found?.question_results ?? [];

              if (rawQuestions.length === 0) {
                setError("لم يتم العثور على أسئلة. يرجى المحاولة مجدداً.");
                return;
              }

              const quiz = parseLessonQuizResponse({
                quiz_id: resolvedQuizId,
                questions: rawQuestions,
                total_questions: rawQuestions.length,
                quiz_metadata: found?.quiz_metadata,
              });
              setProgress(100);
              setStatusText("تم تجهيز الاختبار!");
              setTimeout(() => onQuizReady?.(quiz), 400);
            } catch {
              // keep polling on transient errors
            }
          }, 2000);
        } else {
          // ── Basic quiz: lesson-quiz → start → onQuizReady ────────────────
          const body: Record<string, unknown> = {};
          if (lessonId) body.lesson_id = lessonId;
          if (unitId) body.unit_id = unitId;

          setStatusText("جاري تحضير أسئلة الاختبار من الدرس...");
          const data = await api.post<any>("/api/v1/quiz/lesson-quiz", body);

          const quizId =
            data?.quiz_id ?? data?.data?.quiz_id ?? data?.id ?? data?.data?.id;

          if (!quizId) {
            clearInterval(progressInterval);
            setError("حدث خطأ أثناء إنشاء الاختبار. حاول مجدداً.");
            return;
          }

          // Call /start before handing quiz to the taking screen
          setStatusText("جاري بدء الاختبار...");
          setProgress(70);
          try {
            await api.post(`/api/v1/quiz/${quizId}/start`, {});
          } catch {
            // Non-fatal: proceed even if start call fails
          }

          if (onQuizReady) {
            const quizData = parseLessonQuizResponse({
              ...data,
              quiz_id: quizId,
            });
            clearInterval(progressInterval);
            setProgress(100);
            setStatusText("تم تجهيز الاختبار!");
            setTimeout(() => onQuizReady(quizData), 500);
          }
        }
      } catch {
        clearInterval(progressInterval);
        setError("حدث خطأ في الاتصال. تحقق من الإنترنت وحاول مجدداً.");
      }
    }

    createAndRedirect();

    return () => {
      clearInterval(progressInterval);
    };
  }, []); // eslint-disable-line

  return (
    <div
      style={{
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          background: cardBg,
          borderRadius: "32px",
          padding: "48px 40px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: isDark
            ? "0 4px 32px rgba(0,0,0,0.30)"
            : "0 4px 32px rgba(105,72,184,0.12)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(105,72,184,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Robot mascot with sparkle decorations */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          {/* Top-left sparkle */}
          <svg
            style={{ position: "absolute", top: "-8px", right: "-24px" }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"
              fill={isDark ? "#D4BDFF" : "#A78BFA"}
            />
          </svg>
          {/* Top-right sparkle */}
          <svg
            style={{ position: "absolute", top: "-8px", left: "-24px" }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"
              fill={isDark ? "#D4BDFF" : "#A78BFA"}
            />
          </svg>

          <RobotMascot />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(20px, 3vw, 28px)",
              fontWeight: 700,
              color: titleColor,
              marginBottom: "8px",
              lineHeight: "150%",
            }}
          >
            {quizCategory === "smart"
              ? "المعلم الذكي يُعِدّ اختباراً مخصصاً لك!"
              : "جاري تجهيز الاختبار الأساسي!"}
          </h2>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "15px",
              color: subColor,
              lineHeight: "160%",
            }}
          >
            {statusText}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%" }}>
          <div
            style={{
              height: "10px",
              borderRadius: "100px",
              background: isDark
                ? "rgba(255,255,255,0.10)"
                : "rgba(105,72,184,0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                borderRadius: "100px",
                background: "linear-gradient(90deg, #6948B8 0%, #9B59D4 100%)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: "6px",
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "13px",
              color: subColor,
            }}
          >
            {progress}%
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.10)",
              border: "1.5px solid rgba(239,68,68,0.30)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "14px",
                color: "#EF4444",
              }}
            >
              {error}
            </span>
          </div>
        )}

        {/* Note card */}
        {!error && (
          <div
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: "16px",
              background: noteBg,
              border: `1px solid ${noteBorder}`,
              direction: "rtl",
            }}
          >
            <p
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "13px",
                fontWeight: 700,
                color: isDark ? "#D4BDFF" : "#5531A8",
                marginBottom: "6px",
              }}
            >
              ملاحظة:
            </p>
            <p
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "13px",
                color: isDark
                  ? "rgba(212,189,255,0.75)"
                  : "rgba(85,49,168,0.70)",
                lineHeight: "160%",
                margin: 0,
              }}
            >
              قد يستغرق إنشاء الاختبار القليل من الوقت. يمكنك استكشاف الصفحات
              الأخرى وسنخبرك عندما يصبح جاهزاً!
            </p>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            width: "100%",
            padding: "14px 24px",
            borderRadius: "16px",
            background: "var(--quiz-purple, #6948B8)",
            border: "none",
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "17px",
            fontWeight: 700,
            color: "#FFFFFF",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          العودة للصفحة الرئيسية!
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import type { SystemMode } from "@core/types";
import QuizDashboard from "./QuizDashboard";
import type { QuizRecord } from "./QuizDashboard";
import QuizCreateWizard from "./QuizCreateWizard";
import type { PrepareParams } from "./QuizCreateWizard";
import {
  QuizLoadingScreen,
  QuizTakingScreen,
  QuizResultsScreen,
} from "./QuizScreens";
import type { QuizData, StudentAnswer } from "./QuizScreens";
import PrepareQuizScreen from "@/views/apps/journey/PrepareQuizScreen";
import DecorativeElements from "@/views/DecorativeElements";

type Screen =
  | "dashboard"
  | "create"
  | "prepare"
  | "loading"
  | "taking"
  | "results";

interface Props {
  mode: SystemMode;
}

export default function QuizView({ mode }: Props) {
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === "dark";

  const [screen, setScreen] = useState<Screen>("dashboard");
  const [pendingQuizId, setPendingQuizId] = useState<string | null>(null);
  const [isAsyncJob, setIsAsyncJob] = useState(false);
  const [pendingQuizRecord, setPendingQuizRecord] = useState<QuizRecord | null>(
    null
  );
  const [prepareParams, setPrepareParams] = useState<PrepareParams | null>(
    null
  );
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<StudentAnswer[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);

  function handleStartQuiz(quiz: QuizRecord) {
    if (quiz.status === "completed" && quiz.question_results?.length) {
      // Build QuizData directly from the stored quiz record
      const mappedQuestions = quiz.question_results.map((q) => ({
        question_id: q.question_id,
        question_text: q.question_text,
        question_type: "text" as const,
        options: [] as string[],
        concept: q.concept,
        difficulty: q.difficulty,
      }));
      const quizData: QuizData = {
        quiz_id: quiz.quiz_id,
        questions: mappedQuestions,
        total_questions: mappedQuestions.length,
        quiz_metadata: {
          subject: quiz.subject_name_en,
          grade: String(quiz.grade_id),
          term: String(quiz.term_id),
          quiz_type: "text",
        },
        estimated_duration_minutes: 0,
      };
      const answers: StudentAnswer[] = quiz.question_results.map((q) => ({
        question_id: q.question_id,
        student_answer: q.student_answer,
        time_spent_seconds: q.time_spent_seconds,
      }));
      const totalSec = quiz.question_results.reduce(
        (s, q) => s + (q.time_spent_seconds ?? 0),
        0
      );
      setActiveQuiz(quizData);
      setQuizAnswers(answers);
      setTotalSeconds(totalSec);
      setScreen("results");
    } else {
      setPendingQuizId(quiz.quiz_id);
      setPendingQuizRecord(quiz);
      setIsAsyncJob(false);
      setScreen("loading");
    }
  }

  function handleQuizReady(quiz: QuizData) {
    setActiveQuiz(quiz);
    setScreen("taking");
  }

  function handleQuizFinish(answers: StudentAnswer[], seconds: number) {
    setQuizAnswers(answers);
    setTotalSeconds(seconds);
    setScreen("results");
  }

  function handlePrepare(params: PrepareParams) {
    setPrepareParams(params);
    setScreen("prepare");
  }

  function handleBack() {
    setScreen("dashboard");
    setPendingQuizId(null);
    setPendingQuizRecord(null);
    setIsAsyncJob(false);
    setPrepareParams(null);
    setActiveQuiz(null);
    setQuizAnswers([]);
    setTotalSeconds(0);
  }

  /** Sync quiz_id returned immediately from create */
  function handleCreated(quizId: string) {
    setPendingQuizId(quizId);
    setIsAsyncJob(false);
    setScreen("loading");
  }

  /** Async job_id: needs polling in the loading screen */
  function handleCreatedAsync(jobId: string) {
    setPendingQuizId(jobId);
    setIsAsyncJob(true);
    setScreen("loading");
  }

  return (
    <div
      className="page-bg"
      dir="rtl"
    >
      <DecorativeElements currentMode={isDark ? "dark" : "light"} />

      {screen === "dashboard" && (
        <div className="page-container">
          <QuizDashboard
            isDark={isDark}
            onCreateQuiz={() => setScreen("create")}
            onStartQuiz={handleStartQuiz}
          />
        </div>
      )}

      {screen === "create" && (
        <QuizCreateWizard
          isDark={isDark}
          onBack={handleBack}
          onCreated={handleCreated}
          onCreatedAsync={handleCreatedAsync}
          onCreatedWithData={(quiz) => {
            setActiveQuiz(quiz);
            setScreen("taking");
          }}
          onPrepare={handlePrepare}
        />
      )}

      {screen === "prepare" && prepareParams && (
        <PrepareQuizScreen
          isDark={isDark}
          subjectId={prepareParams.subjectId}
          gradeId={prepareParams.gradeId}
          unitId={prepareParams.unitId}
          lessonId={prepareParams.lessonId}
          quizCategory={prepareParams.quizCategory}
          onBack={handleBack}
          onQuizReady={handleQuizReady}
        />
      )}

      {screen === "loading" && pendingQuizId && (
        <div className="page-container-narrow">
          <QuizLoadingScreen
            isDark={isDark}
            quizId={pendingQuizId}
            isAsyncJob={isAsyncJob}
            quizRecord={pendingQuizRecord ?? undefined}
            onReady={handleQuizReady}
            onBack={handleBack}
          />
        </div>
      )}

      {screen === "taking" && activeQuiz && (
        <div className="page-container">
          <QuizTakingScreen
            isDark={isDark}
            quiz={activeQuiz}
            onFinish={handleQuizFinish}
            onBack={handleBack}
          />
        </div>
      )}

      {screen === "results" && activeQuiz && (
        <div className="page-container">
          <QuizResultsScreen
            isDark={isDark}
            quiz={activeQuiz}
            answers={quizAnswers}
            totalSeconds={totalSeconds}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}

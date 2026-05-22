"use client";

import React from "react";
import { Summary } from "./type";

// ─── Speed card ────────────────────────────────────────────────────────────────

function SpeedCard({ avgTime }: { avgTime: number }) {
  const minutes = avgTime < 1 ? Math.round(avgTime * 60) : Math.round(avgTime);
  const unit = avgTime < 1 ? "ثانية" : "دقيقة";

  return (
    <div
      className="quiz-card"
      dir="rtl"
      style={{ flex: 1 }}
    >
      <h3
        className="stats-section-title"
        style={{ fontSize: 16 }}
      >
        سرعة إجابتك
      </h3>
      <p
        className="stats-section-sub"
        style={{ marginBottom: 20 }}
      >
        متوسط سرعتك في حل الأسئلة
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            background: "var(--quiz-purple)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "var(--quiz-font)",
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
            {minutes}
          </span>
          <span style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Mission card ──────────────────────────────────────────────────────────────

// Icon for book
const IconBook = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 19.5A2.5 2.5 0 016.5 17H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

interface MissionCardProps {
  mission: {
    subject_name_ar: string;
    total_questions: number;
    answered_questions: number;
    date: string;
  } | null;
}

function MissionCard({ mission }: MissionCardProps) {
  return (
    <div
      className="quiz-card"
      dir="rtl"
      style={{ flex: 1 }}
    >
      <h3
        className="stats-section-title"
        style={{ fontSize: 16 }}
      >
        إكمال المسيرة
      </h3>
      <p
        className="stats-section-sub"
        style={{ marginBottom: 16 }}
      >
        لا تتركها عالقة في المنتصف
      </p>

      {mission ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 14,
            background: "var(--stats-mission-row-bg)",
            border: "1.5px solid var(--stats-mission-row-border)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--stats-red-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--stats-red)",
              flexShrink: 0,
            }}
          >
            <IconBook />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--quiz-title)",
              }}
            >
              {mission.subject_name_ar}
            </div>
            <div
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: 12,
                color: "var(--quiz-sub)",
                marginTop: 2,
              }}
            >
              {new Date(mission.date).toLocaleDateString("ar-SA")} &mdash;{" "}
              {mission.total_questions} سؤال &bull; أجبت{" "}
              {mission.answered_questions} من {mission.total_questions}
            </div>
          </div>
        </div>
      ) : (
        <p
          style={{
            color: "var(--quiz-sub)",
            fontFamily: "var(--quiz-font)",
            fontSize: 14,
          }}
        >
          لا توجد مهمة جارية
        </p>
      )}

      {mission && (
        <button
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: "var(--quiz-purple)",
            fontFamily: "var(--quiz-font)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          عرض الكل &larr;
        </button>
      )}
    </div>
  );
}

// ─── Correct answers card ──────────────────────────────────────────────────────

function CorrectAnswersCard({ count }: { count: number }) {
  return (
    <div
      className="quiz-card"
      dir="rtl"
      style={{ flex: 1 }}
    >
      <h3
        className="stats-section-title"
        style={{ fontSize: 16 }}
      >
        إجاباتك الصحيحة
      </h3>
      <p
        className="stats-section-sub"
        style={{ marginBottom: 20 }}
      >
        عدد إجاباتك الصحيحة
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            background: "var(--stats-green)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "var(--quiz-font)",
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
            {count}
          </span>
          <span style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
            إجابة صحيحة
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Exports ───────────────────────────────────────────────────────────────────

export { SpeedCard, MissionCard, CorrectAnswersCard };

interface ExtraSummaryCardsProps {
  summary: Summary;
}

export default function ExtraSummaryCards({ summary }: ExtraSummaryCardsProps) {
  return (
    <div
      className="stats-extra-grid"
      dir="ltr"
    >
      <SpeedCard avgTime={summary.average_response_time} />
      <MissionCard mission={summary.ongoing_mission} />
      <CorrectAnswersCard count={summary.correct_answers_count} />
    </div>
  );
}

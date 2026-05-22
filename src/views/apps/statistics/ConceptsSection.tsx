"use client";

import React, { useState } from "react";
import { SubjectBreakdown } from "./type";

// ─── Subject icons by ID ────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<
  string,
  { bg: string; color: string; letter: string }
> = {
  "Digital Skills": {
    bg: "rgba(139,92,246,0.12)",
    color: "#8B5CF6",
    letter: "د",
  },
  "Arabic Language": {
    bg: "rgba(16,185,129,0.12)",
    color: "#10B981",
    letter: "ع",
  },
  Mathematics: { bg: "rgba(105,72,184,0.12)", color: "#6948B8", letter: "ر" },
  "Islamic Studies": {
    bg: "rgba(239,68,68,0.12)",
    color: "#EF4444",
    letter: "إ",
  },
  Science: { bg: "rgba(59,130,246,0.12)", color: "#3B82F6", letter: "ع" },
  "Social Studies": {
    bg: "rgba(249,115,22,0.12)",
    color: "#F97316",
    letter: "ا",
  },
  "Life Skills": { bg: "rgba(236,72,153,0.12)", color: "#EC4899", letter: "م" },
};

function subjectIcon(subject: string) {
  return (
    SUBJECT_ICONS[subject] ?? {
      bg: "rgba(105,72,184,0.12)",
      color: "#6948B8",
      letter: "م",
    }
  );
}

// ─── Chevron icon ───────────────────────────────────────────────────────────────

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
        flexShrink: 0,
      }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Lesson accordion row ────────────────────────────────────────────────────────

interface LessonRowProps {
  lessonTitle: string;
  accuracy: number;
  questionCount: number;
  concepts: { concept_name: string; accuracy: number; total: number }[];
  barColor: string;
}

function LessonRow({
  lessonTitle,
  accuracy,
  questionCount,
  concepts,
  barColor,
}: LessonRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid var(--stats-concept-row-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          direction: "rtl",
          fontFamily: "var(--quiz-font)",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <ChevronDown open={open} />
          <span
            style={{
              background: accuracy <= 30 ? "var(--stats-red-badge-bg)" : "var(--stats-green-badge-bg)",
              color: accuracy <= 30 ? "var(--stats-red-badge)" : "var(--stats-green-badge)",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            {questionCount} درس
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--quiz-font)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--quiz-title)",
            textAlign: "right",
            flex: 1,
          }}
        >
          {lessonTitle}
        </span>
      </button>

      {/* Concepts list */}
      {open && (
        <div
          style={{
            padding: "0 14px 12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {concepts.map((c, i) => (
            <div
              key={i}
              style={{ direction: "rtl" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                  fontFamily: "var(--quiz-font)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--quiz-title)", fontWeight: 500 }}>
                  {c.concept_name}
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: barColor,
                  }}
                >
                  {Math.round(c.accuracy)}%
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 7,
                  background: "var(--quiz-purple-light)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 7,
                    background: barColor,
                    width: `${c.accuracy}%`,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 11,
                  color: "var(--quiz-sub)",
                  marginTop: 2,
                }}
              >
                {c.total} سؤال
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subject accordion ────────────────────────────────────────────────────────

interface SubjectAccordionProps {
  subjectBreakdown: SubjectBreakdown;
  barColor: string;
}

function SubjectAccordion({
  subjectBreakdown,
  barColor,
}: SubjectAccordionProps) {
  const [open, setOpen] = useState(false);
  const icon = subjectIcon(subjectBreakdown.subject_name);
  const totalLessons = subjectBreakdown.lessons.length;

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Subject header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "var(--stats-subject-row-bg)",
          border: "1.5px solid var(--stats-subject-row-border)",
          borderRadius: 12,
          cursor: "pointer",
          direction: "rtl",
          fontFamily: "var(--quiz-font)",
          gap: 8,
          marginBottom: open ? 8 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ChevronDown open={open} />
          <span
            style={{
              background: "var(--stats-red-badge-bg)",
              color: "var(--stats-red-badge)",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {totalLessons} درس
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--quiz-font)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--quiz-title)",
            }}
          >
            {subjectBreakdown.subject_name_ar}
          </span>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: icon.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: icon.color,
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "var(--quiz-font)",
            }}
          >
            {icon.letter}
          </div>
        </div>
      </button>

      {/* Lessons */}
      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            paddingRight: 8,
          }}
        >
          {subjectBreakdown.lessons.map((lesson) => (
            <LessonRow
              key={lesson.lesson_id}
              lessonTitle={lesson.lesson_title}
              accuracy={lesson.overall_accuracy}
              questionCount={lesson.lesson_total_questions}
              concepts={lesson.concepts}
              barColor={barColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────────

interface ConceptsSectionProps {
  weaknesses: SubjectBreakdown[];
  strengths: SubjectBreakdown[];
}

export default function ConceptsSection({
  weaknesses,
  strengths,
}: ConceptsSectionProps) {
  return (
    <div
      className="stats-concepts-two-col"
      dir="ltr"
    >
      {/* Weaknesses */}
      <div className="quiz-card">
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <h2 className="stats-section-title">المفاهيم الضعيفة</h2>
          <p className="stats-section-sub">أهم المفاهيم التي بحاجة إلى تحسين</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {weaknesses.map((subj) => (
            <SubjectAccordion
              key={subj.subject_id}
              subjectBreakdown={subj}
              barColor="#EF4444"
            />
          ))}
          {weaknesses.length === 0 && (
            <p
              style={{
                color: "var(--quiz-sub)",
                fontFamily: "var(--quiz-font)",
                fontSize: 14,
              }}
            >
              لا توجد مفاهيم ضعيفة
            </p>
          )}
        </div>
      </div>

      {/* Strengths */}
      <div className="quiz-card">
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <h2 className="stats-section-title">المفاهيم المتقنة</h2>
          <p className="stats-section-sub">أهم المفاهيم التي أتقنتها</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {strengths.map((subj) => (
            <SubjectAccordion
              key={subj.subject_id}
              subjectBreakdown={subj}
              barColor="#10B981"
            />
          ))}
          {strengths.length === 0 && (
            <p
              style={{
                color: "var(--quiz-sub)",
                fontFamily: "var(--quiz-font)",
                fontSize: 14,
              }}
            >
              لا توجد مفاهيم متقنة بعد
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Summary } from "./type";

// ─── Icons ─────────────────────────────────────────────────────────────────────

const IconClock = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 7v5l3 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconQuiz = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 12h6M9 16h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconStar = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconChat = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Individual mini card ──────────────────────────────────────────────────────

interface MiniCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
}

function MiniCard({ icon, label, value, iconBg, iconColor }: MiniCardProps) {
  return (
    <div
      className="stats-card"
      dir="rtl"
    >
      <div
        className="stats-icon-wrap"
        style={{ background: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <span
        className="stats-card-value"
        style={{ color: iconColor }}
      >
        {value}
      </span>
      <span className="stats-card-label">{label}</span>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SummaryCardsProps {
  summary: Summary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const avg = Math.round(summary.overall_average_score);
  const hours = Math.round(summary.study_time_hours);
  const questions = summary.total_questions_answered;
  const chats = summary.chats_count;

  return (
    <div
      className="stats-cards-grid"
      dir="ltr"
    >
      <MiniCard
        icon={<IconStar />}
        label="المعدل العام"
        value={`${avg}%`}
        iconBg="var(--stats-amber-bg)"
        iconColor="var(--stats-amber)"
      />
      <MiniCard
        icon={<IconClock />}
        label="وقت التعلم"
        value={`${hours}ساعة`}
        iconBg="var(--stats-violet-bg)"
        iconColor="var(--stats-violet)"
      />
      <MiniCard
        icon={<IconQuiz />}
        label="عدد أسئلة الاختبارات"
        value={`${questions}سؤال`}
        iconBg="var(--stats-green-bg)"
        iconColor="var(--stats-green)"
      />
      <MiniCard
        icon={<IconChat />}
        label="المحادثات مع المعلم الذكي"
        value={`${chats}محادثة`}
        iconBg="var(--stats-blue-bg)"
        iconColor="var(--stats-blue)"
      />
    </div>
  );
}

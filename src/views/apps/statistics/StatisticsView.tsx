"use client";

import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import type { SystemMode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";
import DecorativeElements from "@/views/DecorativeElements";

import type { StatsData, Period } from "./type";
import SummaryCards from "./SummaryCards";
import ProgressLineChart from "./ProgressLineChart";
import BarChartSubjects from "./BarChartSubjects";
import ExtraSummaryCards from "./ExtraSummaryCards";
import ConceptsSection from "./ConceptsSection";

// ─── Period buttons config ──────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: "this_month", label: "الشهر الحالي" },
  { key: "last_month", label: "الشهر الماضي" },
  { key: "all_time", label: "كل الوقت" },
];

// ─── Props ──────────────────────────────────────────────────────────────────────

type Props = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  lang: string;
};

// ─── Main component ────────────────────────────────────────��────────────────────

export default function StatisticsView({ mode }: Props) {
  const [period, setPeriod] = useState<Period>("this_month");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get<StatsData>(`/api/v1/dashboard/statistics`, { params: { period } })
      .then((d) => setData(d))
      .catch(() => {
        setData(null);
        setError("تعذّر تحميل الإحصائيات، يرجى المحاولة لاحقاً.");
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div
      className="page-bg"
      dir="rtl"
    >
      <DecorativeElements currentMode={mode} />

      <div className="page-container">
        {/* ── Header ── */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 className="stats-title">إحصائيات الأبطال!</h1>
          <p className="stats-subtitle">شاهد كيف تتطور مهاراتك</p>

          {/* Period filter tabs — pill group matching the image */}
          <div className="stats-period-tabs">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`stats-period-btn${period === p.key ? " active" : ""}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </header>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="quiz-card stats-skeleton"
                style={{ height: 120 }}
              />
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {!loading && data && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* 1. Stat cards */}
            <SummaryCards summary={data.summary} />

            {/* 2. Line chart (تطور مستواك) + side donut card side-by-side */}
            {data.performance_over_time.length > 0 && (
              <ProgressLineChart
                data={data.performance_over_time}
                subjects={data.performance_by_subject}
              />
            )}

            {/* 4. Bar chart by subject */}
            {data.performance_by_subject.length > 0 && (
              <BarChartSubjects subjects={data.performance_by_subject} />
            )}

            {/* 5. Speed / Mission / Correct answers */}
            <ExtraSummaryCards summary={data.summary} />

            {/* 6. Weak & Strong concepts */}
            <ConceptsSection
              weaknesses={data.top_weakness_by_subject}
              strengths={data.top_strength_by_subject}
            />
          </div>
        )}

        {/* ── Error / empty state ── */}
        {!loading && !data && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <p className="stats-subtitle">
              {error ?? "لا توجد إحصائيات بعد. ابدأ اختباراتك الآن!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

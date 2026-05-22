"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { subjectColor, SubjectPerf } from "./type";

interface BarChartSubjectsProps {
  subjects: SubjectPerf[];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--quiz-card-bg)",
        border: "1.5px solid var(--quiz-card-border)",
        borderRadius: 12,
        padding: "8px 14px",
        fontFamily: "var(--quiz-font)",
        fontSize: 13,
        direction: "rtl",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
      }}
    >
      <p style={{ color: "var(--quiz-sub)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ color: "var(--quiz-purple)", fontWeight: 700, margin: 0 }}>
        {Math.round(payload[0].value)}%
      </p>
    </div>
  );
}

export default function BarChartSubjects({ subjects }: BarChartSubjectsProps) {
  const barData = subjects.map((s) => ({
    name: s.subject_name_ar,
    score: Math.round(s.average_score),
    color: subjectColor(s.subject),
  }));

  return (
    <div
      className="quiz-card"
      dir="rtl"
    >
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 className="stats-section-title">متوسط درجاتك حسب المواد</h2>
        <p className="stats-section-sub">
          متوسط درجاتك بالاختبارات خلال الفترة المحددة
        </p>
      </div>
      <div style={{ height: 260, marginTop: 24 }}>
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={barData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(105,72,184,0.1)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{
                fontFamily: "var(--quiz-font)",
                fontSize: 12,
                fill: "var(--quiz-sub)",
              }}
              tickLine={false}
              axisLine={{ stroke: "rgba(105,72,184,0.15)" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{
                fontFamily: "var(--quiz-font)",
                fontSize: 11,
                fill: "var(--quiz-sub)",
              }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="score"
              radius={[8, 8, 0, 0]}
              maxBarSize={56}
            >
              {barData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

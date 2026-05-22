"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import type { SubjectPerf } from "./type";
import { subjectColor } from "./type";

interface ActivityDistributionProps {
  subjects: SubjectPerf[];
}

/** Custom active shape – renders the hovered slice slightly enlarged with a label */
function renderActiveShape(props: any) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;

  return (
    <g>
      {/* Enlarged sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
      />
      {/* Center tooltip: name + value */}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="var(--quiz-purple)"
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill="var(--quiz-purple)"
        style={{
          fontFamily: "var(--quiz-font)",
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        {payload.value}
      </text>
    </g>
  );
}

export default function ActivityDistribution({
  subjects,
}: ActivityDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const donutData = subjects.map((s) => ({
    name: s.subject_name_ar,
    value: s.quizzes_taken,
    color: subjectColor(s.subject),
  }));

  const totalSubjects = subjects.length;

  return (
    <div
      className="quiz-card"
      dir="rtl"
    >
      {/* Header */}
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <h2 className="stats-section-title">توزيع النشاط</h2>
        <p className="stats-section-sub">نشاطك حسب المواد الدراسية</p>
      </div>

      {/* Donut chart */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ position: "relative", width: 180, height: 180 }}>
          <ResponsiveContainer
            width={180}
            height={180}
          >
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={5}
                startAngle={90}
                endAngle={-270}
                activeIndex={activeIndex ?? undefined}
                activeShape={
                  activeIndex !== null ? renderActiveShape : undefined
                }
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                stroke="none"
              >
                {donutData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    style={{ cursor: "pointer", outline: "none" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center label overlay – shown when nothing is hovered */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              transition: "opacity 0.15s",
              opacity: activeIndex === null ? 1 : 0,
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "var(--quiz-purple)",
                lineHeight: 1,
                fontFamily: "var(--quiz-font)",
              }}
            >
              {totalSubjects}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--quiz-sub)",
                marginTop: 4,
                fontFamily: "var(--quiz-font)",
              }}
            >
              مواد
            </div>
          </div>
        </div>
      </div>

      {/* Legend — 2-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px 24px",
          direction: "rtl",
        }}
      >
        {donutData.map((item, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: item.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--quiz-font)",
                fontSize: 12,
                color: "var(--quiz-title)",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

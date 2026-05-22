"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SubjectPerf, TimePoint } from "./type";
import ActivityDistribution from "./ActivityDistribution";

interface ProgressLineChartProps {
  data: TimePoint[];
  subjects: SubjectPerf[];
  title?: string;
  subtitle?: string;
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
      <p style={{ color: "var(--quiz-sub)", margin: "0 0 4px" }}>
        اختبار {label}
      </p>
      <p style={{ color: "var(--quiz-purple)", fontWeight: 700, margin: 0 }}>
        {Math.round(payload[0].value)}%
      </p>
    </div>
  );
}

export default function ProgressLineChart({
  data,
  subjects,
  title = "تطور مستواك",
  subtitle = "تقدم درجاتك بالاختبارات خلال الشهر الحالي",
}: ProgressLineChartProps) {
  const chartData = data.map((p, i) => ({
    name: i + 1,
    score: p.percentage,
  }));

  return (
    <div
      className="stats-activity-line-row"
      dir="rtl"
    >
      {/* Activity donut card on the left */}
      <div
        style={{ width: 260, flexShrink: 0 }}
        dir="rtl"
      >
        <ActivityDistribution subjects={subjects} />
      </div>

      {/* Area chart card on the right (takes remaining space) */}
      <div
        className="quiz-card"
        style={{ flex: 1, minWidth: 0 }}
        dir="rtl"
      >
        <div style={{ textAlign: "right", marginBottom: 8 }}>
          <h2 className="stats-section-title">{title}</h2>
          <p className="stats-section-sub">{subtitle}</p>
        </div>

        <div style={{ height: 280, marginTop: 16 }}>
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="statsAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#8B6ED4"
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="95%"
                    stopColor="#8B6ED4"
                    stopOpacity={0.01}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="0"
                stroke="rgba(105,72,184,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fontFamily: "var(--quiz-font)",
                  fontSize: 11,
                  fill: "var(--quiz-sub)",
                }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                domain={[0, 100]}
                hide
              />

              <Tooltip content={<ChartTooltip />} />

              <Area
                type="monotoneX"
                dataKey="score"
                stroke="#7C5CC4"
                strokeWidth={2.5}
                fill="url(#statsAreaGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#7C5CC4",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  bgIcon?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  accent,
  bgIcon,
}: StatCardProps) {
  return (
    <div
      className="stats-card"
      dir="rtl"
    >
      <div
        className="stats-icon-wrap"
        style={{ background: bgIcon ?? `${accent}1A` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <span
        className="stats-card-value"
        style={{ color: accent }}
      >
        {value}
      </span>
      <span className="stats-card-label">{label}</span>
    </div>
  );
}

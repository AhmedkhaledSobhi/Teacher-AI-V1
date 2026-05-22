"use client";

import { useState } from "react";
import type { TeacherPersona } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  isDark: boolean;
  selectedPersona?: TeacherPersona;
  onSelect: (persona: TeacherPersona) => void;
}

interface PersonaCard {
  id: TeacherPersona;
  nameFirst: string;
  nameLast: string;
  title: string;
  free: boolean;
  image: string;
  accentColor: string;
}

// ─── Persona data ─────────────────────────────────────────────────────────────

const PERSONAS: PersonaCard[] = [
  {
    id: "Safa",
    nameFirst: "المعلمة",
    nameLast: "صفا",
    title: "مهندسة التقنية والابتكار",
    free: false,
    image: "/images/personas/Safa.png",
    accentColor: "#E040FB",
  },
  {
    id: "Shifa",
    nameFirst: "المعلمة",
    nameLast: "شفاء",
    title: "فنانة القصص والألوان",
    free: true,
    image: "/images/personas/Shifaa.png",
    accentColor: "#E040FB",
  },
  {
    id: "Omar",
    nameFirst: "المعلم",
    nameLast: "عمر",
    title: "كابتن الألعاب والتحديات",
    free: false,
    image: "/images/personas/Omar.png",
    accentColor: "#E040FB",
  },
  {
    id: "Ahmad",
    nameFirst: "المعلم",
    nameLast: "أحمد",
    title: "بطل المغامرات والكشتات",
    free: true,
    image: "/images/personas/Ahmed.png",
    accentColor: "#E040FB",
  },
];

// ─── Lock icon ────────────────────────────────────────────────────────────────

const LockIcon = () => (
  <svg
    width="11"
    height="13"
    viewBox="0 0 11 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.75 5.5H8.25V3.75C8.25 2.23 7.02 1 5.5 1C3.98 1 2.75 2.23 2.75 3.75V5.5H2.25C1.56 5.5 1 6.06 1 6.75V11.25C1 11.94 1.56 12.5 2.25 12.5H8.75C9.44 12.5 10 11.94 10 11.25V6.75C10 6.06 9.44 5.5 8.75 5.5ZM5.5 9.75C4.81 9.75 4.25 9.19 4.25 8.5C4.25 7.81 4.81 7.25 5.5 7.25C6.19 7.25 6.75 7.81 6.75 8.5C6.75 9.19 6.19 9.75 5.5 9.75ZM7.25 5.5H3.75V3.75C3.75 2.79 4.54 2 5.5 2C6.46 2 7.25 2.79 7.25 3.75V5.5Z"
      fill="currentColor"
    />
  </svg>
);

// ─── Individual card ──────────────────────────────────────────────────────────

function PersonaCardItem({
  persona,
  isDark,
  onSelect,
}: {
  persona: PersonaCard;
  isDark: boolean;
  onSelect: (id: TeacherPersona) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF";
  const borderColor =
    hovered && persona.free
      ? isDark
        ? "rgba(105,72,184,0.60)"
        : "rgba(105,72,184,0.35)"
      : isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(105,72,184,0.10)";
  const boxShadow =
    hovered && persona.free
      ? `0 8px 40px 0 rgba(105,72,184,0.18)`
      : "0 2px 16px 0 rgba(0,0,0,0.07)";

  return (
    <div
      role={persona.free ? "button" : undefined}
      tabIndex={persona.free ? 0 : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => persona.free && onSelect(persona.id)}
      onKeyDown={(e) =>
        persona.free && e.key === "Enter" && onSelect(persona.id)
      }
      style={{
        position: "relative",
        borderRadius: "20px",
        background: cardBg,
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        overflow: "hidden",
        cursor: persona.free ? "pointer" : "default",
        opacity: persona.free ? 1 : 0.65,
        transform:
          hovered && persona.free ? "translateY(-4px)" : "translateY(0)",
        transition:
          "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: "360px",
      }}
    >
      {/* Badge */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 2,
          background: persona.free
            ? isDark
              ? "rgba(16,185,129,0.20)"
              : "#DCFCE7"
            : isDark
              ? "rgba(245,158,11,0.20)"
              : "#FEF9C3",
          color: persona.free ? "#16A34A" : "#92400E",
          borderRadius: "100px",
          padding: "3px 10px",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: '"Readex Pro", sans-serif',
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {!persona.free && <LockIcon />}
        {persona.free ? "مجاني" : "قريبا"}
      </div>

      {/* Image area */}
      <div
        style={{
          flex: 1,
          background: isDark ? "rgba(255,255,255,0.03)" : "#F5F0FF",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          minHeight: "220px",
          overflow: "hidden",
        }}
      >
        <img
          src={persona.image}
          alt={`${persona.nameFirst} ${persona.nameLast}`}
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      </div>

      {/* Text section */}
      <div
        style={{
          padding: "20px 18px",
          textAlign: "center",
          direction: "rtl",
        }}
      >
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "14px",
            fontWeight: 400,
            color: isDark ? "rgba(255,255,255,0.55)" : "rgba(62,37,107,0.55)",
            margin: "0 0 4px",
          }}
        >
          {persona.nameFirst}
        </p>
        <h3
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "22px",
            fontWeight: 700,
            color: persona.accentColor,
            margin: "0 0 6px",
          }}
        >
          {persona.nameLast}
        </h3>
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "13px",
            fontWeight: 400,
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(62,37,107,0.5)",
            margin: 0,
          }}
        >
          {persona.title}
        </p>
      </div>
    </div>
  );
}

// ─── Main PersonaStep ─────────────────────────────────────────────────────────

export default function PersonaStep({
  isDark,
  selectedPersona,
  onSelect,
}: Props) {
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subtitleColor = isDark ? "rgba(245,240,255,0.65)" : "#5531A8";

  return (
    <div dir="rtl">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <h2
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "clamp(22px, 3vw, 34px)",
            fontWeight: 700,
            color: titleColor,
            margin: "0 0 10px",
          }}
        >
          مين حابب يشرحلك الدرس اليوم؟
        </h2>
        <p
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "clamp(14px, 1.8vw, 18px)",
            fontWeight: 400,
            color: subtitleColor,
            margin: 0,
          }}
        >
          اختار معلمك المفضل وخلينا نبدأ رحلة التعلم!
        </p>
      </div>

      {/* Cards grid — 4 columns on desktop, 2 on tablet, 1 on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
        }}
        className="persona-grid"
      >
        {PERSONAS.map((p) => (
          <PersonaCardItem
            key={p.id}
            persona={p}
            isDark={isDark}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Premium banner */}
      <div
        style={{
          marginTop: "24px",
          borderRadius: "20px",
          background: isDark
            ? "linear-gradient(90deg, #2D1B69 0%, #4B1D96 100%)"
            : "linear-gradient(90deg, #4B3FA0 0%, #9B59B6 100%)",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          direction: "rtl",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Lock badge */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255,255,255,0.18)",
            color: "#FFF",
            borderRadius: "100px",
            padding: "3px 10px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: '"Readex Pro", sans-serif',
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <LockIcon />
          مميز
        </div>

        <div>
          <h3
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(18px, 2.5vw, 28px)",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 6px",
            }}
          >
            اصنع شخصية معلمك الخاص!
          </h3>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(13px, 1.4vw, 16px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.75)",
              margin: 0,
            }}
          >
            صمم شخصية معلمك على ذوقك واختار أسلوبه وفق تفضيلاتك
          </p>
        </div>

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            left: "-30px",
            bottom: "-30px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "60px",
            bottom: "-50px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

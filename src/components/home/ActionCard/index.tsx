"use client";

import { useState } from "react";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  hoverBorderColor: string;
  decorCircleColor: string;
  isDark?: boolean;
  disabled?: boolean;
  locale?: string;
  onClick?: () => void;
}

const ActionCard = ({
  icon,
  title,
  description,
  iconBg,
  hoverBorderColor,
  decorCircleColor,
  isDark = false,
  disabled = false,
  locale = "en",
  onClick,
}: ActionCardProps) => {
  const [hovered, setHovered] = useState(false);
  const fontFamily = locale === "ar" ? '"Readex Pro", sans-serif' : '"Baloo 2", sans-serif';

  const cardBg = isDark ? "#3E256B" : "#FFFFFF";
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const descColor = isDark ? "#D4BDFF" : "#5531A8";
  const borderDefault = isDark
    ? "1.5px solid rgba(255,255,255,0.10)"
    : "1.5px solid rgba(0,0,0,0.06)";

  return (
    <div
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => !disabled && e.key === "Enter" && onClick?.()}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        backgroundColor: cardBg,
        borderRadius: "24px",
        border:
          hovered && !disabled
            ? `1.5px solid ${hoverBorderColor}`
            : borderDefault,
        boxShadow:
          hovered && !disabled
            ? `0 8px 40px 0 ${hoverBorderColor}33`
            : "0 2px 16px 0 rgba(0, 0, 0, 0.07)",
        padding: "28px 24px 32px",
        overflow: "hidden",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        height: "200px",
        minHeight: "200px",
        transition:
          "box-shadow 0.25s ease, transform 0.2s ease, border-color 0.25s ease",
        transform: hovered && !disabled ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Decorative circle bleeds from top-right corner (RTL visual = right) */}
      <div
        style={{
          position: "absolute",
          top: "-48px",
          right: "-48px",
          width: hovered ? "180px" : "130px",
          height: hovered ? "180px" : "130px",
          borderRadius: "50%",
          background: decorCircleColor,
          opacity: hovered && !disabled ? 1 : 0.6,
          transition: "all 0.3s ease",
          pointerEvents: "none",
        }}
      />

      {/* Decorative animated circle — bottom-right corner */}
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "-40px",
          width: hovered && !disabled ? "150px" : "110px",
          height: hovered && !disabled ? "150px" : "110px",
          borderRadius: "50%",
          background: decorCircleColor,
          opacity: hovered && !disabled ? 0.55 : 0.28,
          transition: "width 0.4s ease, height 0.4s ease, opacity 0.4s ease",
          pointerEvents: "none",
          animation: "pulseCircle 2.8s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes pulseCircle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.10); }
        }
      `}</style>

      {/* Icon badge — top-left in DOM = top-right visually (RTL) */}
      <div
        style={{
          position: "absolute",
          top: "30px",
          right: "30px",
          width: "45px",
          height: "45px",
          borderRadius: "14px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.35s ease",
          transform:
            hovered && !disabled
              ? "rotate(15deg) scale(1.08)"
              : "rotate(0deg) scale(1)",
          zIndex: 1,
        }}
      >
        {icon}
      </div>

      {/* Text block — centered at bottom */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "64px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontFamily: fontFamily,
            fontSize: "clamp(20px, 2.5vw, 28px)",
            fontWeight: 700,
            color: titleColor,
            lineHeight: "150%",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: fontFamily,
            fontSize: "clamp(13px, 1.4vw, 16px)",
            fontWeight: 400,
            color: descColor,
            lineHeight: "150%",
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default ActionCard;

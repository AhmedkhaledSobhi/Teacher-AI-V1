"use client";

import { useState, useEffect } from "react";
import type { getDictionary } from "@/utils/getDictionary";
import { BinocularsSVG, ChatBubbleSVG, LockSVG } from "./shared";
import type { Selection } from "./types";

type JourneyDict = Awaited<ReturnType<typeof getDictionary>>["journey"];

// ─── Keyframe injection (once per page) ──────────────────────────────────────

const KEYFRAMES = `
  @keyframes methodCardIn {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes methodCirclePulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.12); }
  }
  @keyframes methodIconBounce {
    0%   { transform: scale(1) rotate(0deg); }
    30%  { transform: scale(1.18) rotate(-6deg); }
    60%  { transform: scale(1.10) rotate(4deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
`;

// ─── MethodCard ───────────────────────────────────────────────────────────────

interface MethodCardProps {
  type: "browse" | "ai";
  title: string;
  desc: string;
  badge: string;
  premiumFooterLabel?: string;
  badgeIsGreen?: boolean;
  unitsBadge?: string;
  /** Solid icon bg for selected state */
  iconBgSelected: string;
  /** Soft icon bg for unselected state */
  iconBgDefault: string;
  iconContent: React.ReactNode;
  /** White icon version for the selected (solid bg) state */
  iconContentSelected?: React.ReactNode;
  /** Theme accent color (border, shadow, circles) */
  accentColor: string;
  /** Decorative circle color */
  circleColor: string;
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
  /** Entrance animation delay in ms */
  animDelay?: number;
}

function MethodCard({
  type,
  title,
  desc,
  badge,
  premiumFooterLabel,
  badgeIsGreen,
  unitsBadge,
  iconBgSelected,
  iconBgDefault,
  iconContent,
  iconContentSelected,
  accentColor,
  circleColor,
  selected,
  onClick,
  isDark,
  animDelay = 0,
}: MethodCardProps) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  const isPremium = type === "ai";

  const cardBg = isDark
    ? selected
      ? "rgba(88,56,165,0.50)"
      : "rgba(255,255,255,0.04)"
    : "#ffffff";

  const borderColor = selected
    ? accentColor
    : isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(105,72,184,0.12)";

  const boxShadow =
    hovered || selected
      ? `0 8px 40px 0 ${accentColor}33`
      : isDark
        ? "0 2px 8px rgba(0,0,0,0.20)"
        : "0 2px 12px rgba(0,0,0,0.04)";

  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const descColor = isDark ? "rgba(255,255,255,0.60)" : "rgba(62,37,107,0.60)";

  // Badge
  const badgeBg = isPremium ? "rgba(220,100,201,0.08)" : "rgba(0,153,102,0.10)";
  const badgeBorder = isPremium
    ? "1px solid rgba(220,100,201,0.30)"
    : "1px solid rgba(0,153,102,0.30)";
  const badgeColor = isPremium ? "#DC64C9" : "#009966";

  // Icon state
  const currentIconBg = selected ? iconBgSelected : iconBgDefault;
  const currentIcon =
    selected && iconContentSelected ? iconContentSelected : iconContent;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        border: `2px solid ${borderColor}`,
        borderRadius: "20px",
        padding: "clamp(20px, 4vw, 24px) clamp(20px, 5vw, 48px)",
        cursor: "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: "clamp(260px, 40vw, 488px)",
        boxShadow,
        transform: mounted
          ? hovered
            ? "translateY(-6px)"
            : "translateY(0)"
          : "translateY(28px)",
        opacity: mounted ? 1 : 0,
        transition: `
          transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
          opacity 0.45s ease ${animDelay}ms,
          border-color 0.25s ease,
          box-shadow 0.3s ease,
          background 0.25s ease
        `,
      }}
    >
      {/* ── Decorative top-right circle ───────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: hovered || selected ? "180px" : "130px",
          height: hovered || selected ? "180px" : "130px",
          borderRadius: "50%",
          background: circleColor,
          opacity: hovered || selected ? 0.55 : 0.25,
          transition: "width 0.35s ease, height 0.35s ease, opacity 0.35s ease",
          pointerEvents: "none",
        }}
      />

      {/* ── Decorative bottom-left circle (animated pulse) ────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "-44px",
          left: "-44px",
          width: hovered || selected ? "160px" : "110px",
          height: hovered || selected ? "160px" : "110px",
          borderRadius: "50%",
          background: circleColor,
          opacity: hovered || selected ? 0.5 : 0.22,
          transition: "width 0.4s ease, height 0.4s ease, opacity 0.4s ease",
          pointerEvents: "none",
          animation: "methodCirclePulse 3s ease-in-out infinite",
        }}
      />

      {/* ── Top badge ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          background: badgeBg,
          border: badgeBorder,
          borderRadius: "100px",
          padding: "4px 10px",
          direction: "rtl",
          zIndex: 1,
        }}
      >
        {isPremium && <LockSVG />}
        <span
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "12px",
            fontWeight: 400,
            color: badgeColor,
            lineHeight: "150%",
          }}
        >
          {badge}
        </span>
      </div>

      {/* ── Icon container ────────────────────────────────────────── */}
      <div
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "22px",
          background: currentIconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          flexShrink: 0,
          zIndex: 1,
          transition: "background 0.3s ease, transform 0.35s ease",
          animation: hovered ? "methodIconBounce 0.55s ease" : "none",
          boxShadow: selected ? `0 4px 16px 0 ${accentColor}44` : "none",
        }}
      >
        {currentIcon}
      </div>

      {/* ── Title ���────────────────────────────────────────────────── */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: isPremium
            ? "clamp(20px, 3vw, 31px)"
            : "clamp(24px, 4vw, 45px)",
          fontWeight: 700,
          color: titleColor,
          lineHeight: "150%",
          direction: "rtl",
          textAlign: "center",
          marginBottom: "10px",
          zIndex: 1,
        }}
      >
        {title}
      </p>

      {/* ── Description ───────────────────────────────────────────── */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "15px",
          fontWeight: 400,
          color: descColor,
          lineHeight: "150%",
          direction: "rtl",
          textAlign: "center",
          marginBottom: unitsBadge ? "20px" : isPremium ? "40px" : "0",
          zIndex: 1,
        }}
      >
        {desc}
      </p>

      {/* ── Units badge (browse only) ──────────────────────────────── */}
      {unitsBadge && (
        <div
          style={{
            background: isDark
              ? "rgba(255,255,255,0.10)"
              : "rgba(105,72,184,0.08)",
            borderRadius: "100px",
            padding: "4px 16px",
            display: "inline-flex",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "12px",
              fontWeight: 400,
              color: isDark ? "#D4BDFF" : "#5531A8",
              direction: "rtl",
            }}
          >
            {unitsBadge}
          </span>
        </div>
      )}

      {/* ── Premium footer pill (AI card only) ────────────────────── */}
      {isPremium && (
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            direction: "rtl",
            background: "rgba(220,100,201,0.08)",
            border: "1px solid rgba(220,100,201,0.25)",
            borderRadius: "100px",
            padding: "6px 16px",
            whiteSpace: "nowrap",
            zIndex: 1,
          }}
        >
          <LockSVG />
          <span
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "13px",
              fontWeight: 400,
              color: "#DC64C9",
            }}
          >
            {premiumFooterLabel ?? badge}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── White icon wrappers (for selected solid-bg state) ────────────────────────

const BinocularsWhiteSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="47"
    height="41"
    viewBox="0 0 47 41"
    fill="none"
  >
    <g clipPath="url(#clip0_bino_w)">
      <path
        d="M19.0361 16.0046H27.0387M37.042 10.0026V4.00066C37.042 3.47005 36.8312 2.96118 36.456 2.58598C36.0808 2.21078 35.572 2 35.0414 2H31.04C30.5094 2 30.0005 2.21078 29.6253 2.58598C29.2501 2.96118 29.0394 3.47005 29.0394 4.00066V10.0026M37.042 10.0026C37.5726 10.0026 38.0815 10.2134 38.4567 10.5886C38.8319 10.9638 39.0427 11.4727 39.0427 12.0033V16.6448C39.0427 20.3801 43.044 23.5251 43.044 26.306V34.0106C43.044 35.0718 42.6224 36.0896 41.872 36.84C41.1216 37.5903 40.1039 38.0119 39.0427 38.0119H31.04C29.9788 38.0119 28.9611 37.5903 28.2107 36.84C27.4603 36.0896 27.0387 35.0718 27.0387 34.0106V12.0033C27.0387 11.4727 27.2495 10.9638 27.6247 10.5886C27.9999 10.2134 28.5088 10.0026 29.0394 10.0026M37.042 10.0026L29.0394 10.0026M43.044 28.0086H3.03076M9.03275 10.0026C8.50214 10.0026 7.99326 10.2134 7.61807 10.5886C7.24287 10.9638 7.03209 11.4727 7.03209 12.0033V16.6448C7.03209 20.3801 3.03076 23.5251 3.03076 26.306V34.0106C3.03076 35.0718 3.45233 36.0896 4.20272 36.84C4.95312 37.5903 5.97087 38.0119 7.03209 38.0119H15.0347C16.0959 38.0119 17.1137 37.5903 17.8641 36.84C18.6145 36.0896 19.0361 35.0718 19.0361 34.0106V12.0033C19.0361 11.4727 18.8253 10.9638 18.4501 10.5886C18.0749 10.2134 17.566 10.0026 17.0354 10.0026M9.03275 10.0026H17.0354M9.03275 10.0026V4.00066C9.03275 3.47005 9.24353 2.96118 9.61873 2.58598C9.99392 2.21078 10.5028 2 11.0334 2H15.0347C15.5653 2 16.0742 2.21078 16.4494 2.58598C16.8246 2.96118 17.0354 3.47005 17.0354 4.00066V10.0026"
        stroke="white"
        strokeWidth="3.75124"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_bino_w">
        <rect
          width="46.0152"
          height="40.0132"
          fill="white"
        />
      </clipPath>
    </defs>
  </svg>
);

const ChatBubbleWhiteSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
  >
    <path
      d="M13.1575 33.3099C16.3362 34.9405 19.9928 35.3822 23.4684 34.5553C26.9439 33.7285 30.0099 31.6875 32.1138 28.8001C34.2176 25.9127 35.221 22.3688 34.9431 18.8071C34.6653 15.2453 33.1244 11.8999 30.5982 9.37373C28.0721 6.84755 24.7267 5.30669 21.1649 5.02883C17.6032 4.75096 14.0593 5.75437 11.1719 7.85822C8.28452 9.96208 6.24349 13.028 5.41663 16.5036C4.58976 19.9792 5.03143 23.6358 6.66205 26.8145L3.33105 36.6409L13.1575 33.3099Z"
      stroke="white"
      strokeWidth="3.33099"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── MethodStep ───────────────────────────────────────────────────────────────

interface MethodStepProps {
  dict: JourneyDict;
  selection: Selection;
  onSelect: (v: string) => void;
  isDark: boolean;
}

export default function MethodStep({
  dict,
  selection,
  onSelect,
  isDark,
}: MethodStepProps) {
  const titleColor = isDark ? "#FFFFFF" : "#3E256B";
  const subColor = isDark ? "#D4BDFF" : "#5531A8";

  // Browse: solid purple (selected) / soft purple (unselected)
  const browseSelected = isDark ? "#5531A8" : "#6948B8";
  const browseDefault = isDark
    ? "rgba(105,72,184,0.18)"
    : "rgba(105,72,184,0.10)";

  // AI: solid pink (selected) / soft pink (unselected)
  const aiSelected = isDark ? "#C44DB0" : "#DC64C9";
  const aiDefault = isDark
    ? "rgba(220,100,201,0.18)"
    : "rgba(220,100,201,0.12)";

  const m = dict.method as any;

  return (
    <div style={{ textAlign: "center" }}>
      <style>{KEYFRAMES}</style>

      {/* Title */}
      <h2
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "clamp(22px, 3.5vw, 45px)",
          fontWeight: 700,
          color: titleColor,
          textAlign: "center",
          marginBottom: "12px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {dict.method.title}
      </h2>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "22px",
          fontWeight: 500,
          color: subColor,
          textAlign: "center",
          marginBottom: "36px",
          lineHeight: "150%",
          direction: "rtl",
        }}
      >
        {dict.method.subtitle}
      </p>

      {/*
        RTL layout: Browse (flex:2, left visually) | AI (flex:1, right visually)
        DOM order is reversed since direction:rtl flips flex children.
        On mobile they stack vertically.
      */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20px",
          width: "100%",
          maxWidth: "1128px",
          margin: "0 auto",
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {/* Browse card — larger */}
        <div style={{ flex: "2 1 min(280px, 100%)" }}>
          <MethodCard
            type="browse"
            title={m.browse ?? dict.method.browse}
            desc={m.browseDesc ?? dict.method.browseDesc}
            badge={m.browseBadge ?? "مجاني"}
            badgeIsGreen
            unitsBadge={m.browseUnits}
            iconBgSelected={browseSelected}
            iconBgDefault={browseDefault}
            iconContent={<BinocularsSVG />}
            iconContentSelected={<BinocularsWhiteSVG />}
            accentColor="#6948B8"
            circleColor={
              isDark ? "rgba(105,72,184,0.30)" : "rgba(105,72,184,0.12)"
            }
            selected={selection.method === "browse"}
            onClick={() => onSelect("browse")}
            isDark={isDark}
            animDelay={60}
          />
        </div>

        {/* AI card — smaller */}
        <div style={{ flex: "1 1 min(200px, 100%)" }}>
          <MethodCard
            type="ai"
            title={m.ai ?? dict.method.ai}
            desc={m.aiDesc ?? dict.method.aiDesc ?? ""}
            badge={m.aiBadge ?? "مميز"}
            premiumFooterLabel={m.aiFooter ?? "يتطلب اشتراك مميز"}
            iconBgSelected={aiSelected}
            iconBgDefault={aiDefault}
            iconContent={<ChatBubbleSVG />}
            iconContentSelected={<ChatBubbleWhiteSVG />}
            accentColor="#DC64C9"
            circleColor={
              isDark ? "rgba(220,100,201,0.28)" : "rgba(220,100,201,0.14)"
            }
            selected={selection.method === "ai"}
            onClick={() => onSelect("ai")}
            isDark={isDark}
            animDelay={160}
          />
        </div>
      </div>
    </div>
  );
}

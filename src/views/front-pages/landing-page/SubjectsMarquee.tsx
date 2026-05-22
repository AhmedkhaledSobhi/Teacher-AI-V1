"use client";

// React Imports
import { useEffect, useState } from "react";

// MUI Imports
import { useTheme } from "@mui/material/styles";

type Subject = {
  name: string;
  icon: string;
  iconColor: string;
  bgLight: string;
  bgDark: string;
};

const subjects: Subject[] = [
  {
    name: "الرياضيات",
    icon: "tabler-calculator",
    iconColor: "#3B6FE8",
    bgLight: "#EEF3FE",
    bgDark: "#1E2F55",
  },
  {
    name: "العلوم",
    icon: "tabler-flask",
    iconColor: "#1BAC7A",
    bgLight: "#E6F7F2",
    bgDark: "#0F3326",
  },
  {
    name: "اللغة الإنجليزية",
    icon: "tabler-language",
    iconColor: "#E05A20",
    bgLight: "#FEF1EA",
    bgDark: "#4A200A",
  },
  {
    name: "الدراسات الإسلامية",
    icon: "tabler-moon-stars",
    iconColor: "#1BAC7A",
    bgLight: "#E6F7F2",
    bgDark: "#0F3326",
  },
  {
    name: "المهارات الحياتية",
    icon: "tabler-palette",
    iconColor: "#B07A0A",
    bgLight: "#FEF8E6",
    bgDark: "#3D2A04",
  },
  {
    name: "لغتي",
    icon: "tabler-book-2",
    iconColor: "#C0392B",
    bgLight: "#FDEEEC",
    bgDark: "#4A0F0A",
  },
  {
    name: "الدراسات الاجتماعية",
    icon: "tabler-world",
    iconColor: "#B02DB0",
    bgLight: "#F9EEF9",
    bgDark: "#3A0F3A",
  },
  {
    name: "المهارات الرقمية",
    icon: "tabler-device-laptop",
    iconColor: "#6C3FD4",
    bgLight: "#F1ECFE",
    bgDark: "#27134A",
  },
];

const CARD_WIDTH = 380;
const CARD_GAP = 20;
const CARD_STRIDE = CARD_WIDTH + CARD_GAP;

type CardProps = { subject: Subject; isDark: boolean };

const SubjectCard = ({ subject, isDark }: CardProps) => (
  <div
    style={{
      flexShrink: 0,
      width: CARD_WIDTH,
      background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
      borderRadius: 20,
      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f0eeff",
      padding: "60px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
      boxShadow: isDark
        ? "0 4px 24px rgba(0,0,0,0.3)"
        : "0 4px 24px rgba(108,63,212,0.07)",
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 14,
        background: isDark ? subject.bgDark : subject.bgLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <i
        className={subject.icon}
        style={{ fontSize: 28, color: subject.iconColor }}
      />
    </div>
    <p
      style={{
        margin: 0,
        fontWeight: 700,
        fontSize: 15,
        color: isDark ? "#e8e0ff" : "#2D1B6B",
        textAlign: "center",
        direction: "rtl",
      }}
    >
      {subject.name}
    </p>
  </div>
);

/**
 * MarqueeRow
 * - Before animation: all cards are centered on screen (justify center, single copy, no scroll)
 * - After delay: two copies placed inline; animation shifts by exactly 50% (= one copy width)
 *   so the loop is seamless and no duplication is ever visible.
 */
const MarqueeRow = ({
  isDark,
  direction,
  duration,
  animated,
}: {
  isDark: boolean;
  direction: "rtl" | "ltr";
  duration: number;
  animated: boolean;
}) => {
  const animName = direction === "rtl" ? "marquee-rtl" : "marquee-ltr";

  if (!animated) {
    // Static centered state — one copy, centered
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: CARD_GAP,
          width: "100%",
          overflow: "hidden",
          padding: "0 16px",
        }}
      >
        {subjects.map((s, i) => (
          <SubjectCard
            key={i}
            subject={s}
            isDark={isDark}
          />
        ))}
      </div>
    );
  }

  // Animated state — two identical copies side-by-side in an ltr container.
  // The outer wrapper is forced ltr so RTL page direction doesn't flip the scroll.
  // The animation moves by -50% of the total track width (= exactly one copy).
  // With enough copies to exceed any viewport width, there is never empty space.
  const EXTRA_COPIES = 3; // extra filler copies beyond the two used for the loop

  const renderCopy = (prefix: string) =>
    subjects.map((s, i) => (
      <SubjectCard
        key={`${prefix}-${i}`}
        subject={s}
        isDark={isDark}
      />
    ));

  return (
    <div style={{ overflow: "hidden", width: "100%", direction: "ltr" }}>
      {/*
        Inner track: [ copyA | copyB | copyC | copyD | copyE ]
        animation-name moves by -50% of track = exactly two copies wide → seam-free loop.
        We use 4 copies (2 "live" + 2 filler) so wide screens never show gaps.
      */}
      <div
        style={{
          display: "flex",
          gap: CARD_GAP,
          width: `${(4 + EXTRA_COPIES) * subjects.length * CARD_STRIDE}px`,
          animation: `subjects-scroll-${direction} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {renderCopy("a")}
        {renderCopy("b")}
        {renderCopy("c")}
        {renderCopy("d")}
        {renderCopy("e")}
      </div>
    </div>
  );
};

const SubjectsMarquee = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [animated, setAnimated] = useState(false);

  // Show all subjects centered for 1.4 s then start the infinite scroll
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const sectionBg = isDark ? "#1e0d45" : "#ede8f5";
  const headingColor = isDark ? "#e8e0ff" : "#2D1B6B";

  return (
    <section
      style={{
        background: sectionBg,
        padding: "80px 0 50px",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Centered text block */}
      <div style={{ textAlign: "center", marginBottom: 56, padding: "0 24px" }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: isDark
              ? "1px solid rgba(255,255,255,0.15)"
              : "1px solid #c4b5fd",
            borderRadius: 999,
            padding: "6px 18px",
            marginBottom: 24,
            background: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,255,255,0.7)",
          }}
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect
                width="24"
                height="24"
                rx="12"
                fill="white"
                fill-opacity="0.1"
              />
              <path
                d="M18.4766 17.0464L16.2293 6.36175C16.2003 6.22203 16.1439 6.08942 16.0634 5.97155C15.983 5.85368 15.88 5.75288 15.7605 5.67492C15.6409 5.59697 15.5071 5.5434 15.3668 5.5173C15.2265 5.49119 15.0824 5.49307 14.9429 5.52282L11.7733 6.20399C11.493 6.26537 11.2482 6.43497 11.0922 6.67589C10.9363 6.91681 10.8818 7.20956 10.9405 7.49048L13.1878 18.1751C13.2379 18.4189 13.3704 18.638 13.563 18.7956C13.7556 18.9532 13.9966 19.0397 14.2454 19.0405C14.3224 19.0404 14.3991 19.0322 14.4743 19.0161L17.6438 18.3349C17.9245 18.2734 18.1695 18.1035 18.3255 17.8621C18.4815 17.6208 18.5358 17.3276 18.4766 17.0464ZM12.0002 7.26907C12.0002 7.26501 12.0002 7.26297 12.0002 7.26297L15.169 6.58587L15.3945 7.66043L12.2256 8.34227L12.0002 7.26907ZM12.4484 9.39991L15.6186 8.71942L15.8448 9.79601L12.6773 10.4772L12.4484 9.39991ZM12.898 11.5375L16.0682 10.8564L16.9687 15.1383L13.7986 15.8195L12.898 11.5375ZM17.417 17.2759L14.2481 17.9531L14.0227 16.8785L17.1915 16.1966L17.417 17.2699C17.417 17.2739 17.417 17.2759 17.417 17.2759ZM9.83345 6.04013H6.58336C6.29604 6.04013 6.02048 6.15427 5.81731 6.35744C5.61414 6.56061 5.5 6.83617 5.5 7.12349V17.9571C5.5 18.2444 5.61414 18.52 5.81731 18.7232C6.02048 18.9263 6.29604 19.0405 6.58336 19.0405H9.83345C10.1208 19.0405 10.3963 18.9263 10.5995 18.7232C10.8027 18.52 10.9168 18.2444 10.9168 17.9571V7.12349C10.9168 6.83617 10.8027 6.56061 10.5995 6.35744C10.3963 6.15427 10.1208 6.04013 9.83345 6.04013ZM6.58336 7.12349H9.83345V8.20685H6.58336V7.12349ZM6.58336 9.29022H9.83345V15.7904H6.58336V9.29022ZM9.83345 17.9571H6.58336V16.8738H9.83345V17.9571Z"
                fill="#DC64C9"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                fill="white"
              />
              <path
                d="M18.4766 17.0474L16.2293 6.36273C16.2003 6.223 16.1439 6.0904 16.0634 5.97253C15.983 5.85466 15.88 5.75385 15.7605 5.6759C15.6409 5.59794 15.5071 5.54438 15.3668 5.51827C15.2265 5.49217 15.0824 5.49405 14.9429 5.5238L11.7733 6.20496C11.493 6.26635 11.2482 6.43595 11.0922 6.67687C10.9363 6.91778 10.8818 7.21054 10.9405 7.49146L13.1878 18.1761C13.2379 18.4199 13.3704 18.639 13.563 18.7966C13.7556 18.9542 13.9966 19.0406 14.2454 19.0415C14.3224 19.0414 14.3991 19.0332 14.4743 19.0171L17.6438 18.3359C17.9245 18.2744 18.1695 18.1044 18.3255 17.8631C18.4815 17.6218 18.5358 17.3286 18.4766 17.0474ZM12.0002 7.27004C12.0002 7.26598 12.0002 7.26395 12.0002 7.26395L15.169 6.58685L15.3945 7.66141L12.2256 8.34325L12.0002 7.27004ZM12.4484 9.40088L15.6186 8.7204L15.8448 9.79699L12.6773 10.4782L12.4484 9.40088ZM12.898 11.5385L16.0682 10.8573L16.9687 15.1393L13.7986 15.8205L12.898 11.5385ZM17.417 17.2769L14.2481 17.954L14.0227 16.8795L17.1915 16.1976L17.417 17.2708C17.417 17.2749 17.417 17.2769 17.417 17.2769ZM9.83345 6.04111H6.58336C6.29604 6.04111 6.02048 6.15524 5.81731 6.35841C5.61414 6.56158 5.5 6.83714 5.5 7.12447V17.9581C5.5 18.2454 5.61414 18.521 5.81731 18.7241C6.02048 18.9273 6.29604 19.0415 6.58336 19.0415H9.83345C10.1208 19.0415 10.3963 18.9273 10.5995 18.7241C10.8027 18.521 10.9168 18.2454 10.9168 17.9581V7.12447C10.9168 6.83714 10.8027 6.56158 10.5995 6.35841C10.3963 6.15524 10.1208 6.04111 9.83345 6.04111ZM6.58336 7.12447H9.83345V8.20783H6.58336V7.12447ZM6.58336 9.29119H9.83345V15.7914H6.58336V9.29119ZM9.83345 17.9581H6.58336V16.8747H9.83345V17.9581Z"
                fill="#DC64C9"
              />
            </svg>
          )}
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? "#c4b5fd" : "#7C3AED",
              direction: "rtl",
            }}
          >
            مناهج متكاملة
          </span>
        </div>

        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "clamp(28px, 5vw, 56px)",
            fontWeight: 800,
            color: headingColor,
            lineHeight: 1.25,
            direction: "rtl",
          }}
        >
          رحلة تعليمية شاملة..
        </h2>
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: "clamp(28px, 5vw, 56px)",
            fontWeight: 800,
            background: "linear-gradient(90deg, #EC4899 0%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.25,
            direction: "rtl",
          }}
        >
          من الصف الأول حتى السادس!
        </h2>
        <p
          style={{
            margin: "0 auto",
            fontSize: "clamp(14px, 1.8vw, 18px)",
            color: isDark ? "rgba(232,224,255,0.7)" : "#5B4A8A",
            maxWidth: 560,
            lineHeight: 1.7,
            direction: "rtl",
          }}
        >
          نغطي كافة المواد الأساسية لصفوف الابتدائي لنضمن لهم تفوقاً مستمراً بلا
          عوائق.
        </p>
      </div>

      {/* Row 1 */}
      <div style={{ marginBottom: 24 }}>
        <MarqueeRow
          isDark={isDark}
          direction="rtl"
          duration={36}
          animated={animated}
        />
      </div>
    </section>
  );
};

export default SubjectsMarquee;

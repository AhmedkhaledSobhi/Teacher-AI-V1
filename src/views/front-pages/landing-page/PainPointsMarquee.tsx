"use client";

// MUI Imports
import { useColorScheme } from "@mui/material";

const PAIN_POINTS = [
  "المذاكرة؟",
  "تشتت الانتباه؟",
  "تراكم الواجبات؟",
  "رهبة الاختبارات؟",
  "عقدة الرياضيات؟",
  "ضياع الوقت؟",
  "صعوبة الفهم؟",
  "الخوف من الرسوب؟",
];

const SEPARATOR = "✦";

// Build a single set of items — the marquee animation clones it seamlessly
const buildTrack = (items: string[]) => {
  const result: string[] = [];
  items.forEach((item) => {
    result.push(item);
    result.push(SEPARATOR);
  });
  return result;
};

const track1 = buildTrack(PAIN_POINTS);
const track2 = buildTrack([...PAIN_POINTS].reverse());

const PainPointsMarquee = () => {
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme();

  const isDark = (() => {
    const currentMode = muiMode === "system" ? muiSystemMode : muiMode;
    return currentMode === "dark";
  })();

  const textColor = isDark ? "rgba(180,160,230,0.28)" : "rgba(105,72,184,0.18)";
  const lineColor = isDark ? "rgba(150,120,220,0.35)" : "rgba(105,72,184,0.25)";

  return (
    <div
      dir="ltr"
      className="relative w-full overflow-hidden py-6 select-none"
      style={{
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      {/* Second band (slightly offset vertically, scrolls same direction for parallax) */}
      <MarqueeBand
        track={track2}
        rotationDeg={4}
        direction="right"
        textColor={textColor}
        lineColor={lineColor}
        offsetY={90}
        duration={55}
      />

      {/* Spacer so the section has visible height (bands are absolutely positioned) */}
      <div style={{ height: 220 }} />
    </div>
  );
};

interface MarqueeBandProps {
  track: string[];
  rotationDeg: number;
  direction: "left" | "right";
  textColor: string;
  lineColor: string;
  offsetY: number;
  duration: number;
}

const MarqueeBand = ({
  track,
  rotationDeg,
  direction,
  textColor,
  lineColor,
  offsetY,
  duration,
}: MarqueeBandProps) => {
  const animationName = direction === "left" ? "marquee-rtl" : "marquee-ltr";

  // Render two identical copies side-by-side; CSS animation slides by exactly 50%
  // so the loop is perfectly seamless without any visible duplication at rest.
  const renderItems = (keyPrefix: string) =>
    track.map((item, idx) =>
      item === SEPARATOR ? (
        <span
          key={`${keyPrefix}-${idx}`}
          style={{
            color: textColor,
            fontSize: "1.75rem",
            fontWeight: 700,
            lineHeight: 1,
            flexShrink: 0,
            margin: "0 0.5rem",
          }}
        >
          {SEPARATOR}
        </span>
      ) : (
        <span
          key={`${keyPrefix}-${idx}`}
          style={{
            color: "transparent",
            WebkitTextStroke: `1.5px ${textColor}`,
            fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
            fontWeight: 900,
            fontFamily: "'Readex Pro', 'Cairo', sans-serif",
            letterSpacing: "0.02em",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {item}
        </span>
      )
    );

  return (
    <div
      className="absolute left-0 right-0"
      style={{
        top: offsetY,
        transform: `rotate(${rotationDeg}deg)`,
        transformOrigin: "center center",
        width: "140%",
        marginLeft: "-20%",
      }}
    >
      {/* Top border */}
      <div style={{ height: 1, background: lineColor, marginBottom: 8 }} />

      {/* Scrolling text — two identical copies placed inline; animation translates by -50% */}
      <div
        className="overflow-hidden"
        style={{ height: 68 }}
      >
        <div
          className="flex items-center whitespace-nowrap"
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
            height: "100%",
            gap: "2rem",
          }}
        >
          {/* Copy A */}
          <div className="flex items-center gap-8 shrink-0">
            {renderItems("a")}
          </div>
          {/* Copy B — pixel-perfect clone so translateX(-50%) lands at the exact same visual position */}
          <div className="flex items-center gap-8 shrink-0">
            {renderItems("b")}
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div style={{ height: 1, background: lineColor, marginTop: 8 }} />
    </div>
  );
};

export default PainPointsMarquee;

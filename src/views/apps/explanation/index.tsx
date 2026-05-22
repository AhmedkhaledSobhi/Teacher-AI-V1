"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import api from "@/utils/api";
import type { SystemMode } from "@core/types";
import DecorativeElements from "@/views/DecorativeElements";
import { getLocalizedUrl } from "@/utils/i18n";
import type { Locale } from "@configs/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

type TeacherPersona = "Ahmad" | "Shifa" | "Omar" | "Safa";

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface Segment {
  end_time: number;
  start_time: number;
  id: string;
  text: string;
  start: number;
  end: number;
  words?: WordTimestamp[];
}

interface ExplanationData {
  lesson_title?: string;
  content?: string;
  explanation?: string;
  teacher_image?: string;
  teacher_name?: string;
  persona?: string;
  audio_url?: string;
  /** Paragraphs with word-level timestamps (normalised field) */
  segments?: Segment[];
  /** Raw field name from some API responses */
  word_timestamps?: Segment[];
  [key: string]: unknown;
}

// ─── Persona display map ──────────────────────────────────────────────────────

const PERSONA_DISPLAY: Record<
  TeacherPersona,
  { label: string; image: string }
> = {
  Ahmad: { label: "المعلم أحمد", image: "/images/personas/Ahmed.png" },
  Shifa: { label: "المعلمة شفاء", image: "/images/personas/Shifaa.png" },
  Omar: { label: "المعلم عمر", image: "/images/personas/Omar.png" },
  Safa: { label: "المعلمة صفا", image: "/images/personas/Safa.png" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12h14M5 12l6 6M5 12l6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PauseIcon = ({ color }: { color: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="6"
      y="4"
      width="4"
      height="16"
      rx="1"
      fill={color}
    />
    <rect
      x="14"
      y="4"
      width="4"
      height="16"
      rx="1"
      fill={color}
    />
  </svg>
);

// ─── Inline markdown token renderer ─────────────────────────────────────────
// Converts a plain text string with inline markdown (**bold**, *italic*) into
// an array of React nodes so we can nest it inside any block element.

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern: **bold**, *italic*
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[0].startsWith("**")) {
      nodes.push(
        <strong
          key={m.index}
          style={{ fontWeight: 700, color: "var(--explain-heading-color)" }}
        >
          {m[2]}
        </strong>
      );
    } else {
      nodes.push(
        <em
          key={m.index}
          style={{ fontStyle: "italic", opacity: 0.85 }}
        >
          {m[3]}
        </em>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// ─── WordSpan ────────────────────────────────────────────────────────────────

function WordSpan({
  word,
  currentTime,
}: {
  word: WordTimestamp;
  currentTime: number;
}) {
  const isActive =
    word.start > 0 && currentTime >= word.start && currentTime < word.end;

  return (
    <span
      style={{
        display: "inline",
        borderRadius: 4,
        padding: isActive ? "0 2px" : undefined,
        background: isActive
          ? "var(--explain-word-highlight-bg, #fde68a)"
          : "transparent",
        color: isActive
          ? "var(--explain-word-highlight-color, #92400e)"
          : "inherit",
        transition: "background 0.15s, color 0.15s",
        fontWeight: isActive ? 700 : "inherit",
      }}
    >
      {word.word}{" "}
    </span>
  );
}

// ─── SmartReader ─────────────────────────────────────────────────────────────
// Renders markdown content with proper styling AND word-level highlighting.
// When segments exist it uses them for highlighting; otherwise it falls back
// to static markdown rendering. Both paths use React elements (no innerHTML).

interface SmartReaderProps {
  rawContent: string;
  segments: Segment[] | undefined;
  currentTime: number;
}

function SmartReader({ rawContent, segments, currentTime }: SmartReaderProps) {
  const hasSegments = !!segments && segments.length > 0;

  // ── Path A: segments available → render each segment as a block element ──
  if (hasSegments && segments) {
    return (
      <div
        className="explanation-prose"
        style={{ color: "var(--explain-prose-color)" }}
      >
        {segments.map((seg) => {
          const segStart = seg.start_time ?? seg.start ?? 0;
          const segEnd = seg.end_time ?? seg.end ?? 0;
          const isActive = currentTime >= segStart && currentTime < segEnd;

          const activeBlockStyle: React.CSSProperties = isActive
            ? {
                backgroundColor:
                  "var(--explain-paragraph-highlight-bg, rgba(253,230,138,0.15))",
                padding: "12px 16px",
                borderRadius: "8px",
                borderInlineStart:
                  "4px solid var(--explain-paragraph-highlight-border, #fbbf24)",
                transition: "all 0.2s ease",
              }
            : { transition: "all 0.2s ease" };

          const activeHeadingStyle: React.CSSProperties = isActive
            ? {
                backgroundColor:
                  "var(--explain-paragraph-highlight-bg, rgba(253,230,138,0.15))",
                padding: "8px 12px",
                borderRadius: "8px",
                marginInlineStart: "-12px",
                marginInlineEnd: "-12px",
                transition: "all 0.2s ease",
              }
            : { transition: "all 0.2s ease" };

          // Render words (with per-word highlighting) or plain text
          const renderWords = (filterHash = false) => {
            if (seg.words && seg.words.length > 0) {
              return seg.words
                .filter((w) => !filterHash || !/^#+$/.test(w.word))
                .map((w, wi) => (
                  <WordSpan
                    key={wi}
                    word={w}
                    currentTime={currentTime}
                  />
                ));
            }
            // No word timestamps → render text with inline markdown
            const cleanText = seg.text.replace(/^#{1,3}\s+/, "");
            return renderInline(cleanText);
          };

          // Heading blocks
          const headingMatch = seg.text.match(/^(#{1,3})\s+(.*)/s);
          if (headingMatch) {
            const level = headingMatch[1].length as 1 | 2 | 3;
            const Tag = `h${level}` as "h1" | "h2" | "h3";
            return (
              <Tag
                key={seg.id}
                style={activeHeadingStyle}
              >
                {renderWords(true)}
              </Tag>
            );
          }

          // Table block — preserve raw render for tables
          if (seg.text.trim().startsWith("|")) {
            return (
              <div
                key={seg.id}
                style={activeBlockStyle}
              >
                <MarkdownTable raw={seg.text} />
              </div>
            );
          }

          // Blockquote
          if (seg.text.trim().startsWith(">")) {
            const inner = seg.text.trim().replace(/^>\s?/, "");
            return (
              <blockquote
                key={seg.id}
                style={activeBlockStyle}
              >
                {renderInline(inner)}
              </blockquote>
            );
          }

          // List item
          if (
            /^[-*•]\s/.test(seg.text.trim()) ||
            /^\d+\.\s/.test(seg.text.trim())
          ) {
            const inner = seg.text.trim().replace(/^[-*•]\s|^\d+\.\s/, "");
            return (
              <ul
                key={seg.id}
                className="explanation-list"
                style={activeBlockStyle}
              >
                <li>{renderWords(false)}</li>
              </ul>
            );
          }

          // Normal paragraph
          return (
            <p
              key={seg.id}
              style={{
                lineHeight: 1.9,
                marginBottom: "1em",
                ...activeBlockStyle,
              }}
            >
              {renderWords(false)}
            </p>
          );
        })}
      </div>
    );
  }

  // ── Path B: no segments → static markdown rendering ──────────────────────
  return (
    <div
      className="explanation-prose"
      style={{ color: "var(--explain-prose-color)" }}
    >
      <MarkdownBlocks raw={rawContent} />
    </div>
  );
}

// ─── MarkdownBlocks: line-by-line static markdown renderer ───────────────────

function MarkdownBlocks({ raw }: { raw: string }) {
  if (!raw) return null;

  const lines = raw.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} />);
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      elements.push(<Tag key={i}>{renderInline(headingMatch[2])}</Tag>);
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith(">")) {
      const inner = line.trim().replace(/^>\s?/, "");
      elements.push(<blockquote key={i}>{renderInline(inner)}</blockquote>);
      i++;
      continue;
    }

    // Table — collect consecutive table lines
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(
        <MarkdownTable
          key={`table-${i}`}
          raw={tableLines.join("\n")}
        />
      );
      continue;
    }

    // Unordered list — collect consecutive list items
    if (/^[-*•]\s/.test(line.trim())) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        const inner = lines[i].trim().replace(/^[-*•]\s/, "");
        items.push(<li key={i}>{renderInline(inner)}</li>);
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="explanation-list"
        >
          {items}
        </ul>
      );
      continue;
    }

    // Ordered list — collect consecutive ordered items
    if (/^\d+\.\s/.test(line.trim())) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const inner = lines[i].trim().replace(/^\d+\.\s/, "");
        items.push(<li key={i}>{renderInline(inner)}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`}>{items}</ol>);
      continue;
    }

    // Plain paragraph — collect lines until blank
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,3}\s/) &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith(">") &&
      !/^[-*•]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(
        <p
          key={`p-${i}`}
          style={{ lineHeight: 1.9, marginBottom: "1em" }}
        >
          {renderInline(paraLines.join(" "))}
        </p>
      );
    }
  }

  return <>{elements}</>;
}

// ─── MarkdownTable ─────────────────────────────────────────────────────────

function MarkdownTable({ raw }: { raw: string }) {
  const rows = raw.trim().split("\n").filter(Boolean);
  const dataRows = rows.filter((r) => !/^\|[\s|:-]+\|$/.test(r.trim()));
  if (dataRows.length === 0) return null;

  const parseRow = (row: string) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const [header, ...body] = dataRows;
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        margin: "16px 0",
        borderRadius: 12,
        overflow: "hidden",
        fontSize: 14,
      }}
    >
      <thead>
        <tr>
          {parseRow(header).map((c, ci) => (
            <th
              key={ci}
              style={{
                background: "var(--explain-name-badge-bg)",
                color: "#fff",
                padding: "12px 16px",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((r, ri) => (
          <tr key={ri}>
            {parseRow(r).map((c, ci) => (
              <td
                key={ci}
                style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--explain-card-border)",
                  textAlign: "center",
                  background: "var(--explain-card-bg)",
                }}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Skeleton loader ────────────────��─────────────────────────────────────────

function ExplanationSkeleton({ isDark: _isDark }: { isDark: boolean }) {
  const bg = "var(--explain-skeleton-bg)";
  return (
    <div style={{ animation: "stats-pulse 1.4s ease-in-out infinite" }}>
      <div
        style={{
          height: 200,
          borderRadius: 16,
          background: bg,
          marginBottom: 24,
        }}
      />
      <div
        style={{
          height: 40,
          borderRadius: 12,
          background: bg,
          marginBottom: 16,
          width: "60%",
        }}
      />
      <div
        style={{
          height: 20,
          borderRadius: 8,
          background: bg,
          marginBottom: 12,
        }}
      />
      <div
        style={{
          height: 20,
          borderRadius: 8,
          background: bg,
          marginBottom: 12,
          width: "85%",
        }}
      />
      <div
        style={{
          height: 20,
          borderRadius: 8,
          background: bg,
          marginBottom: 12,
          width: "70%",
        }}
      />
      <div
        style={{
          height: 20,
          borderRadius: 8,
          background: bg,
          marginBottom: 24,
          width: "90%",
        }}
      />
      <div
        style={{
          height: 160,
          borderRadius: 16,
          background: bg,
          marginBottom: 16,
        }}
      />
    </div>
  );
}

// ─── Main ExplanationView ─────────────────────────────────────────────────────

interface Props {
  mode: SystemMode;
}

export default function ExplanationView({ mode }: Props) {
  const router = useRouter();
  const { lang } = useParams();
  const locale = Array.isArray(lang) ? lang[0] : (lang ?? "ar");
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lesson_id");
  const unitId = searchParams.get("unit_id");
  const personaParam =
    (searchParams.get("persona") as TeacherPersona) ?? "Ahmad";

  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === "dark";
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Fetch explanation
  useEffect(() => {
    if (!lessonId && !unitId) {
      setError("لم يتم تحديد الدرس أو الوحدة");
      setLoading(false);
      return;
    }

    const isUnitOnly = !lessonId && !!unitId;

    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        // Normalise any API response shape into a flat ExplanationData object
        const normalise = (d: any): ExplanationData | null => {
          if (!d) return null;
          // The payload can live at the top level or nested under d.data
          const inner = d?.data ?? d;
          const content: string =
            inner?.content ??
            inner?.explanation ??
            d?.content ??
            d?.explanation ??
            "";
          if (!content) return null;
          return {
            ...inner,
            content,
            audio_url: inner?.audio_url ?? d?.audio_url,
            segments:
              inner?.segments ??
              d?.segments ??
              inner?.word_timestamps ??
              d?.word_timestamps,
            persona: inner?.persona ?? d?.persona,
            lesson_title: inner?.lesson_title ?? d?.lesson_title,
          };
        };

        const storedParams = new URLSearchParams({ persona: personaParam });
        if (lessonId) storedParams.set("lesson_id", lessonId);
        if (unitId) storedParams.set("unit_id", unitId);

        let usedStored = false;
        try {
          const storedData = await api.get<any>(
            `/api/v1/explain/get-explanation?${storedParams.toString()}`,
            { skipErrorToast: true }
          );
          const normalised = normalise(storedData);
          if (normalised) {
            setExplanation(normalised);
            usedStored = true;
          }
        } catch {
          // fall through to generate
        }

        if (!usedStored) {
          const genParams = new URLSearchParams({ persona: personaParam });
          if (unitId) genParams.set("unit_id", unitId);

          const genEndpoint = isUnitOnly
            ? `/api/v1/explain/explanation/unit/${unitId}?${genParams.toString()}`
            : `/api/v1/explain/explanation/${lessonId}?${genParams.toString()}`;

          const genData = await api.get<any>(genEndpoint);
          const normalised = normalise(genData);
          if (!normalised) throw new Error("الشرح غير متاح حالياً");
          setExplanation(normalised);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "حد�� خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [lessonId, unitId, personaParam]);

  // Build/rebuild Audio element whenever audio_url changes
  useEffect(() => {
    const url = explanation?.audio_url;
    console.log("[v0] audio_url received:", url);
    if (!url) {
      console.log("[v0] No audio_url — skipping audio setup");
      return;
    }

    // Stop any existing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);

    const audio = new Audio();
    audio.preload = "auto";
    // NOTE: do NOT set crossOrigin unless the server sends CORS headers —
    // setting it to "anonymous" on a non-CORS server causes a network error
    audio.src = url;
    audioRef.current = audio;
    console.log("[v0] Audio element created, src:", audio.src);

    const onCanPlay = () => console.log("[v0] Audio canplay — ready to play");
    const onEnded = () => {
      console.log("[v0] Audio ended");
      setIsPlaying(false);
      setCurrentTime(0);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
    const onPause = () => {
      console.log("[v0] Audio paused");
      setIsPlaying(false);
    };
    const onPlay = () => {
      console.log("[v0] Audio play event fired");
      setIsPlaying(true);
    };
    const onError = (e: Event) => {
      const err = (e.target as HTMLAudioElement).error;
      console.log("[v0] Audio error:", err?.code, err?.message);
      setIsPlaying(false);
    };

    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("error", onError);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [explanation?.audio_url]);

  // rAF loop — use a ref so it always captures the latest version of itself
  const tickTimeRef = useRef<() => void>(() => {});
  tickTimeRef.current = () => {
    if (audioRef.current && !audioRef.current.paused) {
      setCurrentTime(audioRef.current.currentTime);
      animFrameRef.current = requestAnimationFrame(tickTimeRef.current);
    }
  };
  const tickTime = useCallback(() => tickTimeRef.current(), []);

  const handleToggleAudio = useCallback(() => {
    const audio = audioRef.current;
    console.log(
      "[v0] handleToggleAudio — audioRef:",
      audio,
      "paused:",
      audio?.paused,
      "src:",
      audio?.src
    );
    if (!audio) {
      console.log("[v0] audioRef is null — audio not initialised yet");
      return;
    }

    if (!audio.paused) {
      // Currently playing → pause
      console.log("[v0] Pausing audio");
      audio.pause();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    } else {
      // Currently paused → play
      console.log("[v0] Calling audio.play()");
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("[v0] audio.play() resolved — playback started");
            setIsPlaying(true);
            animFrameRef.current = requestAnimationFrame(tickTime);
          })
          .catch((err) => {
            console.log("[v0] audio.play() rejected:", err);
            setIsPlaying(false);
          });
      } else {
        console.log("[v0] audio.play() returned undefined (old browser path)");
      }
    }
  }, [tickTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const personaDisplay = PERSONA_DISPLAY[personaParam] ?? PERSONA_DISPLAY.Ahmad;
  const rawContent: string =
    (explanation?.content as string) ||
    (explanation?.explanation as string) ||
    "";
  const lessonTitle: string = (explanation?.lesson_title as string) || "";
  const audioUrl: string | undefined = explanation?.audio_url as
    | string
    | undefined;
  const segments: Segment[] | undefined = explanation?.segments as
    | Segment[]
    | undefined;

  // Determine render mode
  const hasAudio = !!audioUrl;
  const hasWordTimestamps =
    hasAudio &&
    !!segments &&
    segments.length > 0 &&
    segments.some((s) => s.words && s.words.length > 0);

  const pageBg = "var(--explain-page-bg)";
  const cardBg = "var(--explain-card-bg)";
  const cardBorder = "var(--explain-card-border)";
  const titleColor = "var(--explain-title-color)";
  const btnBg = "var(--explain-btn-bg)";
  const btnColor = "var(--explain-btn-color)";

  return (
    <div
      dir="rtl"
      style={{ minHeight: "100vh", background: pageBg, position: "relative" }}
    >
      <DecorativeElements currentMode={mode} />

      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${cardBorder}`,
          background: "var(--explain-topbar-bg)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Back */}
        <button
          onClick={() =>
            router.push(getLocalizedUrl("/apps/journey", locale as Locale))
          }
          aria-label="العودة"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: btnBg,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BackIcon color={btnColor} />
        </button>

        {/* Persona name */}
        <span
          style={{
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: "15px",
            fontWeight: 700,
            color: titleColor,
          }}
        >
          {personaDisplay.label}
        </span>

        {/* Sound toggle — only shown when audio_url exists */}
        {hasAudio ? (
          <button
            onClick={handleToggleAudio}
            aria-label={isPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: isPlaying ? "var(--explain-speaking-bg)" : btnBg,
              border: isPlaying
                ? "1.5px solid var(--explain-speaking-border)"
                : "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            {isPlaying ? (
              <PauseIcon color="var(--explain-speaking-color)" />
            ) : (
              <PlayIcon color={btnColor} />
            )}
          </button>
        ) : (
          /* Placeholder to keep layout balanced */
          <div style={{ width: 44, height: 44, flexShrink: 0 }} />
        )}
      </div>

      {/* ── Content ── */}
      <div
        style={{ position: "relative", zIndex: 1 }}
        className="page-container"
      >
        {/* Teacher avatar card */}
        <div
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            borderRadius: 24,
            padding: "32px 24px 28px",
            textAlign: "center",
            marginBottom: 28,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {/* Decorative stars */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-32px",
                color: "var(--explain-star-color)",
                fontSize: 18,
                opacity: 0.7,
              }}
            >
              ✦
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                right: "-32px",
                color: "var(--explain-star-color)",
                fontSize: 18,
                opacity: 0.7,
              }}
            >
              ✦
            </div>
            {/* Avatar circle */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid",
                borderColor: "var(--explain-avatar-border)",
                margin: "0 auto 16px",
                background: "var(--explain-avatar-bg)",
              }}
            >
              <img
                src={personaDisplay.image}
                alt={personaDisplay.label}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0";
                }}
              />
            </div>
          </div>

          {/* Name badge */}
          <div
            style={{
              display: "inline-block",
              background: "var(--explain-name-badge-bg)",
              color: "#FFF",
              borderRadius: "100px",
              padding: "8px 28px",
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {personaDisplay.label}
          </div>
        </div>

        {/* Content card */}
        <div
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}
        >
          {loading && <ExplanationSkeleton isDark={isDark} />}

          {error && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                fontFamily: '"Readex Pro", sans-serif',
                color: "var(--explain-error-color)",
                fontSize: 16,
              }}
            >
              <p style={{ marginBottom: 16 }}>{error}</p>
              <button
                onClick={() =>
                  router.push(
                    getLocalizedUrl("/apps/journey", locale as Locale)
                  )
                }
                className="quiz-btn-primary"
              >
                العودة للرحلة
              </button>
            </div>
          )}

          {!loading && !error && explanation && (
            <>
              {lessonTitle && (
                <h1
                  style={{
                    fontFamily: '"Readex Pro", sans-serif',
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 700,
                    color: "var(--explain-heading-color)",
                    textAlign: "center",
                    marginBottom: 28,
                    lineHeight: 1.5,
                  }}
                >
                  {lessonTitle}
                </h1>
              )}

              {/* ── Render content with markdown + highlight ── */}
              <SmartReader
                rawContent={rawContent}
                segments={segments}
                currentTime={currentTime}
              />
            </>
          )}
        </div>

        {/* Bottom CTA — "لم تفهم الدرس؟" */}
        {!loading && !error && (
          <button
            onClick={() => {
              const chatParams = new URLSearchParams();
              if (lessonId) chatParams.set("lesson_id", lessonId);
              if (unitId) chatParams.set("unit_id", unitId);
              chatParams.set("persona", personaParam);
              if (lessonTitle) chatParams.set("lesson_title", lessonTitle);
              router.push(
                getLocalizedUrl(
                  `/apps/chat?${chatParams.toString()}`,
                  locale as Locale
                )
              );
            }}
            style={{
              width: "100%",
              marginTop: 24,
              borderRadius: 20,
              background: "var(--explain-cta-bg)",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              direction: "rtl",
              position: "relative",
              overflow: "hidden",
              border: "none",
              cursor: "pointer",
              textAlign: "right",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 24px rgba(105,72,184,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            {/* Premium badge */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "rgba(255,255,255,0.18)",
                color: "#FFF",
                borderRadius: 100,
                padding: "3px 10px",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: '"Readex Pro", sans-serif',
              }}
            >
              مميز
            </div>

            <div>
              <h3
                style={{
                  fontFamily: '"Readex Pro", sans-serif',
                  fontSize: "clamp(16px, 2.5vw, 22px)",
                  fontWeight: 700,
                  color: "#FFF",
                  margin: "0 0 4px",
                }}
              >
                لم تفهم الدرس؟
              </h3>
              <p
                style={{
                  fontFamily: '"Readex Pro", sans-serif',
                  fontSize: 14,
                  color: "rgba(255,255,255,0.75)",
                  margin: 0,
                }}
              >
                اسأل المعلم الذكي اليوم بمساعدتك بشكل مخصص
              </p>
            </div>

            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                left: -20,
                bottom: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
                pointerEvents: "none",
              }}
            />
          </button>
        )}
      </div>
    </div>
  );
}

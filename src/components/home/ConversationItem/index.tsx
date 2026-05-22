"use client";

import { useRouter, useParams } from "next/navigation";
import { useColorScheme } from "@mui/material";

interface ConversationItemProps {
  title: string;
  time: string;
  threadId?: string;
  subject?: string;
  isDark?: boolean;
}

// Book icon — matches the red/coral icon in the screenshot
const BookIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      stroke="#E53935"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      stroke="#E53935"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ConversationItem = ({
  title,
  time,
  threadId,
  subject,
  isDark: isDarkProp = false,
}: ConversationItemProps) => {
  const router = useRouter();
  const params = useParams();

  // Derive live mode — overrides stale SSR prop on client toggle
  const { mode: muiMode, systemMode } = useColorScheme();
  const resolvedMode =
    muiMode === "system"
      ? systemMode
      : (muiMode ?? (isDarkProp ? "dark" : "light"));
  const isDark = resolvedMode === "dark";

  const locale = Array.isArray(params?.lang)
    ? params.lang[0]
    : (params?.lang ?? "ar");

  const handleContinue = () => {
    const path = threadId
      ? `/${locale}/apps/chat?thread_id=${threadId}`
      : `/${locale}/apps/chat`;
    router.push(path);
  };

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "clamp(14px, 2vw, 18px) clamp(16px, 2.5vw, 24px)",
        borderRadius: 20,
        background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(212,189,255,0.18)"}`,
        boxShadow: isDark ? "none" : "0 2px 12px 0 rgba(105,72,184,0.06)",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, transform 0.18s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
          ? "0 4px 20px 0 rgba(105,72,184,0.18)"
          : "0 6px 24px 0 rgba(105,72,184,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
          ? "none"
          : "0 2px 12px 0 rgba(105,72,184,0.06)";
      }}
    >
      {/* Right side: book icon box + text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Book icon box */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: isDark
              ? "rgba(229,57,53,0.18)"
              : "rgba(229,57,53,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BookIcon />
        </div>

        {/* Title + timestamp */}
        <div style={{ textAlign: "right", minWidth: 0 }}>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(14px, 1.6vw, 16px)",
              fontWeight: 600,
              color: isDark ? "#F5F0FF" : "#3E256B",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "clamp(160px, 40vw, 500px)",
            }}
          >
            {title}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: 12,
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(62,37,107,0.5)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {time}
            </p>
            {subject && (
              <span
                style={{
                  fontFamily: '"Readex Pro", sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#E53935",
                  background: "rgba(229,57,53,0.10)",
                  borderRadius: 20,
                  padding: "2px 10px",
                  whiteSpace: "nowrap",
                }}
              >
                {subject}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Left side: "تابع" button */}
      <button
        onClick={handleContinue}
        style={{
          flexShrink: 0,
          background: "#5531A8",
          color: "#ffffff",
          border: "none",
          borderRadius: 12,
          padding: "9px 20px",
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "background 0.18s ease",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#6948B8")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#5531A8")
        }
      >
        تابع
      </button>
    </div>
  );
};

export default ConversationItem;

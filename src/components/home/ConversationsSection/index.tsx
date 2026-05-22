"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter, useParams } from "next/navigation";
import { useColorScheme } from "@mui/material";
import ConversationItem from "@/components/home/ConversationItem";
import ConversationItemSkeleton from "@/components/home/ConversationItem/ConversationItemSkeleton";
import { getUserThreadsClient } from "@/services/chat-api-client";

interface Thread {
  thread_id: string;
  thread_name: string | null;
  subject?: string;
  subject_name?: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to format time in Arabic
const formatArabicTime = (dateString?: string): string => {
  if (!dateString) return "منذ فترة";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "الآن";
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else if (diffInDays === 1) {
      return "منذ يوم";
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} أيام`;
    } else {
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "منذ فترة";
  }
};

const ConversationsSection = ({
  isDark: isDarkProp = false,
}: {
  isDark?: boolean;
}) => {
  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const router = useRouter();
  const params = useParams();

  // Derive live mode from MUI color scheme — overrides the stale SSR prop
  const { mode: muiMode, systemMode } = useColorScheme();
  const resolvedMode =
    muiMode === "system"
      ? systemMode
      : (muiMode ?? (isDarkProp ? "dark" : "light"));
  const isDark = resolvedMode === "dark";
  const locale = Array.isArray(params?.lang)
    ? params.lang[0]
    : (params?.lang ?? "ar");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const userId = session?.user?.id;

        if (!userId) {
          setLoading(false);
          return;
        }

        const result = await getUserThreadsClient(userId);

        if (result.operation_status === "success" && result.data?.threads && result.data.threads.length > 0) {
          // Get only the first 4 threads (already flattened by getUserThreadsClient)
          const limitedThreads = result.data.threads.slice(0, 4);
          setThreads(limitedThreads);
        } else if (result.operation_status !== "success") {
          console.error("Failed to fetch threads:", result.message);
          setThreads([]);
        } else {
          setThreads([]);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [session?.user?.id]);

  const handleViewAll = () => {
    router.push(`/${locale}/apps/chat`);
  };

  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(62,37,107,0.55)";
  const fontFamily = locale === "ar" ? '"Readex Pro", sans-serif' : '"Baloo 2", sans-serif';

  return (
    <section
      dir="rtl"
      style={{ marginTop: "clamp(28px, 4vw, 48px)" }}
    >
      {/* ── Header row ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "clamp(14px, 2vw, 20px)",
        }}
      >
        <h3
          style={{
            fontFamily: fontFamily,
            fontSize: "clamp(20px, 2.8vw, 32px)",
            fontWeight: 700,
            color: titleColor,
            margin: 0,
          }}
        >
          محادثاتي السابقة
        </h3>

        <button
          onClick={handleViewAll}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: fontFamily,
            fontSize: "clamp(13px, 1.5vw, 16px)",
            fontWeight: 500,
            color: subColor,
            padding: "4px 0",
            transition: "color 0.18s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = isDark
              ? "#D4BDFF"
              : "#5531A8")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = subColor)
          }
        >
          عرض الكل
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line
              x1="19"
              y1="12"
              x2="5"
              y2="12"
            />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      {/* ── List ─────────────────────────────────────────────────── */}
      {loading ? (
        /* Skeleton rows */
        <ConversationItemSkeleton count={3} />
      ) : threads.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {threads.map((thread) => (
            <ConversationItem
              key={thread.thread_id}
              threadId={thread.thread_id}
              title={thread.thread_name || "محادثة بدون عنوان"}
              time={formatArabicTime(thread.updated_at || thread.created_at)}
              subject={thread.subject_name || thread.display_name || thread.subject}
              isDark={isDark}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            fontFamily: '"Readex Pro", sans-serif',
            fontSize: 15,
            color: subColor,
          }}
        >
          لا توجد محادثات سابقة
        </div>
      )}
    </section>
  );
};

export default ConversationsSection;

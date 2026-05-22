// React Imports
import { useState, useEffect, useCallback } from "react";
import type { ReactNode, RefObject } from "react";

// MUI Imports
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";

// Third-party Imports
import PerfectScrollbar from "react-perfect-scrollbar";
import { useUser } from "@/hooks/useUser";

// Type Imports
import type { ChatDataType } from "@/types/apps/chatTypes";
import type { AppDispatch } from "@/redux-store";

// Slice Imports
import {
  EnableLoading,
  showOldMessagesInChat,
  startNewChat,
} from "@/redux-store/slices/chat";

// Component Imports
import { isSubjectEnabled } from "@/views/apps/journey/shared";

// Hook Imports
import { useTranslation } from "@/hooks/useTranslation";
import {
  getCurrentThreadId,
  setCurrentThreadId as setStorageThreadId,
  clearCurrentThreadId,
} from "@/utils/localStorage";
import {
  deleteThread,
  getThreadMessages,
  getUserThreads,
} from "@/app/server/chat-actions";

// Define notification type for consistent error/success messages
type NotificationType = {
  message: string;
  severity: "success" | "error" | "info" | "warning";
  open: boolean;
};

// Define loading states type to track different loading operations
type LoadingStates = {
  threads: boolean;
  threadDeletion: boolean;
  threadSelection: boolean;
  subjectSelection: boolean;
  search: boolean;
};

type Props = {
  chatStore: ChatDataType;
  dispatch: AppDispatch;
  backdropOpen: boolean;
  threads: Threads[];
  curriculum: any[];
  setBackdropOpen: (value: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  isBelowLgScreen: boolean;
  isBelowMdScreen: boolean;
  isBelowSmScreen: boolean;
  messageInputRef: RefObject<HTMLDivElement>;
  startSubjectConversation: (subject: string, display_name: string) => void;
  threadUpdateTrigger: number;
  setThreadUpdateTrigger?: React.Dispatch<React.SetStateAction<number>>;
};

type Threads = {
  thread_name: string;
  thread_id: string;
  created_at?: string;
  updated_at?: string;
  /** Pre-grouped label set by the server action (Today / Yesterday / Last Week / Older) */
  _group?: string;
  subject?: string;
  display_name?: string;
  subject_name?: string;
};

// ─── Subject Picker Modal ─────────────────────────────────────────────────────

interface SubjectPickerModalProps {
  curriculum: any[];
  theme: any;
  onSelect: (subject: string, display_name: string) => void;
  onClose: () => void;
}

function SubjectPickerModal({
  curriculum,
  theme: _theme,
  onSelect,
  onClose,
}: SubjectPickerModalProps) {
  const overlayBg = "var(--chat-modal-overlay)";
  const modalBg = "var(--chat-modal-bg)";
  const titleColor = "var(--chat-modal-title)";
  const subtitleColor = "var(--chat-modal-subtitle)";

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const SUBJECT_ICON_MAP: Record<string, string> = {
    لغتي: "tabler-book",
    "الدراسات الإسلامية": "tabler-moon",
    "اللغة الإنجليزية": "tabler-language",
    العلوم: "tabler-flask",
    "المهارات الحياتية والأسرية": "tabler-heart",
    الرياضيات: "tabler-calculator",
    "المهارات الرقمية": "tabler-device-laptop",
    "الدراسات الاجتماعية": "tabler-globe",
  };

  const SUBJECT_COLOR_MAP: Record<string, { bg: string; text: string }> = {
    لغتي: { bg: "var(--stats-violet-bg)", text: "var(--stats-violet)" },
    "الدراسات الإسلامية": {
      bg: "var(--stats-green-bg)",
      text: "var(--stats-green)",
    },
    "اللغة الإنجليزية": {
      bg: "var(--stats-amber-bg)",
      text: "var(--stats-amber)",
    },
    العلوم: { bg: "var(--quiz-teal-light)", text: "var(--quiz-teal)" },
    "المهارات الحياتية والأسرية": {
      bg: "var(--quiz-grade-f-bg)",
      text: "var(--quiz-grade-f)",
    },
    الرياضيات: { bg: "var(--stats-blue-bg)", text: "var(--stats-blue)" },
    "المهارات الرقمية": { bg: "var(--stats-red-bg)", text: "var(--stats-red)" },
    "الدراسات الاجتماعية": {
      bg: "var(--stats-amber-bg)",
      text: "var(--stats-amber)",
    },
  };

  const curriculumItems: any[] = Array.isArray(curriculum)
    ? curriculum
    : Array.isArray((curriculum as any)?.data)
      ? (curriculum as any).data
      : [];

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: overlayBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="اختر المادة"
    >
      <div
        style={{
          background: modalBg,
          borderRadius: 24,
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "32px 24px 28px",
          direction: "rtl",
          boxShadow: "0 24px 80px rgba(0,0,0,0.40)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "none",
            background: "var(--chat-modal-close-bg)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--chat-modal-close-color)",
            fontSize: 18,
            lineHeight: 1,
            transition: "background 0.15s ease",
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(18px, 3vw, 24px)",
              fontWeight: 700,
              color: titleColor,
              margin: "0 0 6px",
            }}
          >
            اختر المادة للبدء
          </h2>
          <p
            style={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "clamp(12px, 1.6vw, 14px)",
              fontWeight: 400,
              color: subtitleColor,
              margin: 0,
            }}
          >
            اختر المادة التي تريد التحدث عنها
          </p>
        </div>

        {/* Subject grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          {curriculumItems.map((item: any, index: number) => {
            const enabled = isSubjectEnabled(item.subject, item.display_name);
            const colors = SUBJECT_COLOR_MAP[item.display_name] ?? {
              bg: "var(--chat-subject-default-bg)",
              text: "var(--chat-subject-default-text)",
            };
            const icon = SUBJECT_ICON_MAP[item.display_name] ?? "tabler-book";

            return (
              <button
                key={index}
                onClick={() =>
                  enabled && onSelect(item.subject, item.display_name)
                }
                disabled={!enabled}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1.5px solid var(--chat-subject-btn-border)",
                  background: "var(--chat-subject-btn-bg)",
                  cursor: enabled ? "pointer" : "not-allowed",
                  opacity: enabled ? 1 : 0.55,
                  textAlign: "right",
                  direction: "rtl",
                  transition: "all 0.18s ease",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (!enabled) return;
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--chat-subject-btn-hover-bg)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--chat-subject-btn-hover-border)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  if (!enabled) return;
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--chat-subject-btn-bg)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--chat-subject-btn-border)";
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(0)";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: colors.bg,
                    color: colors.text,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 18,
                  }}
                >
                  <i className={icon} />
                </div>
                {/* Label */}
                <span
                  style={{
                    fontFamily: '"Readex Pro", sans-serif',
                    fontSize: "clamp(13px, 1.5vw, 15px)",
                    fontWeight: 600,
                    color: "var(--chat-subject-label)",
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {item.display_name}
                </span>
                {!enabled && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: "var(--chat-badge-soon-bg)",
                      color: "var(--chat-badge-soon-text)",
                      borderRadius: 100,
                      padding: "2px 8px",
                      flexShrink: 0,
                    }}
                  >
                    قريباً
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Scroll wrapper for chat list ────────────────────────────────────────────

const ScrollWrapper = ({
  children,
  isBelowLgScreen,
}: {
  children: ReactNode;
  isBelowLgScreen: boolean;
}) => {
  if (isBelowLgScreen) {
    return (
      <div className="bs-full overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    );
  } else {
    return (
      <PerfectScrollbar options={{ wheelPropagation: false }}>
        {children}
      </PerfectScrollbar>
    );
  }
};

const SidebarLeft = (props: Props) => {
  // Props
  const {
    chatStore,
    dispatch,
    threads,
    curriculum,
    backdropOpen,
    setBackdropOpen,
    sidebarOpen,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    messageInputRef,
    startSubjectConversation,
    threadUpdateTrigger,
    setThreadUpdateTrigger,
  } = props;
  // Hooks
  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const { t } = useTranslation();
  const theme = useTheme();
  // Loading states
  const [loading, setLoading] = useState<LoadingStates>({
    threads: false,
    threadDeletion: false,
    threadSelection: false,
    subjectSelection: false,
    search: false,
  });

  // Notification state for user feedback
  const [notification, setNotification] = useState<NotificationType>({
    message: "",
    severity: "info",
    open: false,
  });

  // Track thread being deleted for UI feedback
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  // Subject picker modal state
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  // Local threads state for immediate UI updates
  const [localThreads, setLocalThreads] = useState<Threads[]>(threads);

  // Sync local threads when props change
  useEffect(() => {
    setLocalThreads(threads);
  }, [threads]);

  // Debounced search: POST /api/rag/search-chats with { keyword }
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading((prev) => ({ ...prev, search: true }));
      try {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const accessToken =
          (session as any)?.accessToken ||
          (session as any)?.session?.access_token;
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "https://drsi.ai";
        const res = await fetch(`${backendUrl}/api/v1/rag/search-chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ keyword: searchQuery.trim() }),
          signal: controller.signal,
        });
        const data = await res.json();

        // Handle API response: { status, results: [...], count, total_time }
        let results = [];
        if (Array.isArray(data?.results)) {
          results = data.results;
        } else if (Array.isArray(data?.threads)) {
          results = data.threads;
        } else if (Array.isArray(data)) {
          results = data;
        }

        setSearchResults(results);
      } catch (err: any) {
        if (err?.name !== "AbortError") setSearchResults([]);
      } finally {
        setLoading((prev) => ({ ...prev, search: false }));
      }
    }, 700);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Show notification helper
  const showNotification = useCallback(
    (message: string, severity: "success" | "error" | "info" | "warning") => {
      setNotification({
        message,
        severity,
        open: true,
      });
    },
    []
  );

  // Handle thread selection from stored threads with loading state and error handling
  const handleSelectThread = async (thread: {
    thread_id: string;
    thread_name: string;
  }) => {
    try {
      // Set loading state for thread selection
      setLoading((prev) => ({ ...prev, threadSelection: true }));
      dispatch(EnableLoading(true));
      // Update the active thread in the store
      // Extract subject and display_name from thread if available
      const threadWithSubject = {
        thread_id: thread.thread_id,
        thread_name: thread.thread_name,
        subject: (thread as any).subject || (thread as any).subject_name,
        display_name:
          (thread as any).display_name || (thread as any).subject_name,
      };
      dispatch(startNewChat({ thread: threadWithSubject }));

      // Get messages from the API
      const response = await getThreadMessages(thread.thread_id);

      // Check if we have a valid response with the expected structure
      if (
        response &&
        response.operation_status === "success" &&
        response.data &&
        Array.isArray(response.data.thread_messages)
      ) {
        const threadMessages = response.data.thread_messages;

        // Only cache threads that have messages (prevent caching empty threads)
        if (threadMessages.length > 0) {
          setStorageThreadId(thread.thread_id);
        }

        // Dispatch the messages to the store
        //@ts-ignore
        dispatch(showOldMessagesInChat(threadMessages));
      } else {
        // Dispatch empty array to avoid undefined errors
        dispatch(showOldMessagesInChat([]));

        // Only show notification if there's a clear error (not just empty messages)
        if (!response || response.operation_status !== "success") {
          showNotification(
            t("chat.errors.loadMessagesFailed") || "Failed to load messages",
            "warning"
          );
        }
      }
    } catch (error) {
      showNotification(
        t("chat.errors.loadMessagesFailed") || "Failed to load messages",
        "error"
      );

      // Dispatch empty array to avoid undefined errors in the UI
      dispatch(showOldMessagesInChat([]));
    } finally {
      // Always reset loading state
      setLoading((prev) => ({ ...prev, threadSelection: false }));
    }
  };

  // Handle thread deletion with improved error handling and loading states
  const handleDeleteThread = async (threadId: string) => {
    try {
      // Set loading state and track which thread is being deleted
      setLoading((prev) => ({ ...prev, threadDeletion: true }));
      setDeletingThreadId(threadId);

      const deleteResult = await deleteThread(threadId);

      if (deleteResult.operation_status === "success") {
        showNotification(t("chat.threadDeleted"), "success");

        // Immediately remove the deleted thread from the local UI
        setLocalThreads((prev) => 
          prev.filter((t) => t.thread_id !== threadId)
        );

        // Clear cache if the deleted thread was the cached one
        const cachedThreadId = getCurrentThreadId();
        if (cachedThreadId === threadId) {
          clearCurrentThreadId();
        }

        const userId = session?.user?.id;

        // Refetch threads to get the updated list
        if (userId) {
          try {
            setLoading((prev) => ({ ...prev, threads: true }));
            const threadsResult = await getUserThreads(userId);

            if (threadsResult.operation_status === "success") {
              if (setThreadUpdateTrigger) {
                setThreadUpdateTrigger((prev) => prev + 1);
              }
            } else {
              showNotification(t("chat.errors.threadRefreshFailed"), "error");
            }
          } catch {
            showNotification(t("chat.errors.unexpectedError"), "error");
          } finally {
            setLoading((prev) => ({ ...prev, threads: false }));
          }
        }
      } else {
        showNotification(t("chat.errors.threadDeleteFailed"), "error");
      }
    } catch (error) {
      showNotification(t("chat.errors.unexpectedError"), "error");
    } finally {
      setLoading((prev) => ({ ...prev, threadDeletion: false }));
      setDeletingThreadId(null);
    }
  };

  // Handle subject conversation start with loading state
  const handleStartSubjectConversation = async (
    subject: string,
    display_name: string
  ) => {
    try {
      setLoading((prev) => ({ ...prev, subjectSelection: true }));
      await startSubjectConversation(subject, display_name);
    } catch (error) {
      console.error("Error starting subject conversation:", error);
      showNotification(t("chat.errors.subjectConversationFailed"), "error");
    } finally {
      setLoading((prev) => ({ ...prev, subjectSelection: false }));
    }
  };

  // Handle drawer close with proper backdrop management
  const handleDrawerClose = useCallback(() => {
    setSidebarOpen(false);
    // Always close backdrop when drawer closes on mobile
    if (isBelowMdScreen) {
      setBackdropOpen(false);
    }
  }, [isBelowMdScreen, setBackdropOpen]);

  // Group threads by date bucket — newest first within each group.
  // If a thread carries a `_group` field (set by the server action when the API
  // returns pre-grouped data), we honour it directly instead of doing date math.
  const groupThreadsByDate = (threadList: Threads[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const lastWeekStart = new Date(today.getTime() - 7 * 86400000);

    const groups: Record<string, Threads[]> = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    // Map the server-side group names to local keys
    const serverGroupMap: Record<string, string> = {
      Today: "today",
      Yesterday: "yesterday",
      "Last Week": "lastWeek",
      Older: "older",
    };

    // Sort by updated_at (preferred) or created_at descending (newest first)
    const sorted = [...threadList].sort((a, b) => {
      const aTime = (a as any).updated_at
        ? new Date((a as any).updated_at).getTime()
        : (a as any).created_at
          ? new Date((a as any).created_at).getTime()
          : 0;
      const bTime = (b as any).updated_at
        ? new Date((b as any).updated_at).getTime()
        : (b as any).created_at
          ? new Date((b as any).created_at).getTime()
          : 0;
      return bTime - aTime;
    });

    sorted.forEach((thread) => {
      // Prefer pre-grouped label from server action
      const serverGroup = (thread as any)._group as string | undefined;
      if (serverGroup && serverGroupMap[serverGroup]) {
        groups[serverGroupMap[serverGroup]].push(thread);
        return;
      }

      // Fallback: derive group from updated_at or created_at
      const dateStr = (thread as any).updated_at || (thread as any).created_at;
      const threadDate = dateStr ? new Date(dateStr) : null;
      if (!threadDate) {
        groups.today.unshift(thread);
        return;
      }
      const d = new Date(
        threadDate.getFullYear(),
        threadDate.getMonth(),
        threadDate.getDate()
      );
      if (d >= today) groups.today.push(thread);
      else if (d >= yesterday) groups.yesterday.push(thread);
      else if (d >= lastWeekStart) groups.lastWeek.push(thread);
      else groups.older.push(thread);
    });

    return groups;
  };

  const grouped = groupThreadsByDate(localThreads);

  const groupLabels: Record<string, string> = {
    today: t("chat.today") || "اليوم",
    yesterday: t("chat.yesterday") || "الأمس",
    lastWeek: t("chat.lastWeek") || "الأسبوع الماضي",
    older: t("chat.older") || "أقدم",
  };

  const SUBJECT_BADGE_COLORS: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    لغتي: {
      bg: "var(--stats-violet-bg)",
      text: "var(--stats-violet)",
      icon: "tabler-book",
    },
    "الدراسات الإسلامية": {
      bg: "var(--stats-green-bg)",
      text: "var(--stats-green)",
      icon: "tabler-moon",
    },
    "اللغة الإنجليزية": {
      bg: "var(--stats-amber-bg)",
      text: "var(--stats-amber)",
      icon: "tabler-language",
    },
    العلوم: {
      bg: "var(--quiz-teal-light)",
      text: "var(--quiz-teal)",
      icon: "tabler-flask",
    },
    "المهارات الحياتية والأسرية": {
      bg: "var(--quiz-grade-f-bg)",
      text: "var(--quiz-grade-f)",
      icon: "tabler-heart",
    },
    الرياضيات: {
      bg: "var(--stats-blue-bg)",
      text: "var(--stats-blue)",
      icon: "tabler-calculator",
    },
    "المهارات الرقمية": {
      bg: "var(--stats-red-bg)",
      text: "var(--stats-red)",
      icon: "tabler-device-laptop",
    },
    "الدراسات الاجتماعية": {
      bg: "var(--stats-amber-bg)",
      text: "var(--stats-amber)",
      icon: "tabler-globe",
    },
  };

  const getSubjectBadge = (subjectName: string) =>
    SUBJECT_BADGE_COLORS[subjectName] ?? {
      bg: "var(--chat-subject-default-bg)",
      text: "var(--chat-subject-default-text)",
      icon: "tabler-book",
    };

  const renderThreadItem = (thread: Threads) => {
    const isActive = chatStore.activeThread?.thread_id === thread.thread_id;
    const subjectName =
      (thread as any).subject_name ?? (thread as any).display_name ?? "";
    const badge = getSubjectBadge(subjectName);
    const rawDate = (thread as any).updated_at || (thread as any).created_at;
    const timeStr = rawDate
      ? new Date(rawDate).toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <div
        key={thread.thread_id}
        className={`chat-thread-item${isActive ? " active" : ""}`}
        style={{ position: "relative" }}
        role="listitem"
      >
        {/* Clickable area for selecting thread */}
        <div
          onClick={() => !loading.threadSelection && handleSelectThread(thread)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleSelectThread(thread)}
          aria-label={thread.thread_name}
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            gap: 10,
            minWidth: 0,
            cursor: "pointer",
          }}
        >
          {/* Subject badge icon */}
          <div
            className="chat-thread-badge"
            style={{ background: badge.bg, color: badge.text, flexShrink: 0 }}
            aria-hidden="true"
          >
            <i className={`${badge.icon} text-base`} />
          </div>

          {/* Thread name + metadata */}
          <div
            className="chat-thread-info"
            style={{ flex: 1, minWidth: 0 }}
          >
            <span className="chat-thread-name">{thread.thread_name}</span>
            <div className="chat-thread-meta">
              {timeStr && (
                <span className="chat-thread-time">
                  <i className="tabler-clock text-xs" />
                  {timeStr}
                </span>
              )}
              {subjectName && (
                <span
                  className="chat-thread-subject"
                  style={{ color: badge.text }}
                >
                  {subjectName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          aria-label={`حذف المحادثة ${thread.thread_name}`}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteThread(thread.thread_id);
          }}
          disabled={
            loading.threadDeletion && deletingThreadId === thread.thread_id
          }
          style={{
            flexShrink: 0,
            background: "transparent",
            border: "none",
            cursor:
              loading.threadDeletion && deletingThreadId === thread.thread_id
                ? "not-allowed"
                : "pointer",
            color: "var(--chat-delete-btn)",
            opacity:
              loading.threadDeletion && deletingThreadId === thread.thread_id
                ? 0.5
                : 0.7,
            padding: "4px 6px",
            borderRadius: "6px",
            transition: "opacity 0.2s, background 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
            (e.currentTarget as HTMLElement).style.background =
              "var(--chat-delete-btn-hover-bg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.7";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          {loading.threadDeletion && deletingThreadId === thread.thread_id ? (
            <i className="tabler-loader-2 animate-spin text-sm" />
          ) : (
            <i className="tabler-trash text-sm" />
          )}
        </button>
      </div>
    );
  };

  // Render search result item (from RAG search)
  const renderSearchResultItem = (result: any, index: number) => {
    const similarity = result.similarity || 0;
    const similarityPercent = Math.round(similarity * 100);

    return (
      <div
        key={`search-result-${result.message_id || index}`}
        className="chat-search-result-item"
        style={{
          padding: "12px 16px",
          marginBottom: "8px",
          borderRadius: "8px",
          backgroundColor: "var(--chat-search-result-bg)",
          borderLeft: `3px solid hsl(${similarityPercent * 1.2}, 70%, 50%)`,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--chat-search-result-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor =
            "var(--chat-search-result-bg)";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "8px",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: "0 0 6px 0",
                color: theme.palette.text.primary,
                fontSize: "13px",
                lineHeight: "1.4",
                wordBreak: "break-word",
              }}
            >
              {result.content || "No content"}
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: theme.palette.text.secondary,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <i className="tabler-id text-xs" />
                {result.message_id}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  backgroundColor: `hsla(${similarityPercent * 1.2}, 70%, 50%, 0.15)`,
                  color: `hsl(${similarityPercent * 1.2}, 70%, 40%)`,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <i className="tabler-trending-up text-xs" />
                {similarityPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isBelowMdScreen && sidebarOpen && (
        <div
          className="chat-sidebar-overlay"
          onClick={handleDrawerClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`chat-sidebar${sidebarOpen ? " open" : ""}${theme.palette.mode === "dark" ? " dark" : ""}`}
        aria-label={t("chat.historyTitle") || "سجل المحادثات"}
        dir="rtl"
      >
        {/* Header */}
        <div className="chat-sidebar-header">
          <h2 className="chat-sidebar-title">
            {t("chat.historyTitle") || "سجل المحادثات"}
          </h2>
          <button
            className="chat-sidebar-close"
            onClick={handleDrawerClose}
            aria-label="close sidebar"
          >
            <i className="tabler-x text-xl" />
          </button>
        </div>

        {/* New chat button */}
        <div className="chat-sidebar-new-btn-wrap">
          <button
            className="chat-sidebar-new-btn"
            onClick={() => {
              setShowSubjectPicker(true);
            }}
            disabled={loading.subjectSelection}
          >
            <i className="tabler-plus text-base" />
            {t("chat.newChat") || "محادثة جديدة"}
          </button>
        </div>

        {/* Search */}
        <div className="chat-sidebar-search-wrap">
          <i className="tabler-search chat-sidebar-search-icon" />
          <input
            className="chat-sidebar-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("chat.searchPlaceholder") || "ابحث في محادثاتك..."}
            aria-label="search"
          />
          {loading.search && (
            <i
              className="tabler-loader-2 animate-spin text-xs opacity-50"
              style={{ position: "absolute", left: "12px" }}
            />
          )}
        </div>

        {/* Thread list */}
        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <div className="chat-sidebar-threads">
            {/* Search results mode */}
            {searchQuery.trim() ? (
              <>
                {loading.search && (
                  <div
                    className="chat-sidebar-skeletons"
                    style={{ padding: "16px" }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="chat-thread-skeleton"
                      />
                    ))}
                  </div>
                )}
                {!loading.search &&
                  searchResults !== null &&
                  searchResults.length === 0 && (
                    <p
                      className="chat-sidebar-empty"
                      style={{ padding: "24px 16px", textAlign: "center" }}
                    >
                      {t("chat.noSearchResults") || "لا توجد نتائج"}
                    </p>
                  )}
                {!loading.search &&
                  searchResults !== null &&
                  searchResults.length > 0 && (
                    <div style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                          padding: "0 4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: theme.palette.text.secondary,
                            fontWeight: "500",
                          }}
                        >
                          {searchResults.length} {t("chat.results") || "نتيجة"}
                        </span>
                        {searchResults[0]?.total_time && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: theme.palette.text.secondary,
                            }}
                          >
                            {searchResults[0].total_time}
                          </span>
                        )}
                      </div>
                      {searchResults.map((result, idx) =>
                        renderSearchResultItem(result, idx)
                      )}
                    </div>
                  )}
              </>
            ) : (
              /* Normal grouped list */
              <>
                {localThreads.length === 0 && !loading.threads && (
                  <p className="chat-sidebar-empty">
                    {t("chat.noHistory") || "لا توجد محادثات بعد"}
                  </p>
                )}

                {(["today", "yesterday", "lastWeek", "older"] as const).map(
                  (key) => {
                    const group = grouped[key];
                    if (!group || group.length === 0) return null;
                    return (
                      <div
                        key={key}
                        className="chat-thread-group"
                      >
                        <span className="chat-thread-group-label">
                          {groupLabels[key]}
                        </span>
                        {group.map(renderThreadItem)}
                      </div>
                    );
                  }
                )}

                {loading.threads && (
                  <div className="chat-sidebar-skeletons">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="chat-thread-skeleton"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollWrapper>
      </aside>

      {/* Subject Picker Modal */}
      {showSubjectPicker && (
        <SubjectPickerModal
          curriculum={curriculum}
          theme={theme}
          onSelect={(subject, display_name) => {
            setShowSubjectPicker(false);
            handleStartSubjectConversation(subject, display_name);
            if (isBelowMdScreen) handleDrawerClose();
          }}
          onClose={() => setShowSubjectPicker(false)}
        />
      )}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SidebarLeft;

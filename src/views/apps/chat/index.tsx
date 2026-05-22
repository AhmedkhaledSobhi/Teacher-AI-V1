"use client";

// React Imports
import { useEffect, useRef, useState, useMemo } from "react";

// MUI Imports
import Backdrop from "@mui/material/Backdrop";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/material/styles";

// Third-party Imports
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

// Util Imports
import { signOut } from "@/utils/auth-utils";

// Type Imports
import type { RootState } from "@/redux-store";

// Slice Imports
import {
  startNewChat,
  EnableLoading,
  showOldMessagesInChat,
  setPendingConversation,
  clearPendingConversation,
} from "@/redux-store/slices/chat";

// Component Imports
import SidebarLeft from "./SidebarLeft";
import ChatContent from "./ChatContent";
import ErrorBoundary from "@/components/ErrorBoundary";

// Hook Imports
import { useSettings } from "@core/hooks/useSettings";
import { useTranslation } from "@/hooks/useTranslation";

// Util Imports
import { commonLayoutClasses } from "@layouts/utils/layoutClasses";
import {
  getCurrentThreadId,
  setCurrentThreadId,
  clearCurrentThreadId,
} from "@/utils/localStorage";
import {
  getUserThreads,
  getCurriculum,
  getThreadMessages,
} from "@/app/server/chat-actions";

// MUI Importss
import Button from "@mui/material/Button";

// CSS Imports
import "./ChatTheme.css";
import { Typography } from "@mui/material";
// import Home from "@/components/chat/recording-voice"; // Removed unused import that causes Worker SSR error
// import { toast } from "react-toastify"; // Removed unused import
import toastUtils from "@/utils/toast-utils";
import { getThreadsList } from "@/app/api/actions/server/threads";

// Define props interface for ChatWrapper
interface ChatWrapperProps {
  initialUserThreads?: any[];
  initialCurriculumData?: any;
  initialUser?: {
    id?: string;
    grade_id?: number | string;
    [key: string]: any;
  } | null;
}

const ChatWrapper = ({
  initialUserThreads = [],
  initialCurriculumData = [],
  initialUser = null,
}: ChatWrapperProps) => {
  // Hooks
  const { settings } = useSettings();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const chatStore = useSelector((state: RootState) => state.chatReducer);
  const { user: sessionUser, isLoading: isSessionLoading } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const isBelowLgScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg")
  );
  const isBelowMdScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  const isBelowSmScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  // States - Initialize sidebar as open on desktop, closed on mobile
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isBelowMdScreen);
  const [newChatMenuAnchor, setNewChatMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [threadUpdateTrigger, setThreadUpdateTrigger] = useState(0);
  const [userThreads, setUserThreads] = useState<any[]>(initialUserThreads);
  const [curriculumData, setCurriculumData] = useState<any[]>(
    initialCurriculumData
  );

  const messageInputRef = useRef<HTMLDivElement>(null);

  // Focus on message input when active user changes
  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [chatStore.activeUser, messageInputRef]);

  // Listen for sidebar toggle event from NavbarContent
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen((prev) => {
        const newState = !prev;
        // Update backdrop based on sidebar state
        if (isBelowMdScreen) {
          setBackdropOpen(newState);
        }
        return newState;
      });
    };

    window.addEventListener("toggle-chat-sidebar", handleToggleSidebar);
    return () => {
      window.removeEventListener("toggle-chat-sidebar", handleToggleSidebar);
    };
  }, [isBelowMdScreen]);

  // Keep sidebar open on desktop, closed on mobile when screen size changes
  useEffect(() => {
    if (!isBelowMdScreen && !sidebarOpen) {
      setSidebarOpen(true);
    } else if (isBelowMdScreen && sidebarOpen) {
      setSidebarOpen(false);
      setBackdropOpen(false);
    }
  }, [isBelowMdScreen]);

  // Close backdrop when sidebar is open on below md screen
  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false);
    }
  }, [isBelowMdScreen, backdropOpen, sidebarOpen, setBackdropOpen]);

  // Open backdrop when sidebar is open on below sm screen
  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true);
    }
  }, [isBelowSmScreen, sidebarOpen, setBackdropOpen]);

  // Fetch threads when threadUpdateTrigger changes
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        // Use the parent page's data fetching mechanism
        if (threadUpdateTrigger > 0) {
          // Use server action that gets user ID from its own session internally
          const threadsResult = await getThreadsList();
          if (Array.isArray(threadsResult)) {
            setUserThreads(threadsResult);
          }
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetchThreads();
  }, [threadUpdateTrigger]);

  // Sync active thread name into the local threads list whenever it changes in Redux
  // This ensures the sidebar title updates immediately without requiring a page refresh
  useEffect(() => {
    const activeThread = chatStore.activeThread;
    if (!activeThread?.thread_id || !activeThread?.thread_name) return;

    setUserThreads((prev) => {
      // Check whether this thread already exists in the list
      const idx = prev.findIndex((t) => t.thread_id === activeThread.thread_id);
      if (idx === -1) {
        // New thread — prepend it so it appears at the top
        return [
          {
            thread_id: activeThread.thread_id,
            thread_name: activeThread.thread_name,
            subject: activeThread.subject,
            display_name: activeThread.display_name,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ];
      }
      // Existing thread — update its name if it changed
      if (prev[idx].thread_name === activeThread.thread_name) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], thread_name: activeThread.thread_name };
      return updated;
    });
  }, [chatStore.activeThread?.thread_id, chatStore.activeThread?.thread_name]);

  // Auto-restore last active thread on page load
  useEffect(() => {
    // Only auto-restore if:
    // 1. No thread is currently active
    // 2. No pending conversation exists (don't override pending state!)
    // 3. User threads have been loaded
    // 4. We haven't already attempted restore
    if (
      !chatStore.activeThread &&
      !chatStore.pendingThread &&
      !chatStore.placeholderMessage &&
      userThreads.length > 0
    ) {
      const lastThreadId = getCurrentThreadId();

      if (lastThreadId) {
        // Check if the cached thread still exists in the thread list
        const lastThread = userThreads.find(
          (t) => t.thread_id === lastThreadId
        );

        if (lastThread) {
          // Auto-select the last thread (similar to SidebarLeft handleSelectThread)
          const restoreThread = async () => {
            try {
              dispatch(EnableLoading(true));
              // Preserve subject and display_name when restoring thread
              const threadWithSubject = {
                thread_id: lastThread.thread_id,
                thread_name: lastThread.thread_name,
                subject:
                  (lastThread as any).subject ||
                  (lastThread as any).subject_name,
                display_name:
                  (lastThread as any).display_name ||
                  (lastThread as any).subject_name,
              };
              dispatch(startNewChat({ thread: threadWithSubject }));

              const response = await getThreadMessages(lastThreadId);

              if (
                response?.operation_status === "success" &&
                response.data?.thread_messages
              ) {
                // Transform ThreadMessage[] to MessageContent[]
                const transformedMessages = response.data.thread_messages.map(
                  (msg: any) => ({
                    message_id: msg.message_id,
                    content: msg.content,
                    illustrative_images: msg.illustrative_images,
                    role: msg.role,
                    attached_image: msg.attached_image || "",
                    generated_audio: msg.generated_audio || "",
                  })
                );

                dispatch(showOldMessagesInChat(transformedMessages));
              }
            } catch (error) {
              console.error("Error restoring thread:", error);
              // Silently fail - user can manually select a thread
            }
          };

          restoreThread();
        } else {
        }
      }
    } else if (chatStore.pendingThread || chatStore.placeholderMessage) {
    }
  }, [
    userThreads,
    chatStore.activeThread,
    chatStore.pendingThread,
    chatStore.placeholderMessage,
  ]); // Run when threads are loaded or pending state changes

  // Set up pending conversation when user clicks a subject
  // Thread will be created when user sends their first message
  const startSubjectConversation = async (
    subject: string,
    display_name?: string
  ): Promise<void> => {
    // Resolve userId — prefer live session, fall back to sessionUser from cache, then initialUser from server
    let userId =
      session?.user?.id ?? (sessionUser as any)?.id ?? initialUser?.id;
    let gradeId =
      (session?.user as any)?.grade_id ??
      (sessionUser as any)?.grade_id ??
      initialUser?.grade_id;

    // If still loading, wait up to 3 seconds for the session to resolve
    if (!userId && isSessionLoading) {
      const maxWait = 3000;
      const interval = 200;
      let waited = 0;
      await new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          waited += interval;
          const u = (sessionUser as any)?.id;
          if (u || waited >= maxWait) {
            clearInterval(timer);
            resolve();
          }
        }, interval);
      });
      userId = session?.user?.id ?? (sessionUser as any)?.id ?? initialUser?.id;
      gradeId =
        (session?.user as any)?.grade_id ??
        (sessionUser as any)?.grade_id ??
        initialUser?.grade_id;
    }

    if (!userId) {
      toastUtils.showErrorToast("Please log in to start a conversation");
      return;
    }

    // Clear cached thread ID when starting new conversation
    clearCurrentThreadId();

    // Set pending conversation state (no thread created yet!)
    // IMPORTANT: Use display_name if provided, otherwise use subject
    const pendingConversation = {
      grade_id: gradeId,
      subject: subject,
      display_name: display_name || subject, // Fallback to subject if no display_name
      term_id: 2,
      user_id: userId,
    };

    dispatch(setPendingConversation(pendingConversation));

    // Close sidebar on mobile
    if (isBelowMdScreen) {
      setSidebarOpen(false);
    }
    setBackdropOpen(false);

    // Focus on message input so user can start typing
    messageInputRef.current?.focus();
  };

  return (
    <div
      className={classNames(
        commonLayoutClasses.contentHeightFixed,
        "flex is-full overflow-hidden rounded relative",
        {
          border: settings.skin === "bordered",
          "shadow-md": settings.skin !== "bordered",
        }
      )}
    >
      {/* Main chat content area — takes remaining space */}
      <div className="flex flex-col w-full min-w-0 h-full overflow-hidden">
        <ChatContent
          chatStore={chatStore}
          dispatch={dispatch}
          curriculum={curriculumData}
          backdropOpen={backdropOpen}
          setBackdropOpen={setBackdropOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isBelowMdScreen={isBelowMdScreen}
          isBelowLgScreen={isBelowLgScreen}
          isBelowSmScreen={isBelowSmScreen}
          messageInputRef={messageInputRef}
          startSubjectConversation={startSubjectConversation}
          onThreadCreated={() => setThreadUpdateTrigger((prev) => prev + 1)}
        />
      </div>

      {/* Sidebar — on mobile it slides over; on desktop it's part of the flex row */}
      <SidebarLeft
        chatStore={chatStore}
        dispatch={dispatch}
        threads={userThreads}
        curriculum={curriculumData}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
        startSubjectConversation={startSubjectConversation}
        threadUpdateTrigger={threadUpdateTrigger}
        setThreadUpdateTrigger={setThreadUpdateTrigger}
      />

      <Backdrop
        open={backdropOpen}
        onClick={() => setBackdropOpen(false)}
        className="absolute z-10"
      />
    </div>
  );
};

// Child-friendly error fallback UI
const ChildFriendlyErrorFallback = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-6xl mb-4">🤔</div>
      <Typography
        variant="h5"
        className="mb-4"
      >
        {t("chat.errors.somethingWrong")}
      </Typography>
      <Typography
        variant="body1"
        className="mb-6 max-w-md"
      >
        {t("chat.errors.robotTrouble")}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={async () => {
          // Clear token and redirect to login
          await signOut({
            redirect: true,
            callbackUrl: "/ar/login",
          });
        }}
        className="rounded-full px-6"
        startIcon={<i className="tabler-logout" />}
      >
        {t("chat.errors.tryAgain") || "Go to Login"}
      </Button>
    </div>
  );
};

// Wrap the component with ErrorBoundary for better error handling
const ChatWrapperWithErrorBoundary = (props: ChatWrapperProps) => (
  <ErrorBoundary fallback={<ChildFriendlyErrorFallback />}>
    <ChatWrapper {...props} />
  </ErrorBoundary>
);

export default ChatWrapperWithErrorBoundary;

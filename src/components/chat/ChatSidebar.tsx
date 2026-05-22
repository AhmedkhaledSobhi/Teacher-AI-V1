"use client";

// React Imports
import { useState, useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";

// MUI Imports
import Backdrop from "@mui/material/Backdrop";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/material/styles";

// Third-party Imports
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@/hooks/useUser";

// Type Imports
import type { RootState } from "@/redux-store";
import type { AppDispatch } from "@/redux-store";

// Component Imports
import SidebarLeft from "@/views/apps/chat/SidebarLeft";

// Slice Imports
import { setPendingConversation } from "@/redux-store/slices/chat";

// Util Imports
import { getThreadsList } from "@/app/api/actions/server/threads";

type ChatSidebarProps = {
  initialThreads?: any[];
  initialCurriculum?: any[];
};

const ChatSidebar = ({
  initialThreads = [],
  initialCurriculum = [],
}: ChatSidebarProps) => {
  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const chatStore = useSelector((state: RootState) => state.chatReducer);
  const { user: sessionUser } = useUser();
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

  // States
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isBelowMdScreen);
  const [threadUpdateTrigger, setThreadUpdateTrigger] = useState(0);
  const [userThreads, setUserThreads] = useState<any[]>(initialThreads);
  const [curriculumData, setCurriculumData] =
    useState<any[]>(initialCurriculum);

  const messageInputRef = useRef<HTMLDivElement>(null);

  // Keep sidebar open on desktop
  useEffect(() => {
    if (!isBelowMdScreen && !sidebarOpen) {
      setSidebarOpen(true);
    } else if (isBelowMdScreen && sidebarOpen) {
      setSidebarOpen(false);
      setBackdropOpen(false);
    }
  }, [isBelowMdScreen, sidebarOpen]);

  // Listen for sidebar toggle event
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen((prev) => {
        const newState = !prev;
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

  // Fetch threads only when trigger changes (curriculum is static and loaded once from initialCurriculum)
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threadsResult = await getThreadsList();
        if (threadsResult) {
          setUserThreads(threadsResult);
        }
      } catch (error) {
        console.error("Error fetching sidebar threads:", error);
      }
    };

    fetchThreads();
  }, [threadUpdateTrigger]);

  // Handle subject conversation start
  const startSubjectConversation = useCallback(
    async (subject: string, display_name: string) => {
      const userId = session?.user?.id;
      const gradeId = (session?.user as any)?.grade_id;

      if (!userId) return;

      dispatch(
        setPendingConversation({
          grade_id: gradeId,
          subject: subject,
          display_name: display_name,
          term_id: 2,
          user_id: userId,
        })
      );

      if (isBelowMdScreen) {
        setSidebarOpen(false);
      }
      setBackdropOpen(false);
    },
    [dispatch, session?.user?.id, isBelowMdScreen]
  );

  return (
    <>
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
        onClick={() => {
          setBackdropOpen(false);
          setSidebarOpen(false);
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer - 1,
        }}
      />
    </>
  );
};

export default ChatSidebar;

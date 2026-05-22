// React Imports
import { useState, useEffect } from "react";
import type { RefObject } from "react";
import Navbar from "@components/layout/vertical/Navbar";

// MUI Imports
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CardContent from "@mui/material/CardContent";
import { getCurrentThreadId } from "@/utils/localStorage";
// Type Imports
import type { AppDispatch } from "@/redux-store";
import type { ChatDataType, MessageContent } from "@/types/apps/chatTypes";
// Redux Actions
import { handleErrorMessageClick } from "@/redux-store/slices/chat";

import ChatLog from "./ChatLog";
import SendMsgForm from "./SendMsgForm";

// Hook Imports
import { useTranslation } from "@/hooks/useTranslation";
import {
  FaBookOpen,
  FaQuran,
  FaLanguage,
  FaFlask,
  FaAppleAlt,
  FaGlobe,
  FaLaptopCode,
  FaUsers,
  FaCalculator,
} from "react-icons/fa";
import InitialChat from "./initailchat";
import EmptyChat from "./emptyChat";

type Props = {
  chatStore: ChatDataType;
  dispatch: AppDispatch;
  curriculum: any[];
  backdropOpen: boolean;
  setBackdropOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isBelowMdScreen: boolean;
  isBelowLgScreen: boolean;
  isBelowSmScreen: boolean;
  messageInputRef: RefObject<HTMLDivElement>;
  startSubjectConversation: (subject: string, display_name: string) => void;
  onThreadCreated?: () => void;
};

const ChatContent = (props: Props) => {
  // Props
  const {
    chatStore,
    dispatch,
    backdropOpen,
    curriculum,
    setBackdropOpen,
    sidebarOpen,
    setSidebarOpen,
    isBelowMdScreen,
    isBelowSmScreen,
    isBelowLgScreen,
    messageInputRef,
    startSubjectConversation,
    onThreadCreated,
  } = props;

  // Hooks
  const { t } = useTranslation();

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    const newSidebarState = !sidebarOpen;
    setSidebarOpen(newSidebarState);

    // Update backdrop based on sidebar state and screen size
    if (isBelowMdScreen) {
      setBackdropOpen(newSidebarState);
    } else {
      setBackdropOpen(false);
    }
  };

  // States

  // Set up event listener for retry button clicks
  useEffect(() => {
    const handleRetryMessage = (event: Event) => {
      const customEvent = event as CustomEvent<{ messageId: string }>;
      const messageId = customEvent.detail.messageId;

      // Find the message in the store
      const errorMessage = chatStore.messages.find(
        (msg) => msg.message_id === messageId
      );

      if (errorMessage && errorMessage.hasError) {
        // Dispatch the retry action
        dispatch(handleErrorMessageClick(errorMessage));
      }
    };

    // Add event listener
    window.addEventListener("retry-message", handleRetryMessage);

    // Clean up
    return () => {
      window.removeEventListener("retry-message", handleRetryMessage);
    };
  }, [dispatch, chatStore.messages]);

  // Vars
  const { activeThread, placeholderMessage } = chatStore;

  const getSubjectIcon = (subjectDisplayName: any) => {
    switch (subjectDisplayName) {
      case "لغتي":
        return { icon: <FaBookOpen />, color: "bg-purple-100 text-purple-600" };

      case "الدراسات الإسلامية":
        return { icon: <FaQuran />, color: "bg-green-100 text-green-600" };

      case "اللغة الإنجليزية":
        return { icon: <FaLanguage />, color: "bg-blue-100 text-blue-600" };

      case "العلوم":
        return { icon: <FaFlask />, color: "bg-teal-100 text-teal-600" };

      case "المهارات الحياتية والأسرية":
        return { icon: <FaAppleAlt />, color: "bg-pink-100 text-pink-600" };

      case "المهارات الرقمية":
        return {
          icon: <FaLaptopCode />,
          color: "bg-orange-100 text-orange-600",
        };

      case "الدراسات الاجتماعية":
        return { icon: <FaGlobe />, color: "bg-yellow-100 text-yellow-600" };

      // ✅ الرياضيات
      case "الرياضيات":
        return { icon: <FaCalculator />, color: "bg-red-100 text-red-600" };
      // تقدر تغيّر اللون لو عايز الأزرق أو الأخضر

      default:
        return { icon: <FaBookOpen />, color: "bg-gray-100 text-gray-500" };
    }
  };

  // Show placeholder message when pending conversation exists
  if (placeholderMessage && !activeThread) {
    return (
      <div className="flex flex-col flex-grow bs-full w-full">
        {/* Placeholder message section */}

        <div className="flex flex-col flex-auto items-center justify-center gap-[18px] ">
          <EmptyChat />
        </div>

        {/* Message input form for pending conversation */}
        <SendMsgForm
          dispatch={dispatch}
          activeUser={
            {
              // Temporary thread object for pending conversation
              thread_id: "", // Will be created on first message
              thread_name: placeholderMessage.subject,
              pendingConversation: placeholderMessage, // Pass pending state
            } as any
          }
          isBelowSmScreen={isBelowSmScreen}
          messageInputRef={messageInputRef}
          onThreadCreated={onThreadCreated}
        />
      </div>
    );
  }

  // Show curriculum selection when no active thread
  return !chatStore.activeThread ? (
    <CardContent className="flex flex-col flex-auto bs-full height-fit overflow-y-auto">
      <InitialChat
        curriculum={curriculum}
        startSubjectConversation={startSubjectConversation}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        setSidebarOpen={setSidebarOpen}
        setBackdropOpen={setBackdropOpen}
      />
    </CardContent>
  ) : (
    <>
      {activeThread && (
        <div className="flex flex-col flex-grow bs-full bg-backgroundChat">
          <ChatLog
            chatStore={chatStore}
            isBelowMdScreen={isBelowMdScreen}
            isBelowSmScreen={isBelowSmScreen}
            isBelowLgScreen={isBelowLgScreen}
            threadId={getCurrentThreadId() || ""} // Optional prop
          />

          <SendMsgForm
            dispatch={dispatch}
            activeUser={activeThread}
            isBelowSmScreen={isBelowSmScreen}
            messageInputRef={messageInputRef}
            onThreadCreated={onThreadCreated}
          />
        </div>
      )}
    </>
  );
};

export default ChatContent;

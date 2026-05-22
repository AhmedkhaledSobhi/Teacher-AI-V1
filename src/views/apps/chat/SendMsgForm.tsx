// React Imports
import { useRef, useState, useEffect } from "react";
import type { FormEvent, KeyboardEvent, RefObject, MouseEvent } from "react";

// Next.js Imports
import dynamic from "next/dynamic";

// Hook Imports
import { useTranslation } from "@/hooks/useTranslation";

// MUI Imports
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

// Third-party Imports
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useSelector } from "react-redux";

// Type Imports
import type { ContactType, ThreadType } from "@/types/apps/chatTypes";
import type { AppDispatch, RootState } from "@/redux-store";

// Slice Imports
import {
  sendMsgToRAG,
  addMessageToThread,
  addMessageInstantly,
  startNewChat,
  clearPendingConversation,
  updateMessageInChat,
} from "@/redux-store/slices/chat";

// Component Imports
import CustomIconButton from "@core/components/mui/IconButton";
import { Typography } from "@mui/material";
import { getCurrentThreadId, setCurrentThreadId } from "@/utils/localStorage";
import VoiceRecorder from "@/components/chat/VoiceRecorder";

// Client-Side API - Direct backend calls (visible in network tab)
import { initializeThreadClient } from "@/services/chat-api-client";

// Utils
import toastUtils from "@/utils/toast-utils";
import { convertBlobToWav } from "@/utils/audio-converter";
import { useCoreUISound } from "@/hooks/useCoreUISound";

// Dynamically import VoiceRecording to avoid SSR Worker error
// The react-media-recorder library uses Worker API which is not available during SSR
const VoiceRecordingWithPackage = dynamic(() => import("./VoiceRecording"), {
  ssr: false,
  loading: () => null, // Or a loading skeleton if preferred
});

type Props = {
  dispatch: AppDispatch;
  activeUser: ThreadType;
  isBelowSmScreen: boolean;
  messageInputRef: RefObject<HTMLDivElement>;
  onThreadCreated?: () => void;
};

// Emoji Picker Component for selecting emojis
const EmojiPicker = ({
  onChange,
  isBelowSmScreen,
  openEmojiPicker,
  setOpenEmojiPicker,
  anchorRef,
}: {
  onChange: (value: string) => void;
  isBelowSmScreen: boolean;
  openEmojiPicker: boolean;
  setOpenEmojiPicker: (
    value: boolean | ((prevVar: boolean) => boolean)
  ) => void;
  anchorRef: RefObject<HTMLButtonElement>;
}) => {
  return (
    <>
      <Popper
        open={openEmojiPicker}
        transition
        disablePortal
        placement="top-start"
        className="z-[12]"
        anchorEl={anchorRef.current}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "top-start" ? "right top" : "left top",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
                <span>
                  <Picker
                    emojiSize={18}
                    theme="light"
                    data={data}
                    maxFrequentRows={1}
                    onEmojiSelect={(emoji: any) => {
                      onChange(emoji.native);
                      setOpenEmojiPicker(false);
                    }}
                    {...(isBelowSmScreen && { perLine: 8 })}
                  />
                </span>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const SendMsgForm = ({
  dispatch,
  activeUser,
  isBelowSmScreen,
  messageInputRef,
  onThreadCreated,
}: Props) => {
  // Hooks
  const { t } = useTranslation();
  const { play } = useCoreUISound();

  // Access chat store for pending thread
  const chatStore = useSelector((state: RootState) => state.chatReducer);

  // States
  const [msg, setMsg] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [inputType, setInputType] = useState<"text" | "audio" | "image">(
    "text"
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<File | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>();
  const [studyAndLearn, setStudyAndLearn] = useState(false);

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isConvertedRef = useRef<boolean>(false); // Track if audio is already converted

  // Vars
  const open = Boolean(anchorEl);

  const handleToggle = () => {
    setOpenEmojiPicker((prevOpen) => !prevOpen);
  };

  const handleVoiceToggle = () => {
    setShowVoiceRecorder((prev) => !prev);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSendMsg = async (
    event: FormEvent | KeyboardEvent,
    msg: string
  ) => {
    event.preventDefault();

    // VALIDATION: Check if user has selected a subject first
    if (!chatStore.pendingThread && !activeUser?.thread_id) {
      toastUtils.showErrorToast("من فضلك اختر مادة أولاً لبدء المحادثة");
      return;
    }

    if (
      msg.trim() !== "" ||
      (inputType === "audio" && audioFile) ||
      (inputType === "image" && imageFile)
    ) {
      // Store current state for API call (before reset)
      const currentMessage = msg;
      const currentInputType = inputType;
      const currentAudioFile = audioFile;
      const currentImageFile = imageFile;
      const currentImagePreviewUrl = imagePreviewUrl;
      const currentAudioDuration = audioDuration;
      const currentAudioUrl = audioBlob
        ? URL.createObjectURL(audioBlob)
        : undefined;

      // ⚡ INSTANT UI UPDATE - Show message immediately without waiting for API
      play("chat-msg-send");
      dispatch(
        addMessageInstantly({
          message: currentMessage,
          inputType: currentInputType,
          audioFile: currentAudioFile,
          audioUrl: currentAudioUrl,
          audioDuration: currentAudioDuration,
          imagePreviewUrl: currentImagePreviewUrl,
        })
      );

      // Reset form state IMMEDIATELY for better UX
      setMsg("");
      setInputType("text");
      setAudioBlob(null);
      setAudioFile(undefined);
      setImageFile(undefined);
      setImagePreviewUrl(undefined);
      setAudioDuration(0);
      setShowVoiceRecorder(false);
      isConvertedRef.current = false;

      // ���� BACKGROUND API CALL - Process in background, UI already updated
      // Check if we need to create thread first (lazy thread creation)
      if (chatStore.pendingThread && !activeUser?.thread_id) {
        // Store pending thread data before async operation
        const pendingThreadData = {
          grade_id: chatStore.pendingThread.grade_id,
          subject: chatStore.pendingThread.subject,
          term_id: chatStore.pendingThread.term_id,
          user_id: chatStore.pendingThread.user_id,
        };

        // Run thread creation and message send in background
        (async () => {
          try {
            // 🌐 Create thread with DIRECT CLIENT-SIDE API CALL (visible in network tab!)
            const result = await initializeThreadClient(pendingThreadData);

            if (
              result.operation_status === "success" &&
              result.data?.thread_id
            ) {
              const threadId = result.data.thread_id;

              // Generate thread name from user's first message
              const threadName =
                currentMessage.trim().substring(0, 50) +
                (currentMessage.length > 50 ? "..." : "");

              // Set as active thread (preserve temp messages that were just added)
              // IMPORTANT: Preserve subject and display_name from pendingThread
              const threadWithSubject = {
                thread_id: threadId,
                thread_name: threadName || pendingThreadData.subject,
                subject: pendingThreadData.subject,
                display_name:
                  chatStore.pendingThread?.display_name ||
                  pendingThreadData.subject,
              };

              dispatch(
                startNewChat({
                  thread: threadWithSubject,
                  preserveMessages: true, // Preserve temp messages added by addMessageInstantly
                })
              );

              // Clear pending state (but keep activeThread with subject info)
              dispatch(clearPendingConversation());

              // Send message to server (will update the temp messages in UI)
              dispatch(
                addMessageToThread({
                  message: currentMessage,
                  inputType: currentInputType,
                  threadId: threadId,
                  audioFile: currentAudioFile,
                  imageFile: currentImageFile,
                  imagePreviewUrl: currentImagePreviewUrl,
                  audioDuration: currentAudioDuration,
                  studyAndLearn: studyAndLearn,
                  teacherName: "Ahmad",
                })
              );

              // Cache thread after successful message send
              setCurrentThreadId(threadId);

              // Trigger thread list refresh
              if (onThreadCreated) {
                onThreadCreated();
              }
            } else {
              // Thread creation failed - remove temp messages and show error
              const errorMessage =
                result.message || "Failed to create conversation";
              toastUtils.showErrorToast(errorMessage);

              // Remove the temp messages that were added optimistically
              const tempUserIndex = chatStore.messages.findIndex(
                (msg) =>
                  msg?.message_id &&
                  typeof msg.message_id === "string" &&
                  msg.message_id.startsWith("temp_user_")
              );
              const tempAiIndex = chatStore.messages.findIndex(
                (msg) =>
                  msg?.message_id &&
                  typeof msg.message_id === "string" &&
                  msg.message_id.startsWith("temp_ai_")
              );

              // Dispatch action to remove temp messages (we'll add this reducer)
              // For now, we'll update the AI message to show error
              if (tempAiIndex !== -1) {
                dispatch(
                  updateMessageInChat({
                    messageId: chatStore.messages[tempAiIndex].message_id,
                    updates: {
                      content: errorMessage,
                      isGenerating: false,
                      hasError: true,
                      originalMessage: currentMessage,
                      inputType: currentInputType,
                    },
                  })
                );
              }
            }
          } catch (error) {
            console.error("Error creating thread:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to start conversation";
            toastUtils.showErrorToast(errorMessage);

            // Remove the temp messages that were added optimistically
            const tempUserIndex = chatStore.messages.findIndex(
              (msg) =>
                msg?.message_id &&
                typeof msg.message_id === "string" &&
                msg.message_id.startsWith("temp_user_")
            );
            const tempAiIndex = chatStore.messages.findIndex(
              (msg) =>
                msg?.message_id &&
                typeof msg.message_id === "string" &&
                msg.message_id.startsWith("temp_ai_")
            );

            // Update the AI message to show error
            if (tempAiIndex !== -1) {
              dispatch(
                updateMessageInChat({
                  messageId: chatStore.messages[tempAiIndex].message_id,
                  updates: {
                    content: errorMessage,
                    isGenerating: false,
                    hasError: true,
                    originalMessage: currentMessage,
                    inputType: currentInputType,
                  },
                })
              );
            }
          }
        })();
      } else if (activeUser?.thread_id) {
        // Normal message send (thread already exists)
        const threadId = activeUser.thread_id;

        // Send message to server in background (will update the temp messages in UI)
        dispatch(
          addMessageToThread({
            message: currentMessage,
            inputType: currentInputType,
            threadId: threadId,
            audioFile: currentAudioFile,
            imageFile: currentImageFile,
            imagePreviewUrl: currentImagePreviewUrl,
            audioDuration: currentAudioDuration,
            studyAndLearn: studyAndLearn,
            teacherName: "Ahmad",
          })
        );
      } else {
        // Handle case where no thread exists and no pending thread
        console.error("No thread ID or pending thread available");
        toastUtils.showErrorToast("Please select a subject first");
        return;
      }
    }
  };

  // Voice recorder handlers
  const handleVoiceRecordingComplete = async (blob: Blob, duration: number) => {
    try {
      const wavBlob = await convertBlobToWav(blob);
      const wavFile = new File([wavBlob], "voice_message.wav", {
        type: "audio/wav",
      });

      setAudioBlob(blob);
      setAudioFile(wavFile);
      setAudioDuration(duration);
      setInputType("audio");
      isConvertedRef.current = true; // Mark as converted
    } catch (conversionError) {
      console.error("Audio conversion error:", conversionError);
      toastUtils.showErrorToast(
        "Failed to process audio. Please try recording again."
      );
      isConvertedRef.current = false;
    }
  };

  const handleVoiceRecordingClear = () => {
    setAudioBlob(null);
    setAudioFile(undefined);
    setInputType("text");
    setMsg("");
    setAudioDuration(0);
    setShowVoiceRecorder(false);
    isConvertedRef.current = false; // Reset conversion flag
  };

  const handleVoiceRecordingSend = async (blob: Blob, duration: number) => {
    // Check if audio is already converted (from handleVoiceRecordingComplete)
    if (isConvertedRef.current && audioFile && audioBlob === blob) {
      // Audio already converted, just send it
      const syntheticEvent = new Event("submit") as any;
      await handleSendMsg(syntheticEvent, "");
      return;
    }

    // If not converted yet (direct send without preview), convert now
    try {
      const wavBlob = await convertBlobToWav(blob);
      const wavFile = new File([wavBlob], "voice_message.wav", {
        type: "audio/wav",
      });

      // Set the audio data
      setAudioBlob(blob);
      setAudioFile(wavFile);
      setAudioDuration(duration);
      setInputType("audio");
      isConvertedRef.current = true;

      // Wait for state to update, then send
      setTimeout(async () => {
        const syntheticEvent = new Event("submit") as any;
        await handleSendMsg(syntheticEvent, "");
      }, 100);
    } catch (conversionError) {
      console.error("Audio conversion error:", conversionError);
      toastUtils.showErrorToast(
        "Failed to process audio. Please try recording again."
      );
      isConvertedRef.current = false;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Convert image to base64 data URL for persistent storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        setImageFile(file);
        setImagePreviewUrl(base64Url);
        setInputType("image");

        // Close mobile menu if open
        if (isBelowSmScreen && open) {
          handleClose();
        }
      };
      reader.readAsDataURL(file);
    } else if (file) {
      // Show error for non-image files
      toastUtils.showErrorToast("Please select an image file");
    }

    // Reset the input value so the same file can be selected again
    event.target.value = "";
  };

  const clearImageUpload = () => {
    // No need to revoke URL since we're using base64 data URLs now
    setImageFile(undefined);
    setImagePreviewUrl(undefined);
    setInputType("text");
    setMsg("");
  };

  const handleInputEndAdornment = () => {
    const hasMessage =
      msg.trim().length > 0 ||
      (inputType === "audio" && audioFile) ||
      (inputType === "image" && imageFile);

    return (
      <>
        <Box className="flex items-center gap-1">
          {/* Enhanced Action Buttons */}
          {!isBelowSmScreen && (
            <>
              <Tooltip
                title={t("chat.sendForm.tooltips.voiceInput")}
                arrow
              >
                <IconButton
                  onClick={handleVoiceToggle}
                  className="hover:bg-action-hover transition-colors"
                  size="small"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="34"
                    viewBox="0 0 34 34"
                    fill="none"
                  >
                    <path
                      d="M11.8998 8.50039C11.8998 5.68477 14.1842 3.40039 16.9998 3.40039C19.672 3.40039 21.8661 5.45633 22.0839 8.07539H19.1248C18.4182 8.07539 17.8498 8.64383 17.8498 9.35039C17.8498 10.057 18.4182 10.6254 19.1248 10.6254H22.0998V13.1754H19.1248C18.4182 13.1754 17.8498 13.7438 17.8498 14.4504C17.8498 15.157 18.4182 15.7254 19.1248 15.7254H22.0839C21.8661 18.3445 19.6773 20.4004 16.9998 20.4004C14.1842 20.4004 11.8998 18.116 11.8998 15.3004V8.50039ZM8.0748 11.9004C8.78137 11.9004 9.3498 12.4688 9.3498 13.1754V15.3004C9.3498 19.5238 12.7764 22.9504 16.9998 22.9504C21.2232 22.9504 24.6498 19.5238 24.6498 15.3004V13.1754C24.6498 12.4688 25.2182 11.9004 25.9248 11.9004C26.6314 11.9004 27.1998 12.4688 27.1998 13.1754V15.3004C27.1998 20.5013 23.3057 24.7938 18.2748 25.4207V28.0504H20.8248C21.5314 28.0504 22.0998 28.6188 22.0998 29.3254C22.0998 30.032 21.5314 30.6004 20.8248 30.6004H13.1748C12.4682 30.6004 11.8998 30.032 11.8998 29.3254C11.8998 28.6188 12.4682 28.0504 13.1748 28.0504H15.7248V25.4207C10.6939 24.7938 6.7998 20.5013 6.7998 15.3004V13.1754C6.7998 12.4688 7.36824 11.9004 8.0748 11.9004Z"
                      fill="#EC003F"
                    />
                  </svg>{" "}
                </IconButton>
              </Tooltip>

              <Tooltip
                title={t("chat.sendForm.tooltips.attachImage")}
                arrow
              >
                <IconButton
                  component="label"
                  htmlFor="upload-img"
                  className="hover:bg-action-hover transition-colors"
                  size="small"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <path
                      opacity="0.4"
                      d="M15.4286 12C13.5375 12 12 13.5375 12 15.4286V32.5714C12 34.4625 13.5375 36 15.4286 36H32.5714C34.4625 36 36 34.4625 36 32.5714V15.4286C36 13.5375 34.4625 12 32.5714 12H15.4286ZM18.8571 16.2857C20.2768 16.2857 21.4286 17.4375 21.4286 18.8571C21.4286 20.2768 20.2768 21.4286 18.8571 21.4286C17.4375 21.4286 16.2857 20.2768 16.2857 18.8571C16.2857 17.4375 17.4375 16.2857 18.8571 16.2857ZM26.5714 22.2857C27.0214 22.2857 27.4339 22.5214 27.6696 22.9018L32.3839 30.6161C32.625 31.0125 32.6357 31.5107 32.4107 31.9179C32.1857 32.325 31.7518 32.5714 31.2857 32.5714H16.7143C16.2375 32.5714 15.7929 32.3036 15.5732 31.8804C15.3536 31.4571 15.3857 30.9429 15.6589 30.5518L18.6589 26.2661C18.9 25.9232 19.2911 25.7196 19.7143 25.7196C20.1375 25.7196 20.5286 25.9232 20.7696 26.2661L22.1839 28.2911L25.4732 22.9071C25.7089 22.5268 26.1214 22.2911 26.5714 22.2911V22.2857Z"
                      fill="url(#paint0_linear_550_13326)"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_550_13326"
                        x1="12"
                        y1="12"
                        x2="36"
                        y2="36"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#8B5CF6" />
                        <stop
                          offset="1"
                          stop-color="#6948B8"
                        />
                      </linearGradient>
                    </defs>
                  </svg>{" "}
                  <input
                    hidden
                    type="file"
                    id="upload-img"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* Mobile Menu */}
          {isBelowSmScreen && (
            <>
              <IconButton
                id="option-menu"
                aria-haspopup="true"
                {...(open && {
                  "aria-expanded": true,
                  "aria-controls": "share-menu",
                })}
                onClick={handleClick}
                ref={anchorRef}
                size="small"
              >
                <i className="tabler-dots-vertical text-textSecondary" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    handleToggle();
                    handleClose();
                  }}
                >
                  <i className="tabler-mood-smile mr-2" />
                  {t("chat.sendForm.labels.emoji")}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleVoiceToggle();
                    handleClose();
                  }}
                >
                  <i className="tabler-microphone mr-2" />
                  {t("chat.sendForm.labels.voice")}
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    // Prevent menu close when clicking on the label
                    e.stopPropagation();
                    // Trigger file input click
                    const fileInput = document.getElementById(
                      "upload-img-mobile"
                    ) as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  className="p-0"
                >
                  <label
                    htmlFor="upload-img-mobile"
                    className="flex items-center plb-2 pli-4 w-full cursor-pointer"
                    onClick={(e) => {
                      // Prevent event bubbling to MenuItem
                      e.stopPropagation();
                    }}
                  >
                    <i className="tabler-paperclip mr-2" />
                    {t("chat.sendForm.labels.attachImage")}
                    <input
                      hidden
                      type="file"
                      id="upload-img-mobile"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Enhanced Send Button */}
          <Tooltip
            title={
              hasMessage
                ? t("chat.sendForm.tooltips.sendMessage")
                : t("chat.sendForm.tooltips.sendMessageFirst")
            }
            arrow
          >
            <span>
              {isBelowSmScreen ? (
                <CustomIconButton
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!hasMessage}
                  className={`transition-all duration-200 ${
                    hasMessage
                      ? "bg-gradient-to-r from-primary-main to-primary-dark hover:shadow-lg transform hover:scale-105"
                      : "opacity-50"
                  }`}
                  size="small"
                >
                  <i className="tabler-send" />
                </CustomIconButton>
              ) : (
                <IconButton
                  type="submit"
                  disabled={!hasMessage}
                  sx={{
                    borderRadius: "40px",
                    opacity: 0.7,
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #6948B8 100%), #FFF",
                    "&:hover": {
                      opacity: 1,
                      background:
                        "linear-gradient(135deg, #8B5CF6 0%, #6948B8 100%), #FFF",
                    },
                    "&.Mui-disabled": {
                      opacity: 0.5,
                    },
                  }}
                  className="transition-all text-secondary duration-200"
                >
                  <i className="tabler-send" />
                </IconButton>
              )}
            </span>
          </Tooltip>
        </Box>
      </>
    );
  };

  return (
    <Box className="relative">
      {/* Study & Learn mode toggle */}
      <Box className="px-6 pt-2 flex items-center gap-2">
        <Tooltip
          title={
            studyAndLearn
              ? "وضع التعلم التفصيلي مفعّل — إجابات أكثر تعمقاً وشرحاً"
              : "فعّل وضع التعلم للحصول على شرح تفصيلي"
          }
          arrow
        >
          <Chip
            label={studyAndLearn ? "وضع التعلم" : "وضع الإجابة السريعة"}
            icon={
              <i
                className={`${studyAndLearn ? "tabler-school" : "tabler-bolt"} text-xs`}
                style={{ fontSize: 14 }}
              />
            }
            onClick={() => setStudyAndLearn((prev) => !prev)}
            size="small"
            variant={studyAndLearn ? "filled" : "outlined"}
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "12px",
              borderRadius: "20px",
              transition: "all 0.2s ease",
              ...(studyAndLearn
                ? {
                    background:
                      "linear-gradient(135deg, #7C4DFF 0%, #5531A8 100%)",
                    color: "#fff",
                    borderColor: "transparent",
                    "& .MuiChip-icon": { color: "#fff" },
                  }
                : {
                    borderColor: "rgba(124,77,255,0.4)",
                    color: "#7C4DFF",
                    "& .MuiChip-icon": { color: "#7C4DFF" },
                  }),
            }}
          />
        </Tooltip>
      </Box>

      {/* Enhanced Input Form */}
      <Box className="px-6 pb-[75px]">
        <form
          autoComplete="off"
          onSubmit={(event) => handleSendMsg(event, msg)}
        >
          {/* Image Preview Section */}
          {inputType === "image" && imagePreviewUrl && (
            <Box className="mb-4 p-4  rounded-lg border border-gray-200">
              <Box className="flex items-start gap-3">
                <Box className="relative">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                </Box>
                <Box className="flex-1 min-w-0">
                  <Typography
                    variant="body2"
                    className="font-medium text-gray-900 mb-1"
                  >
                    {t("chat.sendForm.labels.imagePreview")}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-gray-600 block mb-2"
                  >
                    {imageFile?.name} (
                    {imageFile && (imageFile.size / 1024).toFixed(1)} KB)
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={clearImageUpload}
                    startIcon={<i className="tabler-x" />}
                    className="text-xs"
                  >
                    {t("chat.sendForm.labels.remove")}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          <Box className="relative">
            {/* Voice Recorder */}
            {showVoiceRecorder ? (
              <VoiceRecordingWithPackage
                autoStart={true}
                onRecordingComplete={handleVoiceRecordingComplete}
                onCancel={handleVoiceRecordingClear}
                onSend={handleVoiceRecordingSend}
              />
            ) : (
              <TextField
                fullWidth
                multiline
                maxRows={6}
                minRows={1}
                disabled={!activeUser?.thread_id && !chatStore.pendingThread}
                placeholder={
                  inputType === "audio" && audioBlob
                    ? "" // Empty placeholder when we have audio - we'll show custom content
                    : inputType === "image"
                      ? `🖼️ ${t("chat.placeholders.imageAttached")}`
                      : activeUser?.thread_id || chatStore.pendingThread
                        ? t("chat.placeholders.askTeacher")
                        : t("chat.placeholders.selectSubject")
                }
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                sx={{
                  "& fieldset": {
                    border: "2px solid transparent",
                    borderRadius: "20px",
                  },
                  "& .MuiOutlinedInput-root": {
                    background: audioBlob
                      ? "rgba(34, 197, 94, 0.05)"
                      : "rgba(105, 72, 184, 0.60",
                    boxShadow: audioBlob
                      ? "0 0 0 2px rgba(34, 197, 94, 0.2), 0 8px 32px rgba(34, 197, 94, 0.15)"
                      : activeUser?.thread_id || chatStore.pendingThread
                        ? "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)"
                        : "var(--mui-customShadows-xs)",
                    borderRadius: "20px",
                    fontSize: "16px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow:
                        activeUser?.thread_id || chatStore.pendingThread
                          ? "0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)"
                          : "var(--mui-customShadows-sm)",
                      transform: "translateY(-1px)",
                    },
                    "&.Mui-focused": {
                      boxShadow:
                        activeUser?.thread_id || chatStore.pendingThread
                          ? "0 16px 48px rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.12)"
                          : "var(--mui-customShadows-md)",
                      transform: "translateY(-2px)",
                      "& fieldset": {
                        borderColor: "var(--mui-palette-primary-main)",
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "10px 20px",
                      fontSize: "16px",
                      lineHeight: "1.5",
                      "&::placeholder": {
                        color: "var(--mui-palette-text-secondary)",
                        opacity: 0.7,
                        fontStyle: "italic",
                      },
                    },
                  },
                }}
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMsg(e, msg);
                  }
                }}
                inputRef={messageInputRef}
                slotProps={{
                  input: {
                    endAdornment: handleInputEndAdornment(),
                  },
                }}
              />
            )}
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default SendMsgForm;

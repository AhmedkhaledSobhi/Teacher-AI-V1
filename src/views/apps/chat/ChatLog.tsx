"use client";
// React Imports
import { useEffect, useRef, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";

// MUI Imports
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

// Third-party Imports
import classnames from "classnames";
import PerfectScrollbar from "react-perfect-scrollbar";
import ReactMarkdown from "react-markdown";

// Type Imports
import type { ChatDataType } from "@/types/apps/chatTypes";
import { generateAudioForMessage } from "@/utils/chat-api";

// Component Imports
import ImageGallery from "@components/dialogs/ImageGallery";
import remarkGfm from "remark-gfm";
import EmptyChat from "./emptyChat";
import { useCoreUISound } from "@/hooks/useCoreUISound";

// Audio Message Component
const AudioMessage = ({
  audioUrl,
  audioDuration,
  isUser,
}: {
  audioUrl: string;
  audioDuration?: number;
  isUser: boolean;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.error("Error playing audio");
        setIsPlaying(false);
        audioRef.current = null;
      };
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        ?.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
    }
  };

  // useEffect(() => {
  //   return () => {
  //     if (audioRef.current) {
  //       audioRef.current.pause();
  //       audioRef.current = null;
  //     }
  //   };
  // }, []);

  return (
    <div className={`mb-2 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs p-3 rounded-lg border shadow-sm ${
          isUser
            ? "bg-blue-500 text-white border-blue-600"
            : "bg-white border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <IconButton
            onClick={togglePlayPause}
            size="small"
            className={`${
              isUser
                ? "text-white hover:bg-blue-600"
                : "text-blue-600 hover:bg-blue-50"
            } transition-colors`}
            sx={{ width: 32, height: 32, minWidth: 32 }}
          >
            <i
              className={`${
                isPlaying ? "tabler-player-pause" : "tabler-player-play"
              } text-sm`}
            />
          </IconButton>

          {/* Waveform visualization */}
          <div className="flex items-center gap-1 flex-1">
            {[12, 8, 16, 20, 14, 18, 10, 22, 16, 12, 18, 14, 20, 16, 12].map(
              (height, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    isPlaying ? "animate-pulse" : ""
                  }`}
                  style={{
                    width: "3px",
                    height: `${height}px`,
                    backgroundColor: isUser
                      ? "rgba(255,255,255,0.7)"
                      : "var(--chat-waveform-color)",
                    opacity: isPlaying ? 0.8 : 0.4,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              )
            )}
          </div>

          {/* Duration */}
          <Typography
            variant="caption"
            className={`font-mono min-w-fit ${
              isUser ? "text-blue-100" : "text-gray-600"
            }`}
          >
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
          </Typography>
        </div>
      </div>
    </div>
  );
};

type ChatLogProps = {
  chatStore: ChatDataType;
  isBelowLgScreen: boolean;
  isBelowMdScreen: boolean;
  isBelowSmScreen: boolean;
  threadId?: string; // Add optional threadId prop
};

// Wrapper for the chat log to handle scrolling
const ScrollWrapper = ({
  children,
  isBelowLgScreen,
  scrollRef,
  className,
}: {
  children: ReactNode;
  isBelowLgScreen: boolean;
  scrollRef: MutableRefObject<HTMLDivElement | any>;
  className?: string;
}) => {
  if (isBelowLgScreen) {
    return (
      <div
        ref={scrollRef}
        className={classnames(
          "bs-full overflow-y-auto overflow-x-hidden",
          className
        )}
      >
        {children}
      </div>
    );
  } else {
    return (
      <PerfectScrollbar
        ref={scrollRef}
        options={{ wheelPropagation: false }}
        className={className}
      >
        {children}
      </PerfectScrollbar>
    );
  }
};

// Beautiful animated AI loading bubble shown while the AI is thinking
const AiLoadingBubble = () => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Phase 1: "سأجيبك خلال لحظات..." appears after 400ms
    const t1 = setTimeout(() => setPhase(1), 400);
    // Phase 2: "سؤال رائع!" appears after 1.8s
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "14px 18px",
        minWidth: "200px",
      }}
    >
      {/* Animated dots row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "13px",
            color: "var(--chat-ai-thinking-text)",
            fontWeight: 600,
            fontFamily: "Tajawal, Cairo, sans-serif",
          }}
        >
          معلمك الذكي يفكر
        </span>
        <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--chat-ai-thinking-text) 0%, var(--chat-ai-phrase-text) 100%)",
                animation: "ai-dot-bounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </span>
      </div>

      {/* Phase 1: "great question" badge */}
      {phase >= 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--chat-ai-bubble-bg)",
            borderRadius: "12px",
            padding: "8px 12px",
            animation: "ai-phrase-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <span style={{ fontSize: "18px" }}>🌟</span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--chat-ai-phrase-text)",
              fontFamily: "Tajawal, Cairo, sans-serif",
            }}
          >
            سؤال رائع!
          </span>
        </div>
      )}

      {/* Phase 2: "answering shortly" message */}
      {phase >= 2 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "ai-phrase-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <span style={{ fontSize: "16px" }}>✨</span>
          <span
            style={{
              fontSize: "13px",
              color: "var(--chat-ai-subtext)",
              fontFamily: "Tajawal, Cairo, sans-serif",
            }}
          >
            سأجيبك خلال لحظات...
          </span>
        </div>
      )}

      <style>{`
        @keyframes ai-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes ai-phrase-in {
          from { opacity: 0; transform: translateY(6px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
};

const ChatLog = ({
  chatStore,
  isBelowLgScreen,
  isBelowMdScreen,
  isBelowSmScreen,
  threadId,
}: ChatLogProps) => {
  // Vars
  const activeUserChat = chatStore.messages;
  // Refs
  const scrollRef = useRef<HTMLDivElement | any>(null);

  // Sound
  const { play: playSound } = useCoreUISound();
  // Track which message IDs have already fired the receive sound.
  const receivedIdsRef = useRef<Set<string>>(new Set());

  // Play chat-msg-receive exactly once whenever an AI message finishes generating.
  useEffect(() => {
    const aiMessages = activeUserChat?.filter(
      (m) => m && !m.isGenerating && m.message_id
    );
    let fired = false;
    for (const msg of aiMessages) {
      if (!receivedIdsRef.current.has(msg.message_id)) {
        receivedIdsRef.current.add(msg.message_id);
        fired = true;
      }
    }
    if (fired) {
      playSound("chat-msg-receive");
    }
  }, [activeUserChat, playSound]);

  // State for text-to-speech
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [loadingAudioMessageId, setLoadingAudioMessageId] = useState<
    string | null
  >(null);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State for image gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Gallery handlers
  const openGallery = (images: string[], startIndex: number = 0) => {
    setGalleryImages(images);
    setCurrentImageIndex(startIndex);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setGalleryImages([]);
    setCurrentImageIndex(0);
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Text-to-speech handler with API integration
  const handleTextToSpeech = async (messageId: string) => {
    try {
      // If already playing this message, stop it
      if (speakingMessageId === messageId) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
        setSpeakingMessageId(null);
        return;
      }

      // Stop any ongoing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSpeakingMessageId(null);

      // Check if audio is already cached
      if (audioCache.has(messageId)) {
        const cachedUrl = audioCache.get(messageId)!;
        // For Safari: play immediately while still in user interaction context
        playAudio(cachedUrl, messageId);
        return;
      }

      // Show loading state
      setLoadingAudioMessageId(messageId);

      // Call API to generate audio
      const response = await generateAudioForMessage(messageId);
      // Hide loading state
      setLoadingAudioMessageId(null);

      // Handle response
      if (
        response.operation_status === "success" &&
        response.generated_audio_file_url
      ) {
        // Cache the audio URL
        setAudioCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(messageId, response.generated_audio_file_url!);
          return newCache;
        });

        // Play the audio (backend returns MP3 format)
        // Note: In Safari, play() must be called in response to user interaction
        // Since we're after an await, we use a workaround by creating the audio
        // element and loading it, then playing it
        playAudio(response.generated_audio_file_url, messageId);
      } else {
        // Handle error
        console.error("Failed to generate audio:", response.message);
        // Optionally show a toast notification
        if (typeof window !== "undefined") {
          const { toast } = await import("react-toastify");
          toast.error(response.message || "Failed to generate audio");
        }
      }
    } catch (error) {
      console.error("Error in handleTextToSpeech:", error);
      setLoadingAudioMessageId(null);
      setSpeakingMessageId(null);

      // Show error notification
      if (typeof window !== "undefined") {
        const { toast } = await import("react-toastify");
        toast.error("An error occurred while generating audio");
      }
    }
  };

  // Helper function to play audio (backend returns MP3 format)
  const playAudio = (audioUrl: string, messageId: string) => {
    try {
      // Clean up any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Backend returns MP3 format, use it directly
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Safari compatibility: Set preload and crossOrigin
      audio.preload = "auto";
      // Only set crossOrigin if the URL is from a different origin
      // This can cause CORS issues if not properly configured on the server
      try {
        const url = new URL(audioUrl, window.location.href);
        if (url.origin !== window.location.origin) {
          audio.crossOrigin = "anonymous";
        }
      } catch (e) {
        // If URL parsing fails, try with crossOrigin anyway
        audio.crossOrigin = "anonymous";
      }

      // Set up event listeners
      audio.onloadeddata = () => {
        setSpeakingMessageId(messageId);
      };

      audio.oncanplay = () => {
        // Audio is ready to play
        setSpeakingMessageId(messageId);
      };

      audio.onplay = () => {
        setSpeakingMessageId(messageId);
      };

      audio.onended = () => {
        setSpeakingMessageId(null);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };

      audio.onerror = (event) => {
        console.error("Audio playback error:", event, audio.error);
        setSpeakingMessageId(null);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }

        // Show error notification with better error handling
        if (typeof window !== "undefined") {
          import("react-toastify").then(({ toast }) => {
            let errorMsg = "Failed to play audio";

            // Try to get error message from audio.error
            if (audio.error) {
              // MediaError constants (for browser compatibility)
              const MEDIA_ERR_ABORTED = 1;
              const MEDIA_ERR_NETWORK = 2;
              const MEDIA_ERR_DECODE = 3;
              const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

              switch (audio.error.code) {
                case MEDIA_ERR_ABORTED:
                  errorMsg = "Audio playback was aborted";
                  break;
                case MEDIA_ERR_NETWORK:
                  errorMsg = "Network error while loading audio";
                  break;
                case MEDIA_ERR_DECODE:
                  errorMsg = "Audio format not supported or corrupted";
                  break;
                case MEDIA_ERR_SRC_NOT_SUPPORTED:
                  errorMsg = "Audio format not supported by your browser";
                  break;
                default:
                  errorMsg = audio.error.message || "Failed to play audio";
              }
            }

            toast.error(errorMsg);
          });
        }
      };

      audio.onpause = () => {
        if (audio.currentTime === 0 || audio.ended) {
          setSpeakingMessageId(null);
        }
      };

      // Safari compatibility: Load audio first, then play
      const playAudioAfterLoad = async () => {
        try {
          // For Safari: Load the audio first (required for Safari)
          // Check if audio is already loaded
          if (audio.readyState >= 2) {
            // HAVE_CURRENT_DATA or higher - audio is ready
            try {
              await audio.play();
              return;
            } catch (playError: any) {
              // If play fails, try loading first
            }
          }

          // Load the audio first (required for Safari)
          audio.load();

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Audio load timeout"));
            }, 10000); // 10 second timeout

            const onCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener("canplay", onCanPlay);
              audio.removeEventListener("error", onError);
              resolve();
            };

            const onError = () => {
              clearTimeout(timeout);
              audio.removeEventListener("canplay", onCanPlay);
              audio.removeEventListener("error", onError);
              reject(new Error("Failed to load audio"));
            };

            if (audio.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
            } else {
              audio.addEventListener("canplay", onCanPlay);
              audio.addEventListener("error", onError);
            }
          });

          // Play the audio after it's loaded
          await audio.play();
        } catch (error: any) {
          console.error("Error starting audio playback:", error);
          setSpeakingMessageId(null);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }

          // Show error notification with more details
          if (typeof window !== "undefined") {
            import("react-toastify").then(({ toast }) => {
              let errorMessage = "Failed to start audio playback";

              if (error?.name === "NotAllowedError") {
                errorMessage = "Please click the play button to start audio";
              } else if (error?.name === "NotSupportedError") {
                errorMessage = "Audio format not supported by your browser";
              } else if (error?.message) {
                errorMessage = error.message;
              }

              toast.error(errorMessage);
            });
          }
        }
      };

      // Start loading and playing
      playAudioAfterLoad();
    } catch (error) {
      console.error("Error creating audio element:", error);
      setSpeakingMessageId(null);
      audioRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  return (
    <>
      <ScrollWrapper
        isBelowLgScreen={isBelowLgScreen}
        scrollRef={scrollRef}
      >
        <CardContent className="p-0">
          {/* Loading Skeleton */}
          {chatStore.messagesLoading && (
            <div className="mb-6">
              {/* Generate 3 skeleton messages */}
              {[1, 2, 3, 4, 5].map((item, index) => {
                const isUser = index % 2 === 0; // Alternate between user and AI messages
                return (
                  <div
                    key={`skeleton-${index}`}
                    className={classnames("w-full py-4 px-4")}
                  >
                    <div
                      className={classnames(
                        "flex gap-4",
                        isUser ? "flex-row" : "flex-row-reverse"
                      )}
                    >
                      {/* Avatar Skeleton */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full ${isUser ? "bg-primary" : "bg-green-600"} opacity-40 animate-pulse flex items-center justify-center`}
                        >
                          <Typography
                            variant="caption"
                            className="text-white font-semibold opacity-50"
                          >
                            {isUser ? "U" : "AI"}
                          </Typography>
                        </div>
                      </div>

                      {/* Message content skeleton */}
                      <div
                        className={classnames("min-w-0", {
                          "text-right": isUser,
                        })}
                      >
                        <div
                          className={classnames(
                            "flex items-center gap-2 mb-1",
                            {
                              "justify-end": isUser,
                            }
                          )}
                        >
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div
                          className={classnames({
                            "text-left": isUser,
                            "text-right": !isUser,
                          })}
                        >
                          {/* Text Message Skeleton */}
                          <div
                            className={classnames(
                              "whitespace-pre-wrap p-4 shadow-xs rounded animate-pulse",
                              {
                                "bg-backgroundPaper/50 rounded-e rounded-b":
                                  !isUser,
                                "bg-primary/30 rounded-s rounded-b": isUser,
                              }
                            )}
                            style={{ wordBreak: "break-word" }}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="h-3 bg-gray-200 rounded w-full"></div>
                              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                              {!isUser && (
                                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Empty state with loading */}
          {(!activeUserChat || activeUserChat.length === 0) && (
            <div className="flex flex-col items-center justify-center h-64 p-6">
              <EmptyChat />
              {/* <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <i className="tabler-messages text-2xl text-gray-400" />
              </div>
              <Typography
                variant="h6"
                className="text-gray-600 mb-2"
              >
                لا توجد رسائل بعد
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-500 text-center max-w-md"
              >
                ابدأ المحادثة بإرسال رسالة أدناه.
              </Typography> */}
            </div>
          )}

          {activeUserChat && activeUserChat.length > 0 && (
            <div className="mb-6">
              {activeUserChat.map((message, index) => {
                // Handle both thread message format (with role) and regular chat message format (with senderId)
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.message_id || index}
                    className={classnames("w-full py-4 px-4")}
                  >
                    <div
                      className={classnames(
                        "flex gap-4",
                        isUser ? "flex-row" : "flex-row-reverse" // User messages on the right
                      )}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {isUser ? (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Typography
                              variant="caption"
                              className="text-white font-semibold"
                            >
                              U
                            </Typography>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                            <Typography
                              variant="caption"
                              className="text-white font-semibold"
                            >
                              AI
                            </Typography>
                          </div>
                        )}
                      </div>

                      {/* Message content */}
                      <div
                        className={classnames(" min-w-0", {
                          "text-right": isUser, // Align user text to the right
                        })}
                      >
                        <div
                          className={classnames(
                            "flex items-center gap-2 mb-1",
                            {
                              "justify-end": isUser, // Align user header to the right
                            }
                          )}
                        >
                          <Typography
                            variant="caption"
                            className="text-gray-500"
                          >
                            {/* {new Date(message.created_at || message.time).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                          })} */}
                          </Typography>
                        </div>
                        <div
                          className={classnames({
                            "text-left": isUser,
                            "text-right": !isUser,
                          })}
                        >
                          {/* Image Display for thread messages */}
                          {message.attached_image && (
                            <div
                              className={classnames("mb-2", {
                                "flex justify-end": isUser,
                                "flex justify-start": !isUser,
                              })}
                            >
                              <div className="relative group">
                                <img
                                  src={message.attached_image}
                                  alt="Shared image"
                                  className="max-w-xs max-h-64 rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                                  onClick={() =>
                                    openGallery([message.attached_image], 0)
                                  }
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const errorDiv =
                                      document.createElement("div");
                                    errorDiv.textContent =
                                      "Failed to load image";
                                    target.parentNode?.appendChild(errorDiv);
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                                  <i className="tabler-external-link text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Illustrative Images Display for thread messages */}
                          {message.illustrative_images &&
                            message.illustrative_images.length > 0 && (
                              <div
                                className={classnames("mb-2", {
                                  "flex justify-start": isUser,
                                  "flex justify-end": !isUser,
                                })}
                              >
                                <div className="max-w-full">
                                  <div
                                    className="flex gap-2 overflow-x-auto pb-2"
                                    style={{
                                      flexWrap:
                                        message.illustrative_images.length <= 4
                                          ? "nowrap"
                                          : "wrap",
                                    }}
                                  >
                                    {message.illustrative_images.map(
                                      (imageUrl, imgIndex) => (
                                        <div
                                          key={imgIndex}
                                          className="relative group flex-shrink-0"
                                          style={{
                                            minWidth: "120px",
                                            maxWidth: "200px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            openGallery(
                                              message.illustrative_images || [],
                                              imgIndex
                                            )
                                          }
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`Illustrative image ${imgIndex + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                                            onError={(e) => {
                                              const target =
                                                e.target as HTMLImageElement;
                                              target.style.display = "none";
                                              const errorDiv =
                                                document.createElement("div");
                                              errorDiv.className =
                                                "w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 text-gray-500 text-sm";
                                              errorDiv.textContent =
                                                "Failed to load image";
                                              target.parentNode?.appendChild(
                                                errorDiv
                                              );
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                                            <i className="tabler-external-link text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Audio Display for thread messages */}
                          {message.generated_audio === "audio" &&
                            message.audioUrl && (
                              <AudioMessage
                                audioUrl={message.audioUrl}
                                audioDuration={message.audioDuration}
                                isUser={isUser}
                              />
                            )}

                          {/* Text Message for thread messages */}
                          {message.content && (
                            <Typography
                              key={index}
                              component="div"
                              className={classnames(" p-4 shadow-xs", {
                                "bg-backgroundPaper rounded-e rounded-b":
                                  !isUser && !message.isGenerating,
                                "bg-primary text-[var(--mui-palette-primary-contrastText)] rounded-s rounded-b":
                                  isUser,
                                "bg-info-light text-info-dark rounded-e rounded-b":
                                  false,
                                "bg-backgroundPaper rounded-e rounded-b animate-pulse":
                                  !isUser && message.isGenerating,
                              })}
                            >
                              {!isUser ? (
                                <>
                                  <span className="block">
                                    {message.content ===
                                      "جاري معالجه الطلب ..." &&
                                    !message.error ? (
                                      <AiLoadingBubble />
                                    ) : message.hasError ? (
                                      <div
                                        className="flex flex-col p-3 cursor-pointer  transition-colors"
                                        onClick={() => {
                                          // Dispatch retry action when clicking anywhere on the error message
                                          window.dispatchEvent(
                                            new CustomEvent("retry-message", {
                                              detail: {
                                                messageId: message.message_id,
                                              },
                                            })
                                          );
                                        }}
                                      >
                                        <div className="flex items-center text-red-600 mb-2">
                                          <i className="tabler-alert-circle mr-2 text-lg" />
                                          <span className="font-medium">
                                            {message.error ||
                                              "Failed to send message"}
                                          </span>
                                        </div>
                                        <div className="text-gray-600 text-sm mb-3 ml-6">
                                          {message.originalMessage && (
                                            <div className="italic">
                                              in message: "
                                              {message.originalMessage.length >
                                              50
                                                ? message.originalMessage.substring(
                                                    0,
                                                    50
                                                  ) + "..."
                                                : message.originalMessage}
                                              "
                                            </div>
                                          )}
                                        </div>
                                        <Button
                                          variant="contained"
                                          color="error"
                                          size="small"
                                          startIcon={
                                            <i className="tabler-refresh" />
                                          }
                                          className="self-start hover:bg-red-700 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Dispatch retry action here - same as the parent div
                                            window.dispatchEvent(
                                              new CustomEvent("retry-message", {
                                                detail: {
                                                  messageId: message.message_id,
                                                },
                                              })
                                            );
                                          }}
                                        >
                                          Retry Message
                                        </Button>
                                      </div>
                                    ) : (
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                      >
                                        {message.content.replace(/\\n/g, "\n")}
                                      </ReactMarkdown>
                                    )}
                                  </span>
                                </>
                              ) : (
                                message.content
                              )}
                            </Typography>
                          )}
                          {!isUser && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleTextToSpeech(message.message_id)
                              }
                              className="mt-2"
                              disabled={
                                loadingAudioMessageId === message.message_id
                              }
                              color={
                                speakingMessageId === message.message_id
                                  ? "primary"
                                  : "default"
                              }
                            >
                              {loadingAudioMessageId === message.message_id ? (
                                <i className="tabler-loader-2 animate-spin" />
                              ) : speakingMessageId === message.message_id ? (
                                <i className="tabler-player-pause" />
                              ) : (
                                <i className="tabler-volume" />
                              )}
                            </IconButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Separator */}
            </div>
          )}
        </CardContent>
      </ScrollWrapper>

      {/* Image Gallery Dialog */}
      <ImageGallery
        open={galleryOpen}
        onClose={closeGallery}
        images={galleryImages}
        currentIndex={currentImageIndex}
        onImageChange={handleImageChange}
        title="Image Gallery"
      />
    </>
  );
};

export default ChatLog;

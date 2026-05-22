"use client";

import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography, Chip } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";

export interface VoiceRecorderProps {
  onRecordingComplete?: (
    audioBlob: Blob,
    duration: number,
    audioUrl: string
  ) => void;
  onRecordingClear?: () => void;
  onSendRecording?: (
    audioBlob: Blob,
    duration: number,
    audioUrl: string
  ) => void;
  className?: string;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

export interface VoiceRecorderState {
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isPlaying: boolean;
  audioDuration: number;
  hasRecording: boolean;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onRecordingClear,
  onSendRecording,
  className = "",
  disabled = false,
  maxDuration = 300, // 5 minutes default
}: VoiceRecorderProps) {
  const { t } = useTranslation();

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    if (disabled) return;

    try {
      // Check if browser supports audio recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(t("chat.sendForm.alerts.audioNotSupported"));
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to find the best supported audio format
      // Prefer formats that are more compatible with AudioContext decoding
      let mimeType = "audio/webm";
      let codecOptions = [
        "audio/webm;codecs=pcm", // PCM is most compatible
        "audio/webm;codecs=opus", // Opus is widely supported
        "audio/webm", // Default WebM
        "audio/mp4", // MP4 fallback
        "audio/ogg;codecs=opus", // OGG with Opus
      ];

      // Find the first supported format
      for (const option of codecOptions) {
        if (MediaRecorder.isTypeSupported(option)) {
          mimeType = option;
          break;
        }
      }

      // Check if any format is supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        alert(t("chat.sendForm.alerts.audioFormatNotSupported"));
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // 128 kbps for good quality
      });
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setAudioDuration(recordingTime);
        setHasRecording(true);

        // Call callback with recording data
        onRecordingComplete?.(blob, recordingTime, url);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        alert(t("chat.sendForm.alerts.recordingError"));
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // Auto-stop if max duration reached
          if (newTime >= maxDuration) {
            stopRecording();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          alert(t("chat.sendForm.alerts.microphoneAccessDenied"));
        } else if (error.name === "NotFoundError") {
          alert(t("chat.sendForm.alerts.microphoneNotFound"));
        } else if (error.name === "NotSupportedError") {
          alert(t("chat.sendForm.alerts.audioNotSupported"));
        } else {
          alert(t("chat.sendForm.alerts.microphonePermissionError"));
        }
      } else {
        alert(t("chat.sendForm.alerts.unexpectedMicrophoneError"));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      }
    }
  };

  const clearRecording = () => {
    // Stop recording if currently recording
    if (isRecording) {
      stopRecording();
    }

    // Clean up audio URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Reset all states
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setAudioDuration(0);
    setIsPlaying(false);
    setHasRecording(false);

    // Call the parent callback
    onRecordingClear?.();
  };

  const playRecording = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      // Pause if currently playing
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
      };

      audio.onpause = () => {
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        audioRef.current = null;
      });
    }
  };

  const sendRecording = () => {
    if (audioBlob && audioUrl) {
      onSendRecording?.(audioBlob, audioDuration, audioUrl);
      // Clear after sending
      clearRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  // If no recording and not recording, show the record button
  if (!isRecording && !hasRecording) {
    return (
      <Box className={`flex items-center ${className}`}>
        <Tooltip
          title="Start voice recording"
          arrow
        >
          <IconButton
            onClick={startRecording}
            disabled={disabled}
            className="hover:bg-action-hover transition-colors"
            size="small"
          >
            <i className="tabler-microphone text-textSecondary hover:text-primary-main transition-colors" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  // If recording, show recording controls
  if (isRecording) {
    return (
      <Box
        className={`flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl ${className}`}
      >
        <Box className="flex items-center gap-2">
          <Box className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <Typography
            variant="body2"
            className="text-red-700 font-medium"
          >
            Recording...
          </Typography>
          <Chip
            label={formatTime(recordingTime)}
            size="small"
            className="bg-red-500 text-white font-mono"
          />
        </Box>

        <Box className="flex items-center gap-1 ml-auto">
          <Tooltip
            title="Stop recording"
            arrow
          >
            <IconButton
              onClick={stopRecording}
              size="small"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <i className="tabler-square text-white" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title="Cancel recording"
            arrow
          >
            <IconButton
              onClick={clearRecording}
              size="small"
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              <i className="tabler-x text-white" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  // If has recording, show playback controls
  return (
    <Box
      className={`flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl ${className}`}
    >
      <Box className="flex items-center gap-2">
        <i className="tabler-microphone text-blue-600" />
        <Typography
          variant="body2"
          className="text-blue-700 font-medium"
        >
          Voice message
        </Typography>
        <Chip
          label={formatTime(audioDuration)}
          size="small"
          className="bg-blue-500 text-white font-mono"
        />
      </Box>

      <Box className="flex items-center gap-1 ml-auto">
        <Tooltip
          title={isPlaying ? "Pause" : "Play recording"}
          arrow
        >
          <IconButton
            onClick={playRecording}
            size="small"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!audioUrl}
          >
            <i
              className={`${isPlaying ? "tabler-player-pause" : "tabler-player-play"} text-white`}
            />
          </IconButton>
        </Tooltip>

        <Tooltip
          title="Remove recording"
          arrow
        >
          <IconButton
            onClick={clearRecording}
            size="small"
            className="bg-gray-500 hover:bg-gray-600 text-white"
          >
            <i className="tabler-trash text-white" />
          </IconButton>
        </Tooltip>

        <Tooltip
          title="Send voice message"
          arrow
        >
          <IconButton
            onClick={sendRecording}
            size="small"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <i className="tabler-send text-white" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

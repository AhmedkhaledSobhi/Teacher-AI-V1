"use client";

import React, { useState, useEffect, useRef } from "react";

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onCancel?: () => void;
  onSend?: (blob: Blob, duration: number) => void;
  autoStart?: boolean;
}

type RecordingStatus = "idle" | "recording" | "stopped";

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  onSend,
  autoStart = false,
}) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [status, setStatus] = useState<RecordingStatus>("idle");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const hasAutoStartedRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Setup audio element for playback
  useEffect(() => {
    if (audioBlob && !audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => {
        setPlaybackTime(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setPlaybackTime(0);
        audio.currentTime = 0;
      });

      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, [audioBlob]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        setStatus("stopped");

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, recordingTime);
        }
      };

      mediaRecorder.start();
      setStatus("recording");

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClear = () => {
    // Clean up audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Clean up the temporary URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    // Stop recording if active
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    }

    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Reset all state
    setAudioBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setPlaybackTime(0);
    setStatus("idle");
    hasAutoStartedRef.current = false;
    audioChunksRef.current = [];

    // Call the cancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  const handleSend = () => {
    if (audioBlob && onSend) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onSend(audioBlob, recordingTime);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Animated wave bars component
  const WaveAnimation = () => {
    const bars = Array.from({ length: 5 }, (_, i) => i);
    return (
      <div className="flex items-center justify-center gap-1 h-8 min-w-[70px] flex-1 px-2">
        {bars.map((i) => (
          <div
            key={i}
            className="w-[3px] h-2 bg-red-500 rounded-[3px] animate-wave"
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  };

  // Waveform visualization for preview
  const WaveformPreview = () => {
    const bars = Array.from({ length: 20 }, (_, i) => {
      const height = 8 + Math.sin(i * 0.5) * 10 + Math.cos(i * 0.3) * 8;
      return height;
    });

    return (
      <div className="flex items-center justify-center gap-[2px] h-8 flex-1 min-w-[80px]">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-[2px] bg-blue-500 rounded-[1px] opacity-60"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    );
  };

  // Auto-start recording when component mounts if autoStart is true
  useEffect(() => {
    if (
      autoStart &&
      status === "idle" &&
      !audioBlob &&
      !hasAutoStartedRef.current
    ) {
      hasAutoStartedRef.current = true;
      startRecording();
    }
  }, [autoStart, status]);

  // Reset recording time when idle and no audio
  useEffect(() => {
    if (status === "idle" && !audioBlob) {
      setRecordingTime(0);
    }
  }, [status, audioBlob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && status === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          ?.getTracks()
          .forEach((track) => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            height: 8px;
            opacity: 0.6;
          }
          50% {
            height: 26px;
            opacity: 1;
          }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s infinite;
        }
      `}</style>

      <div className="w-full h-[45px] bg-white rounded-full px-4 flex items-center justify-between gap-3 shadow-md border border-gray-100">
        {/* PREVIEW MODE - Show playback controls */}
        {audioBlob && status === "stopped" ? (
          <>
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs hover:bg-blue-600 transition-all hover:scale-110 flex-shrink-0"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶️"}
            </button>

            {/* Waveform Visualization */}
            <WaveformPreview />

            {/* Timer showing playback time / total time */}
            <div className="text-sm font-semibold text-gray-600 min-w-[90px] text-center">
              {formatTime(Math.floor(playbackTime))} /{" "}
              {formatTime(recordingTime)}
            </div>

            {/* Send and Cancel buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSend}
                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all hover:scale-110 flex-shrink-0"
                title="Send Voice Message"
              >
                ✓
              </button>
              <button
                onClick={handleClear}
                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110 flex-shrink-0"
                title="Cancel & Delete"
              >
                ✕
              </button>
            </div>
          </>
        ) : (
          // RECORDING MODE - Show recording controls
          <>
            {/* Record/Stop Button */}
            <button
              onClick={status === "recording" ? stopRecording : startRecording}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 ${
                status === "recording"
                  ? "bg-red-600 animate-pulse-ring"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={
                status === "recording" ? "Stop Recording" : "Start Recording"
              }
            >
              {status === "recording" ? "⏹" : "🎤"}
            </button>

            {/* Wave Animation or Status */}
            {status === "recording" ? (
              <WaveAnimation />
            ) : (
              <div className="flex-1 text-center text-sm text-gray-400">
                Click to start recording
              </div>
            )}

            {/* Timer */}
            <div
              className={`text-sm font-semibold min-w-[50px] text-center px-2 py-1 rounded-lg transition-all ${
                status === "recording"
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              {formatTime(recordingTime)}
            </div>

            {/* Cancel button (only show during recording) */}
            {status === "recording" && (
              <button
                onClick={handleClear}
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-all hover:scale-110 flex-shrink-0"
                title="Cancel Recording"
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default VoiceRecorder;

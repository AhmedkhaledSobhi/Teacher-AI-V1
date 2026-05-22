"use client";

import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash } from "react-icons/fa";
import { useTranslation } from "@/hooks/useTranslation";

export interface RecordingProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number, audioUrl: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onRecordingClear?: () => void;
  onRecordingPlay?: () => void;
  onRecordingPause?: () => void;
  className?: string;
  disabled?: boolean;
  maxDuration?: number; // in seconds
  showPlayback?: boolean;
  showTimer?: boolean;
  showClearButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'inline';
  triggerRecording?: boolean; // External trigger for recording
}

export interface RecordingState {
  isRecording: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isPlaying: boolean;
  audioDuration: number;
}

export default function Recording({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onRecordingClear,
  onRecordingPlay,
  onRecordingPause,
  className = "",
  disabled = false,
  maxDuration = 300, // 5 minutes default
  showPlayback = true,
  showTimer = true,
  showClearButton = true,
  size = 'medium',
  variant = 'default',
  triggerRecording = false
}: RecordingProps) {
  const { t } = useTranslation();
  
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Size configurations
  const sizeConfig = {
    small: { button: 'w-8 h-8', icon: 'w-3 h-3', text: 'text-xs' },
    medium: { button: 'w-12 h-12', icon: 'w-5 h-5', text: 'text-sm' },
    large: { button: 'w-16 h-16', icon: 'w-7 h-7', text: 'text-base' }
  };

  const currentSize = sizeConfig[size];

  const startRecording = async () => {
    if (disabled) return;
    
    try {
      // Check if browser supports audio recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(t('chat.sendForm.alerts.audioNotSupported'));
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm') && !MediaRecorder.isTypeSupported('audio/mp4')) {
        alert(t('chat.sendForm.alerts.audioFormatNotSupported'));
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const blob = new Blob(audioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioUrl(url);
        setAudioDuration(recordingTime);
        
        // Call callback with recording data
        onRecordingComplete?.(blob, recordingTime, url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert(t('chat.sendForm.alerts.recordingError'));
        setIsRecording(false);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      onRecordingStart?.();

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
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
      console.error('Error accessing microphone:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert(t('chat.sendForm.alerts.microphoneAccessDenied'));
        } else if (error.name === 'NotFoundError') {
          alert(t('chat.sendForm.alerts.microphoneNotFound'));
        } else if (error.name === 'NotSupportedError') {
          alert(t('chat.sendForm.alerts.audioNotSupported'));
        } else {
          alert(t('chat.sendForm.alerts.microphonePermissionError'));
        }
      } else {
        alert(t('chat.sendForm.alerts.unexpectedMicrophoneError'));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        onRecordingStop?.();
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
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
        onRecordingPause?.();
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
        onRecordingPlay?.();
      };
      
      audio.onpause = () => {
        setIsPlaying(false);
        onRecordingPause?.();
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
        onRecordingPause?.();
      };
      
      audio.onerror = (error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        audioRef.current = null;
      };
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        audioRef.current = null;
      });
    }
  };

  // Watch for external triggerRecording trigger
  useEffect(() => {
    if (triggerRecording && !isRecording && !audioBlob) {
      startRecording();
    }
  }, [triggerRecording, isRecording, audioBlob]);

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

  // Render based on variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`relative flex items-center justify-center ${currentSize.button} rounded-full 
            ${isRecording 
              ? "bg-red-500 animate-pulse" 
              : "bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400"
            } 
            text-white shadow-lg transition-colors`}
        >
          {isRecording ? (
            <FaStop className={currentSize.icon} />
          ) : (
            <FaMicrophone className={currentSize.icon} />
          )}
        </button>

        {showTimer && (isRecording || audioBlob) && (
          <span className={`${currentSize.text} text-gray-600`}>
            {formatTime(isRecording ? recordingTime : audioDuration)}
          </span>
        )}

        {showPlayback && audioBlob && !isRecording && (
          <button
            onClick={playRecording}
            disabled={!audioUrl}
            className={`flex items-center justify-center w-8 h-8 rounded-full 
              ${audioUrl 
                ? "bg-blue-500 hover:bg-blue-600" 
                : "bg-gray-400 cursor-not-allowed"
              } text-white shadow-lg transition-colors`}
          >
            {isPlaying ? (
              <FaPause className="w-3 h-3" />
            ) : (
              <FaPlay className="w-3 h-3" />
            )}
          </button>
        )}

        {showClearButton && (audioBlob || isRecording) && (
          <button
            onClick={clearRecording}
            className="flex items-center justify-center w-8 h-8 rounded-full 
              bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`relative flex items-center justify-center w-8 h-8 rounded-full 
            ${isRecording 
              ? "bg-red-500 animate-pulse" 
              : "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400"
            } 
            text-white transition-colors`}
        >
          {isRecording ? (
            <FaStop className="w-3 h-3" />
          ) : (
            <FaMicrophone className="w-3 h-3" />
          )}
        </button>

        {showTimer && (isRecording || audioBlob) && (
          <span className="text-xs text-gray-500">
            {formatTime(isRecording ? recordingTime : audioDuration)}
          </span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`relative flex items-center justify-center ${currentSize.button} rounded-full 
          ${isRecording 
            ? "bg-red-500 animate-pulse" 
            : "bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400"
          } 
          text-white shadow-lg transition-colors`}
      >
        {isRecording ? (
          <FaStop className={currentSize.icon} />
        ) : (
          <FaMicrophone className={currentSize.icon} />
        )}
      </button>

      {showTimer && (isRecording || audioBlob) && (
        <div className={`px-3 py-1 bg-black text-white ${currentSize.text} rounded-full shadow-md 
          ${isRecording ? 'animate-pulse' : ''}`}>
          ⏱ {formatTime(isRecording ? recordingTime : audioDuration)}
        </div>
      )}

      {(showPlayback || showClearButton) && (audioBlob || isRecording) && !isRecording && (
        <div className="flex items-center space-x-2">
          {showPlayback && audioBlob && (
            <button
              onClick={playRecording}
              disabled={!audioUrl}
              className={`flex items-center justify-center w-10 h-10 rounded-full 
                ${audioUrl 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "bg-gray-400 cursor-not-allowed"
                } text-white shadow-lg transition-colors`}
            >
              {isPlaying ? (
                <FaPause className="w-4 h-4" />
              ) : (
                <FaPlay className="w-4 h-4" />
              )}
            </button>
          )}

          {showClearButton && (
            <button
              onClick={clearRecording}
              className="flex items-center justify-center w-10 h-10 rounded-full 
                bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Show clear button during recording if enabled */}
      {showClearButton && isRecording && (
        <button
          onClick={clearRecording}
          className="flex items-center justify-center w-10 h-10 rounded-full 
            bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Export the state interface for external use

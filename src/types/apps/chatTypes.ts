// Type Imports
import type { ThemeColor } from "@core/types";

export type StatusType = "busy" | "away" | "online" | "offline";

export type StatusObjType = Record<StatusType, ThemeColor>;

export type ProfileUserType = {
  id: number;
  role: string;
  about: string;
  avatar: string;
  fullName: string;
  status: StatusType;
  settings: {
    isNotificationsOn: boolean;
    isTwoStepAuthVerificationEnabled: boolean;
  };
};

export type ContactType = {
  id: number;
  fullName: string;
  role: string;
  about: string;
  avatar?: string;
  avatarColor?: ThemeColor;
  status: StatusType;
  isAI?: boolean;
  aiModel?: "chatgpt" | "gemini" | "teacher";
};

export type UserChatType = {
  message?: string;
  content?: string;
  time?: string | Date;
  imageFile?: File;
  audioFile?: File;
  audioUrl?: string;
  audioDuration?: number;
  created_at?: string | Date;
  senderId: number;
  role?: "user" | "assistant";
  id?: string;
  msgStatus?: Record<"isSent" | "isDelivered" | "isSeen", boolean>;
  isAIResponse?: boolean;
  aiThinking?: boolean;
  inputType?: "text" | "audio" | "image";
  threadId?: string;
  messageId?: string;
  imagePreviewUrl?: string;
  thinkingStage?: "processing" | "analyzing" | "generating" | "finalizing";
};

export type ChatType = {
  id: number;
  userId: number;
  unseenMsgs: number;
  chat: UserChatType[];
  oldChat: UserChatType[];
  title?: string;
  threadId?: string;
  gradeId?: number;
  subject?: string;
  termId?: number;
};
export type ThreadType = {
  thread_id: string;
  thread_name: string;
  subject?: string;
  display_name?: string;
};

export type MessagesType = {
  data: any;
  message: string;
  operation_status: string;
};
export type MessageContent = {
  attached_image: string;
  content: string | null;
  illustrative_images?: string[];
  generated_audio: string;
  audio_file?: File;
  audioUrl?: string; // URL for audio playback

  message_id: string;
  role: "user" | "assistant";
  isGenerating?: boolean;
  error?: string;
  hasError?: boolean;
  // Additional fields for retry functionality
  originalMessage?: string;
  inputType?: "text" | "audio" | "image";
  threadId?: string;
  audioDuration?: number;
};
export type PendingThreadType = {
  grade_id: number;
  subject: string;
  display_name?: string;
  term_id: number;
  user_id: string;
};

export type PlaceholderMessageType = {
  text: string;
  subject: string;
  display_name: string;
};

export type ChatDataType = {
  profileUser: ProfileUserType;
  contacts: ContactType[];
  chats: ChatType[];
  messages: MessageContent[];
  messagesLoading: boolean;
  isAIThinking?: boolean;
  activeUser?: ContactType;
  activeThread?: ThreadType;
  isLoadingThreadMessages?: boolean;
  threadMessagesError?: string | null;
  pendingThread?: PendingThreadType | null;
  placeholderMessage?: PlaceholderMessageType | null;
};

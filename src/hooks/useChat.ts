/**
 * Custom hook for chat operations
 * This hook provides a convenient way to interact with the chat API
 */

'use client'

import { useState, useCallback } from 'react';
import chatApi, { 
  InitializeThreadRequest, 
  InitializeThreadResponse,
  ThreadMessage,
  ThreadMessagesResponse
} from '@/utils/chat-api';

interface UseChatReturn {
  // Thread state
  threadId: string | null;
  messages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Thread operations
  initializeThread: (params: InitializeThreadRequest) => Promise<string | null>;
  getMessages: (threadId: string) => Promise<ThreadMessage[]>;
  addMessage: (content: string, role?: 'user' | 'assistant') => Promise<boolean>;
  
  // UI state
  isInitializing: boolean;
  isSendingMessage: boolean;
  isLoadingMessages: boolean;
}

export function useChat(): UseChatReturn {
  // State
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  
  /**
   * Initialize a new chat thread
   */
  const initializeThread = useCallback(async (
    params: InitializeThreadRequest
  ): Promise<string | null> => {
    setIsInitializing(true);
    setError(null);
    
    try {
      const response = await chatApi.initializeThread(params);
      
      if (response.operation_status === 'success' && response.thread_id) {
        setThreadId(response.thread_id);
        setMessages([]);
        return response.thread_id;
      } else {
        setError(response.error || 'Failed to initialize thread');
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, []);
  
  /**
   * Get messages from a thread
   */
  const getMessages = useCallback(async (
    threadId: string
  ): Promise<ThreadMessage[]> => {
    setIsLoadingMessages(true);
    setError(null);
    
    try {
      const response = await chatApi.getThreadMessages(threadId);
      
      if (response.operation_status === 'success' && response.thread_messages) {
        setMessages(response.thread_messages);
        return response.thread_messages;
      } else {
        setError(response.error || 'Failed to get thread messages');
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);
  
  /**
   * Add a message to the current thread
   */
  const addMessage = useCallback(async (
    content: string,
    role: 'user' | 'assistant' = 'user'
  ): Promise<boolean> => {
    if (!threadId) {
      setError('No active thread. Initialize a thread first.');
      return false;
    }
    
    setIsSendingMessage(true);
    setError(null);
    
    try {
      // Add the message locally first for immediate UI feedback
      const tempId = `temp-${Date.now()}`;
      const newMessage: ThreadMessage = {
        id: tempId,
        content,
        role,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Send the message to the API
      const response = await chatApi.addMessageToThread(threadId, content, role);
      
      if (response.operation_status === 'success') {
        // Refresh messages to get the actual message ID
        await getMessages(threadId);
        return true;
      } else {
        // Remove the temporary message if the API call failed
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        setError(response.error || 'Failed to add message');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsSendingMessage(false);
    }
  }, [threadId, getMessages]);
  
  return {
    // Thread state
    threadId,
    messages,
    isLoading: isInitializing || isLoadingMessages || isSendingMessage,
    error,
    
    // Thread operations
    initializeThread,
    getMessages,
    addMessage,
    
    // UI state
    isInitializing,
    isSendingMessage,
    isLoadingMessages
  };
}
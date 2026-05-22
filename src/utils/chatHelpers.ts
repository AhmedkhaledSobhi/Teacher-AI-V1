/**
 * Helper functions for chat functionality
 */

import chatApi from './chat-api';
import { getCurrentThreadId, setCurrentThreadId as setStorageThreadId } from './localStorage';

/**
 * Send a message to the current thread or create a new thread if none exists
 * @param message The message content to send
 * @param params Parameters for creating a new thread if needed
 * @returns The thread ID and success status
 */
export const sendMessageToThread = async (
  message: string,
  params?: {
    grade_id: number;
    subject: string;
    term_id: number;
    user_id: string;
  }
): Promise<{ success: boolean; threadId: string | null }> => {
  try {
    // Check if we have a current thread
    let threadId = getCurrentThreadId();
    
    // If no thread exists and params are provided, create a new thread
    if (!threadId && params) {
      const result = await chatApi.initializeThread(params);
      
      if (result.operation_status === 'success' && result.thread_id) {
        threadId = result.thread_id;
        setStorageThreadId(threadId);
      } else {
        console.error('Failed to initialize thread:', result.message || 'Unknown error');
        return { success: false, threadId: null };
      }
    }
    
    // If we still don't have a thread ID, we can't proceed
    if (!threadId) {
      console.error('No thread ID available for sending message');
      return { success: false, threadId: null };
    }
    
    // Send the message
    const response = await chatApi.addMessageToThread(threadId, message);
    
    return { 
      success: response.operation_status === 'success', 
      threadId 
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, threadId: null };
  }
};

/**
 * Get messages for the current thread or a specified thread
 * @param specificThreadId Optional thread ID to use instead of the current one
 * @returns Array of thread messages
 */
export const getThreadMessages = async (specificThreadId?: string) => {
  try {
    const threadId = specificThreadId || getCurrentThreadId();
    
    if (!threadId) {
      console.error('No thread ID available for getting messages');
      return [];
    }
    
    const response = await chatApi.getThreadMessages(threadId);
    
    if (response.operation_status === 'success') {
      //@ts-ignore
      return response.messages || [];
    } else {
      console.error('Failed to get thread messages:', response.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Error getting thread messages:', error);
    return [];
  }
};
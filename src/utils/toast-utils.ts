/**
 * Utility functions for toast notifications
 */

import { toast, ToastOptions } from 'react-toastify';

// Default toast configuration
const defaultToastOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Extracts a user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Shows an error toast with the provided message
 */
export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultToastOptions, ...options });
};

/**
 * Shows a success toast with the provided message
 */
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultToastOptions, ...options });
};

/**
 * Shows an info toast with the provided message
 */
export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...defaultToastOptions, ...options });
};

/**
 * Shows a warning toast with the provided message
 */
export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...defaultToastOptions, ...options });
};

/**
 * Handles API errors and shows appropriate toast notifications
 * @param error The error to handle
 * @param options Optional configuration for the toast
 */
export const handleApiError = (error: unknown, options?: ToastOptions) => {
  const errorMessage = getErrorMessage(error);
  showErrorToast(errorMessage, options);
  return errorMessage;
};

export default {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  handleApiError,
  getErrorMessage,
};
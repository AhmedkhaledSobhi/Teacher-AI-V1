/**
 * Quiz data storage utility
 * Helper functions to store and retrieve quiz data between pages.
 * Uses localStorage so data survives page reloads and tab restores.
 */

const QUIZ_DATA_KEY = 'quizData';

export const QuizStorage = {
  /**
   * Store quiz data in localStorage
   */
  setQuizData: (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUIZ_DATA_KEY, JSON.stringify(data));
    }
  },

  /**
   * Get quiz data from localStorage
   */
  getQuizData: <T = any>(): T | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(QUIZ_DATA_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  /**
   * Remove quiz data from localStorage
   */
  clearQuizData: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(QUIZ_DATA_KEY);
    }
  },

  /**
   * Check if quiz data exists
   */
  hasQuizData: (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(QUIZ_DATA_KEY) !== null;
    }
    return false;
  },
};


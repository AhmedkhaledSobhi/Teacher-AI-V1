/**
 * Client-side quiz API service
 */

import type {
  QuizCreateRequest,
  QuizCreateResponse,
  QuizListResponse,
  UserQuizzesResponse,
  UserQuizzesRequest,
  PerformanceDataResponse,
} from "@/types/quiz";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Client-side API service for quiz operations
 */
export class QuizService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("💥 API Request failed:", error);
      throw error;
    }
  }

  /**
   * Create a new quiz
   */
  static async createQuiz(
    quizData: QuizCreateRequest
  ): Promise<QuizCreateResponse> {
    return this.makeRequest<QuizCreateResponse>("/v1/quiz/create", {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  }

  /**
   * Get quizzes list
   */
  static async getQuizzes(params?: {
    page?: number;
    limit?: number;
    grade_id?: number;
    subject_id?: number;
    term_id?: number;
    quiz_type?: number;
    course_id?: number;
    status?: string;
  }): Promise<QuizListResponse> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/quiz?${queryString}` : "/v1/quiz";

    return this.makeRequest<QuizListResponse>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Get a single quiz by ID
   */
  static async getQuizById(quizId: number): Promise<QuizCreateResponse> {
    return this.makeRequest<QuizCreateResponse>(`/v1/quiz/${quizId}`, {
      method: "GET",
    });
  }

  /**
   * Update a quiz
   */
  static async updateQuiz(
    quizId: number,
    quizData: Partial<QuizCreateRequest>
  ): Promise<QuizCreateResponse> {
    return this.makeRequest<QuizCreateResponse>(`/v1/quiz/${quizId}`, {
      method: "PUT",
      body: JSON.stringify(quizData),
    });
  }

  /**
   * Delete a quiz
   */
  static async deleteQuiz(
    quizId: number
  ): Promise<{ operation_status: string; message: string }> {
    return this.makeRequest<{ operation_status: string; message: string }>(
      `/v1/quiz/${quizId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Get subject details with units and lessons
   */
  static async getSubjectDetails(subjectId: number): Promise<{
    operation_status: string;
    message: string;
    data: Array<{
      unit_id: number;
      unit_title: string;
      lessons: Array<{
        lesson_id: number;
        lesson_title: string;
      }>;
    }>;
  }> {
    return this.makeRequest(`/v1/subjects/${subjectId}/details`, {
      method: "GET",
    });
  }

  static async getUnitLessons(unitIds: number[]): Promise<{
    operation_status: string;
    message: string;
    data: Array<{
      lesson_id: number;
      lesson_title: string;
      unit_id: number;
    }>;
  }> {
    // Create query string with multiple unit_ids parameters
    const searchParams = new URLSearchParams();
    unitIds.forEach((unitId) => {
      searchParams.append("unit_ids", unitId.toString());
    });

    const queryString = searchParams.toString();
    return this.makeRequest(`/v1/lessons?${queryString}`, {
      method: "GET",
    });
  }

  /**
   * Get user quizzes history
   */
  static async getUserQuizzes(userId: string): Promise<UserQuizzesResponse> {
    return this.makeRequest<UserQuizzesResponse>("/v1/quiz/user_quizzes", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Get performance data
   */
  static async getPerformanceData(): Promise<PerformanceDataResponse> {
    return this.makeRequest<PerformanceDataResponse>("/v1/quiz/performance", {
      method: "GET",
    });
  }

  /**
   * Submit quiz feedback
   */
  static async submitQuizFeedback(
    quizId: string,
    feedbackData: import("@/types/quiz").QuizFeedbackRequest
  ): Promise<import("@/types/quiz").QuizFeedbackResponse> {
    return this.makeRequest<import("@/types/quiz").QuizFeedbackResponse>(
      `/v1/quiz/${quizId}/feedback`,
      {
        method: "POST",
        body: JSON.stringify(feedbackData),
      }
    );
  }

  /**
   * Create a lesson-based quiz (Browse Flow)
   * Generates 5 questions from bank if 'basic' or 5 dynamic questions via AI if 'smart'
   */
  static async createLessonQuiz(params: {
    lesson_id: number;
    quiz_category: "basic" | "smart";
    unit_id: number;
  }): Promise<{
    operation_status: string;
    message: string;
    quiz_id: string;
    questions?: any[];
    data?: any;
  }> {
    return this.makeRequest("/v1/quiz/lesson-quiz", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Start a quiz (get questions)
   */
  static async startQuiz(quizId: string): Promise<{
    operation_status: string;
    message: string;
    data?: any;
    questions?: any[];
  }> {
    return this.makeRequest(`/v1/quiz/${quizId}/start`, {
      method: "POST",
    });
  }
}

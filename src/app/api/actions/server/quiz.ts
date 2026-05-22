import apiServer from "@/app/server/utils/ApiServer";
import type {
  QuizCreateRequest,
  QuizCreateResponse,
  QuizListResponse,
} from "@/types/quiz";

/**
 * Server action to create a new quiz
 * @param quizData - The quiz data to create
 * @returns Promise<QuizCreateResponse> - The created quiz response
 */
export async function createQuiz(
  quizData: QuizCreateRequest
): Promise<QuizCreateResponse> {
  try {
    // Make API call to create quiz
    const endpoint = "/api/v1/quiz/create";
    const response = await apiServer.post<QuizCreateResponse>(
      endpoint,
      quizData
    );

    const apiResponse = response.data as QuizCreateResponse;

    // Return the response directly
    if (apiResponse.operation_status === "success") {
      return apiResponse;
    }

    // If the response doesn't have the expected structure, log the error and return a default response
    console.error("Invalid quiz creation API response:", apiResponse);
    return {
      operation_status: "error",
      message: "Failed to create quiz",
      errors: { general: "Invalid API response" },
    };
  } catch (error) {
    console.error("Error creating quiz:", error);
    // Return default error response
    return {
      operation_status: "error",
      message: "Error creating quiz",
      errors: { general: "Network or server error" },
    };
  }
}

/**
 * Server action to get quizzes list
 * @param params - Query parameters for filtering and pagination
 * @returns Promise<QuizListResponse> - The quizzes list response
 */
export async function getQuizzesList(params?: {
  page?: number;
  limit?: number;
  grade_id?: number;
  subject_id?: number;
  term_id?: number;
  quiz_type?: number;
  course_id?: number;
  status?: string;
}): Promise<QuizListResponse> {
  try {
    // Make API call to get quizzes list
    const endpoint = "/api/v1/quiz";
    const response = await apiServer.get<QuizListResponse>(endpoint, params, {
      next: { tags: ["quizzes"] } as any,
    });

    const apiResponse = response.data as QuizListResponse;

    // Return the response directly
    if (apiResponse.operation_status === "success") {
      return apiResponse;
    }

    // If the response doesn't have the expected structure, log the error and return a default response
    console.error("Invalid quizzes list API response:", apiResponse);
    return {
      operation_status: "error",
      message: "Failed to retrieve quizzes list",
      data: [],
    };
  } catch (error) {
    console.error("Error fetching quizzes list:", error);
    // Return default error response
    return {
      operation_status: "error",
      message: "Error fetching quizzes data",
      data: [],
    };
  }
}

/**
 * Server action to get a single quiz by ID
 * @param quizId - The quiz ID to fetch
 * @returns Promise<QuizCreateResponse> - The quiz response
 */
export async function getQuizById(quizId: number): Promise<QuizCreateResponse> {
  try {
    // Make API call to get quiz by ID
    const endpoint = `/api/v1/quiz/${quizId}`;
    const response = await apiServer.get<QuizCreateResponse>(endpoint);

    const apiResponse = response.data as QuizCreateResponse;

    // Return the response directly
    if (apiResponse.operation_status === "success") {
      return apiResponse;
    }

    // If the response doesn't have the expected structure, log the error and return a default response
    console.error("Invalid quiz API response:", apiResponse);
    return {
      operation_status: "error",
      message: "Failed to retrieve quiz",
      errors: { general: "Invalid API response" },
    };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    // Return default error response
    return {
      operation_status: "error",
      message: "Error fetching quiz data",
      errors: { general: "Network or server error" },
    };
  }
}

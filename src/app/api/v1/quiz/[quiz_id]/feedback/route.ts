import { NextRequest, NextResponse } from 'next/server';
import { makeAuthenticatedAPICall } from '@/app/api/handlers';
import type { QuizFeedbackRequest, QuizFeedbackResponse } from '@/types/quiz';

/**
 * API Configuration
 */
const API_CONFIG = {
  BACKEND_ENDPOINT: '/api/v1/quiz',
};

/**
 * POST /api/v1/quiz/{quiz_id}/feedback
 * 
 * Submit quiz answers and get feedback with authentication
 * 
 * Request body:
 * {
 *   "quiz_id": "quiz_20250819_142530_abc123",
 *   "student_answers": [
 *     {
 *       "question_id": "q1",
 *       "student_answer": "الرئة",
 *       "time_spent_seconds": 30
 *     }
 *   ],
 *   "total_time_spent_seconds": 900
 * }
 * 
 * Response:
 * {
 *   "operation_status": "success" | "error",
 *   "message": "...",
 *   "data": { ...feedback_data }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quiz_id: string }> }
) {
  try {
    const { quiz_id } = await params;

    let body: QuizFeedbackRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { operation_status: "error", message: "Invalid request body" } as QuizFeedbackResponse,
        { status: 400 }
      );
    }

    if (!body.student_answers || !Array.isArray(body.student_answers)) {
      return NextResponse.json(
        { operation_status: "error", message: "student_answers array is required" } as QuizFeedbackResponse,
        { status: 400 }
      );
    }

    if (typeof body.total_time_spent_seconds !== "number") {
      return NextResponse.json(
        { operation_status: "error", message: "total_time_spent_seconds must be a number" } as QuizFeedbackResponse,
        { status: 400 }
      );
    }

    const backendResponse = await makeAuthenticatedAPICall(
      `${API_CONFIG.BACKEND_ENDPOINT}/${quiz_id}/feedback`,
      { method: "POST", body: JSON.stringify(body) }
    );

    const backendData: QuizFeedbackResponse = await backendResponse.json();
    return NextResponse.json(backendData, {
      status: backendData.operation_status === "success" ? 200 : backendResponse.status,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { operation_status: "error", message: "Failed to submit quiz feedback", errors: { general: errorMessage } } as QuizFeedbackResponse,
      { status: 500 }
    );
  }
}


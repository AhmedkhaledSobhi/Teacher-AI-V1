import { NextRequest, NextResponse } from 'next/server';
import { makeAuthenticatedAPICall } from '@/app/api/handlers';

/**
 * API Configuration
 */
const API_CONFIG = {
  BACKEND_ENDPOINT: '/api/v1/quiz/create',
};

/**
 * Quiz creation request validation schema
 */
interface QuizCreatePayload {
  quiz_type: string;
  subject_id: number;
  term_id: number;
  grade_id?: number;
  course_id: number;
  unit_ids: number[];
  lesson_ids: number[];
  total_questions: number;
  title?: string;
  description?: string;
}


/**
 * POST /api/v1/quiz/create
 * 
 * Creates a new quiz with authentication
 * 
 * Request body:
 * {
 *   "quiz_type": "text" | "image" | "audio" | "video" | "mixed",
 *   "subject_id": 123,
 *   "term_id": 1,
 *   "grade_id": 4, (optional)
 *   "course_id": 1,
 *   "unit_ids": [101, 102],
 *   "lesson_ids": [201, 202],
 *   "total_questions": 5-10,
 *   "title": "Quiz Title", (optional)
 *   "description": "Quiz Description" (optional)
 * }
 * 
 * Response:
 * {
 *   "operation_status": "success" | "error",
 *   "message": "...",
 *   "data": { ...quiz_data }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { operation_status: "error", message: "Invalid request body" },
        { status: 400 }
      );
    }

    const backendResponse = await makeAuthenticatedAPICall(API_CONFIG.BACKEND_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const backendData = await backendResponse.json();
    return NextResponse.json(backendData, {
      status: backendData.operation_status === "success" ? 201 : backendResponse.status,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { operation_status: "error", message: "Failed to create quiz", errors: { general: errorMessage } },
      { status: 500 }
    );
  }
}

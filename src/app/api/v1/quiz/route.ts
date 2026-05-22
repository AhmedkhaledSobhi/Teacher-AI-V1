import { NextRequest, NextResponse } from 'next/server';
import { handleGetAll } from '@/app/api/handlers';

/**
 * GET /api/v1/quiz
 * Get quizzes list with filtering and pagination
 */
export async function GET(request: NextRequest) {
  return handleGetAll(request, 'quiz', {
    searchFields: ['title', 'description'],
    filterFields: ['grade_id', 'subject_id', 'term_id', 'quiz_type', 'course_id', 'status'],
    includeFields: {
      id: true,
      title: true,
      description: true,
      grade_id: true,
      subject_id: true,
      term_id: true,
      quiz_type: true,
      course_id: true,
      unit_ids: true,
      total_questions: true,
      status: true,
      created_at: true,
      updated_at: true,
      created_by: true,
    }
  });
}

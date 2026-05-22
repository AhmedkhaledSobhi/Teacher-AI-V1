/**
 * Quiz-related TypeScript interfaces
 */

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  grade_id: number;
  subject_id: number;
  term_id: number;
  quiz_type: number;
  course_id: number;
  unit_ids: number[];
  total_questions: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface QuizCreateRequest {
  grade_id?: number;
  subject_id: number;
  term_id: number;
  selected_unit_ids?: number[];
  quiz_type: string;
  course_id?: number;
  unit_ids?: number[];
  selected_lesson_ids?: number[];
  total_questions: number;
  title?: string;
  description?: string;
}

export interface QuizCreateResponse {
  operation_status: 'success' | 'error';
  message: string;
  data?: Quiz;
  errors?: Record<string, string>;
}

export interface QuizListResponse {
  operation_status: 'success' | 'error';
  message: string;
  data: Quiz[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface QuizFormData {
  grade_id: number;
  subject_id: number;
  term_id: number;
  quiz_type: string;
  selected_course_id: number;
  selected_unit_ids: number[];
  total_questions: number;
  title?: string;
  description?: string;
}

// Quiz History Types
export interface QuizHistoryItem {
  created_at: string;
  grade_id: number;
  lessons_names: string[];
  units_names: string[];
  selected_unit_ids: number[];
  quiz_id: string;
  total_possible: number;
  total_score: number;
  quiz_type: string;
  selected_lesson_ids?: number[];
  status: 'active' | 'completed' | 'draft' | 'archived';
  subject_id: number;
  subject_name_ar: string;
  subject_name_en: string;
  term_id: number;
}

export interface UserQuizzesResponse {
  message: string;
  operation_status: 'success' | 'error';
  quizes: QuizHistoryItem[];
}

export interface PerformanceDataResponse {
  message: string;
  operation_status: 'success' | 'error';
  overall_average_score: number;
  performance_by_subject: PerformanceDataItem[];
  performance_over_time: PerformanceOverTimeItem[];
  top_strength_concepts: ConceptPerformance[];
  top_weakness_details: ConceptPerformance[];
  total_quizzes_taken: number;
  user_id: string;
}

export interface PerformanceDataItem {
  subject: string;
  average_score: number;
  quizzes_taken: number;
}

export interface PerformanceOverTimeItem {
  date: string;
  percentage: number;
  quiz_id: string;
  subject: string;
}

export interface ConceptPerformance {
  concept: string;
  accuracy: number;
  correct: number;
  total: number;
}
  
export interface UserQuizzesRequest {
    user_id: string;
}

// Quiz Feedback/Submission Types
export interface QuizStudentAnswer {
  question_id: string;
  student_answer: string;
  time_spent_seconds: number;
}

export interface QuizFeedbackRequest {
  quiz_id: string;
  student_answers: QuizStudentAnswer[];
  total_time_spent_seconds: number;
}

export interface QuestionFeedback {
  question_id: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  feedback: string;
  concept: string;
  difficulty: string;
}

export interface QuizFeedbackResponse {
  operation_status: 'success' | 'error';
  message: string;

  // Enhanced feedback structure
  ai_feedback?: string;
  grade_level?: string;
  improvement_areas?: string[];
  personalized_recommendations?: string[];
  question_results?: Array<{
    question_id: string;
    question_text: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    concept: string;
    difficulty: string;
    time_spent_seconds: number;
  }>;
  quiz_id?: string;
  strength_areas?: string[];
  time_analysis?: {
    total_time_seconds: number;
    total_time_minutes: number;
    average_per_question_seconds: number;
    fastest_question_seconds: number;
    slowest_question_seconds: number;
    analysis: string;
  };
  total_possible?: number;
  total_score?: number;
  weakness_analysis?: {
    concept_accuracy: Record<string, number>;
    difficulty_performance: Record<string, { correct: number; total: number }>;
    recommendations: string[];
    weak_concepts: string[];
  };
  percentage?: number;
  errors?: Record<string, string>;
}

// API Error Response
export interface ApiErrorResponse {
  operation_status: 'error';
  message: string;
  errors?: Record<string, string>;
  error_code?: string;
}

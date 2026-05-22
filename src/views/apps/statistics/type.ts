// ─── Statistics page shared types ─────────────────────────────────────────────

export type Period = "this_month" | "last_month" | "all_time";

export interface OngoingMission {
  quiz_id: string;
  subject_name_ar: string;
  total_questions: number;
  answered_questions: number;
  status_label: string;
  date: string;
}

export interface Summary {
  chats_count: number;
  total_questions_answered: number;
  study_time_hours: number;
  overall_average_score: number;
  correct_answers_count: number;
  average_response_time: number;
  ongoing_mission: OngoingMission | null;
}

export interface TimePoint {
  quiz_id: string;
  date: string;
  percentage: number;
  subject: string;
  subject_name_ar: string;
}

export interface SubjectPerf {
  subject: string;
  subject_name_ar: string;
  average_score: number;
  quizzes_taken: number;
}

export interface Concept {
  concept_name: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface Lesson {
  lesson_id: number;
  lesson_title: string;
  overall_accuracy: number;
  lesson_total_questions: number;
  subject_id: number;
  concepts: Concept[];
}

export interface SubjectBreakdown {
  subject_id: number;
  subject_name: string;
  subject_name_ar: string;
  lessons: Lesson[];
}

export interface StatsData {
  user_id: string;
  summary: Summary;
  performance_over_time: TimePoint[];
  performance_by_subject: SubjectPerf[];
  top_strength_by_subject: SubjectBreakdown[];
  top_weakness_by_subject: SubjectBreakdown[];
}

// ─── Subject colors ────────────────────────────────────────────────────────────

export const SUBJECT_COLORS: Record<string, string> = {
  "Digital Skills": "#8B5CF6",
  "Social Studies": "#6948B8",
  "Arabic Language": "#10B981",
  Science: "#3B82F6",
  "Islamic Studies": "#EF4444",
  Mathematics: "#8B5CF6",
  default: "#6948B8",
};

// Override specific by Arabic name
export const SUBJECT_COLORS_BY_AR: Record<string, string> = {
  "المهارات الرقمية": "#8B5CF6",
  "الدراسات الاجتماعية": "#6948B8",
  لغتي: "#10B981",
  العلوم: "#3B82F6",
  "الدراسات الإسلامية": "#EF4444",
  الرياضيات: "#8B5CF6",
};

export function subjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.default;
}

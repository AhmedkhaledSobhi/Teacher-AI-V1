export type PerformanceBySubject = {
  subject: string;
  average_score: number;
  quizzes_taken: number;
  subject_name_ar?: string;
};

export type PerformanceOverTime = {
  date: string;
  percentage: number;
  quiz_id: string;
  subject: string;
  subject_name_ar?: string;
};

export type Concept = {
  concept_name: string;
  correct: number;
  total: number;
  accuracy: number;
};

export type Lesson = {
  lesson_id: number;
  lesson_title: string;
  overall_accuracy: number;
  lesson_total_questions: number;
  concepts: Concept[];
};

export type SubjectWithLessons = {
  subject_id: number;
  subject_name: string;
  subject_name_ar: string;
  lessons: Lesson[];
};

export type PerformanceByDifficulty = {
  difficulty: string;
  correct: number;
  total: number;
};

export type UserPerformanceDashboard = {
  message: string;
  operation_status: "success" | "error";
  overall_average_score: number;
  performance_by_subject: PerformanceBySubject[];
  performance_over_time: PerformanceOverTime[];
  top_strength_by_subject: SubjectWithLessons[];
  top_weakness_by_subject: SubjectWithLessons[];
  performance_by_difficulty: PerformanceByDifficulty[];
  total_quizzes_taken: number;
  user_id: string;
};

export type SortedPerformanceData = {
  dates: string[];
  values: number[];
};


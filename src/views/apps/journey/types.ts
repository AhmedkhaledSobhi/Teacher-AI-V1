// ─── Journey Types ─────────────────────────────────────────────────────────────

export type Step =
  | "subject"
  | "method"
  | "unit"
  | "lesson"
  | "mode"
  | "quiz-type"
  | "quiz-prepare"
  | "persona";

export type TeacherPersona = "Ahmad" | "Shifa" | "Omar" | "Safa";

export interface Selection {
  subject?: string;
  subjectKey?: string;
  subjectId?: number;
  method?: string;
  unit?: string;
  unitId?: number;
  lesson?: string;
  lessonId?: number;
  mode?: string;
  quizType?: "basic" | "smart";
  quizId?: string;
  quizJobId?: string;
  persona?: TeacherPersona;
}

export interface UnitData {
  unit_id: number;
  unit_title: string;
  unit_number?: number;
  cover_image?: string;
  lessons_count?: number;
  lessons?: LessonData[];
}

export interface LessonData {
  lesson_id: number;
  lesson_title: string;
  unit_id?: number;
}

export const STEPS: Step[] = [
  "subject",
  "method",
  "unit",
  "lesson",
  "mode",
  "quiz-type",
  "quiz-prepare",
  "persona",
];

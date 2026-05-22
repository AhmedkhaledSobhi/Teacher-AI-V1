"use client";

// React Imports
import React, { useState } from "react";

// MUI Imports
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// Third-party Imports
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  object,
  number,
  array,
  string,
  minValue,
  maxValue,
  pipe,
  forward,
  check,
} from "valibot";
import type { InferInput } from "valibot";

// Components Imports
import CustomTextField from "@core/components/mui/TextField";
import LoadingDialog from "@/components/dialogs/loading-dialog";

// Hooks
import { useTranslation } from "@/hooks/useTranslation";

// Services
import { QuizService } from "@/services/quiz";

// Utils
import { QuizStorage } from "@/utils/quiz-storage";

// Types
import type { QuizCreateRequest } from "@/types/quiz";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

// Icons - Using Tabler icons as per project convention

// Types
type QuizFormData = InferInput<typeof quizSchema>;

const baseQuizSchema = object({
  quiz_type: string(),
  selected_unit_ids: array(number()),
  lessons_ids: array(number()),
  subject_id: pipe(number(), minValue(1, "يرجى اختيار المادة")), // "Please select a subject"
  term_id: pipe(number(), minValue(1, "يرجى اختيار الفصل الدراسي")), // "Please select a term"
  course_id: pipe(number(), minValue(1, "يرجى اختيار المقرر")), // "Please select a course"
  total_questions: pipe(
    number(),
    minValue(5, "يجب أن يكون عدد الأسئلة 5 على الأقل"), // "Total questions must be at least 5"
    maxValue(20, "لا يمكن أن يتجاوز عدد الأسئلة 20") // "Total questions cannot exceed 10"
  ),
});

const quizSchema = pipe(
  baseQuizSchema,
  forward(
    check(
      (input) =>
        (Array.isArray(input.selected_unit_ids) &&
          input.selected_unit_ids.length > 0) ||
        (Array.isArray(input.lessons_ids) && input.lessons_ids.length > 0),
      "يجب اختيار وحدات أو دروس على الأقل" // "Please select at least units or lessons"
    ),
    ["lessons_ids"] as const
  )
);

const QuizAddForm = ({ curriculum }: { curriculum: any }) => {
  // Hooks
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [isIslamicStudies, setIsIslamicStudies] = useState<boolean>(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const [curriculumData, setCurriculumData] = useState<any[]>(curriculum);
  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm<QuizFormData>({
    resolver: valibotResolver(quizSchema),
    defaultValues: {
      quiz_type: "text",
      selected_unit_ids: [],
      lessons_ids: [],
      subject_id: 0, // Changed from undefined to 0 to prevent uncontrolled to controlled warning
      term_id: 2,
      course_id: 1,
      total_questions: 10,
    },
    mode: "onChange",
  });

  // Custom validation for lessons array
  const selectedLessons = watch("lessons_ids");

  // Custom validation for total questions
  const totalQuestions = watch("total_questions");
  const totalQuestionsNumber = Number(totalQuestions);
  const totalQuestionsError =
    totalQuestions && (totalQuestionsNumber < 5 || totalQuestionsNumber > 20)
      ? t("quiz.form.questionsBetween5And10")
      : undefined;

  // Check if form is valid including custom validation
  const isFormValid = isValid && !totalQuestionsError;

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare the API request data
      const quizData: QuizCreateRequest = {
        grade_id: (session?.user as any)?.grade_id,
        subject_id: data.subject_id,
        term_id: data.term_id,
        ...(!data.lessons_ids || data.lessons_ids.length === 0
          ? { selected_unit_ids: data.selected_unit_ids }
          : {}),
        quiz_type: data.quiz_type,
        ...(data.lessons_ids &&
          data.lessons_ids.length > 0 && {
            selected_lesson_ids: data.lessons_ids,
          }),
        total_questions: Number(data.total_questions),
      };

      // Make API call to create quiz
      const response = await QuizService.createQuiz(quizData);
      if (response.operation_status === "success") {
        // Show success message
        toast.success(t("quiz.form.quizCreatedSuccess"), {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Store response data for next page

        // Navigate to answers page
        router.push(`/apps/quiz/answers/`);

        // Reset form
        reset();
        setSelectedCourse(null);
      } else {
        // Handle API error response
        const errorMessage = response.message || t("quiz.form.quizCreateError");
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error creating quiz:", error);

      // Handle network or other errors
      const errorMessage =
        error instanceof Error ? error.message : t("quiz.form.quizCreateError");
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedCourse(null);
    setAvailableUnits([]);
    setAvailableLessons([]);
  };

  // Handle subject change to fetch units and lessons
  const handleSubjectChange = async (subjectId: number) => {
    if (!subjectId || subjectId === 0) {
      setAvailableUnits([]);
      setAvailableLessons([]);
      setValue("selected_unit_ids", []);
      setValue("lessons_ids", []);
      setIsIslamicStudies(false);
      return;
    }

    // Clear all dependent fields when subject changes
    setValue("selected_unit_ids", []);
    setValue("lessons_ids", []);
    setAvailableLessons([]);

    setUnitsLoading(true);

    if (subjectId === 3) {
      setIsIslamicStudies(true);
      setAvailableUnits([]);
      setUnitsLoading(false);
      // Reset course_id when switching to Islamic Studies
      setValue("course_id", 1);
    } else {
      setIsIslamicStudies(false);
      // Reset course_id when switching away from Islamic Studies
      setValue("course_id", 1);

      try {
        const response = await QuizService.getSubjectDetails(subjectId);

        if (response.operation_status === "success") {
          // Transform the API response to match our units format
          const transformedUnits = response.data.map((unit) => ({
            id: unit.unit_id,
            name: unit.unit_title,
            value: unit.unit_id,
            course_id: 1, // Default course_id since it's not provided in the API response
            lessons: unit.lessons.map((lesson) => ({
              id: lesson.lesson_id,
              title: lesson.lesson_title,
              value: lesson.lesson_id,
            })),
          }));

          setAvailableUnits(transformedUnits);
        } else {
          console.error("Failed to fetch subject details:", response.message);
          setAvailableUnits([]);
          toast.error(response.message || t("quiz.form.quizCreateError"), {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error fetching subject details:", error);
        setAvailableUnits([]);
        toast.error(t("quiz.form.quizCreateError"), {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setUnitsLoading(false);
      }
    }
  };

  // Handle unit change to fetch lessons
  const handleUnitChange = async (unitIds: number[]) => {
    if (!unitIds || unitIds.length === 0) {
      setAvailableLessons([]);
      setValue("lessons_ids", []);
      return;
    }

    setUnitsLoading(true);
    try {
      const response = await QuizService.getUnitLessons(unitIds);

      if (response.operation_status === "success") {
        // Transform the API response to match our lessons format
        const transformedLessons = response.data.map((lesson) => ({
          id: lesson.lesson_id,
          name: lesson.lesson_title,
          value: lesson.lesson_id,
          unit_id: lesson.unit_id,
        }));

        setAvailableLessons(transformedLessons);

        // Filter out lessons that don't belong to the selected units
        const currentSelectedLessons = watch("lessons_ids");
        const validLessonIds = transformedLessons.map((l) => l.value);
        const filteredLessons = currentSelectedLessons.filter((lessonId) =>
          validLessonIds.includes(lessonId)
        );

        // Only update if the filtered lessons are different
        if (
          filteredLessons.length !== currentSelectedLessons.length ||
          !filteredLessons.every((id) => currentSelectedLessons.includes(id))
        ) {
          setValue("lessons_ids", filteredLessons);
        }
      } else {
        console.error("Failed to fetch unit lessons:", response.message);
        setAvailableLessons([]);
        setValue("lessons_ids", []);
        toast.error(response.message || t("quiz.form.quizCreateError"), {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching unit lessons:", error);
      setAvailableLessons([]);
      setValue("lessons_ids", []);
      toast.error(t("quiz.form.quizCreateError"), {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setUnitsLoading(false);
    }
  };
  return (
    <Card
      className="overflow-visible"
      sx={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <CardHeader
        title={
          <Box
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <i className="tabler-school text-white text-xl" />
            </Box>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {t("quiz.form.title")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {t("quiz.form.subtitle")}
              </Typography>
            </Box>
          </Box>
        }
        sx={{
          pb: 2,
          mb: 10,
          borderBottom: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)",
        }}
      />

      <CardContent sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            spacing={3}
          >
            {/* Subject Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="subject_id"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                    >
                      {t("quiz.form.subject")} *
                    </Typography>
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      size="medium"
                      placeholder={t("quiz.form.selectSubject")}
                      error={!!errors.subject_id}
                      helperText={errors.subject_id?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        handleSubjectChange(Number(e.target.value));
                      }}
                      slotProps={{
                        input: {
                          sx: {
                            borderRadius: "12px",
                            backgroundColor: "rgba(0,0,0,0.02)",
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.04)",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "transparent",
                              boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem
                        value={0}
                        disabled
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", fontStyle: "italic" }}
                        >
                          {t("quiz.form.selectSubject")}
                        </Typography>
                      </MenuItem>
                      {curriculumData.map((subject) => (
                        <MenuItem
                          key={subject.subject_id}
                          value={subject.subject_id}
                          sx={{ py: 1.5 }}
                        >
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                backgroundColor: "success.light",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                              }}
                            >
                              <i className="tabler-book text-sm" />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {subject.display_name}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Box>
                )}
              />
            </Grid>
            {/* courses in islamic studies */}
            {isIslamicStudies && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="course_id"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                      >
                        {t("quiz.form.selectCourse")} *
                      </Typography>
                      <CustomTextField
                        {...field}
                        select
                        fullWidth
                        size="medium"
                        placeholder={t("quiz.form.selectCourse")}
                        error={!!errors.course_id}
                        helperText={errors.course_id?.message}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        slotProps={{
                          input: {
                            sx: {
                              borderRadius: "12px",
                              backgroundColor: "rgba(0,0,0,0.02)",
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.04)",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "transparent",
                                boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                              },
                            },
                          },
                        }}
                      >
                        {[
                          { id: 1, name: "Course 1" },
                          { id: 2, name: "Course 2" },
                          { id: 3, name: "Course 3" },
                        ].map((course) => (
                          <MenuItem
                            key={course.id}
                            value={course.id}
                            sx={{ py: 1.5 }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  backgroundColor: "success.light",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "success.main",
                                }}
                              >
                                <i className="tabler-school text-sm" />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {course.name}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </Box>
                  )}
                />
              </Grid>
            )}
            {/* Unit Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="selected_unit_ids"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                    >
                      {t("quiz.form.selectUnits")} *
                    </Typography>
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      size="medium"
                      placeholder={t("quiz.form.selectUnits")}
                      error={!!errors.selected_unit_ids}
                      helperText={errors.selected_unit_ids?.message}
                      disabled={availableUnits.length === 0}
                      slotProps={{
                        select: {
                          multiple: true,
                          value: field.value,
                          onChange: (e) => {
                            const values = Array.isArray(e.target.value)
                              ? e.target.value.map((v) => Number(v))
                              : [Number(e.target.value)];
                            field.onChange(values);
                            handleUnitChange(values);
                          },
                          renderValue: (selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {(selected as number[]).length === 0 ? (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {t("quiz.form.selectUnits")}
                                </Typography>
                              ) : (
                                (selected as number[]).map((value) => {
                                  const unit = availableUnits.find(
                                    (u) => u.value === value
                                  );
                                  return (
                                    <Chip
                                      key={value}
                                      size="small"
                                      label={unit?.name || `Unit ${value}`}
                                      color="secondary"
                                      variant="outlined"
                                      sx={{
                                        borderRadius: "8px",
                                        backgroundColor: "secondary.light",
                                        color: "white",
                                        border: "1px solid",
                                        borderColor: "secondary.main",
                                        "& .MuiChip-deleteIcon": {
                                          color: "white",
                                          "&:hover": {
                                            color: "secondary.dark",
                                          },
                                        },
                                      }}
                                      onDelete={() => {
                                        const newValue = (
                                          selected as number[]
                                        ).filter((item) => item !== value);
                                        field.onChange(newValue);
                                        handleUnitChange(newValue);
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    />
                                  );
                                })
                              )}
                            </Box>
                          ),
                        },
                        input: {
                          sx: {
                            borderRadius: "12px",
                            backgroundColor: "rgba(0,0,0,0.02)",
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.04)",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "transparent",
                              boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                            },
                          },
                        },
                      }}
                    >
                      {availableUnits.length === 0 ? (
                        <MenuItem disabled>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {t("quiz.form.selectSubjectFirst")}
                          </Typography>
                        </MenuItem>
                      ) : (
                        availableUnits.map((unit) => (
                          <MenuItem
                            key={unit.id}
                            value={unit.id}
                            sx={{ py: 1.5 }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  backgroundColor: "secondary.light",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "secondary.main",
                                }}
                              >
                                <i className="tabler-bookmark text-sm" />
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {unit.name}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </CustomTextField>
                  </Box>
                )}
              />
            </Grid>

            {/* Lessons Selection */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="lessons_ids"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                    >
                      {t("quiz.form.selectLessons")} *
                    </Typography>
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      size="medium"
                      placeholder={
                        unitsLoading
                          ? t("quiz.form.loadingLessons")
                          : t("quiz.form.chooseLessons")
                      }
                      helperText={t("quiz.form.atLeastOneLesson")}
                      disabled={unitsLoading || availableLessons.length === 0}
                      slotProps={{
                        select: {
                          multiple: true,
                          value: field.value,
                          onChange: (e) => {
                            const values = Array.isArray(e.target.value)
                              ? e.target.value.map((v) => Number(v))
                              : [Number(e.target.value)];
                            field.onChange(values);
                          },
                          renderValue: (selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {(selected as number[]).length === 0 ? (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {t("quiz.form.chooseLessons")}
                                </Typography>
                              ) : (
                                (selected as number[]).map((value) => {
                                  const lesson = availableLessons.find(
                                    (l) => l.value === value
                                  );
                                  return (
                                    <Chip
                                      key={value}
                                      size="small"
                                      label={lesson?.name || `Lesson ${value}`}
                                      color="primary"
                                      variant="outlined"
                                      sx={{
                                        borderRadius: "8px",
                                        backgroundColor: "primary.light",
                                        color: "white",
                                        border: "1px solid",
                                        borderColor: "primary.main",
                                        "& .MuiChip-deleteIcon": {
                                          color: "white",
                                          "&:hover": {
                                            color: "primary.dark",
                                          },
                                        },
                                      }}
                                      onDelete={() => {
                                        const newValue = (
                                          selected as number[]
                                        ).filter((item) => item !== value);
                                        field.onChange(newValue);
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    />
                                  );
                                })
                              )}
                            </Box>
                          ),
                        },
                        input: {
                          sx: {
                            borderRadius: "12px",
                            backgroundColor: "rgba(0,0,0,0.02)",
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.04)",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "transparent",
                              boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                            },
                          },
                        },
                      }}
                    >
                      {unitsLoading ? (
                        <MenuItem disabled>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            sx={{ py: 1.5 }}
                          >
                            <CircularProgress size={20} />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {t("quiz.form.loadingLessons")}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ) : availableLessons.length === 0 ? (
                        <MenuItem disabled>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {t("quiz.form.selectUnitsFirst")}
                          </Typography>
                        </MenuItem>
                      ) : (
                        availableLessons.map((lesson) => (
                          <MenuItem
                            key={lesson.value}
                            value={lesson.value}
                            sx={{ py: 1.5 }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={2}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "8px",
                                  backgroundColor: "success.light",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "success.main",
                                }}
                              >
                                <i className="tabler-book text-sm" />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {lesson.name}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))
                      )}
                    </CustomTextField>
                  </Box>
                )}
              />
            </Grid>

            {/* Total Questions */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <Controller
                name="total_questions"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
                    >
                      {t("quiz.form.totalQuestions")} *
                    </Typography>
                    <CustomTextField
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : Number(value));
                      }}
                      fullWidth
                      type="number"
                      size="medium"
                      inputProps={{
                        min: 5,
                        max: 20,
                        step: 1,
                      }}
                      placeholder={t("quiz.form.enterQuestions")}
                      error={!!errors.total_questions || !!totalQuestionsError}
                      helperText={
                        errors.total_questions?.message ||
                        totalQuestionsError ||
                        t("quiz.form.questionsRange")
                      }
                      slotProps={{
                        input: {
                          sx: {
                            borderRadius: "12px",
                            backgroundColor: "rgba(0,0,0,0.02)",
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.04)",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "transparent",
                              boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                            },
                          },
                          startAdornment: (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 1,
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                backgroundColor: "primary.light",
                                justifyContent: "center",
                                color: "primary.main",
                              }}
                            >
                              <i className="tabler-list-numbers text-sm" />
                            </Box>
                          ),
                        },
                      }}
                    />
                  </Box>
                )}
              />
            </Grid>

            {/* Form Actions */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  mt: 6,
                  p: 3,
                  borderRadius: "16px",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  display="flex"
                  gap={2}
                  justifyContent="flex-end"
                  flexWrap="wrap"
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    disabled={isSubmitting}
                    startIcon={<i className="tabler-refresh" />}
                    sx={{
                      borderRadius: "12px",
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    {t("quiz.form.resetForm")}
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!isDirty || !isFormValid || isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress
                          size={16}
                          color="inherit"
                        />
                      ) : (
                        <i className="tabler-check" />
                      )
                    }
                    sx={{
                      borderRadius: "12px",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      background:
                        "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
                      boxShadow: "0 4px 16px rgba(25, 118, 210, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        background: "rgba(0,0,0,0.12)",
                        boxShadow: "none",
                        transform: "none",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    {isSubmitting
                      ? t("quiz.form.creatingQuiz")
                      : t("quiz.form.createQuiz")}
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Form Status */}
            {isDirty && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity={isFormValid ? "success" : "info"}
                    icon={<i className="tabler-check" />}
                    sx={{
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: isFormValid ? "success.main" : "info.main",
                      backgroundColor: isFormValid
                        ? "rgba(76, 175, 80, 0.08)"
                        : "rgba(33, 150, 243, 0.08)",
                      "& .MuiAlert-icon": {
                        fontSize: "1.2rem",
                      },
                      "& .MuiAlert-message": {
                        fontWeight: 500,
                      },
                    }}
                  >
                    {isFormValid
                      ? t("quiz.form.formValid")
                      : t("quiz.form.fillRequiredFields")}
                  </Alert>
                </Box>
              </Grid>
            )}
          </Grid>
        </form>
      </CardContent>

      {/* Loading Dialog */}
      <LoadingDialog
        open={isSubmitting}
        title={t("quiz.form.creatingQuiz") || "Creating Quiz"}
        message={
          t("quiz.form.pleaseWait") ||
          "Please wait while we create your quiz. This may take a few moments..."
        }
      />
    </Card>
  );
};

export default QuizAddForm;

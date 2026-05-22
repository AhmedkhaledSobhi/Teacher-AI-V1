"use client";

// React Imports
import React, { useState, useEffect, useCallback } from "react";

// MUI Imports
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Paper from "@mui/material/Paper";

// Third-party Imports
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Hooks
import { useTranslation } from "@/hooks/useTranslation";

// Utils
import { QuizStorage } from "@/utils/quiz-storage";

// Services
import { QuizService } from "@/services/quiz";

// Types
import type {
  QuizFeedbackRequest,
  QuizFeedbackResponse,
  QuizStudentAnswer,
} from "@/types/quiz";

interface VisualOption {
  url: string;
  s3_key: string;
  concept: string;
  arabic_concept: string;
  source: string;
}

interface QuizQuestion {
  question_id: string;
  question_text: string;
  question_type: string;
  concept: string;
  difficulty: string;
  options: string[] | VisualOption[];
}

interface QuizMetadata {
  grade: string;
  subject: string;
  term: string;
  quiz_type: string;
}

interface QuizAnswerData {
  estimated_duration_minutes: number;
  message: string;
  operation_status: string;
  questions: QuizQuestion[];
  quiz_id: string;
  quiz_metadata: QuizMetadata;
  total_questions: number;
}

interface AnswerState {
  [questionId: string]: string;
}

interface QuestionTimeTracking {
  [questionId: string]: {
    startTime: number;
    totalTime: number;
  };
}

// Separate component so each image fully unmounts/remounts when url changes,
// preventing the old image from flashing while the new one loads.
const VisualOptionImage: React.FC<{ url: string; concept: string }> = ({
  url,
  concept,
}) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Box sx={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
      {/* Skeleton shown until image is loaded */}
      {!loaded && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      )}
      <Box
        component="img"
        key={url}
        src={url}
        alt={concept}
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
      />
    </Box>
  );
};

const QuizAnswerComponent: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const router = useRouter();

  // States
  const [quizData, setQuizData] = useState<QuizAnswerData | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStartTime] = useState<number>(() => Date.now());
  const [questionTimeTracking, setQuestionTimeTracking] =
    useState<QuestionTimeTracking>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load quiz data from session storage on component mount (only once)
  useEffect(() => {
    const storedData = QuizStorage.getQuizData<QuizAnswerData>();

    if (storedData) {
      setQuizData(storedData);
      setTimeRemaining(storedData.estimated_duration_minutes * 60);
      setIsLoading(false);

      // Initialize time tracking for first question
      if (storedData.questions && storedData.questions.length > 0) {
        const firstQuestionId = storedData.questions[0].question_id;
        setQuestionTimeTracking({
          [firstQuestionId]: {
            startTime: Date.now(),
            totalTime: 0,
          },
        });
      }
    } else {
      // No data found - redirect back to quiz creation
      console.warn("⚠️ No quiz data found in storage");
      toast.error(t("quiz.answer.noQuizData"));
      setIsLoading(false);
      router.push("/ar/apps/quiz/add");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - run only once on mount

  // Helper function to get time spent on a question
  const getQuestionTimeSpent = useCallback(
    (questionId: string): number => {
      const tracking = questionTimeTracking[questionId];
      if (!tracking) return 0;

      const currentTime = Date.now();
      const additionalTime = (currentTime - tracking.startTime) / 1000; // Convert to seconds
      return Math.round(tracking.totalTime + additionalTime);
    },
    [questionTimeTracking]
  );

  // Submit quiz - memoized to prevent infinite loops in timer
  const handleSubmit = useCallback(async () => {
    if (!quizData) {
      toast.error(t("quiz.form.quizAnswer.noQuizData"));
      return;
    }

    // Stop the timer when submitting
    setIsSubmitted(true);
    setIsSubmitting(true);
    try {
      // Calculate total time spent on the quiz
      const totalTimeSpent = Math.round((Date.now() - quizStartTime) / 1000); // in seconds

      // Prepare student answers with time tracking
      const studentAnswers: QuizStudentAnswer[] = quizData.questions.map(
        (question) => ({
          question_id: question.question_id,
          student_answer: answers[question.question_id] || "", // Empty string if not answered
          time_spent_seconds: getQuestionTimeSpent(question.question_id),
        })
      );

      const feedbackRequest: QuizFeedbackRequest = {
        quiz_id: quizData.quiz_id,
        student_answers: studentAnswers,
        total_time_spent_seconds: totalTimeSpent,
      };

      // Call the real API
      const response = await QuizService.submitQuizFeedback(
        quizData.quiz_id,
        feedbackRequest
      );

      if (response.operation_status === "success") {
        toast.success("تمت اجابه الاختبار بنجاح");

        // Store feedback results for results page
        // Store the entire response including enhanced fields
        localStorage.setItem(
          "quizFeedback",
          JSON.stringify({
            ...response,
            // Merge data fields at root level for easier access
            ...((response as QuizFeedbackResponse) || {}),
          })
        );

        // Clear quiz data from storage after submission
        QuizStorage.clearQuizData();

        // Navigate to feedback page
        router.push("/ar/apps/quiz/feedback");
      }
    } catch (error) {
      console.error("❌ Error submitting quiz:", error);
      toast.error(
        t("quiz.form.quizAnswer.failedToSubmit") +
          (error instanceof Error ? `: ${error.message}` : "")
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    answers,
    quizData,
    router,
    t,
    quizStartTime,
    questionTimeTracking,
    getQuestionTimeSpent,
  ]); // Memoized with stable dependencies

  // Timer effect - countdown timer
  useEffect(() => {
    // Stop timer if quiz is submitted or no quiz data or time is up
    if (!quizData || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizData, handleSubmit, isSubmitted]); // Include isSubmitted to stop timer

  // Helper function to update time tracking when switching questions
  const updateQuestionTimeTracking = useCallback(
    (fromQuestionId: string, toQuestionId: string) => {
      setQuestionTimeTracking((prev) => {
        const now = Date.now();
        const fromTracking = prev[fromQuestionId];

        // Update the time for the question we're leaving
        const updatedFromTracking = fromTracking
          ? {
              startTime: now,
              totalTime:
                fromTracking.totalTime + (now - fromTracking.startTime) / 1000,
            }
          : { startTime: now, totalTime: 0 };

        // Initialize or update the time for the question we're going to
        const toTracking = prev[toQuestionId];
        const updatedToTracking = toTracking
          ? {
              ...toTracking,
              startTime: now,
            }
          : {
              startTime: now,
              totalTime: 0,
            };

        return {
          ...prev,
          [fromQuestionId]: updatedFromTracking,
          [toQuestionId]: updatedToTracking,
        };
      });
    },
    []
  );

  // Handle answer selection
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Navigation functions
  const goToNextQuestion = useCallback(() => {
    if (!quizData || currentQuestionIndex >= quizData.questions.length - 1)
      return;

    const currentQuestionId =
      quizData.questions[currentQuestionIndex].question_id;
    const nextQuestionId =
      quizData.questions[currentQuestionIndex + 1].question_id;

    updateQuestionTimeTracking(currentQuestionId, nextQuestionId);
    setCurrentQuestionIndex((prev) => prev + 1);
  }, [currentQuestionIndex, quizData, updateQuestionTimeTracking]);

  const goToPreviousQuestion = useCallback(() => {
    if (!quizData || currentQuestionIndex <= 0) return;

    const currentQuestionId =
      quizData.questions[currentQuestionIndex].question_id;
    const prevQuestionId =
      quizData.questions[currentQuestionIndex - 1].question_id;

    updateQuestionTimeTracking(currentQuestionId, prevQuestionId);
    setCurrentQuestionIndex((prev) => prev - 1);
  }, [currentQuestionIndex, quizData, updateQuestionTimeTracking]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (!quizData || index < 0 || index >= quizData.questions.length) return;
      if (index === currentQuestionIndex) return;

      const currentQuestionId =
        quizData.questions[currentQuestionIndex].question_id;
      const targetQuestionId = quizData.questions[index].question_id;

      updateQuestionTimeTracking(currentQuestionId, targetQuestionId);
      setCurrentQuestionIndex(index);
    },
    [currentQuestionIndex, quizData, updateQuestionTimeTracking]
  );

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "سهل":
      case "easy":
        return "success";
      case "متوسط":
      case "medium":
        return "warning";
      case "صعب":
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        gap={2}
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <CircularProgress size={60} />
        <Typography
          variant="h6"
          sx={{
            ml: { xs: 0, sm: 2 },
            textAlign: "center",
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          {t("quiz.answer.loadingQuiz")}
        </Typography>
      </Box>
    );
  }

  if (!quizData) {
    return (
      <Alert
        severity="error"
        sx={{ mt: 2 }}
      >
        {t("quiz.answer.failedToLoad")}
      </Alert>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Quiz Header Card */}
      <Card
        sx={{
          mb: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: { xs: "12px", sm: "16px" },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardHeader
          title={
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={{ xs: 2, sm: 0 }}
            >
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
                >
                  {quizData.quiz_metadata.subject}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    mt: 0.5,
                    fontSize: { xs: "0.875rem", sm: "1.25rem" },
                  }}
                >
                  {quizData.quiz_metadata.term}
                </Typography>
              </Box>
              <Box textAlign={{ xs: "left", sm: "right" }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem" } }}
                >
                  {formatTime(timeRemaining)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {t("quiz.answer.timeRemaining")}
                </Typography>
              </Box>
            </Box>
          }
          sx={{ pb: 1, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}
        />
        <CardContent sx={{ pt: 0, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Box
            display="flex"
            gap={{ xs: 1, sm: 2 }}
            flexWrap="wrap"
            sx={{ mt: { xs: 1, sm: 0 } }}
          >
            <Chip
              label={`${t("quiz.answer.grade")}: ${quizData.quiz_metadata.grade}`}
              variant="outlined"
              size="small"
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.1)",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            />
            <Chip
              label={`${t("quiz.answer.type")}: ${quizData.quiz_metadata.quiz_type}`}
              variant="outlined"
              size="small"
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.1)",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            />
            <Chip
              label={`${answeredQuestions}/${quizData.total_questions} ${t("quiz.answer.answered")}`}
              variant="outlined"
              size="small"
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                backgroundColor: "rgba(255,255,255,0.1)",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Progress Stepper */}
      <Card sx={{ mb: 3, borderRadius: { xs: "12px", sm: "16px" } }}>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, mb: 2 }}
          >
            {t("quiz.answer.questionProgress")}
          </Typography>
          <Box
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.2)",
                borderRadius: 4,
              },
            }}
          >
            <Stepper
              activeStep={currentQuestionIndex}
              alternativeLabel
              sx={{
                minWidth: { xs: 600, sm: "auto" },
                pb: { xs: 2, sm: 0 },
              }}
            >
              {quizData.questions.map((question, index) => (
                <Step key={question.question_id}>
                  <StepLabel
                    onClick={() => goToQuestion(index)}
                    sx={{
                      cursor: "pointer",
                      "& .MuiStepLabel-label": {
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                      },
                    }}
                  >
                    <Box textAlign="center">
                      <Typography
                        variant="caption"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                      >
                        {t("quiz.answer.question")} {index + 1}
                      </Typography>
                      {answers[question.question_id] && (
                        <Box
                          sx={{
                            width: { xs: 6, sm: 8 },
                            height: { xs: 6, sm: 8 },
                            borderRadius: "50%",
                            backgroundColor: "success.main",
                            mx: "auto",
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card sx={{ mb: 3, borderRadius: { xs: "12px", sm: "16px" } }}>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={{ xs: 2, sm: 3 }}
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                {t("quiz.answer.question")} {currentQuestionIndex + 1}{" "}
                {t("quiz.answer.of")} {quizData.total_questions}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

          <Typography
            variant="h6"
            sx={{
              mb: { xs: 2, sm: 3 },
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              fontWeight: 500,
            }}
          >
            {currentQuestion.question_text}
          </Typography>

          {currentQuestion.question_type === "visual" ? (
            /* Visual Question: image grid */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "repeat(auto-fill, minmax(200px, 1fr))",
                },
                gap: { xs: 2, sm: 3 },
                mt: 1,
              }}
            >
              {(currentQuestion.options as VisualOption[]).map(
                (option, index) => {
                  const optionValue = option.concept;
                  const isSelected =
                    answers[currentQuestion.question_id] === optionValue;
                  return (
                    <Paper
                      key={`${currentQuestion.question_id}-${index}`}
                      elevation={isSelected ? 4 : 1}
                      onClick={() =>
                        handleAnswerChange(
                          currentQuestion.question_id,
                          optionValue
                        )
                      }
                      sx={{
                        border: "2px solid",
                        borderColor: isSelected ? "primary.main" : "grey.200",
                        borderRadius: { xs: "12px", sm: "16px" },
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        position: "relative",
                        "&:hover": {
                          borderColor: "primary.light",
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                        },
                      }}
                    >
                      {/* Option letter badge */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: isSelected
                            ? "primary.main"
                            : "rgba(255,255,255,0.9)",
                          color: isSelected ? "white" : "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          zIndex: 1,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </Box>
                      {/* Image wrapper: shows skeleton until loaded */}
                      <VisualOptionImage
                        key={option.url}
                        url={option.url}
                        concept={option.concept}
                      />
                      {/* Label */}
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1.5 },
                          textAlign: "center",
                          backgroundColor: isSelected
                            ? "primary.50"
                            : "background.paper",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? "primary.main" : "text.primary",
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          }}
                        >
                          {option.concept}
                        </Typography>
                      </Box>
                    </Paper>
                  );
                }
              )}
            </Box>
          ) : (
            /* Text Question: standard radio group */
            <FormControl
              component="fieldset"
              fullWidth
            >
              <RadioGroup
                value={answers[currentQuestion.question_id] || ""}
                onChange={(e) =>
                  handleAnswerChange(
                    currentQuestion.question_id,
                    e.target.value
                  )
                }
              >
                {(currentQuestion.options as string[]).map((option, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      mb: { xs: 1.5, sm: 2 },
                      border: "2px solid",
                      borderColor:
                        answers[currentQuestion.question_id] === option
                          ? "primary.main"
                          : "grey.200",
                      borderRadius: { xs: "8px", sm: "12px" },
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.light",
                        backgroundColor: "primary.50",
                      },
                    }}
                  >
                    <FormControlLabel
                      value={option}
                      control={
                        <Radio
                          size="small"
                          sx={{
                            color: "primary.main",
                            "&.Mui-checked": {
                              color: "primary.main",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              answers[currentQuestion.question_id] === option
                                ? 600
                                : 400,
                            color:
                              answers[currentQuestion.question_id] === option
                                ? "primary.main"
                                : "text.primary",
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                            lineHeight: 1.5,
                          }}
                        >
                          {option}
                        </Typography>
                      }
                      sx={{
                        width: "100%",
                        m: 0,
                        p: { xs: 1.5, sm: 2 },
                        "&:hover": {
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Card sx={{ borderRadius: { xs: "12px", sm: "16px" } }}>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column-reverse", sm: "row" }}
            justifyContent="space-between"
            alignItems="stretch"
            gap={{ xs: 2, sm: 0 }}
          >
            <Button
              variant="outlined"
              onClick={goToPreviousQuestion}
              disabled={isFirstQuestion}
              startIcon={<i className="tabler-arrow-right" />}
              sx={{
                borderRadius: { xs: "8px", sm: "12px" },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.25, sm: 1.5 },
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: "100%", sm: 120 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {t("quiz.answer.previous")}
            </Button>

            <Box
              display="flex"
              gap={2}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {!isLastQuestion ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={goToNextQuestion}
                  endIcon={<i className="tabler-arrow-left" />}
                  sx={{
                    borderRadius: { xs: "8px", sm: "12px" },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.25, sm: 1.5 },
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { xs: "100%", sm: 120 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {t("quiz.answer.nextQuestion")}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  endIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <i className="tabler-check" />
                    )
                  }
                  sx={{
                    borderRadius: { xs: "8px", sm: "12px" },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.25, sm: 1.5 },
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { xs: "100%", sm: 120 },
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    background:
                      "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #388E3C 30%, #689F38 90%)",
                    },
                  }}
                >
                  {isSubmitting
                    ? t("quiz.answer.submitting")
                    : t("quiz.answer.submitQuiz")}
                </Button>
              )}
            </Box>
          </Box>

          {timeRemaining < 300 && timeRemaining > 0 && (
            <Alert
              severity="warning"
              sx={{
                mt: 2,
                borderRadius: { xs: "8px", sm: "12px" },
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {t("quiz.answer.timeWarning").replace(
                "{time}",
                formatTime(timeRemaining)
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizAnswerComponent;

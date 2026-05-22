"use client";

// React Imports
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// MUI Imports
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { useTheme } from "@mui/material/styles";

// Third-party Imports
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Hooks
import { useTranslation } from "@/hooks/useTranslation";

// Types
import type { QuizFeedbackResponse } from "@/types/quiz";

const QuizFeedbackComponent: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [feedbackData, setFeedbackData] = useState<QuizFeedbackResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  // Memoize navigation callbacks to prevent re-renders
  const navigateToHistory = useCallback(() => {
    router.push("/ar/apps/quiz/history");
  }, [router]);

  const navigateToAddQuiz = useCallback(() => {
    router.push("/ar/apps/quiz/add");
  }, [router]);

  // Memoize helper functions to prevent recreation on every render
  // MUST be called before any conditional returns (Rules of Hooks)
  const getGradeColor = useCallback((grade?: string, percentage?: number) => {
    if (grade) {
      if (grade.includes("ممتاز") || grade.includes("Excellent"))
        return "success";
      if (grade.includes("جيد") || grade.includes("Good")) return "info";
      if (grade.includes("مقبول") || grade.includes("Acceptable"))
        return "warning";
      return "error";
    }
    if (percentage !== undefined) {
      if (percentage >= 90) return "success";
      if (percentage >= 70) return "info";
      if (percentage >= 50) return "warning";
      return "error";
    }
    return "default";
  }, []);

  // Get percentage color - memoized
  const getPercentageColor = useCallback((percent: number) => {
    if (percent >= 90) return "success";
    if (percent >= 70) return "info";
    if (percent >= 50) return "warning";
    return "error";
  }, []);

  // Memoize calculated values to prevent recalculation on every render
  // MUST be called before any conditional returns (Rules of Hooks)
  const percentage = useMemo(
    () => feedbackData?.percentage || 0,
    [feedbackData?.percentage]
  );
  const totalScore = useMemo(
    () => feedbackData?.total_score || feedbackData?.total_possible || 0,
    [feedbackData?.total_score, feedbackData?.total_possible]
  );
  const totalPossible = useMemo(
    () => feedbackData?.total_possible || feedbackData?.total_score || 0,
    [feedbackData?.total_possible, feedbackData?.total_score]
  );

  // Memoize percentage color value
  const percentageColor = useMemo(
    () => getPercentageColor(percentage),
    [percentage, getPercentageColor]
  );

  // Load feedback data only once on mount
  useEffect(() => {
    // Prevent multiple executions
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // Load feedback data from localStorage
    const storedFeedback = localStorage.getItem("quizFeedback");
    if (storedFeedback) {
      try {
        const parsed = JSON.parse(storedFeedback);
        setFeedbackData(parsed);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing feedback data:", error);
        toast.error(t("quiz.feedback.failedToLoad"));
        setIsLoading(false);
        navigateToHistory();
      }
    } else {
      // No feedback data, redirect to history
      toast.warning(t("quiz.feedback.noData"));
      navigateToHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        sx={{ p: { xs: 2, sm: 3 } }}
      >
        <CircularProgress size={60} />
        <Typography
          variant="h6"
          sx={{
            mt: 2,
            fontSize: { xs: "1rem", sm: "1.25rem" },
            textAlign: "center",
          }}
        >
          {t("quiz.feedback.loading")}
        </Typography>
      </Box>
    );
  }

  if (!feedbackData) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t("quiz.feedback.failedToLoad")}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Header Card with Score */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: { xs: "16px", sm: "20px" },
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, position: "relative" }}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="center">
            <Grid item xs={12}>
              <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "24px" },
                }}
              >
                {t("quiz.feedback.results")}
              </Typography>
            </Grid>
            {feedbackData.ai_feedback && (
              <Grid item xs={12}>
                <Box sx={{ color: "white" }}>
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {feedbackData.ai_feedback}
                  </Markdown>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" alignItems="center">
                {/* Score Circle */}
                <Box
                  sx={{
                    width: { xs: 150, sm: 180, md: 200 },
                    height: { xs: 150, sm: 180, md: 200 },
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    border:
                      { xs: "3px", sm: "4px" } + " solid rgba(255,255,255,0.3)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
                    }}
                  >
                    {percentage.toFixed(0)}%
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {totalScore} / {totalPossible}
                  </Typography>
                </Box>
                {feedbackData.grade_level && (
                  <Chip
                    label={feedbackData.grade_level}
                    color={getGradeColor(feedbackData.grade_level, percentage)}
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1rem", md: "1.1rem" },
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 2, sm: 3 },
                      fontWeight: "bold",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        {/* Total Score */}
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: { xs: "12px", sm: "16px" },
              textAlign: "center",
              p: { xs: 1.5, sm: 2 },
              background:
                "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)",
              border: "1px solid rgba(25, 118, 210, 0.2)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(25, 118, 210, 0.2)",
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: "12px",
                backgroundColor: "primary.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              <i
                className="tabler-check"
                style={{ fontSize: "24px", color: "#1976d2" }}
              />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              {totalScore}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {t("quiz.feedback.correctAnswers")}
            </Typography>
          </Card>
        </Grid>
        {/* Total Questions */}
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: { xs: "12px", sm: "16px" },
              textAlign: "center",
              p: { xs: 1.5, sm: 2 },
              background:
                "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
              border: "1px solid rgba(33, 150, 243, 0.2)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(33, 150, 243, 0.2)",
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: "12px",
                backgroundColor: "info.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              <i
                className="tabler-list-numbers"
                style={{ fontSize: "24px", color: "#2196f3" }}
              />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="info.main"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              {totalPossible}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {t("quiz.feedback.totalQuestions")}
            </Typography>
          </Card>
        </Grid>
        {/* Percentage */}
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: { xs: "12px", sm: "16px" },
              textAlign: "center",
              p: { xs: 1.5, sm: 2 },
              background:
                getPercentageColor(percentage) === "success"
                  ? "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)"
                  : getPercentageColor(percentage) === "warning"
                    ? "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)"
                    : "linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)",
              border:
                getPercentageColor(percentage) === "success"
                  ? "1px solid rgba(76, 175, 80, 0.2)"
                  : getPercentageColor(percentage) === "warning"
                    ? "1px solid rgba(255, 152, 0, 0.2)"
                    : "1px solid rgba(244, 67, 54, 0.2)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow:
                  getPercentageColor(percentage) === "success"
                    ? "0 8px 24px rgba(76, 175, 80, 0.2)"
                    : getPercentageColor(percentage) === "warning"
                      ? "0 8px 24px rgba(255, 152, 0, 0.2)"
                      : "0 8px 24px rgba(244, 67, 54, 0.2)",
              },
            }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: "12px",
                backgroundColor:
                  percentageColor === "success"
                    ? "success.light"
                    : percentageColor === "warning"
                      ? "warning.light"
                      : "error.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              <i
                className="tabler-trophy"
                style={{
                  fontSize: "24px",
                  color:
                    percentageColor === "success"
                      ? "#4caf50"
                      : percentageColor === "warning"
                        ? "#ff9800"
                        : "#f44336",
                }}
              />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={percentageColor}
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              {percentage.toFixed(1)}%
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {t("quiz.feedback.score")}
            </Typography>
          </Card>
        </Grid>
        {/* Time Spent */}
        {feedbackData.time_analysis && (
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: { xs: "12px", sm: "16px" },
                textAlign: "center",
                p: { xs: 1.5, sm: 2 },
                background:
                  "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)",
                border: "1px solid rgba(156, 39, 176, 0.2)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(156, 39, 176, 0.2)",
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: "12px",
                  backgroundColor: "secondary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1,
                }}
              >
                <i
                  className="tabler-clock"
                  style={{ fontSize: "24px", color: "#9c27b0" }}
                />
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="secondary"
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
              >
                {feedbackData.time_analysis.total_time_minutes}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {t("quiz.feedback.minutes")}
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Time Analysis */}
      {feedbackData.time_analysis && (
        <Card
          sx={{
            mb: 3,
            borderRadius: { xs: "12px", sm: "16px" },
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <i className="tabler-clock" style={{ fontSize: "24px" }} />
              {t("quiz.feedback.timeAnalysis")}
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: { xs: "8px", sm: "12px" },
                    background:
                      "linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)",
                    border: "1px solid rgba(33, 150, 243, 0.1)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    {t("quiz.feedback.averageTime")}
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    {feedbackData.time_analysis.average_per_question_seconds}{" "}
                    {t("quiz.feedback.seconds")}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: { xs: "8px", sm: "12px" },
                    background:
                      "linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)",
                    border: "1px solid rgba(76, 175, 80, 0.1)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    {feedbackData.time_analysis.analysis}
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={{ xs: 1, sm: 2 }}
                    mt={1}
                  >
                    <Chip
                      size="small"
                      label={`${t("quiz.feedback.fastest")}: ${feedbackData.time_analysis.fastest_question_seconds}s`}
                      color="success"
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                    />
                    <Chip
                      size="small"
                      label={`${t("quiz.feedback.slowest")}: ${feedbackData.time_analysis.slowest_question_seconds}s`}
                      color="warning"
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Question Results */}
          {feedbackData.question_results &&
            feedbackData.question_results.length > 0 && (
              <Card
                sx={{
                  mb: 3,
                  borderRadius: { xs: "12px", sm: "16px" },
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      mb: { xs: 2, sm: 3 },
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <i
                      className="tabler-list-check"
                      style={{ fontSize: "24px" }}
                    />
                    {t("quiz.feedback.questionResults")}
                  </Typography>
                  {feedbackData.question_results.map((question, index) => (
                    <Accordion
                      key={question.question_id}
                      sx={{
                        mb: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: "8px", sm: "12px" } + " !important",
                        border: question.is_correct
                          ? "2px solid #4caf50"
                          : "2px solid #f44336",
                        "&:before": { display: "none" },
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      defaultExpanded={index === 0}
                    >
                      <AccordionSummary
                        expandIcon={<i className="tabler-chevron-down" />}
                        sx={{
                          bgcolor: question.is_correct
                            ? "success.50"
                            : "error.50",
                          borderRadius: { xs: "8px", sm: "12px" },
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          gap={{ xs: 1, sm: 2 }}
                          width="100%"
                          flexDirection={{ xs: "column", sm: "row" }}
                        >
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              minWidth: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 },
                            }}
                          />
                          <Box flex={1} sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="600"
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                                wordBreak: "break-word",
                              }}
                            >
                              {question.question_text}
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                              <Chip
                                label={question.concept}
                                size="small"
                                color="primary"
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              />
                              <Chip
                                label={question.difficulty}
                                size="small"
                                color={
                                  question.difficulty.includes("سهل") ||
                                  question.difficulty.includes("Easy")
                                    ? "success"
                                    : question.difficulty.includes("متوسط") ||
                                        question.difficulty.includes("Medium")
                                      ? "warning"
                                      : "error"
                                }
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              />
                              <Chip
                                label={`${question.time_spent_seconds}s`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              />
                            </Box>
                          </Box>
                          {question.is_correct ? (
                            <i
                              className="tabler-check-circle"
                              style={{
                                fontSize: "24px",
                                color: "#4caf50",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <i
                              className="tabler-x-circle"
                              style={{
                                fontSize: "24px",
                                color: "#f44336",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          bgcolor: "background.paper",
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                          <Grid item xs={12} md={6}>
                            <Paper
                              sx={{
                                p: { xs: 1.5, sm: 2 },
                                bgcolor: question.is_correct
                                  ? "success.50"
                                  : "error.50",
                                borderRadius: { xs: "8px", sm: "12px" },
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              >
                                {t("quiz.feedback.yourAnswer")}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="600"
                                sx={{
                                  mt: 0.5,
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                  wordBreak: "break-word",
                                }}
                              >
                                {question.student_answer ||
                                  t("quiz.feedback.noAnswer")}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Paper
                              sx={{
                                p: { xs: 1.5, sm: 2 },
                                bgcolor: "primary.50",
                                borderRadius: { xs: "8px", sm: "12px" },
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              >
                                {t("quiz.feedback.correctAnswer")}
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="600"
                                sx={{
                                  mt: 0.5,
                                  fontSize: { xs: "0.875rem", sm: "1rem" },
                                  wordBreak: "break-word",
                                }}
                              >
                                {question.correct_answer}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            )}

          {/* Weakness Analysis */}
          {feedbackData.weakness_analysis && (
            <Card
              sx={{
                borderRadius: { xs: "12px", sm: "16px" },
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <i
                    className="tabler-alert-triangle"
                    style={{ fontSize: "24px" }}
                  />
                  {t("quiz.feedback.weaknessAnalysis")}
                </Typography>

                {/* Weak Concepts */}
                {feedbackData.weakness_analysis.weak_concepts &&
                  feedbackData.weakness_analysis.weak_concepts.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        gutterBottom
                      >
                        {t("quiz.feedback.weakConcepts")}
                      </Typography>
                      <Box
                        display="flex"
                        gap={1}
                        flexWrap="wrap"
                        sx={{ mt: 1 }}
                      >
                        {feedbackData.weakness_analysis.weak_concepts.map(
                          (concept, idx) => (
                            <Chip
                              key={idx}
                              label={concept}
                              color="error"
                              size="small"
                            />
                          )
                        )}
                      </Box>
                    </Box>
                  )}

                {/* Concept Accuracy */}
                {feedbackData.weakness_analysis.concept_accuracy &&
                  Object.keys(feedbackData.weakness_analysis.concept_accuracy)
                    .length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        gutterBottom
                      >
                        {t("quiz.feedback.conceptAccuracy")}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {Object.entries(
                          feedbackData.weakness_analysis.concept_accuracy
                        ).map(([concept, accuracy]) => (
                          <Box key={concept} sx={{ mb: 2 }}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              mb={0.5}
                            >
                              <Typography variant="body2">{concept}</Typography>
                              <Typography variant="body2" fontWeight="600">
                                {(accuracy * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={accuracy * 100}
                              color={
                                accuracy >= 0.7
                                  ? "success"
                                  : accuracy >= 0.5
                                    ? "warning"
                                    : "error"
                              }
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                {/* Difficulty Performance */}
                {feedbackData.weakness_analysis.difficulty_performance &&
                  Object.keys(
                    feedbackData.weakness_analysis.difficulty_performance
                  ).length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        gutterBottom
                      >
                        {t("quiz.feedback.difficultyPerformance")}
                      </Typography>
                      <Grid
                        container
                        spacing={{ xs: 1.5, sm: 2 }}
                        sx={{ mt: 1 }}
                      >
                        {Object.entries(
                          feedbackData.weakness_analysis.difficulty_performance
                        ).map(([difficulty, perf]) => {
                          const percentage = (perf.correct / perf.total) * 100;
                          return (
                            <Grid item xs={12} sm={6} key={difficulty}>
                              <Card
                                sx={{
                                  p: { xs: 1.5, sm: 2 },
                                  borderRadius: { xs: "8px", sm: "12px" },
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{
                                    fontSize: { xs: "0.875rem", sm: "1rem" },
                                  }}
                                >
                                  {difficulty}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    mt: 1,
                                    fontSize: { xs: "1.125rem", sm: "1.25rem" },
                                  }}
                                >
                                  {perf.correct} / {perf.total}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={percentage}
                                  color={
                                    percentage >= 70
                                      ? "success"
                                      : percentage >= 50
                                        ? "warning"
                                        : "error"
                                  }
                                  sx={{
                                    mt: 1,
                                    height: { xs: 5, sm: 6 },
                                    borderRadius: 3,
                                  }}
                                />
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Strength Areas */}
          {feedbackData.strength_areas &&
            feedbackData.strength_areas.length > 0 && (
              <Card
                sx={{
                  mb: 3,
                  borderRadius: { xs: "12px", sm: "16px" },
                  bgcolor: "success.50",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <i className="tabler-star" style={{ fontSize: "20px" }} />
                    {t("quiz.feedback.strengthAreas")}
                  </Typography>
                  <List>
                    {feedbackData.strength_areas.map((strength, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i
                            className="tabler-check"
                            style={{ color: "#4caf50", fontSize: "20px" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={strength}
                          primaryTypographyProps={{
                            sx: { fontSize: { xs: "0.875rem", sm: "1rem" } },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

          {/* Improvement Areas */}
          {feedbackData.improvement_areas &&
            feedbackData.improvement_areas.length > 0 && (
              <Card
                sx={{
                  mb: 3,
                  borderRadius: { xs: "12px", sm: "16px" },
                  bgcolor: "warning.50",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <i
                      className="tabler-trending-up"
                      style={{ fontSize: "20px" }}
                    />
                    {t("quiz.feedback.improvementAreas")}
                  </Typography>
                  <List>
                    {feedbackData.improvement_areas.map((area, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <i
                            className="tabler-alert-circle"
                            style={{ color: "#ff9800", fontSize: "20px" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={area}
                          primaryTypographyProps={{
                            sx: { fontSize: { xs: "0.875rem", sm: "1rem" } },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

          {/* Personalized Recommendations */}
          {feedbackData.personalized_recommendations &&
            feedbackData.personalized_recommendations.length > 0 && (
              <Card
                sx={{
                  mb: 3,
                  borderRadius: { xs: "12px", sm: "16px" },
                  bgcolor: "primary.50",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <i
                      className="tabler-lightbulb"
                      style={{ fontSize: "20px" }}
                    />
                    {t("quiz.feedback.recommendations")}
                  </Typography>
                  <List>
                    {feedbackData.personalized_recommendations.map(
                      (rec, idx) => (
                        <ListItem
                          key={idx}
                          sx={{ px: 0, alignItems: "flex-start", py: 0.5 }}
                        >
                          <ListItemIcon sx={{ mt: 0.5, minWidth: 32 }}>
                            <i
                              className="tabler-book"
                              style={{ color: "#2196f3", fontSize: "20px" }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec}
                            primaryTypographyProps={{
                              sx: {
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                              },
                            }}
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                </CardContent>
              </Card>
            )}

          {/* Weakness Recommendations */}
          {feedbackData.weakness_analysis?.recommendations &&
            feedbackData.weakness_analysis.recommendations.length > 0 && (
              <Card
                sx={{
                  borderRadius: { xs: "12px", sm: "16px" },
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <i className="tabler-target" style={{ fontSize: "20px" }} />
                    {t("quiz.feedback.studyRecommendations")}
                  </Typography>
                  <List>
                    {feedbackData.weakness_analysis.recommendations.map(
                      (rec, idx) => (
                        <ListItem
                          key={idx}
                          sx={{ px: 0, alignItems: "flex-start", py: 0.5 }}
                        >
                          <ListItemIcon sx={{ mt: 0.5, minWidth: 32 }}>
                            <i
                              className="tabler-book-2"
                              style={{ color: "#00bcd4", fontSize: "20px" }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec}
                            primaryTypographyProps={{
                              sx: {
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                              },
                            }}
                          />
                        </ListItem>
                      )
                    )}
                  </List>
                </CardContent>
              </Card>
            )}
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        justifyContent="center"
        sx={{ mt: { xs: 3, sm: 4 } }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={navigateToAddQuiz}
          color="primary"
          sx={{
            borderRadius: { xs: "8px", sm: "12px" },
            px: { xs: 3, sm: 4 },
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            width: { xs: "100%", sm: "auto" },
            background:
              "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
            },
          }}
        >
          <i className="tabler-plus" style={{ marginRight: "8px" }} />
          {t("quiz.feedback.newQuiz")}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={navigateToHistory}
          sx={{
            borderRadius: { xs: "8px", sm: "12px" },
            px: { xs: 3, sm: 4 },
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            width: { xs: "100%", sm: "auto" },
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          }}
        >
          <i className="tabler-history" style={{ marginRight: "8px" }} />
          {t("quiz.feedback.viewHistory")}
        </Button>
      </Box>
    </Box>
  );
};

export default QuizFeedbackComponent;

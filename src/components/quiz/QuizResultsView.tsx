"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import {
  IconArrowLeft,
  IconDownload,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";

interface QuizResultsViewProps {
  quiz: any;
  onBack: () => void;
}

export default function QuizResultsView({
  quiz,
  onBack,
}: QuizResultsViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const score = 85;
  const totalQuestions = 15;
  const correctAnswers = Math.round((score / 100) * totalQuestions);
  const timeSpent = 22; // minutes

  const resultsByCategory = [
    {
      category: "مفهوم الأسئلة",
      score: 90,
      correct: 9,
      total: 10,
    },
    {
      category: "الحسابات",
      score: 75,
      correct: 3,
      total: 4,
    },
    {
      category: "التطبيق العملي",
      score: 80,
      correct: 1,
      total: 1,
    },
  ];

  const answeredQuestions = [
    {
      id: 1,
      question: "ما هي عاصمة المملكة العربية السعودية؟",
      studentAnswer: "الرياض",
      correctAnswer: "الرياض",
      isCorrect: true,
    },
    {
      id: 2,
      question: "كم عدد قارات العالم؟",
      studentAnswer: "6",
      correctAnswer: "7",
      isCorrect: false,
    },
    {
      id: 3,
      question: "هل الماء يغلي في درجة حرارة 100 درجة مئوية؟",
      studentAnswer: "صحيح",
      correctAnswer: "صحيح",
      isCorrect: true,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 80) return "info";
    if (score >= 70) return "warning";
    return "error";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return "🎉";
    if (score >= 80) return "😊";
    if (score >= 70) return "👍";
    return "💪";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Back Button */}
      <Button
        startIcon={<IconArrowLeft size={20} />}
        onClick={onBack}
        sx={{ mb: 3 }}
        variant="text"
      >
        {t("quiz.ui.cancel")}
      </Button>

      {/* Score Card */}
      <Card sx={{ mb: 4, overflow: "visible" }}>
        <CardContent>
          <Grid
            container
            spacing={4}
            alignItems="center"
          >
            <Grid
              item
              xs={12}
              md={4}
              sx={{ textAlign: "center" }}
            >
              <Box sx={{ position: "relative", display: "inline-flex", mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={score}
                  size={180}
                  thickness={4}
                  sx={{
                    color:
                      getScoreColor(score) === "success"
                        ? "#28C76F"
                        : getScoreColor(score) === "info"
                          ? "#00BAD1"
                          : getScoreColor(score) === "warning"
                            ? "#FF9F43"
                            : "#FF4C51",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color:
                        getScoreColor(score) === "success"
                          ? "#28C76F"
                          : "primary.main",
                    }}
                  >
                    {score}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {t("quiz.ui.outOf", { total: 100 } as any)}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mt: 3,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                {getScoreEmoji(score)} {t("quiz.ui.excellent")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 1 }}
              >
                {t("quiz.ui.veryGood")}
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              md={8}
            >
              {/* Quick Stats */}
              <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Grid
                  item
                  xs={6}
                  sm={4}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: "success.main",
                      color: "white",
                      textAlign: "center",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600 }}
                    >
                      {correctAnswers}
                    </Typography>
                    <Typography variant="caption">
                      {t("quiz.ui.correctAnswers")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={4}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: "error.main",
                      color: "white",
                      textAlign: "center",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600 }}
                    >
                      {totalQuestions - correctAnswers}
                    </Typography>
                    <Typography variant="caption">
                      {t("quiz.ui.wrongAnswers")}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sm={4}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: "info.main",
                      color: "white",
                      textAlign: "center",
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600 }}
                    >
                      {timeSpent}
                    </Typography>
                    <Typography variant="caption">
                      {t("quiz.ui.minutes")}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Detailed Stats */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {t("quiz.ui.performance")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={score}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "action.hover",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, minWidth: 50 }}
                  >
                    {score}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3 }}
          >
            {t("quiz.ui.categoryBreakdown")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {resultsByCategory.map((category, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  backgroundColor: "action.hover",
                  borderRadius: 1,
                  borderRight: 4,
                  borderColor: "primary.main",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                  >
                    {category.category}
                  </Typography>
                  <Chip
                    label={`${category.score}%`}
                    color={category.score >= 80 ? "success" : "warning"}
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={category.score}
                  sx={{ mb: 1 }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  {category.correct} من {category.total} أسئلة
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Answers Review */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 3 }}
          >
            {t("quiz.ui.answerReview")}
          </Typography>

          {!isMobile ? (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 600, minWidth: 60 }}>
                      رقم
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>
                      السؤال
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                      إجابتك
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                      الصحيحة
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, minWidth: 80 }}
                    >
                      النتيجة
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {answeredQuestions.map((q) => (
                    <TableRow
                      key={q.id}
                      hover
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                        >
                          {q.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{q.question}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={q.studentAnswer}
                          size="small"
                          variant="outlined"
                          color={q.isCorrect ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={q.correctAnswer}
                          size="small"
                          color={q.isCorrect ? "success" : "info"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {q.isCorrect ? (
                          <Chip
                            icon={<IconCheck size={16} />}
                            label="صحيح"
                            size="small"
                            color="success"
                            variant="filled"
                          />
                        ) : (
                          <Chip
                            icon={<IconX size={16} />}
                            label="خاطئ"
                            size="small"
                            color="error"
                            variant="filled"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // Mobile Card Layout
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {answeredQuestions.map((q) => (
                <Paper
                  key={q.id}
                  sx={{
                    p: 2,
                    backgroundColor: q.isCorrect
                      ? "success.light"
                      : "error.light",
                    borderLeft: 4,
                    borderColor: q.isCorrect ? "success.main" : "error.main",
                  }}
                >
                  <Box
                    sx={{
                      mb: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      السؤال {q.id}
                    </Typography>
                    {q.isCorrect ? (
                      <Chip
                        icon={<IconCheck size={14} />}
                        label="صحيح"
                        size="small"
                        color="success"
                        variant="filled"
                      />
                    ) : (
                      <Chip
                        icon={<IconX size={14} />}
                        label="خاطئ"
                        size="small"
                        color="error"
                        variant="filled"
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {q.question}
                  </Typography>
                  <Grid
                    container
                    spacing={1}
                  >
                    <Grid
                      item
                      xs={6}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        إجابتك
                      </Typography>
                      <Chip
                        label={q.studentAnswer}
                        size="small"
                        variant="outlined"
                        color={q.isCorrect ? "success" : "error"}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={6}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        الإجابة الصحيحة
                      </Typography>
                      <Chip
                        label={q.correctAnswer}
                        size="small"
                        color={q.isCorrect ? "success" : "info"}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Button
          startIcon={<IconDownload size={20} />}
          variant="outlined"
          color="primary"
        >
          {t("quiz.ui.downloadResults")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onBack}
        >
          {t("quiz.ui.createNewQuizButton")}
        </Button>
      </Box>
    </Box>
  );
}

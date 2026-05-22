"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Grid,
  Paper,
  Chip,
  useTheme,
} from "@mui/material";
import {
  IconArrowLeft,
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";

interface QuizTakingViewProps {
  quiz: any;
  onFinish: () => void;
  onBack: () => void;
}

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "ما هي عاصمة المملكة العربية السعودية؟",
    type: "multiple-choice",
    options: ["الدمام", "الرياض", "جدة", "المدينة المنورة"],
    answer: "الرياض",
  },
  {
    id: 2,
    text: "كم عدد قارات العالم؟",
    type: "multiple-choice",
    options: ["5", "6", "7", "8"],
    answer: "7",
  },
  {
    id: 3,
    text: "هل الماء يغلي في درجة حرارة 100 درجة مئوية؟",
    type: "true-false",
    options: ["صحيح", "خاطئ"],
    answer: "صحيح",
  },
  {
    id: 4,
    text: 'أكمل الجملة: "السلام عليكم ___"',
    type: "fill-in",
    options: ["ورحمة الله وبركاته", "يا أصدقاء", "وعليكم", "شكراً"],
    answer: "ورحمة الله وبركاته",
  },
  {
    id: 5,
    text: "ما هو أكبر كوكب في المجموعة الشمسية؟",
    type: "multiple-choice",
    options: ["زحل", "المريخ", "المشتري", "نبتون"],
    answer: "المشتري",
  },
];

export default function QuizTakingView({
  quiz,
  onFinish,
  onBack,
}: QuizTakingViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  const question = SAMPLE_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / SAMPLE_QUESTIONS.length) * 100;

  const handleAnswerChange = (answer: string) => {
    setAnswers({
      ...answers,
      [question.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    onFinish();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const allAnswered = Object.keys(answers).length === SAMPLE_QUESTIONS.length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
      {/* Header with Timer */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          mb: 3,
          backgroundColor: "action.hover",
          borderRadius: 1,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary" }}
          >
            {quiz?.title || t("quiz.ui.question")}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            {t("quiz.ui.questionProgressLabel", {
              current: currentQuestion + 1,
              total: SAMPLE_QUESTIONS.length,
            } as any)}
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: "center",
            px: 3,
            py: 1.5,
            backgroundColor: "primary.main",
            color: "white",
            borderRadius: 1,
          }}
        >
          <Typography variant="caption">
            {t("quiz.ui.timeRemaining")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontFamily: "monospace",
              fontSize: "1.25rem",
            }}
          >
            {formatTime(timeRemaining)}
          </Typography>
        </Box>
      </Paper>

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "text.secondary" }}
          >
            التقدم
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600 }}
          >
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8 }}
        />
      </Box>

      <Grid
        container
        spacing={2}
        sx={{ px: { xs: 1, sm: 2 } }}
      >
        {/* Main Question Area */}
        <Grid
          item
          xs={12}
          lg={8}
        >
          <Card>
            <CardContent>
              {/* Question */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                {question.text}
              </Typography>

              {/* Question Type Badge */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={
                    question.type === "multiple-choice"
                      ? "اختيار من متعدد"
                      : question.type === "true-false"
                        ? "صحيح/خاطئ"
                        : "ملء الفراغات"
                  }
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Box>

              {/* Answer Options */}
              <RadioGroup
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {question.options.map((option: string, idx: number) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 2,
                        border: 2,
                        borderColor:
                          answers[question.id] === option
                            ? "primary.main"
                            : "divider",
                        backgroundColor:
                          answers[question.id] === option
                            ? "primary.main"
                            : "action.hover",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        "&:hover": {
                          borderColor: "primary.main",
                          backgroundColor: "primary.light",
                        },
                      }}
                    >
                      <FormControlLabel
                        value={option}
                        control={
                          <Radio
                            sx={{
                              color:
                                answers[question.id] === option
                                  ? "white"
                                  : "primary.main",
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color:
                                answers[question.id] === option
                                  ? "white"
                                  : "text.primary",
                            }}
                          >
                            {option}
                          </Typography>
                        }
                        sx={{ width: "100%", ml: 0 }}
                      />
                    </Paper>
                  ))}
                </Box>
              </RadioGroup>

              {/* Navigation Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                  mt: 4,
                  pt: 3,
                  borderTop: 1,
                  borderColor: "divider",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  startIcon={<IconChevronLeft size={20} />}
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="outlined"
                  sx={{ flex: { xs: 1, sm: "auto" } }}
                >
                  {t("quiz.ui.previous")}
                </Button>

                {currentQuestion === SAMPLE_QUESTIONS.length - 1 ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleFinish}
                    size="large"
                    disabled={!allAnswered}
                    sx={{ flex: { xs: 1, sm: "auto" } }}
                  >
                    {t("quiz.ui.submit")}
                  </Button>
                ) : (
                  <Button
                    endIcon={<IconChevronRight size={20} />}
                    onClick={handleNext}
                    variant="contained"
                    color="primary"
                    sx={{ flex: { xs: 1, sm: "auto" } }}
                  >
                    {t("quiz.ui.next")}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Question Navigator */}
        <Grid
          item
          xs={12}
          lg={4}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                الأسئلة
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 1,
                  mb: 3,
                }}
              >
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <Button
                    key={q.id}
                    variant={currentQuestion === idx ? "contained" : "outlined"}
                    color={answers[q.id] ? "success" : "primary"}
                    onClick={() => setCurrentQuestion(idx)}
                    sx={{
                      minWidth: 0,
                      aspectRatio: "1",
                      p: 0,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {answers[q.id] && "✓"}
                    {!answers[q.id] && idx + 1}
                  </Button>
                ))}
              </Box>

              {/* Legend */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "success.main",
                    }}
                  />
                  <Typography variant="caption">مجاب عنه</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "action.hover",
                      border: 1,
                      borderColor: "divider",
                    }}
                  />
                  <Typography variant="caption">لم يتم الإجابة</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "primary.main",
                    }}
                  />
                  <Typography variant="caption">السؤال الحالي</Typography>
                </Box>
              </Box>

              {/* Summary */}
              <Paper
                sx={{
                  p: 2,
                  mt: 3,
                  backgroundColor: "info.main",
                  color: "white",
                }}
              >
                <Typography variant="caption">📊 الملخص</Typography>
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="caption">
                    مجاب: {Object.keys(answers).length}
                  </Typography>
                  <Typography variant="caption">
                    متبقي:{" "}
                    {SAMPLE_QUESTIONS.length - Object.keys(answers).length}
                  </Typography>
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

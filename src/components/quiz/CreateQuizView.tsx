"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Chip,
} from "@mui/material";
import {
  IconArrowLeft,
  IconBook,
  IconClock,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";

interface CreateQuizViewProps {
  onBack: () => void;
}

export default function CreateQuizView({ onBack }: CreateQuizViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const STEPS = [
    t("quiz.ui.subject"),
    t("quiz.ui.lessons"),
    t("quiz.ui.duration"),
    t("quiz.ui.reviewAndCreate"),
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [quizData, setQuizData] = useState({
    subject: "math",
    lessons: [] as string[],
    duration: "30",
    difficulty: "medium",
    questionCount: "15",
  });

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      onBack();
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubjectChange = (value: string) => {
    setQuizData({ ...quizData, subject: value, lessons: [] });
  };

  const handleLessonToggle = (lesson: string) => {
    const newLessons = quizData.lessons.includes(lesson)
      ? quizData.lessons.filter((l) => l !== lesson)
      : [...quizData.lessons, lesson];
    setQuizData({ ...quizData, lessons: newLessons });
  };

  const subjects = [
    {
      id: "math",
      label: "الرياضيات",
      icon: "🔢",
      color: theme.palette.primary.main,
    },
    {
      id: "arabic",
      label: "اللغة العربية",
      icon: "📖",
      color: theme.palette.info.main,
    },
    {
      id: "science",
      label: "العلوم",
      icon: "🔬",
      color: theme.palette.success.main,
    },
    {
      id: "english",
      label: "اللغة الإنجليزية",
      icon: "🌍",
      color: theme.palette.warning.main,
    },
  ];

  const lessonsMap: Record<string, string[]> = {
    math: [
      "الجمع والطرح",
      "الضرب والقسمة",
      "الأعداد العشرية",
      "المعادلات",
      "النسب والتناسب",
    ],
    arabic: ["القراءة والفهم", "القواعد النحوية", "الإملاء", "التعبير الكتابي"],
    science: [
      "الكائنات الحية",
      "المادة والطاقة",
      "الفضاء والعناصر",
      "جسم الإنسان",
    ],
    english: ["المفردات", "القواعس", "الاستماع", "المحادثة", "القراءة"],
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<IconArrowLeft size={20} />}
          onClick={handleBack}
          sx={{ mb: 2 }}
          variant="text"
        >
          {t("quiz.ui.cancel")}
        </Button>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          {t("quiz.ui.createNewQuiz")}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary" }}
        >
          {t("quiz.ui.startCreating")}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          ".MuiStepLabel-label": {
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        }}
      >
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {/* Step 1: Choose Subject */}
          {activeStep === 0 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 3 }}
              >
                {t("quiz.ui.selectSubject")}
              </Typography>

              <Grid
                container
                spacing={2}
              >
                {subjects.map((subject) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    key={subject.id}
                  >
                    <Paper
                      onClick={() => handleSubjectChange(subject.id)}
                      elevation={0}
                      sx={{
                        p: 3,
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          quizData.subject === subject.id
                            ? subject.color
                            : "divider",
                        backgroundColor:
                          quizData.subject === subject.id
                            ? subject.color
                            : "action.hover",
                        transition: "all 0.3s",
                        textAlign: "center",
                        "&:hover": {
                          borderColor: subject.color,
                          boxShadow: 1,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "2.5rem",
                          mb: 1,
                        }}
                      >
                        {subject.icon}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            quizData.subject === subject.id
                              ? "white"
                              : "text.primary",
                        }}
                      >
                        {subject.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Step 2: Choose Lessons */}
          {activeStep === 1 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 3 }}
              >
                {t("quiz.ui.selectLessons")}
              </Typography>

              <FormGroup>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {lessonsMap[quizData.subject]?.map((lesson) => (
                    <Paper
                      key={lesson}
                      elevation={0}
                      sx={{
                        p: 2,
                        backgroundColor: "action.hover",
                        borderRadius: 1,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={quizData.lessons.includes(lesson)}
                            onChange={() => handleLessonToggle(lesson)}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500 }}
                          >
                            {lesson}
                          </Typography>
                        }
                        sx={{ width: "100%", ml: 0 }}
                      />
                    </Paper>
                  ))}
                </Box>
              </FormGroup>

              {quizData.lessons.length === 0 && (
                <Paper
                  sx={{
                    p: 3,
                    mt: 2,
                    backgroundColor: "warning.light",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {t("quiz.form.atLeastOneLesson")}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Step 3: Set Duration and Options */}
          {activeStep === 2 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 3 }}
              >
                {t("quiz.ui.difficulty")}
              </Typography>

              <Grid
                container
                spacing={3}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <FormControl fullWidth>
                    <InputLabel>{t("quiz.ui.numQuestions")}</InputLabel>
                    <Select
                      value={quizData.questionCount}
                      label={t("quiz.ui.numQuestions")}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          questionCount: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="5">5</MenuItem>
                      <MenuItem value="10">10</MenuItem>
                      <MenuItem value="15">15</MenuItem>
                      <MenuItem value="20">20</MenuItem>
                      <MenuItem value="25">25</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <FormControl fullWidth>
                    <InputLabel>{t("quiz.ui.duration")}</InputLabel>
                    <Select
                      value={quizData.duration}
                      label={t("quiz.ui.duration")}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          duration: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="15">15</MenuItem>
                      <MenuItem value="30">30</MenuItem>
                      <MenuItem value="45">45</MenuItem>
                      <MenuItem value="60">60</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid
                  item
                  xs={12}
                >
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 2, fontWeight: 600 }}>
                      {t("quiz.ui.selectDifficulty")}
                    </FormLabel>
                    <RadioGroup
                      value={quizData.difficulty}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          difficulty: e.target.value,
                        })
                      }
                      row
                    >
                      <FormControlLabel
                        value="easy"
                        control={<Radio />}
                        label={t("quiz.ui.easy")}
                      />
                      <FormControlLabel
                        value="medium"
                        control={<Radio />}
                        label={t("quiz.ui.medium")}
                      />
                      <FormControlLabel
                        value="hard"
                        control={<Radio />}
                        label={t("quiz.ui.hard")}
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 4: Review */}
          {activeStep === 3 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 3 }}
              >
                {t("quiz.ui.quizSummary")}
              </Typography>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                >
                  <Paper sx={{ p: 2, backgroundColor: "action.hover" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("quiz.ui.subject")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {subjects.find((s) => s.id === quizData.subject)?.label}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid
                  item
                  xs={12}
                >
                  <Paper sx={{ p: 2, backgroundColor: "action.hover" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("quiz.ui.lessons")}
                    </Typography>
                    <Box
                      sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}
                    >
                      {quizData.lessons.map((lesson) => (
                        <Chip
                          key={lesson}
                          label={lesson}
                          color="primary"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Paper sx={{ p: 2, backgroundColor: "action.hover" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("quiz.ui.numQuestions")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {quizData.questionCount}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Paper sx={{ p: 2, backgroundColor: "action.hover" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("quiz.ui.duration")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {quizData.duration} {t("quiz.ui.minutes")}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid
                  item
                  xs={12}
                >
                  <Paper sx={{ p: 2, backgroundColor: "action.hover" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("quiz.ui.difficulty")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {quizData.difficulty === "easy"
                        ? t("quiz.ui.easy")
                        : quizData.difficulty === "medium"
                          ? t("quiz.ui.medium")
                          : t("quiz.ui.hard")}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper
                sx={{
                  p: 3,
                  mt: 3,
                  backgroundColor: "success.light",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "success.main" }}
                >
                  ✓ {t("quiz.ui.formValid")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  {t("quiz.form.pleaseWait")}
                </Typography>
              </Paper>
            </Box>
          )}

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
            }}
          >
            <Button
              onClick={handleBack}
              variant="outlined"
              disabled={activeStep === 0}
            >
              {t("quiz.ui.previous")}
            </Button>

            {activeStep === STEPS.length - 1 ? (
              <Button
                variant="contained"
                color="success"
              >
                {t("quiz.ui.create")}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                color="primary"
                disabled={
                  (activeStep === 1 && quizData.lessons.length === 0) ||
                  (activeStep === 0 && !quizData.subject)
                }
              >
                {t("quiz.ui.next")}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

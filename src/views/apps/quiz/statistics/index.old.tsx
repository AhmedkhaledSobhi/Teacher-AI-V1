"use client";

// React Imports
import React, { useEffect, useMemo, useState, useCallback } from "react";

// MUI Imports
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Collapse from "@mui/material/Collapse";

// Charts
import ApexChart from "@/libs/ApexCharts";

// Hooks
import { useTranslation } from "@/hooks/useTranslation";
import { useParams, useRouter } from "next/navigation";
import { QuizService } from "@/services/quiz";
import { toast } from "react-toastify";

// Types
type PerformanceBySubject = {
  subject: string;
  average_score: number;
  quizzes_taken: number;
  subject_name_ar?: string;
};

type PerformanceOverTime = {
  date: string;
  percentage: number;
  quiz_id: string;
  subject: string;
  subject_name_ar?: string;
};

type Concept = {
  concept_name: string;
  correct: number;
  total: number;
  accuracy: number;
};

type Lesson = {
  lesson_id: number;
  lesson_title: string;
  overall_accuracy: number;
  lesson_total_questions: number;
  concepts: Concept[];
};

type SubjectWithLessons = {
  subject_id: number;
  subject_name: string;
  subject_name_ar: string;
  lessons: Lesson[];
};

type PerformanceByDifficulty = {
  difficulty: string;
  correct: number;
  total: number;
};

type UserPerformanceDashboard = {
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

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) {
      return iso;
    }
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

const QuizStatistics: React.FC<{}> = ({}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang: locale } = useParams<{ lang: string }>();
  const [data, setData] = useState<UserPerformanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedLessons, setExpandedLessons] = useState<{
    [key: string]: boolean;
  }>({});
  const [retryCount, setRetryCount] = useState(0);

  const fetchPerformanceData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await QuizService.getPerformanceData();

      if (response.operation_status === "success") {
        setData(response as any);
      } else {
        const errorMsg =
          t("quiz.statistics.failedToLoad") ||
          "Failed to load performance data";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
      const errorMsg =
        t("quiz.statistics.failedToLoad") || "Failed to load performance data";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchPerformanceData();
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchPerformanceData, retryCount]);

  const handleSubjectToggle = useCallback((subjectKey: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectKey]: !prev[subjectKey],
    }));
  }, []);

  const handleLessonToggle = useCallback((lessonKey: string) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonKey]: !prev[lessonKey],
    }));
  }, []);

  // Chart Options
  const subjectBarOptions = useMemo(() => {
    const categories =
      data?.performance_by_subject?.map(
        (s) => s.subject_name_ar || s.subject
      ) || [];
    const scores =
      data?.performance_by_subject?.map((s) => s.average_score) || [];

    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
        sparkline: { enabled: false },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "60%",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: "var(--mui-palette-text-secondary)" },
          rotate: -15,
        },
      },
      yaxis: {
        max: 100,
        min: 0,
        tickAmount: 5,
        labels: {
          style: { colors: "var(--mui-palette-text-secondary)" },
          formatter: (val: number) => `${val}%`,
        },
      },
      colors: [
        "var(--mui-palette-primary-main)",
        "var(--mui-palette-info-main)",
        "var(--mui-palette-success-main)",
        "var(--mui-palette-warning-main)",
        "var(--mui-palette-error-main)",
      ],
      grid: {
        borderColor: "var(--mui-palette-divider)",
        strokeDashArray: 3,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
        },
      },
    } as ApexCharts.ApexOptions;
  }, [data]);

  const subjectBarSeries = useMemo(() => {
    const scores =
      data?.performance_by_subject?.map((s) => s.average_score) || [];
    return [
      {
        name: t("quiz.statistics.averageScoreSeries") || "Average Score",
        data: scores,
      },
    ];
  }, [data, t]);

  const timeSeriesOptions = useMemo(() => {
    const categories =
      data?.performance_over_time
        ?.slice()
        .filter(
          (p) => p.date && p.percentage !== undefined && p.percentage !== null
        )
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (isNaN(dateA) || isNaN(dateB)) return 0;
          return dateA - dateB;
        })
        .map((p) => formatDate(p.date)) || [];

    return {
      chart: {
        type: "line",
        toolbar: { show: false },
        sparkline: { enabled: false },
        zoom: { enabled: false },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 6,
        hover: {
          size: 8,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        offsetY: -10,
        style: {
          fontSize: "11px",
          colors: ["var(--mui-palette-text-primary)"],
          fontWeight: 600,
        },
      },
      colors: ["var(--mui-palette-secondary-main)"],
      xaxis: {
        type: "category",
        categories: categories,
        labels: {
          style: { colors: "var(--mui-palette-text-secondary)" },
          rotate: -45,
          rotateAlways: false,
        },
      },
      yaxis: {
        max: 100,
        min: 0,
        tickAmount: 5,
        labels: {
          style: { colors: "var(--mui-palette-text-secondary)" },
          formatter: (val: number) => `${val}%`,
        },
      },
      grid: {
        borderColor: "var(--mui-palette-divider)",
        strokeDashArray: 3,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val: number) => `${val}%`,
        },
      },
    } as ApexCharts.ApexOptions;
  }, [data]);

  const timeSeries = useMemo(() => {
    if (
      !data?.performance_over_time ||
      data.performance_over_time.length === 0
    ) {
      return [
        { name: t("quiz.statistics.scoreSeries") || "Score %", data: [] },
      ];
    }

    const sortedData = data.performance_over_time
      .slice()
      .filter(
        (p) => p.date && p.percentage !== undefined && p.percentage !== null
      )
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (isNaN(dateA) || isNaN(dateB)) {
          return 0;
        }
        return dateA - dateB;
      });

    const values = sortedData.map((p) => {
      const percentage =
        typeof p.percentage === "number"
          ? p.percentage
          : Number(p.percentage) || 0;
      return Math.min(Math.max(percentage, 0), 100);
    });

    return [
      { name: t("quiz.statistics.scoreSeries") || "Score %", data: values },
    ];
  }, [data, t]);

  const difficultyOptions = useMemo(() => {
    if (
      !data?.performance_by_difficulty ||
      data.performance_by_difficulty.length === 0
    ) {
      return null;
    }

    const categories = data.performance_by_difficulty.map((d) => d.difficulty);
    const correct = data.performance_by_difficulty.map((d) => d.correct);
    const total = data.performance_by_difficulty.map((d) => d.total);

    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "50%",
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts: any) => {
          const index = opts.dataPointIndex;
          return `${correct[index]}/${total[index]} (${val.toFixed(0)}%)`;
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["var(--mui-palette-text-primary)"],
        },
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: "var(--mui-palette-text-secondary)" },
        },
      },
      yaxis: {
        max: 100,
        min: 0,
        labels: {
          style: { colors: "var(--mui-palette-text-secondary)" },
          formatter: (val: number) => `${val}%`,
        },
      },
      colors: [
        "var(--mui-palette-success-main)",
        "var(--mui-palette-warning-main)",
        "var(--mui-palette-error-main)",
      ],
      grid: {
        borderColor: "var(--mui-palette-divider)",
        strokeDashArray: 3,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val: number, opts: any) => {
            const index = opts.dataPointIndex;
            return `${correct[index]}/${total[index]} (${val.toFixed(1)}%)`;
          },
        },
      },
    } as ApexCharts.ApexOptions;
  }, [data]);

  const difficultySeries = useMemo(() => {
    if (
      !data?.performance_by_difficulty ||
      data.performance_by_difficulty.length === 0
    ) {
      return [];
    }

    const percentages = data.performance_by_difficulty.map(
      (d) => (d.correct / d.total) * 100
    );

    return [
      {
        name: t("quiz.statistics.accuracy") || "Accuracy %",
        data: percentages,
      },
    ];
  }, [data, t]);

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={360}
      >
        <LinearProgress sx={{ width: 240, borderRadius: 2 }} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Card
          sx={{
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.95) 100%)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 3,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(255,107,107,0.3)",
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                  "50%": {
                    transform: "scale(1.05)",
                    opacity: 0.9,
                  },
                },
              }}
            >
              <i
                className="tabler-alert-circle"
                style={{
                  fontSize: "64px",
                  color: "white",
                }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mb: 2,
                fontSize: { xs: "1.5rem", sm: "1.75rem" },
                color: "text.primary",
              }}
            >
              {t("quiz.statistics.errorTitle") || "Oops! Something went wrong"}
            </Typography>

            {/* Message */}
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: "text.secondary",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                lineHeight: 1.7,
              }}
            >
              {t("quiz.statistics.errorMessage") ||
                "We couldn't load your performance data right now. Don't worry, this happens sometimes!"}
            </Typography>

            {/* Suggestion */}
            <Box
              sx={{
                mb: 4,
                p: 2,
                borderRadius: "12px",
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                border: "1px solid rgba(255, 193, 7, 0.2)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <i
                  className="tabler-info-circle"
                  style={{ fontSize: "18px" }}
                />
                {t("quiz.statistics.errorSuggestion") ||
                  "Try refreshing the page or check your internet connection."}
              </Typography>
            </Box>

            {/* Retry Button */}
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setRetryCount((prev) => prev + 1);
                fetchPerformanceData();
              }}
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                background:
                  "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-secondary-main) 100%)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
              startIcon={
                loading ? (
                  <Box
                    component="span"
                    sx={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      "@keyframes spin": {
                        to: { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                ) : (
                  <i
                    className="tabler-refresh"
                    style={{ fontSize: "20px" }}
                  />
                )
              }
            >
              {loading
                ? t("common.loading") || "Loading..."
                : t("quiz.statistics.retryButton") || "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const overall = Math.min(Math.max(data.overall_average_score || 0, 0), 100);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          borderRadius: "20px",
          color: "white",
          background:
            "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-secondary-main) 100%)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Grid
            container
            spacing={3}
            alignItems="center"
          >
            <Grid
              item
              xs={12}
              md={8}
            >
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
              >
                {t("quiz.statistics.title") || "لوحة أداء الاختبارات"}
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.95, mt: 1 }}
              >
                {t("quiz.statistics.subtitle") ||
                  "تتبع تقدمك ونقاط قوتك والمناطق التي تحتاج إلى تحسين."}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`${t("quiz.statistics.totalQuizzes") || "إجمالي الاختبارات"}: ${
                    data.total_quizzes_taken
                  }`}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                />
                <Chip
                  label={`${t("quiz.statistics.average") || "المتوسط"}: ${overall.toFixed(1)}%`}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              display="flex"
              justifyContent="center"
            >
              <ApexChart
                type="radialBar"
                height={240}
                series={[overall]}
                options={{
                  chart: { sparkline: { enabled: true } },
                  plotOptions: {
                    radialBar: {
                      hollow: { size: "58%" },
                      dataLabels: {
                        name: { show: false },
                        value: {
                          fontSize: "34px",
                          fontWeight: 800,
                          offsetY: 6,
                          formatter: (val: number) => `${val.toFixed(0)}%`,
                        },
                      },
                    },
                  },
                  colors: ["#fff"],
                  fill: {
                    type: "gradient",
                    gradient: {
                      shade: "light",
                      type: "vertical",
                      gradientToColors: ["#f1f1f1"],
                      stops: [0, 100],
                    },
                  },
                  stroke: { lineCap: "round" },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <Grid
        container
        spacing={3}
      >
        {/* Subject Performance Bar */}
        <Grid
          item
          xs={12}
          md={7}
        >
          <Card sx={{ borderRadius: "16px", height: "100%" }}>
            <CardHeader
              title={
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {t("quiz.statistics.bySubject") || "الأداء حسب المادة"}
                </Typography>
              }
              subheader={
                t("quiz.statistics.bySubjectDesc") || "متوسط الدرجات عبر المواد"
              }
            />
            <CardContent>
              {data.performance_by_subject &&
              data.performance_by_subject.length > 0 ? (
                <>
                  <ApexChart
                    type="bar"
                    height={320}
                    series={subjectBarSeries as any}
                    options={subjectBarOptions}
                  />
                  <Divider sx={{ my: 2 }} />
                  <Box
                    display="flex"
                    gap={2}
                    flexWrap="wrap"
                  >
                    {data.performance_by_subject.map((s) => (
                      <Chip
                        key={s.subject}
                        label={`${s.subject_name_ar || s.subject} • ${s.quizzes_taken} ${t("quiz.statistics.quizzes") || "اختبار"}`}
                        variant="outlined"
                        sx={{ borderRadius: "10px" }}
                      />
                    ))}
                  </Box>
                </>
              ) : (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  {t("common.noData") || "لا توجد بيانات"}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Over Time */}
        <Grid
          item
          xs={12}
          md={5}
        >
          <Card sx={{ borderRadius: "16px", height: "100%" }}>
            <CardHeader
              title={
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  {t("quiz.statistics.overTime") || "الأداء عبر الزمن"}
                </Typography>
              }
              subheader={
                t("quiz.statistics.overTimeDesc") ||
                "تطور درجاتك عبر الاختبارات الأخيرة"
              }
            />
            <CardContent>
              {data.performance_over_time &&
              data.performance_over_time.length > 0 ? (
                <ApexChart
                  type="line"
                  height={320}
                  series={timeSeries as any}
                  options={timeSeriesOptions}
                />
              ) : (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  {t("common.noData") || "لا توجد بيانات"}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance by Difficulty */}
      {data.performance_by_difficulty &&
        data.performance_by_difficulty.length > 0 && (
          <Grid
            container
            spacing={3}
            sx={{ mt: 1 }}
          >
            <Grid
              item
              xs={12}
            >
              <Card sx={{ borderRadius: "16px" }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      {t("quiz.statistics.byDifficulty") ||
                        "الأداء حسب الصعوبة"}
                    </Typography>
                  }
                  subheader={
                    t("quiz.statistics.byDifficultyDesc") ||
                    "دقة الإجابات حسب مستوى الصعوبة"
                  }
                />
                <CardContent>
                  <ApexChart
                    type="bar"
                    height={300}
                    series={difficultySeries as any}
                    options={difficultyOptions as any}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

      {/* Strengths and Weaknesses */}
      <Grid
        container
        spacing={3}
        sx={{ mt: 1 }}
      >
        {/* Top Strengths */}
        <Grid
          item
          xs={12}
          md={6}
        >
          <Card sx={{ borderRadius: "16px" }}>
            <CardHeader
              title={
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="success.main"
                >
                  {t("quiz.statistics.topStrengths") || "نقاط القوة"}
                </Typography>
              }
              subheader={
                t("quiz.statistics.topStrengthsDesc") ||
                "الدروس والمفاهيم التي تتقنها"
              }
            />
            <CardContent>
              {!data.top_strength_by_subject ||
              data.top_strength_by_subject.length === 0 ? (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  {t("common.noData") || "لا توجد بيانات"}
                </Typography>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                >
                  {data.top_strength_by_subject.map((subject) => {
                    const subjectKey = `strength-${subject.subject_id}`;
                    return (
                      <Accordion
                        key={subject.subject_id}
                        expanded={expandedSubjects[subjectKey] || false}
                        onChange={() => handleSubjectToggle(subjectKey)}
                        sx={{
                          boxShadow: "none",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                          "&:before": { display: "none" },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<i className="tabler-chevron-down" />}
                          sx={{
                            backgroundColor: "success.lighter",
                            borderRadius: "8px",
                            "&.Mui-expanded": {
                              borderBottomLeftRadius: 0,
                              borderBottomRightRadius: 0,
                            },
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                            pr={2}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                            >
                              {subject.subject_name_ar}
                            </Typography>
                            <Chip
                              label={`${subject.lessons.length} ${t("quiz.statistics.lessons") || "درس"}`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                          >
                            {subject.lessons.map((lesson) => {
                              const lessonKey = `strength-${lesson.lesson_id}`;
                              return (
                                <Box key={lesson.lesson_id}>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1}
                                    sx={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleLessonToggle(lessonKey)
                                    }
                                  >
                                    <Box>
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight={600}
                                      >
                                        {lesson.lesson_title}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {lesson.lesson_total_questions}{" "}
                                        {t("quiz.statistics.questions") ||
                                          "سؤال"}
                                      </Typography>
                                    </Box>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                        color="success.main"
                                      >
                                        {lesson.overall_accuracy.toFixed(0)}%
                                      </Typography>
                                      <i
                                        className={`tabler-chevron-${expandedLessons[lessonKey] ? "up" : "down"}`}
                                        style={{ fontSize: "16px" }}
                                      />
                                    </Box>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(
                                      Math.max(lesson.overall_accuracy, 0),
                                      100
                                    )}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      mb: 1,
                                      "& .MuiLinearProgress-bar": {
                                        background:
                                          "linear-gradient(90deg, var(--mui-palette-success-main), var(--mui-palette-primary-main))",
                                      },
                                    }}
                                  />
                                  <Collapse
                                    in={expandedLessons[lessonKey] || false}
                                  >
                                    <Box
                                      pl={2}
                                      pt={1}
                                    >
                                      {lesson.concepts.map((concept, idx) => (
                                        <Box
                                          key={idx}
                                          mb={1.5}
                                        >
                                          <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            mb={0.5}
                                          >
                                            <Typography
                                              variant="body2"
                                              fontWeight={500}
                                            >
                                              {concept.concept_name}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              fontWeight={600}
                                              color="success.main"
                                            >
                                              {concept.accuracy.toFixed(0)}%
                                            </Typography>
                                          </Box>
                                          <LinearProgress
                                            variant="determinate"
                                            value={Math.min(
                                              Math.max(concept.accuracy, 0),
                                              100
                                            )}
                                            sx={{
                                              height: 6,
                                              borderRadius: 3,
                                              "& .MuiLinearProgress-bar": {
                                                backgroundColor: "success.main",
                                              },
                                            }}
                                          />
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            mt={0.5}
                                            display="block"
                                          >
                                            {concept.correct}/{concept.total}{" "}
                                            {t("quiz.statistics.correct") ||
                                              "صحيح"}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Collapse>
                                </Box>
                              );
                            })}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Weaknesses */}
        <Grid
          item
          xs={12}
          md={6}
        >
          <Card sx={{ borderRadius: "16px" }}>
            <CardHeader
              title={
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="error.main"
                >
                  {t("quiz.statistics.topWeaknesses") || "نقاط الضعف"}
                </Typography>
              }
              subheader={
                t("quiz.statistics.topWeaknessesDesc") ||
                "الدروس والمفاهيم التي تحتاج إلى تحسين"
              }
            />
            <CardContent>
              {!data.top_weakness_by_subject ||
              data.top_weakness_by_subject.length === 0 ? (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  {"لا توجد بيانات"}
                </Typography>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                >
                  {data.top_weakness_by_subject.map((subject) => {
                    const subjectKey = `weakness-${subject.subject_id}`;
                    return (
                      <Accordion
                        key={subject.subject_id}
                        expanded={expandedSubjects[subjectKey] || false}
                        onChange={() => handleSubjectToggle(subjectKey)}
                        sx={{
                          boxShadow: "none",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                          "&:before": { display: "none" },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<i className="tabler-chevron-down" />}
                          sx={{
                            backgroundColor: "error.lighter",
                            borderRadius: "8px",
                            "&.Mui-expanded": {
                              borderBottomLeftRadius: 0,
                              borderBottomRightRadius: 0,
                            },
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                            pr={2}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                            >
                              {subject.subject_name_ar}
                            </Typography>
                            <Chip
                              label={`${subject.lessons.length} ${t("quiz.statistics.lessons") || "درس"}`}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                          >
                            {subject.lessons.map((lesson) => {
                              const lessonKey = `weakness-${lesson.lesson_id}`;
                              return (
                                <Box key={lesson.lesson_id}>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1}
                                    sx={{ cursor: "pointer" }}
                                    onClick={() =>
                                      handleLessonToggle(lessonKey)
                                    }
                                  >
                                    <Box>
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight={600}
                                      >
                                        {lesson.lesson_title}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {lesson.lesson_total_questions}{" "}
                                        {t("quiz.statistics.questions") ||
                                          "سؤال"}
                                      </Typography>
                                    </Box>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                        color="error.main"
                                      >
                                        {lesson.overall_accuracy.toFixed(0)}%
                                      </Typography>
                                      <i
                                        className={`tabler-chevron-${expandedLessons[lessonKey] ? "up" : "down"}`}
                                        style={{ fontSize: "16px" }}
                                      />
                                    </Box>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(
                                      Math.max(lesson.overall_accuracy, 0),
                                      100
                                    )}
                                    color={
                                      lesson.overall_accuracy >= 50
                                        ? "warning"
                                        : "error"
                                    }
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      mb: 1,
                                      "& .MuiLinearProgress-bar": {
                                        background:
                                          "linear-gradient(90deg, var(--mui-palette-warning-main), var(--mui-palette-error-main))",
                                      },
                                    }}
                                  />
                                  <Collapse
                                    in={expandedLessons[lessonKey] || false}
                                  >
                                    <Box
                                      pl={2}
                                      pt={1}
                                    >
                                      {lesson.concepts.map((concept, idx) => (
                                        <Box
                                          key={idx}
                                          mb={1.5}
                                        >
                                          <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            mb={0.5}
                                          >
                                            <Typography
                                              variant="body2"
                                              fontWeight={500}
                                            >
                                              {concept.concept_name}
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              fontWeight={600}
                                              color="error.main"
                                            >
                                              {concept.accuracy.toFixed(0)}%
                                            </Typography>
                                          </Box>
                                          <LinearProgress
                                            variant="determinate"
                                            value={Math.min(
                                              Math.max(concept.accuracy, 0),
                                              100
                                            )}
                                            color={
                                              concept.accuracy >= 50
                                                ? "warning"
                                                : "error"
                                            }
                                            sx={{
                                              height: 6,
                                              borderRadius: 3,
                                            }}
                                          />
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            mt={0.5}
                                            display="block"
                                          >
                                            {concept.correct}/{concept.total}{" "}
                                            {t("quiz.statistics.correct") ||
                                              "صحيح"}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Collapse>
                                </Box>
                              );
                            })}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box
        display="flex"
        gap={2}
        justifyContent="center"
        sx={{ mt: 4 }}
        flexWrap="wrap"
      >
        <Button
          variant="contained"
          onClick={() => router.push(`/${locale}/apps/quiz/add`)}
          sx={{ borderRadius: "12px", px: 4, py: 1.5 }}
          startIcon={<i className="tabler-plus" />}
        >
          {t("quiz.statistics.newQuiz") || "إنشاء اختبار جديد"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push(`/${locale}/apps/quiz/history`)}
          sx={{ borderRadius: "12px", px: 4, py: 1.5 }}
          startIcon={<i className="tabler-history" />}
        >
          {t("quiz.statistics.viewHistory") || "عرض السجل"}
        </Button>
      </Box>
    </Box>
  );
};

export default QuizStatistics;

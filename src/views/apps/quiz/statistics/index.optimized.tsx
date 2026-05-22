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
import Button from "@mui/material/Button";

// Charts
import ApexChart from "@/libs/ApexCharts";

// Hooks
import { useTranslation } from "@/hooks/useTranslation";
import { useParams, useRouter } from "next/navigation";
import { QuizService } from "@/services/quiz";
import { toast } from "react-toastify";

// Components
import SubjectAccordion from "./components/SubjectAccordion";
import ErrorState from "./components/ErrorState";

// Types
import type { UserPerformanceDashboard } from "./types";

// Utils
import {
  processPerformanceOverTime,
  getCommonChartOptions,
  getPercentageFormatter,
} from "./utils/chartHelpers";

const QuizStatistics: React.FC = () => {
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
        //@ts-ignore
        setData(response as UserPerformanceDashboard);
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

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  // Optimized: Process performance over time data once
  const processedTimeData = useMemo(
    () => processPerformanceOverTime(data?.performance_over_time),
    [data?.performance_over_time]
  );

  // Chart Options - Optimized with shared processing
  const subjectBarOptions = useMemo(() => {
    const categories =
      data?.performance_by_subject?.map(
        (s) => s.subject_name_ar || s.subject
      ) || [];
    const scores =
      data?.performance_by_subject?.map((s) => s.average_score) || [];

    return {
      ...getCommonChartOptions(),
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
        formatter: getPercentageFormatter(),
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
          formatter: getPercentageFormatter(),
        },
      },
      colors: [
        "var(--mui-palette-primary-main)",
        "var(--mui-palette-info-main)",
        "var(--mui-palette-success-main)",
        "var(--mui-palette-warning-main)",
        "var(--mui-palette-error-main)",
      ],
      tooltip: {
        ...getCommonChartOptions().tooltip,
        y: {
          formatter: getPercentageFormatter(),
        },
      },
    } as ApexCharts.ApexOptions;
  }, [data?.performance_by_subject]);

  const subjectBarSeries = useMemo(() => {
    const scores =
      data?.performance_by_subject?.map((s) => s.average_score) || [];
    return [
      {
        name: t("quiz.statistics.averageScoreSeries") || "Average Score",
        data: scores,
      },
    ];
  }, [data?.performance_by_subject, t]);

  const timeSeriesOptions = useMemo(() => {
    return {
      ...getCommonChartOptions(),
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
        categories: processedTimeData.dates,
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
          formatter: getPercentageFormatter(),
        },
      },
      tooltip: {
        ...getCommonChartOptions().tooltip,
        y: {
          formatter: getPercentageFormatter(),
        },
      },
    } as ApexCharts.ApexOptions;
  }, [processedTimeData.dates]);

  const timeSeries = useMemo(() => {
    if (processedTimeData.values.length === 0) {
      return [
        { name: t("quiz.statistics.scoreSeries") || "Score %", data: [] },
      ];
    }

    return [
      {
        name: t("quiz.statistics.scoreSeries") || "Score %",
        data: processedTimeData.values,
      },
    ];
  }, [processedTimeData.values, t]);

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
      ...getCommonChartOptions(),
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
          formatter: getPercentageFormatter(),
        },
      },
      colors: [
        "var(--mui-palette-success-main)",
        "var(--mui-palette-warning-main)",
        "var(--mui-palette-error-main)",
      ],
      tooltip: {
        ...getCommonChartOptions().tooltip,
        y: {
          formatter: (val: number, opts: any) => {
            const index = opts.dataPointIndex;
            return `${correct[index]}/${total[index]} (${val.toFixed(1)}%)`;
          },
        },
      },
    } as ApexCharts.ApexOptions;
  }, [data?.performance_by_difficulty]);

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
  }, [data?.performance_by_difficulty, t]);

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
      <ErrorState
        onRetry={handleRetry}
        loading={loading}
        t={t}
      />
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
              {processedTimeData.values.length > 0 ? (
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
                      <SubjectAccordion
                        key={subject.subject_id}
                        subject={subject}
                        subjectKey={subjectKey}
                        isExpanded={expandedSubjects[subjectKey] || false}
                        onToggle={handleSubjectToggle}
                        expandedLessons={expandedLessons}
                        onLessonToggle={handleLessonToggle}
                        variant="strength"
                        t={t}
                      />
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
                  {t("common.noData") || "لا توجد بيانات"}
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
                      <SubjectAccordion
                        key={subject.subject_id}
                        subject={subject}
                        subjectKey={subjectKey}
                        isExpanded={expandedSubjects[subjectKey] || false}
                        onToggle={handleSubjectToggle}
                        expandedLessons={expandedLessons}
                        onLessonToggle={handleLessonToggle}
                        variant="weakness"
                        t={t}
                      />
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

import type { PerformanceOverTime, PerformanceByDifficulty } from "../types";

export const formatDate = (iso: string): string => {
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

export const processPerformanceOverTime = (
  data: PerformanceOverTime[] | undefined
): { dates: string[]; values: number[] } => {
  if (!data || data.length === 0) {
    return { dates: [], values: [] };
  }

  const validData = data
    .filter(
      (p) => p.date && p.percentage !== undefined && p.percentage !== null
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });

  const dates = validData.map((p) => formatDate(p.date));
  const values = validData.map((p) => {
    const percentage =
      typeof p.percentage === "number" ? p.percentage : Number(p.percentage) || 0;
    return Math.min(Math.max(percentage, 0), 100);
  });

  return { dates, values };
};

// Memoized common chart options - stable reference
const COMMON_CHART_OPTIONS: Partial<ApexCharts.ApexOptions> = {
  chart: {
    toolbar: { show: false },
    sparkline: { enabled: false },
  },
  grid: {
    borderColor: "var(--mui-palette-divider)",
    strokeDashArray: 3,
  },
  tooltip: {
    theme: "dark",
  },
};

export const getCommonChartOptions = (): Partial<ApexCharts.ApexOptions> =>
  COMMON_CHART_OPTIONS;

// Memoized percentage formatter - stable reference
const percentageFormatter = (val: number) => `${val.toFixed(1)}%`;

export const getPercentageFormatter = () => percentageFormatter;


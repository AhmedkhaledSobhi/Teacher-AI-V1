"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material";
import {
  IconArrowLeft,
  IconCircleCheckFilled,
  IconClock,
  IconBookmark,
  IconAward,
} from "@tabler/icons-react";
import { useTranslation } from "@/hooks/useTranslation";

interface QuizStartViewProps {
  quiz: any;
  onBegin: () => void;
  onBack: () => void;
}

export default function QuizStartView({
  quiz,
  onBegin,
  onBack,
}: QuizStartViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const progressSteps = [
    { label: t("quiz.ui.quizDetails"), completed: true },
    { label: t("quiz.ui.instructions"), completed: true },
    { label: t("quiz.ui.startNow"), completed: false },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Progress Indicator */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {progressSteps.map((step, idx) => (
            <Box
              key={idx}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  backgroundColor: step.completed
                    ? "primary.main"
                    : "action.hover",
                  color: step.completed ? "white" : "text.secondary",
                }}
              >
                {step.completed ? "✓" : idx + 1}
              </Box>
              {idx < progressSteps.length - 1 && (
                <Box
                  sx={{
                    width: 40,
                    height: 2,
                    backgroundColor: step.completed
                      ? "primary.main"
                      : "divider",
                    mx: 1,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary" }}
        >
          {t("quiz.ui.stepOf", { current: 3, total: 3 } as any)}
        </Typography>
      </Box>

      {/* Back Button */}
      <Button
        startIcon={<IconArrowLeft size={20} />}
        onClick={onBack}
        sx={{ mb: 3 }}
        variant="text"
      >
        {t("quiz.ui.cancel")}
      </Button>

      <Grid
        container
        spacing={3}
      >
        {/* Quiz Info */}
        <Grid
          item
          xs={12}
          md={8}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 3 }}
              >
                {t("quiz.ui.quizProgress")}
              </Typography>

              {/* Quiz Details */}
              <Box
                sx={{
                  backgroundColor: "action.hover",
                  p: 3,
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
                >
                  {quiz?.title || "اختبار جديد"}
                </Typography>
                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={6}
                    sm={4}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        عدد الأسئلة
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600 }}
                      >
                        15
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sm={4}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        المدة الزمنية
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600 }}
                      >
                        30 دقيقة
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sm={4}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        الدرجة الكاملة
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600 }}
                      >
                        100
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Instructions */}
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                تعليمات الاختبار
              </Typography>
              <List sx={{ mb: 3 }}>
                <ListItem
                  disableGutters
                  sx={{ pb: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <IconCircleCheckFilled
                      size={20}
                      style={{ color: theme.palette.primary.main }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="اقرأ كل سؤال بعناية قبل الإجابة"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
                <ListItem
                  disableGutters
                  sx={{ pb: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <IconCircleCheckFilled
                      size={20}
                      style={{ color: theme.palette.primary.main }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="يمكنك الرجوع إلى الأسئلة السابقة في أي وقت"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
                <ListItem
                  disableGutters
                  sx={{ pb: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <IconCircleCheckFilled
                      size={20}
                      style={{ color: theme.palette.primary.main }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="الوقت محدود، تابع الوقت المتبقي أعلى الشاشة"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
                <ListItem
                  disableGutters
                  sx={{ pb: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <IconCircleCheckFilled
                      size={20}
                      style={{ color: theme.palette.primary.main }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="ستحصل على النتائج مباشرة بعد انتهائك"
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              </List>

              {/* Start Button */}
              <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={onBegin}
                  fullWidth
                  sx={{
                    py: 2,
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  ابدأ الاختبار الآن
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Info */}
        <Grid
          item
          xs={12}
          md={4}
        >
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                معلومات الاختبار
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  المادة
                </Typography>
                <Chip
                  label={quiz?.subject || "عام"}
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  مستوى الصعوبة
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label="متوسط"
                    sx={{
                      backgroundColor: "#FF9F43",
                      color: "white",
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mb: 1 }}
                >
                  توزيع الأسئلة
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {[
                    { label: "اختيار من متعدد", count: 8 },
                    { label: "إجابة صحيحة/خاطئة", count: 4 },
                    { label: "ملء الفراغات", count: 3 },
                  ].map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ flex: 1 }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600 }}
                      >
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Paper
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.info.main,
                  color: "white",
                }}
              >
                <Typography variant="caption">💡 نصيحة</Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1 }}
                >
                  خذ وقتك في قراءة الأسئلة والتركيز على الإجابات بدقة
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

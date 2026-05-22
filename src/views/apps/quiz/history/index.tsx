"use client";

// React Imports
import React, { useState, useEffect } from "react";

// MUI Imports
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

// Third-party Imports
import { toast } from "react-toastify";

// Components Imports
import QuizHistoryTable from "@/components/quiz/QuizHistoryTable";
// Hooks
import { useTranslation } from "@/hooks/useTranslation";
import { useUser } from "@/hooks/useUser";

// Services
import { QuizService } from "@/services/quiz";

// Types
import type { QuizHistoryItem } from "@/types/quiz";

// Icons
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconDownload,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconShare,
  IconDotsVertical,
  IconCalendar,
  IconBook,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";

const QuizHistoryPage: React.FC = () => {
  // Hooks
  const { t, isRTL } = useTranslation();
  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;

  // States
  const [quizzes, setQuizzes] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [refreshLoading, setRefreshLoading] = useState(false);
  const router = useRouter();
  const { lang: locale } = useParams<{ lang: string }>();
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>();

  // Menu states
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [actionMenuQuizId, setActionMenuQuizId] = useState<string | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
  });

  // Fetch quizzes data
  const fetchQuizzes = async (showRefreshLoading = false) => {
    if (showRefreshLoading) {
      setRefreshLoading(true);
    } else {
      setLoading(true);
    }
    setError(undefined);

    try {
      const userId = session?.user?.id || "";

      const response = await QuizService.getUserQuizzes(userId);

      if (response.operation_status === "success") {
        setQuizzes(response.quizes);
        calculateStats(response.quizes);
      } else {
        setError(response.message || t("quiz.history.fetchError"));
        toast.error(response.message || t("quiz.history.fetchError"));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("quiz.history.fetchError");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (quizData: QuizHistoryItem[]) => {
    const stats = {
      total: quizData.length,
      active: quizData.filter((q) => q.status === "active").length,
      completed: quizData.filter((q) => q.status === "completed").length,
      draft: quizData.filter((q) => q.status === "draft").length,
    };
    setStats(stats);
  };

  // Filter quizzes based on search and filters
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.quiz_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject_name_ar.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || quiz.status === statusFilter;
    const matchesType = typeFilter === "all" || quiz.quiz_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Event handlers
  const handleRefresh = () => {
    fetchQuizzes(true);
  };

  const handleViewQuiz = (quizId: string) => {
    toast.info(`${t("quiz.history.actions.view")}: ${quizId}`);
    // Navigate to quiz view page
  };

  const handleEditQuiz = (quizId: string) => {
    toast.info(`${t("quiz.history.actions.edit")}: ${quizId}`);
    // Navigate to quiz edit page
  };

  const handleDownloadQuiz = (quizId: string) => {
    toast.success(`${t("quiz.history.actions.download")}: ${quizId}`);
    // Implement download logic
  };

  const handleShareQuiz = (quizId: string) => {
    toast.success(`${t("quiz.history.actions.share")}: ${quizId}`);
    // Implement share logic
  };

  const handleDeleteQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!selectedQuizId) return;

    try {
      // Implement delete logic here
      toast.success(`${t("quiz.history.actions.delete")}: ${selectedQuizId}`);

      // Remove from local state
      setQuizzes((prev) => prev.filter((q) => q.quiz_id !== selectedQuizId));
      calculateStats(quizzes.filter((q) => q.quiz_id !== selectedQuizId));
    } catch (error) {
      toast.error(t("quiz.history.actions.deleteError"));
    } finally {
      setDeleteDialogOpen(false);
      setSelectedQuizId(undefined);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (session?.user) {
      fetchQuizzes();
    }
  }, [session]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={{ xs: 2, sm: 0 }}
            sx={{ mb: 3 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {t("quiz.history.pageTitle")}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {t("quiz.history.pageDescription")}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <Button
                variant="outlined"
                startIcon={<IconRefresh />}
                onClick={handleRefresh}
                disabled={refreshLoading}
                fullWidth={true}
                sx={{
                  borderRadius: "12px",
                  px: { xs: 2, sm: 3 },
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                {refreshLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  t("quiz.history.refresh")
                )}
              </Button>
              <Button
                variant="contained"
                startIcon={<IconPlus />}
                onClick={() => router.push(`/${locale}/apps/quiz/add`)}
                fullWidth={true}
                sx={{
                  borderRadius: "12px",
                  px: { xs: 2, sm: 3 },
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                {t("quiz.history.createNew")}
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Statistics Cards */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card
                sx={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)",
                  border: "1px solid rgba(25, 118, 210, 0.2)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        backgroundColor: "primary.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "primary.main",
                      }}
                    >
                      <IconBook size={24} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("quiz.history.stats.totalQuizzes")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Card
                sx={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        backgroundColor: "success.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "success.main",
                      }}
                    >
                      <IconTrendingUp size={24} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 600, color: "success.main" }}
                      >
                        {stats.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("quiz.history.stats.activeQuizzes")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Card
                sx={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        backgroundColor: "info.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "info.main",
                      }}
                    >
                      <IconCalendar size={24} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 600, color: "info.main" }}
                      >
                        {stats.completed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("quiz.history.stats.completedQuizzes")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <Card
                sx={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)",
                  border: "1px solid rgba(255, 152, 0, 0.2)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        backgroundColor: "warning.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "warning.main",
                      }}
                    >
                      <IconUsers size={24} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 600, color: "warning.main" }}
                      >
                        {stats.draft}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("quiz.history.stats.draftQuizzes")}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Quiz History Table */}
        <Grid size={{ xs: 12, sm: 12 }}>
          <QuizHistoryTable
            quizzes={filteredQuizzes}
            loading={loading}
            error={error}
            onViewQuiz={handleViewQuiz}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onDownloadQuiz={handleDownloadQuiz}
            onShareQuiz={handleShareQuiz}
          />
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <IconTrash size={24} className="text-error" />
            {t("quiz.history.deleteDialog.title")}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {`${t("quiz.history.deleteDialog.message").replace("{quizId}", selectedQuizId || "")}`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            {t("quiz.history.deleteDialog.cancel")}
          </Button>
          <Button
            onClick={confirmDeleteQuiz}
            variant="contained"
            color="error"
            sx={{ borderRadius: "8px" }}
          >
            {t("quiz.history.deleteDialog.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizHistoryPage;

"use client";

// React Imports
import React, { useMemo, useCallback } from "react";

// MUI Imports
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Alert,
} from "@mui/material";

// Third-party Imports
import { format } from "date-fns";

// Components Imports
import CustomTextField from "@core/components/mui/TextField";

// Hooks
import { useTranslation } from "@/hooks/useTranslation";

// Types
import type { QuizHistoryItem } from "@/types/quiz";

// Icons
import {
  IconEye,
  IconDownload,
  IconShare,
  IconTrash,
  IconEdit,
  IconClock,
  IconCheck,
  IconX,
  IconBook,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react";

interface QuizHistoryTableProps {
  quizzes: QuizHistoryItem[];
  loading?: boolean;
  error?: string;
  onViewQuiz?: (quizId: string) => void;
  onEditQuiz?: (quizId: string) => void;
  onDeleteQuiz?: (quizId: string) => void;
  onDownloadQuiz?: (quizId: string) => void;
  onShareQuiz?: (quizId: string) => void;
}

const QuizHistoryTable: React.FC<QuizHistoryTableProps> = React.memo(
  ({
    quizzes,
    loading = false,
    error,
    onViewQuiz,
    onEditQuiz,
    onDeleteQuiz,
    onDownloadQuiz,
    onShareQuiz,
  }) => {
    const { t, isRTL } = useTranslation();

    // Status configuration
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "active":
          return {
            color: "success" as const,
            icon: <IconCheck size={16} />,
            label: t("quiz.status.active"),
          };
        case "completed":
          return {
            color: "primary" as const,
            icon: <IconCheck size={16} />,
            label: t("quiz.status.completed"),
          };
        case "draft":
          return {
            color: "warning" as const,
            icon: <IconEdit size={16} />,
            label: t("quiz.status.draft"),
          };
        case "archived":
          return {
            color: "default" as const,
            icon: <IconX size={16} />,
            label: t("quiz.status.archived"),
          };
        default:
          return {
            color: "default" as const,
            icon: <IconClock size={16} />,
            label: status,
          };
      }
    };

    // Quiz type configuration
    const getQuizTypeConfig = (quizType: string) => {
      switch (quizType) {
        case "text":
          return {
            color: "primary" as const,
            icon: <IconBook size={16} />,
            label: t("quiz.types.text"),
          };
        case "image":
          return {
            color: "secondary" as const,
            icon: <IconBook size={16} />,
            label: t("quiz.types.image"),
          };
        case "audio":
          return {
            color: "info" as const,
            icon: <IconBook size={16} />,
            label: t("quiz.types.audio"),
          };
        case "video":
          return {
            color: "warning" as const,
            icon: <IconBook size={16} />,
            label: t("quiz.types.video"),
          };
        default:
          return {
            color: "default" as const,
            icon: <IconBook size={16} />,
            label: quizType,
          };
      }
    };

    // Format date
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return format(date, "MMM dd, yyyy HH:mm");
      } catch {
        return dateString;
      }
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
      <>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton variant="text" width="100%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="80%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="rectangular" width={60} height={24} />
            </TableCell>
            <TableCell>
              <Skeleton variant="rectangular" width={80} height={24} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="60%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="70%" />
            </TableCell>
            <TableCell>
              <Box display="flex" gap={1}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </>
    );

    if (error) {
      return (
        <Card>
          <CardContent>
            <Alert severity="error" icon={<IconX size={20} />}>
              {error}
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <IconBook className="text-white text-xl" />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {t("quiz.history.title")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {t("quiz.history.subtitle")}
                </Typography>
              </Box>
            </Box>
          }
          sx={{
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)",
          }}
        />

        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.02)",
                    "& .MuiTableCell-head": {
                      fontWeight: 600,
                      color: "text.primary",
                      borderBottom: "2px solid",
                      borderColor: "divider",
                    },
                  }}
                >
                  <TableCell>{t("quiz.history.table.quizId")}</TableCell>
                  <TableCell>{t("quiz.history.table.subject")}</TableCell>
                  <TableCell align="center">
                    {t("quiz.history.table.totalScore")}
                  </TableCell>
                  <TableCell align="center">
                    {t("quiz.history.table.status")}
                  </TableCell>
                  <TableCell>{t("quiz.history.table.lessons")}</TableCell>
                  <TableCell>
                    {t("quiz.history.table.selected_unit_ids")}
                  </TableCell>
                  <TableCell>{t("quiz.history.table.createdAt")}</TableCell>
                  {/* <TableCell align="center">
                  {t("quiz.history.table.actions")}
                </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <LoadingSkeleton />
                ) : quizzes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                      >
                        <IconBook size={48} className="text-muted-foreground" />
                        <Typography variant="h6" color="text.secondary">
                          {t("quiz.history.noQuizzes")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("quiz.history.noQuizzesDesc")}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  quizzes.map((quiz, index) => {
                    const statusConfig = getStatusConfig(quiz.status);
                    const typeConfig = getQuizTypeConfig(quiz.quiz_type);

                    return (
                      <TableRow
                        key={quiz.quiz_id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.02)",
                          },
                          "& .MuiTableCell-root": {
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: "primary.light",
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              <IconBook size={16} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: "text.primary" }}
                              >
                                {index + 1}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                الصف الدراسي : {quiz.grade_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "text.primary" }}
                            >
                              {isRTL
                                ? quiz.subject_name_ar
                                : quiz.subject_name_en}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              الفصل الدراسي : {quiz.term_id}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            icon={typeConfig.icon}
                            label={quiz.total_score ? quiz.total_score : 0}
                            color={typeConfig.color}
                            variant="outlined"
                            size="small"
                            sx={{
                              borderRadius: "8px",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            color={statusConfig.color}
                            variant="filled"
                            size="small"
                            sx={{
                              borderRadius: "8px",
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>

                        <TableCell width={"200px"}>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {quiz.lessons_names &&
                            quiz.lessons_names.length > 0 ? (
                              <>
                                {quiz.lessons_names
                                  .slice(0, 3)
                                  .map((lessonId) => (
                                    <Chip
                                      key={lessonId}
                                      label={`${lessonId}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderRadius: "6px",
                                        fontSize: "0.7rem",
                                        height: 20,
                                      }}
                                    />
                                  ))}
                                {quiz.lessons_names.length > 3 && (
                                  <Chip
                                    label={`+${quiz.lessons_names.length - 3}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderRadius: "6px",
                                      fontSize: "0.7rem",
                                      height: 20,
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              >
                                لايوجد دروس
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        {/* Units */}
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {quiz.units_names && quiz.units_names.length > 0 ? (
                              quiz.units_names.slice(0, 3).map((unitId) => (
                                <Chip
                                  key={unitId}
                                  label={`U${unitId}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderRadius: "6px",
                                    fontSize: "0.7rem",
                                    height: 20,
                                  }}
                                />
                              ))
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              >
                                لايوجد وحدات
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconCalendar
                              size={16}
                              className="text-muted-foreground"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(quiz.created_at)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title={t("quiz.history.actions.view")}>
                            <IconButton
                              size="small"
                              onClick={() => onViewQuiz?.(quiz.quiz_id)}
                              sx={{
                                backgroundColor: "primary.light",
                                color: "primary.main",
                                "&:hover": {
                                  backgroundColor: "primary.main",
                                  color: "white",
                                },
                              }}
                            >
                              <IconEye size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t("quiz.history.actions.edit")}>
                            <IconButton
                              size="small"
                              onClick={() => onEditQuiz?.(quiz.quiz_id)}
                              sx={{
                                backgroundColor: "warning.light",
                                color: "warning.main",
                                "&:hover": {
                                  backgroundColor: "warning.main",
                                  color: "white",
                                },
                              }}
                            >
                              <IconEdit size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t("quiz.history.actions.download")}>
                            <IconButton
                              size="small"
                              onClick={() => onDownloadQuiz?.(quiz.quiz_id)}
                              sx={{
                                backgroundColor: "info.light",
                                color: "info.main",
                                "&:hover": {
                                  backgroundColor: "info.main",
                                  color: "white",
                                },
                              }}
                            >
                              <IconDownload size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t("quiz.history.actions.share")}>
                            <IconButton
                              size="small"
                              onClick={() => onShareQuiz?.(quiz.quiz_id)}
                              sx={{
                                backgroundColor: "success.light",
                                color: "success.main",
                                "&:hover": {
                                  backgroundColor: "success.main",
                                  color: "white",
                                },
                              }}
                            >
                              <IconShare size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={t("quiz.history.actions.delete")}>
                            <IconButton
                              size="small"
                              onClick={() => onDeleteQuiz?.(quiz.quiz_id)}
                              sx={{
                                backgroundColor: "error.light",
                                color: "error.main",
                                "&:hover": {
                                  backgroundColor: "error.main",
                                  color: "white",
                                },
                              }}
                            >
                              <IconTrash size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell> */}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  }
);

QuizHistoryTable.displayName = "QuizHistoryTable";

export default QuizHistoryTable;

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Collapse,
} from "@mui/material";
import type { SubjectWithLessons } from "../types";

type SubjectAccordionProps = {
  subject: SubjectWithLessons;
  subjectKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  expandedLessons: { [key: string]: boolean };
  onLessonToggle: (key: string) => void;
  variant: "strength" | "weakness";
  t: (key: string, fallback?: string) => string;
};

const SubjectAccordion: React.FC<SubjectAccordionProps> = ({
  subject,
  subjectKey,
  isExpanded,
  onToggle,
  expandedLessons,
  onLessonToggle,
  variant,
  t,
}) => {
  const isStrength = variant === "strength";
  const color = isStrength ? "success" : "error";
  const bgColor = isStrength ? "success.lighter" : "error.lighter";

  return (
    <Accordion
      expanded={isExpanded}
      onChange={() => onToggle(subjectKey)}
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
          backgroundColor: bgColor,
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
          <Typography variant="subtitle1" fontWeight={600}>
            {subject.subject_name_ar}
          </Typography>
          <Chip
            label={`${subject.lessons.length} ${t("quiz.statistics.lessons") || "درس"}`}
            size="small"
            color={color}
            variant="outlined"
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexDirection="column" gap={2}>
          {subject.lessons.map((lesson) => {
            const lessonKey = `${variant}-${lesson.lesson_id}`;
            const isLessonExpanded = expandedLessons[lessonKey] || false;

            return (
              <Box key={lesson.lesson_id}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                  sx={{ cursor: "pointer" }}
                  onClick={() => onLessonToggle(lessonKey)}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {lesson.lesson_title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {lesson.lesson_total_questions}{" "}
                      {t("quiz.statistics.questions") || "سؤال"}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={`${color}.main`}
                    >
                      {lesson.overall_accuracy.toFixed(0)}%
                    </Typography>
                    <i
                      className={`tabler-chevron-${isLessonExpanded ? "up" : "down"}`}
                      style={{ fontSize: "16px" }}
                    />
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(Math.max(lesson.overall_accuracy, 0), 100)}
                  color={
                    !isStrength && lesson.overall_accuracy >= 50
                      ? "warning"
                      : color
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 1,
                    "& .MuiLinearProgress-bar": {
                      background: isStrength
                        ? "linear-gradient(90deg, var(--mui-palette-success-main), var(--mui-palette-primary-main))"
                        : "linear-gradient(90deg, var(--mui-palette-warning-main), var(--mui-palette-error-main))",
                    },
                  }}
                />
                <Collapse in={isLessonExpanded}>
                  <Box pl={2} pt={1}>
                    {lesson.concepts.map((concept, idx) => (
                      <Box key={idx} mb={1.5}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {concept.concept_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={`${color}.main`}
                          >
                            {concept.accuracy.toFixed(0)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(Math.max(concept.accuracy, 0), 100)}
                          color={
                            !isStrength && concept.accuracy >= 50
                              ? "warning"
                              : color
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
                          {t("quiz.statistics.correct") || "صحيح"}
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
};

export default SubjectAccordion;


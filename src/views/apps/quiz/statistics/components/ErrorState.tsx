import React from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";

type ErrorStateProps = {
  onRetry: () => void;
  loading: boolean;
  t: (key: string, fallback?: string) => string;
};

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, loading, t }) => {
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
              <i className="tabler-info-circle" style={{ fontSize: "18px" }} />
              {t("quiz.statistics.errorSuggestion") ||
                "Try refreshing the page or check your internet connection."}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={onRetry}
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
                <i className="tabler-refresh" style={{ fontSize: "20px" }} />
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
};

export default ErrorState;


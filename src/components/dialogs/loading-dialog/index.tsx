"use client";

// React Imports
import React from "react";

// MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import { keyframes } from "@mui/material/styles";

// Third-party Imports
import { useTranslation } from "@/hooks/useTranslation";

type LoadingDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  progress?: number; // 0-100 for progress indication
};

// Animation keyframes
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(120deg);
  }
  66% {
    transform: translateY(5px) rotate(240deg);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const wave = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
`;

const LoadingDialog = ({
  open,
  title,
  message,
  progress,
}: LoadingDialogProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Theme-aware colors
  const bgGradient = isDark
    ? "linear-gradient(135deg, rgba(18, 18, 23, 0.98) 0%, rgba(30, 30, 40, 0.95) 100%)"
    : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 252, 255, 0.95) 100%)";

  const backdropColor = isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)";

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          background: bgGradient,
          backdropFilter: "blur(20px)",
          boxShadow: isDark
            ? "0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            : "0 12px 48px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          position: "relative",
          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background: `linear-gradient(90deg, 
              ${theme.palette.primary.main}, 
              ${theme.palette.secondary.main}, 
              ${theme.palette.success.main}, 
              ${theme.palette.primary.main})`,
            backgroundSize: "300% 100%",
            animation: `${shimmer} 3s linear infinite`,
            zIndex: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
            animation: `${pulse} 3s ease-in-out infinite`,
          },
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: backdropColor,
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 3,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: theme.palette.primary.main,
              top: `${15 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animation: `${sparkle} 2s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              boxShadow: `0 0 8px ${theme.palette.primary.main}`,
            }}
          />
        ))}

        {/* Main Animated Loading Spinner */}
        <Box
          sx={{
            position: "relative",
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          {/* Outer rotating ring with gradient */}
          <CircularProgress
            size={100}
            thickness={4}
            variant="indeterminate"
            sx={{
              position: "absolute",
              color: "primary.main",
              animation: `${rotate} 1.2s linear infinite`,
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />

          {/* Middle ring */}
          <CircularProgress
            size={70}
            thickness={3}
            variant="indeterminate"
            sx={{
              position: "absolute",
              color: "secondary.main",
              animation: `${rotate} 1.5s linear infinite reverse`,
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />

          {/* Inner pulsing circle with gradient */}
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              animation: `${pulse} 1.5s ease-in-out infinite`,
              boxShadow: `0 0 30px ${theme.palette.primary.main}40, 0 4px 20px ${theme.palette.primary.main}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Center icon/emoji */}
            <Box
              component="span"
              sx={{
                fontSize: "24px",
                animation: `${bounce} 1s ease-in-out infinite`,
              }}
            >
              ✨
            </Box>
          </Box>
        </Box>

        {/* Title with gradient */}
        {title && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
              backgroundSize: "200% 200%",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: `${shimmer} 3s ease infinite`,
              mb: 0.5,
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>
        )}

        {/* Message with animated dots */}
        <Box sx={{ position: "relative", minHeight: 48 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: "300px",
              lineHeight: 1.8,
              fontWeight: 500,
            }}
          >
            {message || t("common.loading") || "Please wait..."}
          </Typography>

          {/* Animated typing dots */}
          <Box
            sx={{
              display: "inline-flex",
              gap: 0.5,
              ml: 1,
            }}
          >
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                component="span"
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.primary.main,
                  animation: `${bounce} 1.4s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                  display: "inline-block",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Progress Bar (optional) */}
        {progress !== undefined && (
          <Box
            sx={{
              width: "100%",
              mt: 1,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                position: "relative",
                boxShadow: isDark
                  ? "inset 0 2px 4px rgba(0, 0, 0, 0.3)"
                  : "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box
                sx={{
                  width: `${progress}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
                  backgroundSize: "200% 100%",
                  borderRadius: 4,
                  transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                  animation: `${shimmer} 2s linear infinite`,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: `${shimmer} 1.5s linear infinite`,
                  },
                }}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 1.5,
                display: "block",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {progress}%
            </Typography>
          </Box>
        )}

        {/* Fun animated emoji decorations */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {["🎯", "📚", "🚀"].map((emoji, index) => (
            <Box
              key={index}
              component="span"
              sx={{
                fontSize: "20px",
                animation: `${float} 2s ease-in-out infinite`,
                animationDelay: `${index * 0.4}s`,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              {emoji}
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingDialog;

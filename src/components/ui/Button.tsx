"use client";

import { forwardRef } from "react";
import type { ElementType } from "react";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

interface ButtonProps
  extends Omit<MuiButtonProps, "variant" | "color" | "component"> {
  isDark?: boolean;
  loading?: boolean;
  /** Convenience alias for MUI's `component` prop (e.g. as={Link}) */
  as?: ElementType;
}

/**
 * Shared Button built on MUI Button.
 *
 * Height 56 px · padding 0 24 px · radius 16 px · gap 12 px
 * Background: linear-gradient(90deg, #B656C0 0%, #5531A8 100%) — same both modes
 * Box-shadow light: 0 2px 9px rgba(0,0,0,0.25)
 * Readex Pro · 18 px · 700 · white text
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isDark = false,
      loading = false,
      disabled,
      startIcon,
      endIcon,
      as,
      sx,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <MuiButton
        ref={ref}
        variant="contained"
        disabled={isDisabled}
        {...(as ? { component: as } : {})}
        startIcon={loading ? undefined : startIcon}
        endIcon={loading ? undefined : endIcon}
        sx={{
          // Layout
          height: "56px",
          padding: "0 24px",
          borderRadius: "16px",
          gap: "12px",
          alignSelf: "stretch",
          width: "100%",

          // Typography — spec: H6 22px/700 white
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "22px",
          fontWeight: 700,
          lineHeight: "150%",
          textTransform: "none",
          letterSpacing: "normal",
          color: "#FFFFFF",

          // Background — solid #6948B8 in dark mode, gradient in light mode
          backgroundColor: isDark ? "#6948B8" : "transparent",
          backgroundImage: isDark
            ? "none"
            : "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)",
          boxShadow: isDark ? "none" : "0 2px 9px 0 rgba(0,0,0,0.25)",

          // Hover / active
          "&:hover": {
            backgroundColor: isDark ? "#7B57CC" : "transparent",
            backgroundImage: isDark
              ? "none"
              : "linear-gradient(90deg, #C260CA 0%, #6540B8 100%)",
            boxShadow: isDark ? "none" : "0 4px 14px 0 rgba(0,0,0,0.25)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
          "&.Mui-disabled": {
            backgroundImage: isDark
              ? "none"
              : "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)",
            backgroundColor: isDark ? "#6948B8" : "transparent",
            opacity: 0.6,
            color: "#FFFFFF",
            boxShadow: "none",
          },

          ...sx,
        }}
        {...rest}
      >
        {loading ? (
          <CircularProgress
            size={20}
            thickness={3}
            sx={{ color: "#FFFFFF" }}
          />
        ) : (
          children
        )}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";

export default Button;

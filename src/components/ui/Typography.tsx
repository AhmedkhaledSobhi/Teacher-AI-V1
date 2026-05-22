"use client";

import type { ElementType } from "react";
import MuiTypography from "@mui/material/Typography";
import type { TypographyProps as MuiTypographyProps } from "@mui/material/Typography";

// ─── Design tokens ────────────────────────────────────────────────────────────
// h2: 45px desktop → 28px mobile (clamp)
// h6: 22px desktop → 16px mobile (clamp)
const TOKENS = {
  light: {
    h2: {
      color: "#3E256B",
      fontSize: "clamp(28px, 5vw, 45px)",
      fontWeight: 700,
    },
    h6: {
      color: "#5531A8",
      fontSize: "clamp(16px, 3vw, 22px)",
      fontWeight: 500,
    },
    small: { color: "#6948B8", fontSize: "15px", fontWeight: 400 },
    p: {
      color: "#6948B8",
      fontSize: "clamp(15px, 2.5vw, 18px)",
      fontWeight: 700,
    },
  },
  dark: {
    h2: {
      color: "#F5F0FF",
      fontSize: "clamp(28px, 5vw, 45px)",
      fontWeight: 700,
    },
    h6: {
      color: "#D4BDFF",
      fontSize: "clamp(16px, 3vw, 22px)",
      fontWeight: 500,
    },
    small: { color: "#D4BDFF", fontSize: "15px", fontWeight: 400 },
    p: {
      color: "#F5F0FF",
      fontSize: "clamp(15px, 2.5vw, 18px)",
      fontWeight: 700,
    },
  },
};

export type TypographyVariant = "h2" | "h6" | "small" | "p";

// Map our variants to MUI's variant prop
const MUI_VARIANT_MAP: Record<
  TypographyVariant,
  MuiTypographyProps["variant"]
> = {
  h2: "h2",
  h6: "h6",
  small: "body2",
  p: "body1",
};

// Map our variants to the HTML element
const COMPONENT_MAP: Record<
  TypographyVariant,
  MuiTypographyProps["component"]
> = {
  h2: "h2",
  h6: "h6",
  small: "span",
  p: "p",
};

interface TypographyProps
  extends Omit<MuiTypographyProps, "variant" | "color" | "component"> {
  variant?: TypographyVariant;
  isDark?: boolean;
  align?: "left" | "center" | "right";
  /** Convenience alias for MUI's `component` prop (e.g. as="span", as={Link}) */
  as?: ElementType;
}

const Typography = ({
  variant = "p",
  isDark = false,
  align = "center",
  as,
  sx,
  children,
  ...rest
}: TypographyProps) => {
  const tokens = TOKENS[isDark ? "dark" : "light"][variant];
  // `as` overrides the default element; fall back to COMPONENT_MAP
  const component = (as ?? COMPONENT_MAP[variant]) as ElementType;

  return (
    <MuiTypography
      variant={MUI_VARIANT_MAP[variant]}
      component={component}
      sx={{
        fontFamily: '"Readex Pro", sans-serif',
        fontStyle: "normal",
        lineHeight: "150%",
        textAlign: align,
        ...tokens,
        // Allow caller overrides
        ...sx,
      }}
      {...rest}
    >
      {children}
    </MuiTypography>
  );
};

export default Typography;

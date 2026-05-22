"use client";

import MuiFormLabel from "@mui/material/FormLabel";
import type { FormLabelProps } from "@mui/material/FormLabel";

interface LabelProps extends FormLabelProps {
  isDark?: boolean;
}

/**
 * Shared form Label built on MUI FormLabel.
 * Light: #6948B8  |  Dark: #F5F0FF
 * Readex Pro · 18 px · 400 · line-height 150% · text-align right
 *
 * The required asterisk is rendered manually AFTER children so it appears
 * physically on the right in RTL — MUI's built-in asterisk is disabled.
 */
const Label = ({
  isDark = false,
  required = false,
  sx,
  children,
  ...rest
}: LabelProps) => (
  <MuiFormLabel
    required={false} // disable MUI's auto-appended asterisk span
    sx={{
      fontFamily: '"Readex Pro", sans-serif',
      fontSize: "18px",
      fontWeight: 400,
      fontStyle: "normal",
      lineHeight: "150%",
      direction: "rtl",
      display: "flex",
      flexDirection: "row", // normal LTR flex — children first, then asterisk
      alignItems: "center",
      justifyContent: "flex-end", // push everything to the right
      gap: "3px",
      color: isDark ? "#F5F0FF" : "#6948B8",
      "&.Mui-focused": { color: isDark ? "#F5F0FF" : "#6948B8" },
      ...sx,
    }}
    {...rest}
  >
    {required && (
      <span
        aria-hidden="true"
        style={{ color: "#EF4444", lineHeight: 1 }}
      >
        *
      </span>
    )}
    {children}
  </MuiFormLabel>
);

export default Label;

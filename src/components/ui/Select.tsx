"use client";

import { forwardRef } from "react";
import MuiSelect from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import type { SelectProps as MuiSelectProps } from "@mui/material/Select";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<MuiSelectProps, "variant"> {
  isDark?: boolean;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      isDark = false,
      options,
      placeholder,
      fullWidth = true,
      error = false,
      helperText,
      value,
      sx,
      ...rest
    },
    ref
  ) => {
    const bg = isDark ? "#663EAF" : "#F6F2FF";
    const textColor =
      !value || value === "" ? "#A89ED3" : isDark ? "#F5F0FF" : "#3E256B";
    const borderColor = error
      ? "#EF4444"
      : isDark
        ? "rgba(255,255,255,0.12)"
        : "#E0D6F7";
    const focusBorder = error ? "#EF4444" : isDark ? "#D4BDFF" : "#6948B8";
    const iconColor = isDark ? "#D4BDFF" : "#6948B8";

    const menuItemSx = {
      fontFamily: '"Readex Pro", sans-serif',
      fontSize: "16px",
      direction: "rtl" as const,
      textAlign: "right" as const,
      justifyContent: "flex-end",
      color: isDark ? "#F5F0FF" : "#3E256B",
      background: "transparent",
      "&:hover": {
        background: isDark ? "#7B52C8" : "#F6F2FF",
      },
      "&.Mui-selected": {
        background: isDark ? "#8A62D8 !important" : "#EDE8FB !important",
        color: isDark ? "#FFFFFF" : "#3E256B",
      },
      "&.Mui-selected:hover": {
        background: isDark ? "#9572E0 !important" : "#DDD4F7 !important",
      },
    };

    return (
      <div
        style={{
          width: fullWidth ? "100%" : "440px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <MuiSelect
          ref={ref}
          value={value ?? ""}
          fullWidth={fullWidth}
          error={error}
          displayEmpty
          variant="outlined"
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: "12px",
                background: isDark ? "#3A1F80" : "#FFF",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid #E0D6F7",
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.5)"
                  : "0 8px 24px rgba(105,72,184,0.15)",
                "& .MuiMenuItem-root": menuItemSx,
              },
            },
          }}
          sx={{
            height: "56px",
            borderRadius: "16px",
            background: bg,
            direction: "rtl",

            "& .MuiOutlinedInput-notchedOutline": {
              border: `1.5px solid ${borderColor}`,
              borderRadius: "16px",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "rgba(255,255,255,0.25)" : "#C4B5F4",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: focusBorder,
              borderWidth: "1.5px",
            },

            "& .MuiSelect-select": {
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "18px",
              fontWeight: 400,
              color: textColor,
              textAlign: "right",
              direction: "rtl",
              paddingRight: "16px !important",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            },

            "& .MuiSelect-icon": {
              color: iconColor,
              right: "auto",
              left: "12px",
            },

            ...sx,
          }}
          {...rest}
        >
          {placeholder && (
            <MenuItem
              value=""
              disabled
              sx={{
                display: "none",
                ...menuItemSx,
              }}
            >
              {placeholder}
            </MenuItem>
          )}
          {options.map((opt) => (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={menuItemSx}
            >
              {opt.label}
            </MenuItem>
          ))}
        </MuiSelect>

        {helperText && (
          <FormHelperText
            error={error}
            sx={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "12px",
              color: error ? "#EF4444" : isDark ? "#D4BDFF" : "#6948B8",
              margin: 0,
              paddingInlineStart: "4px",
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

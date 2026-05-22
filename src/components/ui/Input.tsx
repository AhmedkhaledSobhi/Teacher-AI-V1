"use client";

import {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  type ReactNode,
} from "react";
import FormHelperText from "@mui/material/FormHelperText";

interface InputProps {
  isDark?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  // adornments — rendered physically at each end of the flex row
  startAdornment?: ReactNode; // left end  (eye toggle in RTL)
  endAdornment?: ReactNode; // right end (person / lock icons in RTL)
  // pass-through native input props
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  autoComplete?: string;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
}

/**
 * Custom Input — flex wrapper that owns the layout so icons and placeholder
 * are always in the correct physical position for RTL.
 *
 * Layout (left → right):  [startAdornment]  [<input flex-1>]  [endAdornment]
 * In RTL this gives:  eye-toggle | placeholder/text | person or lock icon
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      isDark = false,
      fullWidth = true,
      error = false,
      helperText,
      startAdornment,
      endAdornment,
      ...nativeProps
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const bg = isDark ? "#663EAF" : "#F6F2FF";
    const textColor = isDark ? "#F5F0FF" : "#3E256B";
    const iconColor = isDark ? "#D4BDFF" : "#A89ED3";
    const borderColor = error
      ? "#EF4444"
      : focused
        ? isDark
          ? "#D4BDFF"
          : "#6948B8"
        : isDark
          ? "rgba(255,255,255,0.12)"
          : "#E0D6F7";

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "row-reverse", // always LTR so we control exact physical positions
      alignItems: "center",
      width: fullWidth ? "100%" : "440px",
      height: "56px",
      borderRadius: "16px",
      background: bg,
      border: `1.5px solid ${borderColor}`,
      padding: "0 16px",
      gap: "14px",
      transition: "border-color 0.2s",
      boxSizing: "border-box",
      cursor: "text",
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: '"Readex Pro", sans-serif',
      fontSize: "18px",
      fontWeight: 400,
      lineHeight: "150%",
      color: textColor,
      // RTL text direction so cursor starts on the right
      direction: "rtl",
      padding: 0,
      height: "100%",
      width: "100%",
      minWidth: 0,
    };

    const adornmentStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      color: iconColor,
      lineHeight: 0,
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
        {/* Row: [startAdornment] [input] [endAdornment] */}
        <div style={containerStyle}>
          {/* startAdornment — physically left = visually left (eye toggle in RTL) */}
          {startAdornment && (
            <span style={adornmentStyle}>{startAdornment}</span>
          )}

          {/* Native input — takes remaining space, RTL direction */}
          <input
            ref={ref}
            style={inputStyle}
            {...nativeProps}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              setFocused(false);
              nativeProps.onBlur?.(e);
            }}
          />

          {/* endAdornment — physically right = visually right (person / lock icon in RTL) */}
          {endAdornment && <span style={adornmentStyle}>{endAdornment}</span>}
        </div>

        {helperText && (
          <FormHelperText
            error={error}
            sx={{
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "12px",
              color: error ? "#EF4444" : isDark ? "#D4BDFF" : "#6948B8",
              margin: 0,
              paddingInlineStart: "4px",
              textAlign: "end",
              direction: "rtl",
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

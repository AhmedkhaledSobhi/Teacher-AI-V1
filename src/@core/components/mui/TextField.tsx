"use client";

// React Imports
import { forwardRef } from "react";

// MUI Imports
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";
import type { InputLabelProps } from "@mui/material/InputLabel";

// Extend TextFieldProps to support "large" size
type ExtendedTextFieldProps = Omit<TextFieldProps, "size"> & {
  size?: "small" | "medium" | "large";
};

const TextFieldStyled = styled(TextField)<TextFieldProps>(({ theme }) => ({
  "& .MuiInputLabel-root": {
    transform: "none",
    width: "fit-content",
    maxWidth: "100%",
    lineHeight: 1.153,
    position: "relative",
    fontSize: "18px",
    marginBottom: theme.spacing(1),
    "&.Mui-required": {
      "& .MuiInputLabel-asterisk": {
        display: "none",
      },
      "&:after": {
        content: "'*'",
        color: "#DC64C9",
        marginLeft: theme.spacing(0.5),
      },
    },

    color: "var(--mui-palette-text-secondary)",
    "&:not(.Mui-error).MuiFormLabel-colorPrimary.Mui-focused": {
      color: "text.secondary !important",
    },

    "&.Mui-disabled": {
      color: "var(--mui-palette-text-disabled)",
    },
    "&.Mui-error": {
      color: "var(--mui-palette-error-main)",
    },
  },
  "& .MuiInputBase-root": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "#663EAF !important"
        : "#F6F2FF !important",
    height: "56px",
    "&:not(.Mui-focused):not(.Mui-disabled):not(.Mui-error):hover": {
      borderColor: "var(--mui-palette-action-active)",
    },
    "&:before, &:after": {
      display: "none",
    },
    "&.MuiInputBase-sizeSmall": {
      borderRadius: "var(--mui-shape-borderRadius)",
    },
    "&.Mui-error": {
      borderColor: "var(--mui-palette-error-main)",
    },
    "&.Mui-focused": {
      borderWidth: 2,
      "& .MuiInputBase-input:not(.MuiInputBase-readOnly):not([readonly])::placeholder":
        {
          fontSize: "14px",
          [theme.breakpoints.up("sm")]: {
            fontSize: "16px",
          },
          [theme.breakpoints.up("md")]: {
            fontSize: "18px",
          },
          transform: "translateX(4px)",
        },
      "& :not(textarea).MuiFilledInput-input": {
        padding: "6.25px 13px",
      },
      "&:not(.Mui-error).MuiInputBase-colorPrimary": {
        borderColor: "var(--mui-palette-primary-main)",
        boxShadow: "var(--mui-customShadows-primary-sm)",
      },
      "&.MuiInputBase-colorSecondary": {
        borderColor: "var(--mui-palette-secondary-main)",
      },
      "&.MuiInputBase-colorInfo": {
        borderColor: "var(--mui-palette-info-main)",
      },
      "&.MuiInputBase-colorSuccess": {
        borderColor: "var(--mui-palette-success-main)",
      },
      "&.MuiInputBase-colorWarning": {
        borderColor: "var(--mui-palette-warning-main)",
      },
      "&.MuiInputBase-colorError": {
        borderColor: "var(--mui-palette-error-main)",
      },
      "&.Mui-error": {
        borderColor: "var(--mui-palette-error-main)",
      },
    },
    "&.Mui-disabled": {
      backgroundColor: "var(--mui-palette-action-hover) !important",
    },
  },

  // Adornments
  "& .MuiInputAdornment-root": {
    marginBlockStart: "0px !important",
    "&.MuiInputAdornment-positionStart + .MuiInputBase-input:not(textarea)": {
      paddingInlineStart: "0px !important",
    },
  },
  "& .MuiInputBase-inputAdornedEnd.MuiInputBase-input": {
    paddingInlineEnd: "0px !important",
  },

  "& .MuiInputBase-sizeSmall.MuiInputBase-adornedStart.Mui-focused": {
    paddingInlineStart: "13px",
    "& .MuiInputBase-input": {
      paddingInlineStart: "0px !important",
    },
  },
  "& .MuiInputBase-sizeSmall.MuiInputBase-adornedStart:not(.MuiAutocomplete-inputRoot)":
    {
      paddingInlineStart: "14px",
    },
  "& .MuiInputBase-sizeSmall.MuiInputBase-adornedEnd:not(.MuiAutocomplete-inputRoot)":
    {
      paddingInlineEnd: "14px",
    },
  "& .MuiInputBase-sizeSmall.MuiInputBase-adornedEnd.Mui-focused:not(.MuiAutocomplete-inputRoot)":
    {
      paddingInlineEnd: "13px",
      "& .MuiInputBase-input": {
        paddingInlineEnd: "0px !important",
      },
    },
  "& .MuiInputBase-sizeLarge.MuiInputBase-adornedStart.Mui-focused": {
    paddingInlineStart: "15px",
    "& .MuiInputBase-input": {
      paddingInlineStart: "0px !important",
    },
  },
  "& .MuiInputBase-sizeLarge.MuiInputBase-adornedStart": {
    paddingInlineStart: "16px",
  },
  "& .MuiInputBase-sizeLarge.MuiInputBase-adornedEnd.Mui-focused": {
    paddingInlineEnd: "15px",
    "& .MuiInputBase-input": {
      paddingInlineEnd: "0px !important",
    },
  },
  "& .MuiInputBase-sizeLarge.MuiInputBase-adornedEnd": {
    paddingInlineEnd: "16px",
  },
  "& :not(.MuiInputBase-sizeSmall):not(.MuiInputBase-sizeLarge).MuiInputBase-adornedStart.Mui-focused":
    {
      paddingInlineStart: "15px",
      "& .MuiInputBase-input": {
        paddingInlineStart: "0px !important",
      },
    },
  "& :not(.MuiInputBase-sizeSmall):not(.MuiInputBase-sizeLarge).MuiInputBase-adornedStart":
    {
      paddingInlineStart: "16px",
    },
  "& :not(.MuiInputBase-sizeSmall):not(.MuiInputBase-sizeLarge).MuiInputBase-adornedEnd.Mui-focused":
    {
      paddingInlineEnd: "15px",
      "& .MuiInputBase-input": {
        paddingInlineEnd: "0px !important",
      },
    },
  "& :not(.MuiInputBase-sizeSmall):not(.MuiInputBase-sizeLarge).MuiInputBase-adornedEnd":
    {
      paddingInlineEnd: "16px",
    },
  "& .MuiInputAdornment-sizeMedium": {
    "i, svg": {
      fontSize: "1rem",
      [theme.breakpoints.up("sm")]: {
        fontSize: "1.125rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "1.25rem",
      },
    },
  },
  "& .MuiInputAdornment-sizeLarge": {
    "i, svg": {
      fontSize: "1.125rem",
      [theme.breakpoints.up("sm")]: {
        fontSize: "1.25rem",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "1.375rem",
      },
    },
  },

  "& .MuiInputBase-input": {
    "&:not(textarea).MuiInputBase-inputSizeSmall": {
      padding: "7.25px 14px",
    },
    "&:not(.MuiInputBase-readOnly):not([readonly])::placeholder": {
      transition: theme.transitions.create(["opacity", "transform"], {
        duration: theme.transitions.duration.shorter,
      }),
    },
  },
  "& .MuiInputBase-sizeLarge.MuiInputBase-root": {
    borderRadius: "16px",
    fontSize: "14px",
    [theme.breakpoints.up("sm")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "18px",
    },
    lineHeight: "1.41",
    minHeight: "56px",
    "& .MuiInputBase-input": {
      padding: "16px",
      fontSize: "inherit",
      height: "56px",
      boxSizing: "border-box",
    },
    "&.Mui-focused": {
      "& .MuiInputBase-input": {
        padding: "16px",
        fontSize: "inherit",
      },
    },
  },
  "& :not(.MuiInputBase-sizeSmall):not(.MuiInputBase-sizeLarge).MuiInputBase-root":
    {
      borderRadius: "16px",
      fontSize: "14px",
      [theme.breakpoints.up("sm")]: {
        fontSize: "15px",
      },
      [theme.breakpoints.up("md")]: {
        fontSize: "17px",
      },
      lineHeight: "1.41",
      "& .MuiInputBase-input": {
        padding: "10.8px 16px",
        fontSize: "inherit",
      },
      "&.Mui-focused": {
        "& .MuiInputBase-input": {
          padding: "9.8px 15px",
          fontSize: "inherit",
        },
      },
    },
  "& .MuiFormHelperText-root": {
    lineHeight: 1.154,
    margin: theme.spacing(1, 0, 0),
    fontSize: theme.typography.body2.fontSize,
    "&.Mui-error": {
      color: "var(--mui-palette-error-main)",
    },
    "&.Mui-disabled": {
      color: "var(--mui-palette-text-disabled)",
    },
  },

  // For Select
  "& .MuiSelect-select.MuiInputBase-inputSizeSmall, & .MuiNativeSelect-select.MuiInputBase-inputSizeSmall":
    {
      "& ~ i, & ~ svg": {
        inlineSize: "1.125rem",
        blockSize: "1.125rem",
      },
    },
  "& .MuiSelect-select": {
    // lineHeight: 1.5,
    direction: "rtl !important",
    minHeight: "unset !important",
    lineHeight: "1.4375em",
    "&.MuiInputBase-input": {
      paddingInlineEnd: "32px !important",
    },
  },
  "& .Mui-focused .MuiSelect-select": {
    "& ~ i, & ~ svg": {
      right: "0.9375rem",
    },
  },

  "& .MuiSelect-select:focus, & .MuiNativeSelect-select:focus": {
    backgroundColor: "transparent",
  },

  // For Autocomplete
  "& :not(.MuiInputBase-sizeSmall).MuiAutocomplete-inputRoot": {
    paddingBlock: "5.55px",
    "& .MuiAutocomplete-input": {
      paddingInline: "8px !important",
      paddingBlock: "5.25px !important",
    },
    "&.Mui-focused .MuiAutocomplete-input": {
      paddingInlineStart: "7px !important",
    },
    "&.Mui-focused": {
      paddingBlock: "4.55px !important",
    },
    "& .MuiAutocomplete-endAdornment": {
      top: "calc(50% - 12px)",
    },
  },
  "& .MuiAutocomplete-inputRoot.MuiInputBase-sizeSmall": {
    paddingBlock: "4.75px !important",
    paddingInlineStart: "10px",
    "&.Mui-focused": {
      paddingBlock: "3.75px !important",
      paddingInlineStart: "9px",
      ".MuiAutocomplete-input": {
        paddingBlock: "2.5px",
        paddingInline: "3px !important",
      },
    },
    "& .MuiAutocomplete-input": {
      paddingInline: "3px !important",
    },
  },
  "& .MuiAutocomplete-inputRoot": {
    display: "flex",
    gap: "0.25rem",
    "& .MuiAutocomplete-tag": {
      margin: 0,
    },
  },
  "& .MuiAutocomplete-inputRoot.Mui-focused .MuiAutocomplete-endAdornment": {
    right: ".9375rem",
  },

  // For Textarea
  "& .MuiInputBase-multiline": {
    "&.MuiInputBase-sizeSmall": {
      padding: "6px 14px",
      "&.Mui-focused": {
        padding: "5px 13px",
      },
    },
    "& textarea.MuiInputBase-inputSizeSmall:placeholder-shown": {
      overflowX: "hidden",
    },
  },
}));

const CustomTextField = forwardRef<HTMLDivElement, ExtendedTextFieldProps>(
  (props, ref) => {
    const { size = "small", slotProps, inputRef, ...rest } = props;

    // Map "large" to "medium" for MUI compatibility, styles will handle the actual sizing
    const muiSize: "small" | "medium" = size === "large" ? "medium" : size;

    return (
      <TextFieldStyled
        {...rest}
        ref={ref}
        inputRef={inputRef}
        variant="filled"
        size={muiSize}
        slotProps={{
          ...slotProps,
          inputLabel: {
            ...slotProps?.inputLabel,
            shrink: true,
          } as InputLabelProps,
        }}
        // Add data attribute to identify large size for styling
        {...(size === "large" && { "data-size": "large" })}
      />
    );
  }
);

export default CustomTextField;

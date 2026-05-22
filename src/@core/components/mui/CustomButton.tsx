"use client";

// React Imports
import { forwardRef } from "react";

// MUI Imports
import { styled } from "@mui/material/styles";
import Button, { type ButtonProps } from "@mui/material/Button";

type CustomButtonVariant = "primary" | "secondary" | "tertiary";

type CustomButtonProps = ButtonProps & {
  variant?: CustomButtonVariant | "contained" | "outlined" | "text";
  customVariant?: CustomButtonVariant;
};

const ButtonStyled = styled(Button)<CustomButtonProps>(({
  theme,
  customVariant = "primary",
}) => {
  const getBackground = () => {
    switch (customVariant) {
      case "primary":
        return "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)";
      case "secondary":
        return "linear-gradient(90deg, #5531A8 0%, #B656C0 100%)";
      case "tertiary":
        return theme.palette.mode === "dark"
          ? "linear-gradient(90deg, #6948B8 0%, #3E256B 100%)"
          : "linear-gradient(90deg, #BDA4F2 0%, #9B87C4 100%)";
      default:
        return undefined;
    }
  };

  const getHoverBackground = () => {
    switch (customVariant) {
      case "primary":
        return "linear-gradient(90deg, #C066D0 0%, #6541B8 100%)";
      case "secondary":
        return "linear-gradient(90deg, #6541B8 0%, #C066D0 100%)";
      case "tertiary":
        return theme.palette.mode === "dark"
          ? "linear-gradient(90deg, #7A58C8 0%, #4E2F7B 100%)"
          : "linear-gradient(90deg, #CDB4F2 0%, #AB97D4 100%)";
      default:
        return undefined;
    }
  };

  const background = "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)";
  const hoverBackground = "linear-gradient(90deg, #C066D0 0%, #6541B8 100%)";

  return {
    minHeight: "56px",
    height: "56px",
    borderRadius: "16px",
    fontSize: "18px",
    fontWeight: 600,
    textTransform: "none",
    padding: "16px 24px",
    boxSizing: "border-box",
    transition: theme.transitions.create(
      ["background", "background-image", "box-shadow", "transform"],
      {
        duration: theme.transitions.duration.shorter,
      }
    ),
    ...(background && {
      background: background,
      color: "#FFFFFF",
      border: "none",
      "&:hover": {
        background: hoverBackground,
        boxShadow: "0 4px 12px rgba(85, 49, 168, 0.4)",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "translateY(0px)",
        boxShadow: "0 2px 8px rgba(85, 49, 168, 0.3)",
      },
      "&:disabled": {
        background: "rgba(85, 49, 168, 0.3) !important",
        backgroundImage: "none !important",
        color: "rgba(255, 255, 255, 0.5)",
      },
    }),
    "&.MuiButton-sizeLarge": {
      minHeight: "56px",
      height: "56px",
      fontSize: "22px",
      alignItems: "flex-start",
      justifyContent: "center",
      fontWeight: 700,
      color: "#F5F0FF",
    },
    "&.MuiButton-sizeMedium": {
      minHeight: "48px",
      height: "48px",
      fontSize: "16px",
      padding: "12px 24px",
    },
    "&.MuiButton-sizeSmall": {
      minHeight: "40px",
      height: "40px",
      fontSize: "14px",
      padding: "8px 16px",
    },
  };
});

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ variant = "contained", customVariant, ...props }, ref) => {
    // If customVariant is provided, use it; otherwise use the standard variant
    const buttonVariant =
      customVariant &&
      ["primary", "secondary", "tertiary"].includes(customVariant)
        ? "contained"
        : variant;

    return (
      <ButtonStyled
        ref={ref}
        style={{
          background: "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)",
        }}
        variant={buttonVariant}
        customVariant={customVariant}
        {...props}
      />
    );
  }
);

CustomButton.displayName = "CustomButton";

export default CustomButton;

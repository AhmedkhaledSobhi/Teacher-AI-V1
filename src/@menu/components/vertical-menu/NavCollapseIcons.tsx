"use client";

// React Imports
import type { HTMLAttributes, ReactElement } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Hook Imports
import useVerticalNav from "../../hooks/useVerticalNav";

// Icon Imports
import CloseIcon from "../../svg/Close";
import RadioCircleIcon from "../../svg/RadioCircle";
import RadioCircleMarkedIcon from "../../svg/RadioCircleMarked";

type NavCollapseIconsProps = HTMLAttributes<HTMLSpanElement> & {
  closeIcon?: ReactElement;
  lockedIcon?: ReactElement;
  unlockedIcon?: ReactElement;
  onClick?: () => void;
  onClose?: () => void;
};

const NavCollapseIcons = (props: NavCollapseIconsProps) => {
  // Props
  const { closeIcon, lockedIcon, unlockedIcon, onClick, onClose, ...rest } =
    props;

  // Hooks
  const {
    isCollapsed,
    collapseVerticalNav,
    isBreakpointReached,
    toggleVerticalNav,
    isToggled,
  } = useVerticalNav();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Responsive sizes
  const iconSize = isMobile ? 32 : isTablet ? 36 : 40;
  const borderRadius = isMobile ? "8px" : "12px";
  const fontSize = isMobile ? "18px" : isTablet ? "20px" : "22px";

  // Handle Lock / Unlock Icon Buttons click (Desktop)
  const handleClick = (action: "lock" | "unlock") => {
    // Setup the verticalNav to be locked or unlocked
    const collapse = action === "lock" ? false : true;

    // Tell the verticalNav to lock or unlock
    collapseVerticalNav(collapse);

    // Call onClick function if passed
    onClick && onClick();
  };

  // Handle Toggle button click (Mobile - Open/Close)
  const handleToggle = () => {
    // Toggle the verticalNav open/close
    toggleVerticalNav(!isToggled);

    // Call onClick function if passed
    onClick && onClick();
  };

  // Handle Close button click (Mobile)
  const handleClose = () => {
    // Close verticalNav using toggle verticalNav function
    toggleVerticalNav(false);

    // Call onClose function if passed
    onClose && onClose();
  };

  return (
    <>
      {isBreakpointReached ? (
        // Mobile: Toggle open/close button
        <span
          role="button"
          tabIndex={0}
          aria-label={isToggled ? "Close navigation" : "Open navigation"}
          className="text-secondary"
          style={{
            display: "flex",
            cursor: "pointer",
            backgroundColor: `${isDark ? "#6948B8" : "#ffff"}`,
            borderRadius: borderRadius,
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.08)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize,
            transition: "all 0.2s ease-in-out",
          }}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 6px 0 rgba(0, 0, 0, 0.08)";
          }}
          {...rest}
        >
          {isToggled
            ? (closeIcon ?? <CloseIcon />)
            : (lockedIcon ?? <RadioCircleMarkedIcon />)}
        </span>
      ) : isCollapsed ? (
        // Desktop: Unlocked (collapsed) - Click to expand
        <span
          role="button"
          tabIndex={0}
          aria-label="Expand navigation"
          className="text-secondary"
          style={{
            display: "flex",
            cursor: "pointer",
            backgroundColor: `${isDark ? "#6948B8" : "#ffff"}`,
            borderRadius: borderRadius,
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.08)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize,
            transition: "all 0.2s ease-in-out",
          }}
          onClick={() => handleClick("lock")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick("lock");
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 6px 0 rgba(0, 0, 0, 0.08)";
          }}
          {...rest}
        >
          {unlockedIcon ?? <RadioCircleIcon />}
        </span>
      ) : (
        // Desktop: Locked (expanded) - Click to collapse
        <span
          role="button"
          tabIndex={0}
          aria-label="Collapse navigation"
          className="text-secondary"
          style={{
            display: "flex",
            cursor: "pointer",
            backgroundColor: `${isDark ? "#6948B8" : "#ffff"}`,
            borderRadius: borderRadius,
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.08)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize,
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 6px 0 rgba(0, 0, 0, 0.08)";
          }}
          onClick={() => handleClick("unlock")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick("unlock");
            }
          }}
          {...rest}
        >
          {lockedIcon ?? <RadioCircleMarkedIcon />}
        </span>
      )}
    </>
  );
};

export default NavCollapseIcons;

"use client";

// React Imports
import { memo, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";

// MUI Imports
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, useColorScheme } from "@mui/material/styles";
import PerfectScrollbar from "react-perfect-scrollbar";

// Component Imports
import Navigation from "../vertical/Navigation";

// Hook Imports
import { useSettings } from "@core/hooks/useSettings";

// Type Imports
import type { Mode } from "@core/types";
import type { Locale } from "@configs/i18n";
import type { getDictionary } from "@/utils/getDictionary";

// Import dictionaries directly (client-side compatible)
import enDict from "@/data/dictionaries/en.json";
import arDict from "@/data/dictionaries/ar.json";

const dictionaries = {
  en: enDict,
  ar: arDict,
};

type SettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const SettingsDrawer = memo(({ open, onClose }: SettingsDrawerProps) => {
  const theme = useTheme();
  const isBelowMdScreen = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams();
  const locale = (params?.lang as Locale) || "ar";

  // Get dictionary using client-side approach
  const dictionary = useMemo(() => {
    return dictionaries[locale] || dictionaries.ar;
  }, [locale]) as Awaited<ReturnType<typeof getDictionary>>;

  // Get mode using client-side hooks
  const { settings } = useSettings();
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme();

  // Determine current mode (similar to Navigation component logic)
  const mode: Mode =
    (muiMode === "system" ? muiSystemMode : muiMode) ||
    settings.mode ||
    "light";

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={handleClose}
      ModalProps={{
        disablePortal: true,
        keepMounted: true, // Better performance on mobile
        disableScrollLock: false,
      }}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        "& .MuiDrawer-paper": {
          width: { xs: "280px", sm: "280px", md: "280px" },
          boxShadow: theme.shadows[16],
        },
      }}
    >
      {/* Scrollable Content */}

      <Navigation
        dictionary={dictionary}
        mode={mode}
        handleClose={handleClose}
      />
    </Drawer>
  );
});

SettingsDrawer.displayName = "SettingsDrawer";

export default SettingsDrawer;

"use client";

// React Imports
import { useEffect, useRef } from "react";

// Next Imports
import Link from "next/link";
import { useParams } from "next/navigation";

// MUI Imports
import { styled, useColorScheme, useTheme } from "@mui/material/styles";

// Type Imports
import type { getDictionary } from "@/utils/getDictionary";
import type { Mode } from "@core/types";
import type { Locale } from "@configs/i18n";

// Component Imports
import VerticalNav, { NavHeader, NavCollapseIcons } from "@menu/vertical-menu";
import VerticalMenu from "./VerticalMenu";
import Logo from "@components/layout/shared/Logo";

// Hook Imports
import useVerticalNav from "@menu/hooks/useVerticalNav";
import { useSettings } from "@core/hooks/useSettings";

// Util Imports
import { getLocalizedUrl } from "@/utils/i18n";

// Style Imports
import navigationCustomStyles from "@core/styles/vertical/navigationCustomStyles";
import { Avatar, IconButton, Typography } from "@mui/material";
import { useUser } from "@/hooks/useUser";
import { getGradeName } from "../shared/UserDropdown";
import ModeDropdown from "../shared/ModeDropdown";
import UserInfoSkeleton from "../shared/UserInfoSkeleton";

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  mode: Mode;
  handleClose: () => void;
};

const StyledBoxForShadow = styled("div")(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: "absolute",
  pointerEvents: "none",
  width: "calc(100% + 15px)",
  height: theme.mixins.toolbar.minHeight,
  transition: "opacity .15s ease-in-out",
  background: `linear-gradient(var(--mui-palette-background-paper) ${
    theme.direction === "rtl" ? "95%" : "5%"
  }, rgb(var(--mui-palette-background-paperChannel) / 0.85) 30%, rgb(var(--mui-palette-background-paperChannel) / 0.5) 65%, rgb(var(--mui-palette-background-paperChannel) / 0.3) 75%, transparent)`,
  "&.scrolled": {
    opacity: 1,
  },
}));

const Navigation = (props: Props) => {
  // Props
  const { dictionary, mode, handleClose } = props;

  // Hooks
  const verticalNavOptions = useVerticalNav();
  const { updateSettings, settings } = useSettings();
  const { user: sessionUser, status, isLoading } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;

  const { lang: locale } = useParams();
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme();
  const theme = useTheme();

  // Refs
  const shadowRef = useRef(null);

  // Vars
  const { isCollapsed, isHovered, collapseVerticalNav, isBreakpointReached } =
    verticalNavOptions;
  const isSemiDark = settings.semiDark;

  const currentMode = muiMode === "system" ? muiSystemMode : muiMode || mode;

  const isDark = currentMode === "dark";

  const scrollMenu = (container: any, isPerfectScrollbar: boolean) => {
    container =
      isBreakpointReached || !isPerfectScrollbar ? container.target : container;

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains("scrolled")) {
        // @ts-ignore
        shadowRef.current.classList.add("scrolled");
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove("scrolled");
    }
  };

  useEffect(() => {
    if (settings.layout === "collapsed") {
      collapseVerticalNav(true);
    } else {
      collapseVerticalNav(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.layout]);

  return (
    // eslint-disable-next-line lines-around-comment
    // Sidebar Vertical Menu
    <VerticalNav
      customStyles={navigationCustomStyles(verticalNavOptions, theme)}
      collapsedWidth={71}
      backgroundColor={theme.palette.mode === "dark" ? "#3E256B" : "white"}
      // eslint-disable-next-line lines-around-comment
      // The following condition adds the data-dark attribute to the VerticalNav component
      // when semiDark is enabled and the mode or systemMode is light
      {...(isSemiDark &&
        !isDark && {
          "data-dark": "",
        })}
    >
      {/* Nav Header including Logo & nav toggle icons  */}
      <NavHeader>
        <div className="flex items-center flex-row gap-3">
          {isLoading ? (
            <UserInfoSkeleton variant="sidebar" />
          ) : (
            <>
              <Avatar
                alt={session?.user?.name || ""}
                src={session?.user?.profile_image_url || ""}
                className="cursor-pointer bs-[70px] is-[70px]"
                style={{
                  border: "1.792px solid #FFF",
                  background:
                    "linear-gradient(180deg, #6948B8 0%, #BDA4F2 100%)",
                  boxShadow:
                    "0 1.033px 3.099px 0 rgba(0, 0, 0, 0.10), 0 1.033px 2.066px -1.033px rgba(0, 0, 0, 0.10)",
                  fontSize: "39.263px",
                  alignItems: "center",
                  paddingTop: session?.user?.image ? 0 : "18px",
                }}
              >
                {!session?.user?.profile_image_url && "👦"}
              </Avatar>
              <div className="flex items-start flex-col justify-center">
                <Typography className="font-medium text-xl text-secondary">
                  {session?.user?.name || ""}
                </Typography>
                <Typography className="text-[15px] text-[#DC64C9]">
                  {getGradeName(
                    session?.user?.grade_id as string | number | undefined
                  )}
                </Typography>
              </div>
            </>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-col">
            <IconButton
              onClick={handleClose}
              style={{
                display: "flex",
                cursor: "pointer",
                backgroundColor: `${isDark ? "#6948B8" : "#ffff"}`,
                borderRadius: "11.429px",
                width: "40px",

                height: "40px",
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.08)",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                transition: "all 0.2s ease-in-out",
              }}
            >
              <i className="tabler-x text-xl text-secondary" />
            </IconButton>
            <ModeDropdown />
          </div>
        </div>
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <VerticalMenu
        dictionary={dictionary}
        scrollMenu={scrollMenu}
      />
    </VerticalNav>
  );
};

export default Navigation;

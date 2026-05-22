"use client";

// React Imports
import { useRef, useState } from "react";
import type { MouseEvent } from "react";

// Next Imports
import { useParams, useRouter } from "next/navigation";

// MUI Imports
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

// Hook Imports (offline-aware)
import { useUser } from "@/hooks/useUser";

// Util Imports
import { signOut } from "@/utils/auth-utils";

// Component Imports
import UserInfoSkeleton from "./UserInfoSkeleton";

// Type Imports
import type { Locale } from "@configs/i18n";

// Hook Imports
import { useSettings } from "@core/hooks/useSettings";
import { useCoreUISound } from "@/hooks/useCoreUISound";

// Util Imports
import { getLocalizedUrl } from "@/utils/i18n";
import { getDisplayName } from "@/utils/string";

// Function to get Arabic grade name from grade_id
export const getGradeName = (gradeId: number | string | undefined): string => {
  if (!gradeId) return "";

  const gradeIdNum =
    typeof gradeId === "string" ? parseInt(gradeId, 10) : gradeId;

  const gradeMap: Record<number, string> = {
    1: "الصف الاول",
    2: "الصف الثاني",
    3: "الصف الثالث",
    4: "الصف الرابع",
    5: "الصف الخامس",
    6: "الصف السادس",
    7: "الصف السابع",
    8: "الصف الثامن",
    // Add more grades as needed
    // 2: "الصف الثاني",
    // 3: "الصف الثالث",
  };

  return gradeMap[gradeIdNum] || String(gradeId);
};

// Styled component for badge content
const BadgeContentSpan = styled("span")({
  width: 8,
  height: 8,
  borderRadius: "50%",
  cursor: "pointer",
  backgroundColor: "var(--mui-palette-success-main)",
  boxShadow: "0 0 0 2px var(--mui-palette-background-paper)",
});

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false);

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null);

  // Hooks
  const router = useRouter();
  const { user: sessionUser, status, isLoading } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const { settings } = useSettings();
  const { lang: locale } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const { play } = useCoreUISound();

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false);
  };

  const handleDropdownClose = (
    event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent),
    url?: string
  ) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale as Locale));
    }

    if (
      anchorRef.current &&
      anchorRef.current.contains(event?.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleUserLogout = async () => {
    try {
      play("ui-logout");
      // signOut (from auth-utils) broadcasts the logout event to all other
      // open tabs via localStorage + BroadcastChannel before navigating.
      await signOut();
    } catch (error) {
      console.error(error);
    }
  };

  // Responsive values
  const avatarSize = isMobile ? 40 : isTablet ? 42 : 48;
  const avatarFontSize = isMobile ? "18px" : isTablet ? "20px" : "22px";
  const badgePadding = isMobile
    ? "3px 8px"
    : isTablet
      ? "4px 10px"
      : "4px 12px";
  const badgeGap = isMobile ? "8px" : isTablet ? "10px" : "12px";
  const nameFontSize = isMobile ? "11px" : isTablet ? "12px" : "13px";
  const gradeFontSize = isMobile ? "9px" : isTablet ? "10px" : "11px";

  if (isLoading) {
    return <UserInfoSkeleton variant="navbar" />;
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap="rectangular"
        sx={{
          display: "flex",
          border: "1.5px solid #D4BDFF",
          padding: badgePadding,
          borderRadius: isMobile ? "10px" : "14px",
          boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.1)",
          gap: badgeGap,
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minWidth: isMobile ? "auto" : "fit-content",
          maxWidth: isMobile ? "auto" : "220px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
            borderColor: "#B656C0",
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        className="mis-2"
      >
        <Avatar
          ref={anchorRef}
          alt={session?.user?.name || ""}
          src={session?.user?.profile_image_url || ""}
          onClick={handleDropdownOpen}
          className="cursor-pointer"
          sx={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            border: "2px solid #FFF",
            background: "linear-gradient(180deg, #6948B8 0%, #BDA4F2 100%)",
            boxShadow:
              "0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 3px -1px rgba(0, 0, 0, 0.08)",
            fontSize: avatarFontSize,
            alignItems: "end",
            flexShrink: 0,
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.08)",
            },
          }}
        >
          {!session?.user?.profile_image_url && "👦"}
        </Avatar>
        {!isMobile && (
          <div className="flex items-start flex-col justify-center min-w-0">
            {(() => {
              const rawName = session?.user?.name || "";
              const maxLen = 15;
              const isTruncated = rawName.length > maxLen;
              const displayName = isTruncated
                ? rawName.slice(0, maxLen) + "..."
                : rawName;
              return (
                <Typography
                  className="font-medium text-secondary"
                  sx={{
                    fontSize: nameFontSize,
                    lineHeight: 1.2,
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={isTruncated ? rawName : undefined}
                >
                  {displayName}
                </Typography>
              );
            })()}
            <Typography
              className="text-[#DC64C9] truncate"
              sx={{ fontSize: gradeFontSize, lineHeight: 1.2 }}
            >
              {getGradeName(
                session?.user?.grade_id as string | number | undefined
              )}
            </Typography>
          </div>
        )}
      </Badge>
      {/* <Popper
        open={open}
        transition
        disablePortal
        placement={isMobile ? "bottom" : "bottom-end"}
        anchorEl={anchorRef.current}
        sx={{
          minWidth: isMobile ? "calc(100vw - 32px)" : "240px",
          maxWidth: isMobile ? "calc(100vw - 32px)" : "320px",
          marginTop: theme.spacing(1),
          zIndex: 1300,
        }}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-end" ? "right top" : "left top",
            }}
          >
            <Paper
              className={
                settings.skin === "bordered"
                  ? "border shadow-none"
                  : "shadow-lg"
              }
            >
              <ClickAwayListener
                onClickAway={(e) =>
                  handleDropdownClose(e as MouseEvent | TouchEvent)
                }
              >
                <MenuList>
                  <div
                    className="flex items-center gap-2"
                    style={{
                      paddingBlock: theme.spacing(isMobile ? 1.5 : 2),
                      paddingInline: theme.spacing(isMobile ? 2 : 3),
                    }}
                    tabIndex={-1}
                  >
                    <Avatar
                      alt={session?.user?.name || ""}
                      src={session?.user?.image || ""}
                      sx={{
                        width: isMobile ? 40 : 48,
                        height: isMobile ? 40 : 48,
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex items-start flex-col min-w-0 flex-1">
                      <Typography
                        className="font-medium truncate"
                        color="text.primary"
                        sx={{
                          fontSize: isMobile ? "14px" : "16px",
                        }}
                      >
                        {session?.user?.name || ""}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="truncate"
                        sx={{
                          fontSize: isMobile ? "11px" : "12px",
                        }}
                      >
                        {session?.user?.email || ""}
                      </Typography>
                    </div>
                  </div>
                  <Divider className="mlb-1" />

                  <div
                    className="flex items-center"
                    style={{
                      paddingBlock: theme.spacing(isMobile ? 1.5 : 2),
                      paddingInline: theme.spacing(isMobile ? 2 : 3),
                    }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size={isMobile ? "medium" : "small"}
                      endIcon={<i className="tabler-logout" />}
                      onClick={handleUserLogout}
                      sx={{
                        fontSize: isMobile ? "14px" : "13px",
                        paddingBlock: isMobile
                          ? theme.spacing(1.25)
                          : theme.spacing(0.75),
                        "& .MuiButton-endIcon": { marginInlineStart: 1.5 },
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper> */}
    </>
  );
};

export default UserDropdown;

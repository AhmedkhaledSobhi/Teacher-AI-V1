"use client";
// React Imports
import { useState, useCallback, memo } from "react";

// Third-party Imports
import classnames from "classnames";
import { useParams, usePathname } from "next/navigation";
import { useTheme, useMediaQuery, IconButton, Tooltip } from "@mui/material";
import { useSelector } from "react-redux";

// Type Imports
import type { ShortcutsType } from "@components/layout/shared/ShortcutsDropdown";
import type { NotificationsType } from "@components/layout/shared/NotificationsDropdown";
import type { Locale } from "@configs/i18n";
import type { RootState } from "@/redux-store";

// Component Imports
import NavToggle from "./NavToggle";
import NavSearch from "@components/layout/shared/search";
import LanguageDropdown from "@components/layout/shared/LanguageDropdown";
import ModeDropdown from "@components/layout/shared/ModeDropdown";
import ShortcutsDropdown from "@components/layout/shared/ShortcutsDropdown";
import NotificationsDropdown from "@components/layout/shared/NotificationsDropdown";
import SettingsDrawer from "@components/layout/shared/SettingsDrawer";
import Link from "@components/Link";

// Util Imports
import { verticalLayoutClasses } from "@layouts/utils/layoutClasses";
import UserDropdown from "../shared/UserDropdown";
import Logo from "@/@core/svg/Logo";
import { NavCollapseIcons } from "@/@menu/vertical-menu";
import { Typography } from "@mui/material";
import { getLocalizedUrl } from "@/utils/i18n";
import { useTranslation } from "@/hooks/useTranslation";

// Vars
const shortcuts: ShortcutsType[] = [
  {
    url: "/apps/calendar",
    icon: "tabler-calendar",
    title: "Calendar",
    subtitle: "Appointments",
  },
  {
    url: "/apps/invoice/list",
    icon: "tabler-file-dollar",
    title: "Invoice App",
    subtitle: "Manage Accounts",
  },
  {
    url: "/apps/user/list",
    icon: "tabler-user",
    title: "Users",
    subtitle: "Manage Users",
  },
  {
    url: "/apps/roles",
    icon: "tabler-users-group",
    title: "Role Management",
    subtitle: "Permissions",
  },
  {
    url: "/",
    icon: "tabler-device-desktop-analytics",
    title: "Dashboard",
    subtitle: "User Dashboard",
  },
  {
    url: "/pages/account-settings",
    icon: "tabler-settings",
    title: "Settings",
    subtitle: "Account Settings",
  },
];

const notifications: NotificationsType[] = [
  {
    avatarImage: "/images/avatars/8.png",
    title: "Congratulations Flora 🎉",
    subtitle: "Won the monthly bestseller gold badge",
    time: "1h ago",
    read: false,
  },
  {
    title: "Cecilia Becker",
    avatarColor: "secondary",
    subtitle: "Accepted your connection",
    time: "12h ago",
    read: false,
  },
  {
    avatarImage: "/images/avatars/3.png",
    title: "Bernard Woods",
    subtitle: "You have new message from Bernard Woods",
    time: "May 18, 8:26 AM",
    read: true,
  },
  {
    avatarIcon: "tabler-chart-bar",
    title: "Monthly report generated",
    subtitle: "July month financial report is generated",
    avatarColor: "info",
    time: "Apr 24, 10:30 AM",
    read: true,
  },
  {
    avatarText: "MG",
    title: "Application has been approved 🚀",
    subtitle: "Your Meta Gadgets project application has been approved.",
    avatarColor: "success",
    time: "Feb 17, 12:17 PM",
    read: true,
  },
  {
    avatarIcon: "tabler-mail",
    title: "New message from Harry",
    subtitle: "You have new message from Harry",
    avatarColor: "error",
    time: "Jan 6, 1:48 PM",
    read: true,
  },
];

const NavbarChatContent = memo(
  ({
    handleSidebarToggleChat,
    sidebarOpen,
  }: {
    handleSidebarToggleChat: () => void;
    sidebarOpen: boolean;
  }) => {
    const { t } = useTranslation();
    const { lang: locale } = useParams();
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

    // Settings drawer state
    const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

    // Check if we're on the chat page
    const isChatPage = pathname?.includes("/apps/chat");

    // Get active thread from Redux store
    const activeThread = useSelector(
      (state: RootState) => state.chatReducer.activeThread
    );

    // Handle sidebar toggle via custom event
    const handleSidebarToggle = useCallback(() => {
      const event = new CustomEvent("toggle-chat-sidebar");
      window.dispatchEvent(event);
    }, []);

    // Handle settings drawer toggle
    const handleSettingsToggle = useCallback(() => {
      setSettingsDrawerOpen((prev) => !prev);
    }, []);

    // Handle settings drawer close
    const handleSettingsClose = useCallback(() => {
      setSettingsDrawerOpen(false);
    }, []);

    // Responsive logo size
    const logoSize = isMobile ? 32 : isTablet ? 36 : 40;
    const isDark = theme.palette.mode === "dark";

    return (
      <>
        <div
          className={classnames(
            verticalLayoutClasses.navbarContent,
            "grid grid-cols-3 items-center is-full px-3 sm:px-4 md:px-6"
          )}
          style={{
            gridTemplateColumns: "1fr auto 1fr",
          }}
        >
          {/* START SECTION - History icon (opens sidebar) */}
          <div className="flex items-center gap-2 sm:gap-3 justify-start min-w-0">
            <Tooltip
              title={t("chat.history") || "سجل المحادثات"}
              arrow
            >
              <IconButton
                onClick={handleSidebarToggleChat}
                size="small"
                aria-label="chat history"
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  backgroundColor: isDark ? "#6948B8" : "#ffffff",
                  borderRadius: "11.429px",
                  width: { xs: "36px", sm: "40px" },
                  height: { xs: "36px", sm: "40px" },
                  boxShadow: "0 2px 6px 0 rgba(0,0,0,0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease-in-out",
                  color: isDark ? "#ffffff" : "#5531A8",
                  "&:hover": {
                    backgroundColor: isDark ? "#7a5ac9" : "#f5f5f5",
                    transform: "scale(1.05)",
                  },
                }}
              >
                {/* History SVG icon provided by design */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 12C3 13.78 3.52784 15.5201 4.51677 17.0001C5.50571 18.4802 6.91131 19.6337 8.55585 20.3149C10.2004 20.9961 12.01 21.1743 13.7558 20.8271C15.5016 20.4798 17.1053 19.6226 18.364 18.364C19.6226 17.1053 20.4798 15.5016 20.8271 13.7558C21.1743 12.01 20.9961 10.2004 20.3149 8.55585C19.6337 6.91131 18.4802 5.50571 17.0001 4.51677C15.5201 3.52784 13.78 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8M3 8V3M3 8H8M12 7V12L16 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </Tooltip>
          </div>

          {/* CENTER SECTION - Logo */}
          <div className="flex items-center justify-center flex-shrink-0">
            <Link
              href={getLocalizedUrl("/", locale as Locale)}
              className="flex items-center gap-2 sm:gap-3 no-underline hover:opacity-80 transition-opacity duration-200"
            >
              <Logo
                height={logoSize}
                width={logoSize}
              />
              <Typography
                variant="h6"
                className="hidden sm:block font-bold text-[18px] sm:text-[20px] md:text-[24px] text-secondary"
                sx={{ mt: { sm: 1, md: 0.5 } }}
              >
                Teacher Ai
              </Typography>
            </Link>
          </div>

          {/* END SECTION - Hamburger menu */}
          <div className="flex items-center gap-1 sm:gap-2 justify-end min-w-0">
            <Tooltip
              title={t("chat.menu") || "القائمة"}
              arrow
            >
              <IconButton
                onClick={handleSettingsToggle}
                size="small"
                aria-label="menu"
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  backgroundColor: isDark ? "#6948B8" : "#ffffff",
                  borderRadius: "11.429px",
                  width: { xs: "36px", sm: "40px" },
                  height: { xs: "36px", sm: "40px" },
                  boxShadow: "0 2px 6px 0 rgba(0,0,0,0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease-in-out",
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: isDark ? "#7a5ac9" : "#f5f5f5",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <i className="tabler-menu-2 text-xl" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <SettingsDrawer
          open={settingsDrawerOpen}
          onClose={handleSettingsClose}
        />
      </>
    );
  }
);

NavbarChatContent.displayName = "NavbarChatContent";

export default NavbarChatContent;

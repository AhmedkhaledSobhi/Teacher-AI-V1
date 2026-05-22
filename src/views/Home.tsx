"use client";

// React Imports
import { useState } from "react";

// Next Imports
import { useParams, useRouter } from "next/navigation";

// Auth Imports
import { useUser } from "@/hooks/useUser";

// MUI Imports
import { useColorScheme } from "@mui/material";

// Type Imports
import type { SystemMode } from "@core/types";
import type { getDictionary } from "@/utils/getDictionary";
import type { Locale } from "@configs/i18n";

// Util Imports
import { getLocalizedUrl } from "@/utils/i18n";

// Component Imports
import ChatSection from "@/components/home/ChatSection";
import ActionCard from "@/components/home/ActionCard";
import ConversationsSection from "@/components/home/ConversationsSection";
import { getGradeName } from "@/components/layout/shared/UserDropdown";

// ─── Icon SVGs ────────────────────────────────────────────────────────────────

const GamepadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="44"
    height="44"
    viewBox="0 0 22 22"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5.50024 10.083H9.16691"
      stroke="#C8973A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.3335 8.25V11.9167"
      stroke="#C8973A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.7495 11H13.7597"
      stroke="#C8973A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.499 9.16602H16.5092"
      stroke="#C8973A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.8761 4.58301H6.12276C5.21552 4.58322 4.34057 4.91977 3.66704 5.5276C2.99352 6.13543 2.56926 6.97138 2.47626 7.87384C2.47076 7.92151 2.4671 7.96642 2.46068 8.01317C2.38643 8.63101 1.83276 13.251 1.83276 14.6663C1.83276 15.3957 2.1225 16.0952 2.63822 16.6109C3.15395 17.1266 3.85342 17.4163 4.58276 17.4163C5.49943 17.4163 5.95776 16.958 6.4161 16.4997L7.71226 15.2035C8.056 14.8597 8.52224 14.6664 9.00843 14.6663H12.9904C13.4766 14.6664 13.9429 14.8597 14.2866 15.2035L15.5828 16.4997C16.0411 16.958 16.4994 17.4163 17.4161 17.4163C18.1454 17.4163 18.8449 17.1266 19.3606 16.6109C19.8764 16.0952 20.1661 15.3957 20.1661 14.6663C20.1661 13.2501 19.6124 8.63101 19.5382 8.01317C19.5318 7.96734 19.5281 7.92151 19.5226 7.87476C19.4298 6.97213 19.0056 6.13596 18.3321 5.52794C17.6586 4.91992 16.7835 4.58324 15.8761 4.58301Z"
      stroke="#C8973A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <path
      d="M7 11V7a5 5 0 0110 0v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const StarDecor = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
      fill={color}
    />
  </svg>
);

const PencilIcon = ({ isDark }: { isDark: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
  >
    <path
      d="M21.4078 6.06204L19.4283 8.04158C19.3808 8.09039 19.324 8.12919 19.2612 8.15568C19.1985 8.18218 19.131 8.19583 19.0629 8.19583C18.9948 8.19583 18.9274 8.18218 18.8647 8.15568C18.8019 8.12919 18.7451 8.09039 18.6976 8.04158L13.9229 3.31787C13.8741 3.27037 13.8353 3.21357 13.8088 3.15082C13.7823 3.08808 13.7687 3.02066 13.7687 2.95255C13.7687 2.88444 13.7823 2.81702 13.8088 2.75427C13.8353 2.69152 13.8741 2.63472 13.9229 2.58722L15.9025 0.599185C16.2919 0.21524 16.8169 0 17.3638 0C17.9107 0 18.4356 0.21524 18.825 0.599185L21.3738 3.14795C21.569 3.33615 21.7248 3.56123 21.8323 3.81013C21.9397 4.05903 21.9967 4.3268 21.9999 4.59789C22.003 4.86899 21.9523 5.13801 21.8507 5.38935C21.749 5.64069 21.5985 5.86934 21.4078 6.06204ZM17.7291 9.01861L12.9544 4.24392C12.9069 4.19511 12.8501 4.15631 12.7873 4.12982C12.7246 4.10333 12.6572 4.08968 12.5891 4.08968C12.521 4.08968 12.4535 4.10333 12.3908 4.12982C12.328 4.15631 12.2712 4.19511 12.2237 4.24392L0.924211 15.535L0.015151 20.7599C-0.0131352 20.9235 -0.00170012 21.0916 0.0484944 21.2498C0.098689 21.4081 0.186174 21.552 0.303584 21.6694C0.420993 21.7868 0.564891 21.8743 0.723165 21.9245C0.881439 21.9747 1.04946 21.9861 1.21307 21.9578L6.43804 21.0403L17.7291 9.74926C17.7779 9.70175 17.8167 9.64495 17.8432 9.58221C17.8697 9.51946 17.8833 9.45204 17.8833 9.38393C17.8833 9.31582 17.8697 9.2484 17.8432 9.18566C17.8167 9.12291 17.7779 9.06611 17.7291 9.01861ZM5.83483 19.7489L3.05668 20.2332L1.72282 18.8993L2.20709 16.1212H3.78732V18.1857H5.85183L5.83483 19.7489ZM12.793 7.94813L6.16617 14.5664C6.05054 14.6629 5.90303 14.7126 5.75262 14.7058C5.60221 14.699 5.45978 14.6362 5.35331 14.5297C5.24685 14.4232 5.18405 14.2808 5.17725 14.1304C5.17046 13.98 5.22015 13.8325 5.31658 13.7168L11.9434 7.09854C12.059 7.00211 12.2065 6.95241 12.3569 6.95921C12.5073 6.966 12.6498 7.0288 12.7562 7.13527C12.8627 7.24173 12.9255 7.38416 12.9323 7.53457C12.9391 7.68498 12.8894 7.8325 12.793 7.94813Z"
      fill={isDark ? "#D4BDFF" : "#5531A8"}
    />
  </svg>
);

const ChartIcon = ({ isDark }: { isDark: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="23"
    height="23"
    viewBox="0 0 23 23"
    fill="none"
  >
    <path
      d="M21.6 20.4632H2.27368V1.13684C2.27368 0.835333 2.15391 0.546172 1.94071 0.332973C1.72751 0.119774 1.43835 0 1.13684 0C0.835333 0 0.546172 0.119774 0.332973 0.332973C0.119774 0.546172 0 0.835333 0 1.13684V21.6C0 21.9015 0.119774 22.1907 0.332973 22.4039C0.546172 22.6171 0.835333 22.7368 1.13684 22.7368H21.6C21.9015 22.7368 22.1907 22.6171 22.4039 22.4039C22.6171 22.1907 22.7368 21.9015 22.7368 21.6C22.7368 21.2985 22.6171 21.0093 22.4039 20.7961C22.1907 20.5829 21.9015 20.4632 21.6 20.4632Z"
      fill={isDark ? "#DC64C9" : "#DC64C9"}
    />
    <path
      d="M6.82105 17.0535V11.3693C6.82105 11.0678 6.70127 10.7786 6.48807 10.5654C6.27487 10.3522 5.98571 10.2324 5.68421 10.2324C5.3827 10.2324 5.09354 10.3522 4.88034 10.5654C4.66714 10.7786 4.54736 11.0678 4.54736 11.3693V17.0535C4.54736 17.355 4.66714 17.6442 4.88034 17.8574C5.09354 18.0706 5.3827 18.1903 5.68421 18.1903C5.98571 18.1903 6.27487 18.0706 6.48807 17.8574C6.70127 17.6442 6.82105 17.355 6.82105 17.0535ZM11.3684 17.0535V6.82191C11.3684 6.5204 11.2486 6.23124 11.0354 6.01804C10.8222 5.80484 10.5331 5.68506 10.2316 5.68506C9.93006 5.68506 9.6409 5.80484 9.42771 6.01804C9.21451 6.23124 9.09473 6.5204 9.09473 6.82191V17.0535C9.09473 17.355 9.21451 17.6442 9.42771 17.8574C9.6409 18.0706 9.93006 18.1903 10.2316 18.1903C10.5331 18.1903 10.8222 18.0706 11.0354 17.8574C11.2486 17.6442 11.3684 17.355 11.3684 17.0535ZM15.9158 17.0535V4.54822C15.9158 4.24671 15.796 3.95755 15.5828 3.74435C15.3696 3.53115 15.0805 3.41138 14.7789 3.41138C14.4774 3.41138 14.1883 3.53115 13.9751 3.74435C13.7619 3.95755 13.6421 4.24671 13.6421 4.54822V17.0535C13.6421 17.355 13.7619 17.6442 13.9751 17.8574C14.1883 18.0706 14.4774 18.1903 14.7789 18.1903C15.0805 18.1903 15.3696 18.0706 15.5828 17.8574C15.796 17.6442 15.9158 17.355 15.9158 17.0535ZM20.4632 17.0535V2.27454C20.4632 1.97303 20.3434 1.68387 20.1302 1.47067C19.917 1.25747 19.6278 1.1377 19.3263 1.1377C19.0248 1.1377 18.7356 1.25747 18.5224 1.47067C18.3092 1.68387 18.1895 1.97303 18.1895 2.27454V17.0535C18.1895 17.355 18.3092 17.6442 18.5224 17.8574C18.7356 18.0706 19.0248 18.1903 19.3263 18.1903C19.6278 18.1903 19.917 18.0706 20.1302 17.8574C20.3434 17.6442 20.4632 17.355 20.4632 17.0535Z"
      fill={isDark ? "#DC64C9" : "#DC64C9"}
    />
  </svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

type HomeProps = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

// ─── View ─────────────────────────────────────────────────────────────────────

const Home = ({ mode, dictionary }: HomeProps) => {
  const { lang } = useParams();
  const router = useRouter();
  const { user: sessionUser } = useUser();
  const session = sessionUser ? { user: sessionUser } : null;
  const locale = Array.isArray(lang) ? lang[0] : (lang ?? "ar");
  // Derive live mode from MUI color scheme (updates on toggle), fall back to SSR prop
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme();
  const resolvedMode = muiMode === "system" ? muiSystemMode : (muiMode ?? mode);
  const isDark = resolvedMode === "dark";
  const d = dictionary.home;

  const sessionGradeId = (session?.user as any)?.grade_id;
  const gradeLabel = sessionGradeId
    ? getGradeName(sessionGradeId)
    : (d.grade_label ?? "");

  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subtitleColor = isDark ? "#D4BDFF" : "#5531A8";
  const gradeColor = isDark ? "#DC64C9" : "#DC64C9";
  const fontFamily =
    locale === "ar" ? '"Readex Pro", sans-serif' : '"Baloo 2", sans-serif';

  const [gamesHovered, setGamesHovered] = useState(false);

  const gamesBg = isDark
    ? "linear-gradient(135deg, rgba(245, 200, 66, 0.25) 0%, rgba(232, 200, 74, 0.20) 100%)"
    : "linear-gradient(135deg, #FFF5D6 0%, #FFFAEB 100%)";
  const gamesText = isDark ? "#F5C842" : "#D4A012";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--mui-palette-background-default)",
        position: "relative",
      }}
      dir="rtl"
    >
      {/* Clean solid background - no decorative elements */}

      <div
        className="md:py-12 py-6 px-4 sm:px-6 mx-auto"
        style={{
          maxWidth: "1128px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Greeting header — centered like the image */}
        <header style={{ textAlign: "start" }}>
          <h1
            style={{
              fontFamily: fontFamily,
              fontSize: "clamp(28px, 4.5vw, 54px)",
              fontWeight: 700,
              color: titleColor,
              lineHeight: "150%",
              marginBottom: "8px",
            }}
          >
            {d.greeting_prefix}{" "}
            <span style={{ color: gradeColor }}>{gradeLabel}</span>
            {d.greeting_suffix}
          </h1>
          <p
            style={{
              fontFamily: fontFamily,
              fontSize: "clamp(16px, 2.5vw, 31px)",
              fontWeight: 400,
              color: subtitleColor,
              lineHeight: "150%",
            }}
          >
            {d.greeting_subtitle}
          </p>
        </header>

        {/* AI Teacher hero card */}
        <ChatSection
          isDark={isDark}
          locale={locale}
          dictionary={dictionary}
        />

        {/* Action cards grid */}
        <div className="home-action-grid">
          {/* Exams card — purple accent */}
          <ActionCard
            icon={<PencilIcon isDark={isDark} />}
            title={d.exams_title}
            description={d.exams_description}
            iconBg={
              isDark ? "rgba(105, 72, 184, 0.25)" : "rgba(105, 72, 184, 0.10)"
            }
            hoverBorderColor="#6948B8"
            decorCircleColor={
              isDark ? "rgba(105, 72, 184, 0.20)" : "rgba(105, 72, 184, 0.08)"
            }
            isDark={isDark}
            locale={locale}
            onClick={() =>
              router.push(getLocalizedUrl("/apps/quiz", locale as Locale))
            }
          />
          {/* Stats card — pink/rose accent */}
          <ActionCard
            icon={<ChartIcon isDark={isDark} />}
            title={d.stats_title}
            description={d.stats_description}
            iconBg={
              isDark ? "rgba(220, 100, 201, 0.25)" : "rgba(220, 100, 201, 0.12)"
            }
            hoverBorderColor="#DC64C9"
            decorCircleColor={
              isDark ? "rgba(220, 100, 201, 0.20)" : "rgba(220, 100, 201, 0.10)"
            }
            isDark={isDark}
            locale={locale}
            onClick={() =>
              router.push(getLocalizedUrl("/apps/statistics", locale as Locale))
            }
          />
        </div>

        {/* Games — coming soon wide card */}
        <div
          onClick={() =>
            router.push(getLocalizedUrl("/apps/games", locale as Locale))
          }
          role="button"
          tabIndex={0}
          className="home-games-card"
          onMouseEnter={() => setGamesHovered(true)}
          onMouseLeave={() => setGamesHovered(false)}
          style={{
            borderRadius: "24px",
            background: gamesBg,
            padding: "32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            direction: "rtl",
            position: "relative",
            overflow: "hidden",
            height: "220px",
            minHeight: "220px",
            gap: "16px",
            cursor: "pointer",
            border: gamesHovered
              ? `1.5px solid ${isDark ? "rgba(245,193,75,0.45)" : "rgba(200,151,58,0.45)"}`
              : "1.5px solid transparent",
            boxShadow: gamesHovered
              ? `0 8px 40px 0 ${isDark ? "rgba(245,193,75,0.15)" : "rgba(200,151,58,0.18)"}`
              : "0 2px 16px 0 rgba(0,0,0,0.06)",
            transform: gamesHovered ? "translateY(-3px)" : "translateY(0)",
            transition:
              "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease",
          }}
        >
          {/* FIRST in DOM = visual RIGHT in RTL: title + subtitle */}
          <div style={{ flex: 1, textAlign: "right" }}>
            <h3
              style={{
                fontFamily: fontFamily,
                fontSize: "clamp(22px, 3vw, 40px)",
                fontWeight: 700,
                color: isDark ? "#F5C842" : "#D4A012",
                lineHeight: "150%",
                margin: "0 0 8px",
              }}
            >
              {d.games_title}
            </h3>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: "clamp(13px, 1.5vw, 17px)",
                fontWeight: 400,
                color: isDark ? "#E8C84A" : "#B8920F",
                lineHeight: "150%",
                margin: 0,
              }}
            >
              {d.games_subtitle}
            </p>
          </div>

          {/* SECOND: star decorations (center filler) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              alignItems: "center",
              opacity: 0.55,
              flexShrink: 0,
            }}
          >
            <StarDecor
              size={20}
              color={isDark ? "#F5C842" : "#D4A012"}
            />
            <StarDecor
              size={26}
              color={isDark ? "#F5C842" : "#D4A012"}
            />
            <StarDecor
              size={20}
              color={isDark ? "#F5C842" : "#D4A012"}
            />
          </div>

          {/* LAST in DOM = visual LEFT in RTL: badge + gamepad + lock */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              position: "relative",
              flexShrink: 0,
              minWidth: "80px",
            }}
          >
            {/* "قريباً!" badge — top-left of this column */}
            <span
              style={{
                position: "absolute",
                top: "-14px",
                right: "-8px",
                background: "#F5A623",
                color: "#FFF",
                fontFamily: fontFamily,
                fontSize: "13px",
                fontWeight: 700,
                padding: "3px 12px",
                borderRadius: "100px",
                whiteSpace: "nowrap",
                zIndex: 2,
              }}
            >
              {d.games_badge}
            </span>

            {/* Gamepad icon box */}
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "20px",
                background: isDark
                  ? "rgba(200,151,58,0.22)"
                  : "rgba(200,151,58,0.20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GamepadIcon />
            </div>

            {/* Lock icon */}
            <LockIcon color={gamesText} />
          </div>
        </div>

        {/* Previous conversations */}
        <ConversationsSection isDark={isDark} />

        {/* Footer */}
        <footer
          style={{
            paddingBottom: "24px",
            textAlign: "center",
            fontFamily: fontFamily,
            fontSize: "clamp(14px, 1.5vw, 17px)",
            fontWeight: 500,
            color: subtitleColor,
            lineHeight: "150%",
          }}
        >
          {d.footer_text}
        </footer>
      </div>
    </div>
  );
};

export default Home;

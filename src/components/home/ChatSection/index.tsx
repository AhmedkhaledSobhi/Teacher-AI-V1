"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { getDictionary } from "@/utils/getDictionary";

// ─── Robot mascot — eyes blink every 10 s ────────────────────────────────────

const RobotMascot = ({ isDark }: { isDark: boolean }) => {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 300);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const eyeStyle: React.CSSProperties = {
    transition: "transform 0.15s ease",
    transformOrigin: "center",
    transform: blinking ? "scaleY(0.08)" : "scaleY(1)",
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="186"
      viewBox="0 0 107 100"
      fill="none"
      aria-label="AI teacher robot mascot"
    >
      {/* Neck / body */}
      <path
        d="M75.1166 100H56.4011C46.7274 100 38.8887 92.1613 38.8887 82.4876V60.3267H68.0203V88.24C68.1497 89.9037 68.7055 93.9582 71.8502 97.377C72.958 98.58 74.1268 99.4214 75.1166 100Z"
        fill="url(#paint0_rob)"
      />
      <path
        opacity="0.25"
        d="M43.2861 62.1731C43.5031 69.14 43.7201 76.107 43.9371 83.0739C44.1656 90.1931 47.4777 96.2844 52.7695 98.6638C54.022 99.2272 55.6743 99.9087 58.5486 99.7336C56.6908 99.3529 55.8266 98.679 55.0081 98.1612C49.4916 94.6892 48.2543 87.2198 47.7518 84.2008C47.6566 83.6183 47.5919 83.131 47.5538 82.815C47.2835 75.9699 47.0171 69.1248 46.7468 62.2797L43.2861 62.1731Z"
        fill="black"
      />
      <path
        opacity="0.25"
        d="M68.0203 65.9573C63.5889 66.5131 58.712 66.8671 53.4545 66.8671C49.0002 66.8671 44.1234 66.6121 38.8887 65.9573V60.6388H68.0203V65.9573Z"
        fill="black"
      />
      {/* Head outer */}
      <path
        d="M53.5116 22.9566H53.4545C40.0003 22.9566 27.5627 23.7866 16.3242 25.0657V33.9476C16.3242 49.5946 29.2378 62.2797 45.1665 62.2797H61.7348C77.6635 62.2797 90.5771 49.5946 90.5771 33.9476V25.0734C79.3577 23.7904 66.9429 22.9566 53.5078 22.9528L53.5116 22.9566Z"
        fill="url(#paint1_rob)"
      />
      {/* Head inner */}
      <path
        d="M83.4014 21.411V34.1913C83.4014 45.7076 72.9853 55.0425 60.1365 55.0425H46.7737C33.9211 55.0425 23.5088 45.7076 23.5088 34.1913V21.4034C32.5734 20.4592 42.605 19.8501 53.4589 19.8501H53.5046C64.3395 19.8539 74.3559 20.4668 83.4052 21.411H83.4014Z"
        fill="#3E256B"
      />
      <path
        opacity="0.25"
        d="M90.581 25.0885V29.6151C80.2867 27.7572 67.7463 26.2915 53.4546 26.2877C39.1629 26.2877 26.6186 27.7458 16.3281 29.5998V25.0771C20.6986 24.4793 26.7709 23.775 34.0614 23.3448C40.5334 22.9641 45.2503 22.9603 53.0624 22.9565C61.1067 22.9527 66.0978 22.9489 72.882 23.3486C80.2144 23.7827 86.2866 24.4946 90.5848 25.0847L90.581 25.0885Z"
        fill="black"
      />
      {/* Left eye */}
      <g style={eyeStyle}>
        <path
          d="M46.5563 35.0288C46.4116 43.6594 33.757 43.6556 33.6123 35.0288C33.757 26.3982 46.4116 26.402 46.5563 35.0288Z"
          fill="white"
        />
      </g>
      {/* Right eye */}
      <g style={eyeStyle}>
        <path
          d="M73.4684 35.0289C73.3237 43.6595 60.6691 43.6557 60.5244 35.0289C60.6691 26.3983 73.3237 26.4021 73.4684 35.0289Z"
          fill="white"
        />
      </g>
      {/* Smile */}
      <path
        d="M57.2918 44.1202H57.2195C56.8464 44.1202 56.5076 44.3677 56.3857 44.7217C56.0698 45.6278 55.4949 46.355 54.7906 46.7509C54.4099 46.9641 53.9835 47.0859 53.5419 47.0859C53.1002 47.0859 52.6739 46.9641 52.2931 46.7509C51.585 46.3511 51.014 45.6278 50.698 44.7217C50.5762 44.3677 50.2373 44.1202 49.8642 44.1202H49.7919C49.1561 44.1354 48.6308 44.6532 48.627 45.289V45.3004C48.627 46.4654 49.2285 47.5123 50.1993 48.2471C51.0749 48.9171 52.2513 49.3245 53.5419 49.3245C54.8325 49.3245 56.0088 48.9171 56.8845 48.2471C57.8515 47.5123 58.4568 46.4654 58.4568 45.3004V45.289C58.4568 44.6532 57.9276 44.1354 57.2918 44.1202Z"
        fill="white"
      />
      {/* Hat */}
      <path
        d="M106.91 11.642C106.91 19.7967 99.9277 26.1241 91.9481 25.2294C80.3061 23.9236 67.4496 23.0822 53.5653 23.0784C39.5934 23.0746 26.6646 23.916 14.9617 25.2294C6.97834 26.1241 0 19.7967 0 11.642V4.47712C15.095 1.9302 33.1557 -0.00759176 53.5615 2.23607e-05C73.876 0.00763648 91.8605 1.93782 106.906 4.47712V11.642H106.91Z"
        fill="url(#paint2_rob)"
      />
      <defs>
        <linearGradient
          id="paint0_rob"
          x1="38.8163"
          y1="60.3952"
          x2="76.7689"
          y2="98.3478"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0.2"
            stopColor="#6948B8"
          />
          <stop
            offset="1"
            stopColor="#BDA4F2"
          />
        </linearGradient>
        <linearGradient
          id="paint1_rob"
          x1="53.4545"
          y1="67.1185"
          x2="53.4545"
          y2="38.4894"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DC64C9" />
          <stop
            offset="1"
            stopColor="#5531A8"
          />
        </linearGradient>
        <linearGradient
          id="paint2_rob"
          x1="0"
          y1="12.6585"
          x2="106.91"
          y2="12.6585"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0.19"
            stopColor="#6948B8"
          />
          <stop
            offset="1"
            stopColor="#BDA4F2"
          />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ─── Decorative icons — opacity pulses every 5 s ──────────────────────────────

const HeartIcon = ({
  filled,
  size = 28,
}: {
  filled: boolean;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size * (24 / 28)}
    viewBox="0 0 28 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      style={{ transition: "opacity 0.6s ease" }}
      opacity={filled ? 1 : 0.15}
      d="M28.0023 7.25852C28.0044 8.21082 27.8177 9.15411 27.4529 10.0338C27.0882 10.9135 26.5526 11.7121 25.8773 12.3835L14.7148 23.711C14.6217 23.8055 14.5108 23.8805 14.3885 23.9318C14.2662 23.983 14.1349 24.0093 14.0023 24.0093C13.8697 24.0093 13.7384 23.983 13.616 23.9318C13.4937 23.8805 13.3828 23.8055 13.2898 23.711L2.12727 12.3835C0.766373 11.0243 0.00117344 9.18011 1.34847e-06 7.25669C-0.00117074 5.33327 0.761781 3.48816 2.12102 2.12727C3.48025 0.766374 5.32443 0.00117347 7.24785 1.34854e-06C9.17127 -0.00117077 11.0164 0.761781 12.3773 2.12102L14.0023 3.63977L15.6385 2.11602C16.6541 1.1055 17.9463 0.418521 19.3519 0.141804C20.7576 -0.134913 22.2138 0.0110387 23.5365 0.561233C24.8593 1.11143 25.9895 2.0412 26.7843 3.23317C27.5791 4.42514 28.0029 5.82586 28.0023 7.25852Z"
      fill="#DC64C9"
    />
  </svg>
);

const SparkleIcon = ({
  filled,
  size = 32,
}: {
  filled: boolean;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <path
      style={{ transition: "opacity 0.6s ease" }}
      opacity={filled ? 1 : 0.15}
      d="M31.9999 15.9951C32.0036 16.464 31.861 16.9224 31.5921 17.3066C31.3232 17.6907 30.9413 17.9815 30.4995 18.1386L21.4339 21.4353L18.1386 30.4995C17.9762 30.937 17.6838 31.3144 17.3006 31.5809C16.9174 31.8474 16.4619 31.9903 15.9951 31.9903C15.5284 31.9903 15.0728 31.8474 14.6897 31.5809C14.3065 31.3144 14.014 30.937 13.8516 30.4995L10.5563 21.4339L1.49077 18.1386C1.0532 17.9762 0.675825 17.6838 0.409333 17.3006C0.142841 16.9174 0 16.4619 0 15.9951C0 15.5284 0.142841 15.0728 0.409333 14.6897C0.675825 14.3065 1.0532 14.014 1.49077 13.8516L10.5563 10.5563L13.8516 1.49077C14.014 1.0532 14.3065 0.675825 14.6897 0.409333C15.0728 0.142841 15.5284 0 15.9951 0C16.4619 0 16.9174 0.142841 17.3006 0.409333C17.6838 0.675825 17.9762 1.0532 18.1386 1.49077L21.4353 10.5563L30.4995 13.8516C30.9413 14.0087 31.3232 14.2995 31.5921 14.6837C31.861 15.0678 32.0036 15.5262 31.9999 15.9951Z"
      fill="#DC64C9"
    />
  </svg>
);

// ─── Props ────────────────────────────────────────────────────────────────────

type ChatSectionProps = {
  isDark: boolean;
  locale: string;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

// ─── Component ────────────────────────────────────────────────────────────────

const ChatSection = ({ isDark, locale, dictionary }: ChatSectionProps) => {
  const d = dictionary.home;
  const fontFamily = locale === "ar" ? '"Readex Pro", sans-serif' : '"Baloo 2", sans-serif';

  const [decorFilled, setDecorFilled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setDecorFilled((prev) => !prev), 5000);
    return () => clearInterval(interval);
  }, []);

  const cardBg = isDark ? "#3E256B" : "#FFFFFF";
  const titleColor = isDark ? "#F5F0FF" : "#3E256B";
  const subtitleColor = isDark ? "#D4BDFF" : "#5531A8";
  const badgeBg = isDark
    ? "rgba(105, 72, 184, 0.20)"
    : "rgba(105, 72, 184, 0.10)";
  const badgeBorder = isDark
    ? "rgba(105, 72, 184, 0.40)"
    : "rgba(105, 72, 184, 0.20)";
  const badgeColor = "#6948B8";

  return (
    <section
      className="home-hero-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: cardBg,
        borderRadius: "32px",
        border: hovered
          ? "1.5px solid rgba(105, 72, 184, 0.55)"
          : "1.5px solid rgba(0,0,0,0.05)",
        boxShadow: hovered
          ? "0 8px 40px 0 rgba(105, 72, 184, 0.20)"
          : "0 2px 16px 0 rgba(0, 0, 0, 0.08)",
        padding: "40px 48px",
        overflow: "hidden",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        minHeight: "342px",
      }}
    >
      {/* RTL row: text on right, robot on left */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
          direction: "rtl",
        }}
      >
        {/* Right side — all content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "16px",
            textAlign: "right",
          }}
        >
          {/* "جاهز للمس��عدة" badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              borderRadius: "100px",
              border: `1px solid ${badgeBorder}`,
              background: badgeBg,
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "42px",
                backgroundColor: "rgba(57, 200, 112, 0.70)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: fontFamily,
                fontSize: "18px",
                fontWeight: 700,
                color: badgeColor,
                lineHeight: "150%",
              }}
            >
              {d.ready_badge}
            </span>
          </div>

          {/* H2 title */}
          <h2
            style={{
              fontFamily: fontFamily,
              fontSize: "clamp(24px, 3.5vw, 45px)",
              fontWeight: 700,
              color: titleColor,
              lineHeight: "150%",
              margin: 0,
              textAlign: "right",
            }}
          >
            {d.hero_title}
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: fontFamily,
              fontSize: "clamp(14px, 1.5vw, 18px)",
              fontWeight: 500,
              color: subtitleColor,
              lineHeight: "150%",
              margin: 0,
              textAlign: "right",
            }}
          >
            {d.hero_subtitle}
          </p>

          {/* CTA button */}
          <Link
            href={`/${locale}/apps/journey`}
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                height: "56px",
                padding: "0 36px",
                borderRadius: "16px",
                background: "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)",
                border: "none",
                cursor: "pointer",
                fontFamily: fontFamily,
                fontSize: "22px",
                fontWeight: 700,
                color: "#F5F0FF",
                lineHeight: "150%",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M31.9999 15.9951C32.0036 16.464 31.861 16.9224 31.5921 17.3066C31.3232 17.6907 30.9413 17.9815 30.4995 18.1386L21.4339 21.4353L18.1386 30.4995C17.9762 30.937 17.6838 31.3144 17.3006 31.5809C16.9174 31.8474 16.4619 31.9903 15.9951 31.9903C15.5284 31.9903 15.0728 31.8474 14.6897 31.5809C14.3065 31.3144 14.014 30.937 13.8516 30.4995L10.5563 21.4339L1.49077 18.1386C1.0532 17.9762 0.675825 17.6838 0.409333 17.3006C0.142841 16.9174 0 16.4619 0 15.9951C0 15.5284 0.142841 15.0728 0.409333 14.6897C0.675825 14.3065 1.0532 14.014 1.49077 13.8516L10.5563 10.5563L13.8516 1.49077C14.014 1.0532 14.3065 0.675825 14.6897 0.409333C15.0728 0.142841 15.5284 0 15.9951 0C16.4619 0 16.9174 0.142841 17.3006 0.409333C17.6838 0.675825 17.9762 1.0532 18.1386 1.49077L21.4353 10.5563L30.4995 13.8516C30.9413 14.0087 31.3232 14.2995 31.5921 14.6837C31.861 15.0678 32.0036 15.5262 31.9999 15.9951Z"
                  fill="#F5F0FF"
                />
              </svg>
              {d.hero_cta}
            </button>
          </Link>
        </div>

        {/* Left side — robot with 4 decorative icons */}
        <div
          className="home-hero-robot"
          style={{
            position: "relative",
            flexShrink: 0,
            width: "220px",
            height: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Top-right: small heart */}
          <span style={{ position: "absolute", top: "75px", right: "-30px" }}>
            <HeartIcon
              filled={decorFilled}
              size={22}
            />
          </span>
          {/* Bottom-right: large sparkle */}
          <span style={{ position: "absolute", bottom: "55px", right: "-5px" }}>
            <SparkleIcon
              filled={decorFilled}
              size={28}
            />
          </span>
          {/* Bottom-left: small heart */}
          <span style={{ position: "absolute", bottom: "60px", left: "14px" }}>
            <HeartIcon
              filled={decorFilled}
              size={20}
            />
          </span>
          {/* Top-left: small sparkle */}
          <span style={{ position: "absolute", bottom: "15px", left: "-16px" }}>
            <SparkleIcon
              filled={decorFilled}
              size={22}
            />
          </span>

          <RobotMascot isDark={isDark} />
        </div>
      </div>
    </section>
  );
};

export default ChatSection;

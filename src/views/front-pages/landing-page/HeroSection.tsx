"use client";

// React Imports
import { useEffect, useRef } from "react";

// Next Imports
import Image from "next/image";
import Link from "next/link";

// MUI Imports
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/material/styles";

// Hook Imports
import { useImageVariant } from "@/@core/hooks/useImageVariant";
import { useSettings } from "@/@core/hooks/useSettings";
import { useColorScheme } from "@mui/material";
import RobotMascot from "@/@core/components/RobotMascot";
import Logo from "@/@core/svg/Logo";

// SVG Icons
const CalcIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="52"
    height="52"
    viewBox="0 0 52 52"
    fill="none"
  >
    <g clip-path="url(#clip0_3542_24385)">
      <path
        d="M36.1515 4.8272L12.2376 6.5089C10.0364 6.6637 8.37744 8.57362 8.53224 10.7748L10.7745 42.6601C10.9293 44.8613 12.8392 46.5203 15.0404 46.3655L38.9544 44.6838C41.1556 44.529 42.8145 42.619 42.6598 40.4178L40.4175 8.53257C40.2627 6.33135 38.3528 4.6724 36.1515 4.8272Z"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16.7837 14.1993L32.7263 13.0782"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M33.8472 29.0236L34.4077 36.9949"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M33.2866 21.0509L33.3069 21.0495"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M25.3149 21.6095L25.3352 21.6081"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M17.3442 22.172L17.3645 22.1706"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M25.876 29.5782L25.8963 29.5768"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M17.9043 30.1368L17.9246 30.1354"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M26.4365 37.5509L26.4568 37.5495"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18.4653 38.1134L18.4856 38.112"
        stroke="#DC64C9"
        stroke-width="3.9955"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_3542_24385">
        <rect
          width="47.946"
          height="47.946"
          fill="white"
          transform="translate(0 3.3634) rotate(-4.02259)"
        />
      </clipPath>
    </defs>
  </svg>
);

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
  >
    <g clip-path="url(#clip0_3542_24397)">
      <path
        d="M33.956 10.9794C34.7423 10.1001 35.1471 8.94444 35.0813 7.76668C35.0155 6.58893 34.4846 5.48554 33.6053 4.69925C32.726 3.91295 31.5703 3.50817 30.3926 3.57394C29.2148 3.63971 28.1114 4.17065 27.3251 5.04996L7.47765 27.2559C7.13229 27.6411 6.88693 28.1053 6.76316 28.6076L5.06586 35.5799C5.03277 35.7185 5.0378 35.8633 5.0804 35.9992C5.12301 36.1351 5.2016 36.257 5.30785 36.3518C5.4141 36.4466 5.54404 36.5109 5.68389 36.5379C5.82373 36.5648 5.96826 36.5534 6.10214 36.5049L12.8432 34.0416C13.3282 33.8639 13.7621 33.57 14.1069 33.1855L33.956 10.9794Z"
        stroke="#39C870"
        stroke-width="3.15561"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M24.0708 8.6709L30.7249 14.6196"
        stroke="#39C870"
        stroke-width="3.15561"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_3542_24397">
        <rect
          width="37.8674"
          height="37.8674"
          fill="white"
          transform="translate(0 2.11621) rotate(-3.20354)"
        />
      </clipPath>
    </defs>
  </svg>
);

const BookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="63"
    height="63"
    viewBox="0 0 63 63"
    fill="none"
  >
    <g clip-path="url(#clip0_3542_24401)">
      <path
        d="M32.4155 19.3281L29.5902 53.1446"
        stroke="#CC6600"
        stroke-width="4.84775"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.45691 44.0822C7.81629 44.0286 7.22317 43.7228 6.80803 43.232C6.39289 42.7412 6.18974 42.1055 6.24326 41.4649L8.86679 10.0639C8.92032 9.42328 9.22613 8.83016 9.71697 8.41502C10.2078 7.99988 10.8434 7.79672 11.4841 7.85025L23.5614 8.8593C26.1238 9.07339 28.4963 10.2967 30.1569 12.26C31.8174 14.2233 32.6301 16.7659 32.416 19.3284C32.6301 16.7659 33.8533 14.3934 35.8167 12.7329C37.78 11.0723 40.3226 10.2597 42.8851 10.4738L54.9624 11.4828C55.603 11.5364 56.1961 11.8422 56.6112 12.333C57.0264 12.8238 57.2295 13.4595 57.176 14.1001L54.5525 45.5011C54.499 46.1417 54.1931 46.7348 53.7023 47.15C53.2115 47.5651 52.5758 47.7683 51.9352 47.7147L37.4424 46.5039C35.5206 46.3433 33.6137 46.9528 32.1411 48.1982C30.6686 49.4436 29.7512 51.223 29.5906 53.1448C29.7512 51.223 29.1417 49.316 27.8963 47.8435C26.6509 46.371 24.8715 45.4536 22.9497 45.293L8.45691 44.0822Z"
        stroke="#CC6600"
        stroke-width="4.84775"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_3542_24401">
        <rect
          width="58.173"
          height="58.173"
          fill="white"
          transform="translate(4.84351) rotate(4.77593)"
        />
      </clipPath>
    </defs>
  </svg>
);

const MouseScrollIcon = () => (
  <svg
    width="32"
    height="44"
    viewBox="0 0 32 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="30"
      height="42"
      rx="15"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.4"
    />
    <circle
      cx="16"
      cy="12"
      r="3"
      fill="currentColor"
      fillOpacity="0.6"
    >
      <animate
        attributeName="cy"
        values="10;18;10"
        dur="1.5s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.8;0.2;0.8"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const HeroSection = () => {
  const { settings } = useSettings();
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme();

  const isDark = (() => {
    const currentMode = muiMode === "system" ? muiSystemMode : muiMode;
    return currentMode === "dark";
  })();

  const isBelowMd = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const mascotLight = "/images/front-pages/mascot-light.jpg";
  const mascotDark = "/images/front-pages/mascot-dark.jpg";

  return (
    <section
      dir="rtl"
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{
        background: isDark ? "#1e0d45" : "#ede8f5",
      }}
    >
      {/* Hero content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-16 pt-16 pb-16 gap-8 md:gap-4">
        {/* ---- TEXT column (right side in RTL — order-1 on desktop) ---- */}
        <div className="relative flex items-center justify-center w-full md:w-1/2 order-2 md:order-2">
          {/* Floating icon cards */}

          {/* Calculator card - top left */}
          <div
            className="absolute auth-icon-float-1"
            style={{
              top: isBelowMd ? "0%" : "5%",
              left: isBelowMd ? "2%" : "5%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "89.29px",
                height: "89.29px",
                transform: "rotate(-4.023deg)",
                borderRadius: "17.963px",
                border: "1.403px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.10)",
                boxShadow:
                  "0 22.453px 28.067px -5.613px rgba(0,0,0,0.10), 0 8.981px 11.227px -6.736px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalcIcon />
            </div>
          </div>

          {/* Pencil card - top right */}
          <div
            className="absolute auth-icon-float-2"
            style={{
              top: isBelowMd ? "5%" : "10%",
              right: isBelowMd ? "2%" : "5%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "89.29px",
                height: "89.29px",
                transform: "rotate(-4.023deg)",
                borderRadius: "17.963px",
                border: "1.403px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.10)",
                boxShadow:
                  "0 22.453px 28.067px -5.613px rgba(0,0,0,0.10), 0 8.981px 11.227px -6.736px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PencilIcon />
            </div>
          </div>

          {/* Book card - bottom left */}
          <div
            className="absolute auth-icon-float-3"
            style={{
              bottom: isBelowMd ? "5%" : "15%",
              left: isBelowMd ? "2%" : "5%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "89.29px",
                height: "89.29px",
                transform: "rotate(-4.023deg)",
                borderRadius: "17.963px",
                border: "1.403px solid rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.10)",
                boxShadow:
                  "0 22.453px 28.067px -5.613px rgba(0,0,0,0.10), 0 8.981px 11.227px -6.736px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookIcon />
            </div>
          </div>

          {/* Mascot image */}
          <div
            className="relative z-0 flex items-center justify-center"
            style={{
              width: isBelowMd ? 280 : 380,
              height: isBelowMd ? 320 : 440,
            }}
          >
            <Logo
              width="300"
              height="300"
            />
          </div>
        </div>

        {/* ---- MASCOT column (left side in RTL — order-1 on desktop) ---- */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-right order-1 md:order-1 gap-5">
          {/* Available badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.85)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.15)"
                : "1px solid rgba(105,72,184,0.15)",
              color: isDark ? "rgba(255,255,255,0.85)" : "#3e256b",
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#4caf50" }}
            />
            متاح الآن للمناهج السعودية
          </div>

          {/* Main headline */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance"
            style={{ fontFamily: "'Readex Pro', sans-serif" }}
          >
            <span style={{ color: isDark ? "#ffffff" : "#3e256b" }}>
              حوّل دراسة ابنك..
            </span>
            <br />
            <span style={{ color: isDark ? "#dc64c9" : "#dc64c9" }}>
              إلى متعة لا تنتهي!
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="text-base md:text-lg leading-relaxed max-w-md"
            style={{
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(62,37,107,0.75)",
              fontFamily: "'Readex Pro', sans-serif",
            }}
          >
            أول معلم ذكي للمناهج السعودية. يشرح، يختبر، ويحلل أداء طفلك بذكاء
            اصطناعي يفهم احتياجاته ويجعل التعلم رحلة ممتعة.
          </p>

          {/* CTA Button */}
          <Link
            href="/ar/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #7c4fd4 0%, #5531a8 100%)"
                : "linear-gradient(135deg, #6948b8 0%, #5531a8 100%)",
              boxShadow: isDark
                ? "0 8px 32px rgba(105,72,184,0.45)"
                : "0 8px 32px rgba(105,72,184,0.35)",
              fontFamily: "'Readex Pro', sans-serif",
            }}
          >
            <span
              style={{
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M9.18071 2.34439C9.21642 2.15323 9.31786 1.98057 9.46746 1.85632C9.61706 1.73208 9.80541 1.66406 9.99988 1.66406C10.1943 1.66406 10.3827 1.73208 10.5323 1.85632C10.6819 1.98057 10.7833 2.15323 10.819 2.34439L11.6949 6.97606C11.7571 7.30535 11.9171 7.60824 12.1541 7.8452C12.391 8.08216 12.6939 8.24219 13.0232 8.30439L17.6549 9.18022C17.846 9.21593 18.0187 9.31737 18.1429 9.46697C18.2672 9.61658 18.3352 9.80492 18.3352 9.99939C18.3352 10.1939 18.2672 10.3822 18.1429 10.5318C18.0187 10.6814 17.846 10.7829 17.6549 10.8186L13.0232 11.6944C12.6939 11.7566 12.391 11.9166 12.1541 12.1536C11.9171 12.3905 11.7571 12.6934 11.6949 13.0227L10.819 17.6544C10.7833 17.8456 10.6819 18.0182 10.5323 18.1425C10.3827 18.2667 10.1943 18.3347 9.99988 18.3347C9.80541 18.3347 9.61706 18.2667 9.46746 18.1425C9.31786 18.0182 9.21642 17.8456 9.18071 17.6544L8.30488 13.0227C8.24267 12.6934 8.08265 12.3905 7.84569 12.1536C7.60873 11.9166 7.30584 11.7566 6.97655 11.6944L2.34488 10.8186C2.15372 10.7829 1.98106 10.6814 1.85681 10.5318C1.73256 10.3822 1.66455 10.1939 1.66455 9.99939C1.66455 9.80492 1.73256 9.61658 1.85681 9.46697C1.98106 9.31737 2.15372 9.21593 2.34488 9.18022L6.97655 8.30439C7.30584 8.24219 7.60873 8.08216 7.84569 7.8452C8.08265 7.60824 8.24267 7.30535 8.30488 6.97606L9.18071 2.34439Z"
                  stroke="white"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16.6665 1.66797V5.0013"
                  stroke="white"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M18.3333 3.33203H15"
                  stroke="white"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3.33317 18.3333C4.25365 18.3333 4.99984 17.5871 4.99984 16.6667C4.99984 15.7462 4.25365 15 3.33317 15C2.4127 15 1.6665 15.7462 1.6665 16.6667C1.6665 17.5871 2.4127 18.3333 3.33317 18.3333Z"
                  stroke="white"
                  stroke-width="1.66667"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            ابدأ رحلة التفوّق مجاناً
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="flex flex-col items-center pb-8 gap-2 opacity-60">
        <MouseScrollIcon />
        <span
          className="text-xs"
          style={{
            color: isDark ? "rgba(255,255,255,0.5)" : "rgba(62,37,107,0.5)",
            fontFamily: "'Readex Pro', sans-serif",
          }}
        >
          مرر للأسفل
        </span>
      </div>
    </section>
  );
};

export default HeroSection;

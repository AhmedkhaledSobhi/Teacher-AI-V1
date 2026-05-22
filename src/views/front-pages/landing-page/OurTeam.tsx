"use client";

// React Imports
import { useEffect, useRef, useState } from "react";

// Next Imports
import Image from "next/image";
import Link from "next/link";

// MUI Imports
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { useColorScheme } from "@mui/material/styles";

// Hook Imports
import { useIntersection } from "@/hooks/useIntersection";

// Styles Imports
import frontCommonStyles from "@views/front-pages/styles.module.css";

// ─── Teacher card data ───────────────────────────────────────────────────────
const teachers = [
  {
    id: "ahmad",
    title: "المعلم",
    name: "أحمد",
    role: "بطل المغامرات والكشتات",
    hoverText: "يشرح لك الدرس بأمثلة واقعية من بيئتنا السعودية",
    image: "/images/personas/Ahmed.png",
    nameColor: "#e91e8c",
    borderColor: "#e91e8c",
  },
  {
    id: "shifaa",
    title: "المعلمة",
    name: "شفاء",
    role: "راوية القصص الدافئة",
    hoverText: "تبسّط لك الدروس بحنية وقصص عائلية دافئة",
    image: "/images/personas/Shifaa.png",
    nameColor: "#e91e8c",
    borderColor: "#e91e8c",
  },
];

// ─── Teacher Card Component ──────────────────────────────────────────────────
const TeacherCard = ({ teacher }: { teacher: (typeof teachers)[0] }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-3xl overflow-hidden cursor-pointer w-full h-full"
      style={{
        border: `2px solid ${teacher.borderColor}`,
        minHeight: 420,
        transition: "box-shadow 0.3s ease",
        boxShadow: hovered ? `0 8px 40px 0 ${teacher.borderColor}55` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Portrait image */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-500"
        style={{
          filter: hovered
            ? "blur(0px) brightness(0.55)"
            : "blur(3px) brightness(0.6)",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        <Image
          src={teacher.image}
          alt={`${teacher.title} ${teacher.name}`}
          fill
          className="object-cover object-top"
          crossOrigin="anonymous"
        />
      </div>

      {/* Always-on dark gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Default state — name + role centered in card */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-400"
        style={{
          opacity: hovered ? 0 : 1,
          transform: hovered ? "scale(0.95)" : "scale(1)",
        }}
      >
        <Typography
          variant="h5"
          className="font-bold text-white mb-1"
          style={{ direction: "rtl", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {teacher.title}
        </Typography>
        <Typography
          variant="h4"
          className="font-extrabold mb-2"
          style={{
            color: teacher.nameColor,
            direction: "rtl",
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {teacher.name}
        </Typography>
        <Typography
          variant="body1"
          className="text-white/85 font-medium"
          style={{ direction: "rtl", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
        >
          {teacher.role}
        </Typography>
      </div>

      {/* Hover state — description centered in card */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-400"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "scale(1)" : "scale(1.05)",
        }}
      >
        <Typography
          variant="h5"
          className="font-extrabold text-white leading-relaxed mb-4"
          style={{
            direction: "rtl",
            lineHeight: 1.8,
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}
        >
          {teacher.hoverText}
        </Typography>
        <Typography
          variant="body1"
          className="font-semibold"
          style={{
            color: teacher.nameColor,
            direction: "rtl",
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          {teacher.title} <span className="font-bold">{teacher.name}</span>
        </Typography>
      </div>

      {/* Button at bottom of card */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 flex justify-center"
        style={{ zIndex: 20 }}
      >
        <Link
          href="/ar/register"
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="contained"
            sx={{
              background: `linear-gradient(90deg, ${teacher.borderColor} 0%, #5531A8 100%)`,
              borderRadius: "100px",
              padding: "10px 28px",
              fontFamily: '"Readex Pro", sans-serif',
              fontWeight: 700,
              fontSize: "14px",
              color: "#FFFFFF",
              textTransform: "none",
              boxShadow: `0 4px 20px 0 ${teacher.borderColor}55`,
              "&:hover": {
                background: `linear-gradient(90deg, ${teacher.borderColor} 0%, #4020A0 100%)`,
                boxShadow: `0 6px 28px 0 ${teacher.borderColor}77`,
              },
            }}
          >
            ابدأ التعلم مع {teacher.name}
          </Button>
        </Link>
      </div>
    </div>
  );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const OurTeam = () => {
  const skipIntersection = useRef(true);
  const ref = useRef<null | HTMLDivElement>(null);
  const { updateIntersections } = useIntersection();

  // Dark mode detection
  const { mode: muiMode, systemMode } = useColorScheme();
  const isDark = (muiMode === "system" ? systemMode : muiMode) === "dark";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false;
          return;
        }
        updateIntersections({ [entry.target.id]: entry.isIntersecting });
      },
      { threshold: 0.35 }
    );
    ref.current && observer.observe(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="team"
      dir="rtl"
      className="plb-[80px] md:plb-[100px]"
      ref={ref}
      style={{ background: "var(--lp-bg, #ede8f5)" }}
    >
      <div className={frontCommonStyles.layoutSpacing}>
        {/* ── Badge + Heading ── */}
        <div className="flex flex-col gap-y-4 items-center justify-center mb-10 md:mb-14">
          {/* Badge */}
          <div
            style={{
              display: "flex",
              padding: "10px 18px",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              borderRadius: "100px",
              border: isDark
                ? "1.235px solid rgba(255, 255, 255, 0.10)"
                : "1.235px solid rgba(15, 23, 42, 0.10)",
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.50)",
            }}
          >
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  width="24"
                  height="24"
                  rx="12"
                  fill="white"
                  fill-opacity="0.1"
                />
                <path
                  d="M18.0625 6.17505C17.9285 6.08304 17.7741 6.0252 17.6126 6.00657C17.4512 5.98794 17.2876 6.00909 17.1362 6.06818C16.2594 6.40943 14.4887 6.98193 12.5 6.98193C10.5113 6.98193 8.74 6.40943 7.86188 6.06818C7.71037 6.00936 7.5468 5.98836 7.38535 6.007C7.2239 6.02563 7.06942 6.08333 6.93529 6.17511C6.80116 6.26689 6.69142 6.38998 6.61557 6.53372C6.53973 6.67746 6.50006 6.83753 6.5 7.00005V10.4857C6.5 12.7257 7.10312 14.8388 8.19875 16.4344C9.33375 18.0882 10.8612 18.9969 12.5 18.9969C14.1388 18.9969 15.6663 18.0863 16.8013 16.4344C17.8969 14.8401 18.5 12.7269 18.5 10.4869V7.00005C18.4997 6.83732 18.4597 6.67712 18.3835 6.53335C18.3072 6.38958 18.197 6.26659 18.0625 6.17505ZM17.5 10.4876C17.5 12.5276 16.9588 14.4394 15.9769 15.8707C15.0338 17.2438 13.7994 18.0001 12.5 18.0001C11.2006 18.0001 9.96625 17.2438 9.02313 15.8701C8.04125 14.4376 7.5 12.5269 7.5 10.4869V7.00005C8.44438 7.36693 10.3488 7.98193 12.5 7.98193C14.6512 7.98193 16.5562 7.36693 17.5 7.00005V10.4882V10.4876ZM16.375 11.6669C16.4634 11.7664 16.5086 11.8969 16.5007 12.0297C16.4929 12.1625 16.4326 12.2867 16.3331 12.3751C16.2337 12.4634 16.1032 12.5086 15.9704 12.5008C15.8376 12.4929 15.7134 12.4326 15.625 12.3332C15.4575 12.1457 15.0719 12.0001 14.75 12.0001C14.4281 12.0001 14.04 12.1463 13.875 12.3332C13.7866 12.4326 13.6622 12.4929 13.5294 12.5007C13.3965 12.5085 13.266 12.4632 13.1666 12.3747C13.0671 12.2863 13.0069 12.162 12.9991 12.0291C12.9913 11.8963 13.0366 11.7658 13.125 11.6663C13.4819 11.2676 14.1337 11.0001 14.75 11.0001C15.3663 11.0001 16.0156 11.2676 16.375 11.6663V11.6669ZM10.25 12.0001C9.92563 12.0001 9.54 12.1463 9.375 12.3332C9.28657 12.4326 9.16225 12.4929 9.02939 12.5007C8.89653 12.5085 8.76602 12.4632 8.66656 12.3747C8.56711 12.2863 8.50685 12.162 8.49906 12.0291C8.49126 11.8963 8.53657 11.7658 8.625 11.6663C8.98438 11.2676 9.63625 11.0001 10.25 11.0001C10.8637 11.0001 11.5156 11.2676 11.875 11.6663C11.9634 11.7658 12.0087 11.8963 12.0009 12.0291C11.9931 12.162 11.9329 12.2863 11.8334 12.3747C11.7842 12.4185 11.7268 12.4522 11.6645 12.4738C11.6023 12.4954 11.5364 12.5045 11.4706 12.5007C11.3378 12.4929 11.2134 12.4326 11.125 12.3332C10.96 12.1463 10.5744 12.0001 10.25 12.0001ZM15.0281 14.8244C14.7178 15.1927 14.3307 15.4887 13.894 15.6917C13.4574 15.8948 12.9816 16 12.5 16C12.0184 16 11.5426 15.8948 11.106 15.6917C10.6693 15.4887 10.2822 15.1927 9.97188 14.8244C9.92924 14.7745 9.89685 14.7166 9.87657 14.6542C9.85629 14.5917 9.84851 14.5259 9.85368 14.4604C9.85884 14.3949 9.87685 14.3311 9.90668 14.2726C9.9365 14.2141 9.97756 14.1621 10.0275 14.1194C10.0774 14.0768 10.1353 14.0444 10.1978 14.0241C10.2602 14.0038 10.3261 13.9961 10.3915 14.0012C10.457 14.0064 10.5208 14.0244 10.5793 14.0542C10.6378 14.0841 10.6899 14.1251 10.7325 14.1751C10.9489 14.4334 11.2193 14.6412 11.5247 14.7837C11.8301 14.9263 12.163 15.0002 12.5 15.0002C12.837 15.0002 13.1699 14.9263 13.4753 14.7837C13.7807 14.6412 14.0511 14.4334 14.2675 14.1751C14.3101 14.1251 14.3622 14.0841 14.4207 14.0542C14.4792 14.0244 14.543 14.0064 14.6085 14.0012C14.6739 13.9961 14.7398 14.0038 14.8022 14.0241C14.8647 14.0444 14.9226 14.0768 14.9725 14.1194C15.0224 14.1621 15.0635 14.2141 15.0933 14.2726C15.1231 14.3311 15.1412 14.3949 15.1463 14.4604C15.1515 14.5259 15.1437 14.5917 15.1234 14.6542C15.1031 14.7166 15.0708 14.7745 15.0281 14.8244Z"
                  fill="#DC64C9"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                  fill="white"
                />
                <path
                  d="M18.0625 6.17505C17.9285 6.08304 17.7741 6.0252 17.6126 6.00657C17.4512 5.98794 17.2876 6.00909 17.1362 6.06818C16.2594 6.40943 14.4887 6.98193 12.5 6.98193C10.5113 6.98193 8.74 6.40943 7.86188 6.06818C7.71037 6.00936 7.5468 5.98836 7.38535 6.007C7.2239 6.02563 7.06942 6.08333 6.93529 6.17511C6.80116 6.26689 6.69142 6.38998 6.61557 6.53372C6.53973 6.67746 6.50006 6.83753 6.5 7.00005V10.4857C6.5 12.7257 7.10312 14.8388 8.19875 16.4344C9.33375 18.0882 10.8612 18.9969 12.5 18.9969C14.1388 18.9969 15.6663 18.0863 16.8013 16.4344C17.8969 14.8401 18.5 12.7269 18.5 10.4869V7.00005C18.4997 6.83732 18.4597 6.67712 18.3835 6.53335C18.3072 6.38958 18.197 6.26659 18.0625 6.17505ZM17.5 10.4876C17.5 12.5276 16.9588 14.4394 15.9769 15.8707C15.0338 17.2438 13.7994 18.0001 12.5 18.0001C11.2006 18.0001 9.96625 17.2438 9.02313 15.8701C8.04125 14.4376 7.5 12.5269 7.5 10.4869V7.00005C8.44438 7.36693 10.3488 7.98193 12.5 7.98193C14.6512 7.98193 16.5562 7.36693 17.5 7.00005V10.4882V10.4876ZM16.375 11.6669C16.4634 11.7664 16.5086 11.8969 16.5007 12.0297C16.4929 12.1625 16.4326 12.2867 16.3331 12.3751C16.2337 12.4634 16.1032 12.5086 15.9704 12.5008C15.8376 12.4929 15.7134 12.4326 15.625 12.3332C15.4575 12.1457 15.0719 12.0001 14.75 12.0001C14.4281 12.0001 14.04 12.1463 13.875 12.3332C13.7866 12.4326 13.6622 12.4929 13.5294 12.5007C13.3965 12.5085 13.266 12.4632 13.1666 12.3747C13.0671 12.2863 13.0069 12.162 12.9991 12.0291C12.9913 11.8963 13.0366 11.7658 13.125 11.6663C13.4819 11.2676 14.1337 11.0001 14.75 11.0001C15.3663 11.0001 16.0156 11.2676 16.375 11.6663V11.6669ZM10.25 12.0001C9.92563 12.0001 9.54 12.1463 9.375 12.3332C9.28657 12.4326 9.16225 12.4929 9.02939 12.5007C8.89653 12.5085 8.76602 12.4632 8.66656 12.3747C8.56711 12.2863 8.50685 12.162 8.49906 12.0291C8.49126 11.8963 8.53657 11.7658 8.625 11.6663C8.98438 11.2676 9.63625 11.0001 10.25 11.0001C10.8637 11.0001 11.5156 11.2676 11.875 11.6663C11.9634 11.7658 12.0087 11.8963 12.0009 12.0291C11.9931 12.162 11.9329 12.2863 11.8334 12.3747C11.7842 12.4185 11.7268 12.4522 11.6645 12.4738C11.6023 12.4954 11.5364 12.5045 11.4706 12.5007C11.3378 12.4929 11.2134 12.4326 11.125 12.3332C10.96 12.1463 10.5744 12.0001 10.25 12.0001ZM15.0281 14.8244C14.7178 15.1927 14.3307 15.4887 13.894 15.6917C13.4574 15.8948 12.9816 16 12.5 16C12.0184 16 11.5426 15.8948 11.106 15.6917C10.6693 15.4887 10.2822 15.1927 9.97188 14.8244C9.92924 14.7745 9.89685 14.7166 9.87657 14.6542C9.85629 14.5917 9.84851 14.5259 9.85368 14.4604C9.85884 14.3949 9.87685 14.3311 9.90668 14.2726C9.9365 14.2141 9.97756 14.1621 10.0275 14.1194C10.0774 14.0768 10.1353 14.0444 10.1978 14.0241C10.2602 14.0038 10.3261 13.9961 10.3915 14.0012C10.457 14.0064 10.5208 14.0244 10.5793 14.0542C10.6378 14.0841 10.6899 14.1251 10.7325 14.1751C10.9489 14.4334 11.2193 14.6412 11.5247 14.7837C11.8301 14.9263 12.163 15.0002 12.5 15.0002C12.837 15.0002 13.1699 14.9263 13.4753 14.7837C13.7807 14.6412 14.0511 14.4334 14.2675 14.1751C14.3101 14.1251 14.3622 14.0841 14.4207 14.0542C14.4792 14.0244 14.543 14.0064 14.6085 14.0012C14.6739 13.9961 14.7398 14.0038 14.8022 14.0241C14.8647 14.0444 14.9226 14.0768 14.9725 14.1194C15.0224 14.1621 15.0635 14.2141 15.0933 14.2726C15.1231 14.3311 15.1412 14.3949 15.1463 14.4604C15.1515 14.5259 15.1437 14.5917 15.1234 14.6542C15.1031 14.7166 15.0708 14.7745 15.0281 14.8244Z"
                  fill="#DC64C9"
                />
              </svg>
            )}
            <span
              style={{
                color: isDark ? "#D4BDFF" : "#5531A8",
                textAlign: "right",
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "19.752px",
              }}
            >
              تجربة تعلم مخصصة
            </span>
          </div>

          {/* Heading */}
          <div className="text-center">
            <Typography
              component="h2"
              style={{
                textAlign: "right",
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: 700,
                lineHeight: "150%",
                color: isDark ? "#FFF" : "#3E256B",
                direction: "rtl",
              }}
            >
              شرح الدرس.. <span className="text-primary">بأساليب لا تنتهي</span>
            </Typography>
          </div>

          {/* Description */}
          <Typography
            component="p"
            className="text-center  text-pretty"
            style={{
              color: isDark ? "rgba(212, 189, 255, 0.90)" : "#64748B",
              textAlign: "right",
              fontFamily: '"Readex Pro", sans-serif',
              fontSize: "20px",
              fontWeight: 500,
              lineHeight: "150%",
              direction: "rtl",
            }}
          >
            كل طالب يتعلم بطريقته. اختر المعلم المفضل لطفلك، أو دعه يطلق العنان
            لخياله ويصنع معلمه الخاص بشخصية فريدة!
          </Typography>
        </div>

        {/* ── Cards Grid ─────────────────────────────────────────────────── */}
        {/* Desktop: [Shifaa 1fr] [Purple CTA 1.8fr] [Ahmad 1fr]            */}
        {/* Mobile: all stacked                                              */}
        <div
          className="flex flex-col md:grid gap-5 items-stretch"
          style={{ gridTemplateColumns: "1fr 1.8fr 1fr" }}
        >
          {/* Shifaa */}
          <TeacherCard teacher={teachers[0]} />

          {/* Center purple CTA card — taller on desktop via self-stretch */}
          <div
            className="rounded-3xl flex flex-col items-center justify-center text-center p-8 md:p-10 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)",
              minHeight: 420,
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
              style={{ background: "rgba(255,255,255,0.35)" }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-15"
              style={{ background: "rgba(255,255,255,0.3)" }}
            />

            <div className="relative z-10 flex flex-col gap-4 items-center">
              <Typography
                variant="h4"
                className="font-extrabold text-white text-balance"
                style={{ direction: "rtl", lineHeight: 1.6 }}
              >
                اصنع شخصية معلم طفلك الخاص!
              </Typography>
              <Typography
                variant="body1"
                className="text-white/70"
                style={{ direction: "rtl" }}
              >
                صمم شخصية معلم طفلك على ذوقك واختار أسلوبه وفق تفضيلاتك
              </Typography>
              <Link
                href="/ar/register"
                style={{ textDecoration: "none", marginTop: "16px" }}
              >
                <Button
                  variant="contained"
                  sx={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    borderRadius: "100px",
                    padding: "12px 32px",
                    fontFamily: '"Readex Pro", sans-serif',
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "#FFFFFF",
                    textTransform: "none",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      background: "rgba(255,255,255,0.25)",
                      border: "1.5px solid rgba(255,255,255,0.5)",
                    },
                  }}
                >
                  ابدأ الآن مجاناً
                </Button>
              </Link>
            </div>
          </div>

          {/* Ahmad */}
          <TeacherCard teacher={teachers[1]} />
        </div>
      </div>
    </section>
  );
};

export default OurTeam;

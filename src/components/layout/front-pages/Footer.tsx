"use client";

// Next Imports
import NextLink from "next/link";
import Image from "next/image";

// Type Imports
import type { Mode } from "@core/types";

// Util Imports
import { frontLayoutClasses } from "@layouts/utils/layoutClasses";
import Logo from "@/@core/svg/Logo";

const NAV_PRODUCT = [
  { label: "الرئيسية", href: "/ar" },
  { label: "الميزات", href: "/ar#features" },
  { label: "تسجيل الدخول", href: "/ar/login" },
  { label: "إنشاء حساب", href: "/ar/register" },
];

const NAV_SUPPORT = [
  { label: "الأسئلة الشائعة", href: "/ar#faq" },
  { label: "تواصل معنا", href: "/ar#contact-us" },
];

const NAV_LEGAL = [
  { label: "سياسة الخصوصية", href: "/ar/privacy" },
  { label: "شروط الخدمة", href: "/ar/terms" },
];

const SOCIAL = [
  {
    icon: "tabler-mail",
    href: "mailto:info@teacherai.sa",
    label: "البريد الإلكتروني",
  },
  {
    icon: "tabler-brand-facebook",
    href: "https://facebook.com",
    label: "فيسبوك",
  },
  {
    icon: "tabler-brand-instagram",
    href: "https://instagram.com",
    label: "إنستغرام",
  },
  { icon: "tabler-brand-x", href: "https://x.com", label: "X" },
];

const Footer = ({ mode }: { mode: Mode }) => {
  return (
    <footer
      className={frontLayoutClasses.footer}
      dir="rtl"
      style={{ backgroundColor: "#151929" }}
    >
      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Desktop: 4-col | Tablet: 2-col | Mobile: 1-col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Col 1 — Brand (right-most in RTL) */}
          <div className="flex flex-col items-center sm:items-start gap-5 sm:col-span-2 lg:col-span-1">
            {/* Logo row */}
            <div className="flex items-center gap-3">
              <Logo
                width="48"
                height="48"
              />
              <span className="text-white font-bold text-2xl tracking-tight">
                Teacher Ai
              </span>
            </div>

            {/* Tagline */}
            <p className="text-white/70 text-sm leading-relaxed text-center sm:text-right max-w-xs">
              أول معلم ذكي للمناهج السعودية. نساعد الطلاب على التفوق الدراسي
              والاستمتاع بالتعلم من خلال الذكاء الاصطناعي.
            </p>

            {/* CTA pill */}
            <NextLink
              href="/ar/register"
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-green-500 text-green-400 text-sm font-medium hover:bg-green-500/10 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              انطلاق تجريبي
            </NextLink>
          </div>

          {/* Col 2 — المنتج */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <h3 className="text-white font-semibold text-base mb-1">المنتج</h3>
            {NAV_PRODUCT.map((item) => (
              <NextLink
                key={item.label}
                href={item.href}
                className="text-white/65 text-sm hover:text-white transition-colors"
              >
                {item.label}
              </NextLink>
            ))}
          </div>

          {/* Col 3 — الدعم */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <h3 className="text-white font-semibold text-base mb-1">الدعم</h3>
            {NAV_SUPPORT.map((item) => (
              <NextLink
                key={item.label}
                href={item.href}
                className="text-white/65 text-sm hover:text-white transition-colors"
              >
                {item.label}
              </NextLink>
            ))}
          </div>

          {/* Col 4 — قانوني */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <h3 className="text-white font-semibold text-base mb-1">قانوني</h3>
            {NAV_LEGAL.map((item) => (
              <NextLink
                key={item.label}
                href={item.href}
                className="text-white/65 text-sm hover:text-white transition-colors"
              >
                {item.label}
              </NextLink>
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/10" />

      {/* ── Bottom bar ── */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          {/* Made with love */}
          <p className="text-white/50 text-xs text-center sm:text-right">
            صُنع بكل <span className="text-blue-400">♥</span> للمملكة العربية
            السعودية
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors"
              >
                <i className={`${s.icon} text-base`} />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-white/50 text-xs text-center sm:text-left">
            جميع الحقوق محفوظة {new Date().getFullYear()} Teacher Ai.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

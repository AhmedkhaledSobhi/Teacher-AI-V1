"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { email as emailRule, object, pipe, string, nonEmpty } from "valibot";
import type { SubmitHandler } from "react-hook-form";

import type { SystemMode } from "@core/types";
import type { Locale } from "@configs/i18n";
import type { getDictionary } from "@/utils/getDictionary";

import Logo from "@/@core/svg/Logo";
import { getLocalizedUrl } from "@/utils/i18n";
import { baseURL } from "@/app/server/utils/api-constants";
import { showSuccessToast, showErrorToast } from "@/utils/toast-utils";

import { Typography, Label, Input, Button } from "@/components/ui";
import { useAuthSound } from "@/hooks/useAuthSound";

type ForgotPasswordProps = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

type FormData = { email: string };

const ForgotPassword = ({ mode, dictionary }: ForgotPasswordProps) => {
  const d = dictionary.forgot_password;
  const dt = dictionary.forgot_password_toast;
  // shared validation messages from login.form.validation
  const dv = dictionary.login.form.validation;

  const [isLoading, setIsLoading] = useState(false);

  const { play } = useAuthSound();

  const router = useRouter();
  const { lang } = useParams();
  const rawLocale = Array.isArray(lang) ? lang[0] : lang;
  // Default to "ar" so reset-password emails always include a language prefix
  const locale = ((rawLocale && String(rawLocale).trim()) || "ar") as Locale;
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const schema = object({
    email: pipe(string(), nonEmpty(dv.required), emailRule(dv.email_invalid)),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const appUrl = (
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      ).replace(/\/+$/, "");
      // Always include /<lang> prefix (defaults to /ar) so the email link
      // opens /<lang>/reset-password instead of falling back to Site URL.
      const safeLocale = (locale && String(locale).trim()) || "ar";
      const resetPasswordUrl = `${appUrl}/${safeLocale}/reset-password`;

      const res = await fetch(`${baseURL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          redirect_to: resetPasswordUrl,
          // redirect_to: "/reset-password",
        }),
      });
      if (res.ok) {
        play("btn-secondary-action");
        showSuccessToast(dt.success);
        // Redirect to confirm-email after successful forgot password request
        router.push(getLocalizedUrl("/confirm-email", locale as Locale));
      } else {
        const json = await res.json().catch(() => ({}));
        play("auth-error-msg");
        showErrorToast(json.message || dt.error_generic);
      }
    } catch {
      play("auth-error-msg");
      showErrorToast(dt.error_network);
    } finally {
      setIsLoading(false);
    }
  };

  const cardBg = isDark ? "#6947B8" : "#FFFFFF";

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div
        className="w-full flex flex-col items-center gap-7"
        style={{
          maxWidth: "520px",
          borderRadius: hidden ? "0" : "24px",
          padding: hidden ? "0 20px" : "52px 40px",
          backgroundColor: hidden ? "transparent" : cardBg,
          boxShadow: hidden ? "none" : "0 0 30px 0 rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo */}
        <Logo height={110} />

        {/* Heading */}
        <div className="flex flex-col gap-3 text-center w-full">
          {/* H2 45px/700 #3E256B */}
          <Typography
            variant="h2"
            isDark={isDark}
          >
            {d.title}
          </Typography>
          {/* H6 22px/500 #5531A8 */}
          <Typography
            variant="h6"
            isDark={isDark}
          >
            {d.subtitle}
          </Typography>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
          noValidate
        >
          {/* Email — mail SVG on endAdornment (right), matching Login pattern */}
          <div className="flex flex-col gap-1">
            <Label
              isDark={isDark}
              htmlFor="fp-email"
              required
            >
              {d.email_label}
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="fp-email"
                  isDark={isDark}
                  type="email"
                  placeholder={d.email_placeholder}
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  endAdornment={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="3"
                        stroke="#A89ED3"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 9L10.8906 13.2604C11.5624 13.6329 12.4376 13.6329 13.1094 13.2604L21 9"
                        stroke="#A89ED3"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                />
              )}
            />
          </div>

          {/* Submit — H6 22px/700, gradient bg, height 56px, radius 16px */}
          <Button
            fullWidth
            isDark={isDark}
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: "14px" }}
          >
            {isLoading ? d.submitting : d.submit}
          </Button>

          {/* Back to login — P 18px/700, bold, centered */}
          <div
            className="flex justify-center"
            style={{ marginTop: "14px" }}
          >
            <Link
              href={getLocalizedUrl("/login", locale as Locale)}
              className="group"
              style={{ textDecoration: "none" }}
              onClick={() => play("ui-link-auth-switch")}
            >
              <Typography
                variant="p"
                isDark={isDark}
                as="span"
                align="center"
                className="transition-opacity duration-150 group-hover:opacity-70 group-hover:underline"
              >
                {d.back_to_login}
              </Typography>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { email, object, minLength, string, pipe, nonEmpty } from "valibot";
import type { SubmitHandler } from "react-hook-form";
import type { InferInput } from "valibot";
import { toast } from "react-toastify";

import type { SystemMode } from "@core/types";
import type { Locale } from "@/configs/i18n";
import type { getDictionary } from "@/utils/getDictionary";

import Logo from "@/@core/svg/Logo";
import { getLocalizedUrl } from "@/utils/i18n";
import { useAuthSound } from "@/hooks/useAuthSound";

import { Typography, Label, Input, Button } from "@/components/ui";

// ─── Validation schema factory (receives translated messages) ─────────────────
type FormData = { email: string; password: string };

const makeSchema = (v: {
  required: string;
  email_invalid: string;
  password_min: string;
}) =>
  object({
    email: pipe(string(), nonEmpty(v.required), email(v.email_invalid)),
    password: pipe(
      string(),
      nonEmpty(v.required),
      minLength(5, v.password_min)
    ),
  });

// ─── Types ────────────────────────────────────────────────────────────────────
type LoginProps = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

// ─── Component ────────────────────────────────────────────────────────────────
const Login = ({ mode, dictionary }: LoginProps) => {
  const d = dictionary.login.form;
  const dv = d.validation;

  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [errorState, setErrorState] = useState<string[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { play, playAndWait } = useAuthSound();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useParams();
  const locale = (Array.isArray(lang) ? lang[0] : lang) as Locale;
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const schema = makeSchema({
    required: dv.required,
    email_invalid: dv.email_invalid,
    password_min: dv.password_min,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorState(null);

    try {
      const redirectURL =
        searchParams.get("redirectTo") ?? `/${locale}/apps/home`;
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: redirectURL,
      });

      if (result?.error) {
        let msg = "Authentication failed";
        try {
          msg = JSON.parse(result.error).detail ?? msg;
        } catch {
          msg = result.error;
        }
        play("auth-error-msg");
        setErrorState([msg]);
        toast.error(msg);
      } else if (result?.ok) {
        toast.success("تم تسجيل الدخول بنجاح");
        // Play the sound fully before navigating so it is not cut off.
        await playAndWait("btn-primary-launch");
        router.replace(redirectURL);
      } else {
        const msg = "Authentication failed. Please try again.";
        play("auth-error-msg");
        setErrorState([msg]);
        toast.error(msg);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Authentication failed.";
      play("auth-error-msg");
      setErrorState([msg]);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = isDark ? "#6947B8" : "#FFFFFF";

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div
        className="w-full flex flex-col items-center gap-6"
        style={{
          maxWidth: "520px",
          borderRadius: hidden ? "0" : "24px",
          padding: hidden ? "0 20px" : "44px 40px",
          backgroundColor: hidden ? "transparent" : cardBg,
          boxShadow: hidden ? "none" : "0 0 30px 0 rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo */}
        <Logo height={hidden ? 80 : 96} />

        {/* Heading */}
        <div className="flex flex-col gap-2 text-center">
          <Typography
            variant="h2"
            isDark={isDark}
          >
            {d.welcome}
          </Typography>
          <Typography
            variant="h6"
            isDark={isDark}
          >
            {d.signin_message}
          </Typography>
        </div>

        {/* Error banner */}
        {errorState && (
          <Alert
            severity="error"
            className="w-full rounded-xl text-sm"
          >
            {errorState.map((msg, i) => (
              <span key={i}>{msg}</span>
            ))}
          </Alert>
        )}

        {/* Form */}
        <form
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-6"
        >
          {/* Email */}
          <div className="flex flex-col gap-1">
            <Label
              isDark={isDark}
              htmlFor="login-email"
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
                  id="login-email"
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
                      <circle
                        cx="4"
                        cy="4"
                        r="4"
                        transform="matrix(-1 0 0 1 16 2.99994)"
                        stroke="#A89ED3"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M5 16.9346C5 16.0743 5.54085 15.3068 6.35109 15.0174C10.004 13.7128 13.996 13.7128 17.6489 15.0174C18.4591 15.3068 19 16.0743 19 16.9346V18.2501C19 19.4376 17.9483 20.3497 16.7728 20.1818L15.8184 20.0455C13.2856 19.6836 10.7144 19.6836 8.18162 20.0455L7.22721 20.1818C6.0517 20.3497 5 19.4376 5 18.2501V16.9346Z"
                        stroke="#A89ED3"
                        strokeWidth="1.5"
                      />
                    </svg>
                  }
                />
              )}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <Label
              isDark={isDark}
              htmlFor="login-password"
              required
            >
              {d.password_label}
            </Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="login-password"
                  isDark={isDark}
                  type={isPasswordShown ? "text" : "password"}
                  placeholder={d.password_placeholder}
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  startAdornment={
                    <button
                      type="button"
                      onClick={() => {
                        play("ui-eye-toggle");
                        setIsPasswordShown((v) => !v);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                      aria-label="toggle password visibility"
                    >
                      {isPasswordShown ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 2L22 22"
                            stroke="#A89ED3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8345 18.3215 17.2888 17.2959M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335"
                            stroke="#A89ED3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.7229 14.723C14.1439 15.302 13.3555 15.6565 12.4827 15.6565C10.6459 15.6565 9.15588 14.1664 9.15588 12.3297C9.15588 11.4569 9.51035 10.6685 10.0893 10.0895"
                            stroke="#A89ED3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 12C2 12 5.63636 5 12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12Z"
                            stroke="#A89ED3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="#A89ED3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  }
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
                        x="4"
                        y="9.00006"
                        width="16"
                        height="12"
                        rx="4"
                        stroke="#A89ED3"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 16L12 14"
                        stroke="#A89ED3"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.6667 5.14235C14.9035 5.48223 15.371 5.56581 15.7108 5.32905C16.0507 5.09228 16.1343 4.62482 15.8975 4.28495L15.2821 4.71365L14.6667 5.14235ZM8.27819 4.04868C8.02082 4.37324 8.07528 4.84498 8.39984 5.10235C8.72439 5.35971 9.19613 5.30525 9.4535 4.9807L8.86584 4.51469L8.27819 4.04868ZM8 9.00006H8.75V7.00006H8H7.25V9.00006H8ZM8 7.00006H8.75C8.75 5.20514 10.2051 3.75006 12 3.75006V3.00006V2.25006C9.37665 2.25006 7.25 4.37671 7.25 7.00006H8ZM15.2821 4.71365L15.8975 4.28495C15.331 3.47176 14.5244 2.85612 13.5905 2.52427L13.3394 3.23097L13.0883 3.93768C13.7272 4.16474 14.2791 4.58596 14.6667 5.14235L15.2821 4.71365ZM13.3394 3.23097L13.5905 2.52427C12.6567 2.19242 11.6424 2.16097 10.6898 2.43432L10.8967 3.15523L11.1036 3.87614C11.7554 3.6891 12.4493 3.71062 13.0883 3.93768L13.3394 3.23097ZM10.8967 3.15523L10.6898 2.43432C9.73722 2.70768 8.89397 3.27216 8.27819 4.04868L8.86584 4.51469L9.4535 4.9807C9.87482 4.44939 10.4518 4.06317 11.1036 3.87614L10.8967 3.15523Z"
                        fill="#A89ED3"
                      />
                    </svg>
                  }
                />
              )}
            />
          </div>

          {/* Submit */}
          <Button
            fullWidth
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            endIcon={
              !isSubmitting ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M19.6718 1.63593C21.2854 1.42515 22.616 2.75577 22.4052 4.36933C22.0967 6.72818 21.2485 10.7357 18.8535 13.3185C18.0915 14.14 17.1699 14.8981 16.2236 15.5725L16.5009 17.5109C16.5787 18.056 16.3949 18.6059 16.0058 18.9953L12.8242 22.1779C11.8046 23.1974 10.0589 22.6156 9.85443 21.1887L9.42962 18.218L9.4345 18.217C9.16282 18.0858 8.90979 17.9099 8.69036 17.6906L6.35052 15.3508C6.13104 15.1311 5.95531 14.8776 5.82415 14.6057L5.82318 14.6125L2.85345 14.1877C1.42608 13.9836 0.844633 12.2376 1.86419 11.218L5.04583 8.03534C5.4352 7.6463 5.98528 7.46348 6.53021 7.5412L8.46771 7.81757C9.14221 6.87107 9.90199 5.94967 10.7236 5.18769C13.3063 2.79277 17.313 1.94447 19.6718 1.63593ZM7.52044 19.7033C7.81337 19.4108 8.28823 19.4106 8.58099 19.7033C8.87361 19.9961 8.87344 20.471 8.58099 20.7639L7.16693 22.1779C6.87406 22.4705 6.3992 22.4706 6.10638 22.1779C5.81357 21.8851 5.81373 21.4103 6.10638 21.1174L7.52044 19.7033ZM5.39935 17.5812C5.6922 17.2889 6.16715 17.2888 6.4599 17.5812C6.7525 17.874 6.75226 18.3489 6.4599 18.6418L3.63177 21.4709C3.33899 21.7636 2.86411 21.7634 2.57122 21.4709C2.27836 21.178 2.27843 20.7032 2.57122 20.4103L5.39935 17.5812ZM3.27825 15.4601C3.57118 15.1678 4.04607 15.1674 4.3388 15.4601C4.63141 15.7529 4.63116 16.2278 4.3388 16.5207L2.92474 17.9348C2.63189 18.2276 2.15709 18.2275 1.86419 17.9348C1.57132 17.6419 1.57131 17.1671 1.86419 16.8742L3.27825 15.4601ZM16.5351 7.50507C15.7541 6.72444 14.4879 6.72427 13.707 7.50507C12.9259 8.28612 12.9259 9.55312 13.707 10.3342C14.4879 11.115 15.754 11.1148 16.5351 10.3342C17.3161 9.55312 17.3161 8.28612 16.5351 7.50507Z"
                    fill="#F5F0FF"
                  />
                </svg>
              ) : undefined
            }
          >
            {isSubmitting ? d.logging_in : d.login_btn}
          </Button>

          {/* Forgot password — small 15px centered, tight spacing via form gap */}
          <div className="text-center">
            <Link
              href={getLocalizedUrl("/forgot-password", locale)}
              className="group"
              style={{ textDecoration: "none" }}
              onClick={() => play("ui-link-forget-pass")}
            >
              <Typography
                variant="small"
                isDark={isDark}
                as="span"
                align="center"
                className="transition-opacity duration-150 group-hover:opacity-70 group-hover:underline"
              >
                {d.forgot_password}
              </Typography>
            </Link>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background: isDark ? "rgba(255,255,255,0.12)" : "#E0D6F7",
            }}
          />

          {/* Register link — bold p 18px/700 */}
          <div
            className="text-center"
            style={{ marginTop: "8px" }}
          >
            <Link
              href={getLocalizedUrl("/register", locale)}
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
                {d.create_account}
              </Typography>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

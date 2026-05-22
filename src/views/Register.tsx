"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { SystemMode } from "@core/types";
import type { Locale } from "@configs/i18n";
import type { getDictionary } from "@/utils/getDictionary";

import Logo from "@/@core/svg/Logo";
import { getLocalizedUrl } from "@/utils/i18n";
import { baseURL } from "@/app/server/utils/api-constants";
import { showSuccessToast, showErrorToast } from "@/utils/toast-utils";

import { Typography, Label, Input, Select, Button } from "@/components/ui";
import { useAuthSound } from "@/hooks/useAuthSound";

type RegisterProps = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const Register = ({ mode, dictionary }: RegisterProps) => {
  const d = dictionary.register.form;
  const dt = dictionary.register;
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const [heroName, setHeroName] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", grade: "" });

  const { play, playAndWait } = useAuthSound();

  const router = useRouter();
  const { lang } = useParams();
  const locale = (Array.isArray(lang) ? lang[0] : lang) as Locale;

  const validate = () => {
    const next = { email: "", password: "", grade: "" };
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = d.email_placeholder;
    if (!password || password.length < 8) next.password = "Min 8 characters";
    if (!gradeId) next.grade = d.grade_label;
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!agreedToTerms) {
      showErrorToast(d.terms_prefix + d.privacy_terms);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${baseURL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({
          name: heroName.trim() || undefined,
          email,
          password,
          grade_id: parseInt(gradeId, 10),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessToast(dt.toast_success);
        // Play the sound fully before navigating so it is not cut off.
        await playAndWait("btn-register-launch");
        router.push(getLocalizedUrl("/confirm-email", locale));
      } else {
        const msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
        play("auth-error-msg");
        showErrorToast(msg || dt.toast_error_generic);
      }
    } catch {
      play("auth-error-msg");
      showErrorToast(dt.toast_error_network);
    } finally {
      setIsLoading(false);
    }
  };

  const cardBg = isDark ? "#6947B8" : "#FFFFFF";

  const gradeOptions = (["1", "2", "3", "4", "5", "6"] as const).map((g) => ({
    value: g,
    label: d.grades[g],
  }));

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div
        className="w-full flex flex-col items-center gap-7"
        style={{
          maxWidth: "520px",
          borderRadius: hidden ? "0" : "24px",
          padding: hidden ? "32px 20px" : "52px 40px",
          backgroundColor: hidden ? "transparent" : cardBg,
          boxShadow: hidden ? "none" : "0 0 30px 0 rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo */}
        <Logo height={80} />

        {/* Heading */}
        <div className="flex flex-col gap-1 text-center">
          <Typography
            variant="h2"
            isDark={isDark}
          >
            {d.title}
          </Typography>
          <Typography
            variant="h6"
            isDark={isDark}
          >
            {d.subtitle}
          </Typography>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5"
          noValidate
        >
          {/* Row 1: Hero name (right col) + Grade (left col) — gap 15px */}
          <div style={{ display: "flex", gap: "15px", width: "100%" }}>
            {/* Hero name — takes remaining space */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  direction: "rtl",
                }}
              >
                <Label isDark={isDark}>{d.hero_name}</Label>
                <span
                  style={{
                    color: "#DC64C9",
                    fontFamily: '"Readex Pro", sans-serif',
                    fontSize: "15px",
                    fontWeight: 400,
                    lineHeight: "150%",
                    marginInlineStart: "10px",
                  }}
                >
                  {d.hero_name_optional}
                </span>
              </div>
              <Input
                isDark={isDark}
                placeholder={d.hero_name_placeholder}
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
              />
            </div>

            {/* Grade — fixed width to balance */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <Label
                isDark={isDark}
                required
              >
                {d.grade_label}
              </Label>
              <Select
                isDark={isDark}
                value={gradeId}
                onOpen={() => play("ui-dropdown-open")}
                onChange={(e) => setGradeId(e.target.value as string)}
                placeholder={d.grade_placeholder}
                options={gradeOptions}
                error={!!errors.grade}
                helperText={errors.grade}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <Label
              isDark={isDark}
              htmlFor="reg-email"
              required
            >
              {d.email}
            </Label>
            <Input
              id="reg-email"
              isDark={isDark}
              type="email"
              placeholder={d.email_placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              error={!!errors.email}
              helperText={errors.email}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <Label
              isDark={isDark}
              htmlFor="reg-password"
              required
            >
              {d.password}
            </Label>
            <Input
              id="reg-password"
              isDark={isDark}
              type={showPassword ? "text" : "password"}
              placeholder={d.password_placeholder}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
              error={!!errors.password}
              helperText={errors.password}
              startAdornment={
                <button
                  type="button"
                  onClick={() => {
                    play("ui-eye-toggle");
                    setShowPassword((v) => !v);
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
                  {showPassword ? (
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
            />
          </div>

          {/* Terms checkbox — flex-end so checkbox+text sit on the right */}
          <label
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              userSelect: "none",
              direction: "rtl",
            }}
          >
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                play("ui-checkbox-check");
                setAgreedToTerms(e.target.checked);
              }}
              style={{
                width: "18px",
                height: "18px",
                flexShrink: 0,
                accentColor: isDark ? "#D4BDFF" : "#6948B8",
              }}
            />
            <span
              style={{
                fontFamily: '"Readex Pro", sans-serif',
                fontSize: "15px",
                fontWeight: 400,
                lineHeight: "150%",
                color: "#3E256B",
                textAlign: "center",
              }}
            >
              {d.terms_prefix}
              <Link
                href="/"
                style={{
                  color: isDark ? "#D4BDFF" : "#6948B8",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {d.privacy_terms}
              </Link>
            </span>
          </label>

          {/* Submit — rocket SVG after text */}
          <Button
            fullWidth
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            endIcon={
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
            }
          >
            {isLoading ? d.submitting_label : d.submit_label}
          </Button>

          {/* Login link — P variant 18px/700 bold centered */}
          <div
            className="text-center"
            style={{ marginTop: "8px" }}
          >
            <Link
              href={getLocalizedUrl("/login", locale)}
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
                {d.already_account} {d.signin_instead}
              </Typography>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { SystemMode } from "@core/types";
import type { Locale } from "@configs/i18n";
import type { getDictionary } from "@/utils/getDictionary";

import Logo from "@/@core/svg/Logo";
import { getLocalizedUrl } from "@/utils/i18n";
import { baseURL } from "@/app/server/utils/api-constants";
import { showSuccessToast, showErrorToast } from "@/utils/toast-utils";

import { Typography, Label, Input, Button } from "@/components/ui";

type ResetPasswordProps = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const ResetPassword = ({ mode, dictionary }: ResetPasswordProps) => {
  const d = dictionary.reset_password;
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useParams();
  const locale = (Array.isArray(lang) ? lang[0] : lang) as Locale;

  const validate = () => {
    const next = { newPassword: "", confirmPassword: "" };
    if (!newPassword || newPassword.length < 8)
      next.newPassword = "Min 8 characters";
    if (!confirmPassword) next.confirmPassword = "Required";
    else if (confirmPassword !== newPassword)
      next.confirmPassword = d.passwords_no_match;
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${baseURL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_password: newPassword,
          redirect_to: "/reset-password",
        }),
      });
      if (res.ok) {
        showSuccessToast(d.toast_success);
        router.push(getLocalizedUrl("/login", locale as Locale));
      } else {
        const data = await res.json().catch(() => ({}));
        showErrorToast(data.message || d.toast_error_generic);
      }
    } catch {
      showErrorToast(d.toast_error_network);
    } finally {
      setIsLoading(false);
    }
  };

  const cardBg = isDark ? "#3E256B" : "#FFFFFF";

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div
        className="w-full flex flex-col items-center gap-6"
        style={{
          maxWidth: "520px",
          borderRadius: hidden ? "0" : "24px",
          padding: hidden ? "32px 20px" : "44px 40px",
          backgroundColor: hidden ? "transparent" : cardBg,
          boxShadow: hidden ? "none" : "0 0 30px 0 rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo */}
        <Logo height={80} />

        {/* Heading */}
        <div className="flex flex-col gap-2 text-center">
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
          className="w-full flex flex-col gap-4"
          noValidate
        >
          {/* New password */}
          <div className="flex flex-col gap-1">
            <Label
              isDark={isDark}
              htmlFor="rp-new"
              required
            >
              {d.new_password_label}
            </Label>
            <Input
              id="rp-new"
              isDark={isDark}
              type={showNew ? "text" : "password"}
              placeholder={d.new_password_placeholder}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword)
                  setErrors((p) => ({ ...p, newPassword: "" }));
              }}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              startAdornment={
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label="toggle new password visibility"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9ZM12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
                      fill={showNew ? "#6948B8" : "#A89ED3"}
                    />
                  </svg>
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
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1">
            <Label
              isDark={isDark}
              htmlFor="rp-confirm"
              required
            >
              {d.confirm_password_label}
            </Label>
            <Input
              id="rp-confirm"
              isDark={isDark}
              type={showConfirm ? "text" : "password"}
              placeholder={d.confirm_password_placeholder}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              startAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label="toggle confirm password visibility"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9ZM12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
                      fill={showConfirm ? "#6948B8" : "#A89ED3"}
                    />
                  </svg>
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
          </div>

          {/* Submit */}
          <Button
            fullWidth
            isDark={isDark}
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? d.submitting : d.submit}
          </Button>

          {/* Back to login */}
          <div className="flex justify-center">
            <Link
              href={getLocalizedUrl("/login", locale as Locale)}
              className="flex items-center gap-1"
            >
              <i
                className="tabler-arrow-right"
                style={{
                  fontSize: "16px",
                  color: isDark ? "#D4BDFF" : "#6948B8",
                }}
              />
              <Typography
                variant="small"
                isDark={isDark}
                as="span"
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

export default ResetPassword;

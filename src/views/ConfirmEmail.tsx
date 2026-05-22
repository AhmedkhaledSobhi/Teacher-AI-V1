"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { SystemMode } from "@core/types";
import type { Locale } from "@configs/i18n";
import type { getDictionary } from "@/utils/getDictionary";

import Logo from "@/@core/svg/Logo";
import { getLocalizedUrl } from "@/utils/i18n";
import { showSuccessToast } from "@/utils/toast-utils";

import { Typography, Button } from "@/components/ui";

type ConfirmEmailProps = {
  mode: SystemMode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const ConfirmEmail = ({ mode, dictionary }: ConfirmEmailProps) => {
  const d = dictionary.confirm_email;
  const theme = useTheme();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const { lang } = useParams();
  const locale = (Array.isArray(lang) ? lang[0] : lang) as Locale;

  // Show success toast once on mount to confirm the link was sent
  useEffect(() => {
    showSuccessToast(d.subtitle);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cardBg = isDark ? "#6947B8" : "#FFFFFF";

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <div
        className="w-full flex flex-col items-center gap-6 text-center"
        style={{
          maxWidth: "520px",
          borderRadius: hidden ? "0" : "24px",
          padding: hidden ? "0 20px" : "44px 40px",
          backgroundColor: hidden ? "transparent" : cardBg,
          boxShadow: hidden ? "none" : "0 0 30px 0 rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo */}
        <Logo height={80} />

        {/* Heading */}
        <div className="flex flex-col gap-2">
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

        {/* OK button — navigate to login */}
        <Button
          fullWidth
          isDark={isDark}
          as={Link}
          href={getLocalizedUrl("/login", locale as Locale)}
        >
          {d.ok_btn}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmEmail;

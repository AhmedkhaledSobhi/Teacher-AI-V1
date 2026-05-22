"use client";

import { useState } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import classnames from "classnames";
import { toast } from "react-toastify";

import frontCommonStyles from "@views/front-pages/styles.module.css";

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating = ({
  value,
  onChange,
  isDark,
}: {
  value: number;
  onChange: (v: number) => void;
  isDark: boolean;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div
      className="flex gap-2 justify-start"
      dir="rtl"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-label={`${star} نجوم`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9"
              fill={filled ? "#f59e0b" : "none"}
              stroke={filled ? "#f59e0b" : isDark ? "#6b7280" : "#d1d5db"}
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

// ─── Field helpers ────────────────────────────────────────────────────────────

const fieldClass = (isDark: boolean) =>
  `w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border text-right ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-400"
      : "bg-[#f3f0ff] border-[#e8e0ff] text-gray-800 placeholder:text-gray-400 focus:border-purple-400"
  }`;

const labelClass = (isDark: boolean) =>
  `block text-sm font-semibold mb-1.5 text-right ${
    isDark ? "text-purple-200" : "text-purple-700"
  }`;

const typeBtn = (active: boolean, isDark: boolean) =>
  `flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
    active
      ? "bg-purple-600 text-white border-purple-600 shadow-md"
      : isDark
        ? "bg-white/5 text-white/60 border-white/10 hover:border-purple-400"
        : "bg-white text-gray-500 border-gray-200 hover:border-purple-400"
  }`;

// ─── Main component ───────────────────────────────────────────────────────────

const ContactUs = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // ── Contact form state
  const [contact, setContact] = useState({
    name: "",
    email: "",
    inquiry_type: "تقني" as "تقني" | "تعليمي" | "آخر",
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);

  // ── Feedback form state
  const [feedback, setFeedback] = useState({
    rating: 0,
    liked_features: "",
    suggestions: "",
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // ── Submit contact form → POST /api/v1/form/contact
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name || !contact.email || !contact.message) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    setContactLoading(true);
    try {
      const res = await fetch("/api/v1/form/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "حدث خطأ أثناء إرسال الرسالة");
      } else {
        toast.success("تم إرسال الرسالة بنجاح");
        setContact({ name: "", email: "", inquiry_type: "تقني", message: "" });
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setContactLoading(false);
    }
  };

  // ── Submit feedback form → POST /api/v1/form/feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.rating) {
      toast.error("يرجى اختيار تقييمك");
      return;
    }
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/v1/form/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: feedback.rating,
          liked_features: feedback.liked_features,
          suggestions: feedback.suggestions,
          device_type:
            typeof navigator !== "undefined"
              ? navigator.userAgent.slice(0, 50)
              : "unknown",
          duration_seconds: 0,
          session_id: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "حدث خطأ أثناء إرسال التقييم");
      } else {
        toast.success("شكراً! تم إرسال تقييمك بنجاح");
        setFeedback({ rating: 0, liked_features: "", suggestions: "" });
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ── Card style
  const cardSx = {
    borderRadius: "1.5rem",
    background: isDark ? "rgba(255,255,255,0.06)" : "#fff",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f3f0ff",
    boxShadow: isDark ? "none" : "0 4px 32px rgba(139,92,246,0.08)",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  };

  return (
    <section
      id="contact-us"
      dir="rtl"
      className="plb-[80px] md:plb-[100px]"
      style={{ background: isDark ? "#1e0d45" : "#ede8f5" }}
    >
      <div
        className={classnames(
          "flex flex-col gap-10",
          frontCommonStyles.layoutSpacing
        )}
      >
        {/* ── Badge + Heading ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 text-center">
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
                  d="M18.9148 10.5428L17.6187 7.94957C17.571 7.85412 17.5049 7.76902 17.4242 7.69911C17.3436 7.6292 17.25 7.57587 17.1487 7.54215C17.0475 7.50843 16.9406 7.49498 16.8341 7.50258C16.7276 7.51018 16.6237 7.53868 16.5283 7.58644L15.2652 8.21773L12.6045 7.51381C12.5362 7.49605 12.4645 7.49605 12.3962 7.51381L9.73549 8.21773L8.47241 7.58644C8.37698 7.53868 8.27306 7.51018 8.16661 7.50258C8.06016 7.49498 7.95325 7.50843 7.852 7.54215C7.75074 7.57587 7.65712 7.6292 7.57648 7.69911C7.49584 7.76902 7.42976 7.85412 7.38201 7.94957L6.08592 10.5423C6.03816 10.6377 6.00966 10.7416 6.00206 10.8481C5.99446 10.9545 6.00791 11.0614 6.04163 11.1627C6.07535 11.2639 6.12868 11.3576 6.19859 11.4382C6.2685 11.5188 6.3536 11.5849 6.44905 11.6327L7.82031 12.3188L10.6385 14.3315C10.68 14.361 10.7267 14.3826 10.7761 14.395L14.0265 15.2076C14.0946 15.2247 14.1659 15.2238 14.2336 15.2051C14.3012 15.1864 14.3628 15.1505 14.4125 15.1009L17.2094 12.3036L18.5512 11.6327C18.7438 11.5362 18.8902 11.3673 18.9583 11.1629C19.0264 10.9585 19.0106 10.7355 18.9143 10.5428H18.9148ZM16.1271 12.2375L14.3795 10.8378C14.3012 10.7751 14.2025 10.7436 14.1023 10.7493C14.0022 10.7551 13.9077 10.7976 13.8371 10.8688C12.9326 11.7799 11.9244 11.6647 11.2815 11.2584L13.4775 9.12529H15.093L16.475 11.8886L16.1271 12.2375ZM8.10878 8.3127L9.14839 8.83174L7.84976 11.4244L6.81218 10.9059L8.10878 8.3127ZM14.0001 14.363L11.0489 13.6256L8.55012 11.8409L9.97216 8.9968L12.5004 8.32692L12.9981 8.45846L10.7126 10.6768L10.7086 10.6814C10.6225 10.7674 10.5569 10.8717 10.5166 10.9865C10.4762 11.1013 10.4622 11.2236 10.4754 11.3446C10.4887 11.4655 10.5289 11.5819 10.5932 11.6852C10.6575 11.7885 10.7441 11.8761 10.8467 11.9414C11.8909 12.6083 13.1509 12.5001 14.1433 11.6875L15.5476 12.8155L14.0001 14.363ZM17.1489 11.4239L15.8528 8.83378L16.8919 8.3127L18.1885 10.9059L17.1489 11.4239ZM12.6923 16.1304C12.6704 16.2182 12.6197 16.2962 12.5484 16.3519C12.4771 16.4077 12.3892 16.438 12.2987 16.4382C12.2653 16.4381 12.2321 16.434 12.1997 16.426L10.0834 15.8968C10.0339 15.8846 9.98718 15.863 9.94575 15.8333L8.60751 14.8775C8.52522 14.8129 8.47103 14.719 8.45622 14.6154C8.4414 14.5119 8.4671 14.4066 8.52797 14.3215C8.58884 14.2364 8.68019 14.1781 8.78298 14.1587C8.88578 14.1392 8.99211 14.1602 9.07983 14.2172L10.3551 15.1284L12.3988 15.6383C12.5033 15.6644 12.5931 15.731 12.6486 15.8234C12.704 15.9158 12.7205 16.0264 12.6944 16.1309L12.6923 16.1304Z"
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
                  d="M18.9148 10.5423L17.6187 7.94908C17.571 7.85363 17.5049 7.76853 17.4242 7.69862C17.3436 7.62872 17.25 7.57538 17.1487 7.54166C17.0475 7.50794 16.9406 7.49449 16.8341 7.50209C16.7276 7.50969 16.6237 7.53819 16.5283 7.58595L15.2652 8.21724L12.6045 7.51332C12.5362 7.49556 12.4645 7.49556 12.3962 7.51332L9.73549 8.21724L8.47241 7.58595C8.37698 7.53819 8.27306 7.50969 8.16661 7.50209C8.06016 7.49449 7.95325 7.50794 7.852 7.54166C7.75074 7.57538 7.65712 7.62872 7.57648 7.69862C7.49584 7.76853 7.42976 7.85363 7.38201 7.94908L6.08592 10.5418C6.03816 10.6372 6.00966 10.7411 6.00206 10.8476C5.99446 10.954 6.00791 11.0609 6.04163 11.1622C6.07535 11.2634 6.12868 11.3571 6.19859 11.4377C6.2685 11.5183 6.3536 11.5844 6.44905 11.6322L7.82031 12.3183L10.6385 14.331C10.68 14.3606 10.7267 14.3821 10.7761 14.3945L14.0265 15.2071C14.0946 15.2242 14.1659 15.2233 14.2336 15.2046C14.3012 15.1859 14.3628 15.15 14.4125 15.1004L17.2094 12.3031L18.5512 11.6322C18.7438 11.5357 18.8902 11.3668 18.9583 11.1624C19.0264 10.958 19.0106 10.735 18.9143 10.5423H18.9148ZM16.1271 12.2371L14.3795 10.8374C14.3012 10.7747 14.2025 10.7431 14.1023 10.7489C14.0022 10.7546 13.9077 10.7971 13.8371 10.8683C12.9326 11.7795 11.9244 11.6642 11.2815 11.2579L13.4775 9.12481H15.093L16.475 11.8881L16.1271 12.2371ZM8.10878 8.31221L9.14839 8.83126L7.84976 11.4239L6.81218 10.9054L8.10878 8.31221ZM14.0001 14.3625L11.0489 13.6251L8.55012 11.8404L9.97216 8.99631L12.5004 8.32643L12.9981 8.45797L10.7126 10.6764L10.7086 10.6809C10.6225 10.767 10.5569 10.8712 10.5166 10.986C10.4762 11.1008 10.4622 11.2231 10.4754 11.3441C10.4887 11.465 10.5289 11.5814 10.5932 11.6847C10.6575 11.7881 10.7441 11.8756 10.8467 11.941C11.8909 12.6078 13.1509 12.4996 14.1433 11.687L15.5476 12.815L14.0001 14.3625ZM17.1489 11.4234L15.8528 8.83329L16.8919 8.31221L18.1885 10.9054L17.1489 11.4234ZM12.6923 16.1299C12.6704 16.2177 12.6197 16.2957 12.5484 16.3514C12.4771 16.4072 12.3892 16.4375 12.2987 16.4377C12.2653 16.4376 12.2321 16.4335 12.1997 16.4255L10.0834 15.8963C10.0339 15.8841 9.98718 15.8625 9.94575 15.8328L8.60751 14.877C8.52522 14.8124 8.47103 14.7185 8.45622 14.6149C8.4414 14.5114 8.4671 14.4061 8.52797 14.321C8.58884 14.2359 8.68019 14.1776 8.78298 14.1582C8.88578 14.1388 8.99211 14.1597 9.07983 14.2167L10.3551 15.1279L12.3988 15.6378C12.5033 15.6639 12.5931 15.7305 12.6486 15.8229C12.704 15.9153 12.7205 16.0259 12.6944 16.1304L12.6923 16.1299Z"
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
              شركاء في النجاح
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <Typography
              variant="h3"
              color="text.primary"
              className="font-extrabold text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-tight"
            >
              ساعدنا على التحسن..
            </Typography>
            <Typography
              variant="h3"
              className="font-extrabold text-[2rem] sm:text-[2.5rem] md:text-[3rem] leading-tight"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              وتواصل معنا لأي استفسار!
            </Typography>
          </div>
          <Typography
            color="text.secondary"
            className="max-w-xl text-base leading-relaxed"
          >
            رأيك يهمنا لنقدم تجربة تعليمية أفضل. قم بتقييم تجربتك أو أرسل لنا
            رسالة بأي استفسار فني أو تعليمي.
          </Typography>
        </div>

        {/* ── Two-column forms grid ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* ═══ LEFT — الدعم الفني ══════════════════════════════════ */}
          <Card
            elevation={0}
            sx={cardSx}
          >
            <CardContent className="p-6 md:p-8 flex flex-col flex-1">
              <Typography
                variant="h5"
                color="text.primary"
                className="font-bold text-center mb-6"
              >
                الدعم الفني
              </Typography>

              <form
                onSubmit={handleContactSubmit}
                className="flex flex-col flex-1 justify-between gap-6"
                dir="rtl"
              >
                {/* Fields group */}
                <div className="flex flex-col gap-5">
                  {/* الاسم */}
                  <div>
                    <label className={labelClass(isDark)}>
                      الاسم <span className="text-red-400">*</span>
                    </label>
                    <input
                      className={fieldClass(isDark)}
                      placeholder="أدخل اسمك"
                      value={contact.name}
                      onChange={(e) =>
                        setContact({ ...contact, name: e.target.value })
                      }
                      required
                      dir="rtl"
                    />
                  </div>

                  {/* البريد الإلكتروني */}
                  <div>
                    <label className={labelClass(isDark)}>
                      البريد الإلكتروني <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      className={fieldClass(isDark)}
                      placeholder="example@email.com"
                      value={contact.email}
                      onChange={(e) =>
                        setContact({ ...contact, email: e.target.value })
                      }
                      required
                      dir="ltr"
                    />
                  </div>

                  {/* نوع الاستفسار */}
                  <div>
                    <label className={labelClass(isDark)}>
                      نوع الاستفسار <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      {(["تقني", "تعليمي", "آخر"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={typeBtn(
                            contact.inquiry_type === t,
                            isDark
                          )}
                          onClick={() =>
                            setContact({ ...contact, inquiry_type: t })
                          }
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* الرسالة */}
                  <div>
                    <label className={labelClass(isDark)}>
                      الرسالة <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className={fieldClass(isDark) + " resize-none"}
                      placeholder="اكتب رسالتك هنا..."
                      value={contact.message}
                      onChange={(e) =>
                        setContact({ ...contact, message: e.target.value })
                      }
                      required
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Submit — always at the bottom */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={contactLoading}
                  sx={{
                    borderRadius: "0.875rem",
                    py: 1.75,
                    fontWeight: 700,
                    fontSize: "1rem",
                    minHeight: 56,
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)",
                    },
                  }}
                  startIcon={<i className="tabler-send text-lg" />}
                >
                  {contactLoading ? "جاري الإرسال..." : "إرسال الرسالة"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ═══ RIGHT — استبيان التقييم ══════════════════════════════ */}
          <Card
            elevation={0}
            sx={cardSx}
          >
            <CardContent className="p-6 md:p-8 flex flex-col flex-1">
              <Typography
                variant="h5"
                color="text.primary"
                className="font-bold text-center mb-6"
              >
                استبيان التقييم
              </Typography>

              <form
                onSubmit={handleFeedbackSubmit}
                className="flex flex-col flex-1 justify-between gap-6"
                dir="rtl"
              >
                {/* Fields group */}
                <div className="flex flex-col gap-5">
                  {/* تقييم النجوم */}
                  <div className="flex flex-col gap-2">
                    <label className={labelClass(isDark)}>
                      ما مدى رضاك عن تجربتك مع المعلم الذكي؟{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <StarRating
                      value={feedback.rating}
                      onChange={(v) => setFeedback({ ...feedback, rating: v })}
                      isDark={isDark}
                    />
                  </div>

                  {/* الميزات */}
                  <div>
                    <label className={labelClass(isDark)}>
                      ما هي الميزات التي أعجبتك بشكل كبير؟
                    </label>
                    <textarea
                      rows={4}
                      className={fieldClass(isDark) + " resize-none"}
                      placeholder="اكتب هنا..."
                      value={feedback.liked_features}
                      onChange={(e) =>
                        setFeedback({
                          ...feedback,
                          liked_features: e.target.value,
                        })
                      }
                      dir="rtl"
                    />
                  </div>

                  {/* الاقتراحات */}
                  <div>
                    <label className={labelClass(isDark)}>
                      ما هي اقتراحاتك للتحسين؟
                    </label>
                    <textarea
                      rows={4}
                      className={fieldClass(isDark) + " resize-none"}
                      placeholder="اكتب هنا..."
                      value={feedback.suggestions}
                      onChange={(e) =>
                        setFeedback({
                          ...feedback,
                          suggestions: e.target.value,
                        })
                      }
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Submit — always at the bottom */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={feedbackLoading}
                  sx={{
                    borderRadius: "0.875rem",
                    py: 1.75,
                    fontWeight: 700,
                    fontSize: "1rem",
                    minHeight: 56,
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)",
                    },
                  }}
                  startIcon={<i className="tabler-send text-lg" />}
                >
                  {feedbackLoading ? "جاري الإرسال..." : "إرسال التقييم"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;

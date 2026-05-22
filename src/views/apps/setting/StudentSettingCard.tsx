"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@mui/material/styles";
import type { getDictionary } from "@/utils/getDictionary";
import { Select } from "@/components/ui";

// Constants for name validation
const MAX_NAME_LENGTH = 50;
const DISPLAY_NAME_LIMIT = 25;

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const EditPencilIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserGearIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
      fill="currentColor"
    />
    <circle
      cx="19"
      cy="19"
      r="4"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M19 17.5v3M17.5 19h3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CameraIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="13"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const GRADE_OPTIONS = [
  { value: "1", label: "الصف الأول" },
  { value: "2", label: "الصف الثاني" },
  { value: "3", label: "الصف الثالث" },
  { value: "4", label: "الصف الرابع" },
  { value: "5", label: "الصف الخامس" },
  { value: "6", label: "الصف السادس" },
];

const TERM_NAMES: Record<string, string> = {
  "1": "الفصل الأول",
  "2": "الفصل الثاني",
  "3": "الفصل الثالث",
};

export default function StudentSettingsCard({ dictionary }: Props) {
  const { update: updateSession } = useSession();
  const { user: sessionRawUser } = useUser();
  const session = sessionRawUser ? { user: sessionRawUser } : null;
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = (dictionary as any)?.settings?.studentSettings || {};

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track whether the user has manually changed grade so session re-syncs don't overwrite it
  const gradeUserEdited = useRef(false);

  // Derive initial values from session
  const userMeta = (session?.user as any) ?? {};
  const sessionImage =
    (session?.user as any)?.profile_image_url ||
    (session?.user as any)?.avatar_url ||
    "";

  // Initialised once from session; never overwritten by re-renders
  const sessionInitialised = useRef(false);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Track initial (saved) values so we can detect unsaved changes
  const initialName = useRef("");
  const initialGrade = useRef("1");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Seed from session exactly once — when the session first loads
  useEffect(() => {
    if (session?.user && !sessionInitialised.current) {
      sessionInitialised.current = true;
      const meta = (session.user as any) ?? {};
      if (meta.name) {
        const nameStr = String(meta.name);
        setName(nameStr);
        initialName.current = nameStr;
      }
      if (meta.grade_id) {
        const gradeStr = String(meta.grade_id);
        setGrade(gradeStr);
        initialGrade.current = gradeStr;
      }
      if (sessionImage) setAvatarPreview(sessionImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size (max 5 MB)
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة صحيح.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 5 ميجابايت.");
      return;
    }

    setError("");
    setAvatarFile(file);

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setAvatarPreview(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      if (name.trim()) fd.append("name", name.trim());
      fd.append("grade_id", grade);

      if (avatarFile) fd.append("profile_iamge", avatarFile);

      const session = await getSession();
      const accessToken =
        (session as any)?.accessToken ||
        (session as any)?.session?.access_token;
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "https://drsi.ai";
      const res = await fetch(`${backendUrl}/api/v1/auth/student`, {
        method: "PATCH",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.detail || data?.message || "فشل الحفظ");

      // Push the fresh user object from the API response directly into the
      // NextAuth JWT so every part of the app reflects the updated values
      // immediately (name, grade_id, profile_image_url, etc.).
      if (data?.user) {
        await updateSession(data.user);
      } else {
        await updateSession();
      }

      setAvatarFile(null);
      gradeUserEdited.current = false;
      initialName.current = name.trim();
      initialGrade.current = grade;
      // Allow session re-seed only if the API pushes a new name
      // (sessionInitialised stays true so no accidental overwrite)
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  };

  const termId = String(userMeta?.term_id || "2");

  // Derive whether there is anything unsaved to enable/disable the save button
  const hasChanges =
    name.trim() !== initialName.current ||
    grade !== initialGrade.current ||
    avatarFile !== null;

  return (
    <div
      className="setting-card"
      dir="ltr"
    >
      {/* Header */}
      <div className="setting-card-header">
        <span className="setting-card-icon">
          <UserGearIcon />
        </span>
        <h2 className="setting-card-title">{t.title || "اعدادات الطالب"}</h2>
      </div>

      {/* Avatar + form */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Form */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Name */}
          <div className="setting-field">
            <label className="setting-label">
              {t.studentName || "أسم الطالب"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="setting-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.studentName || "أسم الطالب"}
                dir="rtl"
                maxLength={MAX_NAME_LENGTH}
              />
              {name.length > DISPLAY_NAME_LIMIT && (
                <p className="setting-hint-text" style={{ marginTop: 4, fontSize: 11, color: "#F0A500" }}>
                  {t.nameTruncateWarning || `الاسم طويل وسيظهر كـ "${name.split(/\s+/)[0]}..." في القائمة`}
                </p>
              )}
              <span
                className="setting-input-icon"
                aria-hidden="true"
              >
                <EditPencilIcon />
              </span>
            </div>
          </div>

          {/* Grade */}
          <div className="setting-field">
            <label className="setting-label">{t.grade || "الصف الدراسي"}</label>
            <Select
              isDark={isDark}
              options={GRADE_OPTIONS}
              value={grade}
              onChange={(e) => {
                gradeUserEdited.current = true;
                setGrade(e.target.value as string);
              }}
              placeholder={t.selectGrade || "اختر الصف"}
            />
            <p className="setting-warn-text">
              {t.gradeWarning ||
                "كن حذراً لا يمكنك تغيير الصف الدراسي سوا مرة واحدة كل 3 أشهر"}
            </p>
          </div>

          {/* Term (read-only) */}
          <div className="setting-field">
            <label className="setting-label">{t.term || "الفصل الدراسي"}</label>
            <div
              className="setting-input setting-input-readonly"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span className="setting-badge-auto">
                {t.termAutomatic || "تلقائي"}
              </span>
              <span>{TERM_NAMES[termId] || TERM_NAMES["2"]}</span>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginTop: 28,
          }}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
            aria-label="رفع صورة الملف الشخصي"
          />

          <div style={{ position: "relative" }}>
            {/* Avatar circle */}
            <button
              type="button"
              onClick={handleAvatarClick}
              aria-label={t.editAvatar || "تغيير الصورة الشخصية"}
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: "3px solid var(--quiz-purple-mid)",
                boxShadow: "0 4px 16px var(--quiz-purple-mid)",
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                background: avatarPreview
                  ? "transparent"
                  : "linear-gradient(180deg, var(--quiz-purple) 0%, #BDA4F2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="صورة الملف الشخصي"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 48, lineHeight: 1 }}>👦</span>
              )}
            </button>

            {/* Camera badge */}
            <button
              type="button"
              onClick={handleAvatarClick}
              aria-label={t.editAvatar || "رفع صورة"}
              className="setting-avatar-edit-btn"
            >
              <CameraIcon />
            </button>
          </div>

          <span
            style={{
              fontSize: 12,
              color: "var(--quiz-sub)",
              textAlign: "center",
              fontFamily: "var(--quiz-font)",
            }}
          >
            {t.tapToChange || "اضغط لتغيير الصورة"}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && <p className="setting-error-text">{error}</p>}

      {/* Success banner */}
      {saved && !error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 12,
            background: "rgba(34, 197, 94, 0.12)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#16a34a",
            fontSize: 14,
            fontFamily: "var(--quiz-font)",
            marginTop: 4,
          }}
          role="status"
          aria-live="polite"
        >
          <CheckIcon />
          <span>{t.savedSuccess || "تم حفظ التغييرات بنجاح!"}</span>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className={`setting-save-btn${saved ? " saved" : ""}${!hasChanges && !saving ? " disabled" : ""}`}
      >
        {saving
          ? t.saving || "جاري الحفظ..."
          : saved
            ? t.savedSuccess || "تم الحفظ!"
            : t.saveChanges || "حفظ التغييرات"}
      </button>
    </div>
  );
}

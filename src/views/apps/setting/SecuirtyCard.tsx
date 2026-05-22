"use client";

import { useState } from "react";
import api from "@/utils/api";
import type { getDictionary } from "@/utils/getDictionary";

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
};

const ShieldIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
      fill="currentColor"
      opacity="0.85"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="#FFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 1l22 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="setting-field">
      <label className="setting-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="setting-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="rtl"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          className="setting-eye-btn"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

export default function SecurityCard({ dictionary }: Props) {
  const t = (dictionary as any)?.settings?.security || {};

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (newPwd.length < 8) {
      setError(
        t.passwordTooShort || "يجب أن تكون كلمة المرور 8 أحرف على الأقل."
      );
      return;
    }
    if (newPwd !== confirmPwd) {
      setError(t.passwordMismatch || "كلمتا المرور غير متطابقتين.");
      return;
    }
    setSaving(true);
    try {
      const data = await api.patch<any>("/api/v1/auth/student/password", {
        current_password: currentPwd,
        new_password: newPwd,
        confirm_password: confirmPwd,
      });
      setSaved(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="setting-card"
      dir="rtl"
    >
      {/* Header */}
      <div className="setting-card-header">
        <span className="setting-card-icon">
          <ShieldIcon />
        </span>
        <h2 className="setting-card-title">
          {t.title || "الأمان وكلمة المرور"}
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PasswordField
          label={t.currentPassword || "كلمة المرور الحالية"}
          placeholder={
            t.currentPasswordPlaceholder || "أدخل كلمة المرور الحالية"
          }
          value={currentPwd}
          onChange={setCurrentPwd}
        />

        {/* 2-col row */}
        <div className="setting-two-col">
          <PasswordField
            label={t.confirmPassword || "تأكيد كلمة المرور الجديدة"}
            placeholder={
              t.confirmPasswordPlaceholder || "أكد كلمة المرور الجديدة"
            }
            value={confirmPwd}
            onChange={setConfirmPwd}
          />
          <PasswordField
            label={t.newPassword || "كلمة المرور الجديدة"}
            placeholder={t.newPasswordPlaceholder || "أدخل كلمة المرور الجديدة"}
            value={newPwd}
            onChange={setNewPwd}
          />
        </div>

        {error && <p className="setting-error-text">{error}</p>}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`setting-save-btn${saved ? " saved" : ""}`}
        style={{ marginTop: 24 }}
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

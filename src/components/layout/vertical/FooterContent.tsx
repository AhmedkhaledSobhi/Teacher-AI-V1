"use client";

// Third-party Imports
import classnames from "classnames";

// Util Imports
import { verticalLayoutClasses } from "@layouts/utils/layoutClasses";

const FooterContent = () => {
  return (
    <div
      className={classnames(
        verticalLayoutClasses.footerContent,
        "flex items-center justify-center"
      )}
    >
      <p
        style={{
          color: "var(--BackgroundSecondary, #BDA4F2)",
          textAlign: "center",
          fontFamily: '"Readex Pro", sans-serif',
          fontSize: "18px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "28.8px",
        }}
      >
        منصة المعلم الذكي - رحلتك التعليمية تبدأ هنا 🌟
      </p>
    </div>
  );
};

export default FooterContent;

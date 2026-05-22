"use client";

// React Imports
import { useEffect } from "react";

// MUI Imports
import { useColorScheme } from "@mui/material";

// Type Imports
import type { SystemMode } from "@core/types";

// Component Imports
import HeroSection from "./HeroSection";
import PainPointsMarquee from "./PainPointsMarquee";
import UsefulFeature from "./UsefulFeature";
import CustomerReviews from "./CustomerReviews";
import OurTeam from "./OurTeam";
import SmartTests from "./SmartTests";
import ProgressDashboard from "./ProgressDashboard";
import SubjectsMarquee from "./SubjectsMarquee";
import Pricing from "./Pricing";
import ProductStat from "./ProductStat";
import Faqs from "./Faqs";
import GetStarted from "./GetStarted";
import ContactUs from "./ContactUs";
import { useSettings } from "@core/hooks/useSettings";

const LandingPageWrapper = ({ mode }: { mode: SystemMode }) => {
  const { updatePageSettings } = useSettings();
  const { mode: muiMode, systemMode } = useColorScheme();
  const isDark = (muiMode === "system" ? systemMode : muiMode) === "dark";

  // For Page specific settings
  useEffect(() => {
    return updatePageSettings({ skin: "default" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unified bg tokens used by every child section via CSS vars
  const sectionBg = isDark ? "#1e0d45" : "#ede8f5";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(120,80,200,0.1)";

  return (
    <div
      dir="rtl"
      style={{
        background: sectionBg,
        // publish tokens so every child section can use them without prop-drilling
        ["--lp-bg" as string]: sectionBg,
        ["--lp-card-bg" as string]: cardBg,
        ["--lp-card-border" as string]: cardBorder,
        ["--lp-text" as string]: isDark ? "#ffffff" : "#2d1060",
        ["--lp-sub" as string]: isDark
          ? "rgba(255,255,255,0.65)"
          : "rgba(45,16,96,0.65)",
      }}
    >
      <HeroSection />
      <PainPointsMarquee />
      <OurTeam />
      <UsefulFeature />
      <SmartTests />
      <ProgressDashboard />
      <SubjectsMarquee />
      {/* <CustomerReviews /> */}
      {/* <Pricing /> */}
      {/* <ProductStat /> */}
      <Faqs />
      <ContactUs />
      <GetStarted mode={mode} />
    </div>
  );
};

export default LandingPageWrapper;

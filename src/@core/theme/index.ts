// Next Imports
import { Baloo_2, Readex_Pro } from "next/font/google";

// MUI Imports
import type { Theme } from "@mui/material/styles";

// Type Imports
import type { Settings } from "@core/contexts/settingsContext";
import type { SystemMode, Skin } from "@core/types";

// Theme Options Imports
import overrides from "./overrides";
import colorSchemes from "./colorSchemes";
import spacing from "./spacing";
import shadows from "./shadows";
import customShadows from "./customShadows";
import typography from "./typography";

const baloo_2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const readex_pro = Readex_Pro({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});
// Export fonts for use in components
export { baloo_2, readex_pro };

const theme = (
  settings: Settings,
  mode: SystemMode,
  direction: Theme["direction"],
  locale?: string
): Theme => {
  // Use Readex_pro font for Arabic locale, Baloo 2 for others
  const fontFamily =
    locale === "ar" ? readex_pro.style.fontFamily : baloo_2.style.fontFamily;

  return {
    direction,
    components: overrides(settings.skin as Skin),
    colorSchemes: colorSchemes(settings.skin as Skin),
    ...spacing,
    shape: {
      borderRadius: 6,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10,
      },
    },
    shadows: shadows(mode),
    typography: typography(fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: "47 43 61",
      dark: "225 222 245",
      lightShadow: "47 43 61",
      darkShadow: "19 17 32",
    },
  } as Theme;
};

export default theme;

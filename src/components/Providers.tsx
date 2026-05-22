// Type Imports
import type { ChildrenType, Direction } from "@core/types";

// Context Imports
import { NextAuthProvider } from "@/contexts/nextAuthProvider";
import { VerticalNavProvider } from "@menu/contexts/verticalNavContext";
import { SettingsProvider } from "@core/contexts/settingsContext";
import ThemeProvider from "@components/theme";
import ReduxProvider from "@/redux-store/ReduxProvider";

// Styled Component Imports
import AppReactToastify from "@/libs/styles/AppReactToastify";

// Util Imports
import {
  getMode,
  getSettingsFromCookie,
  getSystemMode,
} from "@core/utils/serverHelpers";
import { PremiumModalProvider } from "@/contexts/PremiumModalContext";
import PremiumModal from "./dialogs/premium";

type Props = ChildrenType & {
  direction: Direction;
  locale?: string;
};

const Providers = async (props: Props) => {
  // Props
  const { children, direction, locale } = props;

  // Vars
  const mode = await getMode();
  const settingsCookie = await getSettingsFromCookie();
  const systemMode = await getSystemMode();

  return (
    <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
      <VerticalNavProvider>
        <SettingsProvider
          settingsCookie={settingsCookie}
          mode={mode}
        >
          <ThemeProvider
            direction={direction}
            systemMode={systemMode}
            locale={locale}
          >
            <PremiumModalProvider>
              <ReduxProvider>{children}</ReduxProvider>
              <PremiumModal />
            </PremiumModalProvider>
            <AppReactToastify
              direction={direction}
              hideProgressBar
            />
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </NextAuthProvider>
  );
};

export default Providers;

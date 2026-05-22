// MUI Imports
import Button from "@mui/material/Button";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";

// Third-party Imports
import "react-perfect-scrollbar/dist/css/styles.css";

// Type Imports
import type { ChildrenType } from "@core/types";

// Context Imports
import { IntersectionProvider } from "@/contexts/intersectionContext";

// Component Imports
import Providers from "@components/Providers";
import BlankLayout from "@layouts/BlankLayout";
import FrontLayout from "@components/layout/front-pages";
import ScrollToTop from "@core/components/scroll-to-top";

// Util Imports
import { getSystemMode } from "@core/utils/serverHelpers";

// Style Imports
import "@/app/globals.css";

// Generated Icon CSS Imports
import "@assets/iconify-icons/generated-icons.css";

// Font Imports
import { baloo_2 } from "@core/theme";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://drsi.ai/"),
  title: "المعلم الذكي - منصة التعلم الذكي",
  description:
    "المعلم الذكي - منصة تعليمية ذكية مصممة لتعزيز التجارب التعليمية من خلال أدوات وموارد مدعومة بالذكاء الاصطناعي.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "المعلم الذكي - منصة التعلم الذكي",
    description:
      "أول معلم ذكي للمناهج السعودية. يشرح، يختبر، ويحلل أداء طفلك بذكاء اصطناعي يفهم احتياجاته ويجعل التعلم رحلة ممتعة.",
    images: [
      {
        url: "/images/personas/og-image.png",
        width: 1200,
        height: 630,
        alt: "المعلم الذكي - منصة التعلم الذكي",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "المعلم الذكي - منصة التعلم الذكي",
    description:
      "أول معلم ذكي للمناهج السعودية. يشرح، يختبر، ويحلل أداء طفلك بذكاء اصطناعي يفهم احتياجاته ويجعل التعلم رحلة ممتعة.",
    images: ["/images/personas/og-image.png"],
  },
};

const Layout = async ({ children }: ChildrenType) => {
  // Vars
  const systemMode = await getSystemMode();

  // For now, front-pages use English font (Baloo 2)
  // TODO: Move front-pages under [lang] structure for proper i18n support
  const fontClass = baloo_2.className;
  const direction = "ltr";

  return (
    <html
      id="__next"
      dir={direction}
      suppressHydrationWarning
    >
      <body
        className={`flex is-full min-bs-full flex-auto flex-col ${fontClass}`}
      >
        <InitColorSchemeScript
          attribute="data"
          defaultMode={systemMode}
        />
        <Providers direction={direction}>
          <BlankLayout systemMode={systemMode}>
            <IntersectionProvider>
              <FrontLayout>
                {children}
                <ScrollToTop className="mui-fixed">
                  <Button
                    variant="contained"
                    className="is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center"
                  >
                    <i className="tabler-arrow-up" />
                  </Button>
                </ScrollToTop>
              </FrontLayout>
            </IntersectionProvider>
          </BlankLayout>
        </Providers>
      </body>
    </html>
  );
};

export default Layout;

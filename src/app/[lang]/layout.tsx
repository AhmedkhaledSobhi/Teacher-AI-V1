// Next Imports
import { headers } from "next/headers";
import Script from "next/script";

// MUI Imports
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";

// Third-party Imports
import "react-perfect-scrollbar/dist/css/styles.css";

// Type Imports
import type { ChildrenType } from "@core/types";
import type { Locale } from "@configs/i18n";

// Component Imports

// HOC Imports
import TranslationWrapper from "@/hocs/TranslationWrapper";

// Config Imports
import { i18n } from "@configs/i18n";

// Util Imports
import { getSystemMode } from "@core/utils/serverHelpers";

// Style Imports
import "@/app/globals.css";

// Generated Icon CSS Imports
import "@assets/iconify-icons/generated-icons.css";

// Font Imports
import { baloo_2, readex_pro } from "@core/theme";

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

const RootLayout = async (
  props: ChildrenType & { params: Promise<{ lang: Locale }> }
) => {
  const params = await props.params;

  const { children } = props;

  // Vars
  const headersList = await headers();
  const systemMode = await getSystemMode();
  const direction = i18n.langDirection[params.lang];
  const fontClass =
    params.lang === "ar" ? readex_pro.className : baloo_2.className;

  return (
    <TranslationWrapper
      headersList={headersList}
      lang={params.lang}
    >
      <html
        id="__next"
        lang={params.lang}
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
          {children}
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "wg9oxjbis0");`,
            }}
          />
        </body>
      </html>
    </TranslationWrapper>
  );
};

export default RootLayout;

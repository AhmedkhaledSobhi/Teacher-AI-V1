"use client";

// React Imports
import { useEffect } from "react";

// Next Imports
import { usePathname } from "next/navigation";
import Link from "next/link";

// MUI Imports
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";

// Third-party Imports
import classnames from "classnames";

// Type Imports
import type { Mode } from "@core/types";

// Hook Imports
import { useIntersection } from "@/hooks/useIntersection";

// Component Imports
import DropdownMenu from "./DropdownMenu";

type Props = {
  mode: Mode;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
};

type WrapperProps = {
  children: React.ReactNode;
  isBelowLgScreen: boolean;
  className?: string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
};

const Wrapper = (props: WrapperProps) => {
  const {
    children,
    isBelowLgScreen,
    className,
    isDrawerOpen,
    setIsDrawerOpen,
  } = props;

  if (isBelowLgScreen) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { width: ["100%", 300] } }}
        className={classnames("p-5", className)}
      >
        <div className="p-4 flex flex-col gap-x-3">
          <IconButton
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inline-end-4 block-start-2"
          >
            <i className="tabler-x" />
          </IconButton>
          {children}
        </div>
      </Drawer>
    );
  }

  return (
    <div
      className={classnames(
        "flex items-center flex-wrap gap-x-4 gap-y-3",
        className
      )}
    >
      {children}
    </div>
  );
};

const FrontMenu = (props: Props) => {
  const { isDrawerOpen, setIsDrawerOpen, mode } = props;

  const pathname = usePathname();
  const isBelowLgScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg")
  );
  const { intersections } = useIntersection();

  useEffect(() => {
    if (!isBelowLgScreen && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [isBelowLgScreen, isDrawerOpen, setIsDrawerOpen]);

  return (
    <Wrapper
      isBelowLgScreen={isBelowLgScreen}
      isDrawerOpen={isDrawerOpen}
      setIsDrawerOpen={setIsDrawerOpen}
    >
      <Typography
        color="text.primary"
        component={Link}
        href="/ar"
        className={classnames("font-medium plb-3 pli-2 hover:text-primary", {
          "text-primary":
            !intersections.features &&
            !intersections.faq &&
            !intersections["contact-us"] &&
            (pathname === "/ar" || pathname === "/front-pages/"),
        })}
        style={{ whiteSpace: "nowrap", fontSize: "15px" }}
      >
        الرئيسية
      </Typography>
      <Typography
        color="text.primary"
        component={Link}
        href="/ar#features"
        className={classnames("font-medium plb-3 pli-2 hover:text-primary", {
          "text-primary": intersections.features,
        })}
        style={{ whiteSpace: "nowrap", fontSize: "15px" }}
      >
        الميزات
      </Typography>
      <Typography
        color="text.primary"
        component={Link}
        href="/ar#faq"
        className={classnames("font-medium plb-3 pli-2 hover:text-primary", {
          "text-primary": intersections.faq,
        })}
        style={{ whiteSpace: "nowrap", fontSize: "15px" }}
      >
        الأسئلة الشائعة
      </Typography>
      <Typography
        color="text.primary"
        component={Link}
        href="/ar#contact-us"
        className={classnames("font-medium plb-3 pli-2 hover:text-primary", {
          "text-primary": intersections["contact-us"],
        })}
        style={{ whiteSpace: "nowrap", fontSize: "15px" }}
      >
        تواصل معنا
      </Typography>

      {/* Mobile-only auth buttons */}
      {isBelowLgScreen && (
        <div className="flex flex-col gap-3 mt-6 w-full">
          <Link
            href="/ar/login"
            onClick={() => setIsDrawerOpen(false)}
            style={{
              display: "flex",
              height: "44px",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 25px",
              borderRadius: "100px",
              border: "1.5px solid rgba(85, 49, 168, 0.3)",
              background: "transparent",
              fontFamily: '"Readex Pro", sans-serif',
              fontWeight: 600,
              fontSize: "15px",
              color: "var(--mui-palette-text-primary)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            تسجيل الدخول
          </Link>

          <Link
            href="/ar/register"
            onClick={() => setIsDrawerOpen(false)}
            style={{
              display: "flex",
              height: "44px",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 25px",
              borderRadius: "100px",
              border: "1.25px solid rgba(255,255,255,0.20)",
              background: "linear-gradient(90deg, #B656C0 0%, #5531A8 100%)",
              fontFamily: '"Readex Pro", sans-serif',
              fontWeight: 700,
              fontSize: "15px",
              color: "#FFFFFF",
              textDecoration: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 0 20px 0 rgba(105,72,184,0.50)",
            }}
          >
            ابدأ مجاناً
          </Link>
        </div>
      )}
    </Wrapper>
  );
};

export default FrontMenu;

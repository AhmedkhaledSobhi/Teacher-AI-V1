// Component Imports
import LayoutNavbar from "@layouts/components/vertical/Navbar";
import NavbarContent from "./NavbarContent";
import classNames from "classnames";
import { verticalLayoutClasses } from "@/@layouts/utils/layoutClasses";

const Navbar = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        position: "sticky",
        top: 0,
        zIndex: 99999,
        width: "100%",

        transform: "translate3d(0,0,0)",
        willChange: "transform",
        backfaceVisibility: "hidden",

        WebkitTransform: "translate3d(0,0,0)",
      }}
    >
      <NavbarContent />
    </div>
  );
};

export default Navbar;

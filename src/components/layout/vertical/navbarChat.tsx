// Component Imports
import LayoutNavbar from "@layouts/components/vertical/Navbar";
import NavbarChatContent from "./navbarChatContent";

const NavbarChat = ({
  handleSidebarToggleChat,
  sidebarOpen,
}: {
  handleSidebarToggleChat: () => void;
  sidebarOpen: boolean;
}) => {
  return (
    <LayoutNavbar>
      <NavbarChatContent
        handleSidebarToggleChat={handleSidebarToggleChat}
        sidebarOpen={sidebarOpen}
      />
    </LayoutNavbar>
  );
};

export default NavbarChat;

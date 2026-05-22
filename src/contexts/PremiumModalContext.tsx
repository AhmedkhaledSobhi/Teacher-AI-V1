"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

type PremiumModalContextType = {
  openPremiumModal: () => void;
  closePremiumModal: () => void;
  isPremiumModalOpen: boolean;
};

const PremiumModalContext = createContext<PremiumModalContextType>({
  openPremiumModal: () => {},
  closePremiumModal: () => {},
  isPremiumModalOpen: false,
});

export const usePremiumModal = () => useContext(PremiumModalContext);

export const PremiumModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPremiumModal = useCallback(() => setIsOpen(true), []);
  const closePremiumModal = useCallback(() => setIsOpen(false), []);

  return (
    <PremiumModalContext.Provider
      value={{
        openPremiumModal,
        closePremiumModal,
        isPremiumModalOpen: isOpen,
      }}
    >
      {children}
    </PremiumModalContext.Provider>
  );
};

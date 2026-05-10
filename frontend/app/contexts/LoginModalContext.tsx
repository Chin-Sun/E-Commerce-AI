import { createContext, useContext, useState, type ReactNode } from "react";

type LoginModalContextType = {
  isOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const LoginModalContext = createContext<LoginModalContextType | null>(null);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <LoginModalContext.Provider
      value={{
        isOpen,
        openLoginModal: () => setIsOpen(true),
        closeLoginModal: () => setIsOpen(false),
      }}
    >
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx)
    throw new Error("useLoginModal must be used within LoginModalProvider");
  return ctx;
}

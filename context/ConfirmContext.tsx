"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import ModernConfirm from "@/components/ModernConfirm";

interface ConfirmOptions {
  title: string;
  message: string;
  type?: "danger" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const resolver = useRef<(value: boolean) => void>();

  const confirm = useCallback((options: ConfirmOptions) => {
    setModalState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || "info"
    });

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    resolver.current?.(true);
  };

  const handleCancel = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    resolver.current?.(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ModernConfirm
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

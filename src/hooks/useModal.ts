import { useState } from "react";

// Hook pour gérer l'état du modal
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev: boolean) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

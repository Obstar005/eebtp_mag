import { type ReactNode } from "react";
import { Modal, ModalButton } from "./Modal";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  showCancelButton?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  size = "md",
  submitText = "Enregistrer",
  cancelText = "Annuler",
  loading = false,
  submitDisabled = false,
  showCancelButton = true,
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          {showCancelButton && (
            <ModalButton
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </ModalButton>
          )}
          <ModalButton
            type="submit"
            variant="primary"
            onClick={() => onSubmit()}
            loading={loading}
            disabled={submitDisabled}
          >
            {submitText}
          </ModalButton>
        </>
      }
    >
      <form onSubmit={handleSubmit}>{children}</form>
    </Modal>
  );
}

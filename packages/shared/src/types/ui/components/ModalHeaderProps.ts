/**
 * Props interface for ModalHeader component
 */
export interface ModalHeaderProps {
  /** Optional title to display (defaults to "Settings") */
  title?: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Optional custom close handler (defaults to Zustand closeModal action) */
  onClose?: () => void;
}

/**
 * SettingsModalProps interface for SettingsModal component.
 *
 * Defines the props contract for the SettingsModal component that provides
 * a customized dialog experience for application settings. Built on top of
 * shadcn/ui Dialog components with custom dimensions and styling.
 *
 * @module types/ui/components/SettingsModalProps
 */

import { ReactNode } from "react";

/**
 * Props interface for the SettingsModal component.
 *
 * This interface defines the properties required for the SettingsModal component
 * which wraps shadcn/ui Dialog with custom styling and dimensions.
 *
 * @example
 * ```typescript
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <SettingsModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * >
 *   <SettingsForm />
 * </SettingsModal>
 * ```
 */
export interface SettingsModalProps {
  /**
   * Whether the modal is open.
   * Controls the visibility state of the settings modal dialog.
   */
  open: boolean;

  /**
   * Callback fired when the modal open state changes.
   * Called when user closes modal via escape key, backdrop click, or close button.
   *
   * @param open - The new open state
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Optional content to render inside the modal.
   * Typically contains settings forms, configuration panels, or other settings UI.
   */
  children?: ReactNode;
}

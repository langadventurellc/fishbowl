/**
 * SettingsModalProps interface for SettingsModal component.
 *
 * Defines the props contract for the SettingsModal component that provides
 * a customized dialog experience for application settings. Built on top of
 * shadcn/ui Dialog components with custom dimensions, styling, and comprehensive
 * accessibility features for WCAG 2.1 AA compliance.
 *
 * @module types/ui/components/SettingsModalProps
 */

import { ReactNode } from "react";

/**
 * Props interface for the SettingsModal component.
 *
 * This interface defines the properties required for the SettingsModal component
 * which wraps shadcn/ui Dialog with custom styling, dimensions, and accessibility
 * features including focus management, keyboard navigation, and screen reader support.
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
 *
 * @example With custom accessibility labels
 * ```typescript
 * <SettingsModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Advanced Settings"
 *   description="Configure advanced application preferences and options"
 * >
 *   <AdvancedSettingsForm />
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

  /**
   * Optional custom title for the modal.
   * Used for screen reader announcements and ARIA labeling.
   * Defaults to "Settings" if not provided.
   *
   * @default "Settings"
   */
  title?: string;

  /**
   * Optional custom description for the modal.
   * Used for screen reader announcements and ARIA descriptions.
   * Defaults to a comprehensive description of settings functionality.
   */
  description?: string;
}

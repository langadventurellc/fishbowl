/**
 * Configuration options for the focus trap hook.
 */
export interface FocusTrapOptions {
  /** Whether the focus trap is currently active */
  isActive: boolean;
  /** Whether to restore focus to the previously focused element when deactivating */
  restoreFocus?: boolean;
  /** CSS selector for the element that should receive initial focus */
  initialFocusSelector?: string;
}

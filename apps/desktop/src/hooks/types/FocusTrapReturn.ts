import React from "react";

/**
 * Return value from the focus trap hook.
 */
export interface FocusTrapReturn {
  /** Ref to attach to the container element that should trap focus */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Function to programmatically set which element should receive initial focus */
  setInitialFocus: (element: HTMLElement | null) => void;
}

import React, { useState, useRef } from "react";
import { ContextMenuProps } from "@fishbowl-ai/shared";
import { MenuTriggerDisplay } from "./";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

/**
 * Enhanced ContextMenu Component
 *
 * Generic context menu component that preserves the existing API while internally
 * leveraging shadcn/ui DropdownMenu primitives for enhanced accessibility and positioning.
 * This hybrid approach maintains click-trigger behavior while adding Radix UI benefits.
 *
 * Enhanced Features:
 * - Preserved API compatibility with existing ContextMenuProps
 * - Enhanced accessibility via Radix UI primitives (ARIA labels, keyboard navigation)
 * - Improved positioning with automatic viewport detection
 * - Better keyboard support (arrow keys, Enter, Escape, Tab)
 * - Screen reader compatibility and focus management
 * - Consistent theming via shadcn/ui CSS variables
 * - Click-trigger behavior using DropdownMenu (correct primitive for this pattern)
 *
 * Usage Examples:
 * ```tsx
 * // Basic usage (API unchanged)
 * <ContextMenu>
 *   <DropdownMenuItem>Copy</DropdownMenuItem>
 *   <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
 * </ContextMenu>
 *
 * // Custom trigger and positioning (API unchanged)
 * <ContextMenu trigger={<CustomButton />} position="above">
 *   <DropdownMenuItem>Action 1</DropdownMenuItem>
 *   <DropdownMenuItem>Action 2</DropdownMenuItem>
 * </ContextMenu>
 * ```
 */
export function ContextMenu({
  trigger,
  position = "below",
  children,
  className = "",
  disabled = false,
}: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Handle trigger click to programmatically open/close menu
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    setIsOpen((prev) => !prev);
  };

  // Convert position prop to shadcn/ui side prop
  const getSideFromPosition = () => {
    switch (position) {
      case "above":
        return "top";
      case "below":
        return "bottom";
      case "auto":
        return "bottom"; // Default to bottom, Radix will auto-adjust for viewport
      default:
        return "bottom";
    }
  };

  // Handle menu state changes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // Wrapper div to enable click trigger with dropdown menu
  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div className={`inline-block ${className}`}>
          {/* Click Trigger */}
          <div ref={triggerRef} onClick={handleTriggerClick}>
            {trigger ? (
              trigger
            ) : (
              <MenuTriggerDisplay
                variant={disabled ? "disabled" : isOpen ? "active" : "normal"}
              />
            )}
          </div>
        </div>
      </DropdownMenuTrigger>

      {/* Enhanced Dropdown Menu Content with shadcn/ui primitives */}
      <DropdownMenuContent
        side={getSideFromPosition() as "top" | "bottom" | "left" | "right"}
        align="end"
        className="min-w-[140px]"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

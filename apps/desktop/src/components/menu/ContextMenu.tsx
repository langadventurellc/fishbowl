import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ContextMenuProps } from "@fishbowl-ai/shared";
import { MenuTriggerDisplay } from "./";

/**
 * ContextMenu Component
 *
 * Generic context menu component that combines MenuTriggerDisplay with a custom
 * dropdown container for children-based composition. This component handles the
 * interaction pattern while accepting children for flexible menu content.
 *
 * Features:
 * - Internal state management for open/close behavior
 * - Custom trigger support or default ellipsis button
 * - Position configuration (above/below/auto)
 * - Keyboard support (ESC key to close)
 * - Click-outside-to-close functionality
 * - Children-based composition for flexible menu content
 *
 * Usage Examples:
 * ```tsx
 * // Basic usage
 * <ContextMenu>
 *   <MenuItemDisplay label="Copy" />
 *   <MenuItemDisplay label="Delete" variant="danger" />
 * </ContextMenu>
 *
 * // Custom trigger and positioning
 * <ContextMenu trigger={<CustomButton />} position="above">
 *   <MenuItemDisplay label="Action 1" />
 *   <MenuItemDisplay label="Action 2" />
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalMenuRef = useRef<HTMLDivElement>(null);

  // Handle trigger click to toggle menu
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    // Calculate position for portal rendering
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const actualPosition = getActualPosition();

      const newPosition = {
        top: actualPosition === "above" ? rect.top - 4 : rect.bottom + 4,
        left: rect.right - 140, // Align right edges, assuming min width of 140px
      };
      setMenuPosition(newPosition);
    }

    setIsOpen((prev) => !prev);
  };

  // Handle keyboard events (ESC to close)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as Node;
        const clickedInsideTrigger = menuRef.current?.contains(target);
        const clickedInsidePortalMenu = portalMenuRef.current?.contains(target);

        if (!clickedInsideTrigger && !clickedInsidePortalMenu) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Determine actual position based on auto positioning
  const getActualPosition = (): "above" | "below" => {
    if (position !== "auto") {
      return position as "above" | "below";
    }

    // For auto positioning, we could add viewport detection logic here
    // For now, default to "below" - could be enhanced with actual viewport detection
    return "below";
  };

  // Container styles for proper positioning
  const containerStyles: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
  };

  // Dropdown menu styles for portal rendering
  const getMenuStyles = (): React.CSSProperties => {
    return {
      position: "fixed",
      top: `${menuPosition.top}px`,
      left: `${menuPosition.left}px`,
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "4px",
      minWidth: "140px",
      zIndex: 9999,
    };
  };

  return (
    <>
      <div ref={menuRef} style={containerStyles} className={className}>
        {/* Trigger Element */}
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

      {/* Context Menu Dropdown - Rendered in portal for proper z-index layering */}
      {isOpen &&
        createPortal(
          <div ref={portalMenuRef} style={getMenuStyles()}>
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}

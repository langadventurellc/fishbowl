import React, { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import type { ResizeHandleProps } from "./ResizeHandle/ResizeHandleProps";

/**
 * ResizeHandle component provides a draggable vertical divider for adjusting sidebar width.
 * Handles mouse interactions, width constraints, and provides visual feedback.
 */
export default function ResizeHandle({
  onWidthChange,
  currentWidth,
  isDragging = false,
  onDraggingChange,
  minWidth = 150,
  maxWidth = 400,
  snapThreshold = 50,
}: ResizeHandleProps) {
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    x: number;
    width: number;
  } | null>(null);

  const actualIsDragging = isDragging || isLocalDragging;

  const calculateWidth = useCallback(
    (startWidth: number, startX: number, currentX: number): number => {
      const delta = currentX - startX;
      const newWidth = startWidth + delta;

      // Apply snap to collapse behavior
      if (newWidth < snapThreshold) {
        return 0;
      }

      // Apply min/max constraints
      return Math.min(maxWidth, Math.max(minWidth, newWidth));
    },
    [minWidth, maxWidth, snapThreshold],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsLocalDragging(true);
      onDraggingChange?.(true);
      setDragStart({
        x: e.clientX,
        width: currentWidth,
      });
    },
    [currentWidth, onDraggingChange],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragStart || !actualIsDragging) return;

      const newWidth = calculateWidth(dragStart.width, dragStart.x, e.clientX);
      onWidthChange(newWidth);
    },
    [dragStart, actualIsDragging, calculateWidth, onWidthChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsLocalDragging(false);
    setDragStart(null);
    onDraggingChange?.(false);
  }, []);

  // Global mouse event listeners during drag
  useEffect(() => {
    if (actualIsDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [actualIsDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={cn(
        "absolute top-0 right-0 bottom-0 w-1 cursor-col-resize",
        "bg-border/50 hover:bg-border",
        "transition-colors duration-150",
        actualIsDragging && "bg-border",
      )}
      onMouseDown={handleMouseDown}
      style={{
        // @ts-ignore - Electron-specific CSS property
        WebkitAppRegion: "no-drag",
      }}
      data-testid="resize-handle"
    />
  );
}

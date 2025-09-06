import React from "react";
import { cn } from "../../lib/utils";

interface CustomTitleBarProps {
  title?: string;
  className?: string;
  blended?: boolean; // Allow content to blend into title bar area
}

export function CustomTitleBar({
  title = "Roomful",
  className,
}: CustomTitleBarProps) {
  // Detect platform from Electron API or fallback to user agent
  const isMacOS = React.useMemo(() => {
    if (typeof window !== "undefined" && window.electronAPI?.platform) {
      return window.electronAPI.platform === "darwin";
    }
    // Fallback to user agent detection
    return (
      typeof navigator !== "undefined" && navigator.platform.startsWith("Mac")
    );
  }, []);

  return (
    <div
      className={cn(
        // Base title bar styling
        "flex h-8 w-full bg-transparent",
        // Draggable area - allows window movement
        "cursor-default select-none",
        // Platform-specific spacing for native controls
        isMacOS
          ? "pl-20 pr-4" // Space for macOS traffic lights on left
          : "pl-4 pr-32", // Space for Windows/Linux controls on right
        // When blended, use absolute positioning to overlay content
        "absolute top-0 left-0 right-0 z-50",
        className,
      )}
      style={
        {
          // Electron window dragging support
          WebkitAppRegion: "drag",
        } as React.CSSProperties
      }
      data-testid="custom-title-bar"
    >
      {/* Title text */}
      <div className="flex items-center justify-center flex-1">
        <span className="text-sm font-medium text-foreground/80 truncate">
          {title}
        </span>
      </div>
    </div>
  );
}

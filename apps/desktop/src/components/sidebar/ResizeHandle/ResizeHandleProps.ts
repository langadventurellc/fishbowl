export interface ResizeHandleProps {
  onWidthChange: (width: number) => void;
  currentWidth: number;
  isDragging?: boolean;
  onDraggingChange?: (dragging: boolean) => void;
  minWidth?: number;
  maxWidth?: number;
  snapThreshold?: number;
}

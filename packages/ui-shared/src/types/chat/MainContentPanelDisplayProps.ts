/**
 * Props for MainContentPanelDisplay component.
 * Primary content area that composes agent labels, chat area, and input sections
 * with proper flex layout and overflow handling.
 */

import type React from "react";
import { AgentViewModel } from "src/types/AgentViewModel";
import { LayoutVariant } from "src/types/components";
import { MessageViewModel } from "src/types/MessageViewModel";

export interface MainContentPanelDisplayProps {
  /**
   * List of agents participating in the conversation.
   * Used for agent pills display and message association.
   */
  agents: AgentViewModel[];

  /**
   * List of messages in the current conversation.
   * Used to render the chat area with proper message formatting.
   */
  messages: MessageViewModel[];

  /**
   * Initial text content for the input field.
   * Controls the default input value when component first mounts.
   * @default ""
   */
  defaultInputText?: string;

  /**
   * Initial mode setting for the conversation input.
   * Controls whether the input starts in manual or auto mode.
   * @default true (manual mode)
   */
  defaultManualMode?: boolean;

  /**
   * Callback function called when input text changes.
   * Allows parent components to react to input state changes.
   */
  onInputChange?: (text: string) => void;

  /**
   * Callback function called when input mode changes.
   * Allows parent components to react to mode toggle changes.
   */
  onModeChange?: (isManual: boolean) => void;

  /**
   * Layout variant affecting spacing and responsive behavior.
   * @default "default"
   */
  layoutVariant?: LayoutVariant;

  /**
   * Whether the panel should show visual borders.
   * Controls border display between panel sections.
   * @default true
   */
  showBorders?: boolean;

  /**
   * Additional CSS class names for the panel container.
   */
  className?: string;

  /**
   * Custom styles for the panel container.
   */
  style?: React.CSSProperties;
}

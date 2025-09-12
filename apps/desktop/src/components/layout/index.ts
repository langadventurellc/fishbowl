/**
 * Layout components barrel export.
 *
 * Re-exports all layout-related display components
 * for the conversation UI system. These components focus on pure layout structure
 * and visual composition without interactive functionality.
 *
 * Layout components compose smaller UI components into screen sections and handle
 * responsive behavior, spacing, and overall visual hierarchy.
 *
 * @module components/layout
 */

export { AgentLabelsContainerDisplay } from "./AgentLabelsContainerDisplay";
export { ChatContainerDisplay } from "./ChatContainerDisplay";
export { ConversationLayoutDisplay } from "./ConversationLayoutDisplay";
export { ConversationScreenDisplay } from "./ConversationScreenDisplay";
export { CustomTitleBar } from "./CustomTitleBar";
export { MainContentPanelDisplay } from "./MainContentPanelDisplay";

// Type re-exports for convenience
export type {
  AgentLabelsContainerDisplayProps,
  ChatContainerDisplayProps,
  ConversationLayoutDisplayProps,
  ConversationScreenDisplayProps,
  MainContentPanelDisplayProps,
} from "@fishbowl-ai/ui-shared";

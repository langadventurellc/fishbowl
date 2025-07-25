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

export { ConversationScreenDisplay } from "./ConversationScreenDisplay";
export { MainContentPanelDisplay } from "./MainContentPanelDisplay";
export { ChatContainerDisplay } from "./ChatContainerDisplay";
export { AgentLabelsContainerDisplay } from "./AgentLabelsContainerDisplay";
export { ConversationLayoutDisplay } from "./ConversationLayoutDisplay";

// Type re-exports for convenience
export type {
  ConversationScreenDisplayProps,
  MainContentPanelDisplayProps,
  ChatContainerDisplayProps,
  AgentLabelsContainerDisplayProps,
  ConversationLayoutDisplayProps,
} from "@fishbowl-ai/shared";

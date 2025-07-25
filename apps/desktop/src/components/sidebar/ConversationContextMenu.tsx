/**
 * ConversationContextMenu component for conversation-specific context menu functionality.
 *
 * A specialized context menu component for conversations that uses the generic ContextMenu
 * component internally while providing conversation-specific menu items and actions.
 * This component acts as a bridge between the low-level display components and
 * the ConversationItemDisplay's specific needs.
 *
 * @module components/sidebar/ConversationContextMenu
 */

import React from "react";
import { ConversationContextMenuProps } from "@fishbowl-ai/shared";
import { ContextMenu, MenuItemDisplay } from "../menu";

/**
 * ConversationContextMenu component for conversation-specific context menu functionality.
 *
 * This component provides a reusable conversation-specific context menu that uses
 * the generic ContextMenu component internally. It handles conversation-specific
 * menu items like Rename, Duplicate, and Delete actions while providing
 * a clean interface for ConversationItemDisplay to use.
 *
 * The component uses the generic ContextMenu for positioning and interaction
 * behavior, while composing MenuItemDisplay components for the actual menu items.
 * This creates a clean separation between generic menu functionality and
 * conversation-specific business logic.
 *
 * Menu items included:
 * - Rename: Allows renaming the conversation
 * - Duplicate: Creates a copy of the conversation
 * - Delete: Removes the conversation (typically with confirmation)
 *
 * @example
 * ```typescript
 * // Basic usage with conversation actions
 * <ConversationContextMenu
 *   conversation={conversation}
 *   onRename={() => handleRename(conversation.id)}
 *   onDuplicate={() => handleDuplicate(conversation)}
 *   onDelete={() => handleDelete(conversation.id)}
 * />
 *
 * // With positioning and custom styling
 * <ConversationContextMenu
 *   conversation={conversation}
 *   position="above"
 *   onRename={handleRename}
 *   onDuplicate={handleDuplicate}
 *   onDelete={handleDelete}
 *   className="custom-menu-style"
 * />
 * ```
 *
 * @param props - The ConversationContextMenu component props
 * @returns JSX element representing the conversation context menu
 */
export function ConversationContextMenu({
  position = "below",
  onRename,
  onDuplicate,
  onDelete,
  className = "",
}: ConversationContextMenuProps) {
  return (
    <ContextMenu position={position} className={className}>
      <div onClick={onRename} style={{ cursor: "pointer" }}>
        <MenuItemDisplay label="Rename conversation" action="rename" />
      </div>

      <div onClick={onDuplicate} style={{ cursor: "pointer" }}>
        <MenuItemDisplay label="Duplicate conversation" action="duplicate" />
      </div>

      <div onClick={onDelete} style={{ cursor: "pointer" }}>
        <MenuItemDisplay
          label="Delete conversation"
          action="delete"
          variant="danger"
        />
      </div>
    </ContextMenu>
  );
}

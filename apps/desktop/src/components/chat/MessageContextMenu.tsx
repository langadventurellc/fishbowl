/**
 * MessageContextMenu component for message-specific context menu functionality.
 *
 * A specialized context menu component for messages that uses the generic ContextMenu
 * component internally while providing message-specific menu items and actions.
 * This component acts as a bridge between the low-level display components and
 * the MessageItem's specific needs.
 *
 * @module components/chat/MessageContextMenu
 */

import React from "react";
import { MessageContextMenuProps } from "@fishbowl-ai/shared";
import { ContextMenu, MenuItemDisplay } from "../menu";

/**
 * MessageContextMenu component for message-specific context menu functionality.
 *
 * This component provides a reusable message-specific context menu that uses
 * the generic ContextMenu component internally. It handles message-specific
 * menu items like Copy, Delete, and optional Regenerate actions while providing
 * a clean interface for MessageItem to use.
 *
 * The component uses the generic ContextMenu for positioning and interaction
 * behavior, while composing MenuItemDisplay components for the actual menu items.
 * This creates a clean separation between generic menu functionality and
 * message-specific business logic.
 *
 * @example
 * ```typescript
 * // Basic usage with copy and delete actions
 * <MessageContextMenu
 *   message={message}
 *   onCopy={() => copyToClipboard(message.content)}
 *   onDelete={() => deleteMessage(message.id)}
 * />
 *
 * // With regeneration option and above positioning
 * <MessageContextMenu
 *   message={message}
 *   position="above"
 *   onCopy={handleCopy}
 *   onDelete={handleDelete}
 *   onRegenerate={handleRegenerate}
 *   canRegenerate={message.type === "agent"}
 * />
 * ```
 *
 * @param props - The MessageContextMenu component props
 * @returns JSX element representing the message context menu
 */
export function MessageContextMenu({
  position = "below",
  onCopy,
  onDelete,
  onRegenerate,
  canRegenerate = false,
  className = "",
}: MessageContextMenuProps) {
  return (
    <ContextMenu position={position} className={className}>
      <div onClick={onCopy} style={{ cursor: "pointer" }}>
        <MenuItemDisplay label="Copy message" action="copy" />
      </div>

      {canRegenerate && onRegenerate && (
        <div onClick={onRegenerate} style={{ cursor: "pointer" }}>
          <MenuItemDisplay label="Regenerate" action="regenerate" />
        </div>
      )}

      <div onClick={onDelete} style={{ cursor: "pointer" }}>
        <MenuItemDisplay label="Delete message" action="delete" />
      </div>
    </ContextMenu>
  );
}

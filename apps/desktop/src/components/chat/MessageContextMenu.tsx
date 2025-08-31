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

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MessageContextMenuProps } from "@fishbowl-ai/ui-shared";
import { ContextMenu } from "../menu";

/**
 * MessageContextMenu component for message-specific context menu functionality.
 *
 * This component provides a reusable message-specific context menu that uses
 * the generic ContextMenu component internally. It handles message-specific
 * menu items like Copy, Delete, and optional Regenerate actions while providing
 * a clean interface for MessageItem to use.
 *
 * The component uses the enhanced ContextMenu (now powered by shadcn/ui DropdownMenu)
 * for positioning and interaction behavior, while using DropdownMenuItem components
 * for the actual menu items. This provides enhanced accessibility, keyboard navigation,
 * and consistent theming via shadcn/ui.
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
 * // With above positioning
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
  className = "",
}: MessageContextMenuProps) {
  return (
    <ContextMenu position={position} className={className}>
      <DropdownMenuItem onClick={onCopy}>Copy message</DropdownMenuItem>

      <DropdownMenuItem onClick={onDelete} variant="destructive">
        Delete message
      </DropdownMenuItem>
    </ContextMenu>
  );
}

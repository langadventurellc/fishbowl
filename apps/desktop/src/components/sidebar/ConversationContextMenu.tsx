/**
 * ConversationContextMenu component for conversation-specific context menu functionality.
 *
 * @module components/sidebar/ConversationContextMenu
 */

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConversationContextMenuProps } from "@fishbowl-ai/ui-shared";
import { ContextMenu } from "../menu";

export function ConversationContextMenu({
  position = "below",
  onRename,
  onDelete,
  className = "",
}: ConversationContextMenuProps) {
  return (
    <ContextMenu position={position} className={className}>
      <DropdownMenuItem onClick={onRename}>
        Rename conversation
      </DropdownMenuItem>

      <DropdownMenuItem onClick={onDelete} variant="destructive">
        Delete conversation
      </DropdownMenuItem>
    </ContextMenu>
  );
}

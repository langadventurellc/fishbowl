import type { Conversation } from "@fishbowl-ai/shared";

export interface RenameConversationModalProps {
  /** The conversation to rename, null when modal is closed */
  conversation: Conversation | null;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

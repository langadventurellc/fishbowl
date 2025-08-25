export interface AddAgentToConversationModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** ID of the conversation to add agents to */
  conversationId: string;
  /** Optional callback fired after successful agent addition */
  onAgentAdded?: () => void;
}

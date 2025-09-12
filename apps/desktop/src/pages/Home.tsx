import { useConversationStore } from "@fishbowl-ai/ui-shared";
import { useEffect, useRef } from "react";
import {
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
} from "../components/layout";

export default function LayoutShowcase() {
  const { activeConversationId, selectConversation, conversations, loading } =
    useConversationStore();

  // Guard to ensure initial selection runs only once per mount
  const initialSelectionRef = useRef(false);

  // Handle initial conversation selection when conversations load
  useEffect(() => {
    // Only run once per mount, when conversations are loaded, no active conversation, and conversations exist
    if (
      !initialSelectionRef.current &&
      !loading.conversations &&
      activeConversationId === null &&
      conversations.length > 0
    ) {
      initialSelectionRef.current = true;

      // Select the most recent conversation
      const mostRecent = conversations
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )[0];

      if (mostRecent) {
        selectConversation(mostRecent.id);
      }
    }
  }, [
    loading.conversations,
    activeConversationId,
    conversations,
    selectConversation,
  ]);

  const handleConversationSelect = (conversationId: string | null) => {
    selectConversation(conversationId);
  };

  return (
    <ConversationScreenDisplay>
      <ConversationLayoutDisplay
        selectedConversationId={activeConversationId}
        onConversationSelect={handleConversationSelect}
      />
    </ConversationScreenDisplay>
  );
}

import React, { useState } from "react";
import {
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
} from "../components/layout";

export default function LayoutShowcase() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const handleConversationSelect = (conversationId: string | null) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <ConversationScreenDisplay>
      <ConversationLayoutDisplay
        defaultSidebarCollapsed={false}
        selectedConversationId={selectedConversationId}
        onConversationSelect={handleConversationSelect}
      />
    </ConversationScreenDisplay>
  );
}

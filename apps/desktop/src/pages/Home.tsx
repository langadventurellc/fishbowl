import React, { useState } from "react";
import {
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
} from "../components/layout";

export default function LayoutShowcase() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  // Debug logging for conversation selection as per task requirements
  const handleConversationSelect = (conversationId: string | null) => {
    console.log("Home: Setting selectedConversationId to:", conversationId);
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

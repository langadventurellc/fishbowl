import React, { useState } from "react";
import {
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
} from "../components/layout";

export default function LayoutShowcase() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  return (
    <ConversationScreenDisplay>
      <ConversationLayoutDisplay
        defaultSidebarCollapsed={false}
        selectedConversationId={selectedConversationId}
        onConversationSelect={setSelectedConversationId}
      />
    </ConversationScreenDisplay>
  );
}

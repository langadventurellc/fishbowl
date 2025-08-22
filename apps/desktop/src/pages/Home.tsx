import { useState } from "react";
import {
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
} from "../components/layout";

interface Message {
  id: string;
  agent: string;
  role: string;
  content: string;
  timestamp: string;
  type: "user" | "agent" | "system";
  isActive: boolean;
  agentColor: string;
}

interface Agent {
  name: string;
  role: string;
  color: string;
  isThinking: boolean;
}

interface Conversation {
  name: string;
  lastActivity: string;
  isActive: boolean;
}

export default function LayoutShowcase() {
  // Sample conversations data
  const conversations: Conversation[] = [];

  // Sample agents data
  const agents: Agent[] = [];

  // Sample messages data with realistic conversation flow
  const [messages] = useState<Message[]>([]);

  return (
    <ConversationScreenDisplay>
      <ConversationLayoutDisplay
        conversations={conversations}
        agents={agents}
        messages={messages}
        defaultSidebarCollapsed={false}
      />
    </ConversationScreenDisplay>
  );
}

import { useState } from "react";
import {
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
} from "../../components/layout";
import { ShowcaseLayout } from "../../components/showcase/ShowcaseLayout";

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
  const conversations: Conversation[] = [
    {
      name: "UI Component Design",
      lastActivity: "2 minutes ago",
      isActive: true,
    },
    {
      name: "Database Architecture",
      lastActivity: "1 hour ago",
      isActive: false,
    },
    {
      name: "Mobile App Planning",
      lastActivity: "3 hours ago",
      isActive: false,
    },
    {
      name: "API Optimization",
      lastActivity: "Yesterday",
      isActive: false,
    },
  ];

  // Sample agents data
  const agents: Agent[] = [
    {
      name: "Technical Advisor",
      role: "Technical Advisor",
      color: "#3b82f6",
      isThinking: false,
    },
    {
      name: "Project Manager",
      role: "Project Manager",
      color: "#22c55e",
      isThinking: true,
    },
    {
      name: "UX Designer",
      role: "UX Designer",
      color: "#a855f7",
      isThinking: false,
    },
  ];

  // Sample messages data with realistic conversation flow
  const [messages] = useState<Message[]>([
    {
      id: "1",
      agent: "System",
      role: "System",
      content: "Technical Advisor and UX Designer joined the conversation",
      timestamp: "2:15 PM",
      type: "system",
      isActive: true,
      agentColor: "#6b7280",
    },
    {
      id: "2",
      agent: "Technical Advisor",
      role: "Technical Advisor",
      content:
        "I've been reviewing our component architecture. We should consider implementing a design system with shadcn/ui to ensure consistency across the application. This will help with maintainability and provide better developer experience.",
      timestamp: "2:16 PM",
      type: "agent",
      isActive: true,
      agentColor: "#3b82f6",
    },
    {
      id: "3",
      agent: "UX Designer",
      role: "UX Designer",
      content:
        "That aligns perfectly with our design goals. I've been working on component specifications that include accessibility requirements and responsive behaviors. A unified design system would definitely streamline our workflow.",
      timestamp: "2:18 PM",
      type: "agent",
      isActive: true,
      agentColor: "#a855f7",
    },
    {
      id: "4",
      agent: "User",
      role: "User",
      content:
        "Sounds good! What's the timeline for implementing this? And how would it impact our current component library?",
      timestamp: "2:20 PM",
      type: "user",
      isActive: true,
      agentColor: "#6366f1",
    },
    {
      id: "5",
      agent: "Project Manager",
      role: "Project Manager",
      content:
        "From a project management perspective, I'd recommend a phased approach:\n\n1. **Phase 1** (Week 1-2): Set up shadcn/ui infrastructure and migrate core components\n2. **Phase 2** (Week 3-4): Update existing components to use the new system\n3. **Phase 3** (Week 5-6): Documentation and developer training\n\nThis approach minimizes disruption while ensuring quality implementation.",
      timestamp: "2:22 PM",
      type: "agent",
      isActive: false,
      agentColor: "#22c55e",
    },
    {
      id: "6",
      agent: "Technical Advisor",
      role: "Technical Advisor",
      content:
        "The migration plan looks solid. I can handle the technical implementation, starting with setting up the build configuration and core component extraction.",
      timestamp: "2:25 PM",
      type: "agent",
      isActive: true,
      agentColor: "#3b82f6",
    },
  ]);

  return (
    <ShowcaseLayout>
      <ConversationScreenDisplay>
        <ConversationLayoutDisplay
          conversations={conversations}
          agents={agents}
          messages={messages}
          defaultSidebarCollapsed={false}
        />
      </ConversationScreenDisplay>
    </ShowcaseLayout>
  );
}

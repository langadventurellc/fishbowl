import { useState } from "react";
import { AgentPill, MessageItem } from "../../components/chat";
import { InputContainerDisplay } from "../../components/input";
import {
  AgentLabelsContainerDisplay,
  ChatContainerDisplay,
  ConversationLayoutDisplay,
  ConversationScreenDisplay,
  MainContentPanelDisplay,
} from "../../components/layout";
import { ShowcaseLayout } from "../../components/showcase/ShowcaseLayout";
import {
  ConversationItemDisplay,
  SidebarContainerDisplay,
  SidebarHeaderDisplay,
  SidebarToggleDisplay,
} from "../../components/sidebar";

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
  const [inputText] = useState("");
  const [isManualMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(),
  );
  const [openContextMenu, setOpenContextMenu] = useState<string | null>(null);

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
  const [messages, setMessages] = useState<Message[]>([
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

  // Dynamic styles that respond to theme (same pattern as DesignPrototype)
  const styles = {
    newConversation: {
      padding: "12px 8px",
      marginTop: "auto",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      color: "var(--sidebar-primary)",
      fontWeight: "500",
      textAlign: "center" as const,
      border: "2px dashed var(--sidebar-border)",
      transition: "all 0.15s",
    },
    newConversationHover: {
      backgroundColor: "var(--sidebar-accent)",
      borderColor: "var(--sidebar-primary)",
    },
    addAgentButton: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "2px dashed var(--border)",
      backgroundColor: "transparent",
      color: "var(--muted-foreground)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      transition: "all 0.15s",
      flexShrink: 0,
    },
    addAgentButtonHover: {
      borderColor: "var(--primary)",
      color: "var(--primary)",
      backgroundColor: "var(--primary-foreground)",
    },
  };

  const toggleMessageContext = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, isActive: !message.isActive }
          : message,
      ),
    );
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(messageId)) {
        newExpanded.delete(messageId);
      } else {
        newExpanded.add(messageId);
      }
      return newExpanded;
    });
  };

  const handleOpenContextMenu = (messageId: string | null) => {
    setOpenContextMenu(messageId);
  };

  const handleContextMenuAction = (action: string, messageId: string) => {
    console.log(
      `Demo: Context menu action: ${action} for message ${messageId}`,
    );
    setOpenContextMenu(null);
  };

  return (
    <ShowcaseLayout>
      <ConversationScreenDisplay
        onClick={() => {
          setOpenContextMenu(null);
        }}
      >
        <ConversationLayoutDisplay
          sidebar={
            <>
              {/* Sidebar Toggle Button */}
              <div
                onClick={() => {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }}
                style={{ cursor: "pointer" }}
              >
                <SidebarToggleDisplay
                  isCollapsed={isSidebarCollapsed}
                  showHoverState={false}
                />
              </div>

              {/* Sidebar */}
              <SidebarContainerDisplay
                collapsed={isSidebarCollapsed}
                widthVariant="default"
                showBorder={true}
              >
                <SidebarHeaderDisplay
                  title="Conversations"
                  showControls={true}
                  collapsed={isSidebarCollapsed}
                />

                {/* Conversation items with interactive behavior */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minHeight: "120px",
                  }}
                >
                  {conversations.map((conv, index) => (
                    <ConversationItemDisplay
                      key={index}
                      conversation={conv}
                      appearanceState={conv.isActive ? "active" : "inactive"}
                      showUnreadIndicator={false}
                    />
                  ))}
                </div>

                {/* New Conversation button - keep as simple element for now */}
                <div
                  style={styles.newConversation}
                  onMouseEnter={(e) => {
                    Object.assign(
                      e.currentTarget.style,
                      styles.newConversationHover,
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "var(--sidebar-border)";
                  }}
                >
                  + New Conversation
                </div>
              </SidebarContainerDisplay>
            </>
          }
          mainContent={
            <MainContentPanelDisplay
              agentLabelsContainer={
                <AgentLabelsContainerDisplay
                  agentPills={agents.map((agent, index) => (
                    <AgentPill key={index} agent={agent} />
                  ))}
                  actionButtons={[
                    <button
                      key="add-agent"
                      style={styles.addAgentButton}
                      onMouseEnter={(e) => {
                        Object.assign(
                          e.currentTarget.style,
                          styles.addAgentButtonHover,
                        );
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--muted-foreground)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                      title="Add new agent to conversation"
                    >
                      +
                    </button>,
                  ]}
                />
              }
              chatContainer={
                <ChatContainerDisplay
                  messages={messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isExpanded={expandedMessages.has(message.id)}
                      canRegenerate={message.type === "agent"}
                      contextMenuOpen={openContextMenu === message.id}
                      onToggleContext={toggleMessageContext}
                      onToggleExpansion={toggleMessageExpansion}
                      onContextMenuAction={handleContextMenuAction}
                      onOpenContextMenu={handleOpenContextMenu}
                    />
                  ))}
                />
              }
              inputContainer={
                <InputContainerDisplay
                  layoutVariant="default"
                  messageInputProps={{
                    placeholder: "Type your message here...",
                    content: inputText,
                    disabled: false,
                    size: "medium",
                  }}
                  sendButtonProps={{
                    disabled: !inputText.trim(),
                    loading: false,
                    "aria-label": "Send message",
                  }}
                  modeToggleProps={{
                    currentMode: isManualMode ? "manual" : "auto",
                    disabled: false,
                  }}
                />
              }
            />
          }
        />
      </ConversationScreenDisplay>
    </ShowcaseLayout>
  );
}

// Layout Component Addition Pattern for LayoutShowcase
// ===================================================
//
// This page demonstrates how major layout components work together
// in a full-screen conversation interface. To add new layout components:
//
// 1. Import layout components (when they become available as extracted components):
//    import { Sidebar } from '../../components/layout/Sidebar';
//    import { AgentPillsBar } from '../../components/layout/AgentPillsBar';
//    import { ChatArea } from '../../components/layout/ChatArea';
//    import { InputArea } from '../../components/layout/InputArea';
//
// 2. Define realistic sample data for layout integration:
//    const layoutData = {
//      conversations: [...],
//      agents: [...],
//      messages: [...],
//      // Include interactive state and realistic content
//    };
//
// 3. Replace sections with extracted components while maintaining integration:
//    <div style={styles.contentArea}>
//      <AgentPillsBar agents={agents} onAddAgent={handleAddAgent} />
//      <ChatArea messages={messages} onMessageAction={handleMessageAction} />
//      <InputArea onSendMessage={handleSendMessage} mode={mode} />
//    </div>
//
// The current implementation shows the full layout structure that can be
// incrementally replaced with extracted components as they become available.
// This provides a realistic demonstration of how the components work together
// in the actual application layout.

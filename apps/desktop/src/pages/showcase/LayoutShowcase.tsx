import { useState } from "react";
import { ShowcaseLayout } from "../../components/showcase/ShowcaseLayout";
import {
  ConversationScreenDisplay,
  MainContentPanelDisplay,
  ChatContainerDisplay,
  AgentLabelsContainerDisplay,
  ConversationLayoutDisplay,
} from "../../components/layout";
import { AgentPill, MessageItem } from "../../components/chat";
import {
  SidebarContainerDisplay,
  SidebarHeaderDisplay,
  SidebarToggleDisplay,
  ConversationItemDisplay,
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
  const [inputText, setInputText] = useState("");
  const [isManualMode, setIsManualMode] = useState(true);
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
    container: {
      width: "100%",
      height: "100vh",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "var(--font-sans)",
      position: "relative" as const,
      overflow: "hidden",
    },
    mainLayout: {
      display: "flex",
      height: "100%",
      position: "relative" as const,
    },
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
    contentArea: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      height: "100%",
      minWidth: 0,
    },
    agentLabelsBar: {
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: "1px solid var(--border)",
      gap: "8px",
      backgroundColor: "var(--card)",
      overflowX: "auto" as const,
      flexShrink: 0,
    },
    agentPill: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 12px",
      borderRadius: "20px",
      color: "white",
      fontSize: "12px",
      fontWeight: "500",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    },
    thinkingDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: "currentColor",
      animation: "pulse 1.5s infinite",
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
    chatArea: {
      flex: 1,
      padding: "16px",
      overflowY: "auto" as const,
      backgroundColor: "var(--background)",
    },
    inputArea: {
      padding: "16px",
      borderTop: "1px solid var(--border)",
      backgroundColor: "var(--card)",
      display: "flex",
      alignItems: "flex-end",
      gap: "12px",
      flexShrink: 0,
    },
    textarea: {
      flex: 1,
      minHeight: "44px",
      maxHeight: "120px",
      padding: "12px 16px",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontSize: "14px",
      fontFamily: "inherit",
      resize: "none" as const,
      outline: "none",
      transition: "border-color 0.15s",
    },
    textareaFocus: {
      borderColor: "var(--ring)",
    },
    sendButton: {
      width: "44px",
      height: "44px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      cursor: "pointer",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
      flexShrink: 0,
    },
    sendButtonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    modeToggle: {
      display: "flex",
      borderRadius: "6px",
      border: "1px solid var(--border)",
      overflow: "hidden",
      flexShrink: 0,
    },
    modeOption: {
      padding: "8px 16px",
      fontSize: "12px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.15s",
      border: "none",
      outline: "none",
    },
    modeOptionActive: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
    },
    modeOptionInactive: {
      backgroundColor: "var(--background)",
      color: "var(--muted-foreground)",
    },
  };

  // Event handlers for demonstration
  const handleSendMessage = () => {
    if (inputText.trim()) {
      console.log("Demo: Sending message:", inputText);
      setInputText("");
    }
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
                <div style={styles.inputArea}>
                  <textarea
                    style={styles.textarea}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message here..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--ring)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  />

                  <button
                    style={{
                      ...styles.sendButton,
                      ...(inputText.trim() ? {} : styles.sendButtonDisabled),
                    }}
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    title="Send message"
                  >
                    ✈️
                  </button>

                  <div style={styles.modeToggle}>
                    <button
                      style={{
                        ...styles.modeOption,
                        ...(isManualMode
                          ? styles.modeOptionActive
                          : styles.modeOptionInactive),
                      }}
                      onClick={() => setIsManualMode(true)}
                    >
                      Manual
                    </button>
                    <button
                      style={{
                        ...styles.modeOption,
                        ...(!isManualMode
                          ? styles.modeOptionActive
                          : styles.modeOptionInactive),
                      }}
                      onClick={() => setIsManualMode(false)}
                    >
                      Auto
                    </button>
                  </div>
                </div>
              }
            />
          }
        />

        {/* Add pulse animation for thinking indicators */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 0.3; }
            }
          `}
        </style>
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

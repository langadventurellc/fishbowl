import { useState } from "react";
import { ShowcaseLayout } from "../../components/showcase/ShowcaseLayout";
import { ConversationScreenDisplay } from "../../components/layout";

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
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(),
  );
  const [openContextMenu, setOpenContextMenu] = useState<string | null>(null);
  const [openConversationMenu, setOpenConversationMenu] = useState<
    string | null
  >(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    sidebar: {
      width: isSidebarCollapsed ? "0px" : "240px",
      height: "100%",
      backgroundColor: "var(--sidebar)",
      borderRight: "1px solid var(--sidebar-border)",
      transition: "width 0.3s ease",
      overflow: "hidden",
      position: "relative" as const,
      zIndex: 100,
    },
    sidebarContent: {
      width: "240px",
      height: "100%",
      padding: "16px",
      display: "flex",
      flexDirection: "column" as const,
    },
    sidebarTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "var(--sidebar-foreground)",
      marginBottom: "16px",
      paddingLeft: "8px",
    },
    conversationItem: {
      padding: "12px 8px",
      marginBottom: "4px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.15s",
      position: "relative" as const,
      fontSize: "14px",
    },
    conversationItemActive: {
      backgroundColor: "var(--sidebar-accent)",
      color: "var(--sidebar-accent-foreground)",
    },
    conversationItemInactive: {
      color: "var(--sidebar-foreground)",
    },
    conversationItemHover: {
      backgroundColor: "var(--sidebar-accent)",
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
    sidebarToggle: {
      position: "absolute" as const,
      top: "50%",
      left: isSidebarCollapsed ? "12px" : "252px",
      transform: "translateY(-50%)",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: "var(--background)",
      border: "1px solid var(--border)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      color: "var(--foreground)",
      zIndex: 1000,
      transition: "left 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    sidebarToggleHover: {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
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
    message: {
      marginBottom: "16px",
      transition: "opacity 0.15s",
    },
    messageInactive: {
      opacity: 0.5,
    },
    systemMessage: {
      textAlign: "center" as const,
      padding: "8px 16px",
      backgroundColor: "var(--muted)",
      borderRadius: "16px",
      fontSize: "13px",
      color: "var(--muted-foreground)",
      fontStyle: "italic",
      margin: "0 auto",
      maxWidth: "400px",
    },
    messageWrapper: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid transparent",
      transition: "all 0.15s",
    },
    messageWrapperHover: {
      border: "1px solid var(--border)",
      backgroundColor: "var(--card)",
    },
    contextToggle: {
      width: "20px",
      height: "20px",
      borderRadius: "4px",
      border: "1px solid var(--border)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "bold",
      flexShrink: 0,
      marginTop: "2px",
      transition: "all 0.15s",
    },
    contextToggleActive: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
      borderColor: "var(--primary)",
    },
    contextToggleInactive: {
      backgroundColor: "transparent",
      color: "transparent",
    },
    userMessage: {
      flex: 1,
    },
    messageHeader: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
      fontSize: "13px",
      flexWrap: "wrap" as const,
    },
    messageContent: {
      fontSize: "14px",
      lineHeight: "1.5",
      color: "var(--foreground)",
      whiteSpace: "pre-wrap" as const,
    },
    showMoreLink: {
      color: "var(--primary)",
      cursor: "pointer",
      fontSize: "13px",
      marginTop: "4px",
      fontWeight: "500",
    },
    ellipsisButton: {
      background: "none",
      border: "none",
      color: "var(--muted-foreground)",
      cursor: "pointer",
      padding: "4px 6px",
      borderRadius: "4px",
      fontSize: "14px",
      opacity: 0.6,
      transition: "all 0.15s",
      position: "relative" as const,
    },
    ellipsisButtonHover: {
      opacity: 1,
      backgroundColor: "var(--muted)",
    },
    contextMenu: {
      position: "absolute" as const,
      top: "100%",
      right: "0",
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "4px",
      minWidth: "140px",
      zIndex: 1000,
    },
    contextMenuItem: {
      display: "block",
      width: "100%",
      padding: "8px 12px",
      fontSize: "13px",
      color: "var(--popover-foreground)",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      textAlign: "left" as const,
      transition: "background-color 0.15s",
    },
    contextMenuItemHover: {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
    conversationEllipsis: {
      position: "absolute" as const,
      top: "50%",
      right: "8px",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: "var(--sidebar-foreground)",
      cursor: "pointer",
      padding: "2px 4px",
      borderRadius: "4px",
      fontSize: "12px",
      opacity: 0,
      transition: "all 0.15s",
      zIndex: 10,
    },
    conversationEllipsisVisible: {
      opacity: 0.7,
    },
    conversationEllipsisHover: {
      opacity: 1,
      backgroundColor: "var(--sidebar-accent)",
    },
    conversationContextMenu: {
      position: "absolute" as const,
      top: "0",
      right: "100%",
      marginRight: "8px",
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "4px",
      minWidth: "120px",
      zIndex: 100,
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

  const formatTimestamp = (timestamp: string) => {
    return `─ ${timestamp}`;
  };

  const isLongMessage = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    return lines.length > 3;
  };

  const getMessagePreview = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim() !== "");
    return lines[0] || "";
  };

  const handleContextMenuAction = (action: string, messageId: string) => {
    console.log(
      `Demo: Context menu action: ${action} for message ${messageId}`,
    );
    setOpenContextMenu(null);
  };

  const handleConversationAction = (
    action: string,
    conversationName: string,
  ) => {
    console.log(
      `Demo: Conversation action: ${action} for conversation ${conversationName}`,
    );
    setOpenConversationMenu(null);
  };

  return (
    <ShowcaseLayout>
      <ConversationScreenDisplay
        onClick={() => {
          setOpenContextMenu(null);
          setOpenConversationMenu(null);
        }}
      >
        <div style={styles.mainLayout}>
          {/* Sidebar Toggle Button */}
          <button
            style={styles.sidebarToggle}
            onClick={() => {
              setIsSidebarCollapsed(!isSidebarCollapsed);
              setOpenConversationMenu(null);
            }}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.sidebarToggleHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--background)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarContent}>
              <div style={styles.sidebarTitle}>Conversations</div>

              {conversations.map((conv, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.conversationItem,
                    ...(conv.isActive
                      ? styles.conversationItemActive
                      : styles.conversationItemInactive),
                  }}
                  onMouseEnter={(e) => {
                    if (!conv.isActive) {
                      Object.assign(
                        e.currentTarget.style,
                        styles.conversationItemHover,
                      );
                    }
                    const ellipsis = e.currentTarget.querySelector(
                      ".conversation-ellipsis",
                    ) as HTMLElement;
                    if (ellipsis) {
                      Object.assign(
                        ellipsis.style,
                        styles.conversationEllipsisVisible,
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!conv.isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                    const ellipsis = e.currentTarget.querySelector(
                      ".conversation-ellipsis",
                    ) as HTMLElement;
                    if (ellipsis && openConversationMenu !== conv.name) {
                      ellipsis.style.opacity = "0";
                    }
                  }}
                >
                  <div>🗨 {conv.name}</div>
                  <div
                    style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px" }}
                  >
                    {conv.lastActivity}
                  </div>
                  <button
                    className="conversation-ellipsis"
                    style={{
                      ...styles.conversationEllipsis,
                      ...(openConversationMenu === conv.name
                        ? styles.conversationEllipsisHover
                        : {}),
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenConversationMenu(
                        openConversationMenu === conv.name ? null : conv.name,
                      );
                    }}
                    onMouseEnter={(e) => {
                      Object.assign(
                        e.currentTarget.style,
                        styles.conversationEllipsisHover,
                      );
                    }}
                    onMouseLeave={(e) => {
                      if (openConversationMenu !== conv.name) {
                        e.currentTarget.style.opacity = "0.7";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    ⋯
                    {openConversationMenu === conv.name && (
                      <div
                        style={styles.conversationContextMenu}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          style={styles.contextMenuItem}
                          onClick={() =>
                            handleConversationAction("rename", conv.name)
                          }
                          onMouseEnter={(e) => {
                            Object.assign(
                              e.currentTarget.style,
                              styles.contextMenuItemHover,
                            );
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              "var(--popover-foreground)";
                          }}
                        >
                          Rename
                        </button>
                        <button
                          style={styles.contextMenuItem}
                          onClick={() =>
                            handleConversationAction("delete", conv.name)
                          }
                          onMouseEnter={(e) => {
                            Object.assign(
                              e.currentTarget.style,
                              styles.contextMenuItemHover,
                            );
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color =
                              "var(--popover-foreground)";
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </button>
                </div>
              ))}

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
            </div>
          </div>

          {/* Content Area */}
          <div style={styles.contentArea}>
            {/* Agent Labels Bar */}
            <div style={styles.agentLabelsBar}>
              {agents.map((agent, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.agentPill,
                    backgroundColor: agent.color,
                  }}
                >
                  <span>
                    {agent.name} | {agent.role}
                  </span>
                  {agent.isThinking && <div style={styles.thinkingDot} />}
                </div>
              ))}

              <button
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
              </button>
            </div>

            {/* Chat Messages Area */}
            <div style={styles.chatArea}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    ...styles.message,
                    ...(message.isActive ? {} : styles.messageInactive),
                  }}
                >
                  {message.type === "system" ? (
                    <div style={styles.systemMessage}>{message.content}</div>
                  ) : (
                    <div
                      style={styles.messageWrapper}
                      onMouseEnter={(e) => {
                        Object.assign(
                          e.currentTarget.style,
                          styles.messageWrapperHover,
                        );
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = "1px solid transparent";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <button
                        style={{
                          ...styles.contextToggle,
                          ...(message.isActive
                            ? styles.contextToggleActive
                            : styles.contextToggleInactive),
                        }}
                        onClick={() => toggleMessageContext(message.id)}
                        title={
                          message.isActive
                            ? "Click to exclude from context"
                            : "Click to include in context"
                        }
                      >
                        {message.isActive ? "✓" : ""}
                      </button>

                      <div style={styles.userMessage}>
                        <div style={styles.messageHeader}>
                          <span style={{ color: message.agentColor }}>
                            [{message.agent}
                            {message.type === "agent"
                              ? ` | ${message.role}`
                              : ""}
                            ]
                          </span>
                          <span
                            style={{
                              color: "var(--muted-foreground)",
                            }}
                          >
                            {formatTimestamp(message.timestamp)}
                          </span>
                          <button
                            style={{
                              ...styles.ellipsisButton,
                              ...(openContextMenu === message.id
                                ? styles.ellipsisButtonHover
                                : {}),
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenContextMenu(
                                openContextMenu === message.id
                                  ? null
                                  : message.id,
                              );
                            }}
                            onMouseEnter={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.ellipsisButtonHover,
                              );
                            }}
                            onMouseLeave={(e) => {
                              if (openContextMenu !== message.id) {
                                e.currentTarget.style.opacity = "0.6";
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                          >
                            ⋯
                            {openContextMenu === message.id && (
                              <div
                                style={styles.contextMenu}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  style={styles.contextMenuItem}
                                  onClick={() =>
                                    handleContextMenuAction("copy", message.id)
                                  }
                                  onMouseEnter={(e) => {
                                    Object.assign(
                                      e.currentTarget.style,
                                      styles.contextMenuItemHover,
                                    );
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                    e.currentTarget.style.color =
                                      "var(--popover-foreground)";
                                  }}
                                >
                                  Copy message
                                </button>
                                {message.type === "agent" && (
                                  <button
                                    style={styles.contextMenuItem}
                                    onClick={() =>
                                      handleContextMenuAction(
                                        "regenerate",
                                        message.id,
                                      )
                                    }
                                    onMouseEnter={(e) => {
                                      Object.assign(
                                        e.currentTarget.style,
                                        styles.contextMenuItemHover,
                                      );
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                      e.currentTarget.style.color =
                                        "var(--popover-foreground)";
                                    }}
                                  >
                                    Regenerate
                                  </button>
                                )}
                                <button
                                  style={styles.contextMenuItem}
                                  onClick={() =>
                                    handleContextMenuAction(
                                      "delete",
                                      message.id,
                                    )
                                  }
                                  onMouseEnter={(e) => {
                                    Object.assign(
                                      e.currentTarget.style,
                                      styles.contextMenuItemHover,
                                    );
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                    e.currentTarget.style.color =
                                      "var(--popover-foreground)";
                                  }}
                                >
                                  Delete message
                                </button>
                              </div>
                            )}
                          </button>
                        </div>
                        <div style={styles.messageContent}>
                          {isLongMessage(message.content) ? (
                            <>
                              {expandedMessages.has(message.id)
                                ? message.content
                                : getMessagePreview(message.content)}
                              <div
                                style={styles.showMoreLink}
                                onClick={() =>
                                  toggleMessageExpansion(message.id)
                                }
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.textDecoration =
                                    "underline";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.textDecoration = "none";
                                }}
                              >
                                {expandedMessages.has(message.id)
                                  ? "Show less"
                                  : "Show more..."}
                              </div>
                            </>
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
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
          </div>
        </div>

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

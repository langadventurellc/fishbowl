import { useState } from "react";

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

export default function DesignPrototype() {
  const [isDark, setIsDark] = useState(false);
  const [, setCurrentConversation] = useState("Project Planning");
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

  // Agent definitions with unique colors
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
      name: "Creative Director",
      role: "Creative Director",
      color: "#a855f7",
      isThinking: false,
    },
  ];

  // Fake conversation messages with state management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      agent: "System",
      role: "System",
      content: "Technical Advisor joined the conversation",
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
        "Looking at the architecture requirements, I think we should consider using a microservices approach for this project. It will give us better scalability and maintainability in the long run.",
      timestamp: "2:16 PM",
      type: "agent",
      isActive: true,
      agentColor: "#3b82f6",
    },
    {
      id: "3",
      agent: "Project Manager",
      role: "Project Manager",
      content:
        "That sounds good from a technical perspective. What kind of timeline are we looking at for implementing microservices? I need to coordinate with the client on deliverables.",
      timestamp: "2:18 PM",
      type: "agent",
      isActive: true,
      agentColor: "#22c55e",
    },
    {
      id: "4",
      agent: "User",
      role: "User",
      content:
        "I agree with the microservices approach. How do we handle data consistency across services?",
      timestamp: "2:20 PM",
      type: "user",
      isActive: true,
      agentColor: "#6366f1",
    },
    {
      id: "5",
      agent: "Technical Advisor",
      role: "Technical Advisor",
      content:
        "Great question! We can implement eventual consistency with event sourcing.\nEach service publishes events when data changes, and other services can subscribe to relevant events.\nThis approach works well for most business scenarios.\nHere's how we'd structure it: First, we'll create an event store that acts as the single source of truth for all state changes.\nWhen a user action occurs, instead of directly updating multiple databases, we emit an event to the event store.\nThen, each microservice that needs to react to that change subscribes to the relevant event types.\nFor example, when a user places an order, we'd emit an 'OrderPlaced' event.\nThe inventory service would subscribe to this event to update stock levels, the payment service would handle billing, and the notification service would send confirmation emails.",
      timestamp: "2:22 PM",
      type: "agent",
      isActive: true,
      agentColor: "#3b82f6",
    },
    {
      id: "6",
      agent: "Creative Director",
      role: "Creative Director",
      content:
        "From a UX perspective, we need to ensure that any data synchronization delays don't impact the user experience. Can we show loading states or optimistic updates to keep the interface responsive?",
      timestamp: "2:24 PM",
      type: "agent",
      isActive: true,
      agentColor: "#a855f7",
    },
    {
      id: "7",
      agent: "System",
      role: "System",
      content: "Creative Director is now thinking...",
      timestamp: "2:24 PM",
      type: "system",
      isActive: false,
      agentColor: "#6b7280",
    },
    {
      id: "8",
      agent: "User",
      role: "User",
      content:
        "Definitely. Users shouldn't wait for backend processes. What about error handling?",
      timestamp: "2:25 PM",
      type: "user",
      isActive: true,
      agentColor: "#6366f1",
    },
    {
      id: "9",
      agent: "Technical Advisor",
      role: "Technical Advisor",
      content:
        "We should implement circuit breakers and retry mechanisms. If a service is down, we can fallback to cached data or show appropriate error messages. The system should degrade gracefully rather than failing completely.",
      timestamp: "2:27 PM",
      type: "agent",
      isActive: true,
      agentColor: "#3b82f6",
    },
    {
      id: "10",
      agent: "Project Manager",
      role: "Project Manager",
      content:
        "This is getting complex. Let me break this down into phases:\nPhase 1 - Basic service separation (2-3 weeks)\nPhase 2 - Event sourcing implementation (2-3 weeks)\nPhase 3 - Advanced error handling and monitoring (2-3 weeks)\nPhase 4 - Performance optimization and scaling (1-2 weeks)\nEach phase will have specific deliverables and success criteria.\nWe'll also need to coordinate with the DevOps team for deployment strategies.",
      timestamp: "2:29 PM",
      type: "agent",
      isActive: true,
      agentColor: "#22c55e",
    },
    {
      id: "11",
      agent: "Creative Director",
      role: "Creative Director",
      content:
        "I love the phased approach! For Phase 1, can we start with a design system that works across all services? Consistent UI components will make the user experience seamless even as we migrate to microservices.",
      timestamp: "2:31 PM",
      type: "agent",
      isActive: true,
      agentColor: "#a855f7",
    },
    {
      id: "12",
      agent: "User",
      role: "User",
      content: "That makes sense. Should we document the API contracts first?",
      timestamp: "2:32 PM",
      type: "user",
      isActive: false,
      agentColor: "#6366f1",
    },
    {
      id: "13",
      agent: "Technical Advisor",
      role: "Technical Advisor",
      content:
        "Absolutely! API-first design is crucial. We should use OpenAPI specifications and generate client SDKs. This will help both frontend and backend teams work in parallel.",
      timestamp: "2:34 PM",
      type: "agent",
      isActive: true,
      agentColor: "#3b82f6",
    },
    {
      id: "14",
      agent: "Project Manager",
      role: "Project Manager",
      content:
        "Perfect. I'll set up meetings with the stakeholders to review the phased timeline. Technical Advisor, can you prepare the API documentation template? Creative Director, let's sync on the design system requirements.",
      timestamp: "2:36 PM",
      type: "agent",
      isActive: true,
      agentColor: "#22c55e",
    },
    {
      id: "15",
      agent: "Creative Director",
      role: "Creative Director",
      content:
        "Sounds good! I'll start with a component audit of our current system and identify what can be reused vs what needs to be redesigned for the new architecture.",
      timestamp: "2:38 PM",
      type: "agent",
      isActive: true,
      agentColor: "#a855f7",
    },
  ]);

  const conversations = [
    { name: "Project Planning", lastActivity: "2h ago", isActive: true },
    { name: "Creative Writing", lastActivity: "Yesterday", isActive: false },
    { name: "Code Review", lastActivity: "Dec 15", isActive: false },
  ];

  // CSS-in-JS styles using CSS custom properties
  const styles = {
    container: {
      width: "100%",
      height: "100vh",
      backgroundColor: isDark ? "var(--background)" : "var(--background)",
      color: isDark ? "var(--foreground)" : "var(--foreground)",
      fontFamily: "var(--font-sans)",
      display: "flex",
      flexDirection: "column" as const,
      transition: "background-color 0.2s, color 0.2s",
    },
    mainLayout: {
      flex: 1,
      display: "flex",
      overflow: "hidden",
    },
    themeToggle: {
      background: "none",
      border: "none",
      color: "inherit",
      cursor: "pointer",
      padding: "6px 10px",
      borderRadius: "6px",
      fontSize: "14px",
      marginLeft: "auto",
      backgroundColor: isDark ? "var(--secondary)" : "var(--secondary)",
      transition: "background-color 0.15s",
    },
    sidebar: {
      width: isSidebarCollapsed ? "0px" : "200px",
      backgroundColor: isDark ? "var(--sidebar)" : "var(--sidebar)",
      borderRight: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      display: "flex",
      flexDirection: "column" as const,
      padding: isSidebarCollapsed ? "0" : "16px",
      overflow: "hidden",
      transition: "width 0.3s ease, padding 0.3s ease",
    },
    sidebarTitle: {
      fontSize: "14px",
      fontWeight: "600",
      marginBottom: "12px",
      color: isDark ? "var(--sidebar-foreground)" : "var(--sidebar-foreground)",
    },
    conversationItem: {
      position: "relative" as const,
      padding: "8px 12px",
      paddingRight: "32px", // Make room for ellipsis
      borderRadius: "6px",
      cursor: "pointer",
      marginBottom: "4px",
      fontSize: "13px",
      transition: "background-color 0.15s",
      display: "flex",
      flexDirection: "column" as const,
      zIndex: 1,
    },
    conversationItemActive: {
      backgroundColor: isDark
        ? "var(--sidebar-accent)"
        : "var(--sidebar-accent)",
      color: isDark
        ? "var(--sidebar-accent-foreground)"
        : "var(--sidebar-accent-foreground)",
    },
    conversationItemInactive: {
      color: isDark ? "var(--muted-foreground)" : "var(--muted-foreground)",
    },
    newConversation: {
      marginTop: "auto",
      padding: "8px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      color: isDark ? "var(--sidebar-primary)" : "var(--sidebar-primary)",
      fontWeight: "500",
    },
    contentArea: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
    },
    agentLabelsBar: {
      height: "56px",
      backgroundColor: isDark ? "var(--card)" : "var(--card)",
      borderBottom: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      gap: "8px",
    },
    agentPill: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      color: "white",
    },
    thinkingDot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: "currentColor",
      opacity: 0.7,
      animation: "pulse 2s infinite",
    },
    addAgentButton: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: `2px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      backgroundColor: "transparent",
      color: isDark ? "var(--muted-foreground)" : "var(--muted-foreground)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      fontWeight: "300",
    },
    chatArea: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "16px 24px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
    },
    message: {
      width: "100%",
    },
    messageHeader: {
      position: "relative" as const,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
      fontSize: "12px",
      fontWeight: "500",
    },
    messageContent: {
      fontSize: "14px",
      lineHeight: "1.5",
      padding: "8px 0",
      whiteSpace: "pre-wrap" as const,
    },
    messageInactive: {
      opacity: 0.5,
    },
    userMessage: {
      backgroundColor: isDark ? "var(--accent)" : "var(--accent)",
      color: isDark ? "var(--accent-foreground)" : "var(--accent-foreground)",
      padding: "12px 16px",
      borderRadius: "12px",
      marginLeft: "auto",
      maxWidth: "70%",
    },
    systemMessage: {
      fontStyle: "italic",
      color: isDark ? "var(--muted-foreground)" : "var(--muted-foreground)",
      textAlign: "center" as const,
      fontSize: "12px",
    },
    inputArea: {
      minHeight: "72px",
      backgroundColor: isDark ? "var(--card)" : "var(--card)",
      borderTop: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      padding: "16px",
      display: "flex",
      gap: "12px",
      alignItems: "flex-end",
    },
    textarea: {
      flex: 1,
      minHeight: "40px",
      maxHeight: "180px",
      height: "auto",
      padding: "12px",
      border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      borderRadius: "8px",
      backgroundColor: isDark ? "var(--background)" : "var(--background)",
      color: "inherit",
      fontSize: "14px",
      resize: "none" as const,
      fontFamily: "inherit",
      overflow: "hidden",
      fieldSizing: "content", // Modern CSS property for auto-sizing
    },
    sendButton: {
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: isDark ? "var(--primary)" : "var(--primary)",
      color: isDark ? "var(--primary-foreground)" : "var(--primary-foreground)",
      cursor: inputText.trim() ? "pointer" : "not-allowed",
      opacity: inputText.trim() ? 1 : 0.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
    },
    modeToggle: {
      height: "40px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "0 12px",
      border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      borderRadius: "8px",
      backgroundColor: isDark ? "var(--background)" : "var(--background)",
      fontSize: "12px",
      fontWeight: "500",
    },
    modeOption: {
      padding: "4px 8px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    modeOptionActive: {
      backgroundColor: isDark ? "var(--primary)" : "var(--primary)",
      color: isDark ? "var(--primary-foreground)" : "var(--primary-foreground)",
    },
    contextToggle: {
      position: "absolute" as const,
      right: "8px",
      top: "8px",
      width: "20px",
      height: "20px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
      zIndex: 100,
    },
    contextToggleActive: {
      backgroundColor: isDark ? "var(--primary)" : "var(--primary)",
      color: isDark ? "var(--primary-foreground)" : "var(--primary-foreground)",
    },
    contextToggleInactive: {
      backgroundColor: isDark ? "var(--muted)" : "var(--muted)",
      color: isDark ? "var(--muted-foreground)" : "var(--muted-foreground)",
    },
    messageWrapper: {
      position: "relative" as const,
      padding: "8px",
      borderRadius: "8px",
      border: "1px solid transparent",
      transition: "all 0.15s",
    },
    messageWrapperHover: {
      border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      backgroundColor: isDark ? "var(--card)" : "var(--card)",
    },
    showMoreLink: {
      color: isDark ? "var(--primary)" : "var(--primary)",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      marginTop: "4px",
      textDecoration: "none",
      transition: "opacity 0.15s",
    },
    showMoreHover: {
      opacity: 0.8,
    },
    ellipsisButton: {
      position: "relative" as const,
      background: "none",
      border: "none",
      color: isDark ? "var(--muted-foreground)" : "var(--muted-foreground)",
      cursor: "pointer",
      padding: "4px 6px",
      borderRadius: "4px",
      fontSize: "14px",
      marginLeft: "8px",
      opacity: 0.6,
      transition: "all 0.15s",
      minWidth: "20px",
      minHeight: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    ellipsisButtonHover: {
      opacity: 1,
      backgroundColor: isDark ? "var(--muted)" : "var(--muted)",
    },
    contextMenu: {
      position: "absolute" as const,
      top: "100%",
      right: "0",
      backgroundColor: isDark ? "var(--popover)" : "var(--popover)",
      border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "4px",
      minWidth: "140px",
      zIndex: 1000,
    },
    contextMenuAbove: {
      position: "absolute" as const,
      bottom: "100%",
      right: "0",
      backgroundColor: isDark ? "var(--popover)" : "var(--popover)",
      border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "4px",
      minWidth: "140px",
      zIndex: 1000,
      marginBottom: "4px",
    },
    contextMenuItem: {
      display: "block",
      width: "100%",
      padding: "8px 12px",
      fontSize: "13px",
      color: isDark ? "var(--popover-foreground)" : "var(--popover-foreground)",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      textAlign: "left" as const,
      transition: "background-color 0.15s",
    },
    contextMenuItemHover: {
      backgroundColor: isDark ? "var(--accent)" : "var(--accent)",
      color: isDark ? "var(--accent-foreground)" : "var(--accent-foreground)",
    },
    contextMenuItemDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    conversationEllipsis: {
      position: "absolute" as const,
      top: "50%",
      right: "8px",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: isDark ? "var(--sidebar-foreground)" : "var(--sidebar-foreground)",
      cursor: "pointer",
      padding: "2px 4px",
      borderRadius: "4px",
      fontSize: "12px",
      opacity: 0,
      transition: "all 0.15s",
      minWidth: "16px",
      minHeight: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10000,
    },
    conversationEllipsisVisible: {
      opacity: 0.7,
    },
    conversationEllipsisHover: {
      opacity: 1,
      backgroundColor: isDark
        ? "var(--sidebar-accent)"
        : "var(--sidebar-accent)",
    },
    conversationContextMenu: {
      position: "absolute" as const,
      top: "0",
      right: "100%",
      marginRight: "8px",
      backgroundColor: isDark ? "var(--popover)" : "var(--popover)",
      border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "4px",
      minWidth: "120px",
      zIndex: 10001,
    },
    sidebarToggle: {
      position: "absolute" as const,
      top: "50%",
      left: isSidebarCollapsed ? "-12px" : "188px",
      transform: "translateY(-50%)",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: isDark ? "var(--background)" : "var(--background)",
      border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      color: isDark ? "var(--foreground)" : "var(--foreground)",
      zIndex: 1000,
      transition: "left 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    sidebarToggleHover: {
      backgroundColor: isDark ? "var(--accent)" : "var(--accent)",
      color: isDark ? "var(--accent-foreground)" : "var(--accent-foreground)",
    },
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      console.log("Sending message:", inputText);
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

  const canRegenerateMessage = (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return false;

    const message = messages[messageIndex];
    if (!message || message.type !== "agent") return false;

    // Check if this is one of the most recent messages from agents
    const laterMessages = messages.slice(messageIndex + 1);
    const hasLaterAgentMessage = laterMessages.some(
      (msg) => msg.type === "agent",
    );

    return !hasLaterAgentMessage;
  };

  const handleContextMenuAction = (action: string, messageId: string) => {
    console.log(`Context menu action: ${action} for message ${messageId}`);
    // Placeholder for actual functionality
    setOpenContextMenu(null);
  };

  const shouldShowMenuAbove = (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    const totalMessages = messages.length;
    // Show menu above for the last 2 messages to avoid cutoff
    return messageIndex >= totalMessages - 2;
  };

  const handleConversationAction = (
    action: string,
    conversationName: string,
  ) => {
    console.log(
      `Conversation action: ${action} for conversation ${conversationName}`,
    );
    // Placeholder for actual functionality
    setOpenConversationMenu(null);
  };

  return (
    <div
      className={isDark ? "dark" : ""}
      style={styles.container}
      onClick={() => {
        setOpenContextMenu(null);
        setOpenConversationMenu(null);
      }}
    >
      {/* Main Layout */}
      <div style={styles.mainLayout}>
        {/* Sidebar Toggle Button */}
        <button
          style={{
            position: "fixed",
            top: "50%",
            left: isSidebarCollapsed ? "0px" : "233px",
            transform: "translate(-50%, -50%)",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: isDark ? "var(--background)" : "var(--background)",
            border: `1px solid ${isDark ? "var(--border)" : "var(--border)"}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: isDark ? "var(--foreground)" : "var(--foreground)",
            zIndex: 1000,
            transition: "left 0.3s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          onClick={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
            setOpenConversationMenu(null); // Close any open menus
          }}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.sidebarToggleHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? "var(--background)"
              : "var(--background)";
            e.currentTarget.style.color = isDark
              ? "var(--foreground)"
              : "var(--foreground)";
          }}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {!isSidebarCollapsed && (
            <>
              <div style={styles.sidebarTitle}>Conversations</div>

              {conversations.map((conv, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.conversationItem,
                    ...(conv.isActive
                      ? styles.conversationItemActive
                      : styles.conversationItemInactive),
                    ...(openConversationMenu === conv.name
                      ? { zIndex: 10000 }
                      : {}),
                  }}
                  onClick={() => setCurrentConversation(conv.name)}
                  onMouseEnter={(e) => {
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
                      console.log(
                        "Conversation ellipsis clicked for:",
                        conv.name,
                      );
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
                            e.currentTarget.style.color = isDark
                              ? "var(--popover-foreground)"
                              : "var(--popover-foreground)";
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
                            e.currentTarget.style.color = isDark
                              ? "var(--popover-foreground)"
                              : "var(--popover-foreground)";
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </button>
                </div>
              ))}

              <div style={styles.newConversation}>+ New Conversation</div>
            </>
          )}
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

            <button style={styles.addAgentButton}>+</button>

            <button
              style={styles.themeToggle}
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? "☀️" : "🌙"}
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

                    {message.type === "user" ? (
                      <div style={styles.userMessage}>
                        <div style={styles.messageHeader}>
                          <span style={{ color: message.agentColor }}>
                            [{message.agent}]
                          </span>
                          <span
                            style={{
                              color: isDark
                                ? "var(--muted-foreground)"
                                : "var(--muted-foreground)",
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
                              console.log(
                                "Ellipsis clicked for message:",
                                message.id,
                                "Current openContextMenu:",
                                openContextMenu,
                              );
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
                                style={
                                  shouldShowMenuAbove(message.id)
                                    ? styles.contextMenuAbove
                                    : styles.contextMenu
                                }
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
                                    e.currentTarget.style.color = isDark
                                      ? "var(--popover-foreground)"
                                      : "var(--popover-foreground)";
                                  }}
                                >
                                  Copy message
                                </button>
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
                                    e.currentTarget.style.color = isDark
                                      ? "var(--popover-foreground)"
                                      : "var(--popover-foreground)";
                                  }}
                                >
                                  Delete message
                                </button>
                              </div>
                            )}
                          </button>
                        </div>
                        <div>{message.content}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={styles.messageHeader}>
                          <span style={{ color: message.agentColor }}>
                            [{message.agent} | {message.role}]
                          </span>
                          <span
                            style={{
                              color: isDark
                                ? "var(--muted-foreground)"
                                : "var(--muted-foreground)",
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
                              console.log(
                                "Ellipsis clicked for message:",
                                message.id,
                                "Current openContextMenu:",
                                openContextMenu,
                              );
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
                                style={
                                  shouldShowMenuAbove(message.id)
                                    ? styles.contextMenuAbove
                                    : styles.contextMenu
                                }
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
                                    e.currentTarget.style.color = isDark
                                      ? "var(--popover-foreground)"
                                      : "var(--popover-foreground)";
                                  }}
                                >
                                  Copy message
                                </button>
                                {canRegenerateMessage(message.id) && (
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
                                      e.currentTarget.style.color = isDark
                                        ? "var(--popover-foreground)"
                                        : "var(--popover-foreground)";
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
                                    e.currentTarget.style.color = isDark
                                      ? "var(--popover-foreground)"
                                      : "var(--popover-foreground)";
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
                                  e.currentTarget.style.opacity = "0.8";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = "1";
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
                    )}
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
            />

            <button
              style={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
            >
              ✈️
            </button>

            <div style={styles.modeToggle}>
              <div
                style={{
                  ...styles.modeOption,
                  ...(isManualMode ? styles.modeOptionActive : {}),
                }}
                onClick={() => setIsManualMode(true)}
              >
                Manual
              </div>
              <div
                style={{
                  ...styles.modeOption,
                  ...(!isManualMode ? styles.modeOptionActive : {}),
                }}
                onClick={() => setIsManualMode(false)}
              >
                Auto
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
}

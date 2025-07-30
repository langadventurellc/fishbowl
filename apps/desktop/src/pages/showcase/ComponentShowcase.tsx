import { AgentViewModel, ThemeMode } from "@fishbowl-ai/shared";
import { useState } from "react";
import {
  AgentPill,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageItem,
  ThinkingIndicator,
} from "../../components/chat";
import {
  Button,
  ConversationModeToggleDisplay,
  InputContainerDisplay,
  MessageInputDisplay,
  SendButtonDisplay,
} from "../../components/input";
import {
  ContextMenu,
  ContextMenuDisplay,
  MenuItemDisplay,
  MenuTriggerDisplay,
} from "../../components/menu";
import { ThemeToggle } from "../../components/showcase";
import { ShowcaseLayout } from "../../components/showcase/ShowcaseLayout";
import {
  ConversationItemDisplay,
  ConversationListDisplay,
  SidebarContainerDisplay,
  SidebarHeaderDisplay,
  SidebarToggleDisplay,
} from "../../components/sidebar";

export default function ComponentShowcase() {
  // Theme toggle state for interactive demo
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("light");

  // Sample context menu items for ContextMenuDisplay showcase
  const sampleMenuItems = [
    { label: "Copy", action: "copy", icon: "copy" },
    { label: "Regenerate", action: "regenerate", icon: "refresh" },
    { label: "Delete", action: "delete", icon: "trash" },
    { label: "Disabled Item", action: "disabled", disabled: true },
  ];

  // Sample agent data for AgentPill showcase
  const sampleAgents: AgentViewModel[] = [
    {
      name: "Ted",
      role: "Technical Advisor",
      color: "#3b82f6", // Blue
      isThinking: false,
    },
    {
      name: "Alice",
      role: "Project Manager",
      color: "#22c55e", // Green
      isThinking: true,
    },
    {
      name: "Lori",
      role: "Creative Director",
      color: "#ef4444", // Red
      isThinking: false,
    },
    {
      name: "Chelsea",
      role: "User Experience Designer",
      color: "#a855f7", // Purple
      isThinking: true,
    },
  ];

  // Sample conversation data for ConversationListDisplay showcase
  const sampleConversations = [
    {
      name: "Project Planning",
      lastActivity: "2h ago",
      isActive: true,
    },
    {
      name: "Creative Writing",
      lastActivity: "Yesterday",
      isActive: false,
    },
    {
      name: "Code Review",
      lastActivity: "Dec 15",
      isActive: false,
    },
    {
      name: "Research Discussion",
      lastActivity: "Last week",
      isActive: false,
    },
    {
      name: "Team Standup",
      lastActivity: "3 days ago",
      isActive: false,
    },
  ];

  const styles = {
    container: {
      padding: "32px",
      fontFamily: "var(--font-sans)",
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "48px",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "700",
      color: "var(--foreground)",
      marginBottom: "16px",
    },
    subtitle: {
      fontSize: "1.125rem",
      color: "var(--muted-foreground)",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: "1.6",
    },
    sectionsGrid: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "32px",
      marginBottom: "48px",
    },
    section: {
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
      flex: 1,
    },
    sectionHeader: {
      marginBottom: "16px",
      paddingBottom: "12px",
      borderBottom: "1px solid var(--border)",
    },
    sectionTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "var(--foreground)",
      marginBottom: "8px",
    },
    sectionDescription: {
      fontSize: "0.875rem",
      color: "var(--muted-foreground)",
      lineHeight: "1.5",
    },
    componentArea: {
      minHeight: "120px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--muted)",
      borderRadius: "calc(var(--radius) - 2px)",
      border: "2px dashed var(--border)",
      color: "var(--muted-foreground)",
      fontSize: "0.875rem",
      fontStyle: "italic",
    },
    additionGuide: {
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
    },
    additionTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "var(--foreground)",
      marginBottom: "16px",
    },
    codeBlock: {
      backgroundColor: "var(--muted)",
      border: "1px solid var(--border)",
      borderRadius: "calc(var(--radius) - 2px)",
      padding: "16px",
      fontFamily: "var(--font-mono)",
      fontSize: "0.75rem",
      color: "var(--foreground)",
      overflowX: "auto" as const,
      marginBottom: "12px",
    },
    step: {
      marginBottom: "16px",
    },
    stepNumber: {
      fontWeight: "600",
      color: "var(--primary)",
    },
    stepText: {
      color: "var(--muted-foreground)",
      fontSize: "0.875rem",
      marginLeft: "8px",
    },
    agentPillShowcase: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "16px",
      padding: "16px",
      backgroundColor: "var(--muted)",
      borderRadius: "calc(var(--radius) - 2px)",
      border: "1px solid var(--border)",
    },
    agentPillRow: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap" as const,
      alignItems: "center",
    },
    agentPillLabel: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "var(--foreground)",
      minWidth: "120px",
    },
  };

  return (
    <ShowcaseLayout>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Component Showcase</h1>
          <p style={styles.subtitle}>
            Individual component testing page for self-contained components.
            Components are organized into sections for easy development and
            testing.
          </p>
        </header>

        <div style={styles.sectionsGrid}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Input Components</h2>
              <p style={styles.sectionDescription}>
                Forms, buttons, toggles, input fields, text areas, and other
                interactive elements
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Button Variants:</span>
                <Button
                  variant="primary"
                  onClick={() => console.log("Primary clicked")}
                >
                  Send
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => console.log("Secondary clicked")}
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => console.log("Ghost clicked")}
                >
                  Copy
                </Button>
                <Button
                  variant="toggle"
                  onClick={() => console.log("Toggle clicked")}
                >
                  ✓
                </Button>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Button Sizes:</span>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => console.log("Small clicked")}
                >
                  Small
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={() => console.log("Medium clicked")}
                >
                  Medium
                </Button>
                <Button
                  variant="primary"
                  size="large"
                  onClick={() => console.log("Large clicked")}
                >
                  Large
                </Button>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Button States:</span>
                <Button
                  variant="secondary"
                  disabled
                  onClick={() => console.log("Disabled clicked")}
                >
                  Disabled
                </Button>
                <Button
                  variant="secondary"
                  loading
                  onClick={() => console.log("Loading clicked")}
                >
                  Loading
                </Button>
                <Button
                  variant="ghost"
                  icon="📁"
                  onClick={() => console.log("Icon clicked")}
                >
                  With Icon
                </Button>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Real Examples:</span>
                <Button
                  variant="primary"
                  icon="📤"
                  onClick={() => console.log("Send message")}
                >
                  Send Message
                </Button>
                <Button
                  variant="ghost"
                  icon="📋"
                  onClick={() => console.log("Copy text")}
                >
                  Copy
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => console.log("Save draft")}
                >
                  Save Draft
                </Button>
                <Button
                  variant="toggle"
                  size="small"
                  onClick={() => console.log("Toggle sidebar")}
                >
                  ⚙️
                </Button>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Input - Empty:
                </span>
                <div style={{ flex: 1 }}>
                  <MessageInputDisplay
                    placeholder="Type your message here..."
                    size="medium"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Input - Content:
                </span>
                <div style={{ width: "300px" }}>
                  <MessageInputDisplay
                    content="Hello, how can I help you today?"
                    placeholder="Type your message here..."
                    size="medium"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Input - Sizes:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    width: "280px",
                  }}
                >
                  <MessageInputDisplay
                    placeholder="Small size input..."
                    size="small"
                  />
                  <MessageInputDisplay
                    placeholder="Medium size input..."
                    size="medium"
                  />
                  <MessageInputDisplay
                    placeholder="Large size input..."
                    size="large"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Input - Disabled:
                </span>
                <div style={{ width: "300px" }}>
                  <MessageInputDisplay
                    placeholder="Input is disabled"
                    disabled={true}
                    size="medium"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Long Content:</span>
                <div style={{ flex: 1 }}>
                  <MessageInputDisplay
                    content="This is a longer message that demonstrates how the component handles multi-line content and shows the auto-resize visual appearance. The text wraps naturally and the component adjusts its height accordingly."
                    size="medium"
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Send Button Display</h2>
              <p style={styles.sectionDescription}>
                Visual representation of the send button with different states -
                enabled, disabled, and loading variations
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Enabled State:</span>
                <SendButtonDisplay
                  disabled={false}
                  loading={false}
                  aria-label="Send message to agents"
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Disabled State:</span>
                <SendButtonDisplay
                  disabled={true}
                  loading={false}
                  aria-label="Send button disabled - enter message first"
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Loading State:</span>
                <SendButtonDisplay
                  disabled={false}
                  loading={true}
                  aria-label="Sending message..."
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Styled:</span>
                <SendButtonDisplay
                  disabled={false}
                  loading={false}
                  className="custom-send-button"
                  aria-label="Send message with custom styling"
                />
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Conversation Mode Toggle Display
              </h2>
              <p style={styles.sectionDescription}>
                Visual representation of the Manual/Auto mode toggle showing
                current mode state without interactive functionality
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Manual Mode Active:</span>
                <ConversationModeToggleDisplay
                  currentMode="manual"
                  disabled={false}
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Auto Mode Active:</span>
                <ConversationModeToggleDisplay
                  currentMode="auto"
                  disabled={false}
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Disabled State:</span>
                <ConversationModeToggleDisplay
                  currentMode="manual"
                  disabled={true}
                  className="disabled-mode-toggle"
                />
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Input Container Display</h2>
              <p style={styles.sectionDescription}>
                Complete input area composition combining MessageInputDisplay,
                SendButtonDisplay, and ConversationModeToggleDisplay with layout
                variants and proper spacing
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Default Layout:</span>
                <div style={{ flex: 1 }}>
                  <InputContainerDisplay
                    layoutVariant="default"
                    messageInputProps={{
                      placeholder: "Type your message here...",
                      size: "medium",
                    }}
                    sendButtonProps={{
                      disabled: false,
                      loading: false,
                      "aria-label": "Send message",
                    }}
                    modeToggleProps={{
                      currentMode: "manual",
                      disabled: false,
                    }}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Compact Layout:</span>
                <div style={{ flex: 1 }}>
                  <InputContainerDisplay
                    layoutVariant="compact"
                    messageInputProps={{
                      placeholder: "Compact layout input...",
                      size: "small",
                    }}
                    sendButtonProps={{
                      disabled: false,
                      loading: false,
                      "aria-label": "Send message",
                    }}
                    modeToggleProps={{
                      currentMode: "auto",
                      disabled: false,
                    }}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>With Content:</span>
                <div style={{ flex: 1 }}>
                  <InputContainerDisplay
                    layoutVariant="default"
                    messageInputProps={{
                      content:
                        "This is a sample message showing how the container handles content",
                      size: "medium",
                    }}
                    sendButtonProps={{
                      disabled: false,
                      loading: false,
                      "aria-label": "Send message",
                    }}
                    modeToggleProps={{
                      currentMode: "manual",
                      disabled: false,
                    }}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Loading State:</span>
                <div style={{ flex: 1 }}>
                  <InputContainerDisplay
                    layoutVariant="default"
                    messageInputProps={{
                      content: "Sending message to agents...",
                      disabled: true,
                      size: "medium",
                    }}
                    sendButtonProps={{
                      disabled: true,
                      loading: true,
                      "aria-label": "Sending message",
                    }}
                    modeToggleProps={{
                      currentMode: "auto",
                      disabled: true,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Sidebar Container Display</h2>
              <p style={styles.sectionDescription}>
                Main sidebar layout wrapper component that handles
                collapsed/expanded visual states with smooth transitions and
                theme integration
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Expanded State:</span>
                <div style={{ flex: 1, maxWidth: "300px" }}>
                  <SidebarContainerDisplay
                    collapsed={false}
                    widthVariant="default"
                    showBorder={true}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Collapsed State:</span>
                <div style={{ flex: 1, maxWidth: "300px" }}>
                  <SidebarContainerDisplay
                    collapsed={true}
                    widthVariant="default"
                    showBorder={true}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Width Variants:</span>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Narrow (180px)
                    </span>
                    <SidebarContainerDisplay
                      collapsed={false}
                      widthVariant="narrow"
                      showBorder={true}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Default (200px)
                    </span>
                    <SidebarContainerDisplay
                      collapsed={false}
                      widthVariant="default"
                      showBorder={true}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Wide (240px)
                    </span>
                    <SidebarContainerDisplay
                      collapsed={false}
                      widthVariant="wide"
                      showBorder={true}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Styling:</span>
                <div style={{ flex: 1, maxWidth: "300px" }}>
                  <SidebarContainerDisplay
                    collapsed={false}
                    widthVariant="default"
                    showBorder={true}
                    style={{
                      backgroundColor: "var(--accent)",
                      borderRadius: "8px",
                    }}
                    className="custom-sidebar"
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Sidebar Header Display</h2>
              <p style={styles.sectionDescription}>
                Sidebar header component that displays the top section with
                title and controls, supporting collapsed states and theme
                integration
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Default Title:</span>
                <div
                  style={{
                    backgroundColor: "var(--sidebar)",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <SidebarHeaderDisplay title="Conversations" />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Title:</span>
                <div
                  style={{
                    backgroundColor: "var(--sidebar)",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <SidebarHeaderDisplay title="My Projects" />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>With Controls:</span>
                <div
                  style={{
                    backgroundColor: "var(--sidebar)",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <SidebarHeaderDisplay
                    title="Chat History"
                    showControls={true}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Without Controls:</span>
                <div
                  style={{
                    backgroundColor: "var(--sidebar)",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <SidebarHeaderDisplay
                    title="Recent Files"
                    showControls={false}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Collapsed State:</span>
                <div
                  style={{
                    backgroundColor: "var(--sidebar)",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <SidebarHeaderDisplay
                    title="Hidden Header"
                    collapsed={true}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      fontStyle: "italic",
                    }}
                  >
                    (Header is hidden when collapsed=true)
                  </div>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Styling:</span>
                <div
                  style={{
                    backgroundColor: "var(--accent)",
                    padding: "16px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <SidebarHeaderDisplay
                    title="Custom Styled"
                    style={{
                      color: "var(--accent-foreground)",
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Sidebar Toggle Display</h2>
              <p style={styles.sectionDescription}>
                Sidebar toggle button component showing collapse/expand visual
                states with positioning animation and hover appearance
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Collapsed State:</span>
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "var(--sidebar)",
                    padding: "24px 40px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    minHeight: "80px",
                  }}
                >
                  <SidebarToggleDisplay isCollapsed={true} />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      marginTop: "8px",
                    }}
                  >
                    → arrow, positioned at left: -12px
                  </div>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Expanded State:</span>
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "var(--sidebar)",
                    padding: "24px 40px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    minHeight: "80px",
                  }}
                >
                  <SidebarToggleDisplay isCollapsed={false} />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      marginTop: "8px",
                    }}
                  >
                    ← arrow, positioned at left: 188px
                  </div>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Hover State (Collapsed):
                </span>
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "var(--sidebar)",
                    padding: "24px 40px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    minHeight: "80px",
                  }}
                >
                  <SidebarToggleDisplay
                    isCollapsed={true}
                    showHoverState={true}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      marginTop: "8px",
                    }}
                  >
                    Hover appearance with accent background
                  </div>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Hover State (Expanded):
                </span>
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "var(--sidebar)",
                    padding: "24px 40px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    minHeight: "80px",
                  }}
                >
                  <SidebarToggleDisplay
                    isCollapsed={false}
                    showHoverState={true}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      marginTop: "8px",
                    }}
                  >
                    Hover appearance with accent background
                  </div>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Positioning:</span>
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "var(--sidebar)",
                    padding: "24px 40px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    minHeight: "80px",
                  }}
                >
                  <SidebarToggleDisplay
                    isCollapsed={false}
                    style={{
                      left: "100px",
                      top: "30%",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      marginTop: "8px",
                    }}
                  >
                    Custom positioned at left: 100px, top: 30%
                  </div>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>State Comparison:</span>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      backgroundColor: "var(--sidebar)",
                      padding: "24px 40px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      minHeight: "80px",
                      flex: 1,
                    }}
                  >
                    <SidebarToggleDisplay isCollapsed={true} />
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted-foreground)",
                        marginTop: "8px",
                        textAlign: "center",
                      }}
                    >
                      Collapsed
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      backgroundColor: "var(--sidebar)",
                      padding: "24px 40px",
                      borderRadius: "6px",
                      border: "1px solid var(--border)",
                      minHeight: "80px",
                      flex: 1,
                    }}
                  >
                    <SidebarToggleDisplay isCollapsed={false} />
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted-foreground)",
                        marginTop: "8px",
                        textAlign: "center",
                      }}
                    >
                      Expanded
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Conversation List Display</h2>
              <p style={styles.sectionDescription}>
                Conversation list container component that renders a scrollable
                area for conversation items with proper spacing and visual
                states
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Empty State:</span>
                <div style={{ width: "200px", height: "150px" }}>
                  <ConversationListDisplay
                    conversations={[]}
                    activeConversationId=""
                    scrollState="none"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Populated List:</span>
                <div style={{ width: "200px", height: "200px" }}>
                  <ConversationListDisplay
                    conversations={sampleConversations}
                    activeConversationId="Project Planning"
                    scrollState="scrollable"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Scrolled State:</span>
                <div style={{ width: "200px", height: "150px" }}>
                  <ConversationListDisplay
                    conversations={sampleConversations}
                    activeConversationId="Code Review"
                    scrollState="scrolled"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>No Active Selection:</span>
                <div style={{ width: "200px", height: "180px" }}>
                  <ConversationListDisplay
                    conversations={sampleConversations}
                    activeConversationId=""
                    scrollState="scrollable"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Single Item:</span>
                <div style={{ width: "200px", height: "120px" }}>
                  <ConversationListDisplay
                    conversations={[sampleConversations[0]!]}
                    activeConversationId="Project Planning"
                    scrollState="none"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Styling:</span>
                <div style={{ width: "220px", height: "160px" }}>
                  <ConversationListDisplay
                    conversations={sampleConversations.slice(0, 3)}
                    activeConversationId="Creative Writing"
                    scrollState="scrollable"
                    style={{
                      backgroundColor: "var(--accent)",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                    className="custom-conversation-list"
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Conversation Item Display</h2>
              <p style={styles.sectionDescription}>
                Individual conversation item display component showing
                conversation entries with different visual states - active,
                inactive, unread, and hover. Includes context menu with ellipses
                trigger that appears on hover for conversation actions (rename,
                duplicate, delete).
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Active Conversation:</span>
                <div style={{ width: "200px" }}>
                  <ConversationItemDisplay
                    conversation={{
                      name: "Project Planning",
                      lastActivity: "2h ago",
                      isActive: true,
                    }}
                    appearanceState="active"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Inactive Conversation:
                </span>
                <div style={{ width: "200px" }}>
                  <ConversationItemDisplay
                    conversation={{
                      name: "Creative Writing",
                      lastActivity: "Yesterday",
                      isActive: false,
                    }}
                    appearanceState="inactive"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Hover Appearance:</span>
                <div style={{ width: "200px" }}>
                  <ConversationItemDisplay
                    conversation={{
                      name: "Code Review",
                      lastActivity: "Dec 15",
                      isActive: false,
                    }}
                    appearanceState="hover"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Context Menu Demo:</span>
                <div style={{ width: "200px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                      marginBottom: "4px",
                    }}
                  >
                    ↗ Hover to see ellipses trigger
                  </div>
                  <ConversationItemDisplay
                    conversation={{
                      name: "API Development",
                      lastActivity: "30m ago",
                      isActive: false,
                    }}
                    appearanceState="inactive"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Unread Conversation:</span>
                <div style={{ width: "200px" }}>
                  <ConversationItemDisplay
                    conversation={{
                      name: "Bug Fixes",
                      lastActivity: "1h ago",
                      isActive: false,
                    }}
                    appearanceState="unread"
                    showUnreadIndicator={true}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Long Name Example:</span>
                <div style={{ width: "180px" }}>
                  <ConversationItemDisplay
                    conversation={{
                      name: "Very Long Conversation Name That Gets Truncated",
                      lastActivity: "Just now",
                      isActive: false,
                    }}
                    appearanceState="inactive"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Styling:</span>
                <div style={{ width: "200px" }}>
                  <ConversationItemDisplay
                    conversation={{
                      name: "Custom Styled",
                      lastActivity: "5m ago",
                      isActive: false,
                    }}
                    appearanceState="inactive"
                    style={{
                      backgroundColor: "var(--accent)",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                    }}
                    className="custom-conversation-item"
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Conversation Components</h2>
              <p style={styles.sectionDescription}>
                Messages, agent pills, chat interface elements, and
                conversation-specific UI
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>All Agents:</span>
                {sampleAgents.map((agent, index) => (
                  <AgentPill
                    key={index}
                    agent={agent}
                    onClick={(agentName) =>
                      console.log(`Clicked: ${agentName}`)
                    }
                  />
                ))}
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Thinking State:</span>
                {sampleAgents
                  .filter((agent) => agent.isThinking)
                  .map((agent, index) => (
                    <AgentPill key={index} agent={agent} />
                  ))}
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Non-clickable:</span>
                <AgentPill agent={sampleAgents[0]!} />
                <AgentPill agent={sampleAgents[2]!} />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Avatars - All:
                </span>
                {sampleAgents.map((agent, index) => (
                  <MessageAvatar
                    key={index}
                    agentColor={agent.color}
                    agentName={agent.name}
                    role={agent.role}
                  />
                ))}
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Avatar Sizes:</span>
                <MessageAvatar
                  agentColor="#3b82f6"
                  agentName="Technical Advisor"
                  role="Technical Advisor"
                  size="small"
                />
                <MessageAvatar
                  agentColor="#22c55e"
                  agentName="Project Manager"
                  role="Project Manager"
                  size="medium"
                />
                <MessageAvatar
                  agentColor="#ef4444"
                  agentName="Creative Director"
                  role="Creative Director"
                  size="large"
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Color Variants:</span>
                <MessageAvatar
                  agentColor="#3b82f6"
                  agentName="Technical Advisor"
                  role="Technical Advisor"
                />
                <MessageAvatar
                  agentColor="#22c55e"
                  agentName="Project Manager"
                  role="Project Manager"
                />
                <MessageAvatar
                  agentColor="#ef4444"
                  agentName="Creative Director"
                  role="Creative Director"
                />
                <MessageAvatar
                  agentColor="#a855f7"
                  agentName="UX Designer"
                  role="User Experience Designer"
                />
                <MessageAvatar
                  agentColor="#f59e0b"
                  agentName="Data Analyst"
                  role="Data Analyst"
                />
                <MessageAvatar
                  agentColor="#6366f1"
                  agentName="Backend Developer"
                  role="Backend Developer"
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Long Names:</span>
                <MessageAvatar
                  agentColor="#8b5cf6"
                  agentName="Senior Software Engineering Manager"
                  role="Senior Software Engineering Manager"
                  size="small"
                />
                <MessageAvatar
                  agentColor="#06b6d4"
                  agentName="Principal Product Designer"
                  role="Principal Product Designer"
                  size="medium"
                />
                <MessageAvatar
                  agentColor="#10b981"
                  agentName="Chief Technology Officer"
                  role="Chief Technology Officer"
                  size="large"
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Headers - Agent:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <MessageHeader
                    agentName="Technical Advisor"
                    agentRole="Technical Advisor"
                    agentColor="#3b82f6"
                    timestamp="2:15 PM"
                    messageType="agent"
                  />
                  <MessageHeader
                    agentName="Project Manager"
                    agentRole="Project Manager"
                    agentColor="#22c55e"
                    timestamp="Yesterday"
                    messageType="agent"
                  />
                  <MessageHeader
                    agentName="Creative Director"
                    agentRole="Creative Director"
                    agentColor="#ef4444"
                    timestamp="Dec 15"
                    messageType="agent"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Headers - User:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <MessageHeader
                    agentName="User"
                    agentRole="User"
                    agentColor="#6b7280"
                    timestamp="2:20 PM"
                    messageType="user"
                  />
                  <MessageHeader
                    agentName="User"
                    agentRole="User"
                    agentColor="#6b7280"
                    timestamp="Just now"
                    messageType="user"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Message Headers - System:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <MessageHeader
                    agentName="System"
                    agentRole="System"
                    agentColor="#64748b"
                    timestamp="2:25 PM"
                    messageType="system"
                  />
                  <MessageHeader
                    agentName="System"
                    agentRole="System Notification"
                    agentColor="#64748b"
                    timestamp="1 hour ago"
                    messageType="system"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Long Agent Names:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <MessageHeader
                    agentName="Senior Software Engineering Manager"
                    agentRole="Senior Software Engineering Manager"
                    agentColor="#8b5cf6"
                    timestamp="10:30 AM"
                    messageType="agent"
                  />
                  <MessageHeader
                    agentName="Principal Product Designer"
                    agentRole="Principal Product Designer & UX Lead"
                    agentColor="#06b6d4"
                    timestamp="9:45 AM"
                    messageType="agent"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Various Timestamps:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <MessageHeader
                    agentName="Ted"
                    agentRole="Technical Advisor"
                    agentColor="#3b82f6"
                    timestamp="2:15 PM"
                    messageType="agent"
                  />
                  <MessageHeader
                    agentName="Alice"
                    agentRole="Project Manager"
                    agentColor="#22c55e"
                    timestamp="Yesterday"
                    messageType="agent"
                  />
                  <MessageHeader
                    agentName="Lori"
                    agentRole="Creative Director"
                    agentColor="#ef4444"
                    timestamp="Dec 15, 2024"
                    messageType="agent"
                  />
                  <MessageHeader
                    agentName="Chelsea"
                    agentRole="UX Designer"
                    agentColor="#a855f7"
                    timestamp="Just now"
                    messageType="agent"
                  />
                  <MessageHeader
                    agentName="User"
                    agentRole="User"
                    agentColor="#6b7280"
                    timestamp="3 minutes ago"
                    messageType="user"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Complete Messages - Agent:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <MessageItem
                    message={{
                      id: "msg-1",
                      agent: "Technical Advisor",
                      role: "Technical Advisor",
                      content:
                        "Here's how you can implement that feature using React hooks and state management.",
                      timestamp: "2:15 PM",
                      type: "agent",
                      isActive: true,
                      agentColor: "#3b82f6",
                    }}
                    canRegenerate={true}
                    onContextMenuAction={() => {}}
                  />
                  <MessageItem
                    message={{
                      id: "msg-2",
                      agent: "Project Manager",
                      role: "Project Manager",
                      content:
                        "The timeline looks good. We should be able to deliver this by the end of the sprint.",
                      timestamp: "2:16 PM",
                      type: "agent",
                      isActive: true,
                      agentColor: "#22c55e",
                    }}
                    canRegenerate={true}
                    onContextMenuAction={() => {}}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Complete Messages - User:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <MessageItem
                    message={{
                      id: "msg-3",
                      agent: "User",
                      role: "User",
                      content:
                        "Can you help me understand how this component works?",
                      timestamp: "2:10 PM",
                      type: "user",
                      isActive: true,
                      agentColor: "#6b7280",
                    }}
                    canRegenerate={false}
                    onContextMenuAction={() => {}}
                  />
                  <MessageItem
                    message={{
                      id: "msg-4",
                      agent: "User",
                      role: "User",
                      content:
                        "I think we should consider adding more validation to this form.",
                      timestamp: "2:18 PM",
                      type: "user",
                      isActive: true,
                      agentColor: "#6b7280",
                    }}
                    canRegenerate={false}
                    onContextMenuAction={() => {}}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Complete Messages - System:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <MessageItem
                    message={{
                      id: "msg-5",
                      agent: "System",
                      role: "System",
                      content: "User joined the conversation",
                      timestamp: "2:05 PM",
                      type: "system",
                      isActive: true,
                      agentColor: "#64748b",
                    }}
                    canRegenerate={false}
                    onContextMenuAction={() => {}}
                  />
                  <MessageItem
                    message={{
                      id: "msg-6",
                      agent: "System",
                      role: "System",
                      content: "Conversation saved successfully",
                      timestamp: "2:20 PM",
                      type: "system",
                      isActive: true,
                      agentColor: "#64748b",
                    }}
                    canRegenerate={false}
                    onContextMenuAction={() => {}}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Long Content Messages:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <MessageItem
                    message={{
                      id: "msg-7",
                      agent: "Creative Director",
                      role: "Creative Director",
                      content:
                        "I think we should explore a more modern approach to this design. The current layout feels a bit dated and could benefit from better use of whitespace, improved typography hierarchy, and more thoughtful color choices. We should also consider how this will work across different screen sizes and ensure the user experience is consistent throughout all touchpoints.",
                      timestamp: "1:45 PM",
                      type: "agent",
                      isActive: true,
                      agentColor: "#ef4444",
                    }}
                    canRegenerate={true}
                    onContextMenuAction={() => {}}
                  />
                  <MessageItem
                    message={{
                      id: "msg-8",
                      agent: "User",
                      role: "User",
                      content:
                        "I agree with those points. The current design does feel outdated and could use some modernization. What specific changes would you recommend we prioritize first? Should we focus on the typography and spacing issues, or would it be better to start with the color palette and overall visual hierarchy?",
                      timestamp: "1:50 PM",
                      type: "user",
                      isActive: true,
                      agentColor: "#6b7280",
                    }}
                    canRegenerate={false}
                    onContextMenuAction={() => {}}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Inactive Messages:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <MessageItem
                    message={{
                      id: "msg-9",
                      agent: "UX Designer",
                      role: "User Experience Designer",
                      content:
                        "This message is inactive and should appear dimmed.",
                      timestamp: "12:30 PM",
                      type: "agent",
                      isActive: false,
                      agentColor: "#a855f7",
                    }}
                    canRegenerate={true}
                    onContextMenuAction={() => {}}
                  />
                  <MessageItem
                    message={{
                      id: "msg-10",
                      agent: "User",
                      role: "User",
                      content: "This user message is also inactive and dimmed.",
                      timestamp: "12:35 PM",
                      type: "user",
                      isActive: false,
                      agentColor: "#6b7280",
                    }}
                    canRegenerate={false}
                    onContextMenuAction={() => {}}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Various Agent Colors:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "100%",
                  }}
                >
                  <MessageItem
                    message={{
                      id: "msg-11",
                      agent: "Data Analyst",
                      role: "Data Analyst",
                      content: "The analytics show strong user engagement.",
                      timestamp: "11:15 AM",
                      type: "agent",
                      isActive: true,
                      agentColor: "#f59e0b",
                    }}
                    canRegenerate={true}
                    onContextMenuAction={() => {}}
                  />
                  <MessageItem
                    message={{
                      id: "msg-12",
                      agent: "Backend Developer",
                      role: "Backend Developer",
                      content: "The API endpoints are ready for testing.",
                      timestamp: "11:20 AM",
                      type: "agent",
                      isActive: true,
                      agentColor: "#6366f1",
                    }}
                    canRegenerate={true}
                    onContextMenuAction={() => {}}
                  />
                  <MessageItem
                    message={{
                      id: "msg-13",
                      agent: "QA Engineer",
                      role: "Quality Assurance Engineer",
                      content: "All tests are passing successfully.",
                      timestamp: "11:25 AM",
                      type: "agent",
                      isActive: true,
                      agentColor: "#10b981",
                    }}
                    canRegenerate={true}
                    onContextMenuAction={() => {}}
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Message Content</h2>
              <p style={styles.sectionDescription}>
                Message text content display with proper typography, whitespace
                preservation, and text selection support
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Short Text:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <MessageContent
                    content="This is a short message response."
                    messageType="agent"
                  />
                  <MessageContent
                    content="Can you help me with this task?"
                    messageType="user"
                  />
                  <MessageContent
                    content="User joined the conversation"
                    messageType="system"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Medium Text:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <MessageContent
                    content="This is a longer message that demonstrates how the MessageContent component handles multi-sentence responses with proper line height and spacing. The typography should be clear and readable with good visual hierarchy."
                    messageType="agent"
                  />
                  <MessageContent
                    content="I have a more detailed question about how this feature works and whether it supports all the functionality I need for my use case."
                    messageType="user"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Text with Line Breaks:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <MessageContent
                    content="This message has multiple lines.

It includes paragraph breaks and preserves whitespace formatting.

• Bullet points work properly
• Line spacing is maintained
• Whitespace preservation with pre-wrap"
                    messageType="agent"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Code Snippets:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <MessageContent
                    content="Here's a code example:

function MessageContent({ content, messageType }) {
  return (
    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
      {content}
    </div>
  );
}

The formatting and indentation are preserved."
                    messageType="agent"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Long Content:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <MessageContent
                    content="This is a very long message that demonstrates how the MessageContent component handles extensive text content. It should wrap properly and maintain readability even with large amounts of text. The line height and spacing should remain consistent throughout the entire message, making it easy to read and scan.

The component should handle overflow gracefully and ensure that text selection and copying functionality works across the entire content area. This includes preserving formatting when users copy text from the message.

Additional paragraphs should maintain proper spacing and visual hierarchy. The typography should remain clear and accessible regardless of the content length or complexity."
                    messageType="agent"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Expandable Messages (500+ chars):
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <MessageContent
                    content="This message demonstrates character-based expansion with the default 500 character threshold. When a message exceeds this length, it automatically shows a 'Show more...' button that allows users to expand and collapse the content. The preview truncates at word boundaries when possible for better readability, ensuring that partial words aren't shown at the break point."
                    messageType="agent"
                  />
                  <MessageContent
                    content="Here's another expandable message that shows how the expansion works with user messages. The component intelligently finds good break points near the 500 character threshold, preferring to break at word boundaries rather than in the middle of words. This creates a much better user experience when reading truncated content, as users can understand the preview without seeing partial words or awkward breaks."
                    messageType="user"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Custom Threshold (100 chars):
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <MessageContent
                    content="This message demonstrates a custom expansion threshold of 100 characters. With a lower threshold, even shorter messages will show the expansion functionality, which can be useful for components that need to keep content more compact."
                    messageType="agent"
                    expansionThreshold={100}
                  />
                  <MessageContent
                    content="Another example with the 100 character threshold. This allows for more granular control over when expansion controls appear, making the component flexible for different use cases and layout requirements."
                    messageType="system"
                    expansionThreshold={100}
                  />
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Utility Components</h2>
              <p style={styles.sectionDescription}>
                Loading states, error boundaries, theme toggles, and utility
                interface elements
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Theme Toggle - Interactive:
                </span>
                <ThemeToggle
                  currentTheme={currentTheme}
                  onToggle={(newTheme) => {
                    setCurrentTheme(newTheme);
                    console.log(`Theme switched to: ${newTheme}`);
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Current: {currentTheme}
                </span>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Light Mode:</span>
                <ThemeToggle
                  currentTheme="light"
                  onToggle={(theme) =>
                    console.log(`Light toggle clicked: ${theme}`)
                  }
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Dark Mode:</span>
                <ThemeToggle
                  currentTheme="dark"
                  onToggle={(theme) =>
                    console.log(`Dark toggle clicked: ${theme}`)
                  }
                />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Thinking Indicators - Sizes:
                </span>
                <ThinkingIndicator size="small" />
                <ThinkingIndicator size="medium" />
                <ThinkingIndicator size="large" />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Animation Speeds:</span>
                <ThinkingIndicator animationSpeed="slow" />
                <ThinkingIndicator animationSpeed="normal" />
                <ThinkingIndicator animationSpeed="fast" />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Colors:</span>
                <ThinkingIndicator />
                <ThinkingIndicator color="#ef4444" />
                <ThinkingIndicator color="#22c55e" />
                <ThinkingIndicator color="#f59e0b" />
                <ThinkingIndicator color="#8b5cf6" />
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Multiple Indicators:</span>
                <ThinkingIndicator
                  size="small"
                  color="#3b82f6"
                  animationSpeed="fast"
                />
                <ThinkingIndicator
                  size="medium"
                  color="#ef4444"
                  animationSpeed="normal"
                />
                <ThinkingIndicator
                  size="large"
                  color="#22c55e"
                  animationSpeed="slow"
                />
                <ThinkingIndicator
                  size="small"
                  color="#f59e0b"
                  animationSpeed="normal"
                />
                <ThinkingIndicator
                  size="medium"
                  color="#8b5cf6"
                  animationSpeed="fast"
                />
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Display Components</h2>
              <p style={styles.sectionDescription}>
                Cards, lists, modals, tooltips, and other presentational
                components
              </p>
            </div>
            <div style={styles.agentPillShowcase}>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Menu Below (Open):</span>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    marginLeft: "20px",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--muted)",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    Trigger Element
                  </div>
                  <ContextMenuDisplay
                    isOpen={true}
                    position="below"
                    items={sampleMenuItems}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Menu Above (Open):</span>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    marginTop: "80px",
                    marginLeft: "200px",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--muted)",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    Trigger Element
                  </div>
                  <ContextMenuDisplay
                    isOpen={true}
                    position="above"
                    items={sampleMenuItems}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Menu Closed:</span>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--muted)",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    Hidden Menu
                  </div>
                  <ContextMenuDisplay
                    isOpen={false}
                    position="below"
                    items={sampleMenuItems}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Simple Menu:</span>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--muted)",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    Simple Options
                  </div>
                  <ContextMenuDisplay
                    isOpen={true}
                    position="below"
                    items={[
                      { label: "Option 1", action: "option1" },
                      { label: "Option 2", action: "option2" },
                      { label: "Option 3", action: "option3" },
                    ]}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Static Visual States:</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "4px",
                    minWidth: "140px",
                  }}
                >
                  <MenuItemDisplay
                    label="Normal Item"
                    action="normal"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Hover State"
                    action="hover"
                    variant="hover"
                  />
                  <MenuItemDisplay
                    label="Disabled Item"
                    action="disabled"
                    variant="disabled"
                  />
                  <MenuItemDisplay
                    label="Danger Action"
                    action="danger"
                    variant="danger"
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Interactive Hover (try it!):
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "4px",
                    minWidth: "140px",
                  }}
                >
                  <MenuItemDisplay
                    label="Hover Me"
                    action="hover-demo"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="And Me Too"
                    action="hover-demo2"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Disabled (No Hover)"
                    action="disabled-demo"
                    variant="normal"
                    disabled={true}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Menu Items with Icons (hover enabled):
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "4px",
                    minWidth: "160px",
                    width: "160px",
                  }}
                >
                  <MenuItemDisplay
                    label="Copy"
                    action="copy"
                    icon="📋"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Regenerate"
                    action="regenerate"
                    icon="🔄"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Delete"
                    action="delete"
                    icon="🗑️"
                    variant="danger"
                  />
                  <MenuItemDisplay
                    label="Unavailable"
                    action="unavailable"
                    icon="⚠️"
                    variant="normal"
                    disabled={true}
                  />
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>
                  Menu Items with Separators:
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0px",
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "4px",
                    minWidth: "140px",
                  }}
                >
                  <MenuItemDisplay
                    label="First Group"
                    action="first"
                    variant="normal"
                    separator={true}
                  />
                  <MenuItemDisplay
                    label="Second Group"
                    action="second"
                    variant="normal"
                    separator={true}
                  />
                  <MenuItemDisplay
                    label="Final Item"
                    action="final"
                    variant="normal"
                  />
                </div>
              </div>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Menu Trigger States:</span>
                <div
                  style={{ display: "flex", gap: "16px", alignItems: "center" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MenuTriggerDisplay variant="normal" />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Normal
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MenuTriggerDisplay variant="hover" />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Hover
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MenuTriggerDisplay variant="active" />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MenuTriggerDisplay variant="disabled" />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Disabled
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Menu Trigger Sizes:</span>
                <div
                  style={{ display: "flex", gap: "16px", alignItems: "center" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MenuTriggerDisplay variant="normal" size="small" />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Small
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <MenuTriggerDisplay variant="normal" size="medium" />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Medium
                    </span>
                  </div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Generic ContextMenu Component</h3>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Basic ContextMenu:</span>
                <ContextMenu>
                  <MenuItemDisplay
                    label="Copy"
                    action="copy"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Regenerate"
                    action="regenerate"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Delete"
                    action="delete"
                    variant="danger"
                  />
                </ContextMenu>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Above Position:</span>
                <div style={{ marginTop: "80px" }}>
                  <ContextMenu position="above">
                    <MenuItemDisplay
                      label="Copy"
                      action="copy"
                      variant="normal"
                    />
                    <MenuItemDisplay
                      label="Delete"
                      action="delete"
                      variant="danger"
                    />
                  </ContextMenu>
                </div>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Disabled ContextMenu:</span>
                <ContextMenu disabled>
                  <MenuItemDisplay
                    label="Unavailable"
                    action="unavailable"
                    variant="normal"
                  />
                </ContextMenu>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Custom Trigger:</span>
                <ContextMenu
                  trigger={
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Custom Button
                    </div>
                  }
                >
                  <MenuItemDisplay
                    label="Action 1"
                    action="action1"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Action 2"
                    action="action2"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Action 3"
                    action="action3"
                    variant="normal"
                  />
                </ContextMenu>
              </div>

              <div style={styles.agentPillRow}>
                <span style={styles.agentPillLabel}>Auto Position:</span>
                <ContextMenu position="auto">
                  <MenuItemDisplay
                    label="Smart Position"
                    action="smart"
                    variant="normal"
                  />
                  <MenuItemDisplay
                    label="Viewport Aware"
                    action="viewport"
                    variant="normal"
                  />
                </ContextMenu>
              </div>
            </div>
          </section>
        </div>

        <section style={styles.additionGuide}>
          <h2 style={styles.additionTitle}>
            Manual Component Addition Pattern
          </h2>

          <div style={styles.step}>
            <span style={styles.stepNumber}>1.</span>
            <span style={styles.stepText}>
              Import the component at the top of this file:
            </span>
          </div>
          <div style={styles.codeBlock}>
            {`import { NewComponent } from '../../components/NewComponent';`}
          </div>

          <div style={styles.step}>
            <span style={styles.stepNumber}>2.</span>
            <span style={styles.stepText}>
              Define sample data object (inline, typed):
            </span>
          </div>
          <div style={styles.codeBlock}>
            {`const newComponentData = {
  prop1: 'sample value',
  prop2: true,
  // Type according to component prop interfaces
};`}
          </div>

          <div style={styles.step}>
            <span style={styles.stepNumber}>3.</span>
            <span style={styles.stepText}>
              Add to appropriate section by replacing the placeholder div:
            </span>
          </div>
          <div style={styles.codeBlock}>
            {`<div style={styles.componentArea}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
    <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--foreground)' }}>
      NewComponent
    </h3>
    <NewComponent {...newComponentData} />
  </div>
</div>`}
          </div>
        </section>
      </div>
    </ShowcaseLayout>
  );
}

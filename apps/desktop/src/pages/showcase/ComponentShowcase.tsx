import { Agent, ThemeMode } from "@fishbowl-ai/shared";
import { useState } from "react";
import { ShowcaseLayout } from "../../components/showcase/ShowcaseLayout";
import {
  AgentPill,
  Button,
  ThemeToggle,
  ThinkingIndicator,
} from "../../components/ui/atomic";
import { MessageInputDisplay } from "../../components/ui/input";

export default function ComponentShowcase() {
  // Theme toggle state for interactive demo
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("light");

  // Sample agent data for AgentPill showcase
  const sampleAgents: Agent[] = [
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
                <div style={{ width: "300px" }}>
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
            <div style={styles.componentArea}>
              Components will appear here when manually added
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
            {`import { NewComponent } from '../../components/ui/NewComponent';`}
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

import { Agent } from "@fishbowl-ai/shared";
import { ShowcaseLayout } from "../../components/showcase/ShowcaseLayout";
import { AgentPill } from "../../components/ui/atomic";

export default function ComponentShowcase() {
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
      maxWidth: "1200px",
      margin: "0 auto",
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
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
      gap: "32px",
      marginBottom: "48px",
    },
    section: {
      backgroundColor: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
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
            <div style={styles.componentArea}>
              Components will appear here when manually added
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
            <div style={styles.componentArea}>
              Components will appear here when manually added
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

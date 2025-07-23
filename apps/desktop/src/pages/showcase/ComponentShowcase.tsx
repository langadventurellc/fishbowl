import { Link } from "react-router-dom";

export default function ComponentShowcase() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          color: "#333",
          marginBottom: "1rem",
        }}
      >
        Component Showcase
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#666",
          marginBottom: "2rem",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        Individual component testing page for self-contained components
        (buttons, inputs, pills, etc.)
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <Link
          to="/showcase/layout"
          style={{
            padding: "12px 24px",
            backgroundColor: "#22c55e",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          View Layout Showcase
        </Link>
        <Link
          to="/"
          style={{
            padding: "12px 24px",
            backgroundColor: "#6b7280",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Back to Home
        </Link>
      </div>

      <div
        style={{
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <h2 style={{ color: "#333", marginBottom: "1rem" }}>
          Component Sections (Ready for Manual Addition)
        </h2>
        <div style={{ color: "#666" }}>
          <h3
            style={{
              color: "#333",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Input Components
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
            Forms, buttons, toggles, input fields, text areas
          </p>

          <h3
            style={{
              color: "#333",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Conversation Components
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
            Messages, agent pills, chat interface elements
          </p>

          <h3
            style={{
              color: "#333",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Utility Components
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
            Loading states, error boundaries, theme toggles
          </p>

          <h3
            style={{
              color: "#333",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Display Components
          </h3>
          <p style={{ fontSize: "0.9rem" }}>Cards, lists, modals, tooltips</p>
        </div>
      </div>
    </div>
  );
}

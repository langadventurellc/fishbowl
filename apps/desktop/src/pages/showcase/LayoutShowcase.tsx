import { Link } from "react-router-dom";

export default function LayoutShowcase() {
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
        Layout Showcase
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
        Full-screen layout demonstration showing how major page components work
        together (sidebar + main content window)
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <Link
          to="/showcase/components"
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          View Component Showcase
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
          Layout Components (Ready for Integration)
        </h2>
        <div style={{ color: "#666" }}>
          <h3
            style={{
              color: "#333",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Sidebar Component
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
            Collapsible navigation and conversation management
          </p>

          <h3
            style={{
              color: "#333",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Main Content Window
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
            Primary content area with message display
          </p>

          <h3
            style={{
              color: "#333",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Layout Integration
          </h3>
          <p style={{ fontSize: "0.9rem" }}>
            How components work together in realistic screen layout
          </p>
        </div>
      </div>
    </div>
  );
}

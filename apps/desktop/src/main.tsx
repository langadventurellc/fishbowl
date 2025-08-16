import React from "react";
import ReactDOM from "react-dom/client";
import "@fishbowl-ai/ui-theme/claymorphism-theme.css";
import "./styles/design-tokens.css";
import "./styles/tab-transitions.css";
import "./styles/utilities.css";
import App from "./App";
import { ServicesProvider } from "./contexts";
import { RendererProcessServices } from "./renderer/services";

// Initialize renderer process services
const services = new RendererProcessServices();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ServicesProvider services={services}>
      <App />
    </ServicesProvider>
  </React.StrictMode>,
);

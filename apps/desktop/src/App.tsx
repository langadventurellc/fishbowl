import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ComponentShowcase from "./pages/showcase/ComponentShowcase";
import LayoutShowcase from "./pages/showcase/LayoutShowcase";
import { useElectronIPC } from "./hooks/useElectronIPC";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useSettingsModal } from "@fishbowl-ai/shared";

export default function App() {
  // Initialize IPC integration for settings modal
  useElectronIPC();

  // Get settings modal state for rendering
  const { isOpen, closeModal } = useSettingsModal();

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/showcase/components" element={<ComponentShowcase />} />
          <Route path="/showcase/layout" element={<LayoutShowcase />} />
        </Routes>
      </HashRouter>

      {/* Settings Modal - rendered globally */}
      <SettingsModal open={isOpen} onOpenChange={closeModal} />
    </>
  );
}

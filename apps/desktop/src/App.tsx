import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DesignPrototype from "./pages/DesignPrototype";
import ComponentShowcase from "./pages/showcase/ComponentShowcase";
import LayoutShowcase from "./pages/showcase/LayoutShowcase";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prototype" element={<DesignPrototype />} />
        <Route path="/showcase/components" element={<ComponentShowcase />} />
        <Route path="/showcase/layout" element={<LayoutShowcase />} />
      </Routes>
    </HashRouter>
  );
}

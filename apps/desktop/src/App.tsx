import { HashRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ComponentShowcase from "./pages/showcase/ComponentShowcase";
import LayoutShowcase from "./pages/showcase/LayoutShowcase";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/showcase/components" element={<ComponentShowcase />} />
        <Route path="/showcase/layout" element={<LayoutShowcase />} />
      </Routes>
    </HashRouter>
  );
}

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Encrypt from "./pages/Encrypt";
import Project from "./pages/Project";
import Decrypt from "./pages/Decrypt";

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Encrypt />} />
          <Route path="/decrypt" element={<Decrypt />} />
          <Route path="/project" element={<Project />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

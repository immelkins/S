import { Link } from "react-router-dom";
import "../stylesheets/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">Encrypt</Link>
      <Link to="/decrypt" className="nav-link">Decrypt</Link>
      <Link to="/project" className="nav-link">Project</Link>
    </nav>
  );
}

export default Navbar;
// Encrypt.js
import { Link } from "react-router-dom";
import "../stylesheets/Home.css";
import Encryption from "../components/Encryption";

function Encrypt() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Steganography Encryption</h1>
        <p className="home-subtitle">Explore & Encrypt</p>
      </header>

      <section className="home-cards">
        <Link to="/project" className="home-card-link">
          <div className="home-card">
            <h2>Project</h2>
          </div>
        </Link>

        <Link to="/decrypt" className="home-card-link">
          <div className="home-card">
            <h2>Decrypt</h2>
          </div>
        </Link>
      </section>

      <Encryption />
    </div>
  );
}

export default Encrypt;
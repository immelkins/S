import { Link } from "react-router-dom";
import "../stylesheets/Home.css";
import Decryption from "../components/Decryption";

function Decrypt() {
  return ( 
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Steganography Decryption</h1>
        <p className="home-subtitle">Explore & Decrypt</p>
      </header>

      <section className="home-cards">
        <Link to="/project" className="home-card-link">
          <div className="home-card">
            <h2>Project</h2>
          </div>
        </Link>

        <Link to="/" className="home-card-link">
          <div className="home-card">
            <h2>Encrypt</h2>
          </div>
        </Link>
      </section>

      <Decryption />
    </div>
  );
}

export default Decrypt;

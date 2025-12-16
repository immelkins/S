// Encrypt.js
import { useState } from "react";
import "../stylesheets/Home.css";
import EncryptSection from "../components/EncryptSection";

function Encrypt() {


  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Delving into Steganography</h1>
        <p className="home-subtitle">Explore & Discover</p>
      </header>

      <section className="home-cards">
        <div className="home-card">
          <h2>Project</h2>
        </div>

        <div className="home-card">
          <h2>Decrypt</h2>
        </div>
      </section>

      <EncryptSection />    {/* GIFUpload and FramePreview */}
    </div>
  );
}

export default Encrypt;
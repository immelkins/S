import { useState } from "react";
import "../stylesheets/Home.css";
import DecryptSection from "../components/DecryptSection";

function Decrypt() {
  return ( 
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Decrypt Page</h1>
        <p className="home-subtitle">Explore & Decrypt</p>
      </header>

      <section className="home-cards">
        <div className="home-card">
          <h2>Project</h2>
        </div>

        <div className="home-card">
          <h2>Decrypt</h2>
        </div>
      </section>

      <DecryptSection />
    </div>
  );
}

export default Decrypt;

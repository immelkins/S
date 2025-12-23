import { Link } from "react-router-dom";
import "../stylesheets/Project.css"; // import the CSS
import "../stylesheets/Home.css"; // import the CSS

function Project() {
  return (
    <div className="project-container">
      <header className="project-header">
        <h1 className="project-title">Temporal Steganography in Animated GIFs</h1>
        <p className="project-subtitle">
          Using Per-Frame LSB Encoding to hide information in animated GIFs
        </p>

        <section className="home-cards">
          <Link to="/" className="home-card-link">
            <div className="home-card">
              <h2>Encrypt</h2>
            </div>
          </Link>

          <Link to="/decrypt" className="home-card-link">
            <div className="home-card">
              <h2>Decrypt</h2>
            </div>
          </Link>
        </section>
      </header>

      <section className="project-section">
        <h2 className="section-title">Project Description</h2>
        <p>
          Steganography is the art of hiding information within digital media so that its presence remains undetected. While traditional steganography focuses on static images, animated formats like GIFs allow data to be concealed across multiple frames using per-frame LSB encoding, introducing a temporal dimension.
        </p>
        <p>
          This project explores blue channel pixel manipulation in animated GIFs. Each frame encodes a segment of the message within the least significant bits of its blue channel, leveraging time to enhance security and minimize perceptibility.
        </p>
      </section>

      <section className="project-section">
        <h2 className="section-title">Main Components</h2>
        <ul>
          <li>Frame Extraction</li>
          <li>Blue Channel LSB Encoding</li>
          <li>Frame Reconstruction</li>
          <li>Message Extraction</li>
        </ul>
      </section>

      <section className="project-section">
        <h2 className="section-title">Analysis Plan</h2>

        <h3 className="sub-title">A. Temporal Robustness Experiment</h3>
        <p>Evaluate message recovery under conditions like:</p>
        <ul>
          <li>Altering GIF frame rate</li>
          <li>Recompressing or re-saving with lossy parameters</li>
        </ul>
        <p>Message integrity will be quantified using <strong>Bit Error Rate (BER)</strong>.</p>

        <h3 className="sub-title">B. Perceptual Stealth Analysis</h3>
        <p>Assess visual imperceptibility of original vs stego-GIFs using:</p>
        <ul>
          <li>Mean Squared Error (MSE)</li>
          <li>Structural Similarity Index (SSIM)</li>
        </ul>
        <p>Low MSE and high SSIM indicate minimal detectable distortion.</p>

        <h3 className="sub-title">C. Multi-Layer Encoding</h3>
        <p>Two independent encoding layers:</p>
        <ul>
          <li>Temporal layer: embeds one message across frames</li>
          <li>Spatial layer: embeds a secondary message within each frame’s pixel matrix</li>
        </ul>
        <p>Independent decoders extract each message to demonstrate multidimensional encoding.</p>

        <h3 className="sub-title">D. Key-Based Encryption</h3>
        <p>
          All messages are encrypted with a symmetric key before embedding. Without the correct key, extracted data appears random, ensuring confidentiality.
        </p>
      </section>

      <section className="project-section">
        <h2 className="section-title">Projected Outcome</h2>
        <ul>
          <li>Demonstrate the viability of blue-channel temporal steganography in GIFs</li>
          <li>Quantify trade-offs between concealment, robustness, and data capacity</li>
          <li>Provide visual and analytical evidence (MSE, SSIM, BER)</li>
        </ul>
      </section>

      <section className="project-section">
        <h2 className="section-title">Deliverables</h2>
        <ul>
          <li>Source code for encoder/decoder tools</li>
          <li>Written report with analysis and findings</li>
          <li>Sample stego-GIFs showing hidden data transmission</li>
        </ul>

      </section>
    </div>
  );
}

export default Project;

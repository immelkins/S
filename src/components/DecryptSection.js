import { useState } from "react";
import ToBits from "./ToBits";

const HEADER_PATTERN = "10101011"; // 8-bit header

export default function DecryptMetadata() {
  const [file, setFile] = useState(null);
  const [frames, setFrames] = useState([]);
  const [metadataText, setMetadataText] = useState('');
  const [error, setError] = useState(null);

  const handleGIFChange = (event) => {
    const gifFile = event.target.files[0];
    if (!gifFile) return;
    if (gifFile.type !== 'image/gif') {
      setError('Please upload a valid GIF file.');
      return;
    }
    setFile(gifFile);

    ToBits(gifFile)
      .then(({ frames }) => setFrames(frames))
      .catch(err => setError(err.message));
  };

  // Convert bits to string until the braces are balanced
  const bitsToStringUntilClosedBraces = (bits) => {
    let str = '';
    let braceCount = 0;
    let started = false;

    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.slice(i, i + 8).padEnd(8, '0');
      const char = String.fromCharCode(parseInt(byte, 2));

      if (char === '{') {
        braceCount++;
        started = true;
      } else if (char === '}') {
        braceCount--;
      }

      if (started) str += char;
      if (started && braceCount === 0) break;
    }

    return str;
  };

  const handleExtract = () => {
    if (!frames.length) return;

    // Read header from first frame
    const firstFrame = frames[0];
    let headerBits = '';
    for (let i = 0; i < HEADER_PATTERN.length; i++) {
      headerBits += (firstFrame.patch[i * 4 + 2] & 1).toString();
    }

    if (headerBits !== HEADER_PATTERN) {
      setError("Header not found in GIF.");
      return;
    }

    // Extract metadata bits from all frames
    let bits = '';
    for (let frameIndex = 0; frameIndex < frames.length; frameIndex++) {
      const frame = frames[frameIndex];
      const startPixel = frameIndex === 0 ? 8 : 0; // skip header bits in frame 0
      for (let i = startPixel * 4; i < frame.patch.length; i += 4) {
        bits += (frame.patch[i + 2] & 1).toString();
      }
    }

    // Convert bits to string until closing brace
    const metadataString = bitsToStringUntilClosedBraces(bits);
    setMetadataText(metadataString);

    // Download metadata as .txt
    const blob = new Blob([metadataString], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "extracted_metadata.txt";
    a.click();
  };

  return (
    <div>
      <input type="file" accept="image/gif" onChange={handleGIFChange} />
      {file && <p>Uploaded GIF: {file.name}</p>}
      {frames.length > 0 && <button onClick={handleExtract}>Extract Metadata</button>}
      {metadataText && (
        <div>
          <p>Metadata:</p>
          <pre>{metadataText}</pre>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

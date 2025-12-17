// EncryptSection.js
import { useEffect, useState } from "react";
import ToGIF from "./ToGIF";
import ToBits from "./ToBits";
import ToBinary from "./ToBinary";
import '../stylesheets/Frames.css';

// Generate preview images for frames
async function generateFramePreviews(frames, setFramePreviews) {
  const previews = [];
  for (const frame of frames) {
    const { width, height, patch } = frame;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    const imageData = context.createImageData(width, height);
    imageData.data.set(patch);
    context.putImageData(imageData, 0, 0);
    previews.push(canvas.toDataURL("image/png"));
  }
  setFramePreviews(previews);
}

// Handle frame click to show bits
const handleFrameClick = (frame, i, setSelectedFrame) => {
  const pixelsPerRow = 6;
  let formattedBits = '';
  for (let j = 0; j < frame.patch.length; j += 4 * pixelsPerRow) {
    for (let k = 0; k < pixelsPerRow; k++) {
      if (j + k * 4 >= frame.patch.length) break;
      const r = String(frame.patch[j + k * 4]).padStart(3, '_');
      const g = String(frame.patch[j + k * 4 + 1]).padStart(3, '_');
      const b = String(frame.patch[j + k * 4 + 2]).padStart(3, '_');
      const a = String(frame.patch[j + k * 4 + 3]).padStart(3, '_');
      formattedBits += `[${r}, ${g}, ${b}, ${a}]`;
    }
    formattedBits += '\n';
  }
  setSelectedFrame({ frame: i + 1, bits: formattedBits });
};

// LSB encode with logging
/*const lsbEncodeWithLog = (frames, message) => {
  const encodedFrames = [...frames];
  let messageIndex = 0;
  const logLines = [];

  for (let frameIndex = 0; frameIndex < encodedFrames.length; frameIndex++) {
    const frame = encodedFrames[frameIndex];
    const patch = frame.patch;

    for (let i = 0; i < patch.length; i += 4) {
      if (messageIndex >= message.length) break;

      const originalB = patch[i + 2];
      const newB = (originalB & ~1) | (message[messageIndex] === '1' ? 1 : 0);
      patch[i + 2] = newB;

      logLines.push(
        `Pixel ${messageIndex}: Original B = ${originalB}, Encoded B = ${newB}, LSB = ${newB & 1}`
      );

      messageIndex++;
    }
    if (messageIndex >= message.length) break;
  }

  return { encodedFrames, logText: logLines.join('\n') };
};*/
const HEADER_PATTERN = "10101011"; // 8-bit header

// Spatial encoding for message
const spatialEncode = (frames, message) => {
  const encodedFrames = [...frames];
  let messageIndex = 0;

  for (const frame of encodedFrames) {
    const patch = frame.patch;
    for (let i = 0; i < patch.length; i += 4) {
      if (messageIndex >= message.length) break;
      patch[i + 2] = (patch[i + 2] & ~1) | (message[messageIndex] === '1' ? 1 : 0);
      messageIndex++;
    }
    if (messageIndex >= message.length) break;
  }

  return encodedFrames;
};

// Temporal encoding for metadata with header (8 bits in first frame)
const temporalEncode = (frames, metadataBits) => {
  const encodedFrames = [...frames];

  // Encode header in first 8 pixels
  const firstFrame = encodedFrames[0];
  for (let i = 0; i < HEADER_PATTERN.length; i++) {
    firstFrame.patch[i * 4 + 2] = (firstFrame.patch[i * 4 + 2] & ~1) | (HEADER_PATTERN[i] === '1' ? 1 : 0);
  }

  // Encode metadata after header
  let bitIndex = 0;
  for (let frameIndex = 0; frameIndex < encodedFrames.length; frameIndex++) {
    const frame = encodedFrames[frameIndex];
    const startPixel = frameIndex === 0 ? 8 : 0; // skip first 8 pixels in frame 0
    for (let i = startPixel * 4; i < frame.patch.length; i += 4) {
      if (bitIndex >= metadataBits.length) break;
      frame.patch[i + 2] = (frame.patch[i + 2] & ~1) | (metadataBits[bitIndex] === '1' ? 1 : 0);
      bitIndex++;
    }
    if (bitIndex >= metadataBits.length) break;
  }

  return encodedFrames;
};


// Main component
export default function EncryptSection() {
  const [frames, setFrames] = useState([]);
  const [framePreviews, setFramePreviews] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [messageFile, setMessageFile] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [password, setPassword] = useState("");
  const [payload, setPayload] = useState(null);

  const handleGIFChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'image/gif') {
      setError('Please upload a valid GIF file.');
      return;
    }
    setError(null);
    setFile(file);
    setFileName(file.name);
  };

  const handleMessageFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setError(null);
    setMessageFile(file);

    try {
      const encryptedPayload = await ToBinary(file, password);
      setPayload(encryptedPayload);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEncrypt = async () => {
    if (!frames.length || !payload) return;

    const metadataWithHeader = HEADER_PATTERN + payload.metabits;
    // Encode message spatially
    const spatialFrames = spatialEncode(frames, payload.bits);
    // Encode metadata temporally
    const finalFrames = temporalEncode(spatialFrames, metadataWithHeader);

    const gifURL = await ToGIF(finalFrames);
    const a = document.createElement("a");
    a.href = gifURL;
    a.download = `encrypted_${fileName}`;
    a.click();

    if (metadataWithHeader) {
      const blob = new Blob([metadataWithHeader], { type: "text/plain" });
      const metaLink = document.createElement("a");
      metaLink.href = URL.createObjectURL(blob);
      metaLink.download = `metadata_binary.txt`;
      metaLink.click();
    }
  };

  useEffect(() => {
    if (!file) return;
    ToBits(file).then(({ frames: extractedFrames }) => {
      setFrames(extractedFrames);
    })
      .catch(err => setError(err.message));
  }, [file]);

  useEffect(() => {
    if (frames.length === 0) return;
    generateFramePreviews(frames, setFramePreviews);
  }, [frames]);

  useEffect(() => {
    if (!messageFile || !password) {
      setPayload(null);
      return;
    }

    (async () => {
      try {
        const encryptedPayload = await ToBinary(messageFile, password);
        setPayload(encryptedPayload);
      } catch (err) {
        setError(err.message);
        setPayload(null);
      }
    })();
  }, [messageFile, password]);

  return (
    <div>
      <input type="file" accept="image/gif" onChange={handleGIFChange} />
      {fileName && <p>Uploaded GIF: {fileName}</p>}

      <input type="file" onChange={handleMessageFileChange} />
      {messageFile && <p>Message file: {messageFile.name}</p>}

      <input
        type="password"
        placeholder="Enter encryption password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {file && messageFile && password && payload && (
        <button onClick={handleEncrypt}>Encrypt Message</button>
      )}

      {frames.length > 0 && (
        <div className="frame-container">
          <p>Frames extracted: {frames.length}</p>
          <div className="frames">
            {framePreviews.map((src, index) => (
              <div key={index} className="frame">
                <p>Frame {index}</p>
                <img src={src} className="canvas" onClick={() => handleFrameClick(frames[index], index, setSelectedFrame)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFrame && (
        <div className="modal">
          <div className="modal-content">
            <h2>Frame {selectedFrame.frame} Bits</h2>
            <pre>{selectedFrame.bits}</pre>
            <button onClick={() => setSelectedFrame(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

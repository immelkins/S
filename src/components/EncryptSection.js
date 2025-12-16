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
    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(patch);
    ctx.putImageData(imageData, 0, 0);

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
const lsbEncodeWithLog = (frames, message) => {
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
};

// Main component
export default function EncryptSection() {
  const [frames, setFrames] = useState([]);
  const [framePreviews, setFramePreviews] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [messageFile, setMessageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [allBits, setAllBits] = useState([]);


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

  const handleMessageFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setMessageFile(file);
    ToBinary(file).then(binfile => {
      setMessage(binfile);
    });
  };

  const handleEncrypt = async () => {
    if (!frames.length || !message) return;

    const { encodedFrames, logText } = lsbEncodeWithLog(frames, message);
    const gifURL = await ToGIF(encodedFrames);

    // Download GIF
    const a = document.createElement('a');
    a.href = gifURL;
    a.download = `encrypted_${fileName}`;
    a.click();

    // Download log file
    const blob = new Blob([logText], { type: "text/plain" });
    const logURL = URL.createObjectURL(blob);
    const b = document.createElement("a");
    b.href = logURL;
    b.download = "encoded_values.txt";
    b.click();
    URL.revokeObjectURL(logURL);
  };

  useEffect(() => {
    if (!file) return;
    ToBits(file)
      .then(({ frames: extractedFrames, allBits }) => {
        setFrames(extractedFrames);
        setAllBits(allBits);
      })
      .catch(err => setError(err.message));
  }, [file]);

  useEffect(() => {
    if (frames.length === 0) return;
    generateFramePreviews(frames, setFramePreviews);
  }, [frames]);

  return (
    <div>
      <input type="file" accept="image/gif" onChange={handleGIFChange} />
      {fileName && <p>Uploaded GIF: {fileName}</p>}

      <input type="file" onChange={handleMessageFileChange} />
      {messageFile && <p>Message file: {messageFile.name}</p>}

      {file && messageFile && (
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

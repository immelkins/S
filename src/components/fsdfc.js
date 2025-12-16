/*
import { useEffect, useState, useRef } from "react";
import { parseGIF, decompressFrames } from "gifuct-js";
import GIF from "gif.js";
import ToBinary from "./ToBinary";
import '../stylesheets/Frames.css';

async function extractedBits(file, setFrames, setError, setAllBits) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const gif = parseGIF(arrayBuffer);
    const decompressedFrames = decompressFrames(gif, true);

    //Ensures width and height exist
    const logicalWidth = gif.lsd.width;
    const logicalHeight = gif.lsd.height;

    const safeFrames = decompressedFrames.map(frame => ({
      ...frame,
      width: logicalWidth,
      height: logicalHeight,
    }));

    setFrames(safeFrames);

    // Generate bits for all frames
    const allBits = safeFrames.map((frame, index) => {
      let bits = '';
      for (let i = 0; i < frame.patch.length; i += 4) {
        bits += `${frame.patch[i]}${frame.patch[i + 1]}${frame.patch[i + 2]}${frame.patch[i + 3]}`;
        if ((i + 4) % (frame.width * 4) === 0) {
          bits += '\n';
        }
      }
      return bits;
    });

    setAllBits(allBits);

  } catch (err) {
    console.error(err);
    setError('Failed to parse GIF file.');
  }
}

async function generateFramePreviews(frames, setFramePreviews) {
  const previews = [];
  for (const frame of frames) {
    const { width, height, patch } = frame;

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      console.error('Invalid frame dimensions:', width, height);
      continue;
    }

    // Create a canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Copy RGBA pixels into canvas
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(patch);
    ctx.putImageData(imageData, 0, 0);

    // Canvas → PNG data URL
    const url = canvas.toDataURL("image/png");
    previews.push(url);
  }

  setFramePreviews(previews);
}

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

const lsbEncode = (frames, message) => {
  const encodedFrames = [...frames];
  let messageIndex = 0;

  for (let frameIndex = 0; frameIndex < encodedFrames.length; frameIndex++) {
    const frame = encodedFrames[frameIndex];
    const patch = frame.patch;

    for (let i = 0; i < patch.length; i += 4) {
      if (messageIndex >= message.length) break;

      // Get the blue color value
      const blue = patch[i + 2];

      // Replace the least significant bit with the next bit of the message
      const newBlue = (blue & ~1) | (message[messageIndex] === '1' ? 1 : 0);
      patch[i + 2] = newBlue;

      messageIndex++;
    }
    if (messageIndex >= message.length) break;
  }
  return encodedFrames;
}

export default function EncryptSection() {
  const [frames, setFrames] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [framePreviews, setFramePreviews] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [allBits, setAllBits] = useState([]);
  const [messageFile, setMessageFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleGIFChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'image/gif') {
      setError('Please upload a valid GIF file.');
      return;
    }

    setError(null);
    setFileName(file.name);
    setFile(file);
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setMessageFile(file);
    ToBinary(file).then(binfile => {
      console.log('the file is uploaded and in binary format:' + binfile);
      setMessage(binfile);
    });
  }

  useEffect(() => {
    if (file) {
      extractedBits(file, setFrames, setError, setAllBits);
    }
  }, [file]);

  useEffect(() => {
    if (frames.length === 0) return;
    generateFramePreviews(frames, setFramePreviews);
  }, [frames]);

  return (
    <div>
      <input type="file" accept="image/gif" onChange={handleGIFChange} />

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {fileName && <p>Uploaded GIF: {fileName}</p>}

      <input type="file" onChange={handleFileChange} />
      {messageFile && <p>Message file: {messageFile.name}</p>}

      {file && messageFile && (
        <button>Encrypt Message</button>
      )}

      {frames.length > 0 && (
        <div className="frame-container">
          <p>Frames extracted: {frames.length}</p>
          <div className="frames">
            {framePreviews.map((src, index) => (
              <div key={index} className="frame">
                <p>Frame {index}</p>
                <img src={src} className="canvas" onClick={() => handleFrameClick(frames[index], index, setSelectedFrame, allBits)} />
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
*/

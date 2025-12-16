// DecryptSection.js

import { useEffect, useState } from "react";
import ToBits from "./ToBits";
import '../stylesheets/Frames.css';

// LSB decode function: extracts hidden message from frames
const lsbDecode = (frames, messageLength) => {
  let messageBits = '';
  let count = 0;

  for (const frame of frames) {
    const patch = frame.patch;

    for (let i = 2; i < patch.length; i += 4) { // blue channel
      if (count >= messageLength) break;
      messageBits += (patch[i] & 1).toString();
      count++;
    }
    if (count >= messageLength) break;
  }

  return messageBits;
};

// Convert binary string to text
const binaryToText = (binaryStr) => {
  let text = '';
  for (let i = 0; i < binaryStr.length; i += 8) {
    const byte = binaryStr.slice(i, i + 8);
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
};

export default function DecryptSection({ messageLength }) {
  const [frames, setFrames] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [decryptedMessage, setDecryptedMessage] = useState('');

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

  useEffect(() => {
    if (!file) return;

    ToBits(file)
      .then(({ frames: extractedFrames }) => {
        setFrames(extractedFrames);

        // Decode LSB
        const binaryMessage = lsbDecode(extractedFrames, messageLength);
        const textMessage = binaryToText(binaryMessage);
        setDecryptedMessage(textMessage);
      })
      .catch(err => setError(err.message));
  }, [file, messageLength]);

  return (
    <div>
      <input type="file" accept="image/gif" onChange={handleGIFChange} />
      {fileName && <p>Uploaded GIF: {fileName}</p>}

      {decryptedMessage && (
        <div className="decrypted-message">
          <h2>Decrypted Message</h2>
          <pre>{decryptedMessage}</pre>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

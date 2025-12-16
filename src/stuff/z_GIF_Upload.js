// GifUpload.js
import { parseGIF, decompressFrames } from 'gifuct-js';
import { useState, useEffect } from 'react';

const GifUpload = () => {
  const [frames, setFrames] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [framePreviews, setFramePreviews] = useState([]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'image/gif') {
      setError('Please upload a valid GIF file.');
      return;
    }

    setError(null);
    setFileName(file.name);

    const arrayBuffer = await file.arrayBuffer();

    try {
      const gif = parseGIF(arrayBuffer);
      const decompressedFrames = decompressFrames(gif, true);
      setFrames(decompressedFrames);
      let json = '';
      decompressedFrames.forEach((frame, index) => {
        json += `Frame ${index}:\n`;
        for (let i = 0; i < frame.patch.length; i += 4) {
          json += `[${frame.patch[i]}, ${frame.patch[i + 1]}, ${frame.patch[i + 2]}, ${frame.patch[i + 3]}] `;
          if ((i + 4) % (frame.width * 4) === 0) {
            json += '\n';
          }
        }
        json += '\n\n';
      });
      const blob = new Blob([json], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'frames.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to parse GIF file.');
    }
  };

  useEffect(() => {
    if (frames.length === 0) return;

    const previews = [];
    frames.forEach((frame) => {
      const { width, height, patch } = frame;

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        console.error('Invalid frame dimensions:', width, height);
        return;
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
    });

    setFramePreviews(previews);
  }, [frames]);

  return (
    <div>
      <input type="file" accept="image/gif" onChange={handleFileChange} />

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {fileName && <p>Uploaded GIF: {fileName}</p>}

      {frames.length > 0 && (
        <div>
          <p>Frames extracted: {frames.length}</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "15px",
            }}
          >
            {framePreviews.map((src, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: "5px",
                  textAlign: "center",
                  background: "#fafafa",
                }}
              >
                <p style={{ marginBottom: "5px" }}>Frame {index}</p>
                <img
                  src={src}
                  alt={`Frame ${index}`}
                  style={{ width: "100%", borderRadius: "4px" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GifUpload;
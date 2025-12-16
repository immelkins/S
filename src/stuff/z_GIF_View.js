/*import { useEffect, useState, useRef } from "react";
import { parseGIF, decompressFrames } from "gifuct-js";
import '../stylesheets/Frames.css';

const GifFrameViewer = () => {
  const [file, setFile] = useState(null);
  const [frames, setFrames] = useState([]);
  const canvasRefs = useRef([]);
  const [selectedFrame, setSelectedFrame] = useState(null);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  useEffect(() => {
    if (!file) return;

    const readGif = async () => {
      const arrayBuffer = await file.arrayBuffer();

      const gif = parseGIF(arrayBuffer);

      const logicalWidth = gif.lsd.width;
      const logicalHeight = gif.lsd.height;

      const rawFrames = decompressFrames(gif, true);

      //Ensures width/height always defined
      const safeFrames = rawFrames.map((f) => ({
        ...f,
        width: logicalWidth,
        height: logicalHeight,
      }));

      setFrames(safeFrames);
    };

    readGif();
  }, [file]);

  useEffect(() => {
    if (frames.length === 0) return;

    frames.forEach((frame, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(
        frame.width,
        frame.height
      );

      imageData.data.set(frame.patch);
      ctx.putImageData(imageData, 0, 0);
    });
  }, [frames]);

  const handleFrameClick = (frame, i) => {
    let bits = '';
    const pixelsPerRow = 6; // adjust to change the number of pixels per row
    for (let j = 0; j < frame.patch.length; j += 4 * pixelsPerRow) {
      for (let k = 0; k < pixelsPerRow; k++) {
        if (j + k * 4 >= frame.patch.length) break;
        const r = String(frame.patch[j + k * 4]).padStart(3, ' ');
        const g = String(frame.patch[j + k * 4 + 1]).padStart(3, ' ');
        const b = String(frame.patch[j + k * 4 + 2]).padStart(3, ' ');
        const a = String(frame.patch[j + k * 4 + 3]).padStart(3, ' ');
        bits += '[${r}, ${g}, ${b}, ${a}]';
      }
      bits += '\n';
    }
    setSelectedFrame({ frame: i + 1, bits });
  };

  return (
    <div>
      <input type="file" accept="image/gif" onChange={handleFileChange} />

      {frames.length > 0 && (
        <div className="frame-container">
          <h3>Frames: {frames.length}</h3>

          <div className="frames">
            {frames.map((frame, i) => (
              <div key={i} className="frame">
                <p>Frame {i + 1}</p>
                <canvas
                  ref={(el) => (canvasRefs.current[i] = el)}
                  width={frame.width}
                  height={frame.height}
                  className="canvas"
                  onClick={() => handleFrameClick(frame, i)}
                />
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

export default GifFrameViewer;
*/
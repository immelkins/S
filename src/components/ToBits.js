// ToBits.js
// Extract frames and bits from GIF

import { parseGIF, decompressFrames } from "gifuct-js";

export default async function ToBits(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const gif = parseGIF(arrayBuffer);
    const decompressedFrames = decompressFrames(gif, true);

    const logicalWidth = gif.lsd.width;
    const logicalHeight = gif.lsd.height;

    const safeFrames = decompressedFrames.map(frame => ({
      ...frame,
      width: logicalWidth,
      height: logicalHeight,
    }));

    const allBits = safeFrames.map(frame => {
      let bits = '';
      for (let i = 0; i < frame.patch.length; i += 4) {
        bits += `${frame.patch[i]}${frame.patch[i + 1]}${frame.patch[i + 2]}${frame.patch[i + 3]}`;
        if ((i + 4) % (frame.width * 4) === 0) bits += '\n';
      }
      return bits;
    });

    return { frames: safeFrames, allBits };
  } catch (err) {
    console.error(err);
    throw new Error('Failed to parse GIF file.');
  }
}

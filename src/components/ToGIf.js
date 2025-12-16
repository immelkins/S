// ToGIf.js 
// Renders frames into a GIF and returns a URL to the generated GIF

import GIF from 'gif.js';

export default async function ToGIF(frames, delay = 100) {
  return new Promise((resolve) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,                    // lower is better quality
      workerScript: '/gif.worker.js', // local worker
    });

    //Add each frame to the GIF
    frames.forEach(frame => {
      const canvas = document.createElement('canvas');
      canvas.width = frame.width;
      canvas.height = frame.height;
      const context = canvas.getContext('2d');

      // Copy RGBA pixels into canvas
      const frameData = context.createImageData(frame.width, frame.height);
      frameData.data.set(frame.patch);
      context.putImageData(frameData, 0, 0);

      //Adding the canvas as a frame
      gif.addFrame(canvas, { delay });
    });

    // Return the generated GIF
    gif.on('finished', blob => {
      const url = URL.createObjectURL(blob);
      resolve(url);
    });

    gif.render();
  });
};
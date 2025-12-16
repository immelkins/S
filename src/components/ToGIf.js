import GIF from 'gif.js.optimized';

const exportGIF = (frames) => {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: frames[0].width,
    height: frames[0].height,
  });

  frames.forEach(frame => {
    const canvas = document.createElement("canvas");
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(frame.width, frame.height);
    imageData.data.set(frame.patch);
    ctx.putImageData(imageData, 0, 0);

    gif.addFrame(canvas, { delay: frame.delay || 100 });
  });

  gif.on('finished', (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encrypted.gif';
    a.click();
  });

  gif.render();
};

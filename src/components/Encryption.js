// Encryption.js
import { useEffect, useState } from "react";
import ToGIF from "./ToGIF";
import ToBits from "./ToBits";
import ToBinary from "./ToBinary";
import "../stylesheets/Frames.css";
import "../stylesheets/Popup.css";
import "../stylesheets/Upload.css";


const HEADER_BITS = [1, 0, 1, 0, 1, 0, 1, 1];
const PIXELS_PER_CHUNK = 500;

async function generateFramePreviews(frames, setFramePreviews) {
	const previews = [];
	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];
		const canvas = document.createElement("canvas");
		canvas.width = frame.width;
		canvas.height = frame.height;
		const ctx = canvas.getContext("2d");
		const imageData = ctx.createImageData(frame.width, frame.height);
		imageData.data.set(frame.patch);
		ctx.putImageData(imageData, 0, 0);
		previews.push(canvas.toDataURL("image/png"));
	}
	setFramePreviews(previews);
}

function spatialEncode(frames, bitstream) {
	const encodedFrames = [...frames];
	let bitIndex = 0;

	for (const frame of encodedFrames) {
		const patch = frame.patch;
		for (let i = 0; i < patch.length; i += 4) {
			if (bitIndex >= bitstream.length) break;
			patch[i + 2] = (patch[i + 2] & ~1) | bitstream[bitIndex];
			bitIndex++;
		}
		if (bitIndex >= bitstream.length) break;
	}
	return encodedFrames;
}

function getCapacity(frames) {
	return frames.reduce((sum, f) => sum + f.patch.length / 4, 0);
}

export default function Encryption() {
	const [gifFile, setGifFile] = useState(null);
	const [messageFile, setMessageFile] = useState(null);
	const [frames, setFrames] = useState([]);
	const [framePreviews, setFramePreviews] = useState([]);
	const [payload, setPayload] = useState(null);
	const [error, setError] = useState(null);
	const [popupData, setPopupData] = useState(null);

	const handleGIFChange = (e) => {
		const file = e.target.files[0];
		if (!file || (!file.type.includes("gif") && !file.name.endsWith(".gif"))) {
			setError("Please upload a valid GIF");
			return;
		}
		setError(null);
		setGifFile(file);
	};

	const handleMessageFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		setMessageFile(file);
	};

	useEffect(() => {
		if (!gifFile) return;

		setFrames([]);
		setFramePreviews([]);
		setPayload(null);
		setError(null);

		ToBits(gifFile)
			.then(({ frames }) => setFrames(frames))
			.catch((err) => setError(err.message));
	}, [gifFile]);

	useEffect(() => {
		if (frames.length) generateFramePreviews(frames, setFramePreviews);
	}, [frames]);

	// Rebuild when message file changes
	useEffect(() => {
		if (!messageFile) {
			setPayload(null);
			return;
		}

		(async () => {
			try {
				const payloadData = await ToBinary(messageFile);

				if (frames.length) {
					const capacity = getCapacity(frames);
					const fullBitstream = [
						...HEADER_BITS,
						...payloadData.metabits,
						...payloadData.bits,
					];
					if (fullBitstream.length > capacity) {
						setError("Message too large for this GIF");
						setPayload(null);
						return;
					}
				}

				setPayload(payloadData);
				setError(null);
			} catch (err) {
				setError(err.message);
				setPayload(null);
			}
		})();
	}, [messageFile, frames]);

	const handleEncrypt = async () => {
		if (!frames.length || !payload) return;

		const fullBitstream = [
			...HEADER_BITS,
			...payload.metabits,
			...payload.bits,
		];

		const bytes = [];
		for (let i = 0; i < fullBitstream.length; i += 8) {
			const byte = fullBitstream
				.slice(i, i + 8)
				.reverse()
				.reduce((acc, bit, index) => acc + bit * (1 << index), 0);
			bytes.push(byte);
		}

		const encodedFrames = spatialEncode(frames, fullBitstream);
		const gifURL = await ToGIF(encodedFrames);

		const a = document.createElement("a");
		a.href = gifURL;
		a.download = `encrypted_${gifFile.name}`;
		a.click();
	};

	const handleFrameClick = (frame, index) => {
		const pixels = frame.patch;
		const pixelArray = [];

		for (let i = 0; i < pixels.length; i += 4) {
			const r = pixels[i];
			const g = pixels[i + 1];
			const b = pixels[i + 2];
			const a = pixels[i + 3];
			const rgbaString = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
			pixelArray.push({
				rgba: rgbaString,
				values: [r, g, b, a],
			});
		}

		setPopupData({
			frameIndex: index,
			pixels: pixelArray,
			visibleCount: PIXELS_PER_CHUNK,
		});
	};

	const handleScroll = (e) => {
		const target = e.target;
		if (
			target.scrollTop + target.clientHeight >=
			target.scrollHeight - 20
		) {
			setPopupData((prev) =>
				prev
					? {
						...prev,
						visibleCount: Math.min(
							prev.visibleCount + PIXELS_PER_CHUNK,
							prev.pixels.length
						),
					}
					: prev
			);
		}
	};

	return (
		<div>
			<h2>GIF Message Encryption</h2>

			<div className="upload-section">
				{/* GIF Upload */}
				<label className="file-upload">
					<input type="file" accept="image/gif" onChange={handleGIFChange} hidden/>
					<span className="file-button">Choose GIF</span>
					<span className="file-name">
						{gifFile ? gifFile.name : "No file chosen"}
					</span>
				</label>

				{/* Message Upload */}
				<label className="file-upload">
					<input type="file" onChange={handleMessageFileChange} hidden/>
					<span className="file-button">Choose Message File</span>
					<span className="file-name">
						{messageFile ? messageFile.name : "No file chosen"}
					</span>
				</label>
			</div>

			{frames.length > 0 && <p>{frames.length} frames extracted from GIF</p>}

			{payload && frames.length > 0 && (
				<button className="file-button" onClick={handleEncrypt}>Encrypt Message</button>
			)}

			{payload && frames.length > 0 && (
				<p>
					Message uses {payload.bits.length + payload.metabits.length} bits of{" "}
					{getCapacity(frames)} available
				</p>
			)}

			{error && <p className="error">{error}</p>}

			{framePreviews.length > 0 && (
				<div className="frames">
					{framePreviews.map((src, i) => (
						<img key={i} src={src} className="canvas"
							style={{ cursor: "pointer", marginBottom: "10px" }}
							onClick={() => handleFrameClick(frames[i], i)}
							alt={`Frame ${i}`}
						/>
					))}
				</div>
			)}

			{popupData && (
				<div className="popup-overlay" onClick={() => setPopupData(null)}>
					<div className="popup-content" onClick={(e) => e.stopPropagation()} onScroll={handleScroll}>
						<h3>Frame {popupData.frameIndex} RGBA Values</h3>
						<div className="pixel-grid">
							{popupData.pixels
								.slice(0, popupData.visibleCount)
								.map((p, i) => (
									<div key={i} className="pixel-item">
										<div className="pixel-color" style={{ background: p.rgba }} />
										<span>Pixel {i}: [{p.values.join(", ")}]</span>
									</div>
								))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

//Decryption.js
import { useState } from "react";
import ToBits from "./ToBits";
import Hamming from "hamming-code";
import "../stylesheets/Upload.css";

const HEADER_BITS = [1, 0, 1, 0, 1, 0, 1, 1];

function bitArrayToUint8Array(bits) {
	const bytes = [];
	for (let i = 0; i < bits.length; i += 8) {
		let byte = 0;
		for (let j = 0; j < 8; j++) { byte = (byte << 1) | (bits[i + j] || 0); }
		bytes.push(byte);
	}
	return new Uint8Array(bytes);
}

function bitArrayToString(bits) {
	return new TextDecoder("utf-8").decode(bitArrayToUint8Array(bits));
}

// Extract all bits from GIF frames LSB of blue channel
function extractAllBitsFromFrames(frames) {
	const allBits = [];
	for (const frame of frames) {
		const patch = frame.patch;
		for (let i = 0; i < patch.length; i += 4) { allBits.push(patch[i + 2] & 1); }
	}

	// Check header
	for (let i = 0; i < HEADER_BITS.length; i++) {
		if (allBits[i] !== HEADER_BITS[i]) {
			throw new Error("Header not found. Possibly not encrypted or corrupt.");
		}
	}
	return allBits;
}

export default function Decryption() {
	const [gifFile, setGifFile] = useState(null);
	const [frames, setFrames] = useState([]);
	const [error, setError] = useState(null);

	const handleGIFChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		setGifFile(file);

		ToBits(file)
			.then(({ frames }) => setFrames(frames))
			.catch((err) => setError(err.message));
	};

	const handleDownloadMessage = () => {
		if (!frames.length) return;

		try {
			const allBits = extractAllBitsFromFrames(frames);

			// Extract metadata length
			const metadataLengthBits = allBits.slice(HEADER_BITS.length, HEADER_BITS.length + 32);
			const metadataLength = parseInt(metadataLengthBits.join(""), 2);
			const metadataEndIndex = HEADER_BITS.length + 32 + metadataLength;

			// Extract message length
			const messageLengthBits = allBits.slice(metadataEndIndex, metadataEndIndex + 32);
			const messageLength = parseInt(messageLengthBits.join(""), 2);
			const messageStartIndex = metadataEndIndex + 32;
			const messageEndIndex = messageStartIndex + messageLength;

			// Extract message bits
			const messageBits = allBits.slice(messageStartIndex, messageEndIndex);

			// Hamming ECC decode
			const messageBitString = messageBits.join("");               // Convert array to string
			const correctedBitString = Hamming.decode(messageBitString); // Decode ECC
			const correctedBits = correctedBitString.split("").map(b => parseInt(b, 10));

			// Convert corrected bits to text
			const messageText = bitArrayToString(correctedBits);

			// Download message text
			const blobText = new Blob([messageText], { type: "text/plain" });
			const aText = document.createElement("a");
			aText.href = URL.createObjectURL(blobText);
			aText.download = "gif_message.txt";
			aText.click();

			console.log("Message downloaded successfully.");
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div>
			<h2>Decrypt GIF Binary Data</h2>
			<div className="upload-section">
				<label className="file-upload">
					<input
						type="file"
						accept="image/gif"
						onChange={handleGIFChange}
						hidden
					/>
					<span className="file-button">Choose GIF</span>
					<span className="file-name">
						{gifFile ? gifFile.name : "No file chosen"}
					</span>
				</label>
			</div>
			{gifFile && <p>Uploaded GIF: {gifFile.name}</p>}
			{frames.length > 0 && (<button className="file-button" onClick={handleDownloadMessage}> Download Message </button>)}
			{error && <p className="error">{error}</p>}
		</div>
	);
}

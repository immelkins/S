// ToBinary.js
import Hamming from "hamming-code"; // make sure to npm install hamming-code

function uint8ArrayToBitArray(bytes) {
  const bits = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) 
      { bits.push((byte >> i) & 1); }
  }
  return bits;
}

function stringToBitArray(str) {
  const bits = [];
  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i);
    for (let j = 7; j >= 0; j--) 
      { bits.push((byte >> j) & 1); }
  }
  return bits;
}

function numberTo32BitArray(num) {
  const bits = [];
  for (let i = 31; i >= 0; i--) 
    { bits.push((num >> i) & 1); }
  return bits;
}

export default async function ToBinary(file) {
  if (!file) throw new Error("No file provided");
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Convert raw bytes to bits and encode messageBits with Hamming ECC
  let messageBits = uint8ArrayToBitArray(bytes);
  const messageBitString = messageBits.join("");                      // Convert array to string
  const encodedBitString = Hamming.encode(messageBitString);          // Hamming encode
  messageBits = encodedBitString.split("").map(b => parseInt(b, 10)); // Back to array

  // Add 32-bit length for message
  const lengthMessageBits = numberTo32BitArray(messageBits.length);
  const messageLoadBits = [...lengthMessageBits, ...messageBits];

  // Create metadata object
  const metadata = {
    originalLength: bytes.length,
    fileName: file.name,
    fileType: file.type,
    messageBitsLength: messageBits.length, 
  };

  // Convert metadata to bits
  const metadataStr = JSON.stringify(metadata);
  const metadataBits = stringToBitArray(metadataStr);

  // Add 32-bit metadata length prefix
  const lengthMetaBits = numberTo32BitArray(metadataBits.length);
  const fullMetadataBits = [...lengthMetaBits, ...metadataBits];

  return { bits: messageLoadBits, metabits: fullMetadataBits };
}

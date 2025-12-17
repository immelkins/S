// ToBinary.js
import { encryptData } from "./ToBlackBox";

export default async function ToBinary(file, password) {
  if (!file) throw new Error("No file provided");
  if (!password || password.trim() === "") throw new Error("Password is required for encryption");

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Convert file content to binary
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += bytes[i].toString(2).padStart(8, '0');
  }

  const { encryptedData, iv, salt } = await encryptData(binary, password);
  const encryptedBinary = Array.from(encryptedData)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join('');

  // Metadata object
  const metadata = {
    iv,
    salt,
    originalLength: binary.length,
    fileName: file.name,
    fileType: file.type,
  };

  // Convert metadata to binary
  const metadataStr = JSON.stringify(metadata);
  let metadataBinary = '';
  for (let i = 0; i < metadataStr.length; i++) {
    metadataBinary += metadataStr.charCodeAt(i).toString(2).padStart(8, '0');
  }

  // Add 32-bit length header at the start
  const metadataLength = metadataBinary.length; // in bits
  const lengthBinary = metadataLength.toString(2).padStart(32, '0');
  metadataBinary = lengthBinary + metadataBinary;

  return {
    bits: encryptedBinary,
    metabits: metadataBinary,
  };
}

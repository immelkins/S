// ToBlackBox.js

export async function encryptData(data, password) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    enc.encode(data)
  );

  return {
    encryptedData: new Uint8Array(encrypted),
    iv,
    salt,
  };
}

export async function decryptData(encryptedData, password, iv, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encryptedData
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
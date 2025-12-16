//toBinary
//This function converts an uploaded file into a binary string representation

export default function ToBinary(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  return file.arrayBuffer().then(arrayBuffer => {
    const bytes = new Uint8Array(arrayBuffer);

    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += bytes[i].toString(2).padStart(8, '0');
    }

    return binary;
  });
}
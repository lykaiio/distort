import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

console.log("SECRET_KEY loaded:", SECRET_KEY ? "✓ Yes" : "✗ No");
console.log("SECRET_KEY length:", SECRET_KEY?.length || 0);

export const encrypt = (text) => {
  if (!SECRET_KEY) {
    console.error("SECRET_KEY is not defined!");
    return "";
  }

  console.log("Encrypting text:", text);
  const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  console.log("Encrypted result:", encrypted);
  return encrypted;
};

export const decrypt = (encrypted) => {
  if (!SECRET_KEY) {
    console.error("SECRET_KEY is not defined for decryption!");
    return "";
  }

  if (!encrypted) {
    console.error("No encrypted text provided");
    return "";
  }

  console.log("Attempting to decrypt:", encrypted);
  console.log("Using SECRET_KEY length:", SECRET_KEY.length);

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    console.log("Decryption successful:", decrypted ? "✓" : "✗ Empty result");
    console.log("Decrypted text:", decrypted);

    return decrypted;
  } catch (e) {
    console.error("Decryption failed:", e);
    console.error("Error details:", e.message);
    return "";
  }
};

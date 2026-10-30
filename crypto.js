export async function decryptPage(payload, passphrase) {
  if (payload.version !== 1 || payload.iterations !== 600000) throw new Error("Unsupported encrypted page");
  const bytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: bytes(payload.salt), iterations: payload.iterations, hash: "SHA-256" },
    material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(payload.iv), tagLength: 128 }, key, bytes(payload.ciphertext));
}

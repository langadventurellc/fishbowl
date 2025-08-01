/**
 * Generate cryptographically secure random bytes.
 * Uses Node.js crypto in Node environments, Web Crypto API in browsers/React Native.
 * @param size - Number of bytes to generate
 * @returns Buffer containing random bytes (Node.js) or Uint8Array (browser/React Native)
 */
export async function randomBytes(size: number): Promise<Uint8Array> {
  // Node.js environment
  if (typeof globalThis !== "undefined" && globalThis.process?.versions?.node) {
    const { randomBytes: nodeRandomBytes } = await import("crypto");
    return new Uint8Array(nodeRandomBytes(size));
  }

  // Browser/React Native environment with Web Crypto API
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(size);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }

  // Fallback to Math.random (not cryptographically secure)
  console.warn("Using Math.random fallback - not cryptographically secure");
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

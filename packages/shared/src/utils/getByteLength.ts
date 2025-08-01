/**
 * Cross-platform utility to get byte length of a string.
 * Uses Buffer.byteLength in Node.js, TextEncoder in browsers/React Native.
 * @param str - String to measure
 * @returns Number of bytes (UTF-8 encoding)
 */
export async function getByteLength(str: string): Promise<number> {
  // Node.js environment
  if (typeof globalThis !== "undefined" && globalThis.process?.versions?.node) {
    // Dynamic import to avoid bundling issues
    const { Buffer } = await import("buffer");
    return Buffer.byteLength(str, "utf8");
  }

  // Browser/React Native environment
  if (typeof globalThis !== "undefined" && globalThis.TextEncoder) {
    const encoder = new globalThis.TextEncoder();
    return encoder.encode(str).length;
  }

  // Fallback for older environments (less accurate for non-ASCII)
  console.warn(
    "Using fallback byte length calculation - may be inaccurate for non-ASCII characters",
  );
  return str.length;
}

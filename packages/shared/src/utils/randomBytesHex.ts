import { randomBytes } from "./randomBytes";

/**
 * Generate random bytes and convert to hex string.
 * @param size - Number of bytes to generate
 * @returns Promise resolving to hex string
 */
export async function randomBytesHex(size: number): Promise<string> {
  const bytes = await randomBytes(size);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

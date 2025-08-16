import type { CryptoUtilsInterface } from "./CryptoUtilsInterface";

/**
 * Generate random bytes and convert to hex string.
 * @param cryptoUtils - Crypto utilities interface for platform-specific implementations
 * @param size - Number of bytes to generate
 * @returns Promise resolving to hex string
 */
export async function randomBytesHex(
  cryptoUtils: CryptoUtilsInterface,
  size: number,
): Promise<string> {
  const bytes = await cryptoUtils.randomBytes(size);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

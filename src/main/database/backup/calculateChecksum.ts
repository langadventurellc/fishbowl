/**
 * Calculate file checksum for backup integrity verification
 */
import { createHash } from 'crypto';
import { promises as fs } from 'fs';

export async function calculateChecksum(filePath: string): Promise<string> {
  const hash = createHash('sha256');
  const data = await fs.readFile(filePath);
  hash.update(data);
  return hash.digest('hex');
}

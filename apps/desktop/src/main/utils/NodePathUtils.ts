import * as path from "path";
import { PathUtilsInterface } from "@fishbowl-ai/shared";

/**
 * Node.js implementation of path utilities.
 * Uses the standard Node.js 'path' module for server-side path operations.
 */
export class NodePathUtils implements PathUtilsInterface {
  join(...paths: string[]): string {
    return path.join(...paths);
  }

  resolve(...paths: string[]): string {
    return path.resolve(...paths);
  }

  dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  basename(filePath: string): string {
    return path.basename(filePath);
  }

  extname(filePath: string): string {
    return path.extname(filePath);
  }

  normalize(filePath: string): string {
    return path.normalize(filePath);
  }

  relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }
}

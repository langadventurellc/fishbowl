import { setTimeout } from "node:timers/promises";
import { createLoggerSync } from "../../../logging/createLoggerSync";
import type { StructuredLogger } from "../../../logging/types/StructuredLogger";
import type { RetryOptions } from "./RetryOptions";
import type { RetryContext } from "./RetryContext";

export class RetryHandler {
  private readonly logger: StructuredLogger;
  private readonly options: Required<RetryOptions>;

  constructor(options: RetryOptions = {}) {
    this.options = {
      maxAttempts: options.maxAttempts ?? 3,
      baseDelayMs: options.baseDelayMs ?? 1000,
      maxDelayMs: options.maxDelayMs ?? 10000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      jitterMs: options.jitterMs ?? 100,
      retryableErrors: options.retryableErrors ?? [
        "ENOENT",
        "EBUSY",
        "EMFILE",
        "ETIMEDOUT",
        "ENOTFOUND",
      ],
    };

    this.logger = createLoggerSync({
      context: { metadata: { component: "RetryHandler" } },
    });
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: RetryContext,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        this.logger.debug(
          `Executing operation attempt ${attempt}/${this.options.maxAttempts}`,
          {
            operation: context.operation,
            filePath: context.filePath,
          },
        );

        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (!this.shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        const delay = this.calculateBackoff(attempt);
        this.logger.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt,
          operation: context.operation,
          error: lastError.message,
        });

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private async delay(ms: number): Promise<void> {
    return setTimeout(ms);
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay =
      this.options.baseDelayMs *
      Math.pow(this.options.backoffMultiplier, attempt - 1);
    const jitter =
      Math.random() * this.options.jitterMs - this.options.jitterMs / 2;
    return Math.min(baseDelay + jitter, this.options.maxDelayMs);
  }

  private shouldRetry(error: Error, attempt: number): boolean {
    if (attempt >= this.options.maxAttempts) {
      return false;
    }

    const errorCode = (error as { code?: string }).code;
    return errorCode ? this.options.retryableErrors.includes(errorCode) : false;
  }
}

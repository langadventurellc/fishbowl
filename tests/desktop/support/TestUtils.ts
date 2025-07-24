/**
 * Utility functions for test data manipulation
 */

export const TestUtils = {
  /**
   * Generate a random string for testing
   */
  randomString(length: number = 10): string {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  },

  /**
   * Generate a random email for testing
   */
  randomEmail(): string {
    return `test${this.randomString(5)}@example.com`;
  },

  /**
   * Create a timestamp for testing
   */
  createTimestamp(daysAgo: number = 0): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  },

  /**
   * Wait for a specified amount of time (for testing timing scenarios)
   */
  async wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  },

  /**
   * Create a mock API response
   */
  createApiResponse<T>(
    data: T,
    status: number = 200,
  ): {
    status: number;
    data: T;
    timestamp: Date;
  } {
    return {
      status,
      data,
      timestamp: new Date(),
    };
  },
};

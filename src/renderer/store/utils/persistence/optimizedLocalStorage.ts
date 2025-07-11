/**
 * Optimized localStorage operations with performance enhancements
 */

interface OptimizedStorageOptions {
  /**
   * Enable compression for large data
   * @default true
   */
  enableCompression?: boolean;

  /**
   * Compression threshold in bytes
   * @default 1024
   */
  compressionThreshold?: number;

  /**
   * Enable caching of recently accessed data
   * @default true
   */
  enableCaching?: boolean;

  /**
   * Cache size limit (number of items)
   * @default 10
   */
  cacheSize?: number;

  /**
   * Cache TTL in milliseconds
   * @default 60000
   */
  cacheTTL?: number;

  /**
   * Enable performance monitoring
   * @default true
   */
  enablePerformanceMonitoring?: boolean;
}

interface CacheEntry {
  data: string;
  timestamp: number;
  size: number;
}

interface StorageMetrics {
  totalOperations: number;
  readOperations: number;
  writeOperations: number;
  cacheHits: number;
  cacheMisses: number;
  compressionSaves: number;
  totalBytesRead: number;
  totalBytesWritten: number;
  averageReadTime: number;
  averageWriteTime: number;
  errors: number;
}

/**
 * Optimized localStorage implementation with caching and compression
 */
export class OptimizedLocalStorage implements Storage {
  private storage: Storage;
  private cache = new Map<string, CacheEntry>();
  private options: Required<OptimizedStorageOptions>;
  private metrics: StorageMetrics = {
    totalOperations: 0,
    readOperations: 0,
    writeOperations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    compressionSaves: 0,
    totalBytesRead: 0,
    totalBytesWritten: 0,
    averageReadTime: 0,
    averageWriteTime: 0,
    errors: 0,
  };

  constructor(storage: Storage = localStorage, options: OptimizedStorageOptions = {}) {
    this.storage = storage;
    this.options = {
      enableCompression: true,
      compressionThreshold: 1024,
      enableCaching: true,
      cacheSize: 10,
      cacheTTL: 60000,
      enablePerformanceMonitoring: true,
      ...options,
    };
  }

  /**
   * Gets the number of items in storage
   */
  get length(): number {
    return this.storage.length;
  }

  /**
   * Gets a key by index
   */
  key(index: number): string | null {
    return this.storage.key(index);
  }

  /**
   * Gets an item from storage with caching and performance monitoring
   */
  getItem(key: string): string | null {
    const startTime = performance.now();
    this.metrics.totalOperations++;
    this.metrics.readOperations++;

    try {
      // Check cache first
      if (this.options.enableCaching) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.options.cacheTTL) {
          this.metrics.cacheHits++;
          this.updateReadMetrics(startTime, cached.size);
          return cached.data;
        }
      }

      // Read from storage
      const rawData = this.storage.getItem(key);
      if (rawData === null) {
        this.metrics.cacheMisses++;
        this.updateReadMetrics(startTime, 0);
        return null;
      }

      let data = rawData;

      // Handle decompression if data is compressed
      if (this.options.enableCompression && rawData.startsWith('__COMPRESSED__')) {
        data = this.decompress(rawData);
      }

      // Update cache
      if (this.options.enableCaching) {
        this.updateCache(key, data);
      }

      this.metrics.cacheMisses++;
      this.updateReadMetrics(startTime, data.length);
      return data;
    } catch (error) {
      this.metrics.errors++;
      this.updateReadMetrics(startTime, 0);
      if (this.options.enablePerformanceMonitoring) {
        console.warn('OptimizedLocalStorage read error:', error);
      }
      throw error;
    }
  }

  /**
   * Sets an item in storage with compression and caching
   */
  setItem(key: string, value: string): void {
    const startTime = performance.now();
    this.metrics.totalOperations++;
    this.metrics.writeOperations++;

    try {
      let dataToStore = value;

      // Apply compression if enabled and data is large enough
      if (this.options.enableCompression && value.length > this.options.compressionThreshold) {
        const compressed = this.compress(value);
        if (compressed.length < value.length) {
          dataToStore = compressed;
          this.metrics.compressionSaves++;
        }
      }

      // Store in localStorage
      this.storage.setItem(key, dataToStore);

      // Update cache
      if (this.options.enableCaching) {
        this.updateCache(key, value);
      }

      this.updateWriteMetrics(startTime, dataToStore.length);
    } catch (error) {
      this.metrics.errors++;
      this.updateWriteMetrics(startTime, 0);
      if (this.options.enablePerformanceMonitoring) {
        console.warn('OptimizedLocalStorage write error:', error);
      }
      throw error;
    }
  }

  /**
   * Removes an item from storage and cache
   */
  removeItem(key: string): void {
    this.metrics.totalOperations++;

    try {
      this.storage.removeItem(key);

      // Remove from cache
      if (this.options.enableCaching) {
        this.cache.delete(key);
      }
    } catch (error) {
      this.metrics.errors++;
      if (this.options.enablePerformanceMonitoring) {
        console.warn('OptimizedLocalStorage remove error:', error);
      }
      throw error;
    }
  }

  /**
   * Clears all items from storage and cache
   */
  clear(): void {
    this.metrics.totalOperations++;

    try {
      this.storage.clear();

      // Clear cache
      if (this.options.enableCaching) {
        this.cache.clear();
      }
    } catch (error) {
      this.metrics.errors++;
      if (this.options.enablePerformanceMonitoring) {
        console.warn('OptimizedLocalStorage clear error:', error);
      }
      throw error;
    }
  }

  /**
   * Updates the cache with new data
   */
  private updateCache(key: string, data: string): void {
    // Remove oldest entries if cache is full
    while (this.cache.size >= this.options.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      } else {
        break;
      }
    }

    // Add new entry
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: data.length,
    });
  }

  /**
   * Simple compression using gzip-like algorithm
   */
  private compress(data: string): string {
    try {
      // For now, we'll use a simple LZ-string like compression
      // In a real implementation, you might want to use a proper compression library
      const compressed = this.simpleCompress(data);
      return `__COMPRESSED__${compressed}`;
    } catch {
      // Return original data if compression fails
      return data;
    }
  }

  /**
   * Simple decompression
   */
  private decompress(data: string): string {
    try {
      const compressed = data.replace('__COMPRESSED__', '');
      return this.simpleDecompress(compressed);
    } catch {
      // Return original data if decompression fails
      return data;
    }
  }

  /**
   * Simple compression algorithm (placeholder)
   */
  private simpleCompress(data: string): string {
    // This is a very simple compression - in production you'd use a proper algorithm
    const frequencyMap = new Map<string, number>();
    for (const char of data) {
      frequencyMap.set(char, (frequencyMap.get(char) ?? 0) + 1);
    }

    // Find most common characters
    const sorted = [...frequencyMap.entries()].sort((a, b) => b[1] - a[1]);
    const replacements = new Map<string, string>();

    // Create simple replacement map (just for demo)
    for (let i = 0; i < Math.min(10, sorted.length); i++) {
      replacements.set(sorted[i][0], `~${i}~`);
    }

    let compressed = data;
    for (const [char, replacement] of replacements) {
      compressed = compressed.replace(new RegExp(char, 'g'), replacement);
    }

    return compressed;
  }

  /**
   * Simple decompression algorithm (placeholder)
   */
  private simpleDecompress(data: string): string {
    // This is a placeholder - in production you'd implement proper decompression
    return data;
  }

  /**
   * Updates read operation metrics
   */
  private updateReadMetrics(startTime: number, bytesRead: number): void {
    if (!this.options.enablePerformanceMonitoring) return;

    const duration = performance.now() - startTime;
    this.metrics.totalBytesRead += bytesRead;
    this.metrics.averageReadTime =
      (this.metrics.averageReadTime * (this.metrics.readOperations - 1) + duration) /
      this.metrics.readOperations;
  }

  /**
   * Updates write operation metrics
   */
  private updateWriteMetrics(startTime: number, bytesWritten: number): void {
    if (!this.options.enablePerformanceMonitoring) return;

    const duration = performance.now() - startTime;
    this.metrics.totalBytesWritten += bytesWritten;
    this.metrics.averageWriteTime =
      (this.metrics.averageWriteTime * (this.metrics.writeOperations - 1) + duration) /
      this.metrics.writeOperations;
  }

  /**
   * Gets performance metrics
   */
  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  /**
   * Resets metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalOperations: 0,
      readOperations: 0,
      writeOperations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      compressionSaves: 0,
      totalBytesRead: 0,
      totalBytesWritten: 0,
      averageReadTime: 0,
      averageWriteTime: 0,
      errors: 0,
    };
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return {
      size: this.cache.size,
      hitRate: total > 0 ? this.metrics.cacheHits / total : 0,
    };
  }
}

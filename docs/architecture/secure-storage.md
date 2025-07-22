# Fishbowl AI - Electron Secure Storage Architecture

See the [monorepo architecture guide](./monorepo.md) for an overview of the project structure and technology stack.

## Secure Storage

Sample implementation of secure storage for API keys and other sensitive data.

### Interface

**packages/shared/src/services/secure-storage/interface.ts**

```typescript
export interface SecureStorage {
  // API Key management
  saveAPIKey(provider: string, key: string): Promise<void>;
  getAPIKey(provider: string): Promise<string | null>;
  getAPIKeys(): Promise<Array<{ provider: string; key: string }>>;
  removeAPIKey(provider: string): Promise<void>;

  // General secure storage
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### Platform Implementations

**apps/desktop/src/services/secure-storage.ts**

```typescript
import { ipcRenderer } from "electron";
import { SecureStorage } from "@fishbowl-ai/shared";

export class ElectronSecureStorage implements SecureStorage {
  private async encrypt(data: string): Promise<string> {
    return ipcRenderer.invoke("encrypt_string", { data });
  }

  private async decrypt(data: string): Promise<string> {
    return ipcRenderer.invoke("decrypt_string", { data });
  }

  async saveAPIKey(provider: string, key: string): Promise<void> {
    const encrypted = await this.encrypt(key);
    await this.setItem(`api_key_${provider}`, encrypted);
  }

  async getAPIKey(provider: string): Promise<string | null> {
    const encrypted = await this.getItem(`api_key_${provider}`);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  async getAPIKeys(): Promise<Array<{ provider: string; key: string }>> {
    // Implementation would query all stored keys
    const providers = ["openai", "anthropic", "google"];
    const keys = [];

    for (const provider of providers) {
      const key = await this.getAPIKey(provider);
      if (key) {
        keys.push({ provider, key });
      }
    }

    return keys;
  }

  async removeAPIKey(provider: string): Promise<void> {
    await this.removeItem(`api_key_${provider}`);
  }

  async setItem(key: string, value: string): Promise<void> {
    await ipcRenderer.invoke("store_secure", { key, value });
  }

  async getItem(key: string): Promise<string | null> {
    return ipcRenderer.invoke("retrieve_secure", { key });
  }

  async removeItem(key: string): Promise<void> {
    await ipcRenderer.invoke("delete_secure", { key });
  }

  async clear(): Promise<void> {
    await ipcRenderer.invoke("clear_secure_storage");
  }
}
```

**apps/mobile/src/services/secure-storage.ts**

unknown

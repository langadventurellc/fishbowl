/**
 * Interface for secure storage operations
 */
export interface SecureStorageInterface {
  get(service: string, account: string): Promise<string | null>;
  set(service: string, account: string, password: string): Promise<void>;
  delete(service: string, account: string): Promise<void>;
  findCredentials(service: string): Promise<Array<{ account: string; password: string }>>;
  findPassword(service: string): Promise<string | null>;
}

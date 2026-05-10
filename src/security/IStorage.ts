export interface IStorage {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    add(key: string): Promise<void>;
    delete(key: string): Promise<void>;
}

/**
 * Implementación por defecto en memoria (para desarrollo local)
 */
export class InMemoryStorage implements IStorage {
    private data: Map<string, string> = new Map();
    private sets: Set<string> = new Set();

    async get(key: string): Promise<string | null> {
        return this.data.get(key) || null;
    }

    async set(key: string, value: string): Promise<void> {
        this.data.set(key, value);
    }

    async has(key: string): Promise<boolean> {
        return this.sets.has(key);
    }

    async add(key: string): Promise<void> {
        this.sets.add(key);
    }

    async delete(key: string): Promise<void> {
        this.sets.delete(key);
        this.data.delete(key);
    }
}

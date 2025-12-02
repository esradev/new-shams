import AsyncStorage from "@react-native-async-storage/async-storage"

// Fallback storage implementation using AsyncStorage
class AsyncStorageWrapper {
  private prefix: string

  constructor(id: string) {
    this.prefix = `${id}_`
  }

  getString(key: string): string | undefined {
    // AsyncStorage is async, but we'll use a sync fallback for now
    // In practice, this should be handled differently for real apps
    console.warn(
      "Using AsyncStorage fallback - consider enabling new architecture for MMKV"
    )
    return undefined
  }

  getNumber(key: string): number | undefined {
    const value = this.getString(key)
    return value ? Number(value) : undefined
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.getString(key)
    return value ? value === "true" : undefined
  }

  set(key: string, value: string | number | boolean): void {
    AsyncStorage.setItem(this.prefix + key, String(value)).catch(console.error)
  }

  remove(key: string): boolean {
    AsyncStorage.removeItem(this.prefix + key).catch(console.error)
    return true
  }

  contains(key: string): boolean {
    // This is a limitation of the fallback - we can't synchronously check
    return false
  }

  clearAll(): void {
    AsyncStorage.getAllKeys()
      .then(keys => {
        const prefixedKeys = keys.filter(key => key.startsWith(this.prefix))
        AsyncStorage.multiRemove(prefixedKeys).catch(console.error)
      })
      .catch(console.error)
  }

  getAllKeys(): string[] {
    // Another limitation - we can't synchronously get keys
    return []
  }
}

// Try to use MMKV, fallback to AsyncStorage
let storage: any
let cacheStorage: any
let offlineStorage: any

try {
  const { createMMKV } = require("react-native-mmkv")

  storage = createMMKV({
    id: "user-storage",
    encryptionKey: "shams-almaarif-key"
  })

  cacheStorage = createMMKV({
    id: "cache-storage",
    encryptionKey: "shams-cache-key"
  })

  offlineStorage = createMMKV({
    id: "offline-storage",
    encryptionKey: "shams-offline-key"
  })

  console.log("MMKV initialized successfully")
} catch (error) {
  console.warn("MMKV not available, falling back to AsyncStorage:", error)

  storage = new AsyncStorageWrapper("user-storage")
  cacheStorage = new AsyncStorageWrapper("cache-storage")
  offlineStorage = new AsyncStorageWrapper("offline-storage")
}

export { storage, cacheStorage, offlineStorage }

// Storage interface for consistency
export interface StorageInterface {
  getString: (key: string) => string | undefined
  getNumber: (key: string) => number | undefined
  getBoolean: (key: string) => boolean | undefined
  set: (key: string, value: string | number | boolean) => void
  remove: (key: string) => boolean
  contains: (key: string) => boolean
  clearAll: () => void
  getAllKeys: () => string[]
}

// Create storage interfaces
export const userStorage: StorageInterface = {
  getString: (key: string) => storage.getString(key),
  getNumber: (key: string) => storage.getNumber(key),
  getBoolean: (key: string) => storage.getBoolean(key),
  set: (key: string, value: string | number | boolean) =>
    storage.set(key, value),
  remove: (key: string) => storage.remove(key),
  contains: (key: string) => storage.contains(key),
  clearAll: () => storage.clearAll(),
  getAllKeys: () => storage.getAllKeys()
}

export const cacheStorageInterface: StorageInterface = {
  getString: (key: string) => cacheStorage.getString(key),
  getNumber: (key: string) => cacheStorage.getNumber(key),
  getBoolean: (key: string) => cacheStorage.getBoolean(key),
  set: (key: string, value: string | number | boolean) =>
    cacheStorage.set(key, value),
  remove: (key: string) => cacheStorage.remove(key),
  contains: (key: string) => cacheStorage.contains(key),
  clearAll: () => cacheStorage.clearAll(),
  getAllKeys: () => cacheStorage.getAllKeys()
}

export const offlineStorageInterface: StorageInterface = {
  getString: (key: string) => offlineStorage.getString(key),
  getNumber: (key: string) => offlineStorage.getNumber(key),
  getBoolean: (key: string) => offlineStorage.getBoolean(key),
  set: (key: string, value: string | number | boolean) =>
    offlineStorage.set(key, value),
  remove: (key: string) => offlineStorage.remove(key),
  contains: (key: string) => offlineStorage.contains(key),
  clearAll: () => offlineStorage.clearAll(),
  getAllKeys: () => offlineStorage.getAllKeys()
}

// Cache management utilities
export interface CachedItem<T = any> {
  data: T
  timestamp: number
  ttl?: number // Time to live in milliseconds
}

export class MMKVCache {
  private storage: StorageInterface

  constructor(storage: StorageInterface) {
    this.storage = storage
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CachedItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }
    this.storage.set(key, JSON.stringify(item))
  }

  get<T>(key: string): T | null {
    const itemString = this.storage.getString(key)
    if (!itemString) return null

    try {
      const item: CachedItem<T> = JSON.parse(itemString)

      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.storage.remove(key)
        return null
      }

      return item.data
    } catch {
      // Clean up corrupted data
      this.storage.remove(key)
      return null
    }
  }

  delete(key: string): void {
    this.storage.remove(key)
  }

  exists(key: string): boolean {
    return this.storage.contains(key)
  }

  clear(): void {
    this.storage.clearAll()
  }

  // Get all cached items with their metadata
  getAllCachedItems(): Array<{ key: string; item: CachedItem }> {
    const keys = this.storage.getAllKeys()
    const items: Array<{ key: string; item: CachedItem }> = []

    for (const key of keys) {
      const itemString = this.storage.getString(key)
      if (itemString) {
        try {
          const item: CachedItem = JSON.parse(itemString)
          items.push({ key, item })
        } catch {
          // Clean up corrupted data
          this.storage.remove(key)
        }
      }
    }

    return items
  }

  // Clean expired items
  cleanExpired(): void {
    const items = this.getAllCachedItems()
    const now = Date.now()

    for (const { key, item } of items) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        this.storage.remove(key)
      }
    }
  }

  // Get cache statistics
  getStats(): { totalItems: number; totalSize: number; expiredItems: number } {
    const items = this.getAllCachedItems()
    const now = Date.now()
    let totalSize = 0
    let expiredItems = 0

    for (const { key, item } of items) {
      const itemString = this.storage.getString(key) || ""
      totalSize += new TextEncoder().encode(itemString).length

      if (item.ttl && now - item.timestamp > item.ttl) {
        expiredItems++
      }
    }

    return {
      totalItems: items.length,
      totalSize,
      expiredItems
    }
  }
}

// Create cache instances using AsyncStorage for now
export class AsyncMMKVCache {
  private prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }
    try {
      await AsyncStorage.setItem(`${this.prefix}${key}`, JSON.stringify(item))
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const itemString = await AsyncStorage.getItem(`${this.prefix}${key}`)
      if (!itemString) return null

      const item = JSON.parse(itemString)

      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        await AsyncStorage.removeItem(`${this.prefix}${key}`)
        return null
      }

      return item.data
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.prefix}${key}`)
    } catch (error) {
      console.error("Cache delete error:", error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(`${this.prefix}${key}`)
      return value !== null
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix))
      await AsyncStorage.multiRemove(prefixedKeys)
    } catch (error) {
      console.error("Cache clear error:", error)
    }
  }

  // Simplified implementations for compatibility
  getAllCachedItems(): Array<{ key: string; item: any }> {
    return []
  }

  cleanExpired(): void {
    // Implement if needed
  }

  getStats(): { totalItems: number; totalSize: number; expiredItems: number } {
    return { totalItems: 0, totalSize: 0, expiredItems: 0 }
  }
}

export const apiCache = new AsyncMMKVCache("api_cache_")
export const offlineCache = new AsyncMMKVCache("offline_cache_")

// Migration helper to move from AsyncStorage to MMKV
export const migrateFromAsyncStorage = async () => {
  const AsyncStorage =
    require("@react-native-async-storage/async-storage").default

  try {
    // Get all AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys()

    // Migrate cache data
    const cacheKeys = keys.filter((key: string) => key.startsWith("api_cache_"))
    for (const key of cacheKeys) {
      const value = await AsyncStorage.getItem(key)
      if (value) {
        const newKey = key.replace("api_cache_", "")
        cacheStorage.set(newKey, value)
        await AsyncStorage.removeItem(key)
      }
    }

    // Migrate offline data
    const offlineKeys = keys.filter(
      (key: string) =>
        key.startsWith("offline_posts_") ||
        key.startsWith("offline_posts_timestamp_")
    )
    for (const key of offlineKeys) {
      const value = await AsyncStorage.getItem(key)
      if (value) {
        offlineStorage.set(key, value)
        await AsyncStorage.removeItem(key)
      }
    }

    // Migrate user data
    const userKeys = keys.filter(
      (key: string) =>
        !key.startsWith("api_cache_") && !key.startsWith("offline_posts_")
    )
    for (const key of userKeys) {
      const value = await AsyncStorage.getItem(key)
      if (value) {
        storage.set(key, value)
        await AsyncStorage.removeItem(key)
      }
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

export default {
  userStorage,
  apiCache,
  offlineCache,
  migrateFromAsyncStorage
}

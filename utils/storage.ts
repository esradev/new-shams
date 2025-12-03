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
  private maxCacheSize: number // Maximum cache size in bytes
  private maxCacheItems: number // Maximum number of cached items

  constructor(prefix: string, maxSizeMB: number = 50, maxItems: number = 1000) {
    this.prefix = prefix
    this.maxCacheSize = maxSizeMB * 1024 * 1024 // Convert MB to bytes
    this.maxCacheItems = maxItems
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    }

    try {
      // Check cache size before adding new item
      await this.ensureCacheSpace()

      const itemString = JSON.stringify(item)
      const itemSize = new TextEncoder().encode(itemString).length

      // If single item is too large, don't cache it
      if (itemSize > this.maxCacheSize * 0.1) {
        // 10% of max cache size
        return
      }

      await AsyncStorage.setItem(`${this.prefix}${key}`, itemString)
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message?.includes("SQLITE_FULL") ||
          error.message?.includes("disk is full"))
      ) {
        await this.emergencyCleanup()
        // Try once more after cleanup
        try {
          await AsyncStorage.setItem(
            `${this.prefix}${key}`,
            JSON.stringify(item)
          )
        } catch (retryError) {
          console.error("Cache set failed even after cleanup:", retryError)
        }
      } else {
        console.error("Cache set error:", error)
      }
    }
  }

  private async ensureCacheSpace(): Promise<void> {
    try {
      const stats = await this.getCacheStats()

      // If we're over limits, clean up
      if (
        stats.totalSize > this.maxCacheSize ||
        stats.totalItems > this.maxCacheItems
      ) {
        await this.cleanupOldItems()
      }

      // Always clean expired items
      await this.cleanExpired()
    } catch (error) {
      console.error("Cache space management error:", error)
    }
  }

  async emergencyCleanup(): Promise<void> {
    try {
      // First clean expired items
      await this.cleanExpired()

      // If still too full, remove oldest 50% of items
      const keys = await AsyncStorage.getAllKeys()
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix))

      if (prefixedKeys.length > 0) {
        // Get items with timestamps
        const itemsWithTime: Array<{ key: string; timestamp: number }> = []

        for (const key of prefixedKeys) {
          try {
            const itemString = await AsyncStorage.getItem(key)
            if (itemString) {
              const item = JSON.parse(itemString)
              itemsWithTime.push({ key, timestamp: item.timestamp || 0 })
            }
          } catch {
            // Remove corrupted items
            await AsyncStorage.removeItem(key)
          }
        }

        // Sort by timestamp and remove oldest half
        itemsWithTime.sort((a, b) => a.timestamp - b.timestamp)
        const toRemove = itemsWithTime.slice(
          0,
          Math.floor(itemsWithTime.length / 2)
        )
        const keysToRemove = toRemove.map(item => item.key)

        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove)
        }
      }
    } catch (error) {
      console.error("Emergency cleanup failed:", error)
    }
  }

  private async cleanupOldItems(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix))

      // Get items with timestamps
      const itemsWithTime: Array<{
        key: string
        timestamp: number
        size: number
      }> = []

      for (const key of prefixedKeys) {
        try {
          const itemString = await AsyncStorage.getItem(key)
          if (itemString) {
            const item = JSON.parse(itemString)
            const size = new TextEncoder().encode(itemString).length
            itemsWithTime.push({ key, timestamp: item.timestamp || 0, size })
          }
        } catch {
          // Remove corrupted items
          await AsyncStorage.removeItem(key)
        }
      }

      // Sort by timestamp (oldest first)
      itemsWithTime.sort((a, b) => a.timestamp - b.timestamp)

      let totalSize = itemsWithTime.reduce((sum, item) => sum + item.size, 0)
      const keysToRemove: string[] = []

      // Remove oldest items until we're under limits
      for (const item of itemsWithTime) {
        if (
          totalSize <= this.maxCacheSize * 0.8 &&
          itemsWithTime.length - keysToRemove.length <= this.maxCacheItems * 0.8
        ) {
          break
        }
        keysToRemove.push(item.key)
        totalSize -= item.size
      }

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove)
      }
    } catch (error) {
      console.error("Cache cleanup error:", error)
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

  // Enhanced implementations for better cache management
  async getAllCachedItems(): Promise<Array<{ key: string; item: any }>> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      if (!keys || !Array.isArray(keys)) {
        return []
      }

      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix))
      const items: Array<{ key: string; item: any }> = []

      for (const key of prefixedKeys) {
        try {
          const itemString = await AsyncStorage.getItem(key)
          if (itemString) {
            const item = JSON.parse(itemString)
            // Ensure the parsed item has the expected structure
            if (item && typeof item === "object") {
              items.push({ key: key.replace(this.prefix, ""), item })
            }
          }
        } catch (parseError) {
          console.warn(`Failed to parse cache item for key ${key}:`, parseError)
          // Clean up corrupted data
          try {
            await AsyncStorage.removeItem(key)
          } catch (removeError) {
            console.error(
              `Failed to remove corrupted cache item ${key}:`,
              removeError
            )
          }
        }
      }

      return items
    } catch (error) {
      console.error("Get all cached items error:", error)
      return []
    }
  }

  async cleanExpired(): Promise<void> {
    try {
      const items = await this.getAllCachedItems()
      const now = Date.now()
      const keysToRemove: string[] = []

      for (const { key, item } of items) {
        if (item.ttl && now - item.timestamp > item.ttl) {
          keysToRemove.push(key)
        }
      }

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove)
        console.log(`Cleaned ${keysToRemove.length} expired cache items`)
      }
    } catch (error) {
      console.error("Clean expired error:", error)
    }
  }

  async getCacheStats(): Promise<{
    totalItems: number
    totalSize: number
    expiredItems: number
  }> {
    try {
      const items = await this.getAllCachedItems()
      if (!items || !Array.isArray(items)) {
        console.warn("getAllCachedItems did not return an array")
        return { totalItems: 0, totalSize: 0, expiredItems: 0 }
      }

      const now = Date.now()
      let totalSize = 0
      let expiredItems = 0

      for (const { key, item } of items) {
        try {
          // Calculate size from the full prefixed key
          const fullKey = `${this.prefix}${key}`
          const itemString = await AsyncStorage.getItem(fullKey)
          if (itemString) {
            totalSize += new TextEncoder().encode(itemString).length
          }

          // Check if item is expired
          if (
            item &&
            item.ttl &&
            item.timestamp &&
            now - item.timestamp > item.ttl
          ) {
            expiredItems++
          }
        } catch (itemError) {
          console.warn(`Error processing cache item ${key}:`, itemError)
          // Count as expired if corrupted
          expiredItems++
        }
      }

      return {
        totalItems: items.length,
        totalSize,
        expiredItems
      }
    } catch (error) {
      console.error("Get cache stats error:", error)
      return { totalItems: 0, totalSize: 0, expiredItems: 0 }
    }
  }

  // Legacy sync method for compatibility
  getStats(): { totalItems: number; totalSize: number; expiredItems: number } {
    return { totalItems: 0, totalSize: 0, expiredItems: 0 }
  }
}

// Create cache instances with size limits
export const apiCache = new AsyncMMKVCache("api_cache_", 30, 500) // 30MB, 500 items max
export const offlineCache = new AsyncMMKVCache("offline_cache_", 20, 300) // 20MB, 300 items max

// Cache health monitoring utilities
export const cacheHealthMonitor = {
  async checkCacheHealth(): Promise<{
    apiCache: { healthy: boolean; stats: any }
    offlineCache: { healthy: boolean; stats: any }
  }> {
    try {
      const [apiStats, offlineStats] = await Promise.all([
        apiCache.getCacheStats(),
        offlineCache.getCacheStats()
      ])

      return {
        apiCache: {
          healthy: apiStats.totalSize < 30 * 1024 * 1024 * 0.9, // 90% of max size
          stats: apiStats
        },
        offlineCache: {
          healthy: offlineStats.totalSize < 20 * 1024 * 1024 * 0.9, // 90% of max size
          stats: offlineStats
        }
      }
    } catch (error) {
      console.error("Cache health check failed:", error)
      return {
        apiCache: {
          healthy: false,
          stats: { totalItems: 0, totalSize: 0, expiredItems: 0 }
        },
        offlineCache: {
          healthy: false,
          stats: { totalItems: 0, totalSize: 0, expiredItems: 0 }
        }
      }
    }
  },

  async performMaintenance(): Promise<void> {
    try {
      await Promise.all([apiCache.cleanExpired(), offlineCache.cleanExpired()])
    } catch (error) {
      console.error("Cache maintenance failed:", error)
    }
  },

  async emergencyCleanup(): Promise<void> {
    try {
      const health = await this.checkCacheHealth()

      if (!health.apiCache.healthy) {
        await apiCache.emergencyCleanup()
      }

      if (!health.offlineCache.healthy) {
        await offlineCache.emergencyCleanup()
      }
    } catch (error) {
      console.error("Emergency cleanup failed:", error)
    }
  }
}

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
  } catch (error) {
    console.error("Migration failed:", error)
  }
}

export default {
  userStorage,
  apiCache,
  offlineCache,
  cacheHealthMonitor,
  migrateFromAsyncStorage,

  // Initialize cache system with automatic maintenance
  async initializeCacheSystem(): Promise<void> {
    try {
      // Perform initial cleanup
      await cacheHealthMonitor.performMaintenance()

      // Set up periodic maintenance (every 30 minutes)
      if (typeof global !== "undefined" && global.setInterval) {
        global.setInterval(async () => {
          await cacheHealthMonitor.performMaintenance()
        }, 30 * 60 * 1000) // 30 minutes
      }
    } catch (error) {
      console.error("Cache system initialization failed:", error)
    }
  }
}

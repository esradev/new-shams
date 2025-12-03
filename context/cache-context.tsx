import React, { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import storage, { apiCache, cacheHealthMonitor } from "@/utils/storage"

interface CacheItem {
  data: any
  timestamp: number
  url: string
  size: number
}

interface CacheStats {
  totalEntries: number
  totalSize: number
  entries: CacheItem[]
}

interface CacheContextType {
  getCachedData: (url: string, maxAge?: number) => Promise<any | null>
  setCachedData: (url: string, data: any) => Promise<void>
  clearCache: () => Promise<void>
  getCacheStats: () => Promise<CacheStats>
  fetchWithCache: (
    url: string,
    options?: { maxAge?: number; forceRefresh?: boolean }
  ) => Promise<any>
}

const CacheContext = createContext<CacheContextType | null>(null)

const DEFAULT_MAX_AGE = 5 * 60 * 1000 // 5 minutes in milliseconds

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    entries: []
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize cache system on mount
  useEffect(() => {
    const initializeCache = async () => {
      try {
        console.log("Initializing cache system...")
        await storage.initializeCacheSystem()
        setIsInitialized(true)

        // Update stats after initialization
        await getCacheStats()
      } catch (error) {
        console.error("Cache initialization failed:", error)
        setIsInitialized(true) // Still allow app to function
      }
    }

    initializeCache()
  }, [])

  // Monitor cache health periodically
  useEffect(() => {
    if (!isInitialized) return

    const monitorHealth = async () => {
      const health = await cacheHealthMonitor.checkCacheHealth()

      if (!health.apiCache.healthy) {
        console.warn("API cache unhealthy, performing maintenance...")
        await cacheHealthMonitor.performMaintenance()
      }
    }

    // Check health every 10 minutes
    const healthInterval = setInterval(monitorHealth, 10 * 60 * 1000)

    return () => clearInterval(healthInterval)
  }, [isInitialized])

  // Get cached data
  const getCachedData = async (
    url: string,
    maxAge: number = DEFAULT_MAX_AGE
  ): Promise<any | null> => {
    try {
      const cacheKey = encodeURIComponent(url)
      return await apiCache.get(cacheKey)
    } catch (error) {
      console.error("Error retrieving cached data:", error)
      return null
    }
  }

  // Set cached data
  const setCachedData = async (url: string, data: any): Promise<void> => {
    const cacheKey = encodeURIComponent(url)

    try {
      await apiCache.set(cacheKey, data, DEFAULT_MAX_AGE)
    } catch (error) {
      console.error("Error setting cached data:", error)

      // If storage is full, try emergency cleanup and retry once
      if (error instanceof Error && error.message?.includes("SQLITE_FULL")) {
        console.warn("Storage full, attempting emergency cleanup...")
        try {
          await cacheHealthMonitor.emergencyCleanup()
          await apiCache.set(cacheKey, data, DEFAULT_MAX_AGE)
        } catch (retryError) {
          console.error(
            "Cache set failed even after emergency cleanup:",
            retryError
          )
        }
      }
    }
  }

  // Clear all cache
  const clearCache = async (): Promise<void> => {
    try {
      await apiCache.clear()
      setCacheStats({
        totalEntries: 0,
        totalSize: 0,
        entries: []
      })
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  }

  // Get cache statistics
  const getCacheStats = async (): Promise<CacheStats> => {
    try {
      const stats = await apiCache.getCacheStats() // Use async version
      const cacheEntries = await apiCache.getAllCachedItems() // Use async version

      // Add safety check for cacheEntries
      if (!cacheEntries || !Array.isArray(cacheEntries)) {
        console.warn("Cache entries is not an array, returning empty stats")
        const emptyCacheStats: CacheStats = {
          totalEntries: stats.totalItems || 0,
          totalSize: stats.totalSize || 0,
          entries: []
        }
        setCacheStats(emptyCacheStats)
        return emptyCacheStats
      }

      const entries: CacheItem[] = cacheEntries.map(({ key, item }) => ({
        data: item.data,
        timestamp: item.timestamp,
        url: decodeURIComponent(key),
        size: JSON.stringify(item.data).length
      }))

      const cacheStatsData: CacheStats = {
        totalEntries: stats.totalItems,
        totalSize: stats.totalSize,
        entries: entries.sort((a, b) => b.timestamp - a.timestamp)
      }

      setCacheStats(cacheStatsData)
      return cacheStatsData
    } catch (error) {
      console.error("Error getting cache stats:", error)
      return { totalEntries: 0, totalSize: 0, entries: [] }
    }
  } // Fetch data with cache
  const fetchWithCache = async (
    url: string,
    options: { maxAge?: number; forceRefresh?: boolean } = {}
  ): Promise<any> => {
    const { maxAge = DEFAULT_MAX_AGE, forceRefresh = false } = options

    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = await getCachedData(url, maxAge)
        if (cachedData !== null) {
          return cachedData
        }
      }

      // Fetch fresh data
      const response = await axios.get(url)
      const data = response.data

      // Cache the response
      await setCachedData(url, data)

      return data
    } catch (error) {
      // If network fails, try to return any cached data as fallback
      const staleData = await apiCache.get(encodeURIComponent(url))
      if (staleData !== null) {
        console.warn("Network failed, returning stale cached data:", url)
        return staleData
      }

      throw error
    }
  }

  // Update cache stats on mount
  useEffect(() => {
    if (isInitialized) {
      getCacheStats()
    }
  }, [isInitialized])

  const contextValue: CacheContextType = {
    getCachedData,
    setCachedData,
    clearCache,
    getCacheStats,
    fetchWithCache
  }

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  )
}

export const useCache = (): CacheContextType => {
  const context = useContext(CacheContext)
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider")
  }
  return context
}

export type { CacheItem, CacheStats }

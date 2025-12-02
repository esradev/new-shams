import React, { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"
import { apiCache } from "@/utils/storage"

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
    try {
      const cacheKey = encodeURIComponent(url)
      await apiCache.set(cacheKey, data, DEFAULT_MAX_AGE)
    } catch (error) {
      console.error("Error setting cached data:", error)
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
      const stats = apiCache.getStats()
      const cacheEntries = apiCache.getAllCachedItems()

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
    getCacheStats()
  }, [])

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

import React, { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"

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

const CACHE_PREFIX = "api_cache_"
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
      const cacheKey = CACHE_PREFIX + encodeURIComponent(url)
      const cachedItemString = await AsyncStorage.getItem(cacheKey)

      if (!cachedItemString) {
        return null
      }

      const cachedItem: CacheItem = JSON.parse(cachedItemString)
      const isExpired = Date.now() - cachedItem.timestamp > maxAge

      if (isExpired) {
        await AsyncStorage.removeItem(cacheKey)
        return null
      }

      return cachedItem.data
    } catch (error) {
      console.error("Error retrieving cached data:", error)
      return null
    }
  }

  // Set cached data
  const setCachedData = async (url: string, data: any): Promise<void> => {
    try {
      const cacheKey = CACHE_PREFIX + encodeURIComponent(url)
      const dataString = JSON.stringify(data)
      const cacheItem: CacheItem = {
        data,
        timestamp: Date.now(),
        url,
        size: new TextEncoder().encode(dataString).length
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem))
    } catch (error) {
      console.error("Error setting cached data:", error)
    }
  }

  // Clear all cache
  const clearCache = async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys()
      const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX))
      await AsyncStorage.multiRemove(cacheKeys)

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
      const allKeys = await AsyncStorage.getAllKeys()
      const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX))

      const cacheEntries: CacheItem[] = []
      let totalSize = 0

      for (const key of cacheKeys) {
        const itemString = await AsyncStorage.getItem(key)
        if (itemString) {
          try {
            const item: CacheItem = JSON.parse(itemString)
            cacheEntries.push(item)
            totalSize += item.size
          } catch (parseError) {
            console.warn("Invalid cache item found:", key)
            await AsyncStorage.removeItem(key)
          }
        }
      }

      const stats: CacheStats = {
        totalEntries: cacheEntries.length,
        totalSize,
        entries: cacheEntries.sort((a, b) => b.timestamp - a.timestamp)
      }

      setCacheStats(stats)
      return stats
    } catch (error) {
      console.error("Error getting cache stats:", error)
      return { totalEntries: 0, totalSize: 0, entries: [] }
    }
  }

  // Fetch data with cache
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
      // If network fails, try to return stale cached data as fallback
      const staleData = await getCachedData(url, Number.MAX_SAFE_INTEGER)
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

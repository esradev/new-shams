import { useEffect, useState } from "react"
import { useCache } from "@/context/cache-context"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type Category = {
  id: number
  name: string
  count: number
  parent: number
  description: string
}

const CATEGORIES_STORAGE_KEY = "offline_categories"
const CATEGORIES_TIMESTAMP_KEY = "offline_categories_timestamp"
const OFFLINE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Create a storage interface that matches MMKV API but uses AsyncStorage
const storage = {
  getString: async (key: string): Promise<string | undefined> => {
    try {
      const value = await AsyncStorage.getItem(key)
      return value ?? undefined
    } catch {
      return undefined
    }
  },
  set: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (error) {
      console.error("Storage error:", error)
    }
  }
}

export function useFetchCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { fetchWithCache } = useCache()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, try to load from offline storage
        const offlineCategories = await loadOfflineCategories()
        if (offlineCategories) {
          setCategories(offlineCategories)
          setLoading(false)

          // Still try to fetch fresh data in background if offline data is old
          const timestamp = await storage.getString(CATEGORIES_TIMESTAMP_KEY)
          const isStale =
            !timestamp || Date.now() - parseInt(timestamp) > OFFLINE_MAX_AGE

          if (!isStale) {
            return // Use offline data without fetching
          }
        }

        // Fetch fresh data from network
        const url =
          "https://shams-almaarif.com/wp-json/wp/v2/categories?per_page=100"
        const data = await fetchWithCache(url, { maxAge: 15 * 60 * 1000 }) // 15 minutes cache
        const filtered = data.filter((cat: Category) => cat.count > 0)

        // Save to offline storage
        await saveOfflineCategories(filtered)
        setCategories(filtered)
      } catch (err) {
        // If network fails and we have offline data, use it
        const offlineCategories = await loadOfflineCategories()
        if (offlineCategories) {
          setCategories(offlineCategories)
        } else {
          setError(err as Error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchWithCache])

  const loadOfflineCategories = async (): Promise<Category[] | null> => {
    try {
      const categoriesString = await storage.getString(CATEGORIES_STORAGE_KEY)
      if (categoriesString) {
        return JSON.parse(categoriesString) as Category[]
      }
    } catch (error) {
      console.error("Error loading offline categories:", error)
    }
    return null
  }

  const saveOfflineCategories = async (
    categories: Category[]
  ): Promise<void> => {
    try {
      await storage.set(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
      await storage.set(CATEGORIES_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.error("Error saving offline categories:", error)
    }
  }

  return { categories, loading, error }
}

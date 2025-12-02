import { useEffect, useState } from "react"
import axios from "axios"
import { PostType } from "./use-posts-by-category"
import { useCache } from "@/context/cache-context"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface SearchParams {
  query: string
  categories: number[]
  page?: number
  perPage?: number
}

interface SearchResult {
  posts: PostType[]
  totalPages: number
  totalResults: number
}

const SEARCH_STORAGE_PREFIX = "offline_search_"
const SEARCH_TIMESTAMP_PREFIX = "offline_search_timestamp_"
const OFFLINE_MAX_AGE = 3 * 60 * 60 * 1000 // 3 hours for search (shorter than posts/categories)

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

export const useSearch = () => {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const { fetchWithCache } = useCache()

  const search = async (params: SearchParams) => {
    if (!params.query.trim()) {
      setPosts([])
      setTotalPages(1)
      setTotalResults(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create storage key based on search parameters
      const storageKey = `${params.query}_${params.categories.join(",")}_${
        params.page || 1
      }_${params.perPage || 20}`

      // First, try to load from offline storage
      const offlineSearch = await loadOfflineSearch(storageKey)
      if (offlineSearch) {
        setPosts(offlineSearch.posts)
        setTotalPages(offlineSearch.totalPages)
        setTotalResults(offlineSearch.totalResults)
        setLoading(false)

        // Check if offline data is stale (shorter cache for search)
        const timestamp = await storage.getString(
          `${SEARCH_TIMESTAMP_PREFIX}${storageKey}`
        )
        const isStale =
          !timestamp || Date.now() - parseInt(timestamp) > OFFLINE_MAX_AGE

        if (!isStale) {
          return // Use offline data without fetching
        }
      }

      const searchParams = new URLSearchParams()
      searchParams.append("search", params.query)
      searchParams.append("page", String(params.page || 1))
      searchParams.append("per_page", String(params.perPage || 20))
      searchParams.append("orderby", "relevance")

      // Add category filter if categories are selected
      if (params.categories.length > 0) {
        searchParams.append("categories", params.categories.join(","))
      }

      const url = `https://shams-almaarif.com/wp-json/wp/v2/posts?${searchParams.toString()}&_embed=wp:term`

      // For search, use shorter cache time (3 minutes) since search results may change more frequently
      const data = await fetchWithCache(url, { maxAge: 3 * 60 * 1000 })

      // We still need to get headers for pagination info, so make the actual request
      const response = await axios.get(url)

      const searchResult: SearchResult = {
        posts: data,
        totalPages: Number(response.headers["x-wp-totalpages"] || 1),
        totalResults: Number(response.headers["x-wp-total"] || 0)
      }

      // Save to offline storage
      await saveOfflineSearch(storageKey, searchResult)

      setPosts(data)
      setTotalPages(Number(response.headers["x-wp-totalpages"] || 1))
      setTotalResults(Number(response.headers["x-wp-total"] || 0))
    } catch (err: any) {
      // If network fails and we have offline data, use it
      const storageKey = `${params.query}_${params.categories.join(",")}_${
        params.page || 1
      }_${params.perPage || 20}`
      const offlineSearch = await loadOfflineSearch(storageKey)

      if (offlineSearch) {
        setPosts(offlineSearch.posts)
        setTotalPages(offlineSearch.totalPages)
        setTotalResults(offlineSearch.totalResults)
        setError(null)
      } else {
        setError(err.message || "Search failed")
        setPosts([])
        setTotalPages(1)
        setTotalResults(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadOfflineSearch = async (
    storageKey: string
  ): Promise<SearchResult | null> => {
    try {
      const searchString = await storage.getString(
        `${SEARCH_STORAGE_PREFIX}${storageKey}`
      )
      if (searchString) {
        return JSON.parse(searchString)
      }
    } catch (error) {
      console.error("Error loading offline search:", error)
    }
    return null
  }

  const saveOfflineSearch = async (
    storageKey: string,
    data: SearchResult
  ): Promise<void> => {
    try {
      await storage.set(
        `${SEARCH_STORAGE_PREFIX}${storageKey}`,
        JSON.stringify(data)
      )
      await storage.set(
        `${SEARCH_TIMESTAMP_PREFIX}${storageKey}`,
        Date.now().toString()
      )
    } catch (error) {
      console.error("Error saving offline search:", error)
    }
  }

  const clearSearch = () => {
    setPosts([])
    setError(null)
    setTotalPages(1)
    setTotalResults(0)
  }

  return {
    posts,
    loading,
    error,
    totalPages,
    totalResults,
    search,
    clearSearch
  }
}

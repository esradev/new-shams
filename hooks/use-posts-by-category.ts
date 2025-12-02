import { useEffect, useState } from "react"
import axios from "axios"
import { useCache } from "@/context/cache-context"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface PostType {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  meta: {
    "date-of-the-lesson"?: string
    "the-audio-of-the-lesson"?: string
  }
  categories: number[]
  duration?: string
  completed?: boolean
}

const POSTS_STORAGE_PREFIX = "offline_posts_"
const POSTS_TIMESTAMP_PREFIX = "offline_posts_timestamp_"
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

export const usePostsByCategory = (categoryId: string | string[]) => {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { fetchWithCache } = useCache()

  useEffect(() => {
    const fetchPosts = async () => {
      if (!categoryId) return

      setLoading(true)
      setError(null)

      try {
        const storageKey = `${categoryId}_${page}`

        // First, try to load from offline storage
        const offlinePosts = await loadOfflinePosts(storageKey)
        if (offlinePosts) {
          setPosts(offlinePosts.posts)
          setTotalPages(offlinePosts.totalPages)
          setLoading(false)

          // Check if offline data is stale
          const timestamp = await storage.getString(
            `${POSTS_TIMESTAMP_PREFIX}${storageKey}`
          )
          const isStale =
            !timestamp || Date.now() - parseInt(timestamp) > OFFLINE_MAX_AGE

          if (!isStale) {
            return // Use offline data without fetching
          }
        }

        const url = `https://shams-almaarif.com/wp-json/wp/v2/posts?categories=${categoryId}&page=${page}&per_page=20&orderby=date&order=asc`

        // For the actual API call, we need to use axios to get headers
        const response = await axios.get(url)

        // Cache the response data
        await fetchWithCache(url, { maxAge: 10 * 60 * 1000 }) // 10 minutes cache

        const postsData = {
          posts: response.data,
          totalPages: Number(response.headers["x-wp-totalpages"]) || 1
        }

        // Save to offline storage
        await saveOfflinePosts(storageKey, postsData)

        setPosts(response.data)
        setTotalPages(Number(response.headers["x-wp-totalpages"]) || 1)
      } catch (err: any) {
        // If network fails and we have offline data, use it
        const storageKey = `${categoryId}_${page}`
        const offlinePosts = await loadOfflinePosts(storageKey)

        if (offlinePosts) {
          setPosts(offlinePosts.posts)
          setTotalPages(offlinePosts.totalPages)
          setError(null)
        } else {
          setError(err.message)
          // Try to get cached data as fallback
          try {
            const cachedData = await fetchWithCache(
              `https://shams-almaarif.com/wp-json/wp/v2/posts?categories=${categoryId}&page=${page}&per_page=20&orderby=date&order=asc`,
              { maxAge: Number.MAX_SAFE_INTEGER }
            )
            if (cachedData) {
              setPosts(cachedData)
              setError(null)
            }
          } catch (cacheErr) {
            console.error("No cached data available")
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [categoryId, page, fetchWithCache])

  const loadOfflinePosts = async (
    storageKey: string
  ): Promise<{ posts: PostType[]; totalPages: number } | null> => {
    try {
      const postsString = await storage.getString(
        `${POSTS_STORAGE_PREFIX}${storageKey}`
      )
      if (postsString) {
        return JSON.parse(postsString)
      }
    } catch (error) {
      console.error("Error loading offline posts:", error)
    }
    return null
  }

  const saveOfflinePosts = async (
    storageKey: string,
    data: { posts: PostType[]; totalPages: number }
  ): Promise<void> => {
    try {
      await storage.set(
        `${POSTS_STORAGE_PREFIX}${storageKey}`,
        JSON.stringify(data)
      )
      await storage.set(
        `${POSTS_TIMESTAMP_PREFIX}${storageKey}`,
        Date.now().toString()
      )
    } catch (error) {
      console.error("Error saving offline posts:", error)
    }
  }

  return { posts, loading, error, page, totalPages, setPage }
}

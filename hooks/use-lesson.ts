import { useState, useEffect } from "react"
import axios from "axios"
import { offlineCache, apiCache } from "@/utils/storage"

export interface LessonData {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  meta: {
    "date-of-the-lesson"?: string
    "the-audio-of-the-lesson"?: string
  }
  categories: number[]
}

export interface UseLessonReturn {
  lesson: LessonData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const LESSON_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export const useLesson = (lessonId: string | string[]): UseLessonReturn => {
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = Array.isArray(lessonId) ? lessonId[0] : lessonId

  const fetchLesson = async (forceRefresh = false) => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const cacheKey = `lesson_${id}`

      // Try to get from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedLesson = await offlineCache.get<LessonData>(cacheKey)
        if (cachedLesson) {
          setLesson(cachedLesson)
          setLoading(false)

          // Check if we should refresh in background
          const apiCacheKey = `lesson_api_${id}`
          const lastFetch = await apiCache.get<number>(apiCacheKey)
          const shouldRefresh =
            !lastFetch || Date.now() - lastFetch > LESSON_CACHE_TTL

          if (!shouldRefresh) {
            return // Use cached data without fetching
          }

          // Continue to fetch fresh data in background
          setLoading(false) // Don't show loading for background refresh
        }
      }

      // Fetch from API
      const url = `https://shams-almaarif.com/wp-json/wp/v2/posts/${id}`
      const response = await axios.get(url)
      const lessonData: LessonData = response.data

      // Cache the lesson data
      await offlineCache.set(cacheKey, lessonData, LESSON_CACHE_TTL)
      await apiCache.set(`lesson_api_${id}`, Date.now(), LESSON_CACHE_TTL)

      setLesson(lessonData)
    } catch (err: any) {
      // If network fails, try to use cached data
      const cacheKey = `lesson_${id}`
      const cachedLesson = await offlineCache.get<LessonData>(cacheKey)

      if (cachedLesson) {
        setLesson(cachedLesson)
        setError(null)
      } else {
        setError(err.message || "Failed to load lesson")
        setLesson(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchLesson(true)
  }

  useEffect(() => {
    fetchLesson()
  }, [id])

  return { lesson, loading, error, refetch }
}

// Preload lesson data
export const preloadLesson = async (lessonId: number): Promise<void> => {
  const cacheKey = `lesson_${lessonId}`
  const apiCacheKey = `lesson_api_${lessonId}`

  // Check if already cached and fresh
  const cachedLesson = await offlineCache.get<LessonData>(cacheKey)
  const lastFetch = await apiCache.get<number>(apiCacheKey)
  const isFresh = lastFetch && Date.now() - lastFetch < LESSON_CACHE_TTL

  if (cachedLesson && isFresh) {
    return // Already cached and fresh
  }

  try {
    const url = `https://shams-almaarif.com/wp-json/wp/v2/posts/${lessonId}`
    const response = await axios.get(url)
    const lessonData: LessonData = response.data

    // Cache the lesson data
    await offlineCache.set(cacheKey, lessonData, LESSON_CACHE_TTL)
    await apiCache.set(apiCacheKey, Date.now(), LESSON_CACHE_TTL)
  } catch (error) {
    console.warn(`Failed to preload lesson ${lessonId}:`, error)
  }
}

// Preload multiple lessons
export const preloadLessons = async (lessonIds: number[]): Promise<void> => {
  const promises = lessonIds.map(id => preloadLesson(id))
  await Promise.allSettled(promises)
}

// Clear lesson cache
export const clearLessonCache = (): void => {
  const cacheKeys = offlineCache
    .getAllCachedItems()
    .map(item => item.key)
    .filter(key => key.startsWith("lesson_"))

  cacheKeys.forEach(key => {
    offlineCache.delete(key)
  })

  const apiCacheKeys = apiCache
    .getAllCachedItems()
    .map(item => item.key)
    .filter(key => key.startsWith("lesson_api_"))

  apiCacheKeys.forEach(key => {
    apiCache.delete(key)
  })
}

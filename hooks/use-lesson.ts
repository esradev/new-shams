import { useState, useEffect } from "react"
import axios from "axios"

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

export const useLesson = (lessonId: string | string[]): UseLessonReturn => {
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = Array.isArray(lessonId) ? lessonId[0] : lessonId

  const fetchLesson = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const url = `https://shams-almaarif.com/wp-json/wp/v2/posts/${id}`
      const response = await axios.get(url)
      const lessonData: LessonData = response.data
      setLesson(lessonData)
    } catch (err: any) {
        setError(err.message || "Failed to load lesson")
        setLesson(null)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchLesson()
  }

  useEffect(() => {
    fetchLesson()
  }, [id])

  return { lesson, loading, error, refetch }
}

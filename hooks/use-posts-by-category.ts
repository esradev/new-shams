import { useEffect, useState } from "react"
import axios from "axios"

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

export const usePostsByCategory = (categoryId: string | string[]) => {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPosts = async () => {
      if (!categoryId) return

      setLoading(true)
      setError(null)

      try {
        const url = `https://shams-almaarif.com/wp-json/wp/v2/posts?categories=${categoryId}&page=${page}&per_page=20&orderby=date&order=asc`

        const response = await axios.get(url)
        setPosts(response.data)
        setTotalPages(Number(response.headers["x-wp-totalpages"]) || 1)

      } catch (err: any) {
          console.error("Error fetching posts by category:", err)
          setError(err.message || "Failed to load posts")
          setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [categoryId, page])

  return { posts, loading, error, page, totalPages, setPage }
}

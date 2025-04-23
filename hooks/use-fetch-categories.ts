import { useEffect, useState } from 'react'
import axios from 'axios'

export type Category = {
  id: number
  name: string
  count: number
  parent: number
  description: string
}

export function useFetchCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://shams-almaarif.com/wp-json/wp/v2/categories?per_page=100'
        )
        const filtered = response.data.filter((cat: Category) => cat.count > 0)
        setCategories(filtered)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { categories, loading, error }
}

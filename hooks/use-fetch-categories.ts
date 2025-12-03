import { useEffect, useState } from "react"
import axios from "axios"

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch fresh data from network
        const url =
          "https://shams-almaarif.com/wp-json/wp/v2/categories?per_page=100"
        const data = await axios.get<Category[]>(url).then((res) => res.data)
        const filtered = data.filter((cat: Category) => cat.count > 0)

        setCategories(filtered)
      } catch (err) {
        console.error("Error fetching categories from network:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { categories, loading }
}

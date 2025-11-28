import { useEffect, useState } from "react";
import axios from "axios";
import { useCache } from "@/context/cache-context";

export type Category = {
  id: number;
  name: string;
  count: number;
  parent: number;
  description: string;
};

export function useFetchCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { fetchWithCache } = useCache();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          "https://shams-almaarif.com/wp-json/wp/v2/categories?per_page=100";
        const data = await fetchWithCache(url, { maxAge: 15 * 60 * 1000 }); // 15 minutes cache
        const filtered = data.filter((cat: Category) => cat.count > 0);
        setCategories(filtered);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchWithCache]);

  return { categories, loading, error };
}

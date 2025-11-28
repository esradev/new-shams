import { useEffect, useState } from "react";
import axios from "axios";
import { useCache } from "@/context/cache-context";

export interface PostType {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  meta: {
    "date-of-the-lesson"?: string;
    "the-audio-of-the-lesson"?: string;
  };
  categories: number[];
  duration?: string;
  completed?: boolean;
}

export const usePostsByCategory = (categoryId: string | string[]) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { fetchWithCache } = useCache();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!categoryId) return;

      setLoading(true);
      setError(null);

      try {
        const url = `https://shams-almaarif.com/wp-json/wp/v2/posts?categories=${categoryId}&page=${page}&per_page=20&orderby=date&order=asc`;

        // For the actual API call, we need to use axios to get headers
        const response = await axios.get(url);

        // Cache the response data
        await fetchWithCache(url, { maxAge: 10 * 60 * 1000 }); // 10 minutes cache

        setPosts(response.data);
        setTotalPages(Number(response.headers["x-wp-totalpages"]) || 1);
      } catch (err: any) {
        setError(err.message);

        // Try to get cached data as fallback
        try {
          const cachedData = await fetchWithCache(
            `https://shams-almaarif.com/wp-json/wp/v2/posts?categories=${categoryId}&page=${page}&per_page=20&orderby=date&order=asc`,
            { maxAge: Number.MAX_SAFE_INTEGER },
          );
          if (cachedData) {
            setPosts(cachedData);
            setError(null);
          }
        } catch (cacheErr) {
          console.error("No cached data available");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryId, page, fetchWithCache]);

  return { posts, loading, error, page, totalPages, setPage };
};

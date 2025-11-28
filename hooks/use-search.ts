import { useEffect, useState } from "react";
import axios from "axios";
import { PostType } from "./use-posts-by-category";
import { useCache } from "@/context/cache-context";

export interface SearchParams {
  query: string;
  categories: number[];
  page?: number;
  perPage?: number;
}

export const useSearch = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const { fetchWithCache } = useCache();

  const search = async (params: SearchParams) => {
    if (!params.query.trim()) {
      setPosts([]);
      setTotalPages(1);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.append("search", params.query);
      searchParams.append("page", String(params.page || 1));
      searchParams.append("per_page", String(params.perPage || 20));
      searchParams.append("orderby", "relevance");

      // Add category filter if categories are selected
      if (params.categories.length > 0) {
        searchParams.append("categories", params.categories.join(","));
      }

      const url = `https://shams-almaarif.com/wp-json/wp/v2/posts?${searchParams.toString()}&_embed=wp:term`;

      // For search, use shorter cache time (3 minutes) since search results may change more frequently
      const data = await fetchWithCache(url, { maxAge: 3 * 60 * 1000 });

      // We still need to get headers for pagination info, so make the actual request
      const response = await axios.get(url);

      setPosts(data);
      setTotalPages(Number(response.headers["x-wp-totalpages"] || 1));
      setTotalResults(Number(response.headers["x-wp-total"] || 0));
    } catch (err: any) {
      setError(err.message || "Search failed");
      setPosts([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setPosts([]);
    setError(null);
    setTotalPages(1);
    setTotalResults(0);
  };

  return {
    posts,
    loading,
    error,
    totalPages,
    totalResults,
    search,
    clearSearch,
  };
};

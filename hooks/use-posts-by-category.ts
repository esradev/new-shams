import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `https://shams-almaarif.com/wp-json/wp/v2/posts?categories=${categoryId}&page=${page}&per_page=20&orderby=date&order=asc`,
        );
        setPosts(response.data);
        setTotalPages(Number(response.headers["x-wp-totalpages"]));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchPosts();
    }
  }, [categoryId, page]);

  return { posts, loading, error, page, totalPages, setPage };
};

// context/api-context.tsx
import React, { createContext, useContext } from "react";
import { useFetchCategories, Category } from "@/hooks/use-fetch-categories";
import { useSearch } from "@/hooks/use-search";

type ApiContextType = {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  searchFunctions: ReturnType<typeof useSearch>;
};

const ApiContext = createContext<ApiContextType>({
  categories: [],
  loading: true,
  error: null,
  searchFunctions: {
    posts: [],
    loading: false,
    error: null,
    totalPages: 1,
    totalResults: 0,
    search: () => Promise.resolve(),
    clearSearch: () => {},
  },
});

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { categories, loading, error } = useFetchCategories();
  const searchFunctions = useSearch();

  return (
    <ApiContext.Provider
      value={{ categories, loading, error, searchFunctions }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);

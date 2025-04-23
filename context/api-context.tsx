// context/api-context.tsx
import React, { createContext, useContext } from 'react'
import { useFetchCategories, Category } from '@/hooks/use-fetch-categories'

type ApiContextType = {
  categories: Category[]
  loading: boolean
  error: Error | null
}

const ApiContext = createContext<ApiContextType>({
  categories: [],
  loading: true,
  error: null
})

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { categories, loading, error } = useFetchCategories()

  return (
    <ApiContext.Provider value={{ categories, loading, error }}>
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => useContext(ApiContext)

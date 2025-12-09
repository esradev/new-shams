import React, { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, FlatList } from "react-native"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import { Search as SearchIcon, X, Filter, FilterX } from "lucide-react-native"

import { useSearch } from "@/hooks/use-search"
import { useApi } from "@/context/api-context"
import SearchResultCard from "@/components/search-result-card"
import { PostType } from "@/hooks/use-posts-by-category"
import GlobalLoading from "@/components/global-loading"

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const { categories, loading: categoriesLoading } = useApi()
  const {
    posts,
    loading,
    error,
    totalPages,
    totalResults,
    search,
    clearSearch
  } = useSearch()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1)
        search({
          query: searchQuery,
          categories: selectedCategories,
          page: 1,
          perPage: 20
        })
      } else {
        clearSearch()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategories, search, clearSearch])

  const handleClearSearch = () => {
    setSearchQuery("")
    setSelectedCategories([])
    clearSearch()
  }

  const clearFilters = () => {
    setSelectedCategories([])
  }

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const loadMore = () => {
    if (page < totalPages && !loading && searchQuery.trim()) {
      const nextPage = page + 1
      setPage(nextPage)
      search({
        query: searchQuery,
        categories: selectedCategories,
        page: nextPage,
        perPage: 20
      })
    }
  }

  const renderSearchResult = ({ item }: { item: PostType }) => (
    <View className="mb-3">
      <SearchResultCard post={item} searchQuery={searchQuery} />
    </View>
  )

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1">
          {/* Search Header */}
          <View className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl mb-4">
              جستجو
            </Text>

            {/* Search Input */}
            <View className="flex flex-row-reverse items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 mb-3">
              <SearchIcon size={20} color="#6B7280" className="ml-2" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="جستجو در درس‌ها..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-right dir-rtl text-gray-900 dark:text-white text-base"
                returnKeyType="search"
              />
              {searchQuery ? (
                <Pressable onPress={handleClearSearch} className="mr-2">
                  <X size={20} color="#6B7280" />
                </Pressable>
              ) : null}
            </View>

            {/* Filter Toggle */}
            <View className="flex flex-row-reverse items-center justify-between">
              <Pressable
                onPress={() => setShowFilters(!showFilters)}
                className="flex flex-row-reverse items-center bg-emerald-100 dark:bg-emerald-900/30 px-3 py-2 rounded-lg"
              >
                <Filter size={16} color="#059669" />
                <Text className="text-emerald-700 dark:text-emerald-400 font-medium mr-2">
                  فیلتر دسته‌بندی
                </Text>
                {selectedCategories.length > 0 && (
                  <View className="bg-emerald-500 rounded-full w-5 h-5 items-center justify-center mr-2">
                    <Text className="text-white text-xs font-bold">
                      {selectedCategories.length}
                    </Text>
                  </View>
                )}
              </Pressable>

              {totalResults > 0 && (
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {totalResults} نتیجه
                </Text>
              )}
            </View>
          </View>

          {/* Categories Filter */}
          {showFilters && (
            <View className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <View className="flex flex-row-reverse items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white text-right dir-rtl">
                  دسته‌بندی‌ها
                </Text>
                {selectedCategories.length > 0 && (
                  <Pressable
                    onPress={clearFilters}
                    className="flex flex-row-reverse items-center bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-lg"
                  >
                    <FilterX size={14} color="#DC2626" />
                    <Text className="text-red-700 dark:text-red-400 font-medium text-sm mr-1">
                      پاک کردن فیلترها
                    </Text>
                  </Pressable>
                )}
              </View>
              {categoriesLoading ? (
                <Text className="text-gray-500 dark:text-gray-400 text-right">
                  در حال بارگذاری...
                </Text>
              ) : (
                <FlatList
                  data={categories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  inverted
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item: category }) => (
                    <Pressable
                      onPress={() => toggleCategory(category.id)}
                      style={{ marginLeft: 8 }}
                      className={`px-3 py-2 rounded-full ${
                        selectedCategories.includes(category.id)
                          ? "bg-emerald-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedCategories.includes(category.id)
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {category.name} ({category.count})
                      </Text>
                    </Pressable>
                  )}
                />
              )}

              {/* Selected Categories Summary */}
              {selectedCategories.length > 0 && (
                <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 text-right dir-rtl mb-2">
                    فیلترهای انتخاب شده: {selectedCategories.length} دسته‌بندی
                  </Text>
                  <View className="flex flex-row-reverse flex-wrap gap-2">
                    {selectedCategories.map(categoryId => {
                      const category = categories.find(
                        cat => cat.id === categoryId
                      )
                      return category ? (
                        <View
                          key={categoryId}
                          className="flex flex-row-reverse items-center bg-emerald-500 px-2 py-1 rounded-full"
                        >
                          <Text className="text-white text-xs font-medium mr-1">
                            {category.name}
                          </Text>
                          <Pressable onPress={() => toggleCategory(categoryId)}>
                            <X size={12} color="#fff" />
                          </Pressable>
                        </View>
                      ) : null
                    })}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Search Results */}
          <View className="flex-1">
            {loading && posts.length === 0 ? (
              <GlobalLoading compact message="در حال جستجو..." type="data" />
            ) : error ? (
              <View className="flex-1 items-center justify-center px-4">
                <Text className="text-red-500 text-lg font-bold text-center mb-4">
                  خطا: {error}
                </Text>
                <Pressable
                  onPress={() =>
                    search({
                      query: searchQuery,
                      categories: selectedCategories,
                      page: 1
                    })
                  }
                  className="bg-emerald-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">تلاش مجدد</Text>
                </Pressable>
              </View>
            ) : searchQuery.trim() === "" ? (
              <View className="flex-1 items-center justify-center px-4">
                <SearchIcon size={64} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 text-lg text-center mt-4">
                  برای جستجو در درس‌ها کلمه کلیدی وارد کنید
                </Text>
              </View>
            ) : posts.length === 0 ? (
              <View className="flex-1 items-center justify-center px-4">
                <Text className="text-gray-500 dark:text-gray-400 text-lg text-center">
                  هیچ نتیجه‌ای برای &quot;{searchQuery}&quot; پیدا نشد
                </Text>
                <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">
                  کلمات کلیدی دیگری امتحان کنید
                </Text>
              </View>
            ) : (
              <FlatList
                data={posts}
                renderItem={renderSearchResult}
                keyExtractor={item => item.id.toString()}
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loading && posts.length > 0 ? (
                    <View className="py-4">
                      <GlobalLoading
                        compact
                        message="در حال بارگذاری نتایج بیشتر..."
                        type="data"
                      />
                    </View>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

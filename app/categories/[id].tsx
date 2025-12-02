import React, { useState, useEffect } from "react"
import { Text, ScrollView, View, Pressable, TextInput } from "react-native"
import { useLocalSearchParams, useNavigation, Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Check, Search as SearchIcon, X } from "lucide-react-native"

import LoadingSpinner from "@/components/loading-spinner"
import Pagination from "@/components/pagination"
import { useApi } from "@/context/api-context"
import { usePostsByCategory } from "@/hooks/use-posts-by-category"
import { useSearch } from "@/hooks/use-search"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatPersianDate } from "@/utils/date-utils"

const Categories = () => {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const { categories } = useApi()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const category = categories.find(cat => cat.id === Number(id))
  const { isLessonCompleted } = useLocalStorage()

  const { posts, loading, error, page, totalPages, setPage } =
    usePostsByCategory(id)

  const {
    posts: searchPosts,
    loading: searchLoading,
    totalPages: searchTotalPages,
    search,
    clearSearch
  } = useSearch()

  const [searchPage, setSearchPage] = useState(1)

  // Debounced search within category
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      setSearchPage(1) // Reset to first page on new search
      const timer = setTimeout(() => {
        search({
          query: searchQuery,
          categories: [Number(id)],
          page: 1, // Always start from page 1 for new searches
          perPage: 20
        })
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setIsSearching(false)
      clearSearch()
      setSearchPage(1)
    }
  }, [searchQuery, id])

  // Handle search pagination separately
  useEffect(() => {
    if (isSearching && searchQuery.trim() && searchPage > 1) {
      search({
        query: searchQuery,
        categories: [Number(id)],
        page: searchPage,
        perPage: 20
      })
    }
  }, [searchPage])

  // Handle search page changes
  const handleSearchPageChange = (newPage: number) => {
    setSearchPage(newPage)
    if (searchQuery.trim()) {
      search({
        query: searchQuery,
        categories: [Number(id)],
        page: newPage,
        perPage: 20
      })
    }
  }

  React.useEffect(() => {
    if (category) {
      navigation.setOptions({ title: category.name })
    }
  }, [category])

  const handleClearSearch = () => {
    setSearchQuery("")
    setIsSearching(false)
    clearSearch()
    setSearchPage(1)
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  if (error || !category) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 text-lg font-bold text-center mb-4 w-full">
          Error: {error || "Category not found"}
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-5">
            {/* Category Header */}
            <View className="flex flex-row-reverse justify-between items-start mb-2">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl">
                {category?.name}
              </Text>
            </View>

            <View className="flex flex-row-reverse items-center mb-4">
              <Text className="text-sm text-right dir-rtl text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                درس خارج
              </Text>
              <Text className="mx-2 text-gray-400">•</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-right dir-rtl">
                آیت الله سید محمدرضا حسینی آملی (حفظه الله)
              </Text>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 text-right dir-rtl">
                در مورد درس
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-right dir-rtl">
                {category?.description}
              </Text>
            </View>

            {/* Search Input */}
            <View className="mb-4">
              <View className="flex flex-row-reverse items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                <SearchIcon size={20} color="#6B7280" className="ml-2" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="جستجو در این دسته..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-right dir-rtl text-gray-900 dark:text-white text-base"
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  onSubmitEditing={() => {
                    if (searchQuery.trim()) {
                      search({
                        query: searchQuery,
                        categories: [Number(id)],
                        page: 1,
                        perPage: 20
                      })
                      setSearchPage(1)
                    }
                  }}
                />
                {searchQuery ? (
                  <Pressable
                    onPress={handleClearSearch}
                    className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    hitSlop={8}
                  >
                    <X size={18} color="#6B7280" />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Posts */}
            <View>
              <View className="flex flex-row-reverse items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right dir-rtl">
                  {isSearching ? `نتایج جستجو برای "${searchQuery}"` : "جلسات"}
                </Text>
                {!isSearching && posts.length > 0 && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {posts.length} درس در این صفحه
                  </Text>
                )}
                {isSearching && searchPosts.length > 0 && !searchLoading && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {searchPosts.length} نتیجه در صفحه {searchPage}
                  </Text>
                )}
              </View>

              {isSearching ? (
                // Search Results
                searchLoading ? (
                  <View>
                    <LoadingSpinner />
                    <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      در حال جستجو...
                    </Text>
                  </View>
                ) : searchPosts.length === 0 ? (
                  <View className="py-8 items-center">
                    <Text className="text-gray-500 dark:text-gray-400 text-center text-base">
                      نتیجه‌ای برای "{searchQuery}" یافت نشد
                    </Text>
                    <Text className="text-gray-400 dark:text-gray-500 text-center text-sm mt-2">
                      لطفاً کلمات کلیدی دیگری امتحان کنید
                    </Text>
                  </View>
                ) : (
                  <View className="gap-y-3">
                    {searchPosts.map(lesson => (
                      <View key={lesson.id} className="mb-3">
                        <Link
                          asChild
                          href={{
                            pathname: "/lessons/[id]" as any,
                            params: {
                              id: lesson.id.toString(),
                              postTitle: lesson.title.rendered,
                              postContent: lesson.content?.rendered || "",
                              postAudioSrc:
                                lesson.meta?.["the-audio-of-the-lesson"] || "",
                              postDate:
                                lesson.meta?.["date-of-the-lesson"] || "",
                              categorayId: id,
                              categorayName: category?.name || "",
                              searchQuery: searchQuery
                            }
                          }}
                        >
                          <Pressable className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors shadow-sm">
                            <View className="flex flex-row-reverse items-start justify-between">
                              <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-900 dark:text-white text-right dir-rtl mb-2 leading-relaxed">
                                  {lesson.title.rendered}
                                </Text>
                                <View className="flex flex-row-reverse items-center flex-wrap gap-3">
                                  {lesson.meta?.["date-of-the-lesson"] && (
                                    <View className="flex flex-row-reverse items-center">
                                      <Text className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                                        {lesson.meta?.["date-of-the-lesson"]}
                                      </Text>
                                    </View>
                                  )}
                                  {lesson.meta?.["date-of-the-lesson"] && (
                                    <View className="flex flex-row-reverse items-center">
                                      <Text className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                                        {formatPersianDate(
                                          lesson.meta?.["date-of-the-lesson"]
                                        )}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        </Link>
                      </View>
                    ))}
                  </View>
                )
              ) : loading ? (
                <LoadingSpinner />
              ) : (
                // Regular Posts List
                <View className="gap-y-3">
                  {posts.map((lesson, index) => {
                    // Calculate the correct lesson number across pages
                    const lessonNumber = (page - 1) * 20 + index + 1

                    return (
                      <Link
                        asChild
                        href={{
                          pathname: "/lessons/[id]" as any,
                          params: {
                            id: lesson.id.toString(),
                            postTitle: lesson.title.rendered,
                            postContent: lesson.content?.rendered || "",
                            postAudioSrc:
                              lesson.meta?.["the-audio-of-the-lesson"] || "",
                            postDate: lesson.meta?.["date-of-the-lesson"] || "",
                            categorayId: id,
                            categorayName: category?.name || ""
                          }
                        }}
                        key={lesson.id}
                        className="flex flex-row-reverse items-center p-3 rounded-lg bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <Pressable className="flex flex-row-reverse items-center w-full">
                          <View className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ml-3 text-sm font-medium">
                            <Text>{lessonNumber}</Text>
                          </View>
                          <View className="flex-1">
                            <Text
                              className={`text-lg font-medium text-right dir-rtl ${
                                isLessonCompleted(lesson.id.toString())
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {lesson?.title?.rendered}
                            </Text>
                            <Text className="text-base text-gray-500 dark:text-gray-500 text-right dir-rtl">
                              {lesson.meta?.["date-of-the-lesson"] ||
                                "تاریخ نامشخص"}
                            </Text>
                          </View>
                          {isLessonCompleted(lesson.id.toString()) && (
                            <View className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check size={16} color="#fff" />
                            </View>
                          )}
                        </Pressable>
                      </Link>
                    )
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Pagination */}
        {!isSearching && !loading && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        )}

        {/* Search Pagination */}
        {isSearching && !searchLoading && searchTotalPages > 1 && (
          <Pagination
            page={searchPage}
            totalPages={searchTotalPages}
            setPage={handleSearchPageChange}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default Categories

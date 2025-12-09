import React, { useState } from "react"
import { Text, ScrollView, View, Pressable } from "react-native"
import { useLocalSearchParams, useNavigation } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { ChevronDown, ChevronUp } from "lucide-react-native"

import GlobalLoading from "@/components/global-loading"
import Pagination from "@/components/pagination"
import { useApi } from "@/context/api-context"
import { usePostsByCategory } from "@/hooks/use-posts-by-category"
import GlobalError from "@/components/global-error"
import LessonCard from "@/components/lesson-card"

const Categories = () => {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const { categories } = useApi()
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const category = categories.find(cat => cat.id === Number(id))

  const { posts, loading, error, page, totalPages, setPage } =
    usePostsByCategory(id)

  React.useEffect(() => {
    if (category) {
      navigation.setOptions({ title: category.name })
    }
  }, [category, navigation])

  if (error || !category) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <GlobalError type="general" message={error || "Category not found"} />
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
              <Pressable
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="flex flex-row-reverse items-center justify-between mb-2"
              >
                <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right dir-rtl">
                  در مورد درس
                </Text>
                {isDescriptionExpanded ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
              </Pressable>
              {isDescriptionExpanded && (
                <Text className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-right dir-rtl">
                  {category?.description}
                </Text>
              )}
            </View>

            {/* Posts */}
            <View>
              <View className="flex flex-row-reverse items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-right dir-rtl">
                  جلسات
                </Text>
              </View>
              {loading ? (
                <GlobalLoading
                  compact
                  message="در حال بارگذاری درس‌ها..."
                  type="data"
                />
              ) : posts.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-500 dark:text-gray-400 text-center text-base">
                    هیچ درسی در این درس یافت نشد
                  </Text>
                </View>
              ) : (
                // Regular Posts List
                <View className="gap-y-3">
                  {posts.map((lesson, index) => {
                    return (
                      <LessonCard
                        key={index}
                        {...lesson}
                        index={index}
                        page={page}
                      />
                    )
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={newPage => setPage(newPage)}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default Categories

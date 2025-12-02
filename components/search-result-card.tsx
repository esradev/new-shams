import React from "react"
import { View, Text, Pressable } from "react-native"
import { Link } from "expo-router"
import { Clock, Calendar } from "lucide-react-native"
import { PostType } from "@/hooks/use-posts-by-category"
import { useApi } from "@/context/api-context"
import { formatPersianDate } from "@/utils/date-utils"

interface SearchResultCardProps {
  post: PostType
  searchQuery?: string
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  post,
  searchQuery
}) => {
  const { categories } = useApi()

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, "gi"))
    return parts.map((part, index) => (
      <Text
        key={index}
        className={
          part.toLowerCase() === query.toLowerCase()
            ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100"
            : ""
        }
      >
        {part}
      </Text>
    ))
  }

  // Find the category name from the post's categories
  const postCategory =
    post.categories && post.categories.length > 0
      ? categories.find(cat => cat.id === post.categories[0])
      : null

  // Format the date properly
  const formattedDate = post.meta?.["date-of-the-lesson"] || null

  return (
    <Link
      asChild
      href={{
        pathname: "/lessons/[id]" as any,
        params: {
          id: post.id.toString(),
          postTitle: post.title.rendered,
          postContent: post.content?.rendered || "",
          postAudioSrc: post.meta?.["the-audio-of-the-lesson"] || "",
          postDate: formattedDate || "",
          categorayId: postCategory?.id?.toString() || "",
          categorayName: postCategory?.name || "عمومی",
          searchQuery: searchQuery || ""
        }
      }}
    >
      <Pressable className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors shadow-sm">
        <View className="flex flex-row-reverse items-start justify-between">
          <View className="flex-1">
            {/* Category Badge */}
            {postCategory && (
              <View className="mb-2">
                <Text className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full self-end">
                  {postCategory.name}
                </Text>
              </View>
            )}

            {/* Title */}
            <Text className="text-lg font-semibold text-gray-900 dark:text-white text-right dir-rtl mb-2 leading-relaxed">
              {searchQuery
                ? highlightText(post.title.rendered, searchQuery)
                : post.title.rendered}
            </Text>

            {/* Metadata Row */}
            <View className="flex flex-row-reverse items-center flex-wrap gap-3">
              {/* Duration */}
              {post.duration && (
                <View className="flex flex-row-reverse items-center">
                  <Clock size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                    {post.duration}
                  </Text>
                </View>
              )}

              {/* Date */}
              {formattedDate && (
                <View className="flex flex-row-reverse items-center">
                  <Calendar size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mr-1">
                    {formatPersianDate(formattedDate)}
                  </Text>
                </View>
              )}

              {/* Audio indicator */}
              {post.meta?.["the-audio-of-the-lesson"] && (
                <View className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Text className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                    صوتی
                  </Text>
                </View>
              )}

              {/* Status indicator if completed */}
              {post.completed && (
                <View className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <Text className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    تکمیل شده
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Arrow indicator */}
          <View className="mr-3 mt-1">
            <View className="w-2 h-2 rounded-full bg-emerald-500"></View>
          </View>
        </View>
      </Pressable>
    </Link>
  )
}

export default SearchResultCard

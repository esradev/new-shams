import React from "react"
import { View, Text, Pressable } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"

interface PaginationProps {
  page: number
  totalPages: number
  setPage: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  setPage
}) => {
  const canGoBack = page > 1
  const canGoForward = page < totalPages

  if (totalPages <= 1) {
    return null
  }

  return (
    <View className="flex flex-row-reverse items-center justify-center gap-x-3 py-4 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Previous Button */}
      <Pressable
        onPress={() => canGoBack && setPage(page - 1)}
        disabled={!canGoBack}
        className={`px-3 py-2 rounded-md ${
          canGoBack
            ? "bg-emerald-600 active:bg-emerald-700"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <View className="flex flex-row items-center gap-x-1">
          <Text
            className={`text-sm font-medium ${
              canGoBack ? "text-white" : "text-gray-500"
            }`}
          >
            قبلی
          </Text>
          <ChevronRight size={14} color={canGoBack ? "white" : "#9CA3AF"} />
        </View>
      </Pressable>

      {/* Page Info */}
      <Text className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {page} از {totalPages}
      </Text>

      {/* Next Button */}
      <Pressable
        onPress={() => canGoForward && setPage(page + 1)}
        disabled={!canGoForward}
        className={`px-3 py-2 rounded-md ${
          canGoForward
            ? "bg-emerald-600 active:bg-emerald-700"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <View className="flex flex-row items-center gap-x-1">
          <ChevronLeft size={14} color={canGoForward ? "white" : "#9CA3AF"} />
          <Text
            className={`text-sm font-medium ${
              canGoForward ? "text-white" : "text-gray-500"
            }`}
          >
            بعدی
          </Text>
        </View>
      </Pressable>
    </View>
  )
}

export default Pagination

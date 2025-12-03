import React from "react"
import { View, Text } from "react-native"
import { useCoursesProgress } from "@/hooks/use-courses-progress"

export default function ProgressBadge() {
  const { coursesInProgress, loading } = useCoursesProgress()

  if (loading || coursesInProgress.length === 0) {
    return null
  }

  return (
    <View className="absolute -top-1 -right-1 bg-emerald-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      <Text className="text-white text-xs font-bold">
        {coursesInProgress.length > 99 ? "99+" : coursesInProgress.length}
      </Text>
    </View>
  )
}

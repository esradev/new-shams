import React from "react"
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react-native"
import { router } from "expo-router"
import { useColorScheme } from "nativewind"

import { useCoursesProgress } from "@/hooks/use-courses-progress"
import GlobalLoading from "@/components/global-loading"

export default function MyProgressPage() {
  const { colorScheme } = useColorScheme()
  const { coursesInProgress, statistics, loading } = useCoursesProgress()

  const handleContinueLearning = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: `/categories/[id]`,
      params: { id: categoryId, name: categoryName }
    })
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} دقیقه پیش`
    if (hours < 24) return `${hours} ساعت پیش`
    return `${days} روز پیش`
  }

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
          <GlobalLoading message="کمی صبر کنید" description="در حال بارگذاری پیشرفت شما..." type="data" />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                // Refresh logic if needed
              }}
              tintColor={colorScheme === "dark" ? "#78716c" : "#57534e"}
            />
          }
        >
          {/* Header Section */}
          <View className="mb-8">
            <View className="flex flex-row items-center justify-center gap-3 mb-4">
              <TrendingUp
                size={32}
                color={colorScheme === "dark" ? "#059669" : "#047857"}
              />
              <Text className="text-3xl font-bold text-stone-900 dark:text-stone-100 text-center">
                ادامه مطالعه
              </Text>
            </View>

            {statistics.totalLessonsCompleted > 0 && (
              <View className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-6 mb-6">
                <View className="flex flex-row items-center justify-center gap-4">
                  <View className="items-center">
                    <Text className="text-3xl font-bold text-white mb-1">
                      {statistics.totalLessonsCompleted}
                    </Text>
                    <Text className="text-emerald-100 text-sm">
                      درس تکمیل شده
                    </Text>
                  </View>
                  <CheckCircle size={24} color="#ffffff" />
                  <View className="items-center">
                    <Text className="text-3xl font-bold text-white mb-1">
                      {coursesInProgress.length}
                    </Text>
                    <Text className="text-emerald-100 text-sm">
                      دوره در حال مطالعه
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Courses in Progress */}
          {coursesInProgress.length > 0 ? (
            <>
              <Text className="text-xl font-semibold text-stone-900 dark:text-stone-100 text-right mb-4">
                دوره‌های در حال مطالعه
              </Text>

              <View className="space-y-4">
                {coursesInProgress.map(course => (
                  <View
                    key={course.categoryId}
                    className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden"
                  >
                    {/* Progress bar */}
                    <View className="h-1 bg-stone-200 dark:bg-stone-700">
                      <View
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </View>

                    <View className="p-6">
                      {/* Course Header */}
                      <View className="flex flex-row items-start justify-between mb-4">
                        <Pressable
                          onPress={() =>
                            handleContinueLearning(
                              course.categoryId,
                              course.categoryName
                            )
                          }
                          className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 px-4 py-2 rounded-xl flex flex-row items-center gap-2"
                        >
                          <Text className="text-white font-medium">
                            ادامه مطالعه
                          </Text>
                          <Play size={16} color="#ffffff" />
                        </Pressable>

                        <View className="flex-1 mr-4">
                          <Text className="text-xl font-bold text-stone-900 dark:text-stone-100 text-right mb-2">
                            {course.categoryName}
                          </Text>

                          <View className="flex flex-row items-center justify-end gap-3 mb-2">
                            <Text className="text-stone-600 dark:text-stone-400 text-sm">
                              {course.completedLessons} از {course.totalLessons}{" "}
                              درس
                            </Text>
                            <BookOpen
                              size={16}
                              color={
                                colorScheme === "dark" ? "#78716c" : "#57534e"
                              }
                            />
                          </View>

                          <View className="flex flex-row items-center justify-end gap-2">
                            <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                              {course.progressPercentage}% تکمیل شده
                            </Text>
                            <CheckCircle size={14} color="#059669" />
                          </View>
                        </View>
                      </View>

                      {/* Last Completed Lesson */}
                      {course.lastCompletedLesson && (
                        <View className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4">
                          <View className="flex flex-row items-center justify-end gap-2 mb-2">
                            <Text className="text-stone-600 dark:text-stone-400 text-xs">
                              آخرین درس تکمیل شده:
                            </Text>
                            <Clock
                              size={12}
                              color={
                                colorScheme === "dark" ? "#78716c" : "#57534e"
                              }
                            />
                          </View>

                          <Text className="text-stone-900 dark:text-stone-100 font-medium text-right mb-1">
                            {course.lastCompletedLesson.title}
                          </Text>

                          <Text className="text-stone-500 dark:text-stone-400 text-xs text-right">
                            {formatTimeAgo(
                              course.lastCompletedLesson.completedAt
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            /* Empty State */
            <View className="flex-1 items-center justify-center py-20">
              <View className="bg-stone-200 dark:bg-stone-800 rounded-full p-6 mb-6">
                <BookOpen
                  size={48}
                  color={colorScheme === "dark" ? "#78716c" : "#57534e"}
                />
              </View>

              <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100 text-center mb-4">
                هنوز شروع نکرده‌اید
              </Text>

              <Text className="text-stone-600 dark:text-stone-400 text-center mb-8 leading-relaxed max-w-sm">
                وقتی اولین درس خود را تکمیل کنید، پیشرفت شما در اینجا نمایش داده
                خواهد شد.
              </Text>

              <Pressable
                onPress={() => router.push("/")}
                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 px-6 py-3 rounded-xl flex flex-row items-center gap-3"
              >
                <Text className="text-white font-medium text-lg">
                  شروع یادگیری
                </Text>
                <BookOpen size={20} color="#ffffff" />
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

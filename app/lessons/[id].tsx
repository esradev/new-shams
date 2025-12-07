import React, { useMemo, useState, useEffect } from "react"
import { Link } from "expo-router"
import { View, Text, ScrollView } from "react-native"
import { BookOpen, Calendar, User } from "lucide-react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import RenderHTML from "react-native-render-html"
import { useLocalSearchParams } from "expo-router"

import AudioPlayer from "@/components/audio-player"
import LessonActions from "@/components/lesson-actions"
import { useColorScheme } from "nativewind"
import { useLesson } from "@/hooks/use-lesson"
import { createHighlightedHTMLAsync } from "@/utils/text-highlight"
import GlobalLoading from "@/components/global-loading"

export default function LessonPage() {
  const { id, categoryId, categoryName, searchQuery } = useLocalSearchParams()
  const { colorScheme } = useColorScheme()
  const { lesson, loading, error } = useLesson(id)

  const [processedContent, setProcessedContent] = useState<string>("")
  const [contentLoading, setContentLoading] = useState(false)

  // Process content with highlighting asynchronously
  useEffect(() => {
    if (!lesson?.content?.rendered) return

    const processContent = async () => {
      setContentLoading(true)
      try {
        let content = lesson.content.rendered

        // Apply search highlighting if search query exists
        if (
          searchQuery &&
          typeof searchQuery === "string" &&
          searchQuery.trim()
        ) {
          content = await createHighlightedHTMLAsync(
            content,
            searchQuery,
            colorScheme === "dark"
          )
        }

        setProcessedContent(content)
      } catch (err) {
        setProcessedContent(lesson.content.rendered)
      } finally {
        setContentLoading(false)
      }
    }

    processContent()
  }, [lesson?.content?.rendered, searchQuery, colorScheme])

  // Function to highlight text in title using React components
  const highlightTitle = useMemo(() => {
    if (!lesson?.title?.rendered) return ""

    const title = lesson.title.rendered
    const query = typeof searchQuery === "string" ? searchQuery : ""

    if (!query || !query.trim()) return title

    const parts = title.split(new RegExp(`(${query})`, "gi"))
    return parts.map((part, index) => (
      <Text
        key={index}
        className={
          part.toLowerCase() === query.toLowerCase()
            ? "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded"
            : ""
        }
      >
        {part}
      </Text>
    ))
  }, [lesson?.title?.rendered, searchQuery])

  // Loading state
  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
          <GlobalLoading
            message="کمی صبر کنید"
            description="در حال بارگذاری درس..."
            type="data"
          />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  // Error state
  if (error || !lesson) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-red-500 text-lg font-bold text-center mb-4">
              خطا در بارگذاری درس
            </Text>
            <Text className="text-stone-600 dark:text-stone-400 text-center">
              {error || "درس یافت نشد"}
            </Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
        {/* Header */}
        <View className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-3">
          <View className="flex flex-row items-center justify-end">
            <View className="flex flex-row items-center gap-2">
              <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
                {lesson.title.rendered}
              </Text>
              <Text className="text-stone-500 dark:text-stone-500">{"<"}</Text>

              <Link href={`/categories/${categoryId}`}>
                <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {categoryName}
                </Text>
              </Link>
              <Text className="text-stone-500 dark:text-stone-500">{"<"}</Text>
              <Link href="/">
                <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  خانه
                </Text>
              </Link>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: lesson.meta?.["the-audio-of-the-lesson"] ? 160 : 40,
            paddingHorizontal: 16
          }}
        >
          {/* Lesson Header Card */}
          <View className="mt-6 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
            <View className="p-8">
              {/* Course Badge */}
              <View className="mb-6">
                <View className="flex flex-row items-center justify-end gap-3 bg-emerald-50 dark:bg-emerald-900/20 self-end rounded-full px-4 py-2">
                  <Text className="text-base font-medium text-emerald-700 dark:text-emerald-400">
                    {categoryName}
                  </Text>
                  <BookOpen
                    size={18}
                    color={colorScheme === "dark" ? "#059669" : "#047857"}
                  />
                </View>
              </View>

              {/* Title */}
              <Text className="text-3xl font-bold text-stone-900 dark:text-stone-100 text-right mb-6 leading-relaxed">
                {searchQuery &&
                typeof searchQuery === "string" &&
                searchQuery.trim()
                  ? highlightTitle
                  : lesson.title.rendered}
              </Text>

              {/* Meta Information */}
              <View className="flex flex-col gap-4">
                <View className="flex flex-row items-center justify-end gap-3">
                  <Text className="text-base text-stone-600 dark:text-stone-400">
                    آیت الله حسینی آملی (حفظه الله)
                  </Text>
                  <User
                    size={16}
                    color={colorScheme === "dark" ? "#78716c" : "#57534e"}
                  />
                </View>

                {lesson.meta?.["date-of-the-lesson"] && (
                  <View className="flex flex-row items-center justify-end gap-3">
                    <Text className="text-base text-stone-600 dark:text-stone-400">
                      {lesson.meta["date-of-the-lesson"]}
                    </Text>
                    <Calendar
                      size={16}
                      color={colorScheme === "dark" ? "#78716c" : "#57534e"}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Content Card */}
          <View className="mt-6 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800">
            <View className="p-4">
              <View className="mb-6">
                <Text className="text-xl font-semibold text-stone-900 dark:text-stone-100 text-right">
                  محتوای درس
                </Text>
                <View className="h-px bg-stone-200 dark:bg-stone-700 mt-3" />
              </View>

              {searchQuery &&
                typeof searchQuery === "string" &&
                searchQuery.trim() && (
                  <View className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-r-4 border-yellow-400 dark:border-yellow-500">
                    <Text className="text-sm text-yellow-800 dark:text-yellow-200 text-right dir-rtl">
                      نتایج جستجو برای: "{searchQuery}"
                    </Text>
                  </View>
                )}

              {/* Content Loading State */}
              {contentLoading ? (
                <GlobalLoading compact message="در حال پردازش محتوا..." />
              ) : (
                <RenderHTML
                  source={{
                    html:
                      processedContent ||
                      lesson.content?.rendered ||
                      `<div style="text-align: right; padding: 20px;">
                      <p style="color: #78716c; font-style: italic;">
                        متأسفانه محتوای این جلسه در حال حاضر در دسترس نیست. لطفا بعدا دوباره مراجعه کنید.
                      </p>
                    </div>`
                  }}
                  contentWidth={350}
                  baseStyle={{
                    backgroundColor: "transparent",
                    fontSize: 18,
                    lineHeight: 32,
                    color: colorScheme === "dark" ? "#e7e5e4" : "#44403c",
                    textAlign: "right",
                    fontFamily: "System"
                  }}
                  tagsStyles={{
                    p: {
                      marginBottom: 20,
                      textAlign: "right"
                    },
                    h1: {
                      fontSize: 28,
                      fontWeight: "bold",
                      marginBottom: 20,
                      textAlign: "right",
                      color: colorScheme === "dark" ? "#f5f5f4" : "#1c1917"
                    },
                    h2: {
                      fontSize: 24,
                      fontWeight: "600",
                      marginBottom: 16,
                      textAlign: "right",
                      color: colorScheme === "dark" ? "#f5f5f4" : "#1c1917"
                    },
                    h3: {
                      fontSize: 20,
                      fontWeight: "600",
                      marginBottom: 12,
                      textAlign: "right",
                      color: colorScheme === "dark" ? "#f5f5f4" : "#1c1917"
                    },
                    ul: {
                      paddingLeft: 0,
                      paddingRight: 20,
                      textAlign: "right"
                    },
                    ol: {
                      paddingLeft: 0,
                      paddingRight: 20,
                      textAlign: "right"
                    },
                    li: {
                      marginBottom: 12,
                      textAlign: "right"
                    },
                    strong: {
                      fontWeight: "bold",
                      color: colorScheme === "dark" ? "#f5f5f4" : "#1c1917"
                    },
                    em: {
                      fontStyle: "italic"
                    },
                    blockquote: {
                      borderRightWidth: 4,
                      borderRightColor:
                        colorScheme === "dark" ? "#525252" : "#d6d3d1",
                      paddingRight: 20,
                      marginVertical: 20,
                      backgroundColor:
                        colorScheme === "dark" ? "#292524" : "#f7f7f6",
                      paddingVertical: 16,
                      textAlign: "right"
                    },
                    mark: {
                      backgroundColor:
                        colorScheme === "dark" ? "#451a03" : "#fef3c7",
                      color: colorScheme === "dark" ? "#fbbf24" : "#92400e",
                      padding: 4,
                      borderRadius: 4,
                      fontWeight: "600"
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* Lesson Actions */}
          <View className="mt-6">
            <LessonActions
              lessonId={lesson.id.toString()}
              lessonTitle={lesson.title.rendered}
              categoryId={categoryId as string}
              categoryName={categoryName as string}
              content={lesson.content?.rendered || ""}
              audioUrl={lesson.meta?.["the-audio-of-the-lesson"] || ""}
            />
          </View>

          {/* Spacing for bottom content */}
          <View className="h-8" />
        </ScrollView>

        {/* Audio Player */}
        {lesson.meta?.["the-audio-of-the-lesson"] && (
          <AudioPlayer
            id={lesson.id}
            postAudioSrc={lesson.meta["the-audio-of-the-lesson"]}
            postTitle={lesson.title.rendered}
            categoryId={Array.isArray(categoryId) ? categoryId[0] : categoryId}
            categoryName={
              Array.isArray(categoryName) ? categoryName[0] : categoryName
            }
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

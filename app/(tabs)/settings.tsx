import React, { useState } from "react"
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  FlatList,
  Platform
} from "react-native"
import { router } from "expo-router"
import * as FileSystem from "expo-file-system"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import {
  Activity,
  Download,
  Trash2,
  Heart,
  CheckCircle,
  Calendar,
  BarChart3,
  HardDrive,
  ChevronRight,
  Menu,
  Play,
  ChevronLeft
} from "lucide-react-native"

import {
  useLocalStorage,
  UserActivity,
  DownloadedLesson
} from "@/hooks/use-local-storage"
import { formatPersianDate } from "@/utils/date-utils"
import GlobalLoading from "@/components/global-loading"

type SettingsSection =
  | "overview"
  | "activities"
  | "downloads"
  | "cache"
  | "preferences"

interface MenuItem {
  id: SettingsSection
  title: string
  icon: string
  description: string
}

export default function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("overview")
  const [refreshing, setRefreshing] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const {
    downloadedLessons,
    loading,
    getStatistics,
    removeFromDownloads,
    loadAllData
  } = useLocalStorage()

  const stats = getStatistics()

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadAllData()
    } finally {
      setRefreshing(false)
    }
  }

  // Check if FileSystem is available
  const isFileSystemAvailable = () => {
    try {
      return (
        Platform.OS !== "web" &&
        FileSystem &&
        typeof (FileSystem as any).documentDirectory !== "undefined" &&
        (FileSystem as any).documentDirectory !== null
      )
    } catch (error) {
      console.error("FileSystem is not available:", error)
      return false
    }
  }

  const handleDeleteDownload = async (
    lessonId: string,
    lessonTitle: string
  ) => {
    Alert.alert(
      "حذف دانلود",
      `آیا می‌خواهید "${lessonTitle}" را از دانلودها حذف کنید؟`,
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove from device storage
              if (isFileSystemAvailable()) {
                const fileName = `audio_${lessonId}.mp3`
                const localUri = `${
                  (FileSystem as any).documentDirectory
                }${fileName}`

                const fileInfo = await FileSystem.getInfoAsync(localUri)
                if (fileInfo.exists) {
                  await FileSystem.deleteAsync(localUri)
                }
              }

              // Remove from local storage
              await removeFromDownloads(lessonId)
            } catch (error) {
              console.error("Error deleting download:", error)
              Alert.alert("خطا", "مشکلی در حذف فایل پیش آمد")
            }
          }
        }
      ]
    )
  }

  const handleClearAllDownloads = () => {
    Alert.alert(
      "حذف تمام دانلودها",
      "آیا می‌خواهید تمام فایل‌های دانلود شده را حذف کنید؟ این عمل غیرقابل بازگشت است.",
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "حذف همه",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove all downloaded files from device storage
              for (const lesson of downloadedLessons) {
                try {
                  if (isFileSystemAvailable()) {
                    const fileName = `audio_${lesson.id}.mp3`
                    const localUri = `${
                      (FileSystem as any).documentDirectory
                    }${fileName}`

                    const fileInfo = await FileSystem.getInfoAsync(localUri)
                    if (fileInfo.exists) {
                      await FileSystem.deleteAsync(localUri)
                    }
                  }
                } catch (error) {
                  console.error(
                    `Error deleting file for lesson ${lesson.id}:`,
                    error
                  )
                }
              }

              // Clear from local storage
              for (const lesson of downloadedLessons) {
                await removeFromDownloads(lesson.id)
              }

              Alert.alert("موفق", "تمام فایل‌های دانلود شده حذف شدند")
            } catch (error) {
              console.error("Error clearing all downloads:", error)
              Alert.alert("خطا", "مشکلی در حذف فایل‌ها پیش آمد")
            }
          }
        }
      ]
    )
  }

  const handleOpenLesson = (lesson: DownloadedLesson) => {
    router.push({
      pathname: "/lessons/[id]",
      params: {
        id: lesson.id,
        categorayId: lesson.categoryId,
        categorayName: lesson.categoryName,
        postTitle: lesson.title,
        postContent: lesson.content || "",
        postAudioSrc: lesson.audioUrl || "",
        postDate: new Date(lesson.downloadedAt).toISOString()
      }
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 بایت"
    const k = 1024
    const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatActivityTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} روز پیش`
    if (hours > 0) return `${hours} ساعت پیش`
    if (minutes > 0) return `${minutes} دقیقه پیش`
    return "همین الان"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "completed":
        return <CheckCircle size={16} color="#10B981" />
      case "favorited":
        return <Heart size={16} color="#EC4899" />
      case "downloaded":
        return <Download size={16} color="#3B82F6" />
      default:
        return <Activity size={16} color="#6B7280" />
    }
  }

  const getActivityText = (type: string) => {
    switch (type) {
      case "completed":
        return "تکمیل شد"
      case "favorited":
        return "به علاقه‌مندی‌ها اضافه شد"
      case "downloaded":
        return "دانلود شد"
      default:
        return "فعالیت"
    }
  }

  const menuItems: MenuItem[] = [
    {
      id: "overview",
      title: "خلاصه",
      icon: "BarChart3",
      description: "آمار و اطلاعات کلی"
    },
    {
      id: "downloads",
      title: "دانلودها",
      icon: "Download",
      description: "فایل‌های دانلود شده"
    }
  ]

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.id}
      onPress={() => {
        setActiveSection(item.id)
        setIsDrawerOpen(false)
      }}
      className={`p-4 mx-2 my-1 rounded-xl transition-colors ${
        activeSection === item.id
          ? "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
      }`}
    >
      <View className="flex flex-row-reverse items-center justify-between">
        <View className="flex flex-row-reverse items-center">
          <View
            className={`p-2 rounded-lg ${
              activeSection === item.id
                ? "bg-emerald-500"
                : "bg-gray-200 dark:bg-gray-600"
            }`}
          >
            {item.id === "overview" && (
              <BarChart3
                size={18}
                color={activeSection === item.id ? "#fff" : "#6B7280"}
              />
            )}
            {item.id === "downloads" && (
              <Download
                size={18}
                color={activeSection === item.id ? "#fff" : "#6B7280"}
              />
            )}
          </View>
          <View className="mr-3">
            <Text
              className={`text-base font-semibold text-right dir-rtl ${
                activeSection === item.id
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl mt-0.5">
              {item.description}
            </Text>
          </View>
        </View>
        {activeSection === item.id && (
          <View className="bg-emerald-500 rounded-full p-1">
            <ChevronLeft size={12} color="#fff" />
          </View>
        )}
      </View>
    </Pressable>
  )

  const renderSidebar = () => (
    <View className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl">
      <View className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800">
        <View className="flex flex-row-reverse items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl">
              تنظیمات
            </Text>
            <View className="w-8 h-1 bg-emerald-500 rounded-full mt-1"></View>
          </View>
          {isDrawerOpen && (
            <Pressable
              onPress={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 md:hidden"
              hitSlop={8}
            >
              <ChevronRight size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>
        <Text className="text-sm text-gray-600 dark:text-gray-300 text-right dir-rtl">
          مدیریت برنامه و حساب کاربری
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-2">
        {menuItems.map(renderMenuItem)}
      </ScrollView>
    </View>
  )

  const renderOverview = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Statistics Cards */}
      <View className="px-4 py-6 space-y-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl mb-4">
          آمار کلی
        </Text>

        <View className="grid grid-cols-2 gap-4">
          <View className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <View className="flex flex-row-reverse items-center justify-between">
              <CheckCircle size={24} color="#10B981" />
              <View className="flex-1">
                <Text className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 text-right">
                  {stats.totalCompleted}
                </Text>
                <Text className="text-sm text-emerald-600 dark:text-emerald-500 text-right">
                  درس تکمیل شده
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl border border-pink-200 dark:border-pink-800">
            <View className="flex flex-row-reverse items-center justify-between">
              <Heart size={24} color="#EC4899" />
              <View className="flex-1">
                <Text className="text-2xl font-bold text-pink-700 dark:text-pink-400 text-right">
                  {stats.totalFavorites}
                </Text>
                <Text className="text-sm text-pink-600 dark:text-pink-500 text-right">
                  علاقه‌مندی
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <View className="flex flex-row-reverse items-center justify-between">
              <Download size={24} color="#3B82F6" />
              <View className="flex-1">
                <Text className="text-2xl font-bold text-blue-700 dark:text-blue-400 text-right">
                  {stats.totalDownloads}
                </Text>
                <Text className="text-sm text-blue-600 dark:text-blue-500 text-right">
                  دانلود شده
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <View className="flex flex-row-reverse items-center justify-between">
              <HardDrive size={24} color="#6B7280" />
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-700 dark:text-gray-300 text-right">
                  {formatBytes(stats.totalDownloadSize)}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 text-right">
                  فضای مصرفی
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View className="mt-6">
          <Text className="text-xl font-semibold text-gray-900 dark:text-white text-right dir-rtl mb-4">
            فعالیت‌های اخیر
          </Text>
          {stats.recentActivities.length === 0 ? (
            <View className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl text-center">
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                هیچ فعالیتی ثبت نشده است
              </Text>
            </View>
          ) : (
            <View className="space-y-2">
              {stats.recentActivities
                .slice(0, 5)
                .map((activity: UserActivity) => (
                  <View
                    key={activity.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <View className="flex flex-row-reverse items-center">
                      {getActivityIcon(activity.type)}
                      <View className="flex-1 mr-3">
                        <Text className="text-gray-900 dark:text-white font-medium text-right dir-rtl">
                          {activity.lessonTitle}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-right dir-rtl">
                          {getActivityText(activity.type)} •{" "}
                          {formatActivityTime(activity.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )

  const renderDownloads = () => (
    <FlatList
      data={downloadedLessons}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <View className="flex flex-row-reverse items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl">
              دانلودها ({downloadedLessons.length})
            </Text>
            {downloadedLessons.length > 0 && (
              <Pressable
                onPress={handleClearAllDownloads}
                className="bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                <Text className="text-red-600 dark:text-red-400 text-sm font-medium">
                  حذف همه
                </Text>
              </Pressable>
            )}
          </View>

          {downloadedLessons.length > 0 && (
            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <View className="flex flex-row-reverse items-center justify-between">
                <View>
                  <Text className="text-blue-900 dark:text-blue-100 font-medium text-right dir-rtl">
                    مجموع فضای مصرفی
                  </Text>
                  <Text className="text-blue-600 dark:text-blue-300 text-sm text-right dir-rtl mt-1">
                    {formatBytes(
                      downloadedLessons.reduce(
                        (total, lesson) => total + (lesson.size || 0),
                        0
                      )
                    )}
                  </Text>
                </View>
                <HardDrive size={24} color="#3B82F6" />
              </View>
            </View>
          )}
        </View>
      }
      ListEmptyComponent={
        <View className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl items-center">
          <Download size={48} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-4 text-lg">
            هیچ درسی دانلود نشده است
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-center mt-2 text-sm">
            {isFileSystemAvailable()
              ? "برای دانلود درس‌ها، روی دکمه دانلود در صفحه درس کلیک کنید"
              : "قابلیت دانلود در این پلتفرم پشتیبانی نمی‌شود"}
          </Text>
        </View>
      }
      renderItem={({ item: lesson }) => (
        <Pressable
          onPress={() => handleOpenLesson(lesson)}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <View className="flex flex-row-reverse items-start justify-between">
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-white font-medium text-right dir-rtl mb-1">
                {lesson.title}
              </Text>
              <Text className="text-sm text-emerald-600 dark:text-emerald-400 text-right dir-rtl mb-2">
                {lesson.categoryName}
              </Text>
              <View className="flex flex-row-reverse items-center">
                <Calendar size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl mr-1">
                  {formatPersianDate(lesson.downloadedAt.toString())}
                </Text>
                {lesson.size && (
                  <>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mx-2">
                      •
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(lesson.size)}
                    </Text>
                  </>
                )}
                <Text className="text-xs text-gray-400 dark:text-gray-500 mx-2">
                  •
                </Text>
                <View className="flex flex-row-reverse items-center">
                  <Text className="text-xs text-emerald-600 dark:text-emerald-400 mr-1">
                    دانلود شده
                  </Text>
                  <Download size={10} color="#10B981" />
                </View>
              </View>
            </View>
            <View className="flex flex-row items-center gap-2">
              <Pressable
                onPress={() => handleOpenLesson(lesson)}
                className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 active:scale-95"
              >
                <Play size={16} color="#3B82F6" />
              </Pressable>
              <Pressable
                onPress={() => handleDeleteDownload(lesson.id, lesson.title)}
                className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 active:scale-95"
              >
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    />
  )

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <GlobalLoading message="در حال بارگذاری تنظیمات..." />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 flex-row-reverse">
          {/* Desktop Sidebar - Hidden on mobile */}
          <View className="hidden md:flex">{renderSidebar()}</View>

          {/* Main Content */}
          <View className="flex-1">
            {/* Header */}
            <View className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <View className="flex flex-row-reverse items-center justify-between">
                <Pressable
                  onPress={() => setIsDrawerOpen(true)}
                  className="flex flex-row align-middle gap-2 p-2 bg-stone-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                  hitSlop={8}
                >
                  <Menu size={20} color="#6B7280" />
                  <Text className="text-gray-700">منوی تنظیمات</Text>
                </Pressable>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white text-right dir-rtl">
                  {menuItems.find(item => item.id === activeSection)?.title}
                </Text>
              </View>
            </View>

            {/* Content Area */}
            <View className="flex-1">
              {activeSection === "overview" && renderOverview()}
              {activeSection === "downloads" && renderDownloads()}
            </View>
          </View>
        </View>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <View className="absolute inset-0 z-50 md:hidden">
            <Pressable
              onPress={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            <View className="absolute right-0 top-0 bottom-0 w-80">
              {renderSidebar()}
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  FlatList
} from "react-native"
import { router } from "expo-router"
import * as FileSystem from "expo-file-system"
import { Platform } from "react-native"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import {
  User,
  Activity,
  Download,
  Trash2,
  Heart,
  CheckCircle,
  Calendar,
  BarChart3,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Info,
  HardDrive,
  Clock,
  Database,
  ChevronRight,
  Menu,
  Play,
  FolderOpen
} from "lucide-react-native"

import {
  useLocalStorage,
  UserActivity,
  DownloadedLesson
} from "@/hooks/use-local-storage"
import { useCache, CacheStats } from "@/context/cache-context"
import { formatPersianDate } from "@/utils/date-utils"
import LoadingSpinner from "@/components/loading-spinner"

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
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const {
    completedLessons,
    favoriteLessons,
    downloadedLessons,
    userActivities,
    loading,
    getStatistics,
    removeFromDownloads,
    clearAllData,
    loadAllData
  } = useLocalStorage()

  const { getCacheStats, clearCache } = useCache()

  const stats = getStatistics()

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadAllData()
      const stats = await getCacheStats()
      setCacheStats(stats)
    } finally {
      setRefreshing(false)
    }
  }

  // Load cache stats on mount and section change
  useEffect(() => {
    const loadCacheStats = async () => {
      const stats = await getCacheStats()
      setCacheStats(stats)
    }
    loadCacheStats()
  }, [activeSection])

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
              Alert.alert("خطا", "مشکلی در حذف فایل پیش آمد")
            }
          }
        }
      ]
    )
  }

  const handleClearAllData = () => {
    Alert.alert(
      "حذف تمام اطلاعات",
      "آیا می‌خواهید تمام اطلاعات (تکمیل شده‌ها، علاقه‌مندی‌ها، دانلودها و فعالیت‌ها) را حذف کنید؟ این عمل غیرقابل بازگشت است.",
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "حذف همه",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData()
              Alert.alert("موفق", "تمام اطلاعات حذف شد")
            } catch (error) {
              Alert.alert("خطا", "مشکلی در حذف اطلاعات پیش آمد")
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
      id: "activities",
      title: "فعالیت‌ها",
      icon: "Activity",
      description: "تاریخچه فعالیت‌های شما"
    },
    {
      id: "downloads",
      title: "دانلودها",
      icon: "Download",
      description: "فایل‌های دانلود شده"
    },
    {
      id: "cache",
      title: "کش",
      icon: "Database",
      description: "مدیریت حافظه کش"
    },
    {
      id: "preferences",
      title: "تنظیمات",
      icon: "SettingsIcon",
      description: "تنظیمات عمومی برنامه"
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
            {item.id === "activities" && (
              <Activity
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
            {item.id === "cache" && (
              <Database
                size={18}
                color={activeSection === item.id ? "#fff" : "#6B7280"}
              />
            )}
            {item.id === "preferences" && (
              <SettingsIcon
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
            <ChevronRight size={12} color="#fff" />
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

  const renderCache = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl mb-6">
          کش داده‌ها
        </Text>

        {/* Cache Statistics */}
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex flex-row-reverse items-center">
              <Database size={20} color="#6B7280" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                آمار کش
              </Text>
            </View>
          </View>
          <View className="p-4 space-y-4">
            <View className="flex flex-row-reverse items-center justify-between">
              <Text className="text-gray-900 dark:text-white font-medium">
                تعداد ورودی‌ها
              </Text>
              <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {cacheStats?.totalEntries || 0}
              </Text>
            </View>
            <View className="flex flex-row-reverse items-center justify-between">
              <Text className="text-gray-900 dark:text-white font-medium">
                حجم کل
              </Text>
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                {formatBytes(cacheStats?.totalSize || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cache Entries */}
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex flex-row-reverse items-center justify-between">
              <View className="flex flex-row-reverse items-center">
                <Clock size={20} color="#6B7280" />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                  ورودی‌های کش
                </Text>
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {cacheStats?.entries.length || 0} مورد
              </Text>
            </View>
          </View>
          <View className="max-h-96">
            <ScrollView>
              {cacheStats?.entries && cacheStats.entries.length > 0 ? (
                cacheStats.entries.slice(0, 20).map((entry, index) => (
                  <View
                    key={index}
                    className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <Text className="text-gray-900 dark:text-white font-medium text-right dir-rtl mb-1">
                      {entry.url.split("/").pop() || "داده‌های API"}
                    </Text>
                    <View className="flex flex-row-reverse items-center justify-between">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {formatBytes(entry.size)}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {formatActivityTime(entry.timestamp)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="p-6 text-center">
                  <Text className="text-gray-500 dark:text-gray-400 text-center">
                    هیچ داده‌ای در کش وجود ندارد
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Cache Actions */}
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex flex-row-reverse items-center">
              <Trash2 size={20} color="#6B7280" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                مدیریت کش
              </Text>
            </View>
          </View>
          <View className="p-4">
            <Pressable
              onPress={() => {
                Alert.alert(
                  "پاک کردن کش",
                  "آیا می‌خواهید تمام داده‌های کش شده را پاک کنید؟ این کار باعث بارگذاری مجدد داده‌ها از سرور می‌شود.",
                  [
                    { text: "انصراف", style: "cancel" },
                    {
                      text: "پاک کردن",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await clearCache()
                          const newStats = await getCacheStats()
                          setCacheStats(newStats)
                          Alert.alert("موفق", "کش پاک شد")
                        } catch (error) {
                          Alert.alert("خطا", "مشکلی در پاک کردن کش پیش آمد")
                        }
                      }
                    }
                  ]
                )
              }}
              className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 active:scale-98"
            >
              <View className="flex flex-row-reverse items-center justify-center">
                <Trash2 size={20} color="#F97316" />
                <Text className="text-orange-600 dark:text-orange-400 font-medium mr-3">
                  پاک کردن کش
                </Text>
              </View>
              <Text className="text-sm text-orange-500 dark:text-orange-400 text-center mt-2">
                داده‌های کش شده از حافظه حذف می‌شوند
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  )

  const renderActivities = () => (
    <FlatList
      data={userActivities}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl mb-6">
          تمام فعالیت‌ها
        </Text>
      }
      ListEmptyComponent={
        <View className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl items-center">
          <Activity size={48} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-4 text-lg">
            هیچ فعالیتی ثبت نشده است
          </Text>
        </View>
      }
      renderItem={({ item: activity }) => (
        <View className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
          <View className="flex flex-row-reverse items-start">
            {getActivityIcon(activity.type)}
            <View className="flex-1 mr-3">
              <Text className="text-gray-900 dark:text-white font-medium text-right dir-rtl mb-1">
                {activity.lessonTitle}
              </Text>
              <Text className="text-sm text-emerald-600 dark:text-emerald-400 text-right dir-rtl">
                {activity.categoryName}
              </Text>
              <View className="flex flex-row-reverse items-center mt-2">
                <Clock size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl mr-1">
                  {formatActivityTime(activity.timestamp)}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500 mx-2">
                  •
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl">
                  {getActivityText(activity.type)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    />
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

  const renderPreferences = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl mb-6">
          تنظیمات
        </Text>

        {/* App Info */}
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex flex-row-reverse items-center">
              <Info size={20} color="#6B7280" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                اطلاعات برنامه
              </Text>
            </View>
          </View>
          <View className="p-4 space-y-3">
            <View className="flex flex-row-reverse items-center justify-between">
              <Text className="text-gray-900 dark:text-white">نسخه برنامه</Text>
              <Text className="text-gray-500 dark:text-gray-400">1.0.0</Text>
            </View>
            <View className="flex flex-row-reverse items-center justify-between">
              <Text className="text-gray-900 dark:text-white">
                تعداد کل دروس
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {stats.totalCompleted + stats.totalFavorites}
              </Text>
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <View className="p-4 border-b border-gray-200 dark:border-gray-700">
            <View className="flex flex-row-reverse items-center">
              <HardDrive size={20} color="#6B7280" />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                مدیریت داده‌ها
              </Text>
            </View>
          </View>
          <View className="p-4">
            <Pressable
              onPress={handleClearAllData}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-98"
            >
              <View className="flex flex-row-reverse items-center justify-center">
                <Trash2 size={20} color="#EF4444" />
                <Text className="text-red-600 dark:text-red-400 font-medium mr-3">
                  حذف تمام داده‌ها
                </Text>
              </View>
              <Text className="text-sm text-red-500 dark:text-red-400 text-center mt-2">
                شامل تکمیل شده‌ها، علاقه‌مندی‌ها و دانلودها
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  )

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <LoadingSpinner />
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
              {activeSection === "activities" && renderActivities()}
              {activeSection === "downloads" && renderDownloads()}
              {activeSection === "cache" && renderCache()}
              {activeSection === "preferences" && renderPreferences()}
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

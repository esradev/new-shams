import React, { useState } from "react"
import { View, Text, Pressable, Alert } from "react-native"
import { Check, Heart, CheckCircle, HeartHandshake } from "lucide-react-native"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface LessonActionsProps {
  lessonId: string
  lessonTitle: string
  categoryId: string
  categoryName: string
  content?: string
  audioUrl?: string
}

const LessonActions: React.FC<LessonActionsProps> = ({
  lessonId,
  lessonTitle,
  categoryId,
  categoryName,
  content = "",
  audioUrl = ""
}) => {
  const {
    isLessonCompleted,
    isLessonFavorited,
    markLessonCompleted,
    markLessonIncomplete,
    addToFavorites,
    removeFromFavorites
  } = useLocalStorage()

  const [loading, setLoading] = useState({
    completed: false,
    favorite: false
  })

  const completed = isLessonCompleted(lessonId)
  const favorited = isLessonFavorited(lessonId)

  const handleToggleCompleted = async () => {
    setLoading(prev => ({ ...prev, completed: true }))

    try {
      if (completed) {
        await markLessonIncomplete(lessonId)
      } else {
        await markLessonCompleted({
          id: lessonId,
          title: lessonTitle,
          categoryId,
          categoryName
        })
      }
    } catch (error) {
      Alert.alert("خطا", "مشکلی در ذخیره اطلاعات پیش آمد")
    } finally {
      setLoading(prev => ({ ...prev, completed: false }))
    }
  }

  const handleToggleFavorite = async () => {
    setLoading(prev => ({ ...prev, favorite: true }))

    try {
      if (favorited) {
        await removeFromFavorites(lessonId)
      } else {
        await addToFavorites({
          id: lessonId,
          title: lessonTitle,
          categoryId,
          categoryName,
          content,
          audioUrl
        })
      }
    } catch (error) {
      Alert.alert("خطا", "مشکلی در ذخیره اطلاعات پیش آمد")
    } finally {
      setLoading(prev => ({ ...prev, favorite: false }))
    }
  }

  return (
    <View className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <Text className="text-lg font-semibold text-gray-900 dark:text-white text-right dir-rtl mb-4">
        عملیات درس
      </Text>

      <View className="flex flex-row-reverse items-center justify-center gap-3">
        {/* Complete Button */}
        <Pressable
          onPress={handleToggleCompleted}
          disabled={loading.completed}
          className={`flex flex-row items-center px-4 py-3 rounded-xl transition-all duration-200 ${
            completed
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          } ${loading.completed ? "opacity-50" : "active:scale-95"}`}
        >
          {completed ? (
            <CheckCircle size={20} color="#ffffff" />
          ) : (
            <Check
              size={20}
              color={loading.completed ? "#9CA3AF" : "#6B7280"}
            />
          )}
          <Text
            className={`mr-2 font-medium ${
              completed ? "text-white" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {completed ? "تکمیل شده" : "علامت‌گذاری به‌عنوان تکمیل‌شده"}
          </Text>
        </Pressable>

        {/* Favorite Button */}
        <Pressable
          onPress={handleToggleFavorite}
          disabled={loading.favorite}
          className={`flex flex-row items-center px-4 py-3 rounded-xl transition-all duration-200 ${
            favorited
              ? "bg-pink-500 hover:bg-pink-600"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          } ${loading.favorite ? "opacity-50" : "active:scale-95"}`}
        >
          {favorited ? (
            <HeartHandshake size={20} color="#ffffff" />
          ) : (
            <Heart size={20} color={loading.favorite ? "#9CA3AF" : "#6B7280"} />
          )}
        </Pressable>
      </View>
    </View>
  )
}

export default LessonActions

import { View, Text, ScrollView, StatusBar } from "react-native"
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import { Href } from "expo-router"
import { useColorScheme } from "nativewind"

import CourseCard from "@/components/course-card"
import { useApi } from "@/context/api-context"
import GlobalError from "@/components/global-error"
import GlobalLoading from "@/components/global-loading"

export default function HomePage() {
  const { colorScheme } = useColorScheme()
  const { categories, loading, error } = useApi()

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 bg-white dark:bg-gray-900">
        {error ? (
          <GlobalError type="network" message={error?.message} />
        ) : loading ? (
          <GlobalLoading message="در حال آماده سازی برنامه" />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6">
              <View className="mb-8">
                <Text className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-right dir-rtl">
                  تمام دروس خارج
                </Text>
                <View className="grid grid-cols-1 gap-4">
                  {categories
                    .filter(category => category.parent !== 0)
                    .map(category => (
                      <CourseCard
                        key={category.id}
                        href={`/categories/${category.id}` as Href}
                        course={category}
                      />
                    ))}
                </View>
              </View>
            </View>
          </ScrollView>
        )}
        <StatusBar
          barStyle={colorScheme == "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme == "dark" ? "#1C1917" : "#F0FDF4"}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

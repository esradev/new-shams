import { View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Href } from "expo-router";
import { useColorScheme } from "nativewind";

import CategoryList from "@/components/category-list";
import CourseCard from "@/components/course-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useApi } from "@/context/api-context";

export default function HomePage() {
  const { colorScheme } = useColorScheme();
  const { categories, loading, error } = useApi();

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 bg-white dark:bg-gray-900">
        {error ? (
          <Text className="text-red-500 text-lg font-bold text-center mb-4 w-full">
            Error: {error?.message}
          </Text>
        ) : loading ? (
          <LoadingSpinner variant="courses" count={3} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6">
              <View className="mb-8">
                <Text className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-right dir-rtl">
                  موضوعات دروس
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex flex-row mr-2 flex-1 pb-2 scrollbar-hide text-right dir-rtl"
                >
                  {categories
                    .filter((category) => category.parent === 0)
                    .map((category) => (
                      <CategoryList
                        key={category.id}
                        href={`/categories/${category.id}` as Href}
                        category={category}
                      />
                    ))}
                </ScrollView>
              </View>

              <View className="mb-8">
                <Text className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-right dir-rtl">
                  تمام دروس خارج
                </Text>
                <View className="grid grid-cols-1 gap-4">
                  {categories
                    .filter((category) => category.parent !== 0)
                    .map((category) => (
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
  );
}

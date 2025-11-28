import { View, Text, ScrollView } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Href } from "expo-router";

import CourseCard from "@/components/course-card";
import LoadingSpinner from "@/components/loading-spinner";
import { useApi } from "@/context/api-context";

export default function Courses() {
  const { categories, loading, error } = useApi();

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex flex-1 bg-white dark:bg-gray-900">
        {error ? (
          <Text className="text-red-500 text-lg font-bold text-center mb-4 w-full">
            Error: {error?.message}
          </Text>
        ) : loading ? (
          <LoadingSpinner variant="courses" count={4} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="p-6">
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

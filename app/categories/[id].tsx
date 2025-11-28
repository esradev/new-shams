import React from "react";
import { Text, ScrollView, View, Pressable } from "react-native";
import { useLocalSearchParams, useNavigation, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";

import LoadingSpinner from "@/components/loading-spinner";
import { useApi } from "@/context/api-context";
import { usePostsByCategory } from "@/hooks/use-posts-by-category";

const Categories = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const { categories } = useApi();

  const category = categories.find((cat) => cat.id === Number(id));

  const { posts, loading, error, page, totalPages, setPage } =
    usePostsByCategory(id);

  React.useEffect(() => {
    if (category) {
      navigation.setOptions({ title: category.name });
    }
  }, [category]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error || !category) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 text-lg font-bold text-center mb-4 w-full">
          Error: {error || "Category not found"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="px-4 py-5">
          {/* Category Header */}
          <View className="flex flex-row-reverse justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl">
              {category?.name}
            </Text>
          </View>

          <View className="flex flex-row-reverse items-center mb-4">
            <Text className="text-sm text-right dir-rtl text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              درس خارج
            </Text>
            <Text className="mx-2 text-gray-400">•</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 text-right dir-rtl">
              آیت الله سید محمدرضا حسینی آملی (حفظه الله)
            </Text>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 text-right dir-rtl">
              در مورد درس
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-right dir-rtl">
              {category?.description}
            </Text>
          </View>

          {/* Posts */}
          <View>
            <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 text-right dir-rtl">
              جلسات
            </Text>
            <View className="gap-y-3">
              {posts.map((lesson, index) => (
                <Link
                  asChild
                  href={`/lessons/${lesson.id}`}
                  key={lesson.id}
                  className="flex flex-row-reverse items-center p-3 rounded-lg bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <Pressable className="flex flex-row-reverse items-center w-full">
                    <View className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ml-3 text-sm font-medium">
                      <Text>{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-lg font-medium text-right dir-rtl`}
                      >
                        {lesson?.title?.rendered}
                      </Text>
                      <Text className="text-base text-gray-500 dark:text-gray-500 text-right dir-rtl">
                        {lesson?.duration || "00:00"}
                      </Text>
                    </View>
                    {lesson?.completed && (
                      <View className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check size={16} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Categories;

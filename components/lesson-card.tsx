import { Link } from 'expo-router';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { Text } from 'react-native';
import { View } from 'react-native';
import { Pressable } from 'react-native';

interface Lesson {
  id: number;
  title: {
    rendered: string;
  };
  meta: {
    "date-of-the-lesson"?: string;
    "the-audio-of-the-lesson"?: string;
  };
  page: number;
  index: number;
  categoryId?:  string;
  categoryName?: string;
}

const LessonCard: React.FC<Lesson> = (lesson) => {
  const { id, title, meta, categoryId, categoryName, page, index } = lesson
  const lessonNumber = (page - 1) * 20 + index + 1

  return (
    <Link
      asChild
      href={{
        pathname: "/lessons/[id]" as any,
        params: {
          id: id.toString(),
          categoryId: categoryId,
          categoryName: categoryName || ""
        }
      }}
      key={id}
      className="flex flex-row-reverse items-center p-3 rounded-lg bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <Pressable className="flex flex-row-reverse items-center w-full">
        <View className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ml-3 text-sm font-medium">
          <Text>{lessonNumber}</Text>
        </View>
        <View className="flex-1">
          <Text
            className={`text-lg font-medium text-right dir-rtl ${
              // isLessonCompleted(id.toString())
              //   ? "text-emerald-700 dark:text-emerald-400" :
                 "text-gray-800 dark:text-gray-200"
            }`}
          >
            {title?.rendered}
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-500 text-right dir-rtl">
            {meta?.["date-of-the-lesson"] ||
              "تاریخ نامشخص"}
          </Text>
        </View>
        {/*{isLessonCompleted(id.toString()) && (
          <View className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={16} color="#fff" />
          </View>
        )}*/}
      </Pressable>
    </Link>
  );
};

export default LessonCard;

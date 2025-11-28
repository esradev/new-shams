import { Link } from "expo-router";
import { View, Text, Image } from "react-native";

interface FeaturedCourseProps {
  id: string;
  title: string;
  instructor: string;
  image: string;
  lessonsCount: number;
  duration: string;
  progress: number;
}

export default function FeaturedCourseCard({
  course,
}: {
  course: FeaturedCourseProps;
}) {
  return (
    <Link
      href={`/category/${course.id}`}
      className="block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
    >
      <View className="relative h-40">
        <Image
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="object-cover"
        />
        <View className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <View className="p-4">
            <Text className="text-white font-semibold text-lg mb-1">
              {course.title}
            </Text>
            <Text className="text-white/80 text-sm">{course.instructor}</Text>
          </View>
        </View>
      </View>

      <View className="p-4 bg-white dark:bg-gray-900">
        <View className="flex flex-row justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Text>{course.lessonsCount} lessons</Text>
          <Text>{course.duration}</Text>
        </View>

        <View>
          <View className="flex flex-row flex-1 justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <Text>Continue learning</Text>
            <Text>{course.progress}% complete</Text>
          </View>
          <View className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
              style={{ width: `${course.progress}%` }}
            ></View>
          </View>
        </View>
      </View>
    </Link>
  );
}

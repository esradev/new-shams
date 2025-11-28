import { Link, Href } from "expo-router";
import { BarChart, BookOpen, Clock } from "lucide-react-native";
import { Image, View, Text, Pressable } from "react-native";

interface CourseProps {
  href: Href;
  course: {
    id: number;
    name: string;
    description: string;
    count: number;
  };
}

export default function CourseCard({ href, course }: CourseProps) {
  return (
    <Link href={href} asChild>
      <Pressable className="flex flw-row flex-1 w-full items-start gap-3 p-3 rounded-lg border bg-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-700">
        <View className="flex flex-col flex-1 w-full">
          <Text className="font-medium text-xl text-gray-900 dark:text-white mb-1 line-clamp-2 text-right dir-rtl">
            {course.name}
          </Text>

          <Text className="text-gray-500 dark:text-gray-400 mb-2 text-right dir-rtl">
            {course.description.replace(/<[^>]+>/g, "").slice(0, 160) + "..."}
          </Text>
          <View className="flex flex-row-reverse items-center gap-2 my-4">
            <Image
              source={require("../assets/images/ostad.jpg")}
              className="w-10 h-10 rounded-full"
            />
            <Text className="text-sm text-gray-700 dark:text-gray-400 mb-2 text-right dir-rtl">
              آیت الله حسینی آملی (حفظه الله)
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-2 py-0.5">
              <Text className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                درس خارج
              </Text>
              <BarChart size={12} color="gray" />
            </View>

            <View className="flex flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl">
                {course.count} جلسه
              </Text>
              <BookOpen size={12} color="gray" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl">
                {(course.count ^ 2) / 2} ساعت
              </Text>
              <Clock size={12} color="gray" />
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

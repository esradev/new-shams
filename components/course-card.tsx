import { Link, Href } from 'expo-router'
import { Image, View, Text, Pressable } from 'react-native'

interface CourseProps {
  href: Href
  course: {
    id: number
    name: string
    description: string
    count: number
  }
}

export default function CourseCard({ href, course }: CourseProps) {
  return (
    <Link href={href} asChild>
      <Pressable className='flex flw-row flex-1 w-full items-start gap-3 p-3 rounded-lg border bg-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
        {/* <View className='relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0'> */}
        {/* <Image
            // src={course.image || '/placeholder.svg'}
            alt={name}
            className='object-cover'
          /> */}
        {/* </View> */}

        <View className='flex flex-col flex-1 w-full'>
          <Text className='font-medium text-xl text-gray-900 dark:text-white mb-1 line-clamp-2 text-right dir-rtl'>
            {course.name}
          </Text>

          <Text className='text-gray-500 dark:text-gray-400 mb-2 text-right dir-rtl'>
            {course.description.replace(/<[^>]+>/g, '').slice(0, 160) + '...'}
          </Text>
          <View className='flex flex-row-reverse items-center gap-2 my-4'>
            <Image
              source={require('../assets/images/ostad.jpg')}
              className='w-10 h-10 rounded-full'
            />
            <Text className='text-sm text-gray-700 dark:text-gray-400 mb-2 text-right dir-rtl'>
              آیت الله حسینی آملی (حفظه الله)
            </Text>
          </View>

          <View className='flex flex-row items-center justify-between'>
            <Text className='text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full'>
              درس خارج
            </Text>

            <View className='flex flex-row items-center gap-2'>
              <Text className='text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl'>
                {course.count} جلسه
              </Text>
              <Text className='text-xs text-gray-500 dark:text-gray-400 text-right dir-rtl'>
                {(course.count ^ 2) / 2} ساعت
              </Text>
            </View>
          </View>

          {/* {course.progress > 0 && (
            <View className='mt-2'>
              <View className='w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                <View
                  className='h-full bg-emerald-600 dark:bg-emerald-500 rounded-full'
                  style={{ width: `${course.progress}%` }}></View>
              </View>
            </View>
          )} */}
        </View>
      </Pressable>
    </Link>
  )
}

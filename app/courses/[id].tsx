import { Text, ScrollView, View, Pressable } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { ChevronLeft } from 'lucide-react-native'

import Pagination from '@/components/pagination'
import LoadingSpinner from '@/components/loading-spinner'
import { useApi } from '@/context/api-context'
import { usePostsByCategory } from '@/hooks/use-posts-by-category'

const CategoryPosts = () => {
  const { id } = useLocalSearchParams()
  const { categories } = useApi()

  const category = categories.find(cat => cat.id === Number(id))

  const { posts, loading, error, page, totalPages, setPage } =
    usePostsByCategory(id)

  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex flex-1 bg-white dark:bg-gray-900'>
        <ScrollView>
          <View className='px-4 py-5'>
            {error ? (
              <Text className='text-red-500 text-lg font-bold text-center mb-4 w-full'>
                Error: {error?.message}
              </Text>
            ) : loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <View className='flex flex-row-reverse justify-between items-start mb-2'>
                  <Text className='text-2xl font-bold text-gray-900 dark:text-white text-right dir-rtl'>
                    {category?.name}
                  </Text>
                </View>

                <View className='flex flex-row-reverse items-center mb-4'>
                  <Text className='text-sm text-right dir-rtl text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full'>
                    {category?.category || 'درس خارج'}
                  </Text>
                  <Text className='mx-2 text-gray-400'>•</Text>
                  <Text className='text-sm text-gray-600 dark:text-gray-400 text-right dir-rtl'>
                    آیت الله سید محمدرضا حسینی آملی (حفظه الله)
                  </Text>
                </View>
                <View className='mb-6'>
                  <Text className='text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 text-right dir-rtl'>
                    در مورد درس
                  </Text>
                  <Text className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-right dir-rtl'>
                    {category?.description}
                  </Text>
                </View>

                <View>
                  <Text className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 text-right dir-rtl'>
                    جلسات
                  </Text>
                  <View className='gap-y-3'>
                    {posts.map((lesson, index) =>
                      loading ? (
                        <View
                          key={index}
                          className='h-20 w-full bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg'>
                          <View className='flex flex-row-reverse items-center p-3'>
                            <View className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ml-3 text-sm font-medium'>
                              <Text>{index + 1}</Text>
                            </View>
                            <View className='flex-1'>
                              <Text className='text-lg font-medium text-right dir-rtl text-gray-800 dark:text-gray-200'>
                                ...........
                              </Text>
                              <Text className='text-base text-gray-500 dark:text-gray-500 text-right dir-rtl'>
                                ......
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <Link
                          asChild
                          href={`/lessons/${lesson.id}`}
                          key={lesson.id}
                          className='flex flex-row-reverse items-center p-3 rounded-lg bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-700 '>
                          <Pressable className='flex flex-row-reverse items-center w-full'>
                            <View className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-400 ml-3 text-sm font-medium'>
                              {/* Todo: Add lessons count order number */}
                              <Text>{index + 1}</Text>
                            </View>
                            <View className='flex-1'>
                              <Text className='text-lg font-medium text-right dir-rtl text-gray-800 dark:text-gray-200'>
                                {lesson?.title?.rendered}
                              </Text>
                              <Text className='text-base text-gray-500 dark:text-gray-500 text-right dir-rtl'>
                                {lesson?.duration || '00:00'}
                              </Text>
                            </View>
                            <View className='flwx items-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-full'>
                              <ChevronLeft
                                size={16}
                                color='gray'
                                className='mr-2'
                              />
                            </View>
                          </Pressable>
                        </Link>
                      )
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </SafeAreaProvider>
  )
}

export default CategoryPosts

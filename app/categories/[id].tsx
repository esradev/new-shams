import React, { useEffect, useState } from 'react'
import { Text, ScrollView, View, Pressable } from 'react-native'
import { useLocalSearchParams, useNavigation, Link } from 'expo-router'
import axios from 'axios'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Check } from 'lucide-react-native'

import LoadingSpinner from '@/components/loading-spinner'

interface ErrorType {
  message: string
}

interface CategoryType {
  name: string
  description: string
}

interface PostType {
  id: number
  title: { rendered: string }
  meta: { 'date-of-the-lesson'?: string }
}

const Categories = () => {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorType | null>(null)
  const [posts, setPosts] = useState<PostType[]>([])
  const [page, setPage] = useState(1) // Current page
  const [totalPages, setTotalPages] = useState(1) // Total number of pages
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    // Fetch category details
    const fetchCategory = async () => {
      try {
        const response = await axios.get(
          `https://shams-almaarif.com/wp-json/wp/v2/categories/${id}`
        )
        setCategory(response.data)
        navigation.setOptions({ title: response.data.name })
      } catch (err) {
        setError(err as any)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [id])

  // Fetch posts and set the total number of pages
  const fetchPosts = async () => {
    setIsFetching(true)
    try {
      const response = await axios.get(
        `https://shams-almaarif.com/wp-json/wp/v2/posts?categories=${id}&page=${page}&per_page=20&orderby=date&order=asc`
      )
      setPosts(response.data)
      setTotalPages(Number(response.headers['x-wp-totalpages'])) // Capture total pages
    } catch (err) {
      setError(err as any)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [id, page])

  if (loading) {
    return (
      <SafeAreaView className='flex-1 items-center justify-center bg-white'>
        <LoadingSpinner />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView className='flex-1 items-center justify-center bg-white'>
        <Text className='text-red-500 text-lg font-bold text-center mb-4 w-full'>
          Error: {error?.message}
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View className='px-4 py-5'>
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
              {category?.instructor ||
                'آیت الله سید محمدرضا حسینی آملی (حفظه الله)'}
            </Text>
          </View>

          {/* <View className='mb-6'>
            <View className='flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1'>
              <Text>Progress</Text>
              <Text>{category?.progress}%</Text>
            </View>
            <View className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
              <View
                className='h-full bg-emerald-600 dark:bg-emerald-500 rounded-full'
                style={{ width: `${category?.progress}%` }}></View>
            </View>
          </View> */}

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
              {posts.map((lesson, index) => (
                <Link
                  asChild
                  href={`/lessons/${lesson.id}`}
                  key={lesson.id}
                  className='flex flex-row-reverse items-center p-3 rounded-lg bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
                  <Pressable className='flex flex-row-reverse items-center w-full'>
                    <View className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ml-3 text-sm font-medium'>
                      <Text>{index + 1}</Text>
                    </View>
                    <View className='flex-1'>
                      <Text
                        className={`text-lg font-medium text-right dir-rtl ${
                          lesson?.completed
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                        {lesson?.title?.rendered}
                      </Text>
                      <Text className='text-base text-gray-500 dark:text-gray-500 text-right dir-rtl'>
                        {lesson?.duration || '00:00'}
                      </Text>
                    </View>
                    {lesson?.completed && (
                      <View className='w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center'>
                        <Check size={16} color='#fff' />
                      </View>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {/* <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      <StatusBar barStyle='dark-content' backgroundColor='#16a34a' /> */}
    </SafeAreaView>
  )
}

export default Categories

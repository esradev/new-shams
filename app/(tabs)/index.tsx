import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { Href } from 'expo-router'
import axios from 'axios'

import CategoryList from '@/components/category-list'
import CourseCard from '@/components/course-card'
import Header from '@/components/header'
import LoadingSpinner from '@/components/loading-spinner'

export default function HomePage() {
  const [categories, setCategories] = useState<
    {
      id: number
      name: string
      count: number
      parent: number
      description: string
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Get all categories from the WordPress REST API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          'https://shams-almaarif.com/wp-json/wp/v2/categories?per_page=100'
        )
        // Just get the categories that have posts and is the child and not have children
        const filteredCategories = response.data.filter(
          (category: { count: number; parent: number; id: number }) =>
            category.count > 0
        )

        setCategories(filteredCategories)
      } catch (err) {
        setError(err as any)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (error) {
    return (
      <SafeAreaView className='flex-1 items-center justify-center bg-white p-4'>
        <Text className='text-red-500 text-lg font-bold text-center mb-4 w-full'>
          Error: {error?.message}
        </Text>
        <StatusBar barStyle='dark-content' backgroundColor='#059669' />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex flex-1 bg-white dark:bg-gray-900'>
        <Header />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className='p-6'>
              <View className='mb-8'>
                <Text className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-right dir-rtl'>
                  موضوعات دروس
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className='flex flex-row mr-2 flex-1 pb-2 scrollbar-hide text-right dir-rtl'>
                  {categories
                    .filter(category => category.parent === 0)
                    .map(category => (
                      <CategoryList
                        key={category.id}
                        href={`/categories/${category.id}` as Href}
                        category={category}
                      />
                    ))}
                </ScrollView>
              </View>

              <View className='mb-8'>
                <Text className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-right dir-rtl'>
                  تمام دروس خارج
                </Text>
                <View className='grid grid-cols-1 gap-4'>
                  {categories
                    .filter(category => category.parent !== 0)
                    .map(category => (
                      <CourseCard
                        key={category.id}
                        href={`/courses/${category.id}` as Href}
                        course={category}
                      />
                    ))}
                </View>
              </View>
            </View>
          </ScrollView>
        )}
        <StatusBar barStyle='dark-content' backgroundColor='#059669' />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

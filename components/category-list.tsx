import { useRef } from 'react'
import { Link } from 'expo-router'
import { View, Text, ScrollView, Pressable } from 'react-native'

interface Category {
  id: number
  name: string
  count: number
  parent: number
}

interface CategoryListProps {
  categories: Category[]
}

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className='flex flex-row mr-2 flex-1 pb-2 scrollbar-hide text-right dir-rtl'>
      {categories
        .filter(category => category.parent === 0)
        .map(category => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            asChild
            className='mr-3'>
            <Pressable>
              <View className='flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'>
                <Text className='text-sm font-medium text-emerald-800 dark:text-emerald-400'>
                  {category.name}
                </Text>
                <Text className='text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-1'>
                  {category.count} درس
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}
    </ScrollView>
  )
}

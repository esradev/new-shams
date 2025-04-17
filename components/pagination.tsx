import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import React from 'react'
import { View, Text, Pressable } from 'react-native'

interface PaginationProps {
  page: number
  totalPages: number
  setPage: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  setPage
}) => {
  const canGoBack = page > 1
  const canGoForward = page < totalPages

  return (
    <View className='flex flex-row-reverse justify-center items-center gap-x-4 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'>
      <Pressable
        className={`px-4 py-1 rounded-md border ${
          canGoBack
            ? 'bg-emerald-600 border-emerald-700'
            : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
        }`}
        onPress={() => canGoBack && setPage(page - 1)}
        disabled={!canGoBack}>
        <View className='flex flex-row items-center gap-x-2'>
          <Text
            className={`text-sm font-medium  ${
              canGoBack
                ? 'opacity-100 text-white'
                : 'opacity-40 text-gray-700 dark:text-gray-300'
            }`}>
            قبلی
          </Text>
          <ChevronRight size={12} color={canGoBack ? 'white' : 'gray'} />
        </View>
      </Pressable>

      <Text className='text-gray-700 dark:text-gray-300 text-sm font-medium'>
        صفحه {page} از {totalPages}
      </Text>

      <Pressable
        className={`px-4 py-1 rounded-md border ${
          canGoForward
            ? 'bg-emerald-600 border-emerald-700'
            : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
        }`}
        onPress={() => canGoForward && setPage(page + 1)}
        disabled={!canGoForward}>
        <View className='flex flex-row items-center gap-x-2'>
          <ChevronLeft size={12} color={canGoForward ? 'white' : 'gray'} />
          <Text
            className={`text-sm font-medium text-white ${
              canGoForward ? 'opacity-100' : 'opacity-40'
            }`}>
            بعدی
          </Text>
        </View>
      </Pressable>
    </View>
  )
}

export default Pagination

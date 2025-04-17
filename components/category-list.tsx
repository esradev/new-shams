import { Href, Link } from 'expo-router'
import { View, Text, Pressable } from 'react-native'

interface Category {
  id: number
  name: string
  count: number
  parent: number
}

export default function CategoryList({
  category,
  href
}: {
  category: Category
  href: Href
}) {
  return (
    <Link href={href} asChild>
      <Pressable className='flex-1 flex flex-col mr-3 items-center justify-center w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'>
        <Text className='text-sm font-medium text-emerald-800 dark:text-emerald-400'>
          {category.name}
        </Text>
        <Text className='text-xs mt-1 text-emerald-600/70 dark:text-emerald-500/70'>
          {category.count} درس
        </Text>
      </Pressable>
    </Link>
  )
}

import { View, Text, Platform, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'
import { ArrowLeft, Moon, Sun } from 'lucide-react-native'
import { Link, useNavigation, usePathname } from 'expo-router'

const ios = Platform.OS === 'ios'
export default function Header() {
  const navigation = useNavigation()
  const isHome = usePathname() == '/'
  const { colorScheme, toggleColorScheme } = useColorScheme()
  const { top } = useSafeAreaInsets()
  return (
    <View
      style={{ paddingTop: ios ? top : top + 10 }}
      className='flex-row-reverse justify-between px-5 bg-green-50 py-4 dark:bg-stone-900 shadow-sm'>
      <View className='flex items-end'>
        <Text className='text-2xl font-bold text-emerald-800 dark:text-emerald-400 text-right dir-rtl'>
          شمس المعارف
        </Text>
        <Text className='text-sm text-gray-500 dark:text-gray-400 text-right dir-rtl'>
          دروس خارج آیت الله حسینی آملی (حفظه الله)
        </Text>
      </View>

      {/* Theme Toggle */}
      <View className='flex flex-row-reverse items-center align-middle gap-x-4'>
        <Pressable
          onPress={toggleColorScheme}
          className='p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors'
          aria-label='Toggle dark mode'>
          {colorScheme == 'dark' ? (
            <Sun size={20} color={colorScheme == 'dark' ? 'white' : 'black'} />
          ) : (
            <Moon
              size={20}
              color={colorScheme == 'light' ? 'black' : 'white'}
            />
          )}
        </Pressable>

        {/* if home page, not show back button */}
        {!isHome && (
          <Link
            href={navigation.canGoBack() ? '../' : '/'}
            asChild
            className='p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors'>
            <Pressable>
              <ArrowLeft
                size={20}
                color={colorScheme == 'dark' ? 'white' : 'black'}
              />
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  )
}

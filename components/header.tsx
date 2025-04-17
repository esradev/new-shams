import { useState, useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Href, Link, usePathname } from 'expo-router'
import { colorScheme, useColorScheme } from 'nativewind'

import { Moon, Sun, Menu, X, Settings } from 'lucide-react-native'

export default function Header() {
  const [darkMode, setDarkMode] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setColorScheme } = useColorScheme()

  const pathname = usePathname()

  const toggleDarkMode = () => {
    if (darkMode) {
      setColorScheme('light')
    } else {
      setColorScheme('dark')
    }
    setDarkMode(!darkMode)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { name: 'صفحه اصلی', path: '/' },
    { name: 'دوره ها', path: '/courses' },
    { name: 'اعلانات', path: '/alerts' }
  ]

  return (
    <View className='sticky top-0 z-50 bg-green-100 dark:bg-stone-900 shadow-sm'>
      <View className='container mx-auto px-6'>
        <View className='flex flex-row-reverse w-full items-center justify-between h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center'>
            <View>
              <Text className='text-2xl font-bold text-emerald-800 dark:text-emerald-400 text-right dir-rtl'>
                شمس المعارف
              </Text>
              <Text className='text-sm text-gray-500 dark:text-gray-400 text-right dir-rtl'>
                دروس خارج آیت الله حسینی آملی (حفظه الله)
              </Text>
            </View>
          </Link>

          {/* Actions */}
          <View className='flex flex-row items-center align-middle gap-x-4'>
            <Pressable
              onPress={toggleDarkMode}
              className='p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors'
              aria-label='Toggle dark mode'>
              {darkMode ? (
                <Sun
                  size={20}
                  color={colorScheme.get() === 'dark' ? 'white' : 'black'}
                />
              ) : (
                <Moon
                  size={20}
                  color={colorScheme.get() === 'dark' ? 'white' : 'black'}
                />
              )}
            </Pressable>

            <Link
              href='/settings'
              className='items-center p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors'>
              <Settings
                size={20}
                color={colorScheme.get() === 'dark' ? 'white' : 'black'}
              />
            </Link>

            {/* Mobile menu Pressable - hide on md and larger screens */}
            <Pressable
              className='p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors'
              onPress={toggleMenu}
              aria-label='Toggle menu'>
              {isMenuOpen ? (
                <X
                  size={20}
                  color={colorScheme.get() === 'dark' ? 'white' : 'black'}
                />
              ) : (
                <Menu
                  size={20}
                  color={colorScheme.get() === 'dark' ? 'white' : 'black'}
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* Mobile Navigation - this will be replaced by bottom navigation */}
        {isMenuOpen && (
          <View className='md:hidden py-4 border-t dark:border-stone-800'>
            <View className='flex flex-col gap-y-4'>
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.path as Href}
                  className={`transition-colors hover:text-primary px-2 py-1 text-right dir-rtl dark:text-white ${
                    pathname === link.path ? 'text-primary font-medium' : ''
                  }`}>
                  <Pressable onPress={() => setIsMenuOpen(false)}>
                    <Text className='dark:text-white'>{link.name}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

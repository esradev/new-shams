import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { View, Text, ScrollView } from 'react-native'
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react-native'
import axios from 'axios'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import RenderHTML from 'react-native-render-html'
import { useLocalSearchParams, useNavigation } from 'expo-router'

import AudioPlayer from '@/components/audio-player'
import { colorScheme } from 'nativewind'

interface ErrorType {
  message: string
}

interface PostType {
  title: { rendered: string }
  content: { rendered: string }
  meta: { 'the-audio-of-the-lesson': string; 'date-of-the-lesson': string }
  courseName?: string
}

export default function LessonPage() {
  const {
    id,
    categorayId,
    categorayName,
    postTitle,
    postContent,
    postAudioSrc,
    postDate
  } = useLocalSearchParams()

  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex flex-1 bg-white dark:bg-gray-900'>
        <ScrollView
          showsVerticalScrollIndicator={false}
          className='flex flex-1 p-4 bg-stone-200 dark:bg-gray-900'>
          {/* Back button */}
          <View className='flex flex-row items-center justify-between mb-4'>
            <View className='flex flex-row items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-2 py-0.5'>
              <ArrowLeft size={12} color='gray' />
              <Link
                href={`/courses/${categorayId}`}
                className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                برگشت به صفحه دوره
              </Link>
            </View>
          </View>
          <View className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 rounded-lg'>
            <View>
              <View className='px-4 py-3 flex flex-col items-end gap-2'>
                <Text className='text-3xl mt-4 font-semibold text-gray-900 dark:text-white'>
                  {postTitle}
                </Text>

                <View className='flex flex-row items-center gap-2'>
                  <Text className='text-sm text-gray-500 dark:text-gray-400'>
                    {categorayName}
                  </Text>
                  <BookOpen size={12} color='gray' />
                </View>
                <View className='flex flex-row items-center gap-2'>
                  <Text className='text-sm text-gray-500 dark:text-gray-400'>
                    {postDate}
                  </Text>
                  <Calendar size={12} color='gray' />
                </View>
              </View>
            </View>

            <View className='px-4 py-6'>
              <RenderHTML
                source={{
                  html:
                    postContent ||
                    `<p>متأسفانه محتوای این جلسه در حال حاضر در دسترس نیست. لطفا بعدا دوباره مراجعه کنید.</p>`
                }}
                contentWidth={400}
                baseStyle={{
                  backgroundColor:
                    colorScheme.get() === 'dark' ? '#1C1917' : '#FAFAF9',
                  padding: 10,
                  borderRadius: 10,
                  borderStyle: 'solid',
                  borderColor:
                    colorScheme.get() === 'dark' ? '#44403c' : '#d6d3d1',
                  borderWidth: 1,
                  fontSize: 16,
                  lineHeight: 26,
                  color: colorScheme.get() === 'dark' ? '#d6d3d1' : '#44403c',
                  textAlign: 'right'
                }}
              />
            </View>
          </View>
        </ScrollView>
        {postAudioSrc && (
          <AudioPlayer
            id={id}
            postAudioSrc={postAudioSrc}
            postTitle={postTitle}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

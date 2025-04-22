import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { View, Text, ScrollView } from 'react-native'
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react-native'
import axios from 'axios'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import RenderHTML from 'react-native-render-html'
import { Audio } from 'expo-av'
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
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const [post, setPost] = useState<PostType | null>(null)
  const [courseId, setCourseId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorType | null>(null)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fileUri, setFileUri] = useState<string | null>(null)

  useEffect(() => {
    const loadSound = async () => {
      if (fileUri) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: false }
        )
        setSound(sound)

        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis)
            setDuration(status.durationMillis || 0)
          }
        })
      } else if (post?.meta['the-audio-of-the-lesson']) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: post.meta['the-audio-of-the-lesson'] },
          { shouldPlay: false }
        )
        setSound(sound)

        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis)
            setDuration(status.durationMillis || 0)
          }
        })
      }
    }

    loadSound()

    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [post, fileUri])

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `https://shams-almaarif.com/wp-json/wp/v2/posts/${id}`
        )
        setPost(response.data)
        setCourseId(response.data?.categories[0])
        navigation.setOptions({ title: response.data?.title?.rendered })
      } catch (err) {
        setError(err as any)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (error) {
    return (
      <SafeAreaView>
        <Text
          style={{
            color: 'red',
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
            width: '100%'
          }}>
          Error: {error?.message}
        </Text>
      </SafeAreaView>
    )
  }

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
                href={`/courses/${courseId}`}
                className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                برگشت به صفحه دوره
              </Link>
            </View>
          </View>
          <View className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 rounded-lg'>
            <View>
              <View className='px-4 py-3 flex flex-col items-end gap-2'>
                {loading ? (
                  <View className='mt-4 h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse'></View>
                ) : (
                  <Text className='text-3xl mt-4 font-semibold text-gray-900 dark:text-white'>
                    {post?.title.rendered}
                  </Text>
                )}
                <View className='flex flex-row items-center gap-2'>
                  <Text className='text-sm text-gray-500 dark:text-gray-400'>
                    {post?.courseName || 'درس خارج'}
                  </Text>
                  <BookOpen size={12} color='gray' />
                </View>
                <View className='flex flex-row items-center gap-2'>
                  <Text className='text-sm text-gray-500 dark:text-gray-400'>
                    {post?.meta['date-of-the-lesson']}
                  </Text>
                  <Calendar size={12} color='gray' />
                </View>
              </View>
            </View>

            <View className='px-4 py-6'>
              {loading ? (
                <View className='mt-4 h-30 w-full bg-[#FAFAF9] dark:bg-[#1C1917] rounded-md animate-pulse'></View>
              ) : (
                <RenderHTML
                  source={{
                    html:
                      post?.content.rendered ||
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
              )}
            </View>
          </View>
        </ScrollView>
        {post?.meta['the-audio-of-the-lesson'] && (
          <AudioPlayer
          // sound={sound}
          // title={post.title.rendered}
          // duration={post.duration}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
// const PostDetail = () => {

//   useEffect(() => {
//     const checkFileExists = async () => {
//       const directoryUri = FileSystem.documentDirectory + 'shams_app/'
//       const fileUri = directoryUri + `${id}.mp3`
//       const fileInfo = await FileSystem.getInfoAsync(fileUri)
//       if (fileInfo.exists) {
//         setFileUri(fileUri)
//       }
//     }

//     checkFileExists()
//   }, [id])

//   const handleDownload = async () => {
//     if (post?.meta['the-audio-of-the-lesson']) {
//       const uri = post.meta['the-audio-of-the-lesson']
//       const directoryUri = FileSystem.documentDirectory + 'shams_app/'
//       const fileUri = directoryUri + `${id}.mp3`

//       try {
//         // Ensure the directory exists
//         const dirInfo = await FileSystem.getInfoAsync(directoryUri)
//         if (!dirInfo.exists) {
//           await FileSystem.makeDirectoryAsync(directoryUri, {
//             intermediates: true
//           })
//         }

//         // Download the file
//         const { uri: downloadedUri } = await FileSystem.downloadAsync(
//           uri,
//           fileUri
//         )
//         console.log(`File downloaded to: ${downloadedUri}`)

//         // Verify the file exists
//         const fileInfo = await FileSystem.getInfoAsync(downloadedUri)
//         if (fileInfo.exists) {
//           setFileUri(downloadedUri)
//           Alert.alert(
//             'Download complete',
//             `File downloaded to ${downloadedUri}`
//           )
//         } else {
//           Alert.alert('Download failed', 'File does not exist after download.')
//         }
//       } catch (error) {
//         console.error('Download error:', error)
//         Alert.alert(
//           'Download failed',
//           'An error occurred while downloading the file.'
//         )
//       }
//     }
//   }

//   const handlePlayPause = async () => {
//     if (sound) {
//       if (isPlaying) {
//         await sound.pauseAsync()
//       } else {
//         await sound.playAsync()
//       }
//       setIsPlaying(!isPlaying)
//     }
//   }

//   const handleSeek = async (value: number) => {
//     if (sound) {
//       await sound.setPositionAsync(value)
//     }
//   }

//   const handleForward = async () => {
//     if (sound) {
//       const newPosition = currentTime + 30000 // Forward 30 seconds
//       await sound.setPositionAsync(newPosition)
//     }
//   }

//   const handleBackward = async () => {
//     if (sound) {
//       const newPosition = currentTime - 30000 // Backward 30 seconds
//       await sound.setPositionAsync(newPosition)
//     }
//   }

//   const formatTime = (timeMillis: number) => {
//     const totalSeconds = timeMillis / 1000
//     const minutes = Math.floor(totalSeconds / 60)
//     const seconds = Math.floor(totalSeconds % 60)

//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
//   }

//   const handleSettings = (event: GestureResponderEvent) => {
//     Alert.alert('Settings', 'Settings button pressed.')
//   }

//   return (
//     <SafeAreaView className='flex-1 bg-amber-50'>
//       {post?.meta['the-audio-of-the-lesson'] && (
//         <View className='absolute bottom-0 pb-20 w-full bg-amber-200 p-4 align-middle'>
//           <View className='flex flex-row justify-around mb-2'>
//             <TouchableOpacity onPress={handleSettings}>
//               <MaterialIcons name='settings-suggest' size={30} color='black' />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={handleBackward}>
//               <MaterialIcons name='replay-30' size={30} color='black' />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={handlePlayPause}>
//               {isPlaying ? (
//                 <MaterialIcons
//                   name='pause-circle-outline'
//                   size={30}
//                   color='black'
//                 />
//               ) : (
//                 <MaterialIcons
//                   name='play-circle-outline'
//                   size={30}
//                   color='black'
//                 />
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity onPress={handleForward}>
//               <MaterialIcons name='forward-30' size={30} color='black' />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleDownload}>
//               <MaterialIcons name='downloading' size={30} color='black' />
//             </TouchableOpacity>
//           </View>

//           <View className='flex flex-row items-center justify-between mb-2'>
//             <Text>{formatTime(currentTime)}</Text>
//             <Slider
//               style={{ flex: 1, marginHorizontal: 8 }}
//               minimumValue={0}
//               maximumValue={duration}
//               value={currentTime}
//               onValueChange={handleSeek}
//               minimumTrackTintColor='#16a34a'
//               maximumTrackTintColor='gray'
//               thumbTintColor='#16a34a'
//             />
//             <Text>{formatTime(duration)}</Text>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   )
// }

// export default PostDetail

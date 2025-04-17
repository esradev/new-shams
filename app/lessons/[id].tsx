import React, { useEffect, useState } from 'react'
import { Link } from 'expo-router'
import { View, Text, StatusBar, ScrollView } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import axios from 'axios'
import { SafeAreaView } from 'react-native-safe-area-context'
import RenderHTML from 'react-native-render-html'
import LoadingSpinner from '@/components/loading-spinner'
import { Audio } from 'expo-av'
import { Href, useLocalSearchParams, useNavigation } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Slider from '@react-native-community/slider'
import * as FileSystem from 'expo-file-system'

import AudioPlayer from '@/components/audio-player'
// import NoteSection from '@/components/note-section'

interface ErrorType {
  message: string
}

interface PostType {
  title: { rendered: string }
  content: { rendered: string }
  meta: { 'the-audio-of-the-lesson': string }
}

export default function LessonPage() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  const [post, setPost] = useState<PostType | null>(null)
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
        navigation.setOptions({ title: response.data?.title?.rendered })
      } catch (err) {
        setError(err as any)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  if (loading) {
    return (
      <SafeAreaView>
        <LoadingSpinner />
        <StatusBar barStyle='dark-content' backgroundColor='#16a34a' />
      </SafeAreaView>
    )
  }

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
        <StatusBar barStyle='dark-content' backgroundColor='#16a34a' />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex h-full bg-white dark:bg-gray-900'>
      <ScrollView className='flex h-full bg-white dark:bg-gray-900'>
        <View className='sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'>
          <View className='px-4 py-3 flex items-center'>
            <Link href={`/courses/${id}`} className='mr-2'>
              <ArrowLeft
                size={20}
                className='text-gray-600 dark:text-gray-400'
              />
            </Link>
            <View>
              <Text className='text-lg font-semibold text-gray-900 dark:text-white'>
                {post.title.rendered}
              </Text>
              <Text className='text-xs text-gray-500 dark:text-gray-400'>
                {/* {post.courseName} */}
              </Text>
            </View>
          </View>
        </View>

        <View className='px-4 py-6'>
          <RenderHTML
            contentWidth={400} // Adjust contentWidth based on your layout
            source={{
              html:
                post?.content.rendered ||
                `<h2>متأسفانه هنوز متن این جلسه کامل نشده است.</h2>`
            }}
            baseStyle={{
              fontSize: 18,
              lineHeight: 26,
              color: '#333',
              textAlign: 'right'
            }}
          />

          {/* <View className='mt-12'>
          <NoteSection postId={post.id} />
          </View> */}
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
//       <StatusBar barStyle='dark-content' backgroundColor='#16a34a' />
//     </SafeAreaView>
//   )
// }

// export default PostDetail

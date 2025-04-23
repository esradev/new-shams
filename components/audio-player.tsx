import type React from 'react'
import { Audio } from 'expo-av'

import { View, Pressable, Text, Alert } from 'react-native'
import Slider from '@react-native-community/slider'
import * as FileSystem from 'expo-file-system'

import { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Minimize2,
  Maximize2,
  ChevronsLeft,
  ChevronsRight,
  AudioLines,
  AudioWaveform
} from 'lucide-react-native'

export default function AudioPlayer({ id, post }: any) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [expanded, setExpanded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
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
    const checkFileExists = async () => {
      const directoryUri = FileSystem.documentDirectory + 'shams_app/'
      const fileUri = directoryUri + `${id}.mp3`
      const fileInfo = await FileSystem.getInfoAsync(fileUri)
      if (fileInfo.exists) {
        setFileUri(fileUri)
      }
    }

    checkFileExists()
  }, [id])

  const handleDownload = async () => {
    if (post?.meta['the-audio-of-the-lesson']) {
      const uri = post.meta['the-audio-of-the-lesson']
      const directoryUri = FileSystem.documentDirectory + 'shams_app/'
      const fileUri = directoryUri + `${id}.mp3`

      try {
        // Ensure the directory exists
        const dirInfo = await FileSystem.getInfoAsync(directoryUri)
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(directoryUri, {
            intermediates: true
          })
        }

        // Download the file
        const { uri: downloadedUri } = await FileSystem.downloadAsync(
          uri,
          fileUri
        )
        console.log(`File downloaded to: ${downloadedUri}`)

        // Verify the file exists
        const fileInfo = await FileSystem.getInfoAsync(downloadedUri)
        if (fileInfo.exists) {
          setFileUri(downloadedUri)
          Alert.alert(
            'Download complete',
            `File downloaded to ${downloadedUri}`
          )
        } else {
          Alert.alert('Download failed', 'File does not exist after download.')
        }
      } catch (error) {
        console.error('Download error:', error)
        Alert.alert(
          'Download failed',
          'An error occurred while downloading the file.'
        )
      }
    }
  }

  const togglePlay = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value)
    }
  }

  const handleForward = async () => {
    if (sound) {
      const newPosition = currentTime + 30000 // Forward 30 seconds
      await sound.setPositionAsync(newPosition)
    }
  }

  const handleBackward = async () => {
    if (sound) {
      const newPosition = currentTime - 30000 // Backward 30 seconds
      await sound.setPositionAsync(newPosition)
    }
  }

  const formatTime = (timeMillis: number) => {
    const totalSeconds = timeMillis / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleVolumeChange = (value: number) => {
    if (sound) {
      sound.setVolumeAsync(value)
      setVolume(value)
    }
  }

  useEffect(() => {
    if (sound) {
      sound.setRateAsync(playbackRate, true)
      setPlaybackRate(playbackRate)
    }

    return () => {
      if (sound) {
        sound.setRateAsync(1, true)
        setPlaybackRate(1)
      }
    }
  }, [playbackRate])

  return (
    <View
      className={`fixed left-0 bottom-0 right-0 pb-10 bg-yellow-50  dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 transition-all ${
        expanded ? 'h-60' : 'h-32'
      }`}>
      <View className='container mx-auto px-4 h-full flex flex-col'>
        {/* Main player controls */}
        <View className='flex flex-row items-center justify-between h-20 gap-x-4'>
          {/* Controls */}
          <View className='flex flex-row items-center gap-x-2 md:gap-x-4'>
            <Pressable
              onPress={handleBackward}
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label='Skip backward'>
              <ChevronsLeft size={18} color='black' />
            </Pressable>

            <Pressable
              onPress={togglePlay}
              className='p-2 rounded-full bg-green-700 text-white transition-colors'
              aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <Pause size={20} color='white' />
              ) : (
                <Play size={20} color='white' />
              )}
            </Pressable>

            <Pressable
              onPress={handleForward}
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label='Skip forward'>
              <ChevronsRight size={18} color='black' />
            </Pressable>
          </View>
          {/* Actions */}
          <View className='flex flex-row items-center gap-x-2'>
            <Pressable
              onPress={handleDownload}
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label='Download audio'>
              <Download size={18} color='black' />
            </Pressable>

            <Pressable
              onPress={() => setExpanded(!expanded)}
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label={expanded ? 'Minimize player' : 'Expand player'}>
              {expanded ? (
                <Minimize2 size={18} color='black' />
              ) : (
                <Maximize2 size={18} color='black' />
              )}
            </Pressable>
          </View>
          {/* Lesson info */}
          <View className='flex flex-col flex-1 w-1/4'>
            <Text className='text-sm text-right dir-rtl font-medium truncate text-stone-900 dark:text-stone-100'>
              {post.title.rendered}
            </Text>
            <Text className='text-xs text-right dir-rtl text-stone-500 dark:text-stone-400 truncate'>
              آیت الله حسینی آملی (حفظه الله)
            </Text>
          </View>
        </View>

        {/* Mobile progress bar (always visible) */}
        <View className='mt-2 pb-4 px-2'>
          <View className='flex flex-row items-center gap-x-2'>
            <Text className='text-xs'>{formatTime(currentTime)}</Text>
            <Slider
              style={{ flex: 1, height: 20 }}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor='#f43f5e' // bg-green-700
              maximumTrackTintColor='#e7e5e4' // bg-stone-200
              thumbTintColor='#f43f5e' // styled like Tailwind thumb
            />
            <Text className='text-xs'>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Expanded view */}
        {expanded && (
          <View className='flex flex-1 flex-row pt-2'>
            <View className='flex flex-col items-center gap-y-4 w-full'>
              <View className='flex flex-row items-center gap-x-2'>
                <Volume2 size={16} color='black' />
                <Slider
                  style={{ width: 100, height: 20 }}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  value={volume}
                  onSlidingComplete={handleVolumeChange}
                  minimumTrackTintColor='#f43f5e' // Tailwind "bg-green-700" equivalent
                  maximumTrackTintColor='#e7e5e4' // stone-200
                  thumbTintColor='#f43f5e' // same as minimumTrack for consistency
                />
              </View>

              <View className='flex flex-row items-center gap-x-2'>
                <Text className='text-sm'>سرعت پخش:</Text>
                <View className='flex flex-row gap-x-2'>
                  {[0.75, 1, 1.5, 2].map(rate => (
                    <Pressable
                      key={rate}
                      onPress={() => setPlaybackRate(rate)}
                      className={`px-2 py-1 text-xs rounded ${
                        playbackRate === rate
                          ? 'bg-green-700 text-white'
                          : 'bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600'
                      }`}>
                      <Text>{rate}x</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

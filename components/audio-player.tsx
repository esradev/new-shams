import type React from 'react'
import { Audio } from 'expo-av'

import { View, Pressable, Text } from 'react-native'
import Slider from '@react-native-community/slider'

import {
  Play,
  Pause,
  Volume2,
  Download,
  Minimize2,
  Maximize2,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react-native'

import { useAudioPlayer } from '@/hooks/use-audio-player'

export default function AudioPlayer({ id, postAudioSrc, postTitle }: any) {
  const {
    isPlaying,
    togglePlay,
    handleSeek,
    handleForward,
    handleBackward,
    handleVolumeChange,
    handleDownload,
    formatTime,
    currentTime,
    duration,
    volume,
    expanded,
    setExpanded,
    playbackRate,
    setPlaybackRate
  } = useAudioPlayer(id, postAudioSrc)

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
              {postTitle}
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

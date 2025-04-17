import type React from 'react'
import { View, Pressable, Text } from 'react-native'
import Slider from '@react-native-community/slider'

import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Minimize2,
  Maximize2
} from 'lucide-react-native'

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [expanded, setExpanded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isActive, setIsActive] = useState(false)
  const [currentLesson, setCurrentLesson] = useState({
    title: 'Introduction to Quranic Tajweed',
    course: 'Quranic Studies',
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  })

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Initialize audio element
    if (audioRef.current) {
      audioRef.current.volume = volume

      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration)
        }
      }

      const handleTimeUpdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime || 0)
        }
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
      audioRef.current.addEventListener('ended', handleEnded)

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener(
            'loadedmetadata',
            handleLoadedMetadata
          )
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
          audioRef.current.removeEventListener('ended', handleEnded)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Set active state when there's a lesson
    setIsActive(!!currentLesson.audioSrc)
  }, [currentLesson])

  useEffect(() => {
    // Update playback rate when changed
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    // Create a temporary link to download the audio file
    const link = document.createElement('a')
    link.href = currentLesson.audioSrc
    link.download = `${currentLesson.title}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const changePlaybackRate = () => {
    // Cycle through playback rates: 1 -> 1.5 -> 2 -> 0.75 -> 1
    const rates = [1, 1.5, 2, 0.75]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    setPlaybackRate(rates[nextIndex])
  }

  if (!isActive) return null

  return (
    <View
      className={`fixed left-0 bottom-0 right-0 pb-10 bg-yellow-50  dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 transition-all ${
        expanded ? 'h-60' : 'h-32'
      }`}>
      {/* <audio ref={audioRef} src={currentLesson.audioSrc} /> */}

      <View className='container mx-auto px-4 h-full flex flex-col'>
        {/* Main player controls */}
        <View className='flex flex-row items-center justify-between h-20'>
          {/* Lesson info */}
          <View className='flex-shrink-0 w-1/4 md:w-1/3'>
            <Text className='text-sm font-medium truncate'>
              {currentLesson.title}
            </Text>
            <Text className='text-xs text-stone-500 dark:text-stone-400 truncate'>
              {currentLesson.course}
            </Text>
          </View>

          {/* Controls */}
          <View className='flex flex-row items-center gap-x-2 md:gap-x-4'>
            <Pressable
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label='Skip backward'>
              <SkipBack size={18} color='black' />
            </Pressable>

            <Pressable
              onPress={togglePlay}
              className='p-2 rounded-full bg-green-700 hover:bg-green-700/80 text-white transition-colors'
              aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <Pause size={20} color='white' />
              ) : (
                <Play size={20} color='white' />
              )}
            </Pressable>

            <Pressable
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label='Skip forward'>
              <SkipForward size={18} color='black' />
            </Pressable>
          </View>

          {/* Progress and actions */}
          <View className='hidden md:flex items-center gap-x-2 flex-1 max-w-md'>
            <Text className='text-xs w-10 text-right'>
              {formatTime(currentTime)}
            </Text>
            <Slider
              style={{ flex: 1, height: 20 }}
              minimumValue={0}
              maximumValue={duration || 0}
              value={currentTime}
              // onValueChange={handleSeek}
              minimumTrackTintColor='#f43f5e' // Tailwind 'bg-green-700'
              maximumTrackTintColor='#e7e5e4' // stone-200
              thumbTintColor='#f43f5e' // same as minimumTrack for a consistent look
            />
            <Text className='text-xs w-10'>{formatTime(duration)}</Text>
          </View>

          {/* Actions */}
          <View className='flex flex-row items-center gap-x-2'>
            <Pressable
              onPress={changePlaybackRate}
              className='hidden md:block text-xs font-medium px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label='Change playback speed'>
              <Text className='text-xs font-medium px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'>
                {playbackRate}x
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDownload}
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label='Download audio'>
              <Download size={18} color='black' />
            </Pressable>

            <Pressable
              onPress={toggleExpanded}
              className='p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors'
              aria-label={expanded ? 'Minimize player' : 'Expand player'}>
              {expanded ? (
                <Minimize2 size={18} color='black' />
              ) : (
                <Maximize2 size={18} color='black' />
              )}
            </Pressable>
          </View>
        </View>

        {/* Mobile progress bar (always visible) */}
        <View className='md:hidden mt-2 pb-4 px-2'>
          <View className='flex flex-row items-center gap-x-2'>
            <Text className='text-xs'>{formatTime(currentTime)}</Text>
            <Slider
              style={{ flex: 1, height: 20 }}
              minimumValue={0}
              maximumValue={duration || 0}
              value={currentTime}
              // onValueChange={handleSeek}
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
                  // onValueChange={handleVolumeChange}
                  minimumTrackTintColor='#f43f5e' // Tailwind "bg-green-700" equivalent
                  maximumTrackTintColor='#e7e5e4' // stone-200
                  thumbTintColor='#f43f5e' // same as minimumTrack for consistency
                />
              </View>

              <View className='flex flex-row items-center gap-x-2'>
                <Text className='text-sm'>Playback Speed:</Text>
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

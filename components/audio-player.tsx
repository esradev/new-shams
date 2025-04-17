import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Text, View, Pressable } from 'react-native'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Volume2,
  Volume1,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Repeat,
  Bookmark,
  RotateCcw
} from 'lucide-react-native'

interface AudioPlayerProps {
  sound: {
    uri: string
  }
}

export default function AudioPlayer({ sound }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([])

  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number>()
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setAudioDuration(audio.duration)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0
        audio.play()
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }

    // Events
    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isLooping])

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    if (!audioContextRef.current) {
      setupAudioContext()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying])

  const setupAudioContext = () => {
    const audio = audioRef.current
    if (!audio) return

    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext
    audioContextRef.current = new AudioContext()
    analyzerRef.current = audioContextRef.current.createAnalyser()
    sourceRef.current = audioContextRef.current.createMediaElementSource(audio)

    sourceRef.current.connect(analyzerRef.current)
    analyzerRef.current.connect(audioContextRef.current.destination)

    analyzerRef.current.fftSize = 256
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume()
      }
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Number.parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = Number.parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume || 0.7
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = rate
    setPlaybackRate(rate)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, audio.currentTime - 10)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10)
  }

  const toggleLoop = () => {
    setIsLooping(!isLooping)
  }

  const addBookmark = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setBookmarks(prev => [...prev, time])
    }
  }

  const jumpToBookmark = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  return (
    <View
      className={`fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-20 transition-all duration-300 ${
        isExpanded ? 'pb-4' : ''
      }`}>
      {/* <audio
        ref={audioRef}
        src={sound.uri}
        preload='metadata'
        loop={isLooping}
      /> */}

      <View className='px-4 py-2'>
        <View className='flex flex-row justify-between items-center mb-1'>
          <View className='text-sm font-medium truncate max-w-[200px]'>
            {/* {sound?.title} */} <Text>test</Text>
          </View>
          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            className='text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 p-1'>
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </Pressable>
        </View>

        <View className='flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1'>
          <Text>{formatTime(currentTime)}</Text>
          <Text>{formatTime(audioDuration)}</Text>
        </View>

        {/* <input
          type='range'
          min='0'
          max={audioDuration || 0}
          value={currentTime}
          onChange={handleSeek}
          className='w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-500'
        /> */}

        <View className='flex items-center justify-between mt-2'>
          <View className='flex items-center'>
            <Pressable
              onPress={toggleMute}
              className='p-1 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500'>
              {isMuted ? (
                <VolumeX size={18} />
              ) : volume < 0.5 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </Pressable>

            {/* <input
              type='range'
              min='0'
              max='1'
              step='0.01'
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className='w-16 h-1 ml-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-500'
            /> */}
          </View>

          <View className='flex items-center space-x-2'>
            <Pressable
              onPress={skipBackward}
              className='p-1 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500'>
              <SkipBack size={20} />
            </Pressable>

            <Pressable
              onPress={togglePlay}
              className='p-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors'>
              {isPlaying ? (
                <Pause size={20} />
              ) : (
                <Play size={20} className='ml-0.5' />
              )}
            </Pressable>

            <Pressable
              onPress={skipForward}
              className='p-1 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500'>
              <SkipForward size={20} />
            </Pressable>
          </View>

          <View className='flex items-center space-x-2'>
            <Pressable
              onPress={() =>
                handlePlaybackRateChange(
                  playbackRate === 2 ? 0.75 : playbackRate + 0.25
                )
              }
              className='px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700'>
              {playbackRate}x
            </Pressable>

            {/* <a
              href={sound?.uri}
              download
              className='p-1 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500'>
              <Download size={18} />
            </a> */}
          </View>
        </View>

        {/* Expanded controls */}
        {isExpanded && (
          <View className='mt-4 space-y-4 animate-fadeIn'>
            {/* Advanced controls */}
            <View className='grid grid-cols-4 gap-2'>
              <Pressable
                onPress={toggleLoop}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                  isLooping
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                <Repeat size={18} />
                <Text className='text-xs mt-1'>Loop</Text>
              </Pressable>

              <Pressable
                onPress={addBookmark}
                className='flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'>
                <Bookmark size={18} />
                <Text className='text-xs mt-1'>Bookmark</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const audio = audioRef.current
                  if (audio) audio.currentTime = 0
                }}
                className='flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'>
                <RotateCcw size={18} />
                <Text className='text-xs mt-1'>Restart</Text>
              </Pressable>
            </View>

            {/* Playback speed options */}
            <View>
              <View className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2'>
                Playback Speed
              </View>
              <View className='flex space-x-2'>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <Pressable
                    key={rate}
                    onPress={() => handlePlaybackRateChange(rate)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      playbackRate === rate
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                    {rate}x
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Bookmarks */}
            {bookmarks.length > 0 && (
              <View>
                <View className='flex items-center justify-between'>
                  <View className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2'>
                    Bookmarks
                  </View>
                  <Pressable
                    onPress={() => setBookmarks([])}
                    className='text-xs text-gray-500 dark:text-gray-400'>
                    Clear all
                  </Pressable>
                </View>
                <View className='flex flex-wrap gap-2'>
                  {bookmarks.map((time, index) => (
                    <Pressable
                      key={index}
                      onPress={() => jumpToBookmark(time)}
                      className='px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs flex items-center gap-1'>
                      <Bookmark size={12} />
                      {formatTime(time)}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Jump controls */}
            <View className='grid grid-cols-5 gap-2'>
              <Pressable
                onPress={() => {
                  const audio = audioRef.current
                  if (audio)
                    audio.currentTime = Math.max(0, audio.currentTime - 30)
                }}
                className='flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'>
                <Text className='text-xs font-medium'>-30s</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const audio = audioRef.current
                  if (audio)
                    audio.currentTime = Math.max(0, audio.currentTime - 15)
                }}
                className='flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'>
                <Text className='text-xs font-medium'>-15s</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const audio = audioRef.current
                  if (audio)
                    audio.currentTime = Math.max(0, audio.currentTime - 5)
                }}
                className='flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'>
                <Text className='text-xs font-medium'>-5s</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const audio = audioRef.current
                  if (audio)
                    audio.currentTime = Math.min(
                      audio.duration,
                      audio.currentTime + 5
                    )
                }}
                className='flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'>
                <Text className='text-xs font-medium'>+5s</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const audio = audioRef.current
                  if (audio)
                    audio.currentTime = Math.min(
                      audio.duration,
                      audio.currentTime + 15
                    )
                }}
                className='flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'>
                <Text className='text-xs font-medium'>+15s</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

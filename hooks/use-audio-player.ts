import { useEffect, useState } from 'react'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

export function useAudioPlayer(id: string, post: any) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [expanded, setExpanded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fileUri, setFileUri] = useState<string | null>(null)

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

  useEffect(() => {
    const loadSound = async () => {
      if (sound) await sound.unloadAsync()

      const uri = fileUri ?? post?.meta?.['the-audio-of-the-lesson']
      if (!uri) return

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      )
      setSound(newSound)

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis)
          setDuration(status.durationMillis || 0)
        }
      })
    }

    loadSound()

    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [fileUri, post])

  useEffect(() => {
    if (sound) {
      sound.setRateAsync(playbackRate, true)
    }

    return () => {
      if (sound) {
        sound.setRateAsync(1, true)
      }
    }
  }, [playbackRate])

  const togglePlay = async () => {
    if (!sound) return
    isPlaying ? await sound.pauseAsync() : await sound.playAsync()
    setIsPlaying(!isPlaying)
  }

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value)
    }
  }

  const handleForward = async () => {
    if (sound) {
      await sound.setPositionAsync(currentTime + 30000)
    }
  }

  const handleBackward = async () => {
    if (sound) {
      await sound.setPositionAsync(currentTime - 30000)
    }
  }

  const handleVolumeChange = (value: number) => {
    if (sound) {
      sound.setVolumeAsync(value)
      setVolume(value)
    }
  }

  const handleDownload = async () => {
    const uri = post?.meta?.['the-audio-of-the-lesson']
    if (!uri) return

    const directoryUri = FileSystem.documentDirectory + 'shams_app/'
    const fileUri = directoryUri + `${id}.mp3`

    try {
      const dirInfo = await FileSystem.getInfoAsync(directoryUri)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directoryUri, {
          intermediates: true
        })
      }

      const { uri: downloadedUri } = await FileSystem.downloadAsync(
        uri,
        fileUri
      )
      const fileInfo = await FileSystem.getInfoAsync(downloadedUri)

      if (fileInfo.exists) {
        setFileUri(downloadedUri)
        Alert.alert('Download complete', `File downloaded to ${downloadedUri}`)
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

  const formatTime = (timeMillis: number) => {
    const totalSeconds = timeMillis / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return {
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
    setPlaybackRate,
    post
  }
}

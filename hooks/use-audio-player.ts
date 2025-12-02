import { useEffect, useState, useCallback } from "react"
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync
} from "expo-audio"
import { File, Directory, Paths } from "expo-file-system"
import { Alert, Platform } from "react-native"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useAudioPlayerHook(
  id: string,
  postAudioSrc: any,
  postTitle?: string,
  categoryId?: string,
  categoryName?: string
) {
  const [volume, setVolume] = useState(0.7)
  const [expanded, setExpanded] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fileUri, setFileUri] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: ""
  })

  const { addToDownloads, isLessonDownloaded, removeFromDownloads } =
    useLocalStorage()

  // Determine audio source (local file or remote URL)
  const audioSource = fileUri || postAudioSrc || null

  // Create audio player with expo-audio
  const player = useAudioPlayer(audioSource)

  // Get real-time player status
  const status = useAudioPlayerStatus(player)

  // Initialize audio mode
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionModeAndroid: "duckOthers",
          interruptionMode: "mixWithOthers"
        })
      } catch (error) {
        console.log("Audio initialization error:", error)
      }
    }
    initializeAudio()
  }, [])

  // Set initial volume and handle mute
  useEffect(() => {
    if (player && status.isLoaded) {
      player.volume = isMuted ? 0 : volume
    }
  }, [player, status.isLoaded, volume, isMuted])

  // Set playback rate with preservesPitch to maintain audio quality
  useEffect(() => {
    if (player && status.isLoaded) {
      try {
        // Always correct pitch
        player.shouldCorrectPitch = true
        player.setPlaybackRate(playbackRate)
      } catch (error) {
        player.setPlaybackRate(playbackRate)
      }
    }
  }, [player, status.isLoaded, playbackRate])

  // Check if FileSystem is available
  const isFileSystemAvailable = useCallback(() => {
    try {
      if (__DEV__) {
        console.log("Checking FileSystem availability...")
        console.log("Platform.OS:", Platform.OS)
        console.log("Paths object exists:", !!Paths)
      }

      // Check if we're on a supported platform
      if (Platform.OS === "web") {
        return false
      }

      // Check if Paths module exists and has cache directory
      if (!Paths || !Paths.cache) {
        return false
      }

      // Paths.cache can be either a string or a Directory object
      const cacheDir = Paths.cache
      const isAvailable = !!(
        cacheDir &&
        (typeof cacheDir === "string" ||
          (typeof cacheDir === "object" && cacheDir.uri))
      )

      if (__DEV__) {
        console.log("Cache directory:", Paths.cache)
        console.log("FileSystem available:", isAvailable)
      }

      return isAvailable
    } catch (error) {
      if (__DEV__) {
        console.log("FileSystem check error:", error)
      }
      return false
    }
  }, [])

  // Check if local file exists
  useEffect(() => {
    const checkFileExists = async () => {
      if (!id || !postAudioSrc || !isFileSystemAvailable()) return

      try {
        const fileName = `audio_${id}.mp3`
        const audioFile = new File(Paths.cache, fileName)

        if (audioFile.exists) {
          setFileUri(audioFile.uri)
        }
      } catch (error) {
        if (__DEV__) {
          console.log("Error checking file exists:", error)
        }
      }
    }
    checkFileExists()
  }, [id, postAudioSrc, isFileSystemAvailable])

  // Replace audio source when fileUri changes
  useEffect(() => {
    if (player && audioSource) {
      player.replace(audioSource)
    }
  }, [player, audioSource])

  // Audio control functions
  const togglePlay = useCallback(async () => {
    if (!player) return

    try {
      if (status.playing) {
        player.pause()
      } else {
        player.play()
      }
    } catch (error) {
      console.error("Error toggling play:", error)
    }
  }, [player, status.playing])

  const handleSeek = useCallback(
    async (seconds: number) => {
      if (player) {
        try {
          await player.seekTo(seconds)
        } catch (error) {
          console.error("Error seeking:", error)
        }
      }
    },
    [player]
  )

  const handleForward = useCallback(async () => {
    if (player && status.duration > 0) {
      try {
        const newPosition = Math.min(status.currentTime + 30, status.duration)
        await player.seekTo(newPosition)
      } catch (error) {
        console.error("Error forwarding:", error)
      }
    }
  }, [player, status.currentTime, status.duration])

  const handleBackward = useCallback(async () => {
    if (player) {
      try {
        const newPosition = Math.max(0, status.currentTime - 30)
        await player.seekTo(newPosition)
      } catch (error) {
        console.error("Error rewinding:", error)
      }
    }
  }, [player, status.currentTime])

  const toggleMute = useCallback(() => {
    if (player) {
      try {
        const newMutedState = !isMuted
        setIsMuted(newMutedState)
        player.volume = newMutedState ? 0 : volume
      } catch (error) {
        console.error("Error toggling mute:", error)
      }
    }
  }, [player, isMuted, volume])

  const handleVolumeChange = useCallback(
    (value: number) => {
      if (player) {
        try {
          player.volume = value
          setVolume(value)
        } catch (error) {
          console.error("Error changing volume:", error)
        }
      }
    },
    [player]
  )

  const handleDownload = useCallback(async () => {
    if (!postAudioSrc || !id) {
      Alert.alert("خطا", "اطلاعات فایل صوتی در دسترس نیست")
      return
    }

    // Check if FileSystem is available
    if (!isFileSystemAvailable()) {
      Alert.alert(
        "عدم پشتیبانی دانلود",
        "قابلیت دانلود فایل در این دستگاه/پلتفرم پشتیبانی نمی‌شود.\n\nاما شما می‌توانید از پخش آنلاین استفاده کنید.",
        [{ text: "متوجه شدم", style: "default" }]
      )
      return
    }

    // Check if already downloaded
    if (isLessonDownloaded(id)) {
      setShowDeleteDialog(true)
      return
    }

    setIsDownloading(true)
    setDownloadProgress(0)

    let progressInterval: number | null = null

    try {
      const fileName = `audio_${id}.mp3`

      // Create cache directory reference
      const cacheDirectory =
        typeof Paths.cache === "string"
          ? new Directory(Paths.cache)
          : Paths.cache

      // Ensure cache directory exists
      if (!cacheDirectory.exists) {
        cacheDirectory.create({ intermediates: true })
      }

      // Check if file already exists and remove it first
      const existingFile = new File(cacheDirectory, fileName)
      if (existingFile.exists) {
        existingFile.delete()
      }

      if (__DEV__) {
        console.log("Starting download from:", postAudioSrc)
        console.log("Saving to cache directory:", cacheDirectory)
      }

      // Start simulated progress updates
      progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev < 90) {
            return prev + Math.floor(Math.random() * 15) + 5 // Random increment between 5-19 (whole numbers)
          }
          return prev
        })
      }, 400) // Update every 300ms

      // Download the file using modern API
      const downloadedFile = await File.downloadFileAsync(
        postAudioSrc,
        cacheDirectory,
        { idempotent: true }
      )

      // Clear progress interval and set to 100%
      if (progressInterval !== null) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      setDownloadProgress(100)

      if (__DEV__) {
        console.log("Download completed:", downloadedFile.uri)
      }

      if (downloadedFile.exists) {
        // Get file size
        const fileSize = downloadedFile.size || 0

        if (__DEV__) {
          console.log("Downloaded file size:", fileSize)
        }

        // Add to local storage
        await addToDownloads({
          id,
          title: postTitle || `درس ${id}`,
          categoryId: categoryId || "unknown",
          categoryName: categoryName || "نامشخص",
          content: "", // Audio file doesn't have text content
          audioUrl: postAudioSrc,
          size: fileSize
        })

        setFileUri(downloadedFile.uri)
        setSuccessMessage({
          title: "دانلود موفق",
          message: `فایل صوتی "${
            postTitle || `درس ${id}`
          }" با موفقیت دانلود شد.\n\nحجم فایل: ${
            fileSize > 0
              ? Math.round((fileSize / 1024 / 1024) * 100) / 100 + " مگابایت"
              : "نامشخص"
          }`
        })
        setShowSuccessModal(true)
      } else {
        throw new Error("Download completed but file does not exist")
      }
    } catch (error) {
      // Clear progress interval in case of error
      if (progressInterval !== null) {
        clearInterval(progressInterval)
      }

      console.error("Download error:", error)

      if (error instanceof Error && error.message.includes("Cache directory")) {
        Alert.alert(
          "خطا در سیستم فایل",
          "متأسفانه دسترسی به سیستم فایل دستگاه امکان‌پذیر نیست.\n\nاحتمالاً این مشکل مربوط به تنظیمات دستگاه یا نسخه اپلیکیشن است.",
          [{ text: "متوجه شدم", style: "default" }]
        )
        return
      }

      const errorMessage =
        error instanceof Error ? error.message : "خطای نامشخص"

      Alert.alert(
        "خطا در دانلود",
        `مشکلی در دانلود فایل پیش آمد:\n\n${errorMessage}\n\nلطفاً موارد زیر را بررسی کنید:\n• اتصال اینترنت\n• فضای خالی دستگاه\n• مجوزهای اپلیکیشن`,
        [
          { text: "تلاش مجدد", onPress: () => handleDownload() },
          { text: "انصراف", style: "cancel" }
        ]
      )
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }, [
    postAudioSrc,
    id,
    postTitle,
    categoryId,
    categoryName,
    isFileSystemAvailable,
    isLessonDownloaded,
    addToDownloads,
    removeFromDownloads
  ])

  const confirmDelete = useCallback(async () => {
    try {
      if (isFileSystemAvailable()) {
        const fileName = `audio_${id}.mp3`
        const cacheDirectory =
          typeof Paths.cache === "string"
            ? new Directory(Paths.cache)
            : Paths.cache
        const audioFile = new File(cacheDirectory, fileName)

        if (audioFile.exists) {
          audioFile.delete()
        }
      }

      await removeFromDownloads(id)
      setFileUri(null)
      setShowDeleteDialog(false)

      setSuccessMessage({
        title: "موفق",
        message: "فایل با موفقیت حذف شد"
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error deleting download:", error)
      Alert.alert("خطا", "خطا در حذف فایل")
      setShowDeleteDialog(false)
    }
  }, [id, isFileSystemAvailable, removeFromDownloads])

  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }, [])

  // Test function for development
  const testFileSystem = useCallback(async () => {
    if (__DEV__) {
      console.log("Testing FileSystem capabilities...")
      try {
        const available = isFileSystemAvailable()
        console.log("FileSystem available:", available)

        if (available) {
          const testFile = new File(Paths.cache, "test.txt")
          testFile.write("test")
          const exists = testFile.exists
          console.log("Test file created:", exists)
          if (exists) {
            testFile.delete()
            console.log("Test file cleaned up")
          }
        }
      } catch (error) {
        console.log("FileSystem test failed:", error)
      }
    }
  }, [isFileSystemAvailable])

  // Run test in development mode
  useEffect(() => {
    if (__DEV__) {
      testFileSystem()
    }
  }, [testFileSystem])

  return {
    // Playback state from expo-audio
    isPlaying: status.playing,
    currentTime: status.currentTime,
    duration: status.duration,
    isLoaded: status.isLoaded,
    isBuffering: status.isBuffering,

    // Control functions
    togglePlay,
    handleSeek,
    handleForward,
    handleBackward,
    toggleMute,
    handleDownload,
    confirmDelete,
    formatTime,

    // State management
    volume,
    isMuted,
    showDeleteDialog,
    setShowDeleteDialog,
    showSuccessModal,
    setShowSuccessModal,
    successMessage,
    expanded,
    setExpanded,
    playbackRate,
    setPlaybackRate: useCallback(
      (rate: number) => {
        setPlaybackRate(rate)
        if (player && status?.isLoaded) {
          player.shouldCorrectPitch = true
          player.setPlaybackRate(rate)
        }
      },
      [player, status.isLoaded]
    ),

    // Handle playback rate cycling through predefined values
    handlePlaybackRateToggle: useCallback(() => {
      const rates = [0.75, 1, 1.25, 1.5, 2]
      const currentIndex = rates.indexOf(playbackRate)
      const nextIndex = (currentIndex + 1) % rates.length
      const nextRate = rates[nextIndex]

      setPlaybackRate(nextRate)

      if (player && status?.isLoaded) {
        player.shouldCorrectPitch = true
        player.setPlaybackRate(nextRate)
      }
    }, [playbackRate, player, status?.isLoaded]),

    // Download state
    postAudioSrc,
    isDownloading,
    downloadProgress,
    isDownloaded: isLessonDownloaded(id),
    isFileSystemAvailable: isFileSystemAvailable(),

    // Development helpers
    testFileSystem: __DEV__ ? testFileSystem : undefined,

    // Expose player instance for advanced usage
    player,
    status
  }
}

// Export with the same name as the original hook for compatibility
export { useAudioPlayerHook as useAudioPlayer }

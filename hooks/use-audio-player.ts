import { useEffect, useState, useCallback } from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useAudioPlayerHook(
  id: string,
  postAudioSrc: any,
  postTitle?: string,
  categoryId?: string,
  categoryName?: string,
) {
  const [volume, setVolume] = useState(0.7);
  const [expanded, setExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { addToDownloads, isLessonDownloaded, removeFromDownloads } =
    useLocalStorage();

  // Determine audio source (local file or remote URL)
  const audioSource = fileUri || postAudioSrc || null;

  // Create audio player with expo-audio
  const player = useAudioPlayer(audioSource);

  // Get real-time player status
  const status = useAudioPlayerStatus(player);

  // Initialize audio mode
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionModeAndroid: "duckOthers",
          interruptionMode: "mixWithOthers",
        });
      } catch (error) {
        console.log("Audio initialization error:", error);
      }
    };
    initializeAudio();
  }, []);

  // Set initial volume
  useEffect(() => {
    if (player && status.isLoaded) {
      player.volume = volume;
    }
  }, [player, status.isLoaded, volume]);

  // Set playback rate with preservesPitch to maintain audio quality
  useEffect(() => {
    if (player && status.isLoaded) {
      try {
        // Always correct pitch
        player.shouldCorrectPitch = true;
        player.setPlaybackRate(playbackRate);
      } catch (error) {
        player.setPlaybackRate(playbackRate);
      }
    }
  }, [player, status.isLoaded, playbackRate]);

  // Check if FileSystem is available
  const isFileSystemAvailable = useCallback(() => {
    try {
      if (__DEV__) {
        console.log("Checking FileSystem availability...");
        console.log("Platform.OS:", Platform.OS);
        console.log("FileSystem object exists:", !!FileSystem);
      }

      // Check if we're on a supported platform
      if (Platform.OS === "web") {
        return false;
      }

      // Check if FileSystem module exists
      if (!FileSystem) {
        return false;
      }

      // Try to access documentDirectory using proper API
      const documentDirectory = FileSystem.documentDirectory;

      const isAvailable = !!(
        documentDirectory && typeof documentDirectory === "string"
      );

      if (__DEV__) {
        console.log("documentDirectory:", documentDirectory);
        console.log("FileSystem available:", isAvailable);
      }

      return isAvailable;
    } catch (error) {
      if (__DEV__) {
        console.log("FileSystem check error:", error);
      }
      return false;
    }
  }, []);

  // Check if local file exists
  useEffect(() => {
    const checkFileExists = async () => {
      if (!id || !postAudioSrc || !isFileSystemAvailable()) return;

      try {
        const documentDirectory = FileSystem.documentDirectory;

        if (documentDirectory) {
          const fileName = `audio_${id}.mp3`;
          const localUri = `${documentDirectory}${fileName}`;

          const fileInfo = await FileSystem.getInfoAsync(localUri);
          if (fileInfo.exists) {
            setFileUri(localUri);
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.log("Error checking file exists:", error);
        }
      }
    };
    checkFileExists();
  }, [id, postAudioSrc, isFileSystemAvailable]);

  // Replace audio source when fileUri changes
  useEffect(() => {
    if (player && audioSource) {
      player.replace(audioSource);
    }
  }, [player, audioSource]);

  // Audio control functions
  const togglePlay = useCallback(async () => {
    if (!player) return;

    try {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (error) {
      console.error("Error toggling play:", error);
    }
  }, [player, status.playing]);

  const handleSeek = useCallback(
    async (seconds: number) => {
      if (player) {
        try {
          await player.seekTo(seconds);
        } catch (error) {
          console.error("Error seeking:", error);
        }
      }
    },
    [player],
  );

  const handleForward = useCallback(async () => {
    if (player && status.duration > 0) {
      try {
        const newPosition = Math.min(status.currentTime + 30, status.duration);
        await player.seekTo(newPosition);
      } catch (error) {
        console.error("Error forwarding:", error);
      }
    }
  }, [player, status.currentTime, status.duration]);

  const handleBackward = useCallback(async () => {
    if (player) {
      try {
        const newPosition = Math.max(0, status.currentTime - 30);
        await player.seekTo(newPosition);
      } catch (error) {
        console.error("Error rewinding:", error);
      }
    }
  }, [player, status.currentTime]);

  const handleVolumeChange = useCallback(
    (value: number) => {
      if (player) {
        try {
          player.volume = value;
          setVolume(value);
        } catch (error) {
          console.error("Error changing volume:", error);
        }
      }
    },
    [player],
  );

  const handleDownload = useCallback(async () => {
    if (!postAudioSrc || !id) {
      Alert.alert("خطا", "اطلاعات فایل صوتی در دسترس نیست");
      return;
    }

    // Check if FileSystem is available
    if (!isFileSystemAvailable()) {
      Alert.alert(
        "عدم پشتیبانی دانلود",
        "قابلیت دانلود فایل در این دستگاه/پلتفرم پشتیبانی نمی‌شود.\n\nاما شما می‌توانید از پخش آنلاین استفاده کنید.",
        [{ text: "متوجه شدم", style: "default" }],
      );
      return;
    }

    // Check if already downloaded
    if (isLessonDownloaded(id)) {
      Alert.alert(
        "حذف دانلود",
        "این درس قبلاً دانلود شده است. آیا می‌خواهید آن را حذف کنید؟",
        [
          { text: "لغو", style: "cancel" },
          {
            text: "حذف",
            style: "destructive",
            onPress: async () => {
              try {
                if (isFileSystemAvailable()) {
                  const documentDirectory = FileSystem.documentDirectory;

                  if (documentDirectory) {
                    const fileName = `audio_${id}.mp3`;
                    const localUri = `${documentDirectory}${fileName}`;

                    const fileInfo = await FileSystem.getInfoAsync(localUri);
                    if (fileInfo.exists) {
                      await FileSystem.deleteAsync(localUri);
                    }
                  }
                }

                await removeFromDownloads(id);
                setFileUri(null);

                Alert.alert("موفق", "فایل با موفقیت حذف شد");
              } catch (error) {
                console.error("Error deleting download:", error);
                Alert.alert("خطا", "خطا در حذف فایل");
              }
            },
          },
        ],
      );
      return;
    }

    setIsDownloading(true);

    try {
      const documentDirectory = FileSystem.documentDirectory;

      if (!documentDirectory) {
        throw new Error(
          "Document directory not available - FileSystem API may not be properly initialized",
        );
      }

      const fileName = `audio_${id}.mp3`;
      const localUri = `${documentDirectory}${fileName}`;

      if (__DEV__) {
        console.log("Starting download from:", postAudioSrc);
        console.log("Saving to:", localUri);
      }

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(
        postAudioSrc,
        localUri,
      );

      if (__DEV__) {
        console.log("Download result:", downloadResult);
      }

      if (downloadResult.status === 200) {
        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        const fileSize =
          fileInfo.exists && "size" in fileInfo ? (fileInfo as any).size : 0;

        if (__DEV__) {
          console.log("File info:", fileInfo);
        }

        // Add to local storage
        await addToDownloads({
          id,
          title: postTitle || `درس ${id}`,
          categoryId: categoryId || "unknown",
          categoryName: categoryName || "نامشخص",
          content: "", // Audio file doesn't have text content
          audioUrl: postAudioSrc,
          size: fileSize,
        });

        setFileUri(localUri);
        Alert.alert(
          "دانلود موفق",
          `فایل صوتی "${postTitle || `درس ${id}`}" با موفقیت دانلود شد.\n\nحجم فایل: ${fileSize > 0 ? Math.round((fileSize / 1024 / 1024) * 100) / 100 + " مگابایت" : "نامشخص"}`,
        );
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult.status}`,
        );
      }
    } catch (error) {
      console.error("Download error:", error);

      if (
        error instanceof Error &&
        error.message.includes("Document directory")
      ) {
        Alert.alert(
          "خطا در سیستم فایل",
          "متأسفانه دسترسی به سیستم فایل دستگاه امکان‌پذیر نیست.\n\nاحتمالاً این مشکل مربوط به تنظیمات دستگاه یا نسخه اپلیکیشن است.",
          [{ text: "متوجه شدم", style: "default" }],
        );
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : "خطای نامشخص";

      Alert.alert(
        "خطا در دانلود",
        `مشکلی در دانلود فایل پیش آمد:\n\n${errorMessage}\n\nلطفاً موارد زیر را بررسی کنید:\n• اتصال اینترنت\n• فضای خالی دستگاه\n• مجوزهای اپلیکیشن`,
        [
          { text: "تلاش مجدد", onPress: () => handleDownload() },
          { text: "انصراف", style: "cancel" },
        ],
      );
    } finally {
      setIsDownloading(false);
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
    removeFromDownloads,
  ]);

  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  // Test function for development
  const testFileSystem = useCallback(async () => {
    if (__DEV__) {
      console.log("Testing FileSystem capabilities...");
      try {
        const available = isFileSystemAvailable();
        console.log("FileSystem available:", available);

        if (available) {
          const testFile = `${FileSystem.documentDirectory}test.txt`;
          await FileSystem.writeAsStringAsync(testFile, "test");
          const exists = await FileSystem.getInfoAsync(testFile);
          console.log("Test file created:", exists.exists);
          if (exists.exists) {
            await FileSystem.deleteAsync(testFile);
            console.log("Test file cleaned up");
          }
        }
      } catch (error) {
        console.log("FileSystem test failed:", error);
      }
    }
  }, [isFileSystemAvailable]);

  // Run test in development mode
  useEffect(() => {
    if (__DEV__) {
      testFileSystem();
    }
  }, [testFileSystem]);

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
    handleVolumeChange,
    handleDownload,
    formatTime,

    // State management
    volume,
    expanded,
    setExpanded,
    playbackRate,
    setPlaybackRate: useCallback(
      (rate: number) => {
        setPlaybackRate(rate);
        if (player && status?.isLoaded) {
          player.shouldCorrectPitch = true;
          player.setPlaybackRate(rate);
        }
      },
      [player, status.isLoaded],
    ),

    // Handle playback rate cycling through predefined values
    handlePlaybackRateToggle: useCallback(() => {
      const rates = [0.75, 1, 1.25, 1.5, 2];
      const currentIndex = rates.indexOf(playbackRate);
      const nextIndex = (currentIndex + 1) % rates.length;
      const nextRate = rates[nextIndex];

      setPlaybackRate(nextRate);

      if (player && status?.isLoaded) {
        player.shouldCorrectPitch = true;
        player.setPlaybackRate(nextRate);
      }
    }, [playbackRate, player, status?.isLoaded]),

    // Download state
    postAudioSrc,
    isDownloading,
    isDownloaded: isLessonDownloaded(id),
    isFileSystemAvailable: isFileSystemAvailable(),

    // Development helpers
    testFileSystem: __DEV__ ? testFileSystem : undefined,

    // Expose player instance for advanced usage
    player,
    status,
  };
}

// Export with the same name as the original hook for compatibility
export { useAudioPlayerHook as useAudioPlayer };

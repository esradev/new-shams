import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useAudioPlayer(
  id: string,
  postAudioSrc: any,
  postTitle?: string,
  categoryId?: string,
  categoryName?: string,
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [expanded, setExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { addToDownloads, isLessonDownloaded, removeFromDownloads } =
    useLocalStorage();

  // Initialize audio permissions
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });
      } catch (error) {
        console.log("Audio initialization error:", error);
      }
    };
    initializeAudio();
  }, []);

  // Check if FileSystem is available
  const isFileSystemAvailable = () => {
    try {
      // In development, log debugging info
      if (__DEV__) {
        console.log("Checking FileSystem availability...");
        console.log("Platform.OS:", Platform.OS);
        console.log("FileSystem object exists:", !!FileSystem);
        console.log("FileSystem keys:", Object.keys(FileSystem || {}));
      }

      // Check if we're on a supported platform
      if (Platform.OS === "web") {
        return false;
      }

      // Check if FileSystem module exists
      if (!FileSystem) {
        return false;
      }

      // Try to access documentDirectory with different approaches
      let documentDirectory = null;
      try {
        documentDirectory = (FileSystem as any).documentDirectory;
      } catch (e) {
        // Try alternative access
        try {
          documentDirectory =
            FileSystem["documentDirectory" as keyof typeof FileSystem];
        } catch (e2) {
          if (__DEV__) {
            console.log("Could not access documentDirectory:", e2);
          }
          return false;
        }
      }

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
  };

  useEffect(() => {
    const checkFileExists = async () => {
      if (!id || !postAudioSrc || !isFileSystemAvailable()) return;

      try {
        // Get document directory safely
        let documentDirectory;
        try {
          documentDirectory = (FileSystem as any).documentDirectory;
        } catch (e) {
          documentDirectory =
            FileSystem["documentDirectory" as keyof typeof FileSystem];
        }

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
  }, [id, postAudioSrc]);

  useEffect(() => {
    const loadSound = async () => {
      if (sound) await sound.unloadAsync();

      const uri = fileUri ?? postAudioSrc;
      if (!uri) return;

      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
        );
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying || false);
          }
        });
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [fileUri, postAudioSrc]);

  useEffect(() => {
    if (sound) {
      sound.setRateAsync(playbackRate, true);
    }

    return () => {
      if (sound) {
        sound.setRateAsync(1, true);
      }
    };
  }, [playbackRate, sound]);

  const togglePlay = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error toggling play:", error);
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      try {
        await sound.setPositionAsync(value);
      } catch (error) {
        console.error("Error seeking:", error);
      }
    }
  };

  const handleForward = async () => {
    if (sound) {
      try {
        await sound.setPositionAsync(currentTime + 30000);
      } catch (error) {
        console.error("Error forwarding:", error);
      }
    }
  };

  const handleBackward = async () => {
    if (sound) {
      try {
        const newPosition = Math.max(0, currentTime - 30000);
        await sound.setPositionAsync(newPosition);
      } catch (error) {
        console.error("Error rewinding:", error);
      }
    }
  };

  const handleVolumeChange = (value: number) => {
    if (sound) {
      try {
        sound.setVolumeAsync(value);
        setVolume(value);
        if (value > 0 && isMuted) {
          setIsMuted(false);
        }
        if (value === 0) {
          setIsMuted(true);
        }
      } catch (error) {
        console.error("Error changing volume:", error);
      }
    }
  };

  const toggleMute = () => {
    if (sound) {
      try {
        if (isMuted) {
          // Unmute: restore previous volume
          const volumeToRestore = previousVolume > 0 ? previousVolume : 0.7;
          sound.setVolumeAsync(volumeToRestore);
          setVolume(volumeToRestore);
          setIsMuted(false);
        } else {
          // Mute: save current volume and set to 0
          setPreviousVolume(volume);
          sound.setVolumeAsync(0);
          setVolume(0);
          setIsMuted(true);
        }
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    }
  };

  const handleDownload = async () => {
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
                  // Get document directory safely
                  let documentDirectory;
                  try {
                    documentDirectory = (FileSystem as any).documentDirectory;
                  } catch (e) {
                    documentDirectory =
                      FileSystem[
                        "documentDirectory" as keyof typeof FileSystem
                      ];
                  }

                  if (documentDirectory) {
                    const fileName = `audio_${id}.mp3`;
                    const localUri = `${documentDirectory}${fileName}`;

                    // Remove from device storage
                    const fileInfo = await FileSystem.getInfoAsync(localUri);
                    if (fileInfo.exists) {
                      await FileSystem.deleteAsync(localUri);
                    }
                  }
                }

                // Remove from local storage
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
      // Get document directory safely with fallback
      let documentDirectory;
      try {
        documentDirectory = (FileSystem as any).documentDirectory;
      } catch (e) {
        try {
          documentDirectory =
            FileSystem["documentDirectory" as keyof typeof FileSystem];
        } catch (e2) {
          // Final fallback - try to create a temporary directory path
          documentDirectory = null;
        }
      }

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

      // Special handling for documentDirectory error
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
  };

  const formatTime = (timeMillis: number) => {
    const totalSeconds = timeMillis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Test function for development
  const testFileSystem = async () => {
    if (__DEV__) {
      console.log("Testing FileSystem capabilities...");
      try {
        const available = isFileSystemAvailable();
        console.log("FileSystem available:", available);

        if (available) {
          const testFile = `${(FileSystem as any).documentDirectory}test.txt`;
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
  };

  // Run test in development mode
  useEffect(() => {
    if (__DEV__) {
      testFileSystem();
    }
  }, []);

  return {
    isPlaying,
    togglePlay,
    handleSeek,
    handleForward,
    handleBackward,
    handleVolumeChange,
    toggleMute,
    handleDownload,
    formatTime,
    currentTime,
    duration,
    volume,
    isMuted,
    expanded,
    setExpanded,
    playbackRate,
    setPlaybackRate,
    postAudioSrc,
    isDownloading,
    isDownloaded: isLessonDownloaded(id),
    isFileSystemAvailable: isFileSystemAvailable(),
    testFileSystem: __DEV__ ? testFileSystem : undefined,
  };
}

import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

export function useAudioPlayer(id: string, postAudioSrc: any) {
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

  useEffect(() => {
    const checkFileExists = async () => {
      // Skip file system operations for now to avoid compatibility issues
      console.log(
        "File system operations temporarily disabled for compatibility",
      );
    };
    checkFileExists();
  }, [id]);

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
    const uri = postAudioSrc;
    if (!uri) return;

    try {
      // For now, we'll just alert that the feature is temporarily unavailable
      // due to FileSystem API compatibility issues
      Alert.alert(
        "Download Feature",
        "Download functionality is temporarily unavailable due to system updates. The audio will continue to stream normally.",
      );
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        "Download failed",
        "An error occurred while downloading the file.",
      );
    }
  };

  const formatTime = (timeMillis: number) => {
    const totalSeconds = timeMillis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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
  };
}

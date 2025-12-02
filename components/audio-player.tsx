import React from "react"
import { View, Pressable, Text, ActivityIndicator } from "react-native"
import Slider from "@react-native-community/slider"

import {
  Play,
  Pause,
  Download,
  ChevronsLeft,
  ChevronsRight,
  Gauge
} from "lucide-react-native"

import { useAudioPlayer } from "@/hooks/use-audio-player"

interface AudioPlayerProps {
  id: any
  postAudioSrc: any
  postTitle: any
  categoryId?: string
  categoryName?: string
}

const AudioPlayer = React.memo<AudioPlayerProps>(
  ({ id, postAudioSrc, postTitle, categoryId, categoryName }) => {
    const {
      isPlaying,
      togglePlay,
      handleSeek,
      handleForward,
      handleBackward,
      handleDownload,
      formatTime,
      currentTime,
      duration,
      playbackRate,
      handlePlaybackRateToggle,
      isDownloading,
      isDownloaded,
      isFileSystemAvailable,
      isLoaded,
      isBuffering
    } = useAudioPlayer(id, postAudioSrc, postTitle, categoryId, categoryName)

    return (
      <View
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderTopWidth: 1,
          borderTopColor: "rgba(16, 185, 129, 0.1)",
          backdropFilter: "blur(20px)"
        }}
        className="bg-white/95 dark:bg-gray-900/95"
      >
        {/* Minimal accent line */}
        <View style={{ height: 2 }} className="bg-emerald-500" />

        <View className="px-4 py-3">
          {/* Progress bar */}
          <View className="mb-4">
            <View className="flex flex-row items-center gap-x-3">
              <Text className="text-xs text-gray-600 dark:text-gray-400 min-w-12 text-center font-mono">
                {formatTime(currentTime)}
              </Text>
              <Slider
                style={{ flex: 1, height: 20 }}
                minimumValue={0}
                maximumValue={duration || 1}
                value={currentTime}
                onSlidingComplete={handleSeek}
                disabled={!isLoaded}
                minimumTrackTintColor="#10B981"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#10B981"
              />
              <Text className="text-xs text-gray-600 dark:text-gray-400 min-w-12 text-center font-mono">
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Main controls */}
          <View className="flex flex-row items-center justify-center gap-x-6">
            {/* Playback speed */}
            <Pressable
              onPress={handlePlaybackRateToggle}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                flexDirection: "row",
                alignItems: "center",
                gap: 4
              }}
            >
              <Gauge size={18} color="#10B981" />
              <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                {playbackRate}×
              </Text>
            </Pressable>

            {/* Backward */}
            <Pressable
              onPress={handleBackward}
              style={{
                padding: 8,
                borderRadius: 8
              }}
              className="active:bg-gray-100 dark:active:bg-gray-800"
              aria-label="Skip backward 30 seconds"
            >
              <ChevronsLeft size={20} color="#6B7280" />
            </Pressable>

            {/* Play/Pause */}
            <Pressable
              onPress={togglePlay}
              disabled={!isLoaded || isBuffering}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor:
                  !isLoaded || isBuffering ? "#D1D5DB" : "#10B981",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? (
                <ActivityIndicator size="small" color="white" />
              ) : isPlaying ? (
                <Pause size={20} color="white" />
              ) : (
                <Play size={20} color="white" style={{ marginLeft: 2 }} />
              )}
            </Pressable>

            {/* Forward */}
            <Pressable
              onPress={handleForward}
              style={{
                padding: 8,
                borderRadius: 8
              }}
              className="active:bg-gray-100 dark:active:bg-gray-800"
              aria-label="Skip forward 30 seconds"
            >
              <ChevronsRight size={20} color="#6B7280" />
            </Pressable>

            {/* Download button */}
            {isFileSystemAvailable && (
              <Pressable
                onPress={handleDownload}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: isDownloaded
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(107, 114, 128, 0.1)",
                  opacity: isDownloading ? 0.5 : 1
                }}
                aria-label={isDownloaded ? "Remove download" : "Download audio"}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Download
                    size={16}
                    color={isDownloaded ? "#10B981" : "#6B7280"}
                  />
                )}
              </Pressable>
            )}
          </View>
        </View>
      </View>
    )
  }
)

AudioPlayer.displayName = "AudioPlayer"

export default AudioPlayer

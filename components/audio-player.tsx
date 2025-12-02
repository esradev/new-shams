import React from "react"
import { View, Pressable, Text, ActivityIndicator, Modal } from "react-native"
import Slider from "@react-native-community/slider"

import {
  Play,
  Pause,
  DownloadCloud,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  X,
  Trash2
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
      confirmDelete,
      formatTime,
      currentTime,
      duration,
      playbackRate,
      handlePlaybackRateToggle,
      isDownloading,
      downloadProgress,
      isDownloaded,
      showDeleteDialog,
      setShowDeleteDialog,
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
          backgroundColor: "#ffffff"
        }}
        className="bg-white/95 dark:bg-gray-900/95"
      >
        {/* Minimal accent line */}

        <View className="px-4 py-3">
          {/* Progress bar */}
          <View className="mb-4">
            <View className="flex flex-row items-center gap-x-3">
              <Text className="text-xs text-gray-600 dark:text-gray-400 min-w-12 text-center font-mono">
                {formatTime(currentTime)}
              </Text>
              <Slider
                style={{ flex: 1, height: 40 }}
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
                paddingHorizontal: 6,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                minWidth: 65 // Fixed minimum width to prevent layout shift
              }}
              className="flex-shrink-0"
            >
              <Gauge size={18} color="#10B981" />
              <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                {playbackRate}×
              </Text>
            </Pressable>

            <View className="flex flex-row gap-6 justify-between items-center">
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
                    !isLoaded || isBuffering
                      ? "#D1D5DB"
                      : isPlaying
                      ? "#10B981"
                      : "#059669",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  // Add a subtle border for enhanced appearance
                  borderWidth: !isLoaded || isBuffering ? 0 : 1,
                  borderColor:
                    !isLoaded || isBuffering ? "transparent" : "#059669"
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isBuffering ? (
                  <ActivityIndicator size="small" color="white" />
                ) : isPlaying ? (
                  <Pause size={20} color="white" />
                ) : (
                  <Play size={20} color="white" />
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
            </View>

            {/* Download button */}
            {isFileSystemAvailable && (
              <Pressable
                onPress={handleDownload}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: isDownloaded
                    ? "rgba(107, 114, 128, 0.1)"
                    : isDownloading
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(107, 114, 128, 0.1)",
                  opacity: isDownloading ? 1 : 1,
                  minWidth: isDownloading ? 45 : "auto",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label={isDownloaded ? "Remove download" : "Download audio"}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: "#10B981",
                        fontFamily: "monospace",
                        textAlign: "center"
                      }}
                    >
                      {downloadProgress}%
                    </Text>
                  </View>
                ) : isDownloaded ? (
                  <Trash2
                    size={16}
                    color="#DC2626"
                    fill="rgba(220, 38, 38, 0.1)"
                  />
                ) : (
                  <DownloadCloud size={16} color="#6B7280" />
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Custom Delete Confirmation Modal */}
        <Modal
          visible={showDeleteDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteDialog(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                width: "90%",
                maxWidth: 400,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 8
              }}
              className="bg-white dark:bg-gray-900"
            >
              {/* Header */}
              <View className="flex flex-row items-center justify-between mb-4">
                <Pressable
                  onPress={() => setShowDeleteDialog(false)}
                  style={{
                    padding: 4,
                    borderRadius: 6
                  }}
                  className="active:bg-gray-100 dark:active:bg-gray-800"
                >
                  <X size={20} color="#6B7280" />
                </Pressable>
                <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  حذف فایل دانلود شده
                </Text>
              </View>

              {/* Content */}
              <Text className="text-gray-700 dark:text-gray-300 mb-6 leading-6 text-right">
                این درس قبلاً دانلود شده است. آیا می‌خواهید فایل دانلود شده را
                حذف کنید؟
              </Text>

              {/* Action buttons */}
              <View className="flex flex-row gap-x-3">
                <Pressable
                  onPress={() => setShowDeleteDialog(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#F3F4F6",
                    borderWidth: 1,
                    borderColor: "#E5E7EB"
                  }}
                  className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  <Text className="text-gray-700 dark:text-gray-300 text-center font-medium">
                    انصراف
                  </Text>
                </Pressable>

                <Pressable
                  onPress={confirmDelete}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#EF4444",
                    shadowColor: "#DC2626",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2
                  }}
                >
                  <Text className="text-white text-center font-medium">
                    حذف فایل
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    )
  }
)

AudioPlayer.displayName = "AudioPlayer"

export default AudioPlayer

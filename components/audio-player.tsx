import React from "react";
import { View, Pressable, Text, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";

import {
  Play,
  Pause,
  Volume2,
  Download,
  Minimize2,
  Maximize2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react-native";

import { useAudioPlayer } from "@/hooks/use-audio-player";

interface AudioPlayerProps {
  id: any;
  postAudioSrc: any;
  postTitle: any;
  categoryId?: string;
  categoryName?: string;
}

const AudioPlayer = React.memo<AudioPlayerProps>(
  ({ id, postAudioSrc, postTitle, categoryId, categoryName }) => {
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
      setPlaybackRate,
      isDownloading,
      isDownloaded,
      isFileSystemAvailable,
      isLoaded,
      isBuffering,
    } = useAudioPlayer(id, postAudioSrc, postTitle, categoryId, categoryName);

    return (
      <View
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          right: 0,
          height: expanded ? 208 : 96,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#A7F3D0",
          shadowColor: "#059669",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }}
        className="bg-white dark:bg-stone-900 border-t-emerald-200 dark:border-t-emerald-700"
      >
        {/* Emerald accent line */}
        <View
          style={{ height: 4 }}
          className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 dark:from-emerald-500 dark:via-emerald-400 dark:to-emerald-500"
        />

        <View className="container mx-auto px-6 h-full flex flex-col">
          {/* Main player controls */}
          <View className="flex flex-row items-center justify-between h-20 gap-x-4">
            {/* Left side - Controls */}
            <View className="flex flex-row items-center gap-x-4">
              <Pressable
                onPress={handleBackward}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
                aria-label="Skip backward"
              >
                <ChevronsLeft size={20} color="#047857" />
              </Pressable>

              <Pressable
                onPress={togglePlay}
                disabled={!isLoaded || isBuffering}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor:
                    !isLoaded || isBuffering ? "#A7F3D0" : "#10B981",
                  shadowColor: "#047857",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: !isLoaded || isBuffering ? 0 : 0.2,
                  shadowRadius: 8,
                  elevation: !isLoaded || isBuffering ? 0 : 4,
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isBuffering ? (
                  <ActivityIndicator size="small" color="#047857" />
                ) : isPlaying ? (
                  <Pause size={24} color="white" />
                ) : (
                  <Play size={24} color="white" />
                )}
              </Pressable>

              <Pressable
                onPress={handleForward}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
                aria-label="Skip forward"
              >
                <ChevronsRight size={20} color="#047857" />
              </Pressable>
            </View>

            {/* Center - Track info */}
            <View className="flex-1 mx-4">
              <Text
                className="text-emerald-900 dark:text-emerald-100 font-semibold text-center text-base"
                numberOfLines={1}
                style={{
                  textShadowColor: "rgba(0,0,0,0.1)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {postTitle || "در حال پخش..."}
              </Text>
              <Text className="text-emerald-600 dark:text-emerald-400 text-sm text-center mt-1">
                {isBuffering
                  ? "در حال بارگذاری..."
                  : isLoaded
                    ? "آماده پخش"
                    : "در حال آماده‌سازی..."}
              </Text>
            </View>

            {/* Right side - Actions */}
            <View className="flex flex-row items-center gap-x-3">
              {isFileSystemAvailable && (
                <Pressable
                  onPress={handleDownload}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    backgroundColor: isDownloading
                      ? "#A7F3D0"
                      : isDownloaded
                        ? "#10B981"
                        : "#ECFDF5",
                    borderColor: isDownloading
                      ? "#6EE7B7"
                      : isDownloaded
                        ? "#047857"
                        : "#A7F3D0",
                    opacity: isDownloading ? 0.5 : 1,
                    shadowColor: isDownloaded ? "#047857" : "#059669",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDownloaded ? 0.2 : 0.1,
                    shadowRadius: 4,
                    elevation: isDownloaded ? 3 : 2,
                  }}
                  aria-label={
                    isDownloaded ? "Remove download" : "Download audio"
                  }
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#047857" />
                  ) : (
                    <Download
                      size={20}
                      color={isDownloaded ? "white" : "#047857"}
                    />
                  )}
                </Pressable>
              )}

              <Pressable
                onPress={() => setExpanded(!expanded)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
                aria-label={expanded ? "Minimize player" : "Expand player"}
              >
                {expanded ? (
                  <Minimize2 size={20} color="#047857" />
                ) : (
                  <Maximize2 size={20} color="#047857" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Progress bar */}
          <View className="pb-3 px-2">
            <View className="flex flex-row items-center gap-x-3">
              <Text className="text-xs text-emerald-700 dark:text-emerald-300 min-w-12 text-center font-medium">
                {formatTime(currentTime)}
              </Text>
              <Slider
                style={{ flex: 1, height: 24 }}
                minimumValue={0}
                maximumValue={duration || 1}
                value={currentTime}
                onSlidingComplete={handleSeek}
                disabled={!isLoaded}
                minimumTrackTintColor="#10B981"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#047857"
                thumbStyle={{
                  width: 16,
                  height: 16,
                  shadowColor: "#047857",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              />
              <Text className="text-xs text-emerald-700 dark:text-emerald-300 min-w-12 text-center font-medium">
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Expanded view */}
          {expanded && (
            <View className="flex flex-1 border-t border-emerald-200 dark:border-emerald-700 pt-4 pb-3">
              <View className="flex flex-row items-center justify-around">
                {/* Volume Control */}
                <View className="flex flex-col items-center gap-y-3">
                  <Text className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">
                    صدا
                  </Text>
                  <View className="flex flex-row items-center gap-x-3">
                    <Volume2 size={18} color="#047857" />
                    <Slider
                      style={{ width: 80, height: 24 }}
                      minimumValue={0}
                      maximumValue={1}
                      step={0.01}
                      value={volume}
                      onSlidingComplete={handleVolumeChange}
                      minimumTrackTintColor="#10B981"
                      maximumTrackTintColor="#D1D5DB"
                      thumbTintColor="#047857"
                    />
                    <Text className="text-xs text-emerald-600 dark:text-emerald-400 min-w-8 text-center">
                      {Math.round(volume * 100)}%
                    </Text>
                  </View>
                </View>

                {/* Playback Speed */}
                <View className="flex flex-col items-center gap-y-3">
                  <Text className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">
                    سرعت پخش
                  </Text>
                  <View className="flex flex-row gap-x-2">
                    {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <Pressable
                        key={rate}
                        onPress={() => setPlaybackRate(rate)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 12,
                          backgroundColor:
                            playbackRate === rate ? "#10B981" : "#ECFDF5",
                          borderWidth: playbackRate === rate ? 0 : 1,
                          borderColor: "#A7F3D0",
                          shadowColor:
                            playbackRate === rate ? "#047857" : undefined,
                          shadowOffset:
                            playbackRate === rate
                              ? { width: 0, height: 2 }
                              : undefined,
                          shadowOpacity:
                            playbackRate === rate ? 0.2 : undefined,
                          shadowRadius: playbackRate === rate ? 4 : undefined,
                          elevation: playbackRate === rate ? 3 : undefined,
                        }}
                        className={
                          playbackRate === rate
                            ? ""
                            : "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
                        }
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            playbackRate === rate
                              ? "text-white"
                              : "text-emerald-800 dark:text-emerald-200"
                          }`}
                        >
                          {rate}×
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Audio Quality Indicator */}
                <View className="flex flex-col items-center gap-y-3">
                  <Text className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">
                    وضعیت
                  </Text>
                  <View className="flex items-center gap-y-2">
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: isLoaded
                          ? "#10B981"
                          : isBuffering
                            ? "#10B981"
                            : "#EF4444",
                      }}
                    />
                    <Text className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                      {isLoaded
                        ? "آماده"
                        : isBuffering
                          ? "بارگذاری"
                          : "در انتظار"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Islamic decoration */}
              <View className="mt-4 flex items-center">
                <View
                  style={{ height: 1, width: 128 }}
                  className="bg-gradient-to-r from-transparent via-emerald-400 dark:via-emerald-500 to-transparent opacity-60"
                />
                <Text className="text-emerald-600 dark:text-emerald-400 text-xs mt-2">
                  ☪️ بسم الله الرحمن الرحیم ☪️
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  },
);

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;

import React from "react";
import { View, Pressable, Text } from "react-native";
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
  FastForward,
  Backpack,
  BarChartHorizontal,
} from "lucide-react-native";

import { useAudioPlayer } from "@/hooks/use-audio-player";

const AudioPlayer = React.forwardRef<
  View,
  {
    id: any;
    postAudioSrc: any;
    postTitle: any;
    categoryId?: string;
    categoryName?: string;
  }
>(({ id, postAudioSrc, postTitle, categoryId, categoryName }, ref) => {
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
  } = useAudioPlayer(id, postAudioSrc, postTitle, categoryId, categoryName);

  return (
    <View
      ref={ref}
      className={`fixed left-0 bottom-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 ${
        expanded ? "h-48" : "h-24"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View className="container mx-auto px-4 h-full flex flex-col">
        {/* Main player controls */}
        <View className="flex flex-row items-center justify-between h-16 gap-x-4">
          {/* Left side - Controls */}
          <View className="flex flex-row items-center gap-x-3">
            <Pressable
              onPress={handleBackward}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Skip backward"
            >
              <ChevronsLeft
                size={22}
                className="text-stone-700 dark:text-stone-300"
              />
            </Pressable>

            <Pressable
              onPress={togglePlay}
              className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={22} color="white" />
              ) : (
                <Play size={22} color="white" />
              )}
            </Pressable>

            <Pressable
              onPress={handleForward}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Skip forward"
            >
              <ChevronsRight
                size={22}
                className="text-stone-700 dark:text-stone-300"
              />
            </Pressable>
          </View>

          {/* Right side - Actions */}
          <View className="flex flex-row items-center gap-x-2">
            {isFileSystemAvailable && (
              <Pressable
                onPress={handleDownload}
                className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 ${
                  isDownloading ? "opacity-50" : ""
                }`}
                aria-label={isDownloaded ? "Remove download" : "Download audio"}
                disabled={isDownloading}
              >
                <Download
                  size={22}
                  className={`${
                    isDownloaded
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-stone-600 dark:text-stone-400"
                  }`}
                />
              </Pressable>
            )}

            <Pressable
              onPress={() => setExpanded(!expanded)}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label={expanded ? "Minimize player" : "Expand player"}
            >
              {expanded ? (
                <Minimize2
                  size={22}
                  className="text-stone-600 dark:text-stone-400"
                />
              ) : (
                <Maximize2
                  size={22}
                  className="text-stone-600 dark:text-stone-400"
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* Progress bar */}
        <View className="pb-2 px-1">
          <View className="flex flex-row items-center gap-x-3">
            <Text className="text-xs text-stone-500 dark:text-stone-400 min-w-10 text-center">
              {formatTime(currentTime)}
            </Text>
            <Slider
              style={{ flex: 1, height: 20 }}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#059669" // emerald-600
              maximumTrackTintColor="#e7e5e4" // stone-200
              thumbTintColor="#059669" // emerald-600
            />
            <Text className="text-xs text-stone-500 dark:text-stone-400 min-w-10 text-center">
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Expanded view */}
        {expanded && (
          <View className="flex flex-1 border-t border-stone-200 dark:border-stone-700 pt-4 pb-2">
            <View className="flex flex-row items-center justify-around">
              {/* Volume Control */}
              <View className="flex flex-row items-center gap-x-3">
                <Volume2
                  size={22}
                  className="text-stone-600 dark:text-stone-400"
                />
                <Slider
                  style={{ width: 80, height: 20 }}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  value={volume}
                  onSlidingComplete={handleVolumeChange}
                  minimumTrackTintColor="#059669" // emerald-600
                  maximumTrackTintColor="#e7e5e4" // stone-200
                  thumbTintColor="#059669" // emerald-600
                />
              </View>

              {/* Playback Speed */}
              <View className="flex flex-col items-center gap-y-2">
                <Text className="text-xs text-stone-600 dark:text-stone-400">
                  سرعت پخش
                </Text>
                <View className="flex flex-row gap-x-2">
                  {[0.75, 1, 1.5, 2].map((rate) => (
                    <Pressable
                      key={rate}
                      onPress={() => setPlaybackRate(rate)}
                      className={`px-3 py-1 rounded-full ${
                        playbackRate === rate
                          ? "bg-emerald-600 shadow-sm"
                          : "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          playbackRate === rate
                            ? "text-white"
                            : "text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        {rate}×
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;

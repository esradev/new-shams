import React from "react";
import { View, Pressable, Text } from "react-native";
import Slider from "@react-native-community/slider";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Minimize2,
  Maximize2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react-native";

import { useAudioPlayer } from "@/hooks/use-audio-player";

const AudioPlayer = React.forwardRef<
  View,
  { id: any; postAudioSrc: any; postTitle: any }
>(({ id, postAudioSrc, postTitle }, ref) => {
  const {
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
  } = useAudioPlayer(id, postAudioSrc);

  return (
    <View
      ref={ref}
      className="fixed left-0 bottom-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700"
      style={{
        height: expanded ? 192 : 96, // h-48 = 192px, h-24 = 96px
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
              className="p-2 rounded-full"
              style={{
                backgroundColor: "transparent",
              }}
            >
              <ChevronsLeft
                size={20}
                color="#57534e" // stone-700
              />
            </Pressable>

            <Pressable
              onPress={togglePlay}
              className="p-3 rounded-full shadow-sm"
              style={{
                backgroundColor: "#059669", // emerald-600
              }}
            >
              {isPlaying ? (
                <Pause size={20} color="white" />
              ) : (
                <Play size={20} color="white" />
              )}
            </Pressable>

            <Pressable
              onPress={handleForward}
              className="p-2 rounded-full"
              style={{
                backgroundColor: "transparent",
              }}
            >
              <ChevronsRight
                size={20}
                color="#57534e" // stone-700
              />
            </Pressable>
          </View>

          {/* Center - Lesson info */}
          <View className="flex flex-col flex-1 px-2">
            <Text className="text-sm text-right font-medium text-stone-900 dark:text-stone-100 truncate max-w-full">
              {postTitle}
            </Text>
          </View>

          {/* Right side - Actions */}
          <View className="flex flex-row items-center gap-x-2">
            <Pressable
              onPress={handleDownload}
              className="p-2 rounded-full"
              style={{
                backgroundColor: "transparent",
              }}
            >
              <Download
                size={18}
                color="#78716c" // stone-600
              />
            </Pressable>

            <Pressable
              onPress={() => setExpanded(!expanded)}
              className="p-2 rounded-full"
              style={{
                backgroundColor: "transparent",
              }}
            >
              {expanded ? (
                <Minimize2
                  size={18}
                  color="#78716c" // stone-600
                />
              ) : (
                <Maximize2
                  size={18}
                  color="#78716c" // stone-600
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
                <Pressable
                  onPress={toggleMute}
                  className="p-1 rounded-full"
                  style={{
                    backgroundColor: "transparent",
                  }}
                >
                  {isMuted ? (
                    <VolumeX
                      size={16}
                      color="#ef4444" // red-500 for muted state
                    />
                  ) : (
                    <Volume2
                      size={16}
                      color="#78716c" // stone-600
                    />
                  )}
                </Pressable>
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
                      className="px-3 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          playbackRate === rate ? "#059669" : "#f5f5f4", // emerald-600 : stone-100
                        shadowOpacity: playbackRate === rate ? 0.1 : 0,
                        shadowRadius: playbackRate === rate ? 2 : 0,
                        elevation: playbackRate === rate ? 2 : 0,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: playbackRate === rate ? "#ffffff" : "#44403c", // white : stone-700
                        }}
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

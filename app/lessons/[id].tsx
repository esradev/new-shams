import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import { View, Text, ScrollView, Pressable } from "react-native";
import { ArrowLeft, BookOpen, Calendar, User } from "lucide-react-native";
import axios from "axios";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import RenderHTML from "react-native-render-html";
import { useLocalSearchParams, useNavigation } from "expo-router";

import AudioPlayer from "@/components/audio-player";
import { colorScheme } from "nativewind";

interface ErrorType {
  message: string;
}

interface PostType {
  title: { rendered: string };
  content: { rendered: string };
  meta: { "the-audio-of-the-lesson": string; "date-of-the-lesson": string };
  courseName?: string;
}

export default function LessonPage() {
  const {
    id,
    categorayId,
    categorayName,
    postTitle,
    postContent,
    postAudioSrc,
    postDate,
  } = useLocalSearchParams();

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
        {/* Header */}
        <View className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-3">
          <View className="flex flex-row items-center justify-between">
            <Link
              href={`/courses/${categorayId}`}
              className="flex flex-row items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-full px-3 py-1.5"
            >
              <ArrowLeft
                size={16}
                className="text-stone-600 dark:text-stone-400"
              />
              <Text className="text-sm font-medium text-stone-700 dark:text-stone-300">
                برگشت
              </Text>
            </Link>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: postAudioSrc ? 140 : 20 }}
        >
          {/* Lesson Header Card */}
          <View className="mx-4 mt-4 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800">
            <View className="p-6">
              {/* Course Badge */}
              <View className="mb-4">
                <View className="flex flex-row items-center justify-end gap-2 bg-emerald-50 dark:bg-emerald-900/20 self-end rounded-full px-3 py-1">
                  <Text className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {categorayName}
                  </Text>
                  <BookOpen
                    size={14}
                    className="text-emerald-600 dark:text-emerald-500"
                  />
                </View>
              </View>

              {/* Title */}
              <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100 text-right mb-4 leading-relaxed">
                {postTitle}
              </Text>

              {/* Meta Information */}
              <View className="flex flex-col gap-3">
                <View className="flex flex-row items-center justify-end gap-2">
                  <Text className="text-sm text-stone-600 dark:text-stone-400">
                    آیت الله حسینی آملی (حفظه الله)
                  </Text>
                  <User
                    size={14}
                    className="text-stone-500 dark:text-stone-500"
                  />
                </View>

                {postDate && (
                  <View className="flex flex-row items-center justify-end gap-2">
                    <Text className="text-sm text-stone-600 dark:text-stone-400">
                      {postDate}
                    </Text>
                    <Calendar
                      size={14}
                      className="text-stone-500 dark:text-stone-500"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Content Card */}
          <View className="mx-4 mt-4 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800">
            <View className="p-6">
              <View className="mb-4">
                <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100 text-right">
                  محتوای درس
                </Text>
                <View className="h-px bg-stone-200 dark:bg-stone-700 mt-2" />
              </View>

              <View className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-4">
                <RenderHTML
                  source={{
                    html:
                      (Array.isArray(postContent)
                        ? postContent[0]
                        : postContent) ||
                      `<div style="text-align: right; padding: 20px;">
                        <p style="color: #78716c; font-style: italic;">
                          متأسفانه محتوای این جلسه در حال حاضر در دسترس نیست. لطفا بعدا دوباره مراجعه کنید.
                        </p>
                      </div>`,
                  }}
                  contentWidth={350}
                  baseStyle={{
                    backgroundColor: "transparent",
                    fontSize: 16,
                    lineHeight: 28,
                    color: colorScheme.get() === "dark" ? "#e7e5e4" : "#44403c",
                    textAlign: "right",
                    fontFamily: "System",
                  }}
                  tagsStyles={{
                    p: {
                      marginBottom: 16,
                      textAlign: "right",
                    },
                    h1: {
                      fontSize: 24,
                      fontWeight: "bold",
                      marginBottom: 16,
                      textAlign: "right",
                      color:
                        colorScheme.get() === "dark" ? "#f5f5f4" : "#1c1917",
                    },
                    h2: {
                      fontSize: 20,
                      fontWeight: "600",
                      marginBottom: 12,
                      textAlign: "right",
                      color:
                        colorScheme.get() === "dark" ? "#f5f5f4" : "#1c1917",
                    },
                    h3: {
                      fontSize: 18,
                      fontWeight: "600",
                      marginBottom: 8,
                      textAlign: "right",
                      color:
                        colorScheme.get() === "dark" ? "#f5f5f4" : "#1c1917",
                    },
                    ul: {
                      paddingLeft: 0,
                      paddingRight: 20,
                      textAlign: "right",
                    },
                    ol: {
                      paddingLeft: 0,
                      paddingRight: 20,
                      textAlign: "right",
                    },
                    li: {
                      marginBottom: 8,
                      textAlign: "right",
                    },
                    strong: {
                      fontWeight: "bold",
                      color:
                        colorScheme.get() === "dark" ? "#f5f5f4" : "#1c1917",
                    },
                    em: {
                      fontStyle: "italic",
                    },
                    blockquote: {
                      borderRightWidth: 4,
                      borderRightColor:
                        colorScheme.get() === "dark" ? "#525252" : "#d6d3d1",
                      paddingRight: 16,
                      marginVertical: 16,
                      backgroundColor:
                        colorScheme.get() === "dark" ? "#292524" : "#f7f7f6",
                      paddingVertical: 12,
                      textAlign: "right",
                    },
                  }}
                />
              </View>
            </View>
          </View>

          {/* Audio Section (if audio exists) */}
          {postAudioSrc && (
            <View className="mx-4 mt-4 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800">
              <View className="p-6">
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100 text-right">
                    صوت درس
                  </Text>
                  <View className="h-px bg-stone-200 dark:bg-stone-700 mt-2" />
                </View>

                <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                  <Text className="text-sm text-emerald-700 dark:text-emerald-400 text-right mb-2">
                    برای شنیدن صوت درس از پلیر پایین صفحه استفاده کنید.
                  </Text>
                  <Text className="text-xs text-emerald-600 dark:text-emerald-500 text-right">
                    می‌توانید سرعت پخش را تغییر دهید و فایل صوتی را دانلود کنید.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Spacing for bottom content */}
          <View className="h-6" />
        </ScrollView>

        {/* Audio Player */}
        {postAudioSrc && (
          <AudioPlayer
            id={id}
            postAudioSrc={postAudioSrc}
            postTitle={postTitle}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

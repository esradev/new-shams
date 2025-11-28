import React from "react";
import { View, Text, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { ArrowLeft, Moon, Sun } from "lucide-react-native";
import { Link, useNavigation, usePathname } from "expo-router";

const ios = Platform.OS === "ios";

export default function Header(): JSX.Element {
  const navigation = useNavigation();
  const isHome = usePathname() === "/";
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: ios ? top : top + 8 }}
      className="bg-white/90 dark:bg-stone-950/90 border-b border-stone-200/60 dark:border-stone-800 shadow-sm"
    >
      {/* Content container */}
      <View className="px-4 py-3 flex-row-reverse items-center justify-between">
        {/* Brand */}
        <Link href="/" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رفتن به صفحه اصلی"
            className="flex-1"
          >
            <View className="flex items-end">
              <Text className="text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 text-right">
                شمس المعارف
              </Text>
              <Text className="text-[12px] text-stone-600 dark:text-stone-400 text-right mt-1">
                دروس خارج آیت الله حسینی آملی (حفظه الله)
              </Text>
            </View>
          </Pressable>
        </Link>

        {/* Controls */}
        <View className="flex-row items-center gap-x-2">
          {/* Theme Toggle */}
          <Pressable
            onPress={toggleColorScheme}
            accessibilityRole="button"
            accessibilityLabel="تغییر حالت روشن/تاریک"
            hitSlop={8}
            className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-3"
          >
            {colorScheme === "dark" ? (
              <Sun size={18} color="#F5F5F4" />
            ) : (
              <Moon size={18} color="#1C1917" />
            )}
          </Pressable>

          {/* Back Button (hidden on home) */}
          {!isHome && (
            <Link href={navigation.canGoBack() ? "../" : "/"} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="بازگشت"
                hitSlop={8}
                className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-3"
              >
                <ArrowLeft
                  size={18}
                  color={colorScheme === "dark" ? "#F5F5F4" : "#1C1917"}
                />
              </Pressable>
            </Link>
          )}
        </View>
      </View>
    </View>
  );
}

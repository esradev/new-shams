import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Stack } from "expo-router"

import { ApiProvider } from "@/context/api-context"
import { CacheProvider } from "@/context/cache-context"
import Header from "@/components/header"
import "./global.css"

export default function RootLayout() {
  return (
    <CacheProvider>
      <ApiProvider>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
              name="lessons/[id]"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen
              name="categories/[id]"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeAreaProvider>
      </ApiProvider>
    </CacheProvider>
  )
}

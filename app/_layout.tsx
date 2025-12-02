import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Stack } from "expo-router"
import { Toaster } from "sonner-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { ApiProvider } from "@/context/api-context"
import { CacheProvider } from "@/context/cache-context"
import Header from "@/components/header"
import "./global.css"
import { TextAlignEnd } from "lucide-react-native"

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <Toaster
              richColors
              toastOptions={{
                titleStyle: { textAlign: "right" },
                descriptionStyle: { textAlign: "right" }
              }}
            />
          </SafeAreaProvider>
        </ApiProvider>
      </CacheProvider>
    </GestureHandlerRootView>
  )
}

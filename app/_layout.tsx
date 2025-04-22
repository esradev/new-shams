import { Stack } from 'expo-router'
import './global.css'
import { StatusBar } from 'react-native'
import Header from '@/components/header'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen
        name='courses/[id]'
        options={{ header: () => <Header /> }}
      />
      <Stack.Screen
        name='lessons/[id]'
        options={{ header: () => <Header /> }}
      />
      <Stack.Screen
        name='categories/[id]'
        options={{ header: () => <Header /> }}
      />
      <Stack.Screen name='+not-found' />
    </Stack>
  )
}

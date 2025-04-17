import { Stack } from 'expo-router'
import './global.css'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='courses/[id]' options={{ headerShown: false }} />
      <Stack.Screen name='lessons/[id]' options={{ headerShown: false }} />
      <Stack.Screen name='+not-found' />
    </Stack>
  )
}

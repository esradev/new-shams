import { Tabs } from 'expo-router'
import { Home, Bell, Settings, BookOpen } from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#333',
        headerShown: false
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'صفحه اصلی',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name='courses'
        options={{
          title: 'دروس',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen color={color} size={24} />
          )
        }}
      />
      <Tabs.Screen
        name='alerts'
        options={{
          title: 'اعلانات',
          tabBarIcon: ({ color, focused }) => <Bell color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'تنظیمات',
          tabBarIcon: ({ color, focused }) => (
            <Settings color={color} size={24} />
          )
        }}
      />
    </Tabs>
  )
}

import { Tabs } from 'expo-router'
import { Home, Calendar, Bell, Settings } from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#059669',
        headerShown: false
      }}>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={24} />
        }}
      />
      {/* <Tabs.Screen
        name='courses'
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <Calendar color={color} size={24} />
          )
        }}
      />
      <Tabs.Screen
        name='alerts'
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => <Bell color={color} size={24} />
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Settings color={color} size={24} />
          )
        }}
      /> */}
    </Tabs>
  )
}

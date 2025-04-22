import { View, StyleSheet } from 'react-native'
import React from 'react'
import TabBarButton from './TabBarButton'

interface TabBarProps {
  state: any
  descriptors: any
  navigation: any
}

const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const primaryColor = '#059669'
  const greyColor = '#737373'
  return (
    <View className='absolute bottom-4 z-10 flex-row-reverse justify-between items-center bg-green-50 mx-5 py-2 border border-green-700 rounded-2xl shadow dark:bg-stone-900 dark:border-stone-700'>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name

        if (['_sitemap', '+not-found'].includes(route.name)) return null

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key
          })
        }

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? primaryColor : greyColor}
            label={label}
          />
        )
      })}
    </View>
  )
}

export default TabBar

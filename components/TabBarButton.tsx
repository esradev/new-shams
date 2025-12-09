import { Pressable } from "react-native"
import React, { useEffect } from "react"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated"

import { Book, Home, Search, Settings, BookCheck } from "lucide-react-native"

const icons: { [key: string]: React.ComponentType<any> } = {
  index: props => <Home size={22} {...props} />,
  courses: props => <Book size={22} {...props} />,
  search: props => <Search size={22} {...props} />,
  "my-progress": props => <BookCheck size={22} {...props} />,
  settings: props => <Settings size={22} {...props} />
}

interface TabBarButtonProps {
  isFocused: boolean
  label: string
  routeName: string
  color: string
}

const TabBarButton = (props: TabBarButtonProps) => {
  const { isFocused, label, routeName, color } = props

  const scale = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 350 }
    )
  }, [scale, isFocused])

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2])
    const top = interpolate(scale.value, [0, 1], [0, 8])

    return {
      // styles
      transform: [{ scale: scaleValue }],
      top
    }
  })
  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0])

    return {
      // styles
      opacity
    }
  })
  return (
    <Pressable
      {...props}
      className="flex flex-1 justify-center align-middle items-center gap-x-4"
    >
      <Animated.View style={[animatedIconStyle]}>
        {React.createElement(icons[routeName], { color })}
      </Animated.View>

      <Animated.Text
        style={[
          {
            color,
            fontSize: 12
          },
          animatedTextStyle
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  )
}

export default TabBarButton

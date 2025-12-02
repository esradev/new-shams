import React from "react"
import { View, Text, ActivityIndicator } from "react-native"

/**
 * Loading spinner component props
 */
interface LoadingSpinnerProps {
  /** Custom loading text to display */
  text?: string
  /** Size of the spinner */
  size?: "small" | "large"
  /** Color theme */
  color?: "emerald" | "teal" | "blue" | "gray"
}

/**
 * Simple loading spinner using React Native's ActivityIndicator
 * Clean and performant design for showing loading state
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = "large",
  color = "emerald"
}) => {
  // Color configurations
  const colorConfig = {
    emerald: "#10b981",
    teal: "#0d9488",
    blue: "#2563eb",
    gray: "#6b7280"
  }

  const currentColor = colorConfig[color]

  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="items-center">
        <ActivityIndicator size={size} color={currentColor} />

        {/* Loading text with better typography */}
        {text && (
          <Text className="mt-6 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            {text}
          </Text>
        )}
      </View>
    </View>
  )
}

export default LoadingSpinner

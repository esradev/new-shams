import React from "react"
import { View, Text, Pressable } from "react-native"
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react-native"

interface GlobalErrorProps {
  /** Error message to display */
  message?: string
  /** Optional detailed error description */
  description?: string
  /** Retry function to call when retry button is pressed */
  onRetry?: () => void
  /** Whether retry is currently in progress */
  retryLoading?: boolean
  /** Type of error for different styling */
  type?: "network" | "server" | "general"
  /** Custom retry button text */
  retryText?: string
  /** Whether to show the error in a compact format */
  compact?: boolean
}

/**
 * Global error component for displaying API errors and other failures
 * with a retry button and proper styling for the Islamic app theme
 */
const GlobalError: React.FC<GlobalErrorProps> = ({
  message = "خطایی رخ داده است",
  description,
  onRetry,
  retryLoading = false,
  type = "general",
  retryText = "تلاش مجدد",
  compact = false
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case "network":
        return <WifiOff size={compact ? 32 : 48} color="#DC2626" />
      case "server":
        return <AlertTriangle size={compact ? 32 : 48} color="#DC2626" />
      default:
        return <AlertTriangle size={compact ? 32 : 48} color="#DC2626" />
    }
  }

  const getDefaultDescription = () => {
    switch (type) {
      case "network":
        return "لطفاً اتصال اینترنت خود را بررسی کنید"
      case "server":
        return "مشکلی در سرور رخ داده است. لطفاً بعداً دوباره تلاش کنید"
      default:
        return "لطفاً دوباره تلاش کنید"
    }
  }

  if (compact) {
    return (
      <View className="flex flex-row-reverse items-center justify-between p-4 mx-4 my-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <View className="flex flex-row-reverse items-center flex-1">
          <AlertTriangle size={20} color="#DC2626" />
          <Text className="text-red-700 dark:text-red-400 text-sm font-medium mr-3 flex-1 text-right">
            {message}
          </Text>
        </View>

        {onRetry && (
          <Pressable
            onPress={onRetry}
            disabled={retryLoading}
            className={`px-3 py-1.5 rounded-md transition-all ${
              retryLoading
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-emerald-500 hover:bg-emerald-600 active:scale-95"
            }`}
          >
            <View className="flex flex-row items-center">
              {retryLoading ? (
                <RefreshCw size={14} color="#9CA3AF" className="animate-spin" />
              ) : (
                <RefreshCw size={14} color="#ffffff" />
              )}
              <Text
                className={`text-xs font-medium mr-1 ${
                  retryLoading ? "text-gray-500" : "text-white"
                }`}
              >
                {retryText}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    )
  }

  return (
    <View className="flex-1 items-center justify-center px-6 py-8 bg-white dark:bg-stone-900">
      {/* Error Icon */}
      <View className="mb-6 p-4 rounded-full bg-red-100 dark:bg-red-900/30">
        {getErrorIcon()}
      </View>

      {/* Error Message */}
      <Text className="text-xl font-bold text-red-600 dark:text-red-400 text-center mb-3">
        {message}
      </Text>

      {/* Error Description */}
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
        {description || getDefaultDescription()}
      </Text>

      {/* Retry Button */}
      {onRetry && (
        <Pressable
          onPress={onRetry}
          disabled={retryLoading}
          className={`flex flex-row-reverse items-center px-6 py-3 rounded-xl transition-all ${
            retryLoading
              ? "bg-gray-200 dark:bg-gray-700"
              : "bg-emerald-500 hover:bg-emerald-600 active:scale-95 shadow-md"
          }`}
        >
          {retryLoading ? (
            <RefreshCw size={20} color="#9CA3AF" className="animate-spin" />
          ) : (
            <RefreshCw size={20} color="#ffffff" />
          )}
          <Text
            className={`font-medium text-base mr-2 ${
              retryLoading ? "text-gray-500" : "text-white"
            }`}
          >
            {retryText}
          </Text>
        </Pressable>
      )}

      {/* Additional Help Text */}
      <Text className="text-sm text-gray-500 dark:text-gray-500 text-center mt-6 max-w-sm">
        اگر مشکل همچنان ادامه دارد، لطفاً با پشتیبانی تماس بگیرید
      </Text>
    </View>
  )
}

export default GlobalError

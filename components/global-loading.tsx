import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Loader2, BookOpen, Download } from "lucide-react-native";

interface GlobalLoadingProps {
  /** Loading message to display */
  message?: string;
  /** Optional detailed loading description */
  description?: string;
  /** Type of loading for different styling and icons */
  type?: "default" | "data" | "download";
  /** Whether to show the loading in a compact format */
  compact?: boolean;
  /** Size of the spinner */
  size?: "small" | "large";
  /** Custom color for the spinner */
  color?: string;
}

/**
 * Global loading component for displaying loading states
 * with proper styling for the Islamic app theme
 */
const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  message = "در حال بارگذاری...",
  description,
  type = "default",
  compact = false,
  size = "large",
  color = "#10b981",
}) => {
  const getLoadingIcon = () => {
    switch (type) {
      case "data":
        return <BookOpen size={compact ? 24 : 48} color={color} />;
      case "download":
        return <Download size={compact ? 24 : 48} color={color} />;
      default:
        return <Loader2 size={compact ? 24 : 48} color={color} />;
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case "data":
        return "در حال دریافت اطلاعات...";
      case "download":
        return "در حال دانلود...";
      default:
        return "لطفاً کمی صبر کنید";
    }
  };

  if (compact) {
    return (
      <View className="flex flex-row-reverse items-center justify-center p-4 mx-4 my-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <ActivityIndicator size="small" color={color} />
        <Text className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mr-3 text-right">
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6 py-8 bg-white dark:bg-stone-900">
      {/* Loading Icon */}
      <View className="mb-6 p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <ActivityIndicator size={size} color={color} />
      </View>

      {/* Loading Message */}
      <Text className="text-xl font-bold text-emerald-600 dark:text-emerald-400 text-center mb-3">
        {message}
      </Text>

      {/* Loading Description */}
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
        {description || getDefaultDescription()}
      </Text>
    </View>
  );
};

export default GlobalLoading;

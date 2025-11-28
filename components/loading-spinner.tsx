import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import {
  LessonListSkeleton,
  CourseListSkeleton,
  SearchResultsSkeleton,
  SettingsOverviewSkeleton,
} from "./skeleton-loader";

/**
 * Loading spinner component props
 */
interface LoadingSpinnerProps {
  /** Type of skeleton layout to display based on content being loaded */
  variant?: "lessons" | "courses" | "search" | "settings" | "default";
  /** Number of skeleton items to show (for list variants) */
  count?: number;
  /** Whether to show pulse animation (default: true) */
  animated?: boolean;
}

/**
 * Intelligent loading spinner that displays context-appropriate skeleton layouts
 *
 * This component replaces traditional spinning indicators with content-aware
 * skeleton layouts that match the structure of the content being loaded.
 * Supports both animated and static variants for performance optimization.
 *
 * @param variant - The type of content being loaded
 * @param count - Number of items to show in list variants
 * @param animated - Whether to show pulse animation
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = "default",
  count,
  animated = true,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);
  switch (variant) {
    case "lessons":
      return <LessonListSkeleton count={count} animated={animated} />;

    case "courses":
      return <CourseListSkeleton count={count} animated={animated} />;

    case "search":
      return <SearchResultsSkeleton count={count} animated={animated} />;

    case "settings":
      return <SettingsOverviewSkeleton animated={animated} />;

    default:
      return (
        <View className="flex w-full h-full items-center align-middle justify-center p-6">
          <View className="w-full space-y-4">
            {/* Default skeleton layout */}
            {animated ? (
              <>
                <Animated.View
                  className="bg-gray-200 dark:bg-gray-700 h-8 rounded-md"
                  style={{ opacity }}
                />
                <Animated.View
                  className="bg-gray-200 dark:bg-gray-700 h-6 rounded-md w-3/4"
                  style={{ opacity }}
                />
                <Animated.View
                  className="bg-gray-200 dark:bg-gray-700 h-6 rounded-md w-1/2"
                  style={{ opacity }}
                />
              </>
            ) : (
              <>
                <View className="bg-gray-300 dark:bg-gray-600 h-8 rounded-md opacity-70" />
                <View className="bg-gray-300 dark:bg-gray-600 h-6 rounded-md w-3/4 opacity-70" />
                <View className="bg-gray-300 dark:bg-gray-600 h-6 rounded-md w-1/2 opacity-70" />
              </>
            )}

            <View className="space-y-3 mt-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <View className="flex flex-row-reverse items-center mb-3">
                    {animated ? (
                      <Animated.View
                        className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded-full ml-3"
                        style={{ opacity }}
                      />
                    ) : (
                      <View className="bg-gray-300 dark:bg-gray-600 w-10 h-10 rounded-full ml-3 opacity-70" />
                    )}
                    <View className="flex-1 space-y-2">
                      {animated ? (
                        <>
                          <Animated.View
                            className="bg-gray-200 dark:bg-gray-700 h-4 rounded"
                            style={{ opacity }}
                          />
                          <Animated.View
                            className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3"
                            style={{ opacity }}
                          />
                        </>
                      ) : (
                        <>
                          <View className="bg-gray-300 dark:bg-gray-600 h-4 rounded opacity-70" />
                          <View className="bg-gray-300 dark:bg-gray-600 h-3 rounded w-2/3 opacity-70" />
                        </>
                      )}
                    </View>
                  </View>
                  {animated ? (
                    <>
                      <Animated.View
                        className="bg-gray-200 dark:bg-gray-700 h-3 rounded mb-2"
                        style={{ opacity }}
                      />
                      <Animated.View
                        className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-4/5"
                        style={{ opacity }}
                      />
                    </>
                  ) : (
                    <>
                      <View className="bg-gray-300 dark:bg-gray-600 h-3 rounded mb-2 opacity-70" />
                      <View className="bg-gray-300 dark:bg-gray-600 h-3 rounded w-4/5 opacity-70" />
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      );
  }
};

export default LoadingSpinner;

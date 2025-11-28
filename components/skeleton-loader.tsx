import React, { useEffect, useRef } from "react";
import { View, Text, DimensionValue, Animated } from "react-native";

/**
 * Skeleton loading component props
 */
interface SkeletonProps {
  /** Width of the skeleton element (number or percentage string) */
  width?: DimensionValue;
  /** Height of the skeleton element in pixels */
  height?: number;
  /** Border radius className (e.g., "rounded-md", "rounded-full") */
  borderRadius?: string;
  /** Additional className for styling */
  className?: string;
  /** Whether to show pulse animation (default: true) */
  animated?: boolean;
}

/**
 * Basic skeleton loading element with optional pulse animation
 * Uses React Native's Animated API for smooth performance
 */

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius = "rounded-md",
  className = "",
  animated = true,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!animated) return;

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
  }, [opacity, animated]);

  if (!animated) {
    return (
      <View
        className={`bg-gray-300 dark:bg-gray-600 ${borderRadius} ${className}`}
        style={{ width, height, opacity: 0.7 }}
        accessibilityLabel="Loading content"
        accessible={true}
      />
    );
  }

  return (
    <Animated.View
      className={`bg-gray-200 dark:bg-gray-700 ${borderRadius} ${className}`}
      style={{ width, height, opacity }}
      accessibilityLabel="Loading content"
      accessible={true}
    />
  );
};

/**
 * Card skeleton component for loading card-like content
 * Includes avatar, title, subtitle, and description placeholders
 */
export const CardSkeleton: React.FC<{ animated?: boolean }> = ({
  animated = true,
}) => {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
      <View className="flex flex-row-reverse items-center mb-3">
        <Skeleton
          width={40}
          height={40}
          borderRadius="rounded-full"
          className="ml-3"
          animated={animated}
        />
        <View className="flex-1">
          <Skeleton height={20} className="mb-2" animated={animated} />
          <Skeleton width="70%" height={16} animated={animated} />
        </View>
      </View>
      <Skeleton height={16} className="mb-2" animated={animated} />
      <Skeleton width="80%" height={16} animated={animated} />
    </View>
  );
};

/**
 * List item skeleton component for loading list items
 * Includes circular avatar, title, and subtitle placeholders
 */
export const ListItemSkeleton: React.FC<{ animated?: boolean }> = ({
  animated = true,
}) => {
  return (
    <View className="flex flex-row-reverse items-center p-3 rounded-lg bg-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-700 mb-3">
      <Skeleton
        width={32}
        height={32}
        borderRadius="rounded-full"
        className="ml-3"
        animated={animated}
      />
      <View className="flex-1">
        <Skeleton height={18} className="mb-2" animated={animated} />
        <Skeleton width="60%" height={14} animated={animated} />
      </View>
      <Skeleton
        width={24}
        height={24}
        borderRadius="rounded-full"
        animated={animated}
      />
    </View>
  );
};

/**
 * Category card skeleton component for loading category/course cards
 * Includes title, description, icon, and tags placeholders
 */
export const CategoryCardSkeleton: React.FC<{ animated?: boolean }> = ({
  animated = true,
}) => {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 shadow-sm">
      <View className="flex flex-row-reverse items-start justify-between mb-3">
        <View className="flex-1">
          <Skeleton height={24} className="mb-2" animated={animated} />
          <Skeleton
            width="80%"
            height={16}
            className="mb-3"
            animated={animated}
          />
        </View>
        <Skeleton
          width={48}
          height={48}
          borderRadius="rounded-xl"
          animated={animated}
        />
      </View>
      <View className="flex flex-row-reverse items-center">
        <Skeleton
          width={60}
          height={20}
          borderRadius="rounded-full"
          className="ml-2"
          animated={animated}
        />
        <Skeleton width={80} height={16} animated={animated} />
      </View>
    </View>
  );
};

/**
 * Course list skeleton component for loading course/category listings
 * Shows a title and multiple category cards
 */
export const CourseListSkeleton: React.FC<{
  count?: number;
  animated?: boolean;
}> = ({ count = 3, animated = true }) => {
  return (
    <View className="p-6">
      <View className="mb-8">
        <Skeleton
          height={28}
          width="60%"
          className="mb-4"
          animated={animated}
        />
        {Array.from({ length: count }).map((_, index) => (
          <CategoryCardSkeleton key={index} animated={animated} />
        ))}
      </View>
    </View>
  );
};

/**
 * Lesson list skeleton component for loading lesson/post listings
 * Includes header, description, search bar, and lesson items
 */
export const LessonListSkeleton: React.FC<{
  count?: number;
  animated?: boolean;
}> = ({ count = 5, animated = true }) => {
  return (
    <View className="px-4 py-5">
      {/* Header Skeleton */}
      <View className="flex flex-row-reverse justify-between items-start mb-2">
        <Skeleton height={32} width="70%" animated={animated} />
      </View>

      <View className="flex flex-row-reverse items-center mb-4">
        <Skeleton
          height={24}
          width={80}
          borderRadius="rounded-full"
          className="ml-2"
          animated={animated}
        />
        <Text className="mx-2 text-gray-400">•</Text>
        <Skeleton height={16} width="60%" animated={animated} />
      </View>

      {/* Description Skeleton */}
      <View className="mb-6">
        <Skeleton
          height={24}
          width="40%"
          className="mb-2"
          animated={animated}
        />
        <Skeleton height={16} className="mb-2" animated={animated} />
        <Skeleton height={16} width="80%" animated={animated} />
      </View>

      {/* Lessons Title */}
      <Skeleton height={24} width="30%" className="mb-3" animated={animated} />

      {/* Lesson Items */}
      <View className="gap-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <ListItemSkeleton key={index} animated={animated} />
        ))}
      </View>
    </View>
  );
};

/**
 * Search results skeleton component for loading search result cards
 * Shows simplified card layout optimized for search results
 */
export const SearchResultsSkeleton: React.FC<{
  count?: number;
  animated?: boolean;
}> = ({ count = 3, animated = true }) => {
  return (
    <View className="gap-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <View className="flex flex-row-reverse items-start justify-between">
            <View className="flex-1">
              <Skeleton height={24} className="mb-2" animated={animated} />
              <View className="flex flex-row-reverse items-center flex-wrap gap-3">
                <Skeleton width={60} height={16} animated={animated} />
                <Skeleton width={80} height={16} animated={animated} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Statistics card skeleton component for loading stat cards
 * Includes icon and number/text placeholders
 */
export const StatCardSkeleton: React.FC<{ animated?: boolean }> = ({
  animated = true,
}) => {
  return (
    <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
      <View className="flex flex-row-reverse items-center justify-between">
        <Skeleton
          width={24}
          height={24}
          borderRadius="rounded"
          animated={animated}
        />
        <View className="flex-1 ml-3">
          <Skeleton
            height={32}
            width="50%"
            className="mb-1"
            animated={animated}
          />
          <Skeleton height={16} width="80%" animated={animated} />
        </View>
      </View>
    </View>
  );
};

/**
 * Settings overview skeleton component for loading settings page
 * Includes title, stats grid, and activity list placeholders
 */
export const SettingsOverviewSkeleton: React.FC<{ animated?: boolean }> = ({
  animated = true,
}) => {
  return (
    <View className="px-4 py-6 space-y-4">
      <Skeleton height={32} width="40%" className="mb-4" animated={animated} />

      <View className="grid grid-cols-2 gap-4">
        <StatCardSkeleton animated={animated} />
        <StatCardSkeleton animated={animated} />
        <StatCardSkeleton animated={animated} />
        <StatCardSkeleton animated={animated} />
      </View>

      <View className="mt-6">
        <Skeleton
          height={28}
          width="50%"
          className="mb-4"
          animated={animated}
        />
        <View className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <View
              key={index}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <View className="flex flex-row-reverse items-center">
                <Skeleton
                  width={16}
                  height={16}
                  borderRadius="rounded"
                  className="ml-3"
                  animated={animated}
                />
                <View className="flex-1">
                  <Skeleton height={18} className="mb-1" animated={animated} />
                  <Skeleton height={14} width="70%" animated={animated} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Skeleton;

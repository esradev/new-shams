import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react-native";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  setPage,
}) => {
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const renderPageButton = (
    pageNumber: number | string,
    isActive: boolean = false,
  ) => {
    if (pageNumber === "...") {
      return (
        <View key="dots" className="px-3 py-2">
          <Text className="text-gray-400 dark:text-gray-500">...</Text>
        </View>
      );
    }

    return (
      <Pressable
        key={pageNumber}
        onPress={() => typeof pageNumber === "number" && setPage(pageNumber)}
        disabled={typeof pageNumber !== "number"}
        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
          isActive
            ? "bg-emerald-600 border-emerald-600"
            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            isActive ? "text-white" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {pageNumber}
        </Text>
      </Pressable>
    );
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <View className="flex flex-col items-center gap-y-4 py-6 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Page Info */}
      <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
        نمایش صفحه {page} از {totalPages} ({totalPages > 1 ? "صفحات" : "صفحه"})
      </Text>

      {/* Pagination Controls */}
      <View className="flex flex-row-reverse items-center gap-x-1">
        {/* First Page */}
        <Pressable
          onPress={() => setPage(1)}
          disabled={page === 1}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            page === 1
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <ChevronsRight size={16} color={page === 1 ? "#9CA3AF" : "#6B7280"} />
        </Pressable>

        {/* Previous Page */}
        <Pressable
          onPress={() => canGoBack && setPage(page - 1)}
          disabled={!canGoBack}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            !canGoBack
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <ChevronRight size={16} color={!canGoBack ? "#9CA3AF" : "#6B7280"} />
        </Pressable>

        {/* Page Numbers */}
        <View className="flex flex-row-reverse items-center gap-x-1 mx-2">
          {visiblePages.map((pageNumber) =>
            renderPageButton(pageNumber, pageNumber === page),
          )}
        </View>

        {/* Next Page */}
        <Pressable
          onPress={() => canGoForward && setPage(page + 1)}
          disabled={!canGoForward}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            !canGoForward
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <ChevronLeft
            size={16}
            color={!canGoForward ? "#9CA3AF" : "#6B7280"}
          />
        </Pressable>

        {/* Last Page */}
        <Pressable
          onPress={() => setPage(totalPages)}
          disabled={page === totalPages}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            page === totalPages
              ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <ChevronsLeft
            size={16}
            color={page === totalPages ? "#9CA3AF" : "#6B7280"}
          />
        </Pressable>
      </View>

      {/* Quick Navigation (for mobile) */}
      {totalPages > 5 && (
        <View className="flex flex-row-reverse items-center gap-x-2">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            برو به صفحه:
          </Text>
          <View className="flex flex-row-reverse gap-x-1">
            {[1, Math.ceil(totalPages / 2), totalPages].map((quickPage) => (
              <Pressable
                key={`quick-${quickPage}`}
                onPress={() => setPage(quickPage)}
                disabled={quickPage === page}
                className={`px-3 py-1 rounded-md border ${
                  quickPage === page
                    ? "bg-emerald-600 border-emerald-600"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    quickPage === page
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {quickPage}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default Pagination;

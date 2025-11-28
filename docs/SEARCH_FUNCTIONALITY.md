# Search Functionality Documentation

This document describes the search functionality implemented in the Shams-Al-Maarif mobile application.

## Overview

The search functionality allows users to search through lessons/posts using the WordPress REST API search capabilities. It includes both global search and category-specific search features with proper navigation, date formatting, search term highlighting, and advanced filtering controls.

## Features

### 1. Global Search (`/app/(tabs)/search.tsx`)
- **Search Input**: Real-time search with 500ms debounce
- **Category Filtering**: Users can filter search results by selecting specific categories
- **Clear Filters**: Easy-to-use button to clear all selected category filters
- **Selected Categories Summary**: Visual display of currently selected filters
- **Search Results**: Displays matching posts with highlighted search terms
- **Pagination**: Supports loading more results
- **Empty States**: Proper handling of no results and error states
- **Search Term Highlighting**: Highlights search terms in both results and lesson content

### 2. Category-Specific Search (`/app/categories/[id].tsx`)
- **In-Category Search**: Search within a specific category
- **Seamless Integration**: Search input integrated into category page
- **Result Display**: Shows search results or regular category posts
- **Proper Navigation**: Search results include all necessary data for lesson navigation
- **Search Context Preservation**: Maintains search query when navigating to lesson pages

### 3. Lesson Content Highlighting (`/app/lessons/[id].tsx`)
- **Content Highlighting**: Search terms highlighted in lesson content
- **Title Highlighting**: Search terms highlighted in lesson titles
- **Search Context Display**: Shows search query indicator when accessed from search
- **HTML Content Processing**: Safe highlighting of HTML content using RenderHTML

## Technical Implementation

### Hooks

#### `useSearch` (`/hooks/use-search.ts`)
- Handles WordPress REST API search requests
- Supports category filtering
- Manages pagination and loading states
- Provides search and clearSearch functions

```typescript
interface SearchParams {
  query: string
  categories: number[]
  page?: number
  perPage?: number
}
```

#### API Integration
- Uses WordPress REST API endpoint: `/wp-json/wp/v2/posts`
- Search parameters:
  - `search`: Search query
  - `categories`: Comma-separated category IDs
  - `page`: Page number for pagination
  - `per_page`: Number of results per page
  - `orderby`: Results ordering (relevance for search)

### Components

#### `SearchResultCard` (`/components/search-result-card.tsx`)
- Reusable component for displaying search results
- Features:
  - Search term highlighting
  - Post metadata display (duration, date)
  - Completion status indicator
  - RTL text support
  - Proper navigation with all required parameters
  - Category badge display
  - Audio content indicator

### Context Integration

#### `ApiContext` (`/context/api-context.tsx`)
- Integrated search functions into global API context
- Provides access to search functionality throughout the app
- Manages categories data for filtering

### Utilities

#### `Date Utilities` (`/utils/date-utils.ts`)
- `formatPersianDate()`: Safely formats dates to Persian locale
- `isValidDate()`: Validates date strings before formatting
- `formatEnglishDate()`: Alternative English date formatting
- Handles multiple date formats from WordPress API

#### `Text Highlighting Utilities` (`/utils/text-highlight.ts`)
- `highlightSearchTerms()`: Highlights search terms in plain text
- `createHighlightedHTML()`: Creates highlighted HTML content for RenderHTML
- `splitTextForHighlighting()`: Splits text into highlighted and non-highlighted parts
- Supports multiple search terms and case-insensitive matching
- React Native compatible highlighting with proper styling

## User Interface

### Search Page Features
1. **Search Input**
   1. **Search Input**: Real-time search with 500ms debounce
      - Placeholder: "جستجو در درس‌ها..." (Search in lessons...)
      - Clear button when text is entered
      - Search icon indicator

   2. **Category Filter**
      - Toggleable filter section
      - Horizontal scrolling category chips with FlatList
      - Selected categories counter badge
      - Category name and post count display
      - Clear filters button with FilterX icon
      - Selected categories summary section
      - Individual category removal from summary

3. **Results Display**
   - Search result cards with highlighting
   - Loading spinners for async operations
   - Result count display
   - Pagination support
   - Search term highlighting in titles and metadata

4. **Empty States**
   - No search query: Shows search prompt
   - No results: "No results found" message
   - Error state: Error message with retry button

5. **Filter Management**
   - Visual indication of active filters
   - Easy filter removal
   - Clear all filters functionality

### Category Page Search
1. **Search Input**
   - Integrated into category page header
   - Placeholder: "جستجو در این دسته..." (Search in this category...)
   - Automatic category filtering

2. **Result Switching**
   - Seamlessly switches between search results and category posts
   - Clear search functionality
   - Search query display in results header
   - Preserved search context in navigation

### Lesson Page Highlighting
1. **Content Highlighting**
   - Search terms highlighted in lesson content
   - Custom mark styling for light and dark themes
   - Search context indicator at top of content

2. **Title Highlighting**
   - Search terms highlighted in lesson titles
   - Consistent styling with content highlighting

## Styling

- **RTL Support**: Full right-to-left text support for Persian content
- **Dark Mode**: Complete dark mode support
- **Responsive Design**: Optimized for mobile devices
- **Consistent Theming**: Uses Tailwind CSS classes for consistent styling

## Performance Optimizations

1. **Debouncing**: 500ms debounce on search input to reduce API calls
2. **Pagination**: Implements proper pagination to handle large result sets
3. **Loading States**: Clear loading indicators during API requests
4. **Error Handling**: Comprehensive error handling with retry mechanisms
5. **Date Caching**: Efficient date formatting with validation checks
6. **Type Safety**: Full TypeScript support with proper type definitions

## API Endpoints Used

- **Search Posts**: `GET /wp-json/wp/v2/posts?search={query}&categories={ids}&_embed=wp:term`
- **Categories**: `GET /wp-json/wp/v2/categories?per_page=100`

## Bug Fixes Implemented

### Date Formatting Issues
- **Problem**: Invalid dates displayed as "Invalid Date"
- **Solution**: Created comprehensive date utility functions
- **Implementation**: 
  - Added `formatPersianDate()` function with multiple format support
  - Added date validation with `isValidDate()`
  - Handles Unix timestamps, ISO dates, and invalid inputs gracefully

### Navigation Issues from Search Results
- **Problem**: Search result clicks didn't load lesson content properly
- **Solution**: Updated navigation to pass all required parameters
- **Implementation**:
  - Modified `SearchResultCard` to include complete lesson data
  - Updated href structure to use proper route parameters
  - Added category information resolution
  - Fixed TypeScript route typing issues

### Horizontal Scrolling Issues
- **Problem**: Category filter couldn't scroll horizontally
- **Solution**: Replaced ScrollView with FlatList and proper RTL configuration
- **Implementation**:
  - Used FlatList with `horizontal` and `inverted` props
  - Proper styling for RTL layout
  - Better performance with virtualization

### Filter Management
- **Problem**: No way to easily clear or manage selected filters
- **Solution**: Added comprehensive filter management UI
- **Implementation**:
  - Clear all filters button with visual confirmation
  - Selected categories summary with individual removal
  - Visual indicators for active filter state

## Future Enhancements

1. **Search History**: Save and display recent search queries
2. **Advanced Filters**: Add date range, author, and content type filters
3. **Search Analytics**: Track popular search terms
4. **Offline Search**: Cache popular content for offline search
5. **Voice Search**: Implement voice-to-text search functionality
6. **Search Suggestions**: Provide autocomplete suggestions

## Dependencies

- `axios`: HTTP client for API requests
- `lucide-react-native`: Icons for UI components
- `expo-router`: Navigation and linking
- `react-native-safe-area-context`: Safe area handling

## Usage Examples

### Basic Search
```typescript
const { search } = useSearch()

// Search all posts
await search({
  query: "lesson title",
  categories: []
})

// Search in specific categories
await search({
  query: "lesson title",
  categories: [1, 2, 3]
})
```

### Using in Components
```typescript
import { useApi } from '@/context/api-context'

function MyComponent() {
  const { searchFunctions } = useApi()
  // Use searchFunctions.search, searchFunctions.posts, etc.
}
```

### Date Formatting
```typescript
import { formatPersianDate, isValidDate } from '@/utils/date-utils'

// Safe date formatting
const formattedDate = isValidDate(dateString) 
  ? formatPersianDate(dateString) 
  : 'تاریخ نامعتبر'
```

### Navigation with Search Results
```typescript
// Proper navigation with all required parameters including search query
<Link
  href={{
    pathname: "/lessons/[id]" as any,
    params: {
      id: post.id.toString(),
      postTitle: post.title.rendered,
      postContent: post.content?.rendered || "",
      postAudioSrc: post.meta?.["the-audio-of-the-lesson"] || "",
      postDate: formattedDate || "",
      categorayId: postCategory?.id?.toString() || "",
      categorayName: postCategory?.name || "عمومی",
      searchQuery: searchQuery || "",
    },
  }}
>
```

### Search Term Highlighting
```typescript
import { createHighlightedHTML } from '@/utils/text-highlight'

// Highlight content in lesson page
const processedContent = () => {
  const content = postContent || defaultContent;
  
  if (searchQuery && searchQuery.trim()) {
    return createHighlightedHTML(
      content,
      searchQuery,
      colorScheme.get() === "dark"
    );
  }
  
  return content;
};
```

### Clear Filters Implementation
```typescript
const clearFilters = () => {
  setSelectedCategories([]);
};

// Clear filters button
<Pressable onPress={clearFilters}>
  <FilterX size={14} color="#DC2626" />
  <Text>پاک کردن فیلترها</Text>
</Pressable>
```

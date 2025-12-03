import { useMemo } from "react"
import { useLocalStorage } from "./use-local-storage"
import { useFetchCategories } from "./use-fetch-categories"

export interface CourseProgress {
  categoryId: string
  categoryName: string
  completedLessons: number
  totalLessons: number
  progressPercentage: number
  lastCompletedLesson: {
    id: string
    title: string
    completedAt: number
  } | null
  recentCompletedLessons: Array<{
    id: string
    title: string
    completedAt: number
  }>
}

export function useCoursesProgress() {
  const { completedLessons, loading: storageLoading } = useLocalStorage()
  const { categories, loading: categoriesLoading } = useFetchCategories()

  const coursesWithProgress = useMemo(() => {
    if (!categories.length) return []

    // Group completed lessons by category
    const completedByCategory = completedLessons.reduce((acc, lesson) => {
      const categoryId = lesson.categoryId
      if (!acc[categoryId]) {
        acc[categoryId] = []
      }
      acc[categoryId].push(lesson)
      return acc
    }, {} as Record<string, typeof completedLessons>)

    // Create progress data for all categories (including those without completed lessons)
    const progressData: CourseProgress[] = categories.map(category => {
      const categoryId = category.id.toString()
      const categoryLessons = completedByCategory[categoryId] || []
      const sortedLessons = categoryLessons.sort(
        (a, b) => b.completedAt - a.completedAt
      )
      const totalLessons = category.count
      const completedCount = categoryLessons.length

      return {
        categoryId,
        categoryName: category.name,
        completedLessons: completedCount,
        totalLessons,
        progressPercentage:
          totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0,
        lastCompletedLesson:
          sortedLessons.length > 0
            ? {
                id: sortedLessons[0].id,
                title: sortedLessons[0].title,
                completedAt: sortedLessons[0].completedAt
              }
            : null,
        recentCompletedLessons: sortedLessons.slice(0, 5) // Get 5 most recent
      }
    })

    return progressData
  }, [completedLessons, categories])

  const coursesInProgress = useMemo(() => {
    return coursesWithProgress.filter(course => course.completedLessons > 0)
  }, [coursesWithProgress])

  const statistics = useMemo(() => {
    const totalCourses = coursesWithProgress.length
    const coursesStarted = coursesInProgress.length
    const totalLessonsCompleted = completedLessons.length
    const averageProgress =
      coursesStarted > 0
        ? Math.round(
            coursesInProgress.reduce(
              (sum, course) => sum + course.progressPercentage,
              0
            ) / coursesStarted
          )
        : 0

    const completedCourses = coursesInProgress.filter(
      course => course.progressPercentage === 100
    ).length

    return {
      totalCourses,
      coursesStarted,
      completedCourses,
      totalLessonsCompleted,
      averageProgress,
      coursesNotStarted: totalCourses - coursesStarted
    }
  }, [coursesWithProgress, coursesInProgress, completedLessons.length])

  return {
    coursesWithProgress,
    coursesInProgress,
    statistics,
    loading: storageLoading || categoriesLoading
  }
}

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserActivity {
  id: string;
  type: 'completed' | 'favorited' | 'downloaded' | 'started';
  lessonId: string;
  lessonTitle: string;
  categoryId: string;
  categoryName: string;
  timestamp: number;
  audioUrl?: string;
}

export interface CompletedLesson {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  completedAt: number;
}

export interface FavoriteLesson {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  content?: string;
  audioUrl?: string;
  favoritedAt: number;
}

export interface DownloadedLesson {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  content: string;
  audioUrl?: string;
  downloadedAt: number;
  size?: number; // in bytes
}

const STORAGE_KEYS = {
  COMPLETED_LESSONS: 'completedLessons',
  FAVORITE_LESSONS: 'favoriteLessons',
  DOWNLOADED_LESSONS: 'downloadedLessons',
  USER_ACTIVITIES: 'userActivities',
};

export const useLocalStorage = () => {
  const [completedLessons, setCompletedLessons] = useState<CompletedLesson[]>([]);
  const [favoriteLessons, setFavoriteLessons] = useState<FavoriteLesson[]>([]);
  const [downloadedLessons, setDownloadedLessons] = useState<DownloadedLesson[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [completed, favorites, downloaded, activities] = await Promise.all([
        getStoredData<CompletedLesson[]>(STORAGE_KEYS.COMPLETED_LESSONS, []),
        getStoredData<FavoriteLesson[]>(STORAGE_KEYS.FAVORITE_LESSONS, []),
        getStoredData<DownloadedLesson[]>(STORAGE_KEYS.DOWNLOADED_LESSONS, []),
        getStoredData<UserActivity[]>(STORAGE_KEYS.USER_ACTIVITIES, []),
      ]);

      setCompletedLessons(completed);
      setFavoriteLessons(favorites);
      setDownloadedLessons(downloaded);
      setUserActivities(activities);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStoredData = async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return defaultValue;
    }
  };

  const storeData = async (key: string, value: any) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  };

  const addActivity = async (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
    const newActivity: UserActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    const updatedActivities = [newActivity, ...userActivities].slice(0, 100); // Keep only latest 100 activities
    setUserActivities(updatedActivities);
    await storeData(STORAGE_KEYS.USER_ACTIVITIES, updatedActivities);
  };

  // Completed Lessons Functions
  const markLessonCompleted = async (lesson: Omit<CompletedLesson, 'completedAt'>) => {
    const isAlreadyCompleted = completedLessons.some(l => l.id === lesson.id);
    if (isAlreadyCompleted) return false;

    const completedLesson: CompletedLesson = {
      ...lesson,
      completedAt: Date.now(),
    };

    const updatedCompleted = [...completedLessons, completedLesson];
    setCompletedLessons(updatedCompleted);
    await storeData(STORAGE_KEYS.COMPLETED_LESSONS, updatedCompleted);

    await addActivity({
      type: 'completed',
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      categoryId: lesson.categoryId,
      categoryName: lesson.categoryName,
    });

    return true;
  };

  const markLessonIncomplete = async (lessonId: string) => {
    const updatedCompleted = completedLessons.filter(l => l.id !== lessonId);
    setCompletedLessons(updatedCompleted);
    await storeData(STORAGE_KEYS.COMPLETED_LESSONS, updatedCompleted);
    return true;
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return completedLessons.some(l => l.id === lessonId);
  };

  // Favorite Lessons Functions
  const addToFavorites = async (lesson: Omit<FavoriteLesson, 'favoritedAt'>) => {
    const isAlreadyFavorited = favoriteLessons.some(l => l.id === lesson.id);
    if (isAlreadyFavorited) return false;

    const favoriteLesson: FavoriteLesson = {
      ...lesson,
      favoritedAt: Date.now(),
    };

    const updatedFavorites = [...favoriteLessons, favoriteLesson];
    setFavoriteLessons(updatedFavorites);
    await storeData(STORAGE_KEYS.FAVORITE_LESSONS, updatedFavorites);

    await addActivity({
      type: 'favorited',
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      categoryId: lesson.categoryId,
      categoryName: lesson.categoryName,
    });

    return true;
  };

  const removeFromFavorites = async (lessonId: string) => {
    const updatedFavorites = favoriteLessons.filter(l => l.id !== lessonId);
    setFavoriteLessons(updatedFavorites);
    await storeData(STORAGE_KEYS.FAVORITE_LESSONS, updatedFavorites);
    return true;
  };

  const isLessonFavorited = (lessonId: string): boolean => {
    return favoriteLessons.some(l => l.id === lessonId);
  };

  // Downloaded Lessons Functions
  const addToDownloads = async (lesson: Omit<DownloadedLesson, 'downloadedAt'>) => {
    const isAlreadyDownloaded = downloadedLessons.some(l => l.id === lesson.id);
    if (isAlreadyDownloaded) return false;

    const downloadedLesson: DownloadedLesson = {
      ...lesson,
      downloadedAt: Date.now(),
    };

    const updatedDownloads = [...downloadedLessons, downloadedLesson];
    setDownloadedLessons(updatedDownloads);
    await storeData(STORAGE_KEYS.DOWNLOADED_LESSONS, updatedDownloads);

    await addActivity({
      type: 'downloaded',
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      categoryId: lesson.categoryId,
      categoryName: lesson.categoryName,
      audioUrl: lesson.audioUrl,
    });

    return true;
  };

  const removeFromDownloads = async (lessonId: string) => {
    const updatedDownloads = downloadedLessons.filter(l => l.id !== lessonId);
    setDownloadedLessons(updatedDownloads);
    await storeData(STORAGE_KEYS.DOWNLOADED_LESSONS, updatedDownloads);
    return true;
  };

  const isLessonDownloaded = (lessonId: string): boolean => {
    return downloadedLessons.some(l => l.id === lessonId);
  };

  // Statistics
  const getStatistics = () => {
    const totalCompleted = completedLessons.length;
    const totalFavorites = favoriteLessons.length;
    const totalDownloads = downloadedLessons.length;

    const totalDownloadSize = downloadedLessons.reduce(
      (total, lesson) => total + (lesson.size || 0),
      0
    );

    const recentActivities = userActivities.slice(0, 10);

    return {
      totalCompleted,
      totalFavorites,
      totalDownloads,
      totalDownloadSize,
      recentActivities,
    };
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.COMPLETED_LESSONS),
        AsyncStorage.removeItem(STORAGE_KEYS.FAVORITE_LESSONS),
        AsyncStorage.removeItem(STORAGE_KEYS.DOWNLOADED_LESSONS),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_ACTIVITIES),
      ]);

      setCompletedLessons([]);
      setFavoriteLessons([]);
      setDownloadedLessons([]);
      setUserActivities([]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  };

  return {
    // Data
    completedLessons,
    favoriteLessons,
    downloadedLessons,
    userActivities,
    loading,

    // Completed Lessons
    markLessonCompleted,
    markLessonIncomplete,
    isLessonCompleted,

    // Favorite Lessons
    addToFavorites,
    removeFromFavorites,
    isLessonFavorited,

    // Downloaded Lessons
    addToDownloads,
    removeFromDownloads,
    isLessonDownloaded,

    // Utilities
    getStatistics,
    clearAllData,
    loadAllData,
  };
};

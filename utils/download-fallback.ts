import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert, Platform } from "react-native"
import * as FileSystem from "expo-file-system"

export interface DownloadedFile {
  id: string
  title: string
  url: string
  localPath?: string
  downloadedAt: number
  size?: number
  category: string
  categoryName: string
}

export interface DownloadProgress {
  id: string
  progress: number
  totalSize: number
  downloadedSize: number
}

const STORAGE_KEYS = {
  DOWNLOADED_FILES: "downloadedFiles_v2",
  DOWNLOAD_SETTINGS: "downloadSettings"
}

export class DownloadManager {
  private static instance: DownloadManager
  private downloadListeners: Map<string, (progress: DownloadProgress) => void> =
    new Map()
  private activeDownloads: Map<string, { cancel: () => void }> = new Map()

  private constructor() {}

  public static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager()
    }
    return DownloadManager.instance
  }

  /**
   * Check if FileSystem is available and properly configured
   */
  public async isFileSystemAvailable(): Promise<boolean> {
    try {
      // Skip web platform
      if (Platform.OS === "web") {
        return false
      }

      // Check if FileSystem module exists
      if (!FileSystem) {
        return false
      }

      // Try to access documentDirectory
      const docDir = await this.getDocumentDirectory()
      if (!docDir) {
        return false
      }

      // Test write capability
      const testFile = `${docDir}download_test_${Date.now()}.tmp`
      try {
        await FileSystem.writeAsStringAsync(testFile, "test")
        const fileInfo = await FileSystem.getInfoAsync(testFile)
        const canWrite = fileInfo.exists

        // Clean up test file
        if (canWrite) {
          await FileSystem.deleteAsync(testFile)
        }

        return canWrite
      } catch (writeError) {
        console.log("FileSystem write test failed:", writeError)
        return false
      }
    } catch (error) {
      console.log("FileSystem availability check failed:", error)
      return false
    }
  }

  /**
   * Get document directory with fallback approaches
   */
  private async getDocumentDirectory(): Promise<string | null> {
    try {
      // Primary approach
      let docDir = (FileSystem as any).documentDirectory
      if (docDir && typeof docDir === "string") {
        return docDir
      }

      // Alternative approach
      try {
        docDir = FileSystem["documentDirectory" as keyof typeof FileSystem]
        if (docDir && typeof docDir === "string") {
          return docDir
        }
      } catch (e) {
        // Continue to next approach
      }

      // Check if we can create a custom directory
      try {
        const cacheDir = (FileSystem as any).cacheDirectory
        if (cacheDir && typeof cacheDir === "string") {
          const customDir = `${cacheDir}downloads/`
          const dirInfo = await FileSystem.getInfoAsync(customDir)
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(customDir, {
              intermediates: true
            })
          }
          return customDir
        }
      } catch (e) {
        console.log("Could not create custom directory:", e)
      }

      return null
    } catch (error) {
      console.log("Error getting document directory:", error)
      return null
    }
  }

  /**
   * Download a file with progress tracking
   */
  public async downloadFile(
    url: string,
    metadata: Omit<DownloadedFile, "downloadedAt" | "localPath" | "size">
  ): Promise<{ success: boolean; localPath?: string; error?: string }> {
    const { id } = metadata

    try {
      // Check if already downloading
      if (this.activeDownloads.has(id)) {
        return { success: false, error: "Download already in progress" }
      }

      // Check FileSystem availability
      const fsAvailable = await this.isFileSystemAvailable()
      if (!fsAvailable) {
        // Fallback: Save metadata only (streaming mode)
        await this.saveDownloadMetadata({
          ...metadata,
          downloadedAt: Date.now()
        })
        return { success: true, localPath: undefined }
      }

      const docDir = await this.getDocumentDirectory()
      if (!docDir) {
        throw new Error("Cannot access storage directory")
      }

      const fileName = `audio_${id}_${Date.now()}.mp3`
      const localPath = `${docDir}${fileName}`

      // Create download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        downloadProgress => {
          const progress: DownloadProgress = {
            id,
            progress:
              downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite,
            totalSize: downloadProgress.totalBytesExpectedToWrite,
            downloadedSize: downloadProgress.totalBytesWritten
          }

          // Notify progress listeners
          const listener = this.downloadListeners.get(id)
          if (listener) {
            listener(progress)
          }
        }
      )

      // Track active download
      this.activeDownloads.set(id, {
        cancel: () => {
          downloadResumable.pauseAsync()
          this.activeDownloads.delete(id)
        }
      })

      // Start download
      const downloadResult = await downloadResumable.downloadAsync()

      // Remove from active downloads
      this.activeDownloads.delete(id)

      if (downloadResult && downloadResult.status === 200) {
        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(localPath)
        const fileSize =
          fileInfo.exists && "size" in fileInfo ? (fileInfo as any).size : 0

        // Save metadata
        await this.saveDownloadMetadata({
          ...metadata,
          downloadedAt: Date.now(),
          localPath,
          size: fileSize
        })

        return { success: true, localPath }
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult?.status || "unknown"}`
        )
      }
    } catch (error) {
      // Remove from active downloads
      this.activeDownloads.delete(id)

      console.error("Download error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  /**
   * Cancel an active download
   */
  public async cancelDownload(id: string): Promise<void> {
    const activeDownload = this.activeDownloads.get(id)
    if (activeDownload) {
      activeDownload.cancel()
    }
  }

  /**
   * Add progress listener for a download
   */
  public addProgressListener(
    id: string,
    listener: (progress: DownloadProgress) => void
  ): void {
    this.downloadListeners.set(id, listener)
  }

  /**
   * Remove progress listener
   */
  public removeProgressListener(id: string): void {
    this.downloadListeners.delete(id)
  }

  /**
   * Save download metadata to AsyncStorage
   */
  private async saveDownloadMetadata(file: DownloadedFile): Promise<void> {
    try {
      const existing = await this.getDownloadedFiles()
      const updated = existing.filter(f => f.id !== file.id)
      updated.push(file)

      await AsyncStorage.setItem(
        STORAGE_KEYS.DOWNLOADED_FILES,
        JSON.stringify(updated)
      )
    } catch (error) {
      console.error("Error saving download metadata:", error)
      throw error
    }
  }

  /**
   * Get all downloaded files metadata
   */
  public async getDownloadedFiles(): Promise<DownloadedFile[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOADED_FILES)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error getting downloaded files:", error)
      return []
    }
  }

  /**
   * Check if a file is downloaded
   */
  public async isFileDownloaded(id: string): Promise<boolean> {
    const files = await this.getDownloadedFiles()
    return files.some(f => f.id === id)
  }

  /**
   * Get download info for a specific file
   */
  public async getDownloadInfo(id: string): Promise<DownloadedFile | null> {
    const files = await this.getDownloadedFiles()
    return files.find(f => f.id === id) || null
  }

  /**
   * Delete a downloaded file
   */
  public async deleteDownload(id: string): Promise<void> {
    try {
      const files = await this.getDownloadedFiles()
      const file = files.find(f => f.id === id)

      if (file) {
        // Delete physical file if it exists
        if (file.localPath) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(file.localPath)
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(file.localPath)
            }
          } catch (deleteError) {
            console.log("Error deleting physical file:", deleteError)
          }
        }

        // Remove from metadata
        const updated = files.filter(f => f.id !== id)
        await AsyncStorage.setItem(
          STORAGE_KEYS.DOWNLOADED_FILES,
          JSON.stringify(updated)
        )
      }
    } catch (error) {
      console.error("Error deleting download:", error)
      throw error
    }
  }

  /**
   * Clear all downloads
   */
  public async clearAllDownloads(): Promise<void> {
    try {
      const files = await this.getDownloadedFiles()

      // Delete all physical files
      for (const file of files) {
        if (file.localPath) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(file.localPath)
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(file.localPath)
            }
          } catch (deleteError) {
            console.log(`Error deleting file ${file.localPath}:`, deleteError)
          }
        }
      }

      // Clear metadata
      await AsyncStorage.removeItem(STORAGE_KEYS.DOWNLOADED_FILES)
    } catch (error) {
      console.error("Error clearing all downloads:", error)
      throw error
    }
  }

  /**
   * Get total download statistics
   */
  public async getDownloadStats(): Promise<{
    totalFiles: number
    totalSize: number
    availableOffline: number
    streamingOnly: number
  }> {
    const files = await this.getDownloadedFiles()

    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0),
      availableOffline: files.filter(f => f.localPath).length,
      streamingOnly: files.filter(f => !f.localPath).length
    }
  }

  /**
   * Get local file path for playback
   */
  public async getPlaybackPath(id: string): Promise<string | null> {
    const file = await this.getDownloadInfo(id)

    if (!file) {
      return null
    }

    // If file has local path, verify it exists
    if (file.localPath) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(file.localPath)
        if (fileInfo.exists) {
          return file.localPath
        } else {
          // File was deleted, fall back to streaming
          return file.url
        }
      } catch (error) {
        console.log("Error checking local file:", error)
        return file.url
      }
    }

    // Fall back to original URL for streaming
    return file.url
  }

  /**
   * Migrate old downloads to new format
   */
  public async migrateOldDownloads(): Promise<void> {
    try {
      // Check for old format downloads
      const oldData = await AsyncStorage.getItem("downloadedLessons")
      if (oldData) {
        const oldDownloads = JSON.parse(oldData)
        const newDownloads: DownloadedFile[] = oldDownloads.map((old: any) => ({
          id: old.id,
          title: old.title,
          url: old.audioUrl || "",
          downloadedAt: old.downloadedAt,
          size: old.size,
          category: old.categoryId || "unknown",
          categoryName: old.categoryName || "نامشخص",
          localPath: undefined // Will need to be re-downloaded
        }))

        await AsyncStorage.setItem(
          STORAGE_KEYS.DOWNLOADED_FILES,
          JSON.stringify(newDownloads)
        )
        await AsyncStorage.removeItem("downloadedLessons")
      }
    } catch (error) {
      console.error("Error migrating old downloads:", error)
    }
  }

  /**
   * Verify and clean up orphaned files
   */
  public async cleanupOrphanedFiles(): Promise<void> {
    try {
      const fsAvailable = await this.isFileSystemAvailable()
      if (!fsAvailable) return

      const docDir = await this.getDocumentDirectory()
      if (!docDir) return

      const files = await this.getDownloadedFiles()
      const validPaths = new Set(files.map(f => f.localPath).filter(Boolean))

      // Get all audio files in download directory
      try {
        const dirInfo = await FileSystem.getInfoAsync(docDir)
        if (dirInfo.exists && dirInfo.isDirectory) {
          const dirContents = await FileSystem.readDirectoryAsync(docDir)

          for (const fileName of dirContents) {
            if (fileName.startsWith("audio_") && fileName.endsWith(".mp3")) {
              const fullPath = `${docDir}${fileName}`
              if (!validPaths.has(fullPath)) {
                // Orphaned file, delete it
                await FileSystem.deleteAsync(fullPath)
              }
            }
          }
        }
      } catch (error) {
        console.log("Error during cleanup:", error)
      }
    } catch (error) {
      console.error("Error cleaning up orphaned files:", error)
    }
  }

  /**
   * Show user-friendly error message
   */
  public static showDownloadError(error: string): void {
    let title = "خطا در دانلود"
    let message = "مشکلی در دانلود فایل پیش آمد."

    if (error.includes("Network")) {
      title = "خطا در اتصال"
      message = "لطفاً اتصال اینترنت خود را بررسی کنید."
    } else if (error.includes("space") || error.includes("storage")) {
      title = "کمبود فضا"
      message = "فضای کافی برای دانلود فایل وجود ندارد."
    } else if (error.includes("permission")) {
      title = "خطا در مجوزها"
      message = "اپلیکیشن مجوز دسترسی به فایل‌ها را ندارد."
    } else if (error.includes("Document directory")) {
      title = "خطا در سیستم فایل"
      message =
        "دسترسی به سیستم فایل امکان‌پذیر نیست. فایل به صورت آنلاین پخش خواهد شد."
    }

    Alert.alert(title, message, [{ text: "متوجه شدم", style: "default" }])
  }
}

// Singleton instance export
export const downloadManager = DownloadManager.getInstance()

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 بایت"
  const k = 1024
  const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

export const formatDownloadDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return "همین الان"
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} ساعت پیش`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)} روز پیش`
  } else {
    return date.toLocaleDateString("fa-IR")
  }
}

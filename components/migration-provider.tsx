import React, { useEffect, useState } from "react"
import { View, Text } from "react-native"
import LoadingSpinner from "@/components/loading-spinner"
import { migrateFromAsyncStorage } from "@/utils/storage"

interface MigrationProviderProps {
  children: React.ReactNode
}

export const MigrationProvider: React.FC<MigrationProviderProps> = ({
  children
}) => {
  const [isMigrating, setIsMigrating] = useState(true)
  const [migrationError, setMigrationError] = useState<string | null>(null)

  useEffect(() => {
    const performMigration = async () => {
      try {
        await migrateFromAsyncStorage()
        setIsMigrating(false)
      } catch (error) {
        console.error("Migration failed:", error)
        setMigrationError("Migration failed, but app will continue")
        setIsMigrating(false)
      }
    }

    performMigration()
  }, [])

  if (isMigrating) {
    return (
      <View className="flex-1 bg-stone-50 dark:bg-stone-950 items-center justify-center">
        <LoadingSpinner />
        <Text className="text-stone-600 dark:text-stone-400 mt-4 text-center">
          در حال بهینه‌سازی اپلیکیشن...
        </Text>
        <Text className="text-stone-500 dark:text-stone-500 mt-2 text-sm text-center">
          لطفا کمی صبر کنید
        </Text>
      </View>
    )
  }

  if (migrationError) {
    console.warn("Migration completed with warnings:", migrationError)
  }

  return <>{children}</>
}

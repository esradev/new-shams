import React, { useState } from 'react'
import { View, Text, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

export default function Settings() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex flex-1'>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className='p-6'>
            <Text className='flex items-center align-middle text-black'>
              تنظیمات
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

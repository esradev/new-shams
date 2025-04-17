import React, { useState } from 'react'
import { View, Text, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

import Header from '@/components/header'

export default function Alerts() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex flex-1'>
        <Header />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className='p-6'>
            <Text className='flex items-center align-middle text-black'>
              alerts
            </Text>
          </View>
        </ScrollView>
        <StatusBar barStyle='dark-content' backgroundColor='#059669' />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

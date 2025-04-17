import React from 'react'
import { View, ActivityIndicator } from 'react-native'

const LoadingSpinner = () => {
  return (
    <View className='flex items-center justify-center'>
      <ActivityIndicator size={60} color='#16a34a' />
    </View>
  )
}

export default LoadingSpinner
